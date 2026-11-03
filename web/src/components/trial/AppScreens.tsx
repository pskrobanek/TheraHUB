// Ilustrační náhledy obrazovek smyšlené aplikace (ne skutečné screenshoty). U skutečných aplikací je dodá dodavatel.
import type { CatalogApp } from '../../data/types';
import AppIcon from '../AppIcon';

const screens = ['Přehled', 'Seznam pacientů', 'Detail'] as const;

function Frame({ app, kind }: { app: CatalogApp; kind: (typeof screens)[number] }) {
  const t = app.tint;
  return (
    <div className="scr-frame" style={{ ['--t' as string]: t }}>
      <div className="scr-bar">
        <i />
        <i />
        <i />
      </div>
      <div className="scr-body">
        <div className="scr-nav">
          <AppIcon app={app} size={18} />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i === screens.indexOf(kind) ? 'on' : ''} />
          ))}
        </div>
        <div className="scr-main">
          <div className="scr-title">
            <b>{kind}</b>
            <span />
          </div>
          {kind === 'Přehled' && (
            <>
              <div className="scr-kpis">
                {[64, 38, 82].map((v) => (
                  <div key={v}>
                    <span />
                    <b style={{ width: `${v}%` }} />
                  </div>
                ))}
              </div>
              <div className="scr-chart">
                {[40, 62, 48, 75, 58, 83, 70, 92].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </>
          )}
          {kind === 'Seznam pacientů' && (
            <div className="scr-rows">
              {['ok', 'warn', 'ok', 'bad', 'ok', 'ok'].map((st, i) => (
                <div key={i} className={`scr-row ${st}`}>
                  <i />
                  <span style={{ width: `${40 + ((i * 17) % 35)}%` }} />
                  <em />
                </div>
              ))}
            </div>
          )}
          {kind === 'Detail' && (
            <div className="scr-detail">
              <div className="scr-timeline">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <i />
                    <span style={{ width: `${55 + i * 9}%` }} />
                  </div>
                ))}
              </div>
              <div className="scr-form">
                {[0, 1, 2].map((i) => (
                  <span key={i} />
                ))}
                <b />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppScreens({ app }: { app: CatalogApp }) {
  return (
    <div className="scr">
      <div className="scr-strip">
        {screens.map((k) => (
          <figure key={k}>
            <Frame app={app} kind={k} />
            <figcaption className="muted small">{k}</figcaption>
          </figure>
        ))}
      </div>
      <p className="muted small">Ilustrační náhledy obrazovek. Skutečné screenshoty dodá dodavatel do karty aplikace.</p>
    </div>
  );
}
