// Photoswipe initializer for Industrial gallery
document.addEventListener("DOMContentLoaded", function () {
  var galleryEl = document.getElementById("industrial-gallery");
  if (!galleryEl) return;

  fetch("/r2/data/industrial.json")
    .then(function (r) {
      return r.json();
    })
    .then(async function (data) {
      // render thumbnails
      data.forEach(function (item, idx) {
        var a = document.createElement("a");
        a.className = "portfolio-item thumb-link";
        a.href = item.full;
        a.dataset.index = idx;

        var imgWrap = document.createElement("div");
        imgWrap.className = "portfolio-image";
        var img = document.createElement("img");
        img.src = item.thumb;
        img.alt = item.alt || "";
        imgWrap.appendChild(img);

        var content = document.createElement("div");
        content.className = "portfolio-content";
        content.innerHTML = "<h3>" + (item.alt || "") + "</h3>";

        a.appendChild(imgWrap);
        a.appendChild(content);
        galleryEl.appendChild(a);
      });

      // ensure width/height for each item by measuring the full image if needed
      async function ensureSize(item) {
        if (item.w && item.h) return item;
        return new Promise(function (resolve) {
          var img = new Image();
          img.onload = function () {
            resolve(
              Object.assign({}, item, {
                w: img.naturalWidth,
                h: img.naturalHeight,
              }),
            );
          };
          img.onerror = function () {
            resolve(Object.assign({}, item, { w: 1200, h: 800 }));
          };
          img.src = item.full;
        });
      }

      var items = await Promise.all(data.map(ensureSize));

      // build PhotoSwipe datasource
      var pswpItems = items.map(function (it) {
        return {
          src: it.full,
          msrc: it.thumb,
          w: it.w,
          h: it.h,
          title: it.caption || "",
        };
      });

      // initialize PhotoSwipe Lightbox scoped to this page (try/catch in case CDN didn't load)
      var lightbox = null;
      var __r2_caption_interval = null;
      var __r2_caption_logged = false;
      var __r2_caption_logged = false;
      (function tryInitPhotoSwipe() {
        // Try several common global shapes (UMD or ESM-attached-to-window)
        var candidate = null;
        try {
          if (typeof window.PhotoSwipeLightbox === 'function') candidate = window.PhotoSwipeLightbox;
          else if (window.PhotoSwipeLightbox && typeof window.PhotoSwipeLightbox.default === 'function') candidate = window.PhotoSwipeLightbox.default;
          else if (window.PhotoSwipe && typeof window.PhotoSwipe.PhotoSwipeLightbox === 'function') candidate = window.PhotoSwipe.PhotoSwipeLightbox;
          else if (window.PhotoSwipe && window.PhotoSwipe.default && typeof window.PhotoSwipe.default.PhotoSwipeLightbox === 'function') candidate = window.PhotoSwipe.default.PhotoSwipeLightbox;
        } catch (e) {
          console.warn('PhotoSwipe detection threw', e);
        }

        if (!candidate) {
          console.warn('PhotoSwipeLightbox constructor not found on window. PhotoSwipe may be blocked or the wrong bundle was loaded. Available globals:', { PhotoSwipeLightbox: window.PhotoSwipeLightbox, PhotoSwipe: window.PhotoSwipe });
          lightbox = null;
          return;
        }

        try {
          // If a UMD PhotoSwipe is present on window, pass it explicitly as pswpModule
          var detectedPswpModule = null;
          if (typeof window.PhotoSwipe === 'function' || typeof window.PhotoSwipe === 'object') detectedPswpModule = window.PhotoSwipe;
          else if (window.PhotoSwipe && typeof window.PhotoSwipe.default === 'function') detectedPswpModule = window.PhotoSwipe.default;

          var lightboxOpts = {
            dataSource: pswpItems,
            showHideAnimationType: 'zoom'
          };
          if (detectedPswpModule) lightboxOpts.pswpModule = detectedPswpModule;

          lightbox = new candidate(lightboxOpts);
          lightbox.init();

          // expose for debugging and add a short, bounded polling fallback
          try { window.__r2_lightbox = lightbox; } catch (e) {}
          var __r2_poll_handle = null;
          function startShortPolling(durationMs) {
            try {
              if (typeof durationMs !== 'number') durationMs = 1200;
              if (__r2_poll_handle) { try { clearInterval(__r2_poll_handle); } catch (e) {} __r2_poll_handle = null; }
              var elapsed = 0;
              var interval = 80;
              __r2_poll_handle = setInterval(function () {
                try {
                  var pswpEl = document.querySelector('.pswp');
                  if (!pswpEl) { elapsed += interval; if (elapsed > durationMs) { try { clearInterval(__r2_poll_handle); } catch (e) {} __r2_poll_handle = null; } return; }
                  var src = findVisibleSrc();
                  var mi = matchSrcToIndex(src);
                  if (mi === -1) mi = (typeof window.__r2_last_open_idx === 'number') ? window.__r2_last_open_idx : 0;
                  setCaptionForIndex(mi);
                } catch (e) {}
                elapsed += interval;
                if (elapsed > durationMs) { try { clearInterval(__r2_poll_handle); } catch (e) {} __r2_poll_handle = null; }
              }, interval);
            } catch (e) {}
          }
          function stopShortPolling() { try { if (__r2_poll_handle) { clearInterval(__r2_poll_handle); __r2_poll_handle = null; } } catch (e) {} }

          // Helper utilities for deterministic caption mapping
          function normalizeUrl(u) {
            try { var url = new URL(u, window.location.href); return url.pathname.replace(/\/+$/, '') + (url.search || ''); } catch (e) { return (u || '').split('?')[0]; }
          }
          function basename(u) { try { return new URL(u, window.location.href).pathname.split('/').pop(); } catch (e) { var s=(u||'').split('/'); return s[s.length-1]; } }
          function matchSrcToIndex(src) {
            if (!src) return -1;
            try {
              var norm = normalizeUrl(src);
              var base = basename(src);
              for (var i = 0; i < pswpItems.length; i++) { try { if (!pswpItems[i] || !pswpItems[i].src) continue; if (normalizeUrl(pswpItems[i].src) === norm) return i; } catch (e) {} }
              for (var j = 0; j < pswpItems.length; j++) { try { if (!pswpItems[j] || !pswpItems[j].src) continue; if (basename(pswpItems[j].src) === base) return j; } catch (e) {} }
              for (var k = 0; k < pswpItems.length; k++) { try { if (!pswpItems[k] || !pswpItems[k].src) continue; var s = pswpItems[k].src + ''; if (s.length > 6 && (src.indexOf(s) !== -1 || s.indexOf(src) !== -1)) return k; } catch (e) {} }
            } catch (e) {}
            return -1;
          }

          function findVisibleSrc() {
            try {
              var pswpEl = document.querySelector('.pswp');
              if (!pswpEl) return '';
              var imgs = pswpEl.querySelectorAll('.pswp__img');
              for (var k = 0; k < imgs.length; k++) {
                var im = imgs[k];
                var slide = im.closest('.pswp__item, .pswp__slide, .pswp__container');
                if (slide) {
                  try { var ah = slide.getAttribute('aria-hidden'); if (ah === 'false') return im.currentSrc || im.src || im.getAttribute('src') || ''; } catch (e) {}
                }
              }
              var best = null, bestArea = 0;
              for (var m = 0; m < imgs.length; m++) {
                var img2 = imgs[m];
                var w = img2.naturalWidth || img2.width || img2.clientWidth || 0;
                var h = img2.naturalHeight || img2.height || img2.clientHeight || 0;
                var area = (w || 0) * (h || 0);
                if (area > bestArea) { bestArea = area; best = img2; }
              }
              if (best) return best.currentSrc || best.src || best.getAttribute('src') || '';
            } catch (e) {}
            return '';
          }

          var __r2_transient_timer = null;
          function transientCaptionForce(i) {
            try {
              if (typeof i !== 'number') return;
              // clear any existing transient timer
              try { if (__r2_transient_timer) { clearInterval(__r2_transient_timer); __r2_transient_timer = null; } } catch (e) {}
              var attempts = 0;
              __r2_transient_timer = setInterval(function () {
                attempts++;
                try { setCaptionForIndex(i); } catch (e) {}
                if (attempts > 9) { try { clearInterval(__r2_transient_timer); __r2_transient_timer = null; } catch (e) {} }
              }, 80); // fire ~10 times over ~800ms
            } catch (e) {}
          }

          function setCaptionForIndex(i) {
            try {
              if (typeof i !== 'number' || i < 0 || i >= pswpItems.length) return false;
              var pswpEl = document.querySelector('.pswp');
              if (!pswpEl) return false;
              var capCenter = pswpEl.querySelector('.pswp__caption__center');
              var cap = capCenter || pswpEl.querySelector('.pswp__caption');
              if (!cap) return false;
              var newTitle = pswpItems[i] ? (pswpItems[i].title || '') : '';
              if ((cap.innerHTML || '') !== newTitle) cap.innerHTML = newTitle;
              return true;
            } catch (e) { return false; }
          }

          // Prefer event hooks from PhotoSwipe Lightbox if available
          try {
            var __r2_pswp_container_observer = null;
            if (typeof lightbox.on === 'function') {
              try {
                lightbox.on('open', function (ev) {
                  var idx = null;
                  try { if (ev && ev.detail && typeof ev.detail.index === 'number') idx = ev.detail.index; else if (ev && typeof ev.index === 'number') idx = ev.index; } catch (e) {}
                  if (idx === null && typeof window.__r2_last_open_idx === 'number') idx = window.__r2_last_open_idx;
                    if (typeof idx === 'number') {
                    window.__r2_last_open_idx = idx;
                    // immediate set; if it fails (caption node not yet present), retry via several fallbacks
                    var ok = false;
                    try { ok = setCaptionForIndex(idx); } catch (e) { ok = false; }
                    if (!ok) {
                      // Ensure native caption node exists (create if needed)
                      try { if (window.__r2_ensureNativeCaption) window.__r2_ensureNativeCaption(); } catch (e) {}
                      // transient aggressive forcing (fires repeatedly for ~800ms)
                      try { transientCaptionForce(idx); } catch (e) {}
                      // longer short polling to cover delayed internal swaps
                      try { startShortPolling(1600); } catch (e) {}
                      // pswp-level MutationObserver to catch creation of caption node
                      try {
                        var pswpRoot = document.querySelector('.pswp');
                        if (pswpRoot) {
                          var found = false;
                          var po = new MutationObserver(function (mutList) {
                            try {
                              if (setCaptionForIndex(idx)) { found = true; try { po.disconnect(); } catch (e) {} }
                            } catch (e) {}
                          });
                          po.observe(pswpRoot, { childList: true, subtree: true });
                          // safety timeout
                          setTimeout(function () { try { if (!found) po.disconnect(); } catch (e) {} }, 1800);
                        }
                      } catch (e) {}
                    }

                    // short-lived MutationObserver: wait for caption node or img to appear, then set and disconnect
                    try {
                      var pswpRoot = document.querySelector('.pswp');
                      if (pswpRoot) {
                          try {
                            var container = pswpRoot.querySelector('.pswp__container');
                            if (container) {
                              try { if (__r2_pswp_container_observer) { try { __r2_pswp_container_observer.disconnect(); } catch (e) {} __r2_pswp_container_observer = null; } } catch (e) {}
                              var contObserver = new MutationObserver(function () {
                                try {
                                  var src = findVisibleSrc();
                                  var mi = matchSrcToIndex(src);
                                  if (mi === -1) mi = idx;
                                  console.info('r2: container observer detected change; visibleSrc=', src, 'matchedIdx=', mi);
                                  setCaptionForIndex(mi);
                                } catch (e) {}
                              });
                              contObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-hidden', 'style'] });
                              __r2_pswp_container_observer = contObserver;
                            }
                          } catch (e) {}
                          setTimeout(function () { try { setCaptionForIndex(idx); } catch (e) {} }, 350);
                        }
                    } catch (e) {}
                  }
                });
              } catch (e) {}
              try {
                lightbox.on('change', function (ev) {
                  var idx = null;
                  try { if (ev && ev.detail && typeof ev.detail.index === 'number') idx = ev.detail.index; else if (ev && typeof ev.index === 'number') idx = ev.index; } catch (e) {}
                    if (typeof idx === 'number') {
                    setCaptionForIndex(idx);
                    transientCaptionForce(idx);
                    try { startShortPolling(900); } catch (e) {}
                    console.info('r2: change event, idx=', idx);
                    return;
                  }
                  // fallback: map visible src
                  try { var src = findVisibleSrc(); var mi = matchSrcToIndex(src); if (mi !== -1) setCaptionForIndex(mi); } catch (e) {}
                });
              } catch (e) {}
              try { lightbox.on('close', function () { try { if (__r2_pswp_container_observer) { __r2_pswp_container_observer.disconnect(); __r2_pswp_container_observer = null; } } catch (e) {} }); } catch (e) {}
            }
          } catch (e) {}

          // diagnostics removed: caption handling will use event hooks and the ensureNativeCaption helper

          // If the PhotoSwipe UI doesn't create a caption node (some builds/configs omit it),
          // create a native-style `.pswp__caption .pswp__caption__center` inside the UI
          try {
            var ensureNativeCaption = function () {
              var pswpEl = document.querySelector('.pswp');
              if (!pswpEl) return;
              var ui = pswpEl.querySelector('.pswp__ui');
              // If no ui container present, append caption directly to .pswp
              var host = ui || pswpEl;
              if (host.querySelector('.pswp__caption__center') || host.querySelector('.pswp__caption')) return;

              var cap = document.createElement('div');
              cap.className = 'pswp__caption';
              var center = document.createElement('div');
              center.className = 'pswp__caption__center';
              center.innerHTML = '';
              try {
                // ensure newly-created caption elements have strong inline styles so they render above the image
                var cssBlobHost = 'position: absolute !important; left: 0 !important; right: 0 !important; bottom: 14px !important; margin: 0 auto !important; text-align: center !important; z-index: 100001 !important; background: rgba(0,0,0,0.72) !important; color: #ffffff !important; padding: 10px 14px !important; border-radius: 8px !important; box-shadow: 0 8px 30px rgba(0,0,0,0.45) !important; opacity: 1 !important; visibility: visible !important;';
                cap.style.cssText = (cap.style.cssText || '') + cssBlobHost;
                center.style.cssText = (center.style.cssText || '') + cssBlobHost;
              } catch (e) {}
              cap.appendChild(center);
              host.appendChild(cap);

              // caption observer removed; caption updates are handled by PhotoSwipe events

              // removed polling updater; rely on PhotoSwipe events to drive caption updates
            };

            var pswpCreateObserver = new MutationObserver(function () {
              if (document.querySelector('.pswp')) ensureNativeCaption();
            });
            pswpCreateObserver.observe(document.documentElement, { childList: true, subtree: true });

            // expose a quick helper so callers can force creation immediately after open
            try { window.__r2_ensureNativeCaption = ensureNativeCaption; } catch (e) {}
          } catch (e) {
            console.warn('r2: ensureNativeCaption failed', e);
          }
        } catch (err) {
          console.warn('PhotoSwipeLightbox init failed:', err, 'Constructor candidate:', candidate);
          lightbox = null;
        }
      })();

      // Helper: create a simple fallback overlay (framed image + caption + close)
      function showFallbackOverlay(idx, trigger) {
        // remove existing
        var existingOverlay = document.querySelector(".r2-fallback-overlay");
        if (existingOverlay) existingOverlay.remove();

        var item = pswpItems[idx];
        var overlay = document.createElement("div");
        overlay.className = "r2-fallback-overlay";
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(0,0,0,0.85)";
        overlay.style.zIndex = "14000";

        var content = document.createElement("div");
        content.style.maxWidth = "92%";
        content.style.textAlign = "center";
        var img = document.createElement("img");
        img.src = item.src;
        img.alt = item.title || "";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "78vh";
        img.style.border = "10px solid #fff";
        img.style.borderRadius = "6px";
        img.style.boxShadow = "0 20px 50px rgba(0,0,0,0.6)";
        var cap = document.createElement("div");
        cap.className = "r2-pswp-caption";
        cap.innerHTML = item.title || "";
        var btn = document.createElement("button");
        btn.className = "r2-pswp-close";
        btn.innerHTML = "✕";
        btn.style.position = "fixed";
        btn.style.top = "18px";
        btn.style.right = "18px";

        content.appendChild(img);
        content.appendChild(cap);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        document.body.appendChild(btn);

        function cleanup() {
          try {
            overlay.remove();
          } catch (e) {}
          try {
            btn.remove();
          } catch (e) {}
          try {
            trigger && trigger.focus();
          } catch (e) {}
        }
        btn.addEventListener("click", cleanup);
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) cleanup();
        });
      }

      // open on thumbnail click at correct index and remember trigger for focus return
      galleryEl.addEventListener("click", function (e) {
        var a = e.target.closest("a.thumb-link");
        if (!a) return;
        e.preventDefault();
        var idx = Number(a.dataset.index) || 0;
        // if PhotoSwipe initialized, open it
        if (lightbox) {
          try {
            lightbox._lastTrigger = a;
            lightbox.loadAndOpen(idx);

            // Request the helper to ensure a native PhotoSwipe caption node exists
            try {
              if (window.__r2_ensureNativeCaption) window.__r2_ensureNativeCaption();
              setTimeout(function () { try { if (window.__r2_ensureNativeCaption) window.__r2_ensureNativeCaption(); } catch (e) {} }, 160);
            } catch (e) { console.warn('r2: ensureNativeCaption call failed', e); }

            // Use event hooks and a single delayed caption set rather than polling
            try {
              try { if (window.__r2_ensureNativeCaption) window.__r2_ensureNativeCaption(); } catch (e) {}
              try { setTimeout(function () { try { setCaptionForIndex(idx); } catch (e) {} }, 220); } catch (e) {}
            } catch (e) { console.warn('r2: failed to set caption after open', e); }
          } catch (err) {
            console.warn("lightbox open failed", err);
            showFallbackOverlay(idx, a);
          }
        } else {
          // fallback overlay if lightbox not available
          showFallbackOverlay(idx, a);
        }
      });
    })
    .catch(function (err) {
      console.error("Failed to load industrial JSON", err);
    });
});

