// Form handling for Golden Healing Solutions.
// Validates in the browser and submits to Netlify Forms (static hosting has no
// application server). Netlify stores each submission and can email-notify the owner.
(function () {
  "use strict";
  var SUCCESS = "Thank you for contacting Golden Healing Solutions! Your inquiry has been submitted successfully. " +
    "Our team will review your moving or logistics request and follow up using your preferred contact method.";
  var FAIL = "We couldn't submit your inquiry right now. Please try again or contact us directly at " +
    "info@goldenhealingsolutions.com or 470-313-9473.";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  var MIN_MS = 1800;

  function fieldOf(form, name) { return form.querySelector('[name="' + name + '"]'); }

  function setErr(form, name, msg) {
    var el = fieldOf(form, name);
    var box = form.querySelector('[data-err-for="' + name + '"]');
    if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    if (box) { box.textContent = msg || ""; box.classList.toggle("hide", !msg); }
  }

  function clearErrs(form) {
    form.querySelectorAll("[data-err-for]").forEach(function (p) { p.textContent = ""; p.classList.add("hide"); });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }

  function setStatus(form, kind, msg) {
    var box = form.querySelector(".alert[role='status']");
    if (!box) return;
    box.className = "alert " + kind;
    box.textContent = msg;
    box.classList.remove("hide");
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== "formStartedAt") data[k] = v; });
    var c = fieldOf(form, "consent");
    data.consent = !!(c && c.checked);
    var s = fieldOf(form, "formStartedAt");
    if (s) data.formStartedAt = Number(s.value) || 0;
    return data;
  }

  function validate(form, d) {
    var e = {};
    if (!d.name || String(d.name).trim().length < 2) e.name = "Please enter your full name.";
    if (!d.email || !EMAIL_RE.test(String(d.email).trim())) e.email = "Please enter a valid email address.";
    if (d.phone && String(d.phone).replace(/\D/g, "").length < 7) e.phone = "Please check the phone number, or leave it blank.";
    if (fieldOf(form, "service") && !d.service) e.service = "Please select the service you are requesting.";
    if (fieldOf(form, "inquiryType") && !d.inquiryType) e.inquiryType = "Please select an inquiry type.";
    if (fieldOf(form, "itemType") && !d.itemType) e.itemType = "Please select an item type.";
    if (fieldOf(form, "position") && !d.position) e.position = "Please select the position you are applying for.";
    if (fieldOf(form, "workAuth") && !d.workAuth) e.workAuth = "Please tell us whether you are authorized to work in the U.S.";
    if (fieldOf(form, "quantity") && !d.quantity) e.quantity = "Please enter a quantity.";
    if (fieldOf(form, "pickupLocation") && !d.pickupLocation) e.pickupLocation = "Please enter the pickup location.";
    if (fieldOf(form, "destination") && !d.destination) e.destination = "Please enter the destination.";
    if (fieldOf(form, "requestedDate") && !d.requestedDate) e.requestedDate = "Please choose a requested date.";
    if (fieldOf(form, "message") && (!d.message || String(d.message).trim().length < 10)) {
      e.message = "Please tell us a little about your request (at least 10 characters).";
    }
    if (fieldOf(form, "consent") && !d.consent) e.consent = "Please confirm you understand this is an inquiry only.";
    var picker = form.querySelector("[data-photo-picker]");
    if (picker && picker.files && picker.files.length) {
      if (picker.files.length > 3) {
        e.photos = "Please choose up to 3 photos.";
      } else {
        var total = 0, badType = false, i, f;
        for (i = 0; i < picker.files.length; i++) {
          f = picker.files[i];
          if (f.type && f.type.indexOf("image/") !== 0) badType = true;
          total += f.size || 0;
        }
        if (badType) e.photos = "Photos must be image files (JPG, PNG, etc.).";
        else if (total > 7800000) e.photos = "Please keep your photos under 8 MB in total.";
      }
    }
    return e;
  }

  function attach(form) {
    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.textContent : "";
    var sending = false;

    // Conditional transportation fields.
    var typeSel = form.querySelector('[name="inquiryType"]');
    var block = document.getElementById("transportFields");
    if (typeSel && block) {
      var sync = function () {
        var needs = ["Furniture Transportation", "Logistics and Delivery"].indexOf(typeSel.value) > -1;
        block.classList.toggle("hide", !needs);
        ["cf-pickup", "cf-dest"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.required = needs;
        });
      };
      typeSel.addEventListener("change", sync);
      sync();
    }

    form.addEventListener("input", function (e) { if (e.target.name) setErr(form, e.target.name, ""); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      clearErrs(form);
      var d = collect(form);

      if (d.website) { setStatus(form, "ok", SUCCESS); return; }

      var errs = validate(form, d);
      if (Object.keys(errs).length) {
        Object.keys(errs).forEach(function (k) { setErr(form, k, errs[k]); });
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        setStatus(form, "err", "Please correct the highlighted fields and submit again.");
        return;
      }

      if (d.formStartedAt && Date.now() - d.formStartedAt < MIN_MS) {
        setStatus(form, "err", "Please take a moment to review your details, then submit again.");
        var s = fieldOf(form, "formStartedAt");
        if (s) s.value = String(Date.now() - MIN_MS - 1000);
        return;
      }

      sending = true;
      if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); button.textContent = "Sending…"; }
      setStatus(form, "info", "Sending your inquiry…");

      var picker = form.querySelector("[data-photo-picker]");
      if (picker && picker.files && picker.files.length) {
        var slots = form.querySelectorAll("[data-photo-slot]");
        for (var si = 0; si < slots.length; si++) {
          var dt = new DataTransfer();
          if (picker.files[si]) dt.items.add(picker.files[si]);
          slots[si].files = dt.files;
        }
      }

      var fd = new FormData(form);
      fd.delete("formStartedAt");

      fetch(window.location.pathname, { method: "POST", body: fd })
        .then(function (res) {
          if (res.ok) {
            setStatus(form, "ok", SUCCESS);
            form.reset();
            clearErrs(form);
            var f = fieldOf(form, "formStartedAt");
            if (f) f.value = String(Date.now());
            var box = form.querySelector(".alert[role='status']");
            if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            setStatus(form, "err", FAIL);
          }
        })
        .catch(function () { setStatus(form, "err", FAIL); })
        .then(function () {
          sending = false;
          if (button) { button.disabled = false; button.removeAttribute("aria-busy"); button.textContent = label; }
        });
    });
  }

  document.querySelectorAll("form[data-netlify]").forEach(attach);

  document.querySelectorAll("[data-photo-picker]").forEach(function (picker) {
    picker.addEventListener("change", function () {
      var hint = document.getElementById("qf-photos-hint");
      var n = picker.files ? picker.files.length : 0;
      if (hint) {
        hint.textContent = n === 0
          ? "A few photos help us quote accurately — large furniture, fragile items, or tight spaces, for example. Images only, up to 3 photos."
          : n + (n === 1 ? " photo selected." : " photos selected.");
      }
      var box = picker.closest("form").querySelector('[data-err-for="photos"]');
      if (box) { box.textContent = ""; box.classList.add("hide"); }
      picker.removeAttribute("aria-invalid");
    });
  });
})();
