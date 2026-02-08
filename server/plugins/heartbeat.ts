import puppeteer, { type Browser, type Page } from "puppeteer";
import { useDb } from "~~/server/utils/suite";
import type { SuitemakerCreds, AccountRecord, GoogleCookie, WizData } from "~~/shared/types";

export default defineNitroPlugin(() => {
  const db = useDb();

  async function performStealthRefresh(acc: AccountRecord) {
    const creds: SuitemakerCreds = JSON.parse(acc.creds);
    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    try {
      const page: Page = await browser.newPage();
      const client = await page.target().createCDPSession();
      await client.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `Object.defineProperty(navigator, 'webdriver', { get: () => undefined })`
      });

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
      await page.goto("https://aistudio.google.com/", { waitUntil: 'networkidle2' });

      const wiz = await page.evaluate((): { data: WizData, toggles: string[] } | null => {
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const s of scripts) {
          const text = s.textContent || "";
          if (text.includes('SNlM0e')) {
            return {
              data: JSON.parse(text) as WizData,
              toggles: (window as any)._F_toggles || []
            };
          }
        }
        return null;
      });

      if (wiz) {
        const pCookies = await page.cookies();
        const cookieStr = pCookies.map(c => `${c.name}=${c.value}`).join("; ");
        const fresh: SuitemakerCreds = {
          cookie: cookieStr,
          at: wiz.data.SNlM0e,
          api_key: wiz.data.PeqOqb,
          build: wiz.data.cfb2h,
          flow_id: wiz.data.FdrFJe,
          nonce: wiz.data.WZsZ1e,
          toggles: wiz.toggles
        };
        db.run("UPDATE accounts SET creds = ?, last_sync = ? WHERE id = ?", [JSON.stringify(fresh), Date.now(), acc.id]);
        console.log(`[Heartbeat] ${acc.id} updated.`);
      }
    } catch (e) {
      console.error(`[Heartbeat] Failed for ${acc.id}`);
    } finally {
      await browser.close();
    }
  }

  // Run every 25 minutes
  setInterval(async () => {
    const accounts = db.query("SELECT * FROM accounts").all() as AccountRecord[];
    for (const acc of accounts) await performStealthRefresh(acc);
  }, 25 * 60 * 1000);
});