(function () {
  var gallery = null;
  var captionEl = null;

  function safeText(s) {
    return s == null ? "" : String(s);
  }

  function buildThumbAnchor(item, idx) {
    var a = document.createElement("a");
    a.href = item.full;
    a.setAttribute("data-pswp-width", item.w || 1200);
    a.setAttribute("data-pswp-height", item.h || 800);
    a.setAttribute("data-title", safeText(item.caption));
    a.setAttribute("data-index", String(idx));
    var img = document.createElement("img");
    img.src = item.thumb;
    img.alt = item.alt || "";
    a.appendChild(img);
    return a;
  }

  function updateCaptionForIndex(i) {
    try {
      var a = gallery && gallery.querySelector('a[data-index="' + i + '"]');
      captionEl.textContent = a ? a.getAttribute("data-title") || "" : "";
    } catch (e) {
      if (captionEl) captionEl.textContent = "";
    }
  }

  function initFromJson() {
    gallery = document.getElementById("gallery");
    captionEl = document.getElementById("test-caption");
    if (!gallery) {
      console.error("test-init: #gallery not found");
      return;
    }

    fetch("data/industrial.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (list) {
        var items = (Array.isArray(list) ? list : []).slice(0, 3);
        try {
          console.info("test-init: JSON items", items.length);
        } catch (e) {}

        // clear any previous thumbnails so re-initializing replaces them
        try {
          gallery.innerHTML = "";
        } catch (e) {}
        items.forEach(function (it, i) {
          try {
            gallery.appendChild(buildThumbAnchor(it, i));
          } catch (err) {
            console.error("append failed", err);
          }
        });

        var anchors = Array.from(gallery.querySelectorAll("a"));

        function tryImportPhotoSwipeModules() {
          if (
            typeof PhotoSwipe !== "undefined" &&
            typeof PhotoSwipeLightbox !== "undefined"
          ) {
            return Promise.resolve([
              window.PhotoSwipe,
              window.PhotoSwipeLightbox,
            ]);
          }
          return Promise.all([
            import("https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js").catch(
              function () {
                return null;
              },
            ),
            import("https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js").catch(
              function () {
                return null;
              },
            ),
          ]).then(function (mods) {
            var ps = mods[0],
              lb = mods[1];
            var P = ps && (ps.default || ps.PhotoSwipe || ps);
            var L = lb && (lb.default || lb.PhotoSwipeLightbox || lb);
            if (P)
              try {
                window.PhotoSwipe = P;
              } catch (e) {}
            if (L)
              try {
                window.PhotoSwipeLightbox = L;
              } catch (e) {}
            return [P || window.PhotoSwipe, L || window.PhotoSwipeLightbox];
          });
        }

        tryImportPhotoSwipeModules()
          .then(function (mods) {
            var PS = mods[0],
              PSLB = mods[1],
              lightbox = null;
            try {
              console.info("test-init: PhotoSwipe?", !!PS, "Lightbox?", !!PSLB);
            } catch (e) {}
            if (PS && PSLB) {
              try {
                lightbox = new PSLB({
                  gallery: "#gallery",
                  children: "a",
                  pswpModule: PS,
                });
                lightbox.init();
                window.__test_lightbox = lightbox;
              } catch (e) {
                console.warn("init failed", e);
              }
            }

            // Minimal fallback viewer
            var fb = null,
              fbIdx = 0;
            function createFB() {
              if (fb) return fb;
              var o = document.createElement("div");
              o.style.cssText =
                "position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:99999";
              var inner = document.createElement("div");
              inner.style.cssText =
                "position:relative;max-width:95%;max-height:95%;text-align:center;color:#fff";
              var im = document.createElement("img");
              im.id = "__fb_img";
              im.style.maxWidth = "100%";
              im.style.maxHeight = "100%";
              var cap = document.createElement("div");
              cap.id = "__fb_caption";
              cap.style.marginTop = "8px";
              var prev = document.createElement("button");
              prev.id = "__fb_prev";
              prev.textContent = "Prev";
              prev.style.position = "absolute";
              prev.style.left = "8px";
              prev.style.top = "50%";
              var next = document.createElement("button");
              next.id = "__fb_next";
              next.textContent = "Next";
              next.style.position = "absolute";
              next.style.right = "8px";
              next.style.top = "50%";
              var close = document.createElement("button");
              close.id = "__fb_close";
              close.textContent = "Close";
              close.style.position = "absolute";
              close.style.right = "8px";
              close.style.top = "8px";
              inner.appendChild(im);
              inner.appendChild(cap);
              inner.appendChild(prev);
              inner.appendChild(next);
              inner.appendChild(close);
              o.appendChild(inner);
              document.body.appendChild(o);
              prev.addEventListener("click", function (e) {
                e.stopPropagation();
                fbNavigate(-1);
              });
              next.addEventListener("click", function (e) {
                e.stopPropagation();
                fbNavigate(1);
              });
              close.addEventListener("click", function () {
                closeFB();
              });
              o.addEventListener("click", function (e) {
                if (e.target === o) closeFB();
              });
              document.addEventListener("keydown", function (e) {
                if (!fb || fb.style.display === "none") return;
                if (e.key === "Escape") closeFB();
                if (e.key === "ArrowRight") fbNavigate(1);
                if (e.key === "ArrowLeft") fbNavigate(-1);
              });
              fb = o;
              return fb;
            }
            function openFB(i) {
              fbIdx = i || 0;
              var f = createFB();
              var a = anchors[fbIdx];
              var img = f.querySelector("#__fb_img");
              var cap = f.querySelector("#__fb_caption");
              img.src =
                (a &&
                  (a.href ||
                    (a.querySelector("img") && a.querySelector("img").src))) ||
                "";
              cap.textContent =
                (a && (a.getAttribute("data-title") || "")) || "";
              f.style.display = "flex";
              updateCaptionForIndex(fbIdx);
            }
            function closeFB() {
              if (fb) fb.style.display = "none";
            }
            function fbNavigate(d) {
              fbIdx = (fbIdx + d + anchors.length) % anchors.length;
              openFB(fbIdx);
            }

            anchors.forEach(function (a) {
              a.addEventListener("click", function (e) {
                var idx = Number(this.getAttribute("data-index")) || 0;
                try {
                  e.preventDefault();
                } catch (ex) {}
                if (lightbox) {
                  try {
                    if (typeof lightbox.loadAndOpen === "function")
                      lightbox.loadAndOpen(idx);
                    else if (typeof lightbox.open === "function") {
                      try {
                        lightbox.open({ index: idx });
                      } catch (ee) {
                        lightbox.open(idx);
                      }
                    } else openFB(idx);
                  } catch (err) {
                    console.warn("launch failed", err);
                    openFB(idx);
                  }
                } else {
                  openFB(idx);
                }
                setTimeout(function () {
                  updateCaptionForIndex(idx);
                }, 10);
              });
            });

            if (lightbox) {
              try {
                lightbox.on &&
                  lightbox.on("open", function () {
                    var idx =
                      typeof lightbox.getActiveIndex === "function"
                        ? lightbox.getActiveIndex()
                        : lightbox.pswp &&
                            typeof lightbox.pswp.getCurrentIndex === "function"
                          ? lightbox.pswp.getCurrentIndex()
                          : null;
                    if (typeof idx === "number") updateCaptionForIndex(idx);
                  });
              } catch (e) {}
              try {
                lightbox.on &&
                  lightbox.on("change", function () {
                    var idx =
                      typeof lightbox.getActiveIndex === "function"
                        ? lightbox.getActiveIndex()
                        : lightbox.pswp &&
                            typeof lightbox.pswp.getCurrentIndex === "function"
                          ? lightbox.pswp.getCurrentIndex()
                          : null;
                    if (typeof idx === "number") updateCaptionForIndex(idx);
                  });
              } catch (e) {}
            }
          })
          .catch(function (err) {
            console.error("test-init: import/init error", err);
          });
      })
      .catch(function (err) {
        console.error("test-init: failed to load JSON", err);
      });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initFromJson);
  else initFromJson();
})();
