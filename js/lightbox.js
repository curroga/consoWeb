// Full-screen image viewer for links marked with [data-lightbox].
// Without JS the links still open the image directly.
(() => {
  const links = [...document.querySelectorAll('a[data-lightbox]')];
  if (!links.length || typeof HTMLDialogElement !== 'function') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Visor de imágenes');
  dialog.innerHTML = `
    <figure class="lightbox__figure">
      <img class="lightbox__img" alt="">
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Cerrar">&times;</button>
    <button class="lightbox__btn lightbox__prev" type="button" aria-label="Imagen anterior">&#8249;</button>
    <button class="lightbox__btn lightbox__next" type="button" aria-label="Imagen siguiente">&#8250;</button>
    <span class="lightbox__count" aria-live="polite"></span>`;
  document.body.appendChild(dialog);

  const img = dialog.querySelector('.lightbox__img');
  const caption = dialog.querySelector('.lightbox__caption');
  const count = dialog.querySelector('.lightbox__count');
  let current = 0;

  const show = (i) => {
    current = (i + links.length) % links.length;
    const link = links[current];
    const thumb = link.querySelector('img');
    img.src = link.href;
    img.alt = thumb ? thumb.alt : '';
    const title = link.querySelector('h3')?.textContent || '';
    const sub = link.querySelector('p')?.textContent || '';
    caption.textContent = sub ? `${title} · ${sub}` : title;
    count.textContent = `${current + 1} / ${links.length}`;
  };

  links.forEach((link, i) => link.addEventListener('click', (e) => {
    e.preventDefault();
    show(i);
    dialog.showModal();
    document.body.classList.add('lightbox-open');
  }));

  dialog.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));

  // Click on the dark background (not the photo or buttons) closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('lightbox__figure')) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe on touch screens
  let startX = null;
  dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
