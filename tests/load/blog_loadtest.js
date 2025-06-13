import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = 'http://localhost:8080';
const USER = { username: 'Test12345', password: 'Test!12345' };

export default function () {
  // Логін
  let loginRes = http.post(`${BASE_URL}/login`, USER);
  check(loginRes, { 'Logged in': (r) => r.status === 200 });

  // Отримання поста
  let postRes = http.get(`${BASE_URL}/post/683f409f3d10dd39a48b108f`);
  check(postRes, { 'Post loaded': (r) => r.status === 200 });

  // Вихід
  let logoutRes = http.get(`${BASE_URL}/logout`);
  check(logoutRes, { 'Logged out': (r) => r.status === 200 });

  sleep(1);
}