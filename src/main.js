import './styles.css';

const markDocumentReady = (documentRoot) => {
  documentRoot.documentElement.dataset.appReady = 'true';
};

const getSlideDistance = (track) => {
  const firstSlide = track.firstElementChild;

  if (!firstSlide) {
    return track.clientWidth;
  }

  const trackStyles = window.getComputedStyle(track);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

  return firstSlide.getBoundingClientRect().width + gap;
};

const scrollSlider = (track, direction) => {
  const tolerance = 2;
  const maxScrollLeft = track.scrollWidth - track.clientWidth;
  const isAtStart = track.scrollLeft <= tolerance;
  const isAtEnd = track.scrollLeft >= maxScrollLeft - tolerance;
  const nextLeft = direction > 0 && isAtEnd
    ? 0
    : direction < 0 && isAtStart
      ? maxScrollLeft
      : track.scrollLeft + getSlideDistance(track) * direction;

  track.scrollTo({
    left: nextLeft,
    behavior: 'smooth',
  });
};

const initSlider = (slider) => {
  const track = slider.querySelector('[data-slider-track]');
  const sliderName = slider.dataset.slider;

  if (!track || !sliderName) {
    return;
  }

  document.querySelectorAll(`[data-slider-prev="${sliderName}"]`).forEach((button) => {
    button.addEventListener('click', () => scrollSlider(track, -1));
  });

  document.querySelectorAll(`[data-slider-next="${sliderName}"]`).forEach((button) => {
    button.addEventListener('click', () => scrollSlider(track, 1));
  });
};

const initSliders = (documentRoot) => {
  documentRoot.querySelectorAll('[data-slider]').forEach(initSlider);
};

const setOverlayOpen = ({ overlay, trigger, isOpen, displayClass = 'block', onOpen, onClose }) => {
  overlay.classList.toggle('hidden', !isOpen);
  overlay.classList.toggle(displayClass, isOpen);
  overlay.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('overflow-hidden', isOpen);

  if (isOpen) {
    onOpen?.();
  } else {
    onClose?.();
    trigger?.focus();
  }
};

const isOverlayOpen = (overlay) => !overlay.classList.contains('hidden');

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (overlay) => Array.from(overlay.querySelectorAll(focusableSelector))
  .filter((element) => element.getClientRects().length > 0);

const trapFocus = (overlay, event) => {
  if (event.key !== 'Tab' || !isOverlayOpen(overlay)) {
    return;
  }

  const focusableElements = getFocusableElements(overlay);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    event.preventDefault();
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

const initMobileMenu = (documentRoot) => {
  const menu = documentRoot.querySelector('[data-menu]');
  const openButton = documentRoot.querySelector('[data-menu-open]');

  if (!menu || !openButton) {
    return;
  }

  const closeMenu = () => {
    openButton.setAttribute('aria-expanded', 'false');
    setOverlayOpen({ overlay: menu, trigger: openButton, isOpen: false });
  };
  const openMenu = () => {
    openButton.setAttribute('aria-expanded', 'true');
    setOverlayOpen({
      overlay: menu,
      trigger: openButton,
      isOpen: true,
      onOpen: () => menu.querySelector('[data-menu-close]')?.focus(),
    });
  };

  openButton.addEventListener('click', openMenu);
  menu.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);
  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  documentRoot.addEventListener('keydown', (event) => {
    trapFocus(menu, event);

    if (event.key === 'Escape' && isOverlayOpen(menu)) {
      closeMenu();
    }
  });
};

const initStickyHeader = (documentRoot) => {
  const header = documentRoot.querySelector('[data-header]');

  if (!header) {
    return;
  }

  const updateHeaderBackground = () => {
    header.classList.toggle('bg-black', window.scrollY > 0);
    header.classList.toggle('bg-transparent', window.scrollY === 0);
  };

  updateHeaderBackground();
  window.addEventListener('scroll', updateHeaderBackground, { passive: true });
};

const initRiskModal = (documentRoot) => {
  const modal = documentRoot.querySelector('[data-risk-modal]');
  const openTriggers = documentRoot.querySelectorAll('[data-risk-modal-open]');
  let activeTrigger = null;

  if (!modal || openTriggers.length === 0) {
    return;
  }

  const closeModal = () => setOverlayOpen({ overlay: modal, trigger: activeTrigger, isOpen: false, displayClass: 'flex' });

  openTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      activeTrigger = trigger;
      setOverlayOpen({
        overlay: modal,
        trigger,
        isOpen: true,
        displayClass: 'flex',
        onOpen: () => modal.querySelector('[data-risk-modal-close]')?.focus(),
      });
    });
  });

  modal.querySelectorAll('[data-risk-modal-close]').forEach((closeTrigger) => {
    closeTrigger.addEventListener('click', closeModal);
  });

  documentRoot.addEventListener('keydown', (event) => {
    trapFocus(modal, event);

    if (event.key === 'Escape' && isOverlayOpen(modal)) {
      closeModal();
    }
  });
};

initSliders(document);
initStickyHeader(document);
initMobileMenu(document);
initRiskModal(document);
markDocumentReady(document);
