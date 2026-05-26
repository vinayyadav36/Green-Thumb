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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/boxes
app.get('/api/boxes', (req, res) => {
  const boxes = readData('boxes.json');
  res.json(boxes);
});

// GET /api/guides
app.get('/api/guides', (req, res) => {
  const guides = readData('guides.json');
  res.json(guides);
});

// POST /api/subscribe
app.post('/api/subscribe', (req, res) => {
  const { userId, boxId, name, email } = req.body;
  if (!userId || !boxId) {
    return res.status(400).json({ error: 'userId and boxId are required' });
  }

  const users = readData('users.json');
  let user = users.find(u => u.id === userId);

  if (!user) {
    user = { id: userId, name, email, subscriptions: [] };
    users.push(user);
  }

  if (!user.subscriptions.includes(boxId)) {
    user.subscriptions.push(boxId);
  }

  writeData('users.json', users);

  const auditLogs = readData('audit.json');
  auditLogs.push({ action: 'subscribe', userId, boxId, timestamp: new Date().toISOString() });
  writeData('audit.json', auditLogs);

  res.json({ message: 'Subscribed successfully', user });
});

// GET /api/users/:userId/subscriptions
app.get('/api/users/:userId/subscriptions', (req, res) => {
  const { userId } = req.params;
  const users = readData('users.json');
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.json({ subscriptions: [] });
  }

  const boxes = readData('boxes.json');
  const userBoxes = boxes.filter(box => user.subscriptions.includes(box.id));

  res.json({ subscriptions: userBoxes });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
