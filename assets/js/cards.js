const portfolioList = document.querySelector('.portfolio-index ul');

if (portfolioList) {
  const rows = [...portfolioList.querySelectorAll('.portfolio-row')];
  const expandableRows = rows.filter((row) => row.classList.contains('portfolio-row--expandable'));
  const activeClasses = ['portfolio-active-1', 'portfolio-active-2', 'portfolio-active-3'];
  const count = document.querySelector('.portfolio-mobile-count');
  const dots = [...document.querySelectorAll('.portfolio-mobile-dots button')];
  const nextButton = document.querySelector('.portfolio-mobile-next');
  const mobileViewport = window.matchMedia('(max-width: 760px)');

  const clearActiveCard = () => {
    portfolioList.classList.remove('is-card-active', ...activeClasses);
    rows.forEach((row) => row.classList.remove('is-active'));
  };

  const setActiveCard = (row) => {
    if (!row.classList.contains('portfolio-row--expandable')) {
      clearActiveCard();
      return;
    }

    const index = rows.indexOf(row);
    if (row.classList.contains('is-active')) return;

    clearActiveCard();
    row.classList.add('is-active');
    portfolioList.classList.add('is-card-active', `portfolio-active-${index + 1}`);
    if (count) count.textContent = `${index + 1}/${rows.length}`;
  };

  if (!mobileViewport.matches) {
    portfolioList.addEventListener('pointerover', (event) => {
      const row = event.target.closest('.portfolio-row');
      if (row && portfolioList.contains(row)) setActiveCard(row);
    });

    portfolioList.addEventListener('pointerleave', clearActiveCard);
  } else {
    const mobileRows = rows;
    let activeMobileRow = mobileRows[0];

    const syncMobileRailHeight = () => {
      if (!activeMobileRow) return;
      portfolioList.style.height = `${Math.ceil(activeMobileRow.getBoundingClientRect().height)}px`;
    };

    const activateMobileCard = (row, displayIndex) => {
      mobileRows.forEach((item) => item.classList.remove('is-mobile-initial', 'is-active'));
      row.classList.add('is-active');
      activeMobileRow = row;
      portfolioList.classList.add('is-card-active');
      if (count) count.textContent = `${displayIndex + 1}/${rows.length}`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === displayIndex);
        dot.setAttribute('aria-current', index === displayIndex ? 'true' : 'false');
      });
      if (nextButton) {
        const hasNextCard = displayIndex < mobileRows.length - 1;
        nextButton.hidden = !hasNextCard;
        if (hasNextCard) {
          const nextIndex = displayIndex + 1;
          nextButton.innerHTML = `${mobileRows[nextIndex].dataset.mobileLabel} <span aria-hidden="true">→</span>`;
          nextButton.dataset.nextIndex = String(nextIndex);
          nextButton.setAttribute('aria-label', `Show next project: ${mobileRows[nextIndex].dataset.mobileLabel}`);
        } else {
          nextButton.removeAttribute('data-next-index');
          nextButton.removeAttribute('aria-label');
        }
      }
      syncMobileRailHeight();
    };

    activateMobileCard(mobileRows[0], 0);
    let railFrame;

    const getNearestTrackIndex = () => {
      const cardStep = mobileRows[1]
        ? mobileRows[1].offsetLeft - mobileRows[0].offsetLeft
        : mobileRows[0].offsetWidth;
      return Math.max(0, Math.min(mobileRows.length - 1, Math.round(portfolioList.scrollLeft / Math.max(1, cardStep))));
    };

    const updateCardFromRailScroll = () => {
      railFrame = undefined;
      const trackIndex = getNearestTrackIndex();
      activateMobileCard(mobileRows[trackIndex], trackIndex);
    };

    const requestRailScrollUpdate = () => {
      if (railFrame) return;
      railFrame = window.requestAnimationFrame(updateCardFromRailScroll);
    };

    portfolioList.addEventListener('scroll', requestRailScrollUpdate, { passive: true });

    const scrollToMobileCard = (index) => {
      const row = mobileRows[index];
      if (!row) return;
      portfolioList.scrollTo({ left: row.offsetLeft, behavior: 'smooth' });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => scrollToMobileCard(Number(dot.dataset.projectIndex)));
    });

    if (nextButton) {
      nextButton.addEventListener('click', () => scrollToMobileCard(Number(nextButton.dataset.nextIndex)));
    }

    window.addEventListener('resize', syncMobileRailHeight);
    document.fonts?.ready.then(syncMobileRailHeight);

    requestRailScrollUpdate();
  }
}
