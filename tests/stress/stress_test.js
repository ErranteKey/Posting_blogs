import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // (50 користувачів)
    { duration: '3m', target: 500 },  // Пікове навантаження (500 користувачів)
    { duration: '1m', target: 0 },    // Відновлення
  ],
  thresholds: {
    http_req_duration: ['p(95) < 1000'], // 95% запитів мають виконуватися швидше 1 секунди
    http_req_failed: ['rate < 0.01'],    // Менше 1% помилок
  },
};

const BASE_URL = 'http://localhost:8080';
const USER = { username: `Testuser_${__VU}`, password: 'Test!12345' };

export default function () {
  // 1. Авторизація
  let loginRes = http.post(`${BASE_URL}/login`, USER);
  check(loginRes, { 'Logged in': (r) => r.status === 200 });

  // 2. Перегляд випадкового поста
  let postRes = http.get(`${BASE_URL}/post/65d4f1e8a2b8c4a9e7f3d10a`);
  check(postRes, { 'Post loaded': (r) => r.status === 200 });

  // 3. Вихід (необов’язково)
  let logoutRes = http.get(`${BASE_URL}/logout`);
  check(logoutRes, { 'Logged out': (r) => r.status === 200 });

  sleep(1); // Імітація затримки користувача
}