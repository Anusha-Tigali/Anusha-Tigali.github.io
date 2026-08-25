const caseStudyMedia = document.querySelectorAll('.case-study-media');

document.querySelectorAll('.video-embed__player').forEach((player) => {
  const loadButton = player.querySelector('.video-embed__load');

  loadButton?.addEventListener('click', () => {
    const { videoId, videoStart, videoEnd, videoTitle } = player.dataset;
    const iframe = document.createElement('iframe');
    const parameters = new URLSearchParams({
      start: videoStart,
      end: videoEnd,
      rel: '0'
    });

    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${parameters}`;
    iframe.title = videoTitle;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    iframe.focus();
  });
});

caseStudyMedia.forEach((media, mediaIndex) => {
  const slides = [...media.children].filter((child) => ['IMG', 'VIDEO', 'PICTURE'].includes(child.tagName) || child.classList.contains('case-study-media-slide'));
  const slideCount = slides.length || 2;
  let activeIndex = 0;

  const controls = document.createElement('div');
  controls.className = 'case-study-media-controls';
  controls.innerHTML = `
    <div class="case-study-media-caption"></div>
    <div class="case-study-media-actions">
      <button class="case-study-media-arrow case-study-media-arrow--previous" type="button" aria-label="Previous image"></button>
      <span class="case-study-media-count" aria-live="polite">1/${slideCount}</span>
      <button class="case-study-media-arrow case-study-media-arrow--next" type="button" aria-label="Next image"></button>
    </div>`;

  const caption = media.querySelector(':scope > figcaption');
  media.insertBefore(controls, caption);
  if (caption) controls.querySelector('.case-study-media-caption').appendChild(caption);

  const previous = controls.querySelector('.case-study-media-arrow--previous');
  const next = controls.querySelector('.case-study-media-arrow--next');
  const count = controls.querySelector('.case-study-media-count');
  const captionContainer = controls.querySelector('.case-study-media-caption');

  const showSlide = (index) => {
    activeIndex = Math.max(0, Math.min(index, slideCount - 1));
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== activeIndex; });
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slideCount - 1;
    count.textContent = `${activeIndex + 1}/${slideCount}`;

    const activeSlide = slides[activeIndex];
    if (activeSlide?.dataset.slideCaption) {
      const description = document.createElement('p');
      description.textContent = activeSlide.dataset.slideCaption;
      captionContainer.replaceChildren(description);
    }
  };

  previous.addEventListener('click', () => showSlide(activeIndex - 1));
  next.addEventListener('click', () => showSlide(activeIndex + 1));
  media.setAttribute('data-media-index', String(mediaIndex));
  showSlide(0);
});

const caseStudyJump = document.querySelector('.case-study-jump');

if (caseStudyJump) {
  const toggle = caseStudyJump.querySelector('.case-study-jump-toggle');
  const toggleLabel = toggle?.querySelector('.visually-hidden');
  const links = [...caseStudyJump.querySelectorAll('.case-study-jump-links a')];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stickyTop = 16;
  const originalTop = caseStudyJump.getBoundingClientRect().top + window.scrollY - stickyTop;
  let activeId = '';
  let lockedId = '';
  let lockTimer;
  let ticking = false;

  const setOpen = (open) => {
    caseStudyJump.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Close section menu' : 'Open section menu';
  };

  toggle?.addEventListener('click', () => {
    setOpen(!caseStudyJump.classList.contains('is-open'));
  });

  const setActive = (id) => {
    if (!id || activeId === id) return;
    activeId = id;
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const scrollOffset = () => caseStudyJump.offsetHeight + stickyTop + 16;

  const updateFromScroll = () => {
    ticking = false;
    caseStudyJump.classList.toggle('is-docked', window.scrollY >= originalTop);

    if (lockedId) {
      const target = document.getElementById(lockedId);
      if (target && Math.abs(target.getBoundingClientRect().top - scrollOffset()) < 6) {
        lockedId = '';
        clearTimeout(lockTimer);
      } else {
        return;
      }
    }

    const marker = scrollOffset() + 2;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });
    if (current) setActive(current.id);
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  };

  links.forEach((link) => link.addEventListener('click', (event) => {
    const section = document.querySelector(link.hash);
    if (!section) return;
    event.preventDefault();
    setOpen(false);
    lockedId = section.id;
    setActive(section.id);
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { lockedId = ''; requestScrollUpdate(); }, 1200);
    const top = section.getBoundingClientRect().top + window.scrollY - scrollOffset();
    window.history.replaceState(null, '', link.hash);
    window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }));

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  requestScrollUpdate();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}
