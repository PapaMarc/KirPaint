// Fetch gallery JSON and render thumbnails with a simple lightbox
document.addEventListener('DOMContentLoaded', function () {
  var galleryEl = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCaption = document.getElementById('lb-caption');

  fetch('/r2/data/blacklight.json')
    .then(function (r) { return r.json(); })
    .then(function (images) {
      images.forEach(function (item, idx) {
        var a = document.createElement('a');
        a.className = 'thumb';
        a.href = item.src;
        a.dataset.caption = item.caption || '';
        a.dataset.alt = item.alt || '';

        var img = document.createElement('img');
        img.src = item.thumb || item.src;
        img.alt = item.alt || '';
        a.appendChild(img);

        // thumbnails show image only; caption appears in lightbox only

        a.addEventListener('click', function (e) {
          e.preventDefault();
          lbImg.src = item.src;
          lbImg.alt = item.alt || '';
          lbCaption.textContent = item.caption || '';
          lightbox.classList.add('active');
          lightbox.setAttribute('aria-hidden','false');
        });

        galleryEl.appendChild(a);
      });
    })
    .catch(function (err) { console.error('Failed to load gallery JSON', err); });

  // Lightbox close behavior
  document.querySelector('#lightbox .close').addEventListener('click', function () {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden','true');
      lbImg.src = '';
    }
  });
});
