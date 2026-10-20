/* Expat Insurance A/B-Tests: Lader (gepflegt von BOZ Marketing).
   Webflow bindet diese Datei ein. Sie lädt den eigentlichen Testcode (tests.js) stündlich frisch,
   damit Änderungen nicht 7 Tage im Browser-Zwischenspeicher hängen bleiben. */
(function () {
  var u = 'https://cdn.jsdelivr.net/gh/iamb0z/expat-ab@main/tests.js?h=' + Math.floor(Date.now() / 36e5);
  if (document.readyState === 'loading') document.write('<script src="' + u + '"><\/script>');
  else { var s = document.createElement('script'); s.src = u; (document.head || document.documentElement).appendChild(s); }
})();
