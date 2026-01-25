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
      try {
        lightbox = new (
          typeof PhotoSwipeLightbox !== "undefined"
            ? PhotoSwipeLightbox
            : window.PhotoSwipeLightbox
        )({
          dataSource: pswpItems,
          showHideAnimationType: "zoom",
          // pswpModule: PhotoSwipe // optional; UMD will use global
        });
        lightbox.init();
      } catch (err) {
        console.warn("PhotoSwipeLightbox init failed:", err);
        lightbox = null;
      }

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
