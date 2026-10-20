import { AlertTriangle, Mic, Phone, Send, Sparkles } from 'lucide-react';
import type { AppWidget } from '../../data/types';

type Widget<K extends AppWidget['kind']> = Extract<AppWidget, { kind: K }>;

export function ToxicityBody({ w }: { w: Widget<'toxicity'> }) {
  return (
    <>
      {w.alert && (
        <div className="widget-alert">
          <AlertTriangle size={18} />
          <span>{w.alert.text}</span>
          <span className="mono">{w.alert.time}</span>
        </div>
      )}
      <div className="widget-label">Poslední dotazník</div>
      <ul className="grades">
        {w.items.map((it) => (
          <li key={it.label}>
            <span>{it.label}</span>
            <span className={it.grade >= 3 ? 'grade-bar severe' : 'grade-bar'} aria-label={`stupeň ${it.grade}`}>
              {[1, 2, 3, 4].map((n) => (
                <i key={n} className={n <= it.grade ? 'on' : ''} />
              ))}
            </span>
            <span className={it.grade >= 3 ? 'mono grade severe' : 'mono grade'}>G{it.grade}</span>
          </li>
        ))}
      </ul>
      <div className="muted small">
        Vyplněno {w.completed} z {w.total} dotazníků · další {w.next}
      </div>
    </>
  );
}

export function ToxicityActions() {
  return (
    <>
      <button className="btn primary">Report</button>
      <button className="btn">Poslat dotazník</button>
      <button className="btn icon" aria-label="Zavolat pacientovi">
        <Phone size={18} />
      </button>
    </>
  );
}

/** Syntetická EKG křivka (PQRST komplexy) pro náhled. */
function ecgPath(width: number, height: number, beats: number): string {
  const mid = height * 0.6;
  const beat = width / beats;
  const pts: string[] = [`M0 ${mid}`];
  for (let b = 0; b < beats; b++) {
    const x = b * beat;
    const p = (f: number, dy: number) => pts.push(`L${(x + beat * f).toFixed(1)} ${(mid + dy).toFixed(1)}`);
    p(0.18, 0);
    p(0.24, -6); // P
    p(0.3, 0);
    p(0.38, 0);
    p(0.41, 6); // Q
    p(0.46, -mid + 6); // R
    p(0.51, 14); // S
    p(0.55, 0);
    p(0.66, 0);
    p(0.74, -10); // T
    p(0.82, 0);
    p(1, 0);
  }
  return pts.join(' ');
}

export function EcgBody({ w }: { w: Widget<'ecg'> }) {
  return (
    <>
      <div className="ecg-head">
        <span className="bpm">
          {w.bpm}
          <small>bpm</small>
        </span>
        <span className="pill ok">● {w.rhythm}</span>
      </div>
      <div className="ecg">
        <svg viewBox="0 0 400 90" preserveAspectRatio="none" aria-label="Náhled EKG">
          <path d={ecgPath(400, 90, 5)} />
        </svg>
      </div>
      <div className="metrics">
        <div>
          <span className="muted small">QTc</span>
          <b className="mono">{w.qtc} ms</b>
        </div>
        <div>
          <span className="muted small">PR</span>
          <b className="mono">{w.pr} ms</b>
        </div>
        <div>
          <span className="muted small">QRS</span>
          <b className="mono">{w.qrs} ms</b>
        </div>
      </div>
      <div className="muted small">Poslední EKG {w.lastRecord}</div>
    </>
  );
}

export function EcgActions({ tint }: { tint: string }) {
  return (
    <>
      <button className="btn primary" style={{ background: tint }}>
        Otevřít EKG
      </button>
      <button className="btn">Vyžádat nové EKG</button>
    </>
  );
}

interface ScribeProps {
  w: Widget<'scribe'>;
  onToggle: (taskId: string) => void;
}

export function ScribeBody({ w, onToggle }: ScribeProps) {
  return (
    <>
      <div className="scribe-head">
        <b>{w.title}</b>
        <span className="muted small">{w.meta}</span>
      </div>
      <div className="ai-summary">
        <div className="ai-label">
          <Sparkles size={14} /> AI souhrn
        </div>
        <p>{w.summary}</p>
      </div>
      <ul className="tasks">
        {w.tasks.map((t) => (
          <li key={t.id}>
            <label className={t.done ? 'done' : ''}>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
              {t.text}
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ScribeActions() {
  return (
    <>
      <button className="btn primary dark">
        <Mic size={17} /> Nahrát návštěvu
      </button>
      <button className="btn">Otevřít přepis</button>
    </>
  );
}

export function PendingBody() {
  return (
    <div className="pending">
      <Send size={20} />
      <p>
        Pacientovi byl odeslán SMS odkaz.
        <br />
        <span className="muted">Data se zobrazí po prvním vyplnění.</span>
      </p>
    </div>
  );
}
