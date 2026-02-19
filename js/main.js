// SEARCH NOTE: "ToBeDeleted-- <PhotoSwipe> or <getElementById("year")> noLongerInUse"
// appears in two commented regions below:
// 1) `getElementById("year")` block in the DOMContentLoaded helper
// 2) Legacy PhotoSwipe sizing/mutation observer block near end of file

// Mobile nav drawer + general helpers for r2
(function () {
  const nav = document.querySelector(".topnav");
  const toggle = document.querySelector(".mobile-menu-toggle");
  const links = document.getElementById("nav-links");
  if (!nav || !toggle || !links) return;

  const mq = window.matchMedia("(max-width:800px)");

  function isMobile() {
    return mq.matches;
  }

  // Ensure the UI matches the expected mobile/desktop state even if CSS
  // cascade prevents the media-query rules from taking effect. This sets
  // inline styles as a last-resort enforcement so the hamburger only
  // appears on small screens and the nav is off-canvas until opened.
  function syncUI() {
    if (isMobile()) {
      toggle.style.display = "inline-block";
      links.style.position = "fixed";
      // calculate drawer position so it appears adjacent to the toggle
      const rect = toggle.getBoundingClientRect();
      const drawerW = 260;
      const gap = 20; // px between drawer and toggle (inset from viewport)
      // decide which side of the toggle to place the drawer and anchor under the toggle
      const toggleCenter = rect.left + rect.width / 2;
      const screenCenter = window.innerWidth / 2;
      const placeLeft = toggleCenter > screenCenter; // place drawer to left when toggle on right

      // Prefer anchoring to the viewport edge when toggle is on the right
      if (placeLeft) {
        // anchor drawer to right edge with an inset gap
        links.style.left = "";
        links.style.setProperty("right", gap + "px", "important");
      } else {
        // anchor drawer to left of toggle
        let leftPos = Math.round(rect.right + gap);
        if (leftPos < 16) leftPos = 16;
        if (leftPos + drawerW > window.innerWidth - 16)
          leftPos = Math.max(16, window.innerWidth - drawerW - 16);
        links.style.right = "";
        links.style.setProperty("left", leftPos + "px", "important");
      }
      // compute a content-driven width so the drawer isn't excessively wide
      const anchors = Array.from(links.querySelectorAll("a"));
      const contentMax = anchors.length
        ? Math.max(...anchors.map((a) => Math.ceil(a.scrollWidth)))
        : 120;
      const pad = 28; // left+right padding inside drawer (matches CSS 14px each side)
      const minW = 120;
      const maxW = drawerW; // use previous drawerW as max
      const preferred = contentMax + pad;
      const widthPx = Math.min(maxW, Math.max(minW, preferred));
      links.style.setProperty("width", widthPx + "px", "important");

      // Enforce padding + box-sizing so computed width and visual inset match
      links.style.boxSizing = "border-box";
      links.style.setProperty("padding-left", "14px", "important");
      links.style.setProperty("padding-right", "14px", "important");

      // position drawer immediately below the toggle (not the hero)
      const toggleBottom = Math.round(rect.bottom);
      links.style.top = toggleBottom + 4 + "px";
      const availH = Math.max(120, window.innerHeight - toggleBottom - 12);
      // use auto height but constrain with max-height so drawer doesn't cover entire viewport
      links.style.height = "auto";
      links.style.setProperty("max-height", availH + "px", "important");
      links.style.overflowY = "auto";
      links.style.zIndex = 2200;

      // ensure visible dark background for contrast
      links.style.background = "rgba(0,0,0,0.76)";
      links.style.boxShadow = "0 8px 30px rgba(0,0,0,0.45)";
      links.style.borderRadius = "8px";
      // use a small vertical translate for show/hide so it appears attached to the toggle
      links.style.setProperty(
        "transition",
        "transform 220ms ease, opacity 180ms ease",
        "important",
      );
      links.style.transform = nav.classList.contains("nav-open")
        ? "translateY(0)"
        : "translateY(-6px)";
      links.style.opacity = nav.classList.contains("nav-open") ? "1" : "0";
      links.style.pointerEvents = nav.classList.contains("nav-open")
        ? "auto"
        : "none";
    } else {
      // desktop: hide toggle and restore nav inline
      toggle.style.display = "none";
      links.style.position = "";
      links.style.left = "";
      links.style.right = "";
      links.style.transform = "";
      links.style.opacity = "";
      links.style.pointerEvents = "";
      links.style.width = "";
      links.style.top = "";
      links.style.height = "";
    }
  }

  function setExpanded(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    links.setAttribute("aria-hidden", open ? "false" : "true");
    nav.classList.toggle("nav-open", !!open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const first = links.querySelector("a");
      if (first) first.focus();
    } else {
      toggle.focus();
    }
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    setExpanded(opening);
    // make sure inline styles reflect the new state immediately
    syncUI();
  });

  // close when a nav link clicked (mobile)
  links.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "a" && isMobile()) {
      setExpanded(false);
      // sync UI to hide drawer immediately
      syncUI();
    }
  });

  // outside click
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!nav.contains(e.target)) setExpanded(false);
  });

  // escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobile()) setExpanded(false);
  });

  mq.addEventListener("change", (ev) => {
    // when breakpoint changes, reset and sync UI
    setExpanded(false);
    syncUI();
  });

  // initial state
  links.setAttribute("aria-hidden", "true");
  setExpanded(false);
  // enforce UI once on load
  syncUI();
  // keep UI in sync if the user resizes the window
  window.addEventListener("resize", function () {
    syncUI();
  });
})();

// Interactive helpers for r2 index: year and smooth scroll
document.addEventListener("DOMContentLoaded", function () {
  /* ToBeDeleted-- <PhotoSwipe> or <getElementById("year")> noLongerInUse
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  */

  // Smooth scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

/* ToBeDeleted-- <PhotoSwipe> or <getElementById("year")> noLongerInUse
// PhotoSwipe sizing and UI adjustments: ensure captions have room and images fit on small screens
(function () {
  function adjustPhotoswipeSizing() {
    const pswp = document.querySelector(".pswp");
    if (!pswp) return;
    const caption = pswp.querySelector(
      ".pswp__caption, .pswp__caption__center, .r2-pswp-caption",
    );
    const captionH = caption ? caption.offsetHeight : 72;
    const controlsPad = 56; // extra room for close button / UI
    const safe = captionH + controlsPad;
    pswp.querySelectorAll(".pswp__img, .pswp__zoom-wrap img").forEach((img) => {
      img.style.maxHeight = `calc(100vh - ${safe}px)`;
      img.style.objectFit = "contain";
    });
    // ensure close button z-index
    const close = pswp.querySelector(
      ".pswp__button--close, .pswp__ui__button--close, .r2-pswp-close",
    );
    if (close) close.style.zIndex = 14050;
  }

  const mo = new MutationObserver((mutations) => {
    // when PhotoSwipe opens it injects nodes; run adjust after a short delay
    if (document.querySelector(".pswp")) setTimeout(adjustPhotoswipeSizing, 80);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", adjustPhotoswipeSizing);
  window.addEventListener("orientationchange", () =>
    setTimeout(adjustPhotoswipeSizing, 120),
  );
})();
*/
