# KirPaint Site Modernization Plan

A fully modern, mobile‑responsive, maintainable redesign of the KirPaint website using the MerWare/OneZeroBit design language and a hybrid single‑page + JSON‑driven gallery architecture. This version includes the /r2 parallel‑site workflow to ensure the existing site remains untouched during development.

## 1. Modernization Goals

- Adopt the clean, responsive, section‑based layout used by MerWare and OneZeroBit.

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

## 3. Template Structure (Abstracted from MerWare/OneZeroBit)

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

- Replace MerWare/OneZeroBit logos with KirPaint branding.

- Maintain KirPaint’s existing copyright and Disney disclaimers.

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

- Create `/r2/index.html` using the MerWare/OneZeroBit section layout.

- Build the About and Certifications sections inside `/r2/index.html`.

- Build the Galleries Index section inside `/r2/index.html`.

- reate `/r2/data/*.json` files for each gallery category.

- Create gallery detail pages inside `/r2/galleries/`.

- Test mobile responsiveness.

- Optimize images and thumbnails.

- Eventually, when ready to cut over and confident in the new site, i intend to archive the old site and promote `/r2` to root.
