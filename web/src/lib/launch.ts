// Spuštění externí aplikace v novém okně. Aplikace v TheraHUB nejsou nativní:
// běží u dodavatele a připojují se přes API (SMART on FHIR) v kontextu nemocnice a uživatele.
import { currentUser, hospital } from '../data/demo';
import type { CatalogApp } from '../data/types';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Otevře aplikaci v novém okně; v prototypu ukázkovou stránku spuštění. */
export function openExternalApp(app: CatalogApp): void {
  const w = window.open('', '_blank');
  if (!w) {
    alert(`Prohlížeč zablokoval nové okno. Povolte vyskakovací okna a zkuste znovu otevřít ${app.name}.`);
    return;
  }
  w.document.write(`<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(app.name)} – spuštění z TheraHUB</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f3f4f8; color: #11142a; font: 15px/1.55 Inter, system-ui, sans-serif; }
  main { max-width: 460px; margin: 16px; padding: 32px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(40, 48, 110, .08); }
  .mark { width: 48px; height: 48px; border-radius: 10px; background: ${esc(app.tint)}; margin-bottom: 18px; }
  h1 { margin: 0 0 4px; font-size: 1.4rem; }
  p { margin: 12px 0 0; color: #4a4f6a; }
  dl { margin: 18px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; font-size: .9rem; }
  dt { color: #6b7088; } dd { margin: 0; font-weight: 500; }
  small { display: block; margin-top: 20px; color: #6b7088; }
</style></head><body><main>
  <div class="mark"></div>
  <h1>${esc(app.name)}</h1>
  <div style="color:#6b7088">${esc(app.tagline)}</div>
  <p>Aplikace běží u svého dodavatele. TheraHUB ji spouští přes SMART on FHIR s kontextem nemocnice a přihlášeného uživatele, bez dalšího přihlašování.</p>
  <dl>
    <dt>Poskytovatel</dt><dd>${esc(hospital.name)}</dd>
    <dt>Uživatel</dt><dd>${esc(currentUser.name)}</dd>
    <dt>Rozhraní</dt><dd>SMART on FHIR (launch)</dd>
  </dl>
  <small>Ukázka prototypu TheraHUB – skutečná aplikace se zde zatím nenačítá.</small>
</main></body></html>`);
  w.document.close();
}
