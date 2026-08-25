const scrollHeader = document.querySelector('[data-scroll-header]');

if (scrollHeader) {
  const root = document.documentElement;
  const body = document.body;
  const topBoundary = 48;
  const directionThreshold = 6;
  let previousScrollY = Math.max(window.scrollY, 0);
  let frameQueued = false;

  const setHeaderVisible = (isVisible) => {
    scrollHeader.classList.toggle('is-scroll-hidden', !isVisible);
    body.classList.toggle('is-scroll-header-visible', isVisible);
  };

  const updateHeaderHeight = () => {
    root.style.setProperty('--scroll-header-height', `${scrollHeader.offsetHeight}px`);
  };

  const updateHeader = () => {
    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - previousScrollY;

    if (currentScrollY <= topBoundary || scrollDelta < -directionThreshold) {
      setHeaderVisible(true);
    } else if (scrollDelta > directionThreshold && !scrollHeader.contains(document.activeElement)) {
      setHeaderVisible(false);
    }

    previousScrollY = currentScrollY;
    frameQueued = false;
  };

  const queueHeaderUpdate = () => {
    if (frameQueued) return;
    frameQueued = true;
    window.requestAnimationFrame(updateHeader);
  };

  updateHeaderHeight();
  setHeaderVisible(true);
  window.addEventListener('scroll', queueHeaderUpdate, { passive: true });
  window.addEventListener('resize', updateHeaderHeight);
}
