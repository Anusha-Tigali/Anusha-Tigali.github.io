const carousel = document.querySelector(".about-carousel");

if (carousel) {
  const slides = [...carousel.querySelectorAll("[data-about-slide]")];
  const dots = [...carousel.querySelectorAll(".about-carousel-dots button")];
  let activeIndex = 0;
  let wheelLocked = false;
  let touchStart = null;
  const isMobileCarousel = () => window.matchMedia("(max-width: 760px)").matches;

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

  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

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
    if (!touchStart || !isMobileCarousel()) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const distanceX = touchStart.x - touch.clientX;
    const distanceY = touchStart.y - touch.clientY;
    touchStart = null;
    if (Math.abs(distanceX) < 40 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    showSlide(activeIndex + (distanceX > 0 ? 1 : -1));
  }, { passive: true });
}
