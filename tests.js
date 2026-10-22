/* Expat Insurance: A/B-Test (gepflegt von BOZ Marketing)
   Wird über den Lader ab.js (in Webflow site-weit direkt nach site/track.js) geladen.
   Test "lp-test" (ab 21.10.2026): Startseite (A) gegen eigene Landingpage /beratung (B).
   - Alle Besucher auf "/" werden aufgeteilt (Chris 21.10.2026), außer Suchmaschinen-Bots.
   - B-Besucher werden sofort nach /beratung weitergeleitet, alle Parameter (UTM, fbclid) bleiben erhalten.
   - Auf /beratung baut dieses Skript die Landingpage auf (Webflow liefert dort nur den leeren Seitenrahmen
     mit track.js). Cookie-Banner, Pixel und Besuchsprotokoll kommen aus Tayfuns track.js, Impressum/Datenschutz
     aus seinem legal.js. Das Kurzformular sendet wie sein funnel.js: gleicher Make-Webhook, gleiches Lead-Signal
     (eiTrack + eiLead mit eventID), gleiche WhatsApp-Nachricht.
   Varianten im Tracking-Sheet (Spalte "Ereignisse"): "ABTest:lp-test:A" bzw. "ABTest:lp-test:B".
   Ansehen: expat-insurance.ae/ = A, expat-insurance.ae/beratung = B. */
(function () {
  var d = document, w = window, html = d.documentElement, path = location.pathname.replace(/\/+$/, '') || '/';
  var KEY = 'eiab_lp-test';
  var AUFTEILEN = true;    /* Freigabe Chris 21.10.2026: Werbebesucher werden 50/50 aufgeteilt. */

  function melde(v) {
    var n = 0, t = setInterval(function () {
      if (w.eiTrack) { w.eiTrack('ABTest', { quelle: 'lp-test:' + v }); clearInterval(t); }
      else if (++n > 40) clearInterval(t);
    }, 100);
  }

  /* ---------- Startseite: Werbebesucher 50/50 aufteilen ---------- */
  if (path === '/') {
    if (!AUFTEILEN) return;
    var q = location.search || '';
    if (/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent)) return;   /* Suchmaschinen sehen immer die Startseite */
    if (/[?&]ab=a\b/i.test(q)) return;                 /* expat-insurance.ae/?ab=A zeigt immer die Startseite, ohne Zulosung */
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) { }
    if (v !== 'A' && v !== 'B') {
      v = Math.random() < 0.5 ? 'A' : 'B';
      try { localStorage.setItem(KEY, v); } catch (e) { }
    }
    if (v === 'B') {
      html.style.visibility = 'hidden';                 /* kein Aufblitzen der Startseite */
      /* Die Weiterleitung soll keine leere 1-Sekunden-Zeile im Besuchsprotokoll erzeugen (zählt sonst doppelt) */
      try { var of = w.fetch; w.fetch = function (u) { if (String(u).indexOf('igybxkrq') >= 0) return Promise.resolve(); return of.apply(this, arguments); }; } catch (e) { }
      location.replace('/beratung' + q + location.hash);
      return;
    }
    melde('A');
    return;
  }

  if (path !== '/beratung') return;

  /* ---------- /beratung: Landingpage aufbauen ---------- */
  if (AUFTEILEN) { try { localStorage.setItem(KEY, 'B'); } catch (e) { } }
  var LEGAL = 'https://cdn.jsdelivr.net/gh/tayfun-cmd/expat-media@e58818bddcb4d12238958b891b5100f302874d20/site/legal';
  if (!d.querySelector('script[src*="site/legal.js"]')) {
    if (d.readyState === 'loading') d.write('<link rel="stylesheet" href="' + LEGAL + '.css"><script src="' + LEGAL + '.js" defer><\/script>');
    else { var lk = d.createElement('link'); lk.rel = 'stylesheet'; lk.href = LEGAL + '.css'; d.head.appendChild(lk); var ls = d.createElement('script'); ls.src = LEGAL + '.js'; d.head.appendChild(ls); }
  }
  var WEBHOOK = 'https://hook.eu1.make.com/2anxx40bb0c8nqs13q6pj8sobjvy2jom', WA = '971553465531';
  var CDN = 'https://cdn.prod.website-files.com/691d8312c1303aa87deddf57/';
  var LOGOS = [
    CDN + '6a2c4f59743d0ad516447ff0_Logo%20Global%20Health%20neu.svg',
    'https://cdn.jsdelivr.net/gh/tayfun-cmd/expat-media@35ea49bd9ea91336df9e41b09a83b78f6e198ae2/logos/foyer.png',
    CDN + '6a2c4ed3412c15a2a39f7a31_Logo%20BDAE.webp',
    CDN + '6a2c4ed5a85ec63d77ab0204_Logo%20PassportCard.webp',
    CDN + '6a2d77950b98e527cbf5a8f6_april-international-logo-color.png',
    CDN + '6a2c4f7b3bebca121e71fb6c_Logo%20Cigna.svg',
    CDN + '6a2d77921ac36d393489dd72_genki-logo-color.png',
    CDN + '6a74812b687ad4e57edcd846_CareConcept%20Logo.png'
  ];
  var FOTO = CDN + '6a2fb08691ba0382d4b9ba1a_Tayfun%20Duelger%20Portrait.jpg';
  var LOGO = CDN + '6a2cf4b711f6e3241449e49a_EXPAT%20Logo%20rund.png';
  var CTA = 'Kostenlos beraten lassen';
  function btn() { return '<a href="#lpb-form" class="lpb-btn lpb-go">' + CTA + '</a>'; }
  var STERNE = '<span class="lpb-stars" aria-label="5 Sterne">★★★★★</span>';

  var css = "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap');" +
    "html.lpb,html.lpb body{margin:0;background:#fff}" +
    "body>*:not(#lpb):not(.eif-ov):not(.eick-ov):not(#eick):not(.eilg-ov):not(script):not(style){display:none!important}" +
    "#lpb{--navy:#09172e;--navy2:#0b1a33;--orange:#f15f14;--teal:#4ecdc4;--ink:#0b1a33;--muted:#5b6b82;--line:#e7ecf3;--soft:#f5f7fb;" +
    "font-family:'Instrument Sans',system-ui,sans-serif;color:var(--ink);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}" +
    "#lpb *{box-sizing:border-box}" +
    "#lpb h1,#lpb h2,#lpb h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;line-height:1.12;margin:0;letter-spacing:-.01em}" +
    "#lpb p{margin:0}" +
    "#lpb .lpb-wrap{max-width:1080px;margin:0 auto;padding:0 20px}" +
    "#lpb .lpb-top{background:var(--navy);padding:16px 0}" +
    "#lpb .lpb-logo{display:block;width:150px;height:33px;background:url(" + LOGO + ") left center/contain no-repeat}" +
    "#lpb .lpb-hero{background:var(--navy);color:#fff;padding:20px 0 40px}" +
    "#lpb .lpb-eyebrow{color:var(--teal);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}" +
    "#lpb .lpb-hero h1{font-size:34px;color:#fff}" +
    "#lpb .lpb-hero h1 em{font-style:normal;color:var(--orange)}" +
    "#lpb .lpb-sub{color:#b9c6de;margin-top:14px;font-size:17px}" +
    "#lpb .lpb-btn{display:block;width:100%;text-align:center;background:var(--orange)!important;color:#fff!important;font-weight:600;font-size:18px;padding:17px 20px;border-radius:12px;text-decoration:none;border:0;cursor:pointer;box-shadow:0 8px 24px rgba(241,95,20,.35)}" +
    "#lpb .lpb-btn:hover{filter:brightness(1.06)}" +
    "#lpb .lpb-cta{margin-top:24px}" +
    "#lpb .lpb-micro{font-size:14px;color:#9aa7bd;text-align:center;margin-top:10px}" +
    "#lpb .lpb-trust{margin-top:22px}" +
    "#lpb .lpb-proof{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;margin-top:18px;font-size:14px;color:#fff}" +
    "#lpb .lpb-proof b{font-weight:600}" +
    "#lpb .lpb-stars{color:#ffb400;letter-spacing:1px}" +
    "#lpb .lpb-person{display:flex;align-items:center;gap:14px;margin-top:26px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.04)}" +
    "#lpb .lpb-face{width:64px;height:64px;border-radius:50%;overflow:hidden;flex:0 0 64px;background:#1c2a52}" +
    "#lpb .lpb-face img{width:100%;height:100%;object-fit:cover;object-position:55% 30%;transform:scale(2.3);transform-origin:55% 31%;display:block}" +
    "#lpb .lpb-person b{display:block;color:#fff;font-size:16px}" +
    "#lpb .lpb-person small{display:block;color:#b9c6de;font-size:14px;line-height:1.4}" +
    "#lpb section{padding:44px 0}" +
    "#lpb .lpb-label{color:var(--orange);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}" +
    "#lpb h2{font-size:28px}" +
    "#lpb .lpb-logos{background:var(--navy);padding:8px 0 36px}" +
    "#lpb .lpb-logos p{text-align:center;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a3b3c9;margin-bottom:16px}" +
    "#lpb .lpb-logogrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}" +
    "#lpb .lpb-logogrid span{display:flex;align-items:center;justify-content:center;height:58px;padding:12px 14px;background:#1a3a63;border:1px solid rgba(255,255,255,.12);border-radius:14px}" +
    "#lpb .lpb-logogrid img{max-width:100%;max-height:100%;object-fit:contain;display:block}" +
    "#lpb .lpb-logogrid img.lpb-hell{background:#fff;border-radius:10px;padding:5px 10px;box-sizing:border-box}" +
    "#lpb .lpb-cost{background:var(--soft)}" +
    "#lpb .lpb-cards{display:grid;gap:12px;margin-top:22px}" +
    "#lpb .lpb-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px}" +
    "#lpb .lpb-big{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:30px;color:var(--orange);line-height:1.1}" +
    "#lpb .lpb-card p{color:var(--muted);margin-top:4px}" +
    "#lpb .lpb-note{margin-top:18px}" +
    "#lpb .lpb-steps{display:grid;gap:18px;margin-top:22px;counter-reset:s}" +
    "#lpb .lpb-step{display:flex;gap:14px}" +
    "#lpb .lpb-step i{flex:0 0 36px;height:36px;border-radius:50%;background:var(--navy);color:#fff;font-style:normal;font-weight:600;display:flex;align-items:center;justify-content:center}" +
    "#lpb .lpb-step h3{font-size:19px;margin-bottom:4px}" +
    "#lpb .lpb-step p{color:var(--muted)}" +
    "#lpb .lpb-reviews{background:var(--soft)}" +
    "#lpb .lpb-rgrid{display:grid;gap:12px;margin-top:22px}" +
    "#lpb .lpb-review{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px}" +
    "#lpb .lpb-review p{margin:8px 0 10px}" +
    "#lpb .lpb-review small{color:var(--muted);font-size:14px}" +
    "#lpb .lpb-about p{color:#33445c;margin-top:14px}" +
    "#lpb .lpb-about .lpb-sig{display:flex;align-items:center;gap:12px;margin-top:18px;font-weight:600}" +
    "#lpb .lpb-about .lpb-sig .lpb-face{width:52px;height:52px;flex-basis:52px}" +
    "#lpb .lpb-form{background:#fff;color:var(--ink);border-radius:16px;padding:20px;margin-top:22px;box-shadow:0 18px 40px rgba(0,0,0,.35);scroll-margin-top:12px}" +
    "#lpb .lpb-form h2{font-size:22px}" +
    "#lpb .lpb-form .lpb-fsub{color:var(--muted);font-size:15px;margin:4px 0 14px}" +
    "#lpb .lpb-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
    "#lpb .lpb-in{width:100%;font:inherit;font-size:16px;padding:14px;border:1.5px solid #cfd8e6;border-radius:10px;margin-bottom:10px;background:#fff;color:var(--ink);-webkit-appearance:none}" +
    "#lpb .lpb-in:focus{outline:none;border-color:var(--navy)}" +
    "#lpb .lpb-in.err{border-color:var(--orange)}" +
    "#lpb .lpb-form .lpb-btn{margin-top:4px}" +
    "#lpb .lpb-fnote{font-size:13px;color:var(--muted);text-align:center;margin-top:10px}" +
    "#lpb .lpb-done{text-align:center;padding:10px 0}" +
    "#lpb .lpb-done b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;margin:8px 0}" +
    "#lpb .lpb-chk{width:52px;height:52px;border-radius:50%;background:#e8f8f6;color:#16a394;font-size:28px;line-height:52px;margin:0 auto}" +
    "#lpb details{border-bottom:1px solid var(--line);padding:16px 0}" +
    "#lpb summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:12px}" +
    "#lpb summary::-webkit-details-marker{display:none}" +
    "#lpb summary:after{content:'+';color:var(--orange);font-size:22px;line-height:1}" +
    "#lpb details[open] summary:after{content:'–'}" +
    "#lpb details p{color:var(--muted);margin-top:10px}" +
    "#lpb .lpb-final{background:var(--navy);color:#fff;text-align:center}" +
    "#lpb .lpb-final h2{color:#fff}" +
    "#lpb .lpb-final .lpb-sub{margin:12px auto 0;max-width:520px}" +
    "#lpb .lpb-final .lpb-cta{max-width:420px;margin:24px auto 0}" +
    "#lpb footer{background:#061020;color:#9aa7bd;font-size:14px;padding:24px 0 96px;text-align:center}" +
    "#lpb footer a{color:#b9c6de;text-decoration:underline;margin:0 8px}" +
    "#lpb footer p{margin-top:10px}" +
    "#lpb .lpb-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));background:rgba(9,23,46,.96);box-shadow:0 -8px 24px rgba(0,0,0,.25);display:none}" +
    "#lpb .lpb-sticky.on{display:block}" +
    "#lpb .lpb-sticky .lpb-btn{box-shadow:none;padding:15px 20px}" +
    "@media(min-width:760px){#lpb{font-size:18px}#lpb .lpb-hero{padding:40px 0 64px}#lpb .lpb-hero .lpb-wrap{display:grid;grid-template-columns:1.25fr 1fr;column-gap:56px;row-gap:0;grid-template-areas:'t f' 'v f';align-items:start}#lpb .lpb-text{grid-area:t}#lpb .lpb-trust{grid-area:v}#lpb .lpb-hero .lpb-form{grid-area:f;align-self:center}" +
    "#lpb .lpb-hero h1{font-size:52px}#lpb .lpb-cta{max-width:420px}#lpb .lpb-proof{justify-content:flex-start}#lpb .lpb-micro{text-align:left;max-width:420px}" +
    "#lpb .lpb-form{margin-top:0;padding:28px}#lpb .lpb-hero .lpb-person{max-width:420px}" +
    "#lpb section{padding:72px 0}#lpb h2{font-size:38px}#lpb .lpb-logos .lpb-wrap{max-width:1320px}#lpb .lpb-logogrid{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}#lpb .lpb-logogrid span{height:62px;flex:0 0 auto;padding:12px 14px}#lpb .lpb-logogrid img{max-height:36px;max-width:170px}" +
    "#lpb .lpb-cards,#lpb .lpb-steps,#lpb .lpb-rgrid{grid-template-columns:repeat(3,1fr)}#lpb .lpb-cards{grid-template-columns:repeat(2,1fr)}" +
    "#lpb .lpb-step{flex-direction:column}#lpb .lpb-narrow{max-width:760px}#lpb .lpb-sticky{display:none!important}#lpb footer{padding-bottom:28px}}";

  var body =
    '<header class="lpb-top"><div class="lpb-wrap"><a class="lpb-logo" href="/beratung" aria-label="EXPAT Insurance"></a></div></header>' +

    '<div class="lpb-hero"><div class="lpb-wrap"><div class="lpb-text">' +
      '<div class="lpb-eyebrow">Internationale Krankenversicherung für Expats</div>' +
      '<h1>Der Tarif, der zu deinem Leben in Dubai passt. <em>Kostenlos und auf Deutsch.</em></h1>' +
      '<p class="lpb-sub">Wir vergleichen über 22 Tarife von sieben internationalen Versicherern und finden den Tarif, der zu deinem Leben passt.</p>' +
    '</div>' +
    '<form class="lpb-form" id="lpb-form" novalidate>' +
      '<h2>Kostenlose Beratung</h2>' +
      '<p class="lpb-fsub">Trag dich ein, wir melden uns persönlich bei dir.</p>' +
      '<div class="lpb-row"><input class="lpb-in" name="vorname" placeholder="Vorname" autocomplete="given-name"><input class="lpb-in" name="nachname" placeholder="Nachname" autocomplete="family-name"></div>' +
      '<input class="lpb-in" name="tel" type="tel" placeholder="Telefon / WhatsApp" autocomplete="tel">' +
      '<input class="lpb-in" name="email" type="email" placeholder="E-Mail (optional)" autocomplete="email">' +
      '<button type="submit" class="lpb-btn" id="lpb-hero-cta">' + CTA + '</button>' +
      '<p class="lpb-fnote">Kostenlos und unverbindlich. Wir melden uns persönlich, kein Callcenter.</p>' +
    '</form>' +
    '<div class="lpb-trust">' +
      '<div class="lpb-proof"><span>' + STERNE + ' <b>5,0</b> Google-Bewertung</span><span><b>1.000+</b> Expats abgesichert</span><span><b>13+</b> Jahre Erfahrung</span></div>' +
      '<div class="lpb-person"><div class="lpb-face"><img src="' + FOTO + '" alt="Tayfun Dülger"></div><div><b>Tayfun Dülger</b><small>Dein fester Ansprechpartner. Direkt per WhatsApp.</small></div></div>' +
    '</div>' +
    '</div></div>' +

    '<div class="lpb-logos"><div class="lpb-wrap"><p>Mit unseren Partnern weltweit versichert</p><div class="lpb-logogrid">' +
      LOGOS.map(function (s) { return '<span><img src="' + s + '" alt=""' + (/foyer|april|CareConcept/.test(s) ? ' class="lpb-hell"' : '') + '></span>'; }).join('') +
    '</div></div></div>' +

    '<section class="lpb-cost"><div class="lpb-wrap">' +
      '<div class="lpb-label">Ohne passenden Schutz</div>' +
      '<h2>Ohne passende Krankenversicherung zahlst du jede Rechnung selbst.</h2>' +
      '<div class="lpb-cards">' +
        '<div class="lpb-card"><div class="lpb-big">ab 450 AED</div><p>kostet ein Arztbesuch in Dubai.</p></div>' +
        '<div class="lpb-card"><div class="lpb-big">über 9.000 AED</div><p>ist man in der Notaufnahme schnell mal.</p></div>' +
      '</div>' +
      '<div class="lpb-cta lpb-note">' + btn() + '</div>' +
    '</div></section>' +

    '<section><div class="lpb-wrap">' +
      '<div class="lpb-label">So läuft es ab</div>' +
      '<h2>Deine Beratung in drei Schritten.</h2>' +
      '<div class="lpb-steps">' +
        '<div class="lpb-step"><i>1</i><div><h3>Analyse und Vergleich</h3><p>Wir prüfen deine Situation und vergleichen die Tarife mehrerer Versicherer.</p></div></div>' +
        '<div class="lpb-step"><i>2</i><div><h3>Persönliche Beratung</h3><p>Ehrlich und ohne Verkaufsdruck, wir finden den Tarif, der zu dir passt.</p></div></div>' +
        '<div class="lpb-step"><i>3</i><div><h3>Abschluss und Betreuung</h3><p>Wir begleiten dich beim Abschluss und bleiben dein Ansprechpartner, auch danach.</p></div></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="lpb-reviews"><div class="lpb-wrap">' +
      '<div class="lpb-label">Kundenstimmen</div>' +
      '<h2>Unsere Kunden vertrauen uns.</h2>' +
      '<div class="lpb-rgrid">' +
        '<div class="lpb-review">' + STERNE + '<p>Regelmäßige Gespräche zu meinem Status und mit den besten Ärzten in Dubai verbunden. Ich schätze die Zusammenarbeit mit Tayfun.</p><small>Leon Schönwälder, Google Rezension</small></div>' +
        '<div class="lpb-review">' + STERNE + '<p>Immer erreichbar, auch im Ausland. Tolle Beratung und hervorragender Service. Sehr empfehlenswert.</p><small>Chris A., Google Rezension</small></div>' +
        '<div class="lpb-review">' + STERNE + '<p>Alle wichtigen Aspekte transparent dargestellt, Vor- und Nachteile abgewogen und die passende Versicherung gefunden. Vielen Dank.</p><small>Omar Sami, Google Rezension</small></div>' +
      '</div>' +
      '<div class="lpb-cta lpb-note">' + btn() + '</div>' +
    '</div></section>' +

    '<section class="lpb-about"><div class="lpb-wrap lpb-narrow">' +
      '<div class="lpb-label">Über uns</div>' +
      '<h2>Hinter EXPAT INSURANCE stehen echte Menschen, kein Callcenter.</h2>' +
      '<p>Seit über 13 Jahren dreht sich bei mir alles um internationale Krankenversicherung, seit einigen Jahren mit Schwerpunkt auf Expats in Dubai. Ich arbeite komplett unabhängig und empfehle dir das, was zu deinem Leben passt, nicht das, was sich am besten verkauft.</p>' +
      '<p>Meine Courtage kommt vom Versicherer, nicht von dir. Deshalb berate ich dich ehrlich, ohne Verkaufsdruck.</p>' +
      '<div class="lpb-sig"><div class="lpb-face"><img src="' + FOTO + '" alt=""></div>Tayfun Dülger</div>' +
    '</div></section>' +

    '<section style="padding-top:0"><div class="lpb-wrap lpb-narrow">' +
      '<div class="lpb-label">Häufige Fragen</div>' +
      '<details><summary>Wie läuft die Beratung ab und was kostet sie?</summary><p>Die Erstberatung ist kostenlos und unverbindlich. Wir analysieren deine Situation, vergleichen passende Tarife und begleiten dich bis zum Abschluss.</p></details>' +
      '<details><summary>Ich bin schon versichert. Lohnt sich das trotzdem?</summary><p>Ja. Wenn du bereits international krankenversichert bist, kannst du das Maklermandat zu uns übertragen. Dein Tarif und deine Police bleiben unverändert, du bekommst einen besseren persönlichen Ansprechpartner, ohne zusätzliche Kosten.</p></details>' +
      '<details><summary>Bin ich auch versichert, wenn ich in ein anderes Land ziehe?</summary><p>Ja. Deine internationale Krankenversicherung zieht mit dir um, ob nach Südostasien, Spanien, Zypern oder in die VAE. Dein Schutz und dein fester Ansprechpartner bleiben.</p></details>' +
      '<details><summary>Bietet ihr Schutz für Familien, Partner und Kinder?</summary><p>Ja. Wir erstellen auch Familien und Partnertarife, damit deine Liebsten genauso abgesichert sind wie du.</p></details>' +
    '</div></section>' +

    '<section class="lpb-final"><div class="lpb-wrap">' +
      '<h2>Weil deine Gesundheit weltweit in den besten Händen sein sollte.</h2>' +
      '<p class="lpb-sub">Kostenlose Erstberatung, unverbindlich und auf Deutsch. Wir melden uns persönlich, kein Callcenter.</p>' +
      '<div class="lpb-cta">' + btn() + '</div>' +
    '</div></section>' +

    '<footer><div class="lpb-wrap"><div class="lpb-legal"><a href="#">Impressum</a><a href="#">Datenschutz</a></div>' +
      '<p>© 2026 EXPAT Insurance. Alle Rechte vorbehalten.</p></div></footer>' +

    '<div class="lpb-sticky" id="lpb-sticky">' + btn() + '</div>';

  function aufbauen() {
    if (d.getElementById('lpb')) return;
    html.classList.add('lpb');
    var st = d.createElement('style'); st.textContent = css; (d.head || html).appendChild(st);
    var root = d.createElement('div'); root.id = 'lpb'; root.innerHTML = body;
    d.body.insertBefore(root, d.body.firstChild);

    d.title = 'Kostenlose Beratung | EXPAT Insurance';
    var form = d.getElementById('lpb-form');

    /* Alle Knöpfe führen zum Formular oben */
    root.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('.lpb-go'); if (!g) return;
      e.preventDefault();
      var y = form.getBoundingClientRect().top + (w.pageYOffset || html.scrollTop) - 12;
      w.scrollTo(0, y);
      setTimeout(function () { var f = form.querySelector('input'); if (f) f.focus({ preventScroll: true }); }, 50);
    });

    /* Formular: gleicher Weg wie Tayfuns funnel.js */
    function T(n, p, o) { try { if (w.eiTrack) w.eiTrack(n, p, o); } catch (e) { } }
    var gestartet = false;
    form.addEventListener('focusin', function () { if (!gestartet) { gestartet = true; T('FunnelStart', { quelle: 'Kurzformular' }); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, ok = true;
      ['vorname', 'nachname', 'tel'].forEach(function (k) {
        var v = (f[k].value || '').trim(), bad = !v || (k === 'tel' && v.replace(/\D/g, '').length < 6);
        f[k].classList.toggle('err', bad); if (bad) ok = false;
      });
      if (!ok) return;
      var ans = { vorname: f.vorname.value.trim(), nachname: f.nachname.value.trim(), tel: f.tel.value.trim(), email: f.email.value.trim(), anliegen: 'Kurzformular Landingpage', kids: [] };
      var eid = 'lead-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); ans.event_id = eid;
      try { var at = w.eiAttr ? w.eiAttr() : {}; for (var k in at) ans[k] = at[k]; } catch (x) { }
      T('Lead', { quelle: 'Funnel', content_name: 'Beratungsanfrage' }, { eventID: eid });
      try { if (w.eiLead) w.eiLead(eid, { email: ans.email, phone: ans.tel, fn: ans.vorname, ln: ans.nachname }, 'Funnel'); } catch (x) { }
      try { fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ans) }); } catch (x) { }
      var msg = 'Neue Anfrage über die Website\nName: ' + ans.vorname + ' ' + ans.nachname + '\nKontakt: ' + ans.tel + (ans.email ? ' / ' + ans.email : '');
      try { w.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank'); } catch (x) { }
      form.innerHTML = '<div class="lpb-done"><div class="lpb-chk">✓</div><b>Danke, ' + ans.vorname.replace(/[<>&"]/g, '') + '!</b><p>Deine Anfrage ist unterwegs. Wir haben WhatsApp geöffnet, damit du sie direkt absenden kannst. Wir melden uns persönlich bei dir.</p></div>';
    });

    /* Knopf unten: erst wenn das Formular aus dem Bild ist, nie über dem Cookie-Banner */
    var sticky = d.getElementById('lpb-sticky'), hero = form;
    function zeigen() {
      var r = hero.getBoundingClientRect();
      var banner = d.querySelector('.eick-ov'), offen = d.querySelector('.eilg-ov.open');
      var bannerSichtbar = banner && banner.offsetParent !== null && getComputedStyle(banner).display !== 'none';
      sticky.classList.toggle('on', r.bottom < 0 && !offen && !bannerSichtbar);
    }
    addEventListener('scroll', zeigen, { passive: true }); setInterval(zeigen, 400); zeigen();
    melde('B');
  }
  if (d.body) aufbauen(); else d.addEventListener('DOMContentLoaded', aufbauen);
})();
