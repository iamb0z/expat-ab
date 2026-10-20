/* Expat Insurance: A/B-Tests (gepflegt von BOZ Marketing)
   Wird in Webflow direkt nach site/track.js geladen. Ändert nur die Darstellung,
   nie die Einwilligung: Pixel und CAPI laufen weiter ausschließlich über track.js.
   Jeder Test teilt unabhängig 50/50 (bleibt pro Browser gleich).
   Varianten landen als "ABTest:<test>:<A|B>" in der Spalte "Ereignisse" des Tracking-Sheets.
   Prüfen: ?ab_cookie-leiste=B oder ?ab_seite-kurz=B (oder ?ab=B für alle Tests). */
(function () {
  var d = document, w = window, html = d.documentElement;
  if (!/^\/$/.test(location.pathname)) return;           /* nur Startseite */
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }

  function bucket(id) {
    var v = (q.get('ab_' + id) || q.get('ab') || '').toUpperCase(), key = 'eiab_' + id;
    if (v !== 'A' && v !== 'B') {
      try { v = localStorage.getItem(key); } catch (e) { v = null; }
      if (v !== 'A' && v !== 'B') { v = Math.random() < 0.5 ? 'A' : 'B'; try { localStorage.setItem(key, v); } catch (e) { } }
    }
    return v;
  }
  function addCss(css) { var st = d.createElement('style'); st.textContent = css; (d.head || html).appendChild(st); }
  function ready(fn) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn); else fn(); }
  var gemeldet = [];

  /* ---------- Test 1: Cookie-Leiste statt Vollbild-Fenster ---------- */
  var cookie = bucket('cookie-leiste'); gemeldet.push('cookie-leiste:' + cookie);
  if (cookie === 'B') {
    html.classList.add('ab-cookie-leiste');
    addCss('html.ab-cookie-leiste .eick-ov{inset:auto 0 0 0!important;align-items:flex-end!important;padding:0!important;background:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;pointer-events:none}' +
      'html.ab-cookie-leiste .eick{pointer-events:auto;max-width:none!important;width:100%!important;border-radius:14px 14px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px))!important;box-shadow:0 -10px 30px rgba(0,0,0,.35)!important}' +
      'html.ab-cookie-leiste .eick-k,html.ab-cookie-leiste .eick h2,html.ab-cookie-leiste .eick small{display:none!important}' +
      'html.ab-cookie-leiste .eick p{font-size:13px!important;line-height:1.45!important}' +
      'html.ab-cookie-leiste .eick-b{grid-template-columns:1fr 1fr!important;margin:10px 0 0!important}' +
      'html.ab-cookie-leiste .eick-b button{padding:11px 8px!important;font-size:14px!important}' +
      '@media(min-width:760px){html.ab-cookie-leiste .eick{display:flex!important;align-items:center;gap:20px;padding:14px 24px!important}html.ab-cookie-leiste .eick-b{margin:0!important;flex:0 0 340px}}');
    var mo = new MutationObserver(function () { var o = d.getElementById('eick'); if (o) { o.removeAttribute('aria-modal'); mo.disconnect(); } });
    mo.observe(html, { childList: true, subtree: true });
  }

  /* ---------- Test 2: schlankere Seite, schneller zum Formular ---------- */
  var kurz = bucket('seite-kurz'); gemeldet.push('seite-kurz:' + kurz);
  if (kurz === 'B') {
    html.classList.add('ab-seite-kurz');
    /* Flug-Animation von 720/900vh auf 200vh stauchen (Animation rechnet relativ zur Höhe) */
    addCss('html.ab-seite-kurz .eis{height:200vh!important}' +
      '.ab-cta{position:fixed;left:12px;right:84px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;display:flex;align-items:center;justify-content:center;' +
      'background:#F15F14;color:#fff;border:0;border-radius:999px;padding:15px 18px;font:700 16px/1.1 "Instrument Sans",system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(241,95,20,.4);' +
      'text-decoration:none;cursor:pointer;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .25s,transform .25s}' +
      '.ab-cta.on{opacity:1;transform:none;pointer-events:auto}' +
      '@media(min-width:760px){.ab-cta{left:auto;right:96px;padding:15px 28px}}');
    ready(function () {
      /* Abschnitte ausblenden, die erklären statt überzeugen (Erkennung über die Überschrift) */
      var RAUS = [/^Die größte Falle/i, /^Genau hier machen wir den Unterschied/i, /^Globale Stärke/i, /^Egal, wo du gerade stehst/i];
      [].forEach.call(d.querySelectorAll('section.ei-sec'), function (s) {
        var h = s.querySelector('h1,h2,h3'); var t = h ? (h.innerText || h.textContent || '').trim() : '';
        if (RAUS.some(function (r) { return r.test(t); })) s.style.display = 'none';
      });
      /* Fester Beratungs-Knopf: Klasse ei-btn + Text mit "Beratung" öffnet Tayfuns Funnel (funnel.js) */
      var a = d.createElement('a'); a.setAttribute('role', 'button'); a.tabIndex = 0; a.className = 'ei-btn ab-cta'; a.textContent = 'Kostenlose Beratung starten';
      d.body.appendChild(a);
      function zeigen() {
        var banner = d.getElementById('eick');               /* nicht über dem Cookie-Banner */
        var funnelOffen = d.querySelector('.eif-ov.open');    /* nicht über dem offenen Formular */
        var obenImHero = scrollY < innerHeight * 0.6;         /* oben ist der Beratungs-Knopf der Seite sichtbar */
        a.classList.toggle('on', !banner && !funnelOffen && !obenImHero);
      }
      addEventListener('scroll', zeigen, { passive: true }); setInterval(zeigen, 500); zeigen();
    });
  }

  /* Varianten ins eigene Besuchsprotokoll schreiben (über track.js) */
  function melde() {
    if (!w.eiTrack) return false;
    gemeldet.forEach(function (x) { w.eiTrack('ABTest', { quelle: x }); });
    return true;
  }
  if (!melde()) { var n = 0, t = setInterval(function () { if (melde() || ++n > 40) clearInterval(t); }, 100); }
})();
