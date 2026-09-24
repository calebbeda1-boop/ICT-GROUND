/* visitors-widget.js
   Adds "Total visits / Unique visitors / Visits today" boxes to the Results tab of admin.html.
   Add ONE line to admin.html, just above </body>:
   <script src="visitors-widget.js"></script>
*/
(function () {
  async function loadVisitors() {
    try {
      var res = await fetch('/api/stats', {
        headers: { 'x-admin-password': sessionStorage.getItem('admin_pw') || '' }
      });
      if (!res.ok) return;
      var v = await res.json();

      var box = document.getElementById('visitor-summary');
      if (!box) {
        var anchor = document.getElementById('summary');
        if (!anchor) return;
        box = document.createElement('div');
        box.className = 'summary';
        box.id = 'visitor-summary';
        anchor.parentNode.insertBefore(box, anchor);
      }
      box.innerHTML =
        '<div class="stat"><div class="n">' + v.total + '</div><div class="l">Total visits</div></div>' +
        '<div class="stat"><div class="n">' + v.unique + '</div><div class="l">Unique visitors</div></div>' +
        '<div class="stat"><div class="n">' + v.today + '</div><div class="l">Visits today</div></div>';
    } catch (e) {
      console.error('Visitor stats:', e);
    }
  }

  // Refresh the visitor boxes every time the results are (re)loaded: sign in, Refresh button, etc.
  var originalLoadResults = window.loadResults;
  if (typeof originalLoadResults === 'function') {
    window.loadResults = async function () {
      await originalLoadResults.apply(this, arguments);
      loadVisitors();
    };
  }

  // Already signed in when the page opened
  if (sessionStorage.getItem('admin_pw')) loadVisitors();
})();
