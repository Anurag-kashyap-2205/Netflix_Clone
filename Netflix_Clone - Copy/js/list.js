;(() => {
  'use strict';

  if (!requireAuth()) return;

  const session = getSession();
  if (session) {
    const nameEl = $('#profile-name');
    if (nameEl) nameEl.textContent = session.name;
  }

  const listContainer = $('#list-grid');

  function createPosterCard(movie) {
    const match = 85 + Math.floor(Math.random() * 14);
    return `
      <div class="poster" data-movie-id="${movie.id}" style="width: 100%; margin-bottom: 2rem;">
        <img class="poster__img" src="${movie.img}" alt="${movie.title}" loading="lazy">
        <div class="poster__info">
          <div class="poster__controls">
            <button class="btn--icon play" data-play="${movie.id}" aria-label="Play"><i class="fa-solid fa-play"></i></button>
            <button class="btn--icon" data-add="${movie.id}" aria-label="Add to list"><i class="fa-solid ${getMyList().includes(movie.id) ? 'fa-check' : 'fa-plus'}"></i></button>
            <button class="btn--icon" aria-label="Like"><i class="fa-regular fa-thumbs-up"></i></button>
            <button class="btn--icon" style="margin-left:auto;" data-info="${movie.id}" aria-label="More info"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
          <div class="poster__meta-row">
            <span class="poster__match">${match}% Match</span>
            <span class="poster__rating-badge">${movie.rating}</span>
            <span>${movie.duration}</span>
          </div>
          <div class="poster__genres">${movie.genres.map(g => `<span>${g}</span>`).join('')}</div>
        </div>
      </div>
    `;
  }

  function renderList() {
    if (!listContainer) return;
    const listIds = getMyList();
    if (listIds.length === 0) {
      listContainer.innerHTML = '<p style="color:#aaa; font-size:1.2rem; grid-column: 1 / -1;">Your list is empty. Add shows and movies you want to watch later.</p>';
      return;
    }
    const movies = listIds.map(getMovieById).filter(Boolean).slice(0, 50);
    listContainer.innerHTML = movies.map(m => createPosterCard(m)).join('');
  }

  renderList();

  if (listContainer) {
    listContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        e.stopPropagation();
        const movieId = Number(addBtn.dataset.add);
        const isAdded = toggleMyList(movieId);
        if (isAdded === 'FULL') {
          showToast('My List is full (max 50 movies).', 'error');
          return;
        }
        showToast(isAdded ? 'Added to My List' : 'Removed from My List', 'success');
        renderList(); // Re-render immediately
        return;
      }
      
      const playBtn = e.target.closest('[data-play]');
      if (playBtn) {
        openModal(Number(playBtn.dataset.play), true);
        return;
      }
      const infoBtn = e.target.closest('[data-info]');
      if (infoBtn) {
        openModal(Number(infoBtn.dataset.info), false);
        return;
      }
      const poster = e.target.closest('.poster');
      if (poster && !e.target.closest('.poster__info')) {
        openModal(Number(poster.dataset.movieId), false);
      }
    });
  }

  /* ─────────────────────────────────────────
     MODAL & VIDEO PLAYER
  ───────────────────────────────────────── */
  const overlay = $('#modal-overlay');
  const video = $('#modal-video');
  const playerOverlay = $('#player-overlay');

  function openModal(movieId, autoPlay) {
    if (!overlay) return;
    const movie = getMovieById(movieId);
    if (!movie) return;

    // Set info
    const match = 85 + Math.floor(Math.random() * 14);
    $('#modal-match').textContent = match + '% Match';
    $('#modal-year').textContent = movie.year;
    $('#modal-rating').textContent = movie.rating;
    $('#modal-duration').textContent = movie.duration;
    $('#modal-desc').textContent = movie.description;
    $('#modal-genres').innerHTML = `<strong>Genres:</strong> ${movie.genres.join(', ')}`;

    // Set video
    video.src = movie.videoUrl;
    video.load();
    playerOverlay.classList.remove('hidden');

    if (autoPlay) {
      video.play().catch(() => {});
      playerOverlay.classList.add('hidden');
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.body.style.overflow = '';
  }

  if ($('#modal-close')) $('#modal-close').addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Play big button
  if ($('#modal-play-big')) {
    $('#modal-play-big').addEventListener('click', () => {
      video.play().catch(() => {});
      playerOverlay.classList.add('hidden');
    });
  }

  // Show overlay when video ends
  if (video) {
    video.addEventListener('ended', () => {
      playerOverlay.classList.remove('hidden');
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeModal();
  });


  /* ─────────────────────────────────────────
     NAVBAR
  ───────────────────────────────────────── */
  const browseNav = $('#browse-nav');
  if (browseNav) {
    window.addEventListener('scroll', () => {
      browseNav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  const profile = $('#profile-toggle');
  if (profile) {
    profile.addEventListener('click', (e) => {
      e.stopPropagation();
      profile.classList.toggle('open');
    });
    document.addEventListener('click', () => profile.classList.remove('open'));
  }

  const logoutBtn = $('#logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => logout());

  const mobileBtnEl = $('#mobile-menu-btn');
  const mobileOverlay = $('#mobile-nav-overlay');
  if (mobileBtnEl && mobileOverlay) {
    mobileBtnEl.addEventListener('click', () => mobileOverlay.classList.toggle('open'));
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target === mobileOverlay) {
        mobileOverlay.classList.remove('open');
      }
    });
  }
})();
