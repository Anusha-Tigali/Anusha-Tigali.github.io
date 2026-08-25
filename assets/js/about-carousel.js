const carousel = document.querySelector(".about-carousel");

if (carousel) {
  const aboutMain = carousel.closest(".interior-main--about");
  const slides = [...carousel.querySelectorAll("[data-about-slide]")];
  const dots = [...carousel.querySelectorAll(".about-carousel-dots button")];
  const videos = [...carousel.querySelectorAll("video[autoplay]")];
  let activeIndex = 0;
  let wheelLocked = false;
  let touchStart = null;
  let resizeTimer = null;
  const isMobileCarousel = () => window.matchMedia("(max-width: 760px)").matches;

  const syncMobileCarouselHeight = () => {
    if (aboutMain) aboutMain.style.minHeight = "";
  };

  const showSlide = (nextIndex) => {
    const clampedIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (clampedIndex === activeIndex) return;

    activeIndex = clampedIndex;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-before", index < activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const syncResponsiveSlides = () => {
    if (isMobileCarousel()) {
      slides.forEach((slide) => {
        slide.classList.remove("is-active", "is-before");
        slide.setAttribute("aria-hidden", "false");
      });
      return;
    }

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-before", index < activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
  });

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: [0, 0.25] });
    videos.forEach((video) => videoObserver.observe(video));
  } else {
    videos.forEach((video) => video.play().catch(() => {}));
  }

  window.addEventListener("load", () => {
    syncMobileCarouselHeight();
    syncResponsiveSlides();
  });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      syncMobileCarouselHeight();
      syncResponsiveSlides();
    }, 120);
  });
  document.fonts?.ready.then(syncMobileCarouselHeight);
  syncMobileCarouselHeight();
  syncResponsiveSlides();

  window.addEventListener("wheel", (event) => {
    if (isMobileCarousel()) return;
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    showSlide(activeIndex + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => { wheelLocked = false; }, 420);
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "PageDown", "PageUp"].includes(event.key)) return;
    event.preventDefault();
    showSlide(activeIndex + (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) ? 1 : -1));
  });

  carousel.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    if (!touchStart || isMobileCarousel()) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const distanceX = touchStart.x - touch.clientX;
    const distanceY = touchStart.y - touch.clientY;
    touchStart = null;
    if (Math.abs(distanceX) < 40 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    showSlide(activeIndex + (distanceX > 0 ? 1 : -1));
  }, { passive: true });
}
