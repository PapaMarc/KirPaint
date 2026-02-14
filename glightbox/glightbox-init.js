/*
How to enable debug logs:

Set the flag before loading the script (preferred in development). Example in your page HTML before the glightbox-init.js script tag:

<script>window.__r2_dev = true;</script> <script src="/r2/glightbox/glightbox-init.js"></script>
Or enable at runtime in DevTools (F12 in the browser rendering a given page):
window.__r2_dev = true
*/

// Simple GLightbox swipe initializer
(function () {
  // dev flag for r2 debugging (default false). Set `window.__r2_dev = true` before
  // loading this script to enable debug logs.
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.__r2_dev === "undefined"
    ) {
      window.__r2_dev = false;
    }
  } catch (e) {}

  function r2Debug() {
    try {
      if (
        typeof window !== "undefined" &&
        window.__r2_dev &&
        console &&
        console.log
      ) {
        console.log.apply(console, arguments);
      }
    } catch (e) {}
  }

  try {
    if (typeof window !== "undefined") {
      r2Debug("r2: glightbox-init.js loaded (simple)");
      window.__r2_glightbox_init_loaded = true;
    }
  } catch (e) {}

  function parseYouTubeTimestamp(url) {
    const match = url.match(/[?&]t=([\dhms]+)/i);
    if (!match) return 0;

    const t = match[1];

    if (/^\d+$/.test(t)) return parseInt(t, 10);

    let seconds = 0;
    const h = t.match(/(\d+)h/i);
    const m = t.match(/(\d+)m/i);
    const s = t.match(/(\d+)s/i);

    if (h) seconds += parseInt(h[1], 10) * 3600;
    if (m) seconds += parseInt(m[1], 10) * 60;
    if (s) seconds += parseInt(s[1], 10);

    return seconds;
  }

  function installSimpleSwipe(glight) {
    if (!glight || glight.__r2_installed) return;
    glight.__r2_installed = true;

    try {
      var lightbox = glight;
      lightbox.on("slide_before_load", (slide) => {
        if (!slide || !slide.slideConfig || !slide.slideConfig.href) return;

        const url = slide.slideConfig.href;
        const start = parseYouTubeTimestamp(url);

        // DEBUG: log computed start and existing vars
        try {
          r2Debug(
            "r2-debug: slide_before_load url=",
            url,
            "computed start=",
            start,
            "before playerVars=",
            slide.playerVars,
            "playerParams=",
            slide.playerParams,
          );
        } catch (e) {}

        if (start > 0) {
          slide.playerVars = slide.playerVars || {};
          slide.playerVars.start = start;
          // request autoplay
          slide.playerVars.autoplay = 1;
          // Fallback: some GLightbox builds use playerParams instead of playerVars
          slide.playerParams = slide.playerParams || {};
          slide.playerParams.start = start;
          slide.playerParams.autoplay = 1;
          // store start seconds per youtube id for observer fallback
          try {
            window.__r2_youtube_start_map = window.__r2_youtube_start_map || {};
            var vid_match = url
              ? url.match(/[?&]v=([^&]+)/) ||
                url.match(/youtu\.be\/([^?&]+)/) ||
                url.match(/\/embed\/([^?&/]+)/)
              : null;
            var vid = vid_match ? vid_match[1] : null;
            if (vid && start > 0) window.__r2_youtube_start_map[vid] = start;
          } catch (e) {}
        }
      });

      // Ensure iframe src includes a start= param after the slide iframe is created.
      try {
        lightbox.on("slide_after_load", (slide) => {
          try {
            if (!slide || !slide.slideConfig || !slide.slideConfig.href) return;
            const url = slide.slideConfig.href;
            const start = parseYouTubeTimestamp(url);
            if (start <= 0) return;

            setTimeout(() => {
              var iframe = document.querySelector(
                ".glightbox-container iframe, .glightbox-overlay iframe",
              );
              if (!iframe) return;
              try {
                var src = iframe.getAttribute("src") || "";
                if (!/(?:\?|&)start=/.test(src)) {
                  var sep = src.indexOf("?") === -1 ? "?" : "&";
                  src = src + sep + "start=" + encodeURIComponent(start);
                  // ensure autoplay and mute flags are present so browser will allow autoplay
                  if (!/(?:\?|&)autoplay=1/.test(src)) src += "&autoplay=1";
                  iframe.setAttribute("src", src);
                  r2Debug("r2-debug: patched iframe src with start=", start);
                }
              } catch (e) {}
            }, 60);
          } catch (e) {}
        });
      } catch (e) {}
    } catch (e) {}

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

  // Install a MutationObserver fallback to patch YouTube iframes with start= and post a seek message.
  (function installIframeObserver() {
    try {
      if (window.__r2_iframe_observer_installed) return;
      window.__r2_iframe_observer_installed = true;

      function extractYouTubeIdFromUrl(u) {
        if (!u) return null;
        var m =
          u.match(/[?&]v=([^&]+)/) ||
          u.match(/youtu\.be\/([^?&]+)/) ||
          u.match(/\/embed\/([^?&/]+)/);
        return m ? m[1] : null;
      }

      function tryPatchIframe(iframe) {
        try {
          if (!iframe || !iframe.getAttribute) return;
          var src = iframe.getAttribute("src") || "";
          if (!/(?:youtube\.com|youtube-nocookie\.com)/i.test(src)) return;

          var vid = extractYouTubeIdFromUrl(src);
          if (!vid) {
            var m = src.match(/\/embed\/([^?&/]+)/);
            vid = m ? m[1] : null;
          }
          if (!vid) return;
          var start =
            window.__r2_youtube_start_map && window.__r2_youtube_start_map[vid];
          if (!start || start <= 0) return;

          if (!/(?:\?|&)start=/.test(src)) {
            var sep = src.indexOf("?") === -1 ? "?" : "&";
            src = src + sep + "start=" + encodeURIComponent(start);
            if (!/(?:\?|&)autoplay=1/.test(src)) src += "&autoplay=1";
            iframe.setAttribute("src", src);
            try {
              r2Debug(
                "r2-debug: observer patched iframe src with start=",
                start,
                "vid=",
                vid,
              );
            } catch (e) {}
          }

          // Try posting a seek command to the iframe (best-effort)
          try {
            var msg = JSON.stringify({
              event: "command",
              func: "seekTo",
              args: [start, true],
            });
            iframe.contentWindow && iframe.contentWindow.postMessage(msg, "*");
          } catch (e) {}
        } catch (e) {}
      }

      var obs = new MutationObserver(function (records) {
        try {
          records.forEach(function (rec) {
            try {
              if (rec.type === "childList") {
                rec.addedNodes &&
                  rec.addedNodes.forEach(function (n) {
                    if (n && n.nodeType === 1) {
                      if (n.tagName === "IFRAME") tryPatchIframe(n);
                      var ifr = n.querySelector && n.querySelector("iframe");
                      if (ifr) tryPatchIframe(ifr);
                    }
                  });
              } else if (
                rec.type === "attributes" &&
                rec.target &&
                rec.target.tagName === "IFRAME" &&
                rec.attributeName === "src"
              ) {
                tryPatchIframe(rec.target);
              }
            } catch (e) {}
          });
        } catch (e) {}
      });

      obs.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src"],
      });
      Array.prototype.forEach.call(
        document.querySelectorAll("iframe"),
        tryPatchIframe,
      );
    } catch (e) {}
  })();
})();
