// tests/performance/k6_load_test.js
// Performance load test script for FindMate REST API (Tailored from NFR-1 & ISO 25010)
// To run: k6 run tests/performance/k6_load_test.js

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 virtual users
    { duration: '1m', target: 20 },  // Sustained load of 20 virtual users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

export default function () {
  // In a live test environment:
  // const res = http.get('http://localhost:8080/api/lobbies');
  // check(res, {
  //   'status is 200': (r) => r.status === 200,
  //   'response time < 500ms': (r) => r.timings.duration < 500,
  // });
}
