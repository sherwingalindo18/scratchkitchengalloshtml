/* Scratch Kitchen — static clone runtime.
   - desktop hover mega-menu (Menu / Private Events / Order & Reserve / Our Story)
   - header turns solid white (paper) with dark text when a dropdown is open,
     the page is scrolled, or the mobile drawer is open
   - mobile hamburger drawer
   - scroll-reveal fade-ins
*/
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector("header");
    var nav = header ? header.querySelector("nav") : null;

    /* ----- Header light/solid state ----- */
    var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("ul.lg\\:flex a")) : [];
    var orderBtn = nav ? nav.querySelector('a[href$="/order"].btn-ghost-light, a[href$="/order"].btn-ghost') : null;
    var burger = nav ? nav.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]') : null;
    var state = { scrolled: false, dropdown: false, mobile: false };

    function applyHeader() {
      if (!header) return;
      var solid = state.scrolled || state.dropdown || state.mobile;
      if (solid) {
        header.classList.remove("bg-transparent");
        header.classList.add("bg-paper/95", "backdrop-blur");
        header.style.boxShadow = "0 1px 0 rgba(26,24,19,0.08)";
      } else {
        header.classList.add("bg-transparent");
        header.classList.remove("bg-paper/95", "backdrop-blur");
        header.style.boxShadow = "";
      }
      navLinks.forEach(function (a) {
        a.classList.toggle("text-cream/85", !solid);
        a.classList.toggle("hover:text-cream", !solid);
        a.classList.toggle("text-ink-soft", solid);
        a.classList.toggle("hover:text-brass-deep", solid);
      });
      if (orderBtn) {
        orderBtn.classList.toggle("btn-ghost-light", !solid);
        orderBtn.classList.toggle("btn-ghost", solid);
      }
      if (burger) {
        burger.classList.toggle("text-cream", !solid);
        burger.classList.toggle("text-ink", solid);
      }
    }

    /* ----- Desktop hover mega-menu ----- */
    var stage = document.getElementById("nav-dropdown");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("a[data-nav]"));
    var panels = stage ? Array.prototype.slice.call(stage.querySelectorAll(".dd-panel")) : [];
    var closeTimer = null;

    function openDropdown(i) {
      if (!stage) return;
      window.clearTimeout(closeTimer);
      stage.classList.remove("pointer-events-none", "-translate-y-2", "opacity-0");
      stage.classList.add("pointer-events-auto", "translate-y-0", "opacity-100");
      panels.forEach(function (p) { p.classList.toggle("hidden", p.getAttribute("data-panel") !== String(i)); });
      triggers.forEach(function (t) {
        var active = t.getAttribute("data-nav") === String(i);
        t.setAttribute("aria-expanded", active ? "true" : "false");
        var chev = t.querySelector(".dd-chevron");
        if (chev) chev.style.transform = active ? "rotate(180deg)" : "";
      });
      state.dropdown = true; applyHeader();
    }
    function closeDropdown() {
      if (!stage) return;
      stage.classList.add("pointer-events-none", "-translate-y-2", "opacity-0");
      stage.classList.remove("pointer-events-auto", "translate-y-0", "opacity-100");
      triggers.forEach(function (t) {
        t.setAttribute("aria-expanded", "false");
        var chev = t.querySelector(".dd-chevron");
        if (chev) chev.style.transform = "";
      });
      state.dropdown = false; applyHeader();
    }
    function scheduleClose() { window.clearTimeout(closeTimer); closeTimer = window.setTimeout(closeDropdown, 140); }

    triggers.forEach(function (t) {
      var i = t.getAttribute("data-nav");
      t.addEventListener("mouseenter", function () { openDropdown(i); });
      t.addEventListener("focus", function () { openDropdown(i); });
      t.addEventListener("mouseleave", scheduleClose);
    });
    document.querySelectorAll("header nav a:not([data-nav]), header nav button").forEach(function (el) {
      el.addEventListener("mouseenter", scheduleClose);
    });
    if (stage) {
      stage.addEventListener("mouseenter", function () { window.clearTimeout(closeTimer); });
      stage.addEventListener("mouseleave", scheduleClose);
    }
    if (header) header.addEventListener("mouseleave", closeDropdown);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDropdown(); });

    /* ----- Mobile drawer ----- */
    var toggle = document.querySelector('button[aria-label="Open menu"]');
    var drawer = document.querySelector('div[class*="top-[4.75rem]"][class*="lg:hidden"]');
    function setDrawer(open) {
      if (!drawer || !toggle) return;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.classList.toggle("pointer-events-none", !open);
      drawer.classList.toggle("opacity-0", !open);
      drawer.classList.toggle("opacity-100", open);
      document.body.style.overflow = open ? "hidden" : "";
      var bars = toggle.querySelectorAll("span > span");
      if (bars.length === 3) {
        bars[0].style.transform = open ? "translateY(8px) rotate(45deg)" : "";
        bars[1].style.opacity = open ? "0" : "1";
        bars[2].style.transform = open ? "translateY(-8px) rotate(-45deg)" : "";
      }
      state.mobile = open; applyHeader();
    }
    if (toggle && drawer) {
      var mopen = false;
      toggle.addEventListener("click", function () { mopen = !mopen; setDrawer(mopen); });
      drawer.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { mopen = false; setDrawer(false); });
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mopen) { mopen = false; setDrawer(false); } });
    }

    /* ----- Scroll reveal ----- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (reveals.length) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
          });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
        reveals.forEach(function (el) { io.observe(el); });
        window.setTimeout(function () {
          reveals.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top < (window.innerHeight || 800) && r.bottom > 0) el.classList.add("is-visible");
          });
        }, 600);
      } else {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
      }
    }

    /* ----- Scroll watcher ----- */
    function onScroll() { state.scrolled = window.scrollY > 24; applyHeader(); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  });
})();
