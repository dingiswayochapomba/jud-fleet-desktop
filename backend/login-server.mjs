import http from 'http';
import url from 'url';
import querystring from 'querystring';

const PORT = process.env.PORT || 3000;

function escapeHtml(input) {
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
      button{width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:500}
      button:hover{background:#1d4ed8}
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

const server = http.createServer(async (req, res) => {
  const pathname = url.parse(req.url).pathname;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(loginPage);
  } else if (pathname === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      if (data.username === 'admin' && data.password === 'password') {
        const safeUser = escapeHtml(data.username);
        res.writeHead(200);
        res.end(`<h1>Welcome, ${safeUser}!</h1><p><a href="/">Back to login</a></p>`);
      } else {
        res.writeHead(401);
        res.end(`<h1>Login failed</h1><p>Invalid credentials. <a href="/">Try again</a></p>`);
      }
    });
  } else {
    res.writeHead(404);
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`Login server listening on http://localhost:${PORT}/`);
});
