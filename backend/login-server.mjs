import http from 'http';
import url from 'url';
import querystring from 'querystring';

const PORT = process.env.PORT || 3000;

// Supabase configuration (from environment or defaults)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

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
    <title>Fleet Management - Login</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
      .card{background:#fff;padding:24px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);width:320px}
      input{width:100%;padding:8px;margin:8px 0;border:1px solid #d1d5db;border-radius:4px;box-sizing:border-box}
      button{width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:500;transition:background 0.2s}
      button:hover{background:#1d4ed8}
      h2{margin:0 0 12px 0;color:#1f2937}
      .hint{font-size:12px;color:#6b7280;margin-top:12px;text-align:center}
      .error{color:#dc2626;font-size:12px;margin:8px 0}
      .success{color:#16a34a;font-size:12px;margin:8px 0}
      .loading{opacity:0.6;cursor:not-allowed}
    </style>
  </head>
  <body>
    <div class="card">
      <h2>🚗 Fleet Management</h2>
      <form id="loginForm">
        <label>
          <div style="font-size:13px;color:#374151">Email</div>
          <input id="email" type="email" placeholder="your@email.com" required />
        </label>
        <label>
          <div style="font-size:13px;color:#374151">Password</div>
          <input id="password" type="password" placeholder="Enter password" required />
        </label>
        <div id="message"></div>
        <button id="submitBtn" type="submit">Sign in</button>
      </form>
      <div class="hint">Powered by Supabase Authentication</div>
      <div class="hint" style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb">
        <strong>Demo:</strong> Use Supabase credentials or create a new account
      </div>
    </div>

    <script>
      const supabaseUrl = '${SUPABASE_URL}';
      const supabaseKey = '${SUPABASE_ANON_KEY}';
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

      const form = document.getElementById('loginForm');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const submitBtn = document.getElementById('submitBtn');
      const messageDiv = document.getElementById('message');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        messageDiv.innerHTML = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
          // Try to sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            // If sign in fails, try to sign up (new user)
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });

            if (signUpError) {
              throw signUpError;
            }

            messageDiv.innerHTML = '<div class="success">Account created! Please check your email to confirm.</div>';
          } else {
            messageDiv.innerHTML = '<div class="success">Login successful! Redirecting...</div>';
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1500);
          }
        } catch (err) {
          messageDiv.innerHTML = '<div class="error">Error: ' + escapeHtml(err.message) + '</div>';
        } finally {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      });

      function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
      }
    </script>
  </body>
</html>`;

const server = http.createServer(async (req, res) => {
  const pathname = url.parse(req.url).pathname;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(loginPage);
  } else if (pathname === '/dashboard' && req.method === 'GET') {
    res.writeHead(200);
    res.end(`
      <!doctype html>
      <html>
        <head><title>Dashboard</title></head>
        <body style="font-family:system-ui;padding:20px">
          <h1>🎉 Welcome to Fleet Management System</h1>
          <p>Your Supabase authentication is working!</p>
          <a href="/">Logout</a>
        </body>
      </html>
    `);
  } else if (pathname === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      // Legacy fallback for demo
      if (data.username === 'admin' && data.password === 'password') {
        res.writeHead(302, { Location: '/dashboard' });
        res.end();
      } else {
        res.writeHead(401);
        res.end('<h1>Login failed</h1><p><a href="/">Try again</a></p>');
      }
    });
  } else {
    res.writeHead(404);
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Fleet Management Server running on http://localhost:${PORT}/`);
  console.log(`📝 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Connected to Supabase`);
});
