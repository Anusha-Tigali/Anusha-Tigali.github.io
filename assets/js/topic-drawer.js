(() => {
  const layer = document.querySelector(".topic-drawer-layer");
  if (!layer) return;

  const drawer = layer.querySelector(".topic-drawer");
  const title = layer.querySelector("#topic-drawer-title");
  const description = layer.querySelector("#topic-drawer-description");
  const primary = layer.querySelector(".topic-drawer-primary");
  const closeButton = layer.querySelector(".topic-drawer-close");
  const iconCloseButton = layer.querySelector(".topic-drawer-icon-close");
  const backdrop = layer.querySelector(".topic-drawer-backdrop");
  const mobile = window.matchMedia("(max-width: 760px)");
  let trigger = null;

  const topics = {
    people: {
      title: "Designing with people",
      description: "What I learned setting up research inside a developer-tools startup.",
      label: "Read the article"
    },
    agents: {
      title: "Building trustworthy agents",
      description: "Designing relationships that help enterprise AI understand context.",
      label: "Read the case study"
    }
  };

  const close = () => {
    if (layer.hidden) return;
    layer.classList.remove("is-open");
    document.body.classList.remove("topic-drawer-open");
    window.setTimeout(() => {
      layer.hidden = true;
      trigger?.focus();
      trigger = null;
    }, 260);
  };

  document.querySelectorAll(".profile-mobile-summary-link[data-drawer]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!mobile.matches) return;
      event.preventDefault();
      const topic = topics[link.dataset.drawer];
      if (!topic) return;
      trigger = link;
      title.textContent = topic.title;
      description.textContent = topic.description;
      primary.textContent = topic.label;
      primary.href = topic.href || link.href;
      layer.hidden = false;
      document.body.classList.add("topic-drawer-open");
      requestAnimationFrame(() => {
        layer.classList.add("is-open");
        drawer.focus({ preventScroll: true });
      });
    });
  });

  drawer.tabIndex = -1;
  closeButton.addEventListener("click", close);
  iconCloseButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !layer.hidden) close();
  });
})();
