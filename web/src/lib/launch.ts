// Spuštění externí aplikace v novém okně. Aplikace v TheraHUB nejsou nativní:
// běží u dodavatele a připojují se přes API (SMART on FHIR) v kontextu nemocnice a uživatele.
import { currentUser, hospital } from '../data/demo';
import type { CatalogApp, Patient } from '../data/types';
import { predikceClHtml } from './predikceClWindow';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Událost, když prohlížeč nové okno zablokoval (např. po dlouhém tažení pacienta) – App ukáže tlačítko pro otevření. */
export const LAUNCH_BLOCKED = 'therahub:launch-blocked';

/** Profil pacienta v okně aplikace (kontext SMART on FHIR launch). */
function patientBlock(p: Patient): string {
  const t = p.treatment;
  return `<section class="pt">
    <span class="lbl">Otevřeno s pacientem</span>
    <h2>${esc(p.name)}</h2>
    <div class="muted">${esc(p.sex === 'žena' ? 'Žena' : 'Muž')}, ${p.age} let · RČ ${esc(p.birthNumber)} · ${esc(p.nisId)}</div>
    <ul>${p.tags.map((d) => `<li><b>${esc(d.code)}</b> ${esc(d.label)}</li>`).join('')}</ul>
    ${t ? `<div class="tr">${esc(t.name)}: ${t.done} / ${t.total} ${esc(t.unit)} · od ${esc(t.started)} · plánovaný konec ${esc(t.plannedEnd)}</div>` : ''}
    <div class="muted small">Ošetřující lékař: ${esc(p.attending)}</div>
  </section>`;
}

/** Otevře aplikaci v novém okně; v prototypu ukázkovou stránku spuštění. S pacientem předá i jeho kontext. */
export function openExternalApp(app: CatalogApp, patient?: Patient): boolean {
  const w = window.open('', '_blank');
  if (!w) {
    if (patient) window.dispatchEvent(new CustomEvent(LAUNCH_BLOCKED, { detail: { appId: app.id, patientId: patient.id } }));
    else alert(`Prohlížeč zablokoval nové okno. Povolte vyskakovací okna a zkuste znovu otevřít ${app.name}.`);
    return false;
  }
  // Predikce CL má vlastní ukázkové okno s grafy (nejde o aplikaci pro jednoho pacienta).
  if (app.id === 'predikcecl') {
    w.document.write(predikceClHtml(currentUser.name));
    w.document.close();
    return true;
  }
  w.document.write(`<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(app.name)}${patient ? ` – ${esc(patient.name)}` : ''} – spuštění z TheraHUB</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f3f4f8; color: #11142a; font: 15px/1.55 Inter, system-ui, sans-serif; }
  main { max-width: 460px; margin: 16px; padding: 32px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(40, 48, 110, .08); }
  .mark { width: 48px; height: 48px; border-radius: 10px; background: ${esc(app.tint)}; margin-bottom: 18px; }
  h1 { margin: 0 0 4px; font-size: 1.4rem; }
  p { margin: 12px 0 0; color: #4a4f6a; }
  dl { margin: 18px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; font-size: .9rem; }
  dt { color: #6b7088; } dd { margin: 0; font-weight: 500; }
  small { display: block; margin-top: 20px; color: #6b7088; }
  .pt { margin-top: 20px; padding: 16px 18px; border-radius: 10px; background: #f3f5ff; border: 1px solid #dfe3fb; }
  .pt h2 { margin: 2px 0 2px; font-size: 1.15rem; }
  .pt ul { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 4px; font-size: .9rem; }
  .pt .tr { margin-top: 8px; font-size: .9rem; }
  .lbl { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; color: #4a55c8; font-weight: 600; }
  .muted { color: #6b7088; } .small { font-size: .82rem; margin-top: 6px; }
</style></head><body><main>
  <div class="mark"></div>
  <h1>${esc(app.name)}</h1>
  <div style="color:#6b7088">${esc(app.tagline)}</div>
  ${patient ? patientBlock(patient) : ''}
  <p>Aplikace běží u svého dodavatele. TheraHUB ji spouští přes SMART on FHIR s kontextem nemocnice${patient ? ', pacienta' : ''} a přihlášeného uživatele, bez dalšího přihlašování.${patient ? ' Údaje pacienta aplikace čte přímo z FHIR rozhraní nemocnice, přes TheraHUB nejdou.' : ''}</p>
  <dl>
    <dt>Poskytovatel</dt><dd>${esc(hospital.name)}</dd>
    <dt>Uživatel</dt><dd>${esc(currentUser.name)}</dd>
    <dt>Rozhraní</dt><dd>SMART on FHIR (launch${patient ? `, patient=Patient/${esc(patient.nisId.replace(/\D/g, ''))}` : ''})</dd>
  </dl>
  <small>Ukázka prototypu TheraHUB – skutečná aplikace se zde zatím nenačítá.</small>
</main></body></html>`);
  w.document.close();
  return true;
}
