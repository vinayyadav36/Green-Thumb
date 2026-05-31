const http = require('http');

let testsPassed = 0;
let testsFailed = 0;
let totalTests = 5;

const checkExit = () => {
  if (testsPassed + testsFailed === totalTests) {
    if (testsFailed > 0) {
      console.error(`\nTests finished: ${testsPassed} passed, ${testsFailed} failed.`);
      process.exit(1);
    } else {
      console.log(`\nTests finished: All ${testsPassed} tests passed.`);
      process.exit(0);
    }
  }
};

const makeRequest = (options, postData, callback) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => callback(res, data));
  });
  req.on('error', (err) => {
    console.error(`Test error connecting to API: ${options.path}`, err);
    testsFailed++;
    checkExit();
  });
  if (postData) {
    req.write(postData);
  }
  req.end();
};

// 1. GET /api/boxes
makeRequest({ hostname: 'localhost', port: 3000, path: '/api/boxes', method: 'GET' }, null, (res, data) => {
  const parsed = JSON.parse(data);
  if (res.statusCode === 200 && Array.isArray(parsed) && parsed.length >= 4) {
    console.log('✅ Test passed: GET /api/boxes returned 200 and array of length >= 4');
    testsPassed++;
  } else {
    console.error('❌ Test failed: GET /api/boxes', res.statusCode, parsed.length);
    testsFailed++;
  }
  checkExit();
});

// 2. GET /api/guides
makeRequest({ hostname: 'localhost', port: 3000, path: '/api/guides', method: 'GET' }, null, (res, data) => {
  const parsed = JSON.parse(data);
  if (res.statusCode === 200 && Array.isArray(parsed) && parsed.length >= 6) {
    console.log('✅ Test passed: GET /api/guides returned 200 and array of length >= 6');
    testsPassed++;
  } else {
    console.error('❌ Test failed: GET /api/guides', res.statusCode, parsed.length);
    testsFailed++;
  }
  checkExit();
});

// 3. POST /api/auth/login (Correct)
const loginDataSuccess = JSON.stringify({ email: 'admin@saltedhash.com', password: 'Admin@1234' });
makeRequest({
  hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginDataSuccess.length }
}, loginDataSuccess, (res, data) => {
  const parsed = JSON.parse(data);
  if (res.statusCode === 200 && parsed.token) {
    console.log('✅ Test passed: POST /api/auth/login success returns 200 and token');
    testsPassed++;

    // Use token for Audit test
    // 5. GET /api/admin/audit (Success)
    totalTests++; // Add one more test dynamically since we need the token
    makeRequest({
      hostname: 'localhost', port: 3000, path: '/api/admin/audit', method: 'GET',
      headers: { 'x-user-role': 'admin' } // The backend middleware checks this header instead of bearer
    }, null, (auditRes, auditData) => {
      if (auditRes.statusCode === 200 && Array.isArray(JSON.parse(auditData))) {
        console.log('✅ Test passed: GET /api/admin/audit with admin role returns 200 and array');
        testsPassed++;
      } else {
        console.error('❌ Test failed: GET /api/admin/audit', auditRes.statusCode);
        testsFailed++;
      }
      checkExit();
    });

  } else {
    console.error('❌ Test failed: POST /api/auth/login (success)', res.statusCode);
    testsFailed++;
  }
  checkExit();
});

// 4. POST /api/auth/login (Wrong)
const loginDataFail = JSON.stringify({ email: 'admin@saltedhash.com', password: 'wrong' });
makeRequest({
  hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginDataFail.length }
}, loginDataFail, (res, data) => {
  if (res.statusCode === 401) {
    console.log('✅ Test passed: POST /api/auth/login fail returns 401');
    testsPassed++;
  } else {
    console.error('❌ Test failed: POST /api/auth/login (fail)', res.statusCode);
    testsFailed++;
  }
  checkExit();
});

// 6. GET /api/admin/audit (Forbidden)
makeRequest({ hostname: 'localhost', port: 3000, path: '/api/admin/audit', method: 'GET' }, null, (res, data) => {
  if (res.statusCode === 403) {
    console.log('✅ Test passed: GET /api/admin/audit without admin role returns 403');
    testsPassed++;
  } else {
    console.error('❌ Test failed: GET /api/admin/audit (forbidden)', res.statusCode);
    testsFailed++;
  }
  checkExit();
});
