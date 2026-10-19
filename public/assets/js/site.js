// Shared front-end behaviour for the Golden Healing Solutions site.
(function () {
  "use strict";
  var burger = document.getElementById("burger");
  var links = document.getElementById("navlinks");
  if (burger && links) {
    function close() {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open navigation menu");
      burger.textContent = "\u2630";
    }
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      burger.textContent = open ? "\u2715" : "\u2630";
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.innerWidth <= 1100) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { close(); burger.focus(); }
    });
  }
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Stamp the form start time for the spam timing check.
  document.querySelectorAll("form[data-endpoint]").forEach(function (f) {
    var s = document.createElement("input");
    s.type = "hidden"; s.name = "formStartedAt"; s.value = String(Date.now());
    f.appendChild(s);
  });

  // Smooth scrolling for in-page links.
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  });
})();
