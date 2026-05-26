export function animateCardExpand(sourceEl, modalEl) {
  const rect = sourceEl.getBoundingClientRect();
  const card = modalEl.querySelector('#card');

  card.style.left = rect.left + 'px';
  card.style.top = rect.top + 'px';
  card.style.width = rect.width + 'px';
  card.style.height = rect.height + 'px';
  card.style.transform = 'translate(0, 0)';
  card.style.transition = 'none';

  requestAnimationFrame(() => {
    card.style.transition = 'all 0.2s ease-out';
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.width = '480px';
    card.style.height = 'auto';
    card.style.transform = 'translate(-50%, -50%)';
  });
}

export function animateCardCollapse(card) {
  return new Promise((resolve) => {
    card.style.transition = 'all 0.2s ease-out';
    card.style.left = '0';
    card.style.top = '0';
    card.style.transform = 'translate(0, 0)';
    card.addEventListener('transitionend', resolve, { once: true });
  });
}
