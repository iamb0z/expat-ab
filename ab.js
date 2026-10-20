/* Expat Insurance: A/B-Tests (gepflegt von BOZ Marketing)
   Wird in Webflow direkt nach site/track.js geladen. Ändert nur die Darstellung,
   nie die Einwilligung: Pixel und CAPI laufen weiter ausschließlich über track.js.
   Jeder Besucher bekommt je Test zufällig A oder B (bleibt pro Browser gleich).
   Die Variante landet als "ABTest:<test>:<A|B>" in der Spalte "Ereignisse" des Tracking-Sheets.
   Prüfen: ?ab=A oder ?ab=B an die URL hängen. */
(function () {
  var TEST = { id: 'cookie-leiste', aktiv: true, seiten: /^\/$/ };
  if (!TEST.aktiv || !TEST.seiten.test(location.pathname)) return;

  var d = document, w = window, key = 'eiab_' + TEST.id, v;
  try { v = (new URLSearchParams(location.search).get('ab') || '').toUpperCase(); } catch (e) { v = ''; }
  if (v !== 'A' && v !== 'B') {
    try { v = localStorage.getItem(key); } catch (e) { v = null; }
    if (v !== 'A' && v !== 'B') { v = Math.random() < 0.5 ? 'A' : 'B'; try { localStorage.setItem(key, v); } catch (e) { } }
  }

  /* Variante B: Cookie-Banner als Leiste unten statt Vollbild-Fenster (Text und Knöpfe unverändert) */
  if (v === 'B') {
    d.documentElement.classList.add('ab-cookie-leiste');
    var css = 'html.ab-cookie-leiste .eick-ov{inset:auto 0 0 0!important;align-items:flex-end!important;padding:0!important;background:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;pointer-events:none}' +
      'html.ab-cookie-leiste .eick{pointer-events:auto;max-width:none!important;width:100%!important;border-radius:14px 14px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px))!important;box-shadow:0 -10px 30px rgba(0,0,0,.35)!important}' +
      'html.ab-cookie-leiste .eick-k,html.ab-cookie-leiste .eick h2,html.ab-cookie-leiste .eick small{display:none!important}' +
      'html.ab-cookie-leiste .eick p{font-size:13px!important;line-height:1.45!important}' +
      'html.ab-cookie-leiste .eick-b{grid-template-columns:1fr 1fr!important;margin:10px 0 0!important}' +
      'html.ab-cookie-leiste .eick-b button{padding:11px 8px!important;font-size:14px!important}' +
      '@media(min-width:760px){html.ab-cookie-leiste .eick{display:flex!important;align-items:center;gap:20px;padding:14px 24px!important}html.ab-cookie-leiste .eick-b{margin:0!important;flex:0 0 340px}}';
    var st = d.createElement('style'); st.textContent = css; (d.head || d.documentElement).appendChild(st);
    /* Leiste ist kein blockierender Dialog */
    var mo = new MutationObserver(function () { var o = d.getElementById('eick'); if (o) { o.removeAttribute('aria-modal'); mo.disconnect(); } });
    mo.observe(d.documentElement, { childList: true, subtree: true });
  }

  /* Variante ins eigene Besuchsprotokoll schreiben (über track.js) */
  function melde() { if (w.eiTrack) { w.eiTrack('ABTest', { quelle: TEST.id + ':' + v }); return true; } return false; }
  if (!melde()) { var n = 0, t = setInterval(function () { if (melde() || ++n > 40) clearInterval(t); }, 100); }
})();
