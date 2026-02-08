/**
 * GET /api/extension/install
 *
 * Serves a self-contained install guide page with:
 * - Browser detection (Chrome/Firefox/Edge)
 * - Step-by-step visual instructions
 * - One-click download button
 * - Auto-configured proxy URL
 */
export default defineEventHandler((event) => {
  const reqUrl = getRequestURL(event);
  const proxyOrigin = `${reqUrl.protocol}//${reqUrl.host}`;

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Install SuiteProxy Bridge</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #0a0e1a;
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 20px;
  }
  .container { max-width: 600px; width: 100%; }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }
  .logo {
    font-size: 32px;
    font-weight: 900;
    font-style: italic;
    letter-spacing: -1px;
  }
  .logo span { color: #3b82f6; }
  .subtitle {
    color: #64748b;
    font-size: 12px;
    font-family: monospace;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 4px;
  }

  .browser-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 16px;
  }
  .browser-badge .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }

  .download-section {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .download-section::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.15s;
    text-decoration: none;
    position: relative;
    z-index: 1;
  }
  .download-btn:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
  .download-btn:active { transform: scale(0.98); }
  .download-btn .icon { font-size: 20px; }

  .proxy-info {
    margin-top: 16px;
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
    position: relative;
    z-index: 1;
  }
  .proxy-info code {
    color: #94a3b8;
    background: #0f172a;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #1e293b;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }
  .step {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    transition: border-color 0.2s;
  }
  .step:hover { border-color: #475569; }
  .step-num {
    background: #3b82f6;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }
  .step-content h3 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .step-content p {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
  }
  .step-content code {
    background: #0f172a;
    color: #60a5fa;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid #1e293b;
  }
  .step-content kbd {
    background: #374151;
    color: #d1d5db;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    border: 1px solid #4b5563;
    box-shadow: 0 1px 0 #4b5563;
  }

  /* Browser-specific step variants */
  .step-chrome, .step-firefox, .step-edge, .step-chromium { display: none; }
  body.is-chrome .step-chrome { display: flex; }
  body.is-firefox .step-firefox { display: flex; }
  body.is-edge .step-edge { display: flex; }
  body.is-chrome .step-chromium { display: flex; }
  body.is-edge .step-chromium { display: flex; }
  body.is-unknown .step-chrome, body.is-unknown .step-chromium { display: flex; }
  .step-all { display: flex; }

  .alt-section {
    border-top: 1px solid #1e293b;
    padding-top: 24px;
    margin-top: 8px;
  }
  .alt-title {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
    text-align: center;
  }
  .alt-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .alt-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #1e293b;
    color: #94a3b8;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
  }
  .alt-btn:hover { background: #334155; color: #e2e8f0; }

  .done-note {
    text-align: center;
    margin-top: 32px;
    padding: 16px;
    background: #10b98115;
    border: 1px solid #10b98130;
    border-radius: 12px;
    font-size: 13px;
    color: #10b981;
  }

  .footer {
    text-align: center;
    margin-top: 32px;
    font-size: 11px;
    color: #334155;
    font-family: monospace;
  }
  .footer a { color: #475569; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">SUITE<span>PROXY</span></div>
    <div class="subtitle">Browser Extension Setup</div>
    <div class="browser-badge">
      <div class="dot"></div>
      <span id="browserName">Detecting browser...</span>
    </div>
  </div>

  <!-- Download -->
  <div class="download-section">
    <a href="/api/extension/download" class="download-btn" id="downloadBtn">
      <span class="icon">&#128230;</span>
      Download Extension
    </a>
    <div class="proxy-info">
      Pre-configured for <code>${proxyOrigin}</code>
    </div>
  </div>

  <!-- Steps -->
  <div class="steps">
    <!-- Step 1: Download (all browsers) -->
    <div class="step step-all">
      <div class="step-num">1</div>
      <div class="step-content">
        <h3>Download &amp; Extract</h3>
        <p>Click the button above to download <code>suiteproxy-bridge-extension.zip</code>. Extract it to a folder you won't delete.</p>
      </div>
    </div>

    <!-- Step 2: Chrome/Edge -->
    <div class="step step-chromium">
      <div class="step-num">2</div>
      <div class="step-content">
        <h3>Load the Extension</h3>
        <p>
          Open <code id="extUrl">chrome://extensions</code> &mdash;
          enable <strong>Developer mode</strong> (top-right toggle) &mdash;
          click <strong>Load unpacked</strong> &mdash;
          select the extracted folder.
        </p>
      </div>
    </div>

    <!-- Step 2: Firefox -->
    <div class="step step-firefox">
      <div class="step-num">2</div>
      <div class="step-content">
        <h3>Load the Extension</h3>
        <p>
          Open <code>about:debugging#/runtime/this-firefox</code> &mdash;
          click <strong>Load Temporary Add-on</strong> &mdash;
          select <code>manifest.json</code> inside the extracted folder.
        </p>
        <p style="margin-top: 6px; font-size: 11px; color: #64748b;">
          Note: Temporary add-ons persist until Firefox restarts. For permanent install, 
          the extension needs to be signed via AMO.
        </p>
      </div>
    </div>

    <!-- Step 3: all browsers -->
    <div class="step step-all">
      <div class="step-num">3</div>
      <div class="step-content">
        <h3>Sync Your Account</h3>
        <p>
          Open <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" style="color: #60a5fa;">AI Studio</a>.
          You'll see a blue <strong>&#9889; SYNC TO PROXY</strong> button in the bottom-right corner.
          Click it &mdash; done!
        </p>
      </div>
    </div>
  </div>

  <div class="done-note">
    &#10003; HttpOnly cookies are captured automatically &mdash; no extra configuration needed
  </div>

  <!-- Alternatives -->
  <div class="alt-section">
    <div class="alt-title">Alternatives</div>
    <div class="alt-buttons">
      <a href="/api/script/install.user.js" class="alt-btn" target="_blank">
        &#128018; Tampermonkey Script
      </a>
      <a href="/" class="alt-btn">
        &#8592; Back to Dashboard
      </a>
    </div>
  </div>

  <div class="footer">
    <a href="/">${proxyOrigin}</a>
  </div>
</div>

<script>
(function() {
  var ua = navigator.userAgent;
  var body = document.body;
  var name = document.getElementById('browserName');
  var extUrlEl = document.getElementById('extUrl');

  if (ua.indexOf('Firefox') !== -1) {
    body.className = 'is-firefox';
    name.textContent = 'Firefox detected';
  } else if (ua.indexOf('Edg/') !== -1) {
    body.className = 'is-edge';
    name.textContent = 'Edge detected';
    if (extUrlEl) extUrlEl.textContent = 'edge://extensions';
  } else if (ua.indexOf('Chrome') !== -1) {
    body.className = 'is-chrome';
    name.textContent = 'Chrome detected';
  } else {
    body.className = 'is-unknown';
    name.textContent = 'Browser detected';
  }
})();
</script>
</body>
</html>`;
});
