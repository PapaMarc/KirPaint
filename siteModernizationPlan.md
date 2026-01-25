📄 siteModernizationPlan.md
(You can paste this directly into /docs/siteModernizationPlan.md in your KirPaint repo.)

KirPaint Site Modernization Plan
Modernizing KirPaint using the MerWare/OneZeroBit design language and a hybrid single‑page + JSON‑driven gallery architecture.

1. Modernization Goals
   Adopt the clean, responsive, section‑based layout used by MerWare and OneZeroBit.

Improve mobile rendering and accessibility.

Replace legacy table‑based gallery pages with a JSON‑driven, maintainable gallery system.

Unify the top‑level KirPaint content (Home, About, Certifications, Galleries Index) into a single modern index.html.

Keep individual gallery detail pages separate for clarity and performance.

Ensure the site is easy to maintain, extend, and regenerate using Copilot in VS Code.

2. High‑Level Architecture
   Hybrid Model (Recommended)
   Single‑page sections inside index.html:

Hero

About

Certifications

Galleries Index (grid of gallery categories)

Contact

Footer

Separate gallery detail pages:

/galleries/blacklight.html

/galleries/murals.html

/galleries/industrial.html

etc.

JSON‑driven image data for each gallery category.

3. Template Structure (Abstracted from MerWare/OneZeroBit)
Page Layout Pattern
Code
<section class="hero">...</section>
<section class="content-two-col">...</section>
<section class="feature-grid">...</section>
<section class="gallery-index">...</section>
<section class="callout">...</section>
<footer>...</footer>
Design System Notes
Mobile‑first responsive layout

80–120px vertical spacing between sections

Typography scale: large hero → h2 → h3 → body

Cards use subtle shadows + rounded corners

Consistent container widths

Sticky or collapsible mobile navigation

Smooth scrolling for anchor links

KirPaint‑Specific Adjustments
Use KirPaint color palette (dark header, light body, accent color)

Replace MerWare/OneZeroBit logos with KirPaint branding

Maintain KirPaint’s existing copyright and Disney disclaimers

4. Section Templates
Hero Section
Code
<section class="hero">
  <div class="container">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </div>
</section>
Two‑Column Section
Code
<section class="content-two-col">
  <div class="container">
    <div class="left">{{ left_content }}</div>
    <div class="right">{{ right_content }}</div>
  </div>
</section>
Feature Grid
Code
<section class="feature-grid">
  <div class="container grid">
    {{ repeat card }}
  </div>
</section>
Galleries Index Section
Grid of gallery categories

Each card links to a gallery detail page

Uses thumbnails defined in JSON

5. JSON‑Driven Gallery Architecture
   JSON Schema
   Each gallery category has a JSON file:

Code
/data/blacklight.json
/data/murals.json
/data/industrial.json
...
JSON Entry Structure
json
{
"src": "images/blacklight/001.jpg",
"thumb": "images/blacklight/thumbs/001.jpg",
"caption": "Backlit mural for XYZ project",
"alt": "UV-reactive mural with blue and purple highlights",
"year": 2023,
"tags": ["blacklight", "UV", "mural"]
}
Why this structure
src: full image for lightbox

thumb: optimized thumbnail for grid

caption: displayed under the image in the lightbox

alt: accessibility + SEO

year and tags: optional metadata for filtering

6. Gallery Detail Page Template
   Each gallery detail page loads its JSON file and renders:

Hero section with gallery title

Responsive image grid

Lightbox viewer (PhotoSwipe recommended)

Captions displayed under images

Optional metadata (year, tags)

Rendering Logic (Pseudocode)
js
fetch('/data/blacklight.json')
.then(res => res.json())
.then(images => {
images.forEach(item => {
renderThumbnail(item.thumb, item.caption);
setupLightbox(item.src, item.caption, item.alt);
});
}); 7. Folder Structure
Code
/kirpaint
/css
/js
/images
/blacklight
/murals
/industrial
/thumbs
/data
blacklight.json
murals.json
industrial.json
/galleries
blacklight.html
murals.html
industrial.html
index.html
contact.html (optional)
docs/
siteModernizationPlan.md 8. Mobile Responsiveness
All sections collapse to single‑column on small screens

Gallery grid becomes 1‑column or 2‑column

Lightbox supports swipe + pinch‑to‑zoom

Navigation collapses into hamburger menu

Typography scales for readability

9. Copilot Instructions for Page Generation
   When generating or modifying pages in VS Code:

Use the Template Structure above

Maintain section spacing and typography scale

Use the hybrid architecture (single‑page sections + separate gallery detail pages)

Use JSON files as the source of truth for gallery images

Use KirPaint branding and color palette

Ensure mobile responsiveness

Keep code modular and readable

10. Migration Steps
    Create index.html using the MerWare/OneZeroBit section layout.

Build the About and Certifications sections inside index.html.

Build the Galleries Index section inside index.html.

Create /data/\*.json files for each gallery category.

Create gallery detail pages that load and render JSON.

Replace old gallery .htm files with the new JSON-driven pages.

Test mobile responsiveness.

Optimize images and thumbnails.

Deploy and validate.

End of siteModernizationPlan.md
