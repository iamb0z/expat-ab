/* Expat Insurance: A/B-Tests (gepflegt von BOZ Marketing)
   Wird über den Lader ab.js (in Webflow direkt nach site/track.js) geladen. Ändert nur die Darstellung,
   nie die Einwilligung: Pixel und CAPI laufen weiter ausschließlich über track.js.
   Jeder Test teilt unabhängig 50/50 (bleibt pro Browser gleich).
   Varianten landen als "ABTest:<test>:<A|B>" in der Spalte "Ereignisse" des Tracking-Sheets.
   Prüfen: ?ab_seite-kurz=A oder ?ab_seite-kurz=B (oder ?ab=B). */
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

  /* Test 1 (Cookie-Leiste) am 21.10.2026 beendet (Chris): alle sehen wieder Tayfuns Original-Fenster. */

  /* ---------- Test 2: schlankere Seite, schneller zum Formular ---------- */
  var kurz = bucket('seite-kurz'); gemeldet.push('seite-kurz:' + kurz);
  if (kurz === 'B') {
    html.classList.add('ab-seite-kurz');
        /* Keine Scroll-Animation: Einstieg als normaler, statischer Bereich (Globus nur als ruhiger Hintergrund) */
    addCss('html.ab-seite-kurz .eis{height:auto!important}' +
      'html.ab-seite-kurz .eis-stage{position:relative!important;top:auto!important;height:auto!important;min-height:0!important;overflow:hidden;padding:104px 16px 48px!important}' +
      'html.ab-seite-kurz #eisLoop,html.ab-seite-kurz .eis-vig{height:100%!important}html.ab-seite-kurz #eisLoop{opacity:.35!important}' +
      'html.ab-seite-kurz .eis-cap.eis-hero{position:relative!important;inset:auto!important;top:auto!important;bottom:auto!important;opacity:1!important;transform:none!important;visibility:visible!important}' +
      'html.ab-seite-kurz .eis-cap:not(.eis-hero),html.ab-seite-kurz #eisHint,html.ab-seite-kurz .eis-place,html.ab-seite-kurz .eis-flash,html.ab-seite-kurz .eis-rail,html.ab-seite-kurz #eisFly,html.ab-seite-kurz #eisVid{display:none!important}' +
      '@media(min-width:760px){html.ab-seite-kurz .eis-stage{padding:140px 56px 72px!important}}' +
      'html.ab-seite-kurz #ueber-uns,html.ab-seite-kurz section.ei-about{display:none!important}' +
      'html.ab-seite-kurz .eis-hero .ei-btn-ghost,html.ab-seite-kurz .ei-hero .ei-btn-ghost,html.ab-seite-kurz .ei-strip-hint{display:none!important}' +
      '.ab-cta{position:fixed;left:12px;right:84px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;display:flex;align-items:center;justify-content:center;' +
      'background:#F15F14;color:#fff;border:0;border-radius:999px;padding:15px 18px;font:700 16px/1.1 "Instrument Sans",system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(241,95,20,.4);' +
      'text-decoration:none;cursor:pointer;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .25s,transform .25s}' +
      '.ab-cta.on{opacity:1;transform:none;pointer-events:auto}' +
      '@media(min-width:760px){.ab-cta{left:auto;right:96px;padding:15px 28px}}');
    ready(function () {
      /* Abschnitte ausblenden, die erklären statt überzeugen (Erkennung über die Überschrift) */
      var RAUS = [/^Die größte Falle/i, /^Genau hier machen wir den Unterschied/i, /^Globale Stärke/i, /^Egal, wo du gerade stehst/i,
                  /^Hinter EXPAT INSURANCE stehen/i, /^Alles, was du über internationale Krankenversicherung/i];
      var zahlen = null, stimmen = null;
      [].forEach.call(d.querySelectorAll('section.ei-sec'), function (s) {
        var h = s.querySelector('h1,h2,h3'); var t = h ? (h.innerText || h.textContent || '').trim() : '';
        var h2 = s.querySelector('h2'); var t2 = h2 ? (h2.innerText || h2.textContent || '').trim() : '';
        if (s.classList.contains('ei-about') || RAUS.some(function (r) { return r.test(t) || r.test(t2); })) s.style.setProperty('display', 'none', 'important');
        if (/^Unsere Kunden vertrauen uns/i.test(t2 || t)) stimmen = s;
        if (!h2 && /Expats abgesichert/i.test(s.textContent || '')) zahlen = s;
      });
      /* Ausgänge zum Rechner auf der Seite ausblenden (Menü und Footer bleiben): Fokus auf das Formular */
      [].forEach.call(d.querySelectorAll('a[href*="rechner"]'), function (l) {
        if (l.closest('nav, header, footer, .ei-footer, .w-nav')) return;
        l.style.setProperty('display', 'none', 'important');
      });
      /* Vertrauen nach oben: Zahlenleiste direkt nach dem Einstieg, Kundenstimmen nach den Versicherer-Logos */
      var hero = d.getElementById('eis'), logos = d.querySelector('section.ei-strip');
      try {
        if (logos && zahlen && logos.parentNode === zahlen.parentNode) logos.parentNode.insertBefore(zahlen, logos);
        else if (hero && zahlen && hero.parentNode === zahlen.parentNode) hero.parentNode.insertBefore(zahlen, hero.nextSibling);
        if (logos && stimmen && logos.parentNode === stimmen.parentNode) logos.parentNode.insertBefore(stimmen, logos.nextSibling);
      } catch (e) { }
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
