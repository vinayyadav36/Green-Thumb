const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

const readData = (filename) => {
  try {
    const data = fs.readFileSync(path.join(dataDir, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
};

const writeData = (filename, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
};

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin role required.' });
  }
  next();
};

// Helper to generate a dummy JWT token
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64');
};

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readData('users.json');
  const user = users.find(u => u.email === email && u.password === password); // simple match

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const users = readData('users.json');
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // Storing in plain text for demo/simulated DB
    role: 'user',
    subscriptions: []
  };

  users.push(newUser);
  writeData('users.json', users);

  const token = generateToken(newUser);
  res.status(201).json({ message: 'Registration successful', token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/boxes
app.get('/api/boxes', (req, res) => {
  const boxes = readData('boxes.json');
  res.json(boxes);
});

// GET /api/boxes/:id
app.get('/api/boxes/:id', (req, res) => {
  const boxes = readData('boxes.json');
  const box = boxes.find(b => b.id === req.params.id);
  if (!box) return res.status(404).json({ error: 'Box not found' });
  res.json(box);
});

// GET /api/guides
app.get('/api/guides', (req, res) => {
  const { plantName } = req.query;
  const guides = readData('guides.json');
  if (plantName) {
    const filtered = guides.filter(g => g.plantName && g.plantName.toLowerCase().includes(plantName.toLowerCase()));
    return res.json(filtered);
  }
  res.json(guides);
});

// GET /api/guides/:id
app.get('/api/guides/:id', (req, res) => {
  const guides = readData('guides.json');
  const guide = guides.find(g => g.id === req.params.id);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  res.json(guide);
});

// POST /api/subscriptions
app.post('/api/subscriptions', (req, res) => {
  const { name, email, phone, boxId, address, message } = req.body;
  if (!name || !email || !boxId) {
    return res.status(400).json({ error: 'Name, email, and boxId are required' });
  }

  const subs = readData('subscriptions.json');
  const newSub = {
    id: `sub-${Date.now()}`,
    name,
    email,
    phone,
    boxId,
    address,
    message,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  subs.push(newSub);
  writeData('subscriptions.json', subs);

  const auditLogs = readData('audit.json');
  auditLogs.push({ action: 'new_subscription', subId: newSub.id, email, timestamp: new Date().toISOString() });
  writeData('audit.json', auditLogs);

  res.status(201).json({ message: 'Subscribed successfully', subscription: newSub });
});

// GET /api/subscriptions (Admin only)
app.get('/api/subscriptions', adminMiddleware, (req, res) => {
  const subs = readData('subscriptions.json');
  res.json(subs);
});

// PATCH /api/subscriptions/:id/status (Admin only)
app.patch('/api/subscriptions/:id/status', adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const subs = readData('subscriptions.json');
  const subIndex = subs.findIndex(s => s.id === id);

  if (subIndex === -1) return res.status(404).json({ error: 'Subscription not found' });

  subs[subIndex].status = status;
  writeData('subscriptions.json', subs);

  const auditLogs = readData('audit.json');
  auditLogs.push({ action: 'update_subscription_status', subId: id, status, timestamp: new Date().toISOString(), user: 'admin' });
  writeData('audit.json', auditLogs);

  res.json({ message: 'Status updated successfully', subscription: subs[subIndex] });
});

// GET /api/users/:userId/subscriptions
app.get('/api/users/:userId/subscriptions', (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const users = readData('users.json');
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.json({ subscriptions: [] });
  }

  // Also pull detailed subscription info from subscriptions.json
  const allSubs = readData('subscriptions.json');
  const detailedSubs = allSubs.filter(sub => sub.userId === userId || sub.email === user.email);

  res.json({ subscriptions: detailedSubs });
});

// POST /api/admin/seed
app.post('/api/admin/seed', adminMiddleware, (req, res) => {
  const sampleBoxes = [
    { id: 'spring-box-1', name: 'Spring Awakening', season: 'Spring', contents: ['Tulip Bulbs', 'Seed Starter Kit', 'Gardening Gloves'], description: 'A perfect box to start your spring garden.' },
    { id: 'summer-box-1', name: 'Summer Sunshine', season: 'Summer', contents: ['Sunflower Seeds', 'Watering Can', 'Sun Hat'], description: 'Keep your garden bright during the hot months.' }
  ];

  const sampleGuides = [
    { id: 'guide-1', boxId: 'spring-box-1', title: 'Tulip Care Guide', content: 'Plant bulbs in the fall for spring blooms. Water regularly.' },
    { id: 'guide-2', boxId: 'summer-box-1', title: 'Sunflower Care Guide', content: 'Plant in full sun. Water deeply but infrequently.' }
  ];

  writeData('boxes.json', sampleBoxes);
  writeData('guides.json', sampleGuides);

  const auditLogs = readData('audit.json');
  auditLogs.push({ action: 'seed', timestamp: new Date().toISOString(), user: 'admin' });
  writeData('audit.json', auditLogs);

  res.json({ message: 'Database seeded successfully' });
});

// GET /api/admin/audit
app.get('/api/admin/audit', adminMiddleware, (req, res) => {
  const logs = readData('audit.json');
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
