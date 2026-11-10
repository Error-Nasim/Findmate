// tests/performance/k6_load_test.js
// Performance load test script for FindMate REST API (Tailored from NFR-01 & ISO 25010)
// To run full benchmark: k6 run tests/performance/k6_load_test.js
// To run quick live demo (10s): k6 run --duration 10s --vus 10 tests/performance/k6_load_test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp up to 10 virtual users
    { duration: '20s', target: 20 }, // Sustained load of 20 virtual users
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms (NFR-01)
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://findmate-dctf.onrender.com';

export default function () {
  const res = http.get(`${BASE_URL}/api/lobbies`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(0.3);
}
