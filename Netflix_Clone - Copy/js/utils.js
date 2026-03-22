/* =====================================================
   UTILS — Shared JS helpers
   ===================================================== */

/** Shorthand DOM query */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Initialise IntersectionObserver for scroll-reveal.
 * Call after dynamic content is rendered.
 */
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );
  $$('.reveal').forEach(el => observer.observe(el));
}

/**
 * Initialise all sliders on the page.
 * Looks for [data-slider] containers with .slider__track, [data-slider-left], [data-slider-right].
 */
function initSliders() {
  $$('[data-slider]').forEach(slider => {
    const track = $('.slider__track', slider);
    const leftBtn  = $('[data-slider-left]', slider);
    const rightBtn = $('[data-slider-right]', slider);
    if (!track) return;

    const scrollAmt = () => track.clientWidth * 0.8;

    if (leftBtn)  leftBtn.addEventListener('click',  () => track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    if (rightBtn) rightBtn.addEventListener('click', () => track.scrollBy({ left:  scrollAmt(), behavior: 'smooth' }));

    function updateArrows() {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      if (leftBtn)  leftBtn.style.opacity  = scrollLeft <= 5 ? '0' : '1';
      if (rightBtn) rightBtn.style.opacity = scrollLeft + clientWidth >= scrollWidth - 5 ? '0' : '1';
    }

    track.addEventListener('scroll', updateArrows, { passive: true });
    // Initial check after a small delay so layout is settled
    setTimeout(updateArrows, 100);
  });
}

/**
 * Simple toast notification.
 */
function showToast(message, type = 'info', duration = 3000) {
  const existing = $('#toast-container');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-container';
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    padding:12px 28px; border-radius:6px; font-size:.9rem; font-weight:500;
    z-index:9999; animation: toastIn .3s ease forwards;
    color:#fff;
    background: ${type === 'error' ? '#e50914' : type === 'success' ? '#46d369' : '#333'};
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Inject toast keyframes
(function injectToastStyles() {
  if ($('#toast-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'toast-keyframes';
  style.textContent = `
    @keyframes toastIn  { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity:1; transform:translateX(-50%) translateY(0); } to { opacity:0; transform:translateX(-50%) translateY(20px); } }
  `;
  document.head.appendChild(style);
})();
