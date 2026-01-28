// Simple GLightbox swipe initializer
(function () {
  try {
    if (typeof window !== "undefined") {
      console.log("r2: glightbox-init.js loaded (simple)");
      window.__r2_glightbox_init_loaded = true;
    }
  } catch (e) {}

  function installSimpleSwipe(glight) {
    if (!glight || glight.__r2_installed) return;
    glight.__r2_installed = true;

    var detacher = null;
    function attachOnce() {
      detach();
      var overlay =
        document.querySelector(".glightbox-container") ||
        document.querySelector(".glightbox-overlay");
      if (!overlay) return;
      // Minimal: force caption wrapper to dark translucent bg + white text
      try {
        var caps = overlay.querySelectorAll(
          ".gdesc, .g-desc, .glightbox-desc, .glightbox-description, .gcaption, .gslide-title, .gdesc-inner",
        );
        Array.prototype.forEach.call(caps, function (cap) {
          try {
            var wrapper =
              cap.closest(
                ".gdesc, .gdesc-inner, .glightbox-desc, .glightbox-description, .gcaption",
              ) || cap;
            wrapper.style.setProperty(
              "background",
              "rgba(0,0,0, 0.45)",
              "important",
            );
            wrapper.style.setProperty(
              "background-color",
              "rgba(0, 40, 85, 0.98)",
              "important",
            );
            wrapper.style.setProperty("color", "#fff", "important");
            wrapper.style.setProperty("box-shadow", "none", "important");
            wrapper.style.setProperty("border", "none", "important");
            if (!wrapper.style.padding)
              wrapper.style.setProperty("padding", "6px 8px", "important");
            if (!wrapper.style.borderRadius)
              wrapper.style.setProperty("border-radius", "6px", "important");
            cap.style.setProperty("background", "transparent", "important");
            cap.style.setProperty("color", "#fff", "important");
            Array.prototype.forEach.call(
              cap.querySelectorAll("a"),
              function (a) {
                try {
                  a.style.setProperty("color", "#fff", "important");
                } catch (e) {}
              },
            );
          } catch (e) {}
        });
      } catch (e) {}
      // allow horizontal gestures
      try {
        overlay.style.touchAction = overlay.style.touchAction || "none";
      } catch (e) {}

      var startX = 0;
      var active = false;

      function onStart(e) {
        var p = e.touches ? e.touches[0] : e;
        active = true;
        startX = p.clientX;
      }
      function onEnd(e) {
        if (!active) return;
        active = false;
        var p = e.changedTouches ? e.changedTouches[0] : e;
        var dx = (p.clientX || 0) - startX;
        var dy = p.clientY || 0;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          var dir = dx < 0 ? "next" : "prev";
          console.log("r2: swipe detected ->", dir, "(dx=" + dx + ")");
          var handled = false;
          try {
            if (dir === "next") {
              if (typeof glight.nextSlide === "function") {
                glight.nextSlide();
                handled = true;
                console.log("r2: called glight.nextSlide()");
              } else if (typeof glight.next === "function") {
                glight.next();
                handled = true;
                console.log("r2: called glight.next()");
              } else if (typeof glight.goToSlide === "function") {
                var idx = glight.index != null ? glight.index : -1;
                glight.goToSlide(idx >= 0 ? idx + 1 : 1);
                handled = true;
                console.log("r2: called glight.goToSlide()");
              } else if (typeof glight.goTo === "function") {
                var idx2 = glight.index != null ? glight.index : -1;
                glight.goTo(idx2 >= 0 ? idx2 + 1 : 1);
                handled = true;
                console.log("r2: called glight.goTo()");
              }
            } else {
              if (typeof glight.prevSlide === "function") {
                glight.prevSlide();
                handled = true;
                console.log("r2: called glight.prevSlide()");
              } else if (typeof glight.prev === "function") {
                glight.prev();
                handled = true;
                console.log("r2: called glight.prev()");
              } else if (typeof glight.goToSlide === "function") {
                var idx3 = glight.index != null ? glight.index : -1;
                glight.goToSlide(idx3 >= 0 ? idx3 - 1 : 0);
                handled = true;
                console.log("r2: called glight.goToSlide()");
              } else if (typeof glight.goTo === "function") {
                var idx4 = glight.index != null ? glight.index : -1;
                glight.goTo(idx4 >= 0 ? idx4 - 1 : 0);
                handled = true;
                console.log("r2: called glight.goTo()");
              }
            }
          } catch (err) {
            console.warn("r2: error calling api method", err);
          }
          if (!handled) {
            // try clicking the native next/prev buttons
            var sel =
              dir === "next"
                ? ".gnext, .g-next, .gbtn-next, .glightbox-next"
                : ".gprev, .g-prev, .gbtn-prev, .glightbox-prev";
            var btn = document.querySelector(sel);
            if (btn && typeof btn.click === "function") {
              btn.click();
              handled = true;
              console.log("r2: clicked button fallback", sel);
            }
          }
          if (!handled) {
            // keyboard fallback
            try {
              var ev = new KeyboardEvent("keydown", {
                key: dir === "next" ? "ArrowRight" : "ArrowLeft",
                code: dir === "next" ? "ArrowRight" : "ArrowLeft",
                keyCode: dir === "next" ? 39 : 37,
                which: dir === "next" ? 39 : 37,
                bubbles: true,
              });
              document.dispatchEvent(ev);
              console.log("r2: dispatched keyboard fallback", dir);
            } catch (e) {
              console.warn("r2: keyboard fallback failed", e);
            }
          }
        }
      }

      overlay.addEventListener("touchstart", onStart, { passive: true });
      overlay.addEventListener("touchend", onEnd, { passive: true });

      detacher = function () {
        try {
          overlay.removeEventListener("touchstart", onStart);
          overlay.removeEventListener("touchend", onEnd);
        } catch (e) {}
        detacher = null;
      };
    }

    function detach() {
      try {
        if (detacher) detacher();
      } catch (e) {}
    }

    if (glight.on && typeof glight.on === "function") {
      glight.on("open", function () {
        attachOnce();
      });
      glight.on("slide_changed", function () {
        attachOnce();
      });
      glight.on("close", function () {
        detach();
      });
    }
  }

  function tryAttach() {
    try {
      if (window.__g && typeof window.__g.on === "function") {
        installSimpleSwipe(window.__g);
        return true;
      }
    } catch (e) {}
    return false;
  }

  if (!tryAttach()) {
    var to = setInterval(function () {
      if (tryAttach()) {
        try {
          console.log("r2: glightbox instance detected", window.__g);
        } catch (e) {}
        clearInterval(to);
      }
    }, 200);
    setTimeout(function () {
      clearInterval(to);
    }, 10000);
  }
})();
