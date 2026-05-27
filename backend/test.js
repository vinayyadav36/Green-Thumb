const http = require('http');

http.get('http://localhost:3000/api/boxes', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Test passed: GET /api/boxes returned 200');
      process.exit(0);
    } else {
      console.error('Test failed: GET /api/boxes returned', res.statusCode);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Test failed: Error connecting to API', err);
  process.exit(1);
});
