import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function escapeHtml(input?: string) {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const loginPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Login</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
      .card{background:#fff;padding:24px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);width:320px}
      input{width:100%;padding:8px;margin:8px 0;border:1px solid #d1d5db;border-radius:4px}
      button{width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer}
      .hint{font-size:12px;color:#6b7280;margin-top:12px}
    </style>
  </head>
  <body>
    <div class="card">
      <h2 style="margin:0 0 12px 0">Sign in</h2>
      <form method="post" action="/login">
        <label>
          <div style="font-size:13px;color:#374151">Username</div>
          <input name="username" type="text" required />
        </label>
        <label>
          <div style="font-size:13px;color:#374151">Password</div>
          <input name="password" type="password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>
      <div class="hint">Use <strong>admin</strong>/<strong>password</strong> for demo.</div>
    </div>
  </body>
</html>`;

app.get('/', (_req, res) => {
  res.type('html').send(loginPage);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  // Simple demo authentication. Replace with real auth in production.
  if (username === 'admin' && password === 'password') {
    const safeUser = escapeHtml(username);
    return res.type('html').send(`<h1>Welcome, ${safeUser}</h1><p><a href="/">Back to login</a></p>`);
  }

  res.status(401).type('html').send(`<h1>Login failed</h1><p><a href="/">Try again</a></p>`);
});

app.listen(PORT, () => {
  console.log(`Login server listening on http://localhost:${PORT}/`);
});
export default app;
