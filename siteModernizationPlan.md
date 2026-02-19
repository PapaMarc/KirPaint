# KirPaint Site Modernization Plan

A fully modern, mobile‑responsive, maintainable redesign of the KirPaint website using the MerWare design language and a hybrid single‑page + JSON‑driven gallery architecture. This version includes the /r2 parallel‑site workflow to ensure the existing site remains untouched during development.

## 1. Modernization Goals

- Adopt the clean, responsive, section‑based layout used by `MerWare.net`

- Improve mobile rendering, accessibility, and performance.

- Replace legacy table‑based gallery pages with a JSON‑driven, maintainable gallery system.

- Consolidate top‑level KirPaint content (Home, About, Certifications, Galleries Index) into a single modern `index.html`.

- Keep individual gallery detail pages separate for clarity and performance.

- Build the new site inside a parallel `/r2` folder to avoid modifying the existing site.

- Reuse the existing `/images/...` folders for gallery content.

- Ensure the site is easy to maintain, extend, and regenerate using Copilot in VS Code.

## 2. High‑Level Architecture

### Hybrid Model (Recommended)

#### Single‑page sections inside `/r2` `/index.html`:

- Hero

- Galleries Index (grid of gallery categories)

- Certifications

- About

- Contact

- Footer

#### Separate gallery detail pages inside `/r2/galleries/`:

- `/r2/galleries/blacklight.html`

- `/r2/galleries/murals.html`

- `/r2/galleries/industrial.html`

- etc.

#### JSON‑driven image data inside `/r2/data/`:

- `/r2/data/blacklight.json`

- `/r2/data/murals.json`

- `/r2/data/industrial.json`

The new site uses the existing `/images/...` folders as the source of gallery images.

## 3. Template Structure (Abstracted from MerWare.net )

### Page Layout Pattern

```
<section class="hero">...</section>
<section class="content-two-col">...</section>
<section class="feature-grid">...</section>
<section class="gallery-index">...</section>
<section class="callout">...</section>
<footer>...</footer>
```

### Design System Notes

- Mobile‑first responsive layout.

- 80–120px vertical spacing between sections.

- Typography scale: large hero → h2 → h3 → body.

- Cards use subtle shadows and rounded corners.

- Consistent container widths.

- Sticky or collapsible mobile navigation.

- Smooth scrolling for anchor links.

### KirPaint‑Specific Adjustments

- Use KirPaint color palette (dark header, light body, accent color).

- Replace MerWare logos with KirPaint branding.

- Maintain KirPaint’s existing copyright and Disney and Universal disclaimers. regarding photo captions, use them verbatim

## 4. Section Templates

### Hero Section

```

<section class="hero">
  <div class="container">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </div>
</section>
```

### Two‑Column Section

```

<section class="content-two-col">
  <div class="container">
    <div class="left">{{ left_content }}</div>
    <div class="right">{{ right_content }}</div>
  </div>
</section>
```

### Feature Grid

```
<section class="feature-grid">
  <div class="container grid">
    {{ repeat card }}
  </div>
</section>
```

### Galleries Index Section

- Grid of gallery categories.

- Each card links to a gallery detail page.

- Uses thumbnails defined in JSON.

## 5. JSON‑Driven Gallery Architecture

JSON Schema

Each gallery category has a JSON file:

```
/r2/data/blacklight.json
/r2/data/murals.json
/r2/data/industrial.json
```

JSON Entry Structure

```
{
"src": "images/blacklight/001.jpg",
"thumb": "images/blacklight/thumbs/001.jpg",
"caption": "Backlit mural for XYZ project",
"alt": "UV-reactive mural with blue and purple highlights",
"year": 2023,
"tags": ["blacklight", "UV", "mural"]
}
```

Why this structure

- `src`: full image for lightbox.

- `thumb`: optimized thumbnail for grid.

- `caption`: displayed under the image in the lightbox.

- `alt`: accessibility + SEO.

- `year` and `tags`: optional metadata for filtering.

## 6. Gallery Detail Page Template

Each gallery detail page loads its JSON file and renders:

- Hero section with gallery title.

- Responsive image grid.

- Lightbox viewer (PhotoSwipe recommended).

- Captions displayed under images.

- Optional metadata (year, tags).

Rendering Logic (Pseudocode)

```
fetch('/r2/data/blacklight.json')
.then(res => res.json())
.then(images => {
images.forEach(item => {
renderThumbnail(item.thumb, item.caption);
setupLightbox(item.src, item.caption, item.alt);
});
});
```

## 7. Folder Structure

```
/kirpaint
  /images
  /css
  /js
  /galleries
  index.html

  /r2
    index.html
    /galleries
      blacklight.html
      murals.html
      industrial.html
      etc
    /data
      blacklight.json
      murals.json
      industrial.json
      etc
    /css
    /js

  siteModernizationPlan.md
```

The `/r2` folder contains the modernized site. The existing site remains untouched.

## 8. Mobile Responsiveness

- All sections collapse to single‑column on small screens.

- Gallery grid becomes 1‑column or 2‑column.

- Lightbox supports swipe + pinch‑to‑zoom.

- Navigation collapses into hamburger menu.

- Typography scales for readability.

## 9. Copilot Instructions for Page Generation

- When generating or modifying pages in VS Code:

- Use the Template Structure above.

- Maintain section spacing and typography scale.

- Use the hybrid architecture (single‑page sections + separate gallery detail pages).

- Use JSON files as the source of truth for gallery images.

- Use KirPaint branding and color palette.

- Ensure mobile responsiveness.

- Keep code modular and readable.

- Place all new files inside `/r2.`

- Do not modify or overwrite existing root‑level files.

## 10. Migration Steps

- Create `/r2/index.html` using the MerWare section layout.

- Build the About and Certifications sections inside `/r2/index.html`.

- Build the Galleries Index section inside `/r2/index.html`.

- reate `/r2/data/*.json` files for each gallery category.

- Create gallery detail pages inside `/r2/galleries/`.

- Test mobile responsiveness.

- Optimize images and thumbnails.

-consider Adding an automated generator to precompute and store each gallery image’s intrinsic width/height in `r2/data/<gallery>.json` (via a Node script run whenever images change) so PhotoSwipe can open immediately without runtime size measurements, eliminating extra background loads and speeding initial opens.

- Eventually, when ready to cut over and confident in the new site, i intend to archive the old site and promote `/r2` to root.

# Post R2 cut over...

have cut over as of ~midFeb 2026. Now the modernized site is primary. other stuff is archived. some R2 testing/validation still occurs as well.
(so haven't yet removed lightbox for old archived site, nor node_modules utilities, nor r2 dir and subdirs )

## 1. dead code removal

eg. Please run an unused CSS and JS audit (dead code analysis), identify selectors/functions not referenced by current pages, and provide a safe cleanup list. Do not make any changes yet; just provide suggestions of changes that could/should be made and prioritized w/respect to simple bloat factor v potential runtime issues v. potential security issue.
i'd like this specifically for the KirPaint new site which includes the root index.html which is open, coming soon.html, the about.htm redirrect and the files in css, data, galleries, glightbox, images and js. not node modules, and not r2

-P1 **\<COMPLETED\>** Security/runtime: Replace or self-host external confetti script in comingsoon.html:40 (third-party CDN script execution risk; also unnecessary blocking payload for a placeholder page).

**\<These 2 below are a hack workaround for glightbox not starting video#5 at the proper time\>**
-P1 Runtime correctness: Remove the temporary “delete 5th gallery item” hack in media.html:99-129 after deduping data; it currently masks duplicate content instead of fixing source data.
-P1 Data hygiene: Remove duplicate entry in media.json (last two objects are identical).
**\<These 2 above are a hack workaround for glightbox not starting video#5 at the proper time\>**

-P2 **\<COMPLETED\>** Runtime bloat: Remove legacy PhotoSwipe block in main.js:181-210; current in-scope pages do not render any .pswp markup.
-P2 **\<COMPLETED\>** Minor dead JS: Remove unused year updater in main.js:164-166 (no id="year" exists in scoped pages).

**\<These 2 below are legacy stuff for old site that i'll probably remove at some point\>**
-P2 CSS dead block: Remove legacy custom lightbox styles in styles.css:640 (no in-scope page creates .lightbox/.lightbox-content DOM).
-P3 File cleanup: blacklight_oldSchoolLightbox.json appears unreferenced by scoped pages and can be archived/deleted.
**\<These 2 above are legacy stuff for old site that i'll probably remove at some point\>**
