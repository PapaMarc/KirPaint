(function () {
  var SECTION_ORDER = ["certs", "memberships", "accolades"];
  var SECTION_LABELS = {
    certs: "Certifications",
    memberships: "Organizational Memberships",
    accolades: "Other Accolades & Awards",
  };
  var gridEl = document.getElementById("credentials-grid");
  var lightboxInstance = null;

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeSectionFromHash() {
    var raw = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    return SECTION_ORDER.indexOf(raw) >= 0 ? raw : "";
  }

  function updateActiveNavButton(selectedSection) {
    var navLinks = document.querySelectorAll(".credentials-nav a[href^='#']");
    if (!navLinks || !navLinks.length) return;

    navLinks.forEach(function (link) {
      var hash = (link.getAttribute("href") || "")
        .replace(/^#/, "")
        .toLowerCase();
      var isActive = !!selectedSection && hash === selectedSection;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function itemToListMarkup(item, section, index) {
    var title = escapeHtml(item.title || "Untitled");
    var group = item.group
      ? '<span class="cred-group"> (' + escapeHtml(item.group) + ")</span>"
      : "";
    var levelClass = item.outlineLevel === 2 ? ' class="cred-outline-2"' : "";

    if (
      (item.type === "link" && item.url) ||
      (item.type === "image" && (item.full || item.thumb))
    ) {
      return (
        "<li" +
        levelClass +
        '><a href="#" class="cred-open-item" data-section="' +
        escapeHtml(section) +
        '" data-index="' +
        String(index) +
        '">' +
        title +
        "</a>" +
        group +
        "</li>"
      );
    }

    return "<li" + levelClass + ">" + title + group + "</li>";
  }

  function toLightboxElements(items, section) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      var title = escapeHtml(item.title || "");
      var sectionLabel = escapeHtml(SECTION_LABELS[section] || "Credentials");

      if (item.type === "image" && (item.full || item.thumb)) {
        return {
          href: item.full || item.thumb,
          type: "image",
          title: title,
          description: escapeHtml(item.caption || ""),
        };
      }

      if (item.type === "link" && item.url) {
        var linkCaption = item.group
          ? title + " (" + escapeHtml(item.group) + ")"
          : title;

        return {
          title: "External Website",
          description: linkCaption,
          content:
            '<div class="cred-lightbox-card">' +
            '<p><a href="' +
            escapeHtml(item.url) +
            '" target="_blank" rel="noopener">Open full website in new tab</a></p>' +
            "</div>",
        };
      }

      return {
        content:
          '<div class="cred-lightbox-card">' +
          "<h3>" +
          title +
          "</h3>" +
          "<p>" +
          sectionLabel +
          "</p>" +
          "</div>",
      };
    });
  }

  function openSectionGallery(section, data, startIndex) {
    var sectionItems = data && data[section];
    var elements = toLightboxElements(sectionItems || [], section);
    if (!elements.length || typeof GLightbox !== "function") return;

    try {
      if (lightboxInstance && typeof lightboxInstance.destroy === "function") {
        lightboxInstance.destroy();
      }
    } catch (e) {}

    lightboxInstance = GLightbox({
      elements: elements,
      touchNavigation: true,
      loop: true,
      closeButton: true,
    });

    if (
      typeof startIndex === "number" &&
      startIndex >= 0 &&
      startIndex < elements.length &&
      lightboxInstance &&
      typeof lightboxInstance.openAt === "function"
    ) {
      lightboxInstance.openAt(startIndex);
      return;
    }

    if (lightboxInstance && typeof lightboxInstance.open === "function") {
      lightboxInstance.open();
    }
  }

  function render(data, selectedSection) {
    if (!gridEl) return;

    var sectionsToRender = selectedSection ? [selectedSection] : SECTION_ORDER;
    var html = sectionsToRender
      .map(function (section) {
        var sectionItems = Array.isArray(data[section]) ? data[section] : [];
        var listItems = sectionItems
          .map(function (item, index) {
            return itemToListMarkup(item, section, index);
          })
          .join("");

        return (
          '<article id="section-' +
          section +
          '" class="service-card cred-section">' +
          "<h3>" +
          escapeHtml(SECTION_LABELS[section] || section) +
          "</h3>" +
          "<ul>" +
          listItems +
          "</ul>" +
          "</article>"
        );
      })
      .join("");

    gridEl.innerHTML = html;
  }

  function init() {
    if (!gridEl) return;

    fetch("/data/credentials.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var selectedSection = normalizeSectionFromHash();
        render(data, selectedSection);
        updateActiveNavButton(selectedSection);

        gridEl.addEventListener("click", function (event) {
          var itemLink = event.target.closest(".cred-open-item");
          if (!itemLink) return;
          event.preventDefault();
          var itemSection = itemLink.getAttribute("data-section");
          var itemIndex = parseInt(itemLink.getAttribute("data-index"), 10);
          if (!itemSection || Number.isNaN(itemIndex)) return;
          openSectionGallery(itemSection, data, itemIndex);
        });

        window.addEventListener("hashchange", function () {
          var nextSection = normalizeSectionFromHash();
          render(data, nextSection);
          updateActiveNavButton(nextSection);
        });
      })
      .catch(function (err) {
        console.error("failed to load credentials.json", err);
      });
  }

  init();
})();
