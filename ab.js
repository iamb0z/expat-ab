/* Expat Insurance A/B-Tests: Lader (gepflegt von BOZ Marketing).
   Webflow bindet diese Datei ein. Sie lädt den eigentlichen Testcode (tests.js) von unserem eigenen Server
   (Vercel, max. 60 Sekunden zwischengespeichert), damit Änderungen sofort ankommen. Fällt der Server aus,
   kommt tests.js ersatzweise über jsDelivr. */
(function () {
  var u = 'https://expat-ab.vercel.app/tests.js?m=' + Math.floor(Date.now() / 6e4);
  var f = 'https://cdn.jsdelivr.net/gh/iamb0z/expat-ab@main/tests.js?h=' + Math.floor(Date.now() / 36e5);
  var fb = "this.onerror=null;var s=document.createElement('script');s.src='" + f + "';document.head.appendChild(s)";
  if (document.readyState === 'loading') document.write('<script src="' + u + '" onerror="' + fb + '"><\/script>');
  else { var s = document.createElement('script'); s.src = u; s.onerror = function () { var t = document.createElement('script'); t.src = f; document.head.appendChild(t); }; (document.head || document.documentElement).appendChild(s); }
})();
