// Interactive helpers for r2 index: year, mobile menu, smooth scroll
document.addEventListener("DOMContentLoaded", function () {
  // set year if present
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu toggle (MerWare-style)
  var mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("active");
      });
    });
  }

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
