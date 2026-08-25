const learningLogsTree = document.querySelector('[data-learning-logs-tree]');

if (learningLogsTree) {
  const toggle = learningLogsTree.querySelector('.learning-logs-tree-toggle');
  const toggleLabel = toggle?.querySelector('.visually-hidden');
  const links = learningLogsTree.querySelectorAll('a');
  const articleLinks = [...learningLogsTree.querySelectorAll('.learning-logs-tree-link[href^="#"]')];
  const articleNavigation = articleLinks
    .map((link) => ({ link, article: document.querySelector(link.hash) }))
    .filter(({ article }) => article);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setCurrentArticle = (currentLink) => {
    articleLinks.forEach((link) => {
      const isCurrent = link === currentLink;
      link.classList.toggle('is-current', isCurrent);

      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (articleNavigation.length) {
    let scrollUpdateQueued = false;

    const updateCurrentArticle = () => {
      const focusLine = window.scrollY + (window.innerHeight * 0.35);
      let current = articleNavigation[0];

      articleNavigation.forEach((item) => {
        if (item.article.offsetTop <= focusLine) current = item;
      });

      setCurrentArticle(current.link);
      scrollUpdateQueued = false;
    };

    const queueCurrentArticleUpdate = () => {
      if (scrollUpdateQueued) return;
      scrollUpdateQueued = true;
      window.requestAnimationFrame(updateCurrentArticle);
    };

    articleNavigation.forEach(({ link, article }) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setCurrentArticle(link);
        window.history.pushState(null, '', link.hash);
        article.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });

    window.addEventListener('scroll', queueCurrentArticleUpdate, { passive: true });
    window.addEventListener('resize', queueCurrentArticleUpdate);
    window.addEventListener('hashchange', queueCurrentArticleUpdate);
    updateCurrentArticle();
  }

  if (toggle) {
    learningLogsTree.classList.add('is-enhanced');

    const setOpen = (isOpen) => {
      learningLogsTree.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (toggleLabel) toggleLabel.textContent = isOpen ? 'Close reading list' : 'Open reading list';
    };

    toggle.addEventListener('click', () => {
      setOpen(!learningLogsTree.classList.contains('is-open'));
    });

    links.forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  }
}
