// server/plugins/heartbeat.ts
import puppeteer, { type Browser, type Page } from "puppeteer";
import { useDb } from "~~/server/utils/suite";
import type { SuitemakerCreds, AccountRecord, GoogleCookie, WizData } from "~~/shared/types";

const FIREFOX_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";

export default defineNitroPlugin(() => {
  const db = useDb();

  async function performStealthRefresh(acc: AccountRecord) {
    const creds: SuitemakerCreds = JSON.parse(acc.creds);
    console.log(`[Heartbeat] Refreshing ${acc.id}...`);

    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1920,1080']
    });

    try {
      const page: Page = await browser.newPage();
      await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

      // ... (Cookie setting code remains same as previous step) ...
      const cookieArray: GoogleCookie[] = creds.cookie.split(';')
        .map((pair: string): GoogleCookie | null => {
          const splitPoint = pair.indexOf('=');
          if (splitPoint === -1) return null;
          return {
            name: pair.slice(0, splitPoint).trim(),
            value: pair.slice(splitPoint + 1).trim(),
            domain: '.google.com',
            path: '/',
            secure: true,
            httpOnly: false
          };
        })
        .filter((c: GoogleCookie | null): c is GoogleCookie => c !== null && c.name !== "" && c.value !== "");

      await page.setCookie(...cookieArray);
      await page.setUserAgent(FIREFOX_UA);
      await page.goto("https://aistudio.google.com/prompts/new_chat", { waitUntil: 'networkidle2' });

      const extraction = await page.evaluate((): { data: any | null, toggles: string[], authUser: string } => {
        let wiz = null;
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const s of scripts) {
          const text = s.textContent || "";
          if (text.includes('"SNlM0e"')) {
            try { wiz = JSON.parse(text); } catch(e) {}
            break;
          }
        }
        
        // FIX: Prioritize QrtxK
        let authUser = "0";
        if (wiz) {
            if (wiz.QrtxK !== undefined && wiz.QrtxK !== null) authUser = String(wiz.QrtxK);
            else if (wiz.HiPsbb !== undefined && wiz.HiPsbb !== null) authUser = String(wiz.HiPsbb);
        }

        return {
          data: wiz,
          toggles: (window as any)._F_toggles || [],
          authUser: authUser
        };
      });

      if (extraction && extraction.data) {
        const pCookies = await page.cookies();
        const cookieStr = pCookies.map(c => `${c.name}=${c.value}`).join("; ");
        const apiKey = extraction.data.WIu0Nc || extraction.data.PeqOqb;

        const fresh: SuitemakerCreds = {
          cookie: cookieStr,
          at: extraction.data.SNlM0e,
          api_key: apiKey,
          build: extraction.data.cfb2h,
          flow_id: extraction.data.FdrFJe,
          nonce: extraction.data.WZsZ1e,
          toggles: extraction.toggles,
          authUser: extraction.authUser, // Should now be "0" based on your logs
          userAgent: FIREFOX_UA
        };

        db.run("UPDATE accounts SET creds = ?, last_sync = ? WHERE id = ?", [JSON.stringify(fresh), Date.now(), acc.id]);
        console.log(`[Heartbeat] ${acc.id} updated. Key: ${apiKey.substring(0, 5)}..., User: ${fresh.authUser}`);
      }
    } catch (e) {
      console.error(`[Heartbeat] Error for ${acc.id}:`, e);
    } finally {
      await browser.close();
    }
  }

  // ... (Startup/Interval logic same as before) ...
    // Run on startup
  setTimeout(async () => {
    const accounts = db.query("SELECT * FROM accounts").all() as AccountRecord[];
    if(accounts.length > 0) {
        console.log(`[Startup] Refreshing ${accounts.length} accounts...`);
        for (const acc of accounts) await performStealthRefresh(acc);
    }
  }, 5000);

  setInterval(async () => {
    const accounts = db.query("SELECT * FROM accounts").all() as AccountRecord[];
    for (const acc of accounts) await performStealthRefresh(acc);
  }, 25 * 60 * 1000);
});