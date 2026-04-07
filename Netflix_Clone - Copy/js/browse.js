/* =====================================================
   BROWSE PAGE — JS
   Billboard, content rows, modal, video player, nav
   ===================================================== */
; (() => {
  'use strict';

  /* ── Auth guard ── */
  if (!requireAuth()) return;

  /* ── Set profile name ── */
  const session = getSession();
  if (session) {
    const nameEl = $('#profile-name');
    if (nameEl) nameEl.textContent = session.name;
  }


  /* ─────────────────────────────────────────
     1. BILLBOARD
  ───────────────────────────────────────── */
  let featuredMovie = null;
  function renderBillboard() {
    const rankedCategory = CATEGORIES.find(cat => cat.showRank === true);
    if (rankedCategory && rankedCategory.ids.length > 0) {
      const randomId = rankedCategory.ids[Math.floor(Math.random() * rankedCategory.ids.length)];
      featuredMovie = getMovieById(randomId);
    } else {
      featuredMovie = getRandomFeatured();
    }

    const bg = $('#billboard-bg');
    const title = $('#billboard-title');
    const desc = $('#billboard-desc');

    if (bg) bg.style.backgroundImage = `url('${featuredMovie.banner}')`;
    if (title) title.textContent = featuredMovie.title;
    if (desc) desc.textContent = featuredMovie.description;
  }

  renderBillboard();

  // Billboard buttons
  const playBtn = $('#billboard-play');
  const infoBtn = $('#billboard-info');
  if (playBtn) playBtn.addEventListener('click', () => openModal(featuredMovie.id, true));
  if (infoBtn) infoBtn.addEventListener('click', () => openModal(featuredMovie.id, false));





  /* ─────────────────────────────────────────
     2. CONTENT ROWS
  ───────────────────────────────────────── */
  const rowsContainer = $('#browse-rows');

  function renderRows() {
    rowsContainer.innerHTML = CATEGORIES.map(cat => {
      const movies = getCategoryMovies(cat);
      return `
        <section class="row">
          <h2 class="row__title">${cat.name} <span class="row__explore">Explore All ›</span></h2>
          <div class="slider" data-slider>
            <button class="slider__btn slider__btn--left" data-slider-left aria-label="Scroll left">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="slider__track">
              ${movies.map((m, i) => createPosterCard(m, cat.showRank ? i + 1 : null)).join('')}
            </div>
            <button class="slider__btn slider__btn--right" data-slider-right aria-label="Scroll right">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </section>
      `;
    }).join('');
  }

  function createPosterCard(movie, rank) {
    const match = 85 + Math.floor(Math.random() * 14); // 85-98%
    return `
      <div class="poster ${rank ? 'poster--ranked' : ''}" data-movie-id="${movie.id}">
        <img class="poster__img" src="${movie.img}" alt="${movie.title}" loading="lazy">
        ${rank ? `<span class="poster__rank">${rank}</span>` : ''}
        <div class="poster__info">
          <div class="poster__controls">
            <button class="btn--icon play" data-play="${movie.id}" aria-label="Play"><i class="fa-solid fa-play"></i></button>
            <button class="btn--icon" data-add="${movie.id}" aria-label="Add to list"><i class="fa-solid ${getMyList().includes(movie.id) ? 'fa-check' : 'fa-plus'}"></i></button>
            <button class="btn--icon" data-like="${movie.id}" aria-label="Like"><i class="${getLikedMovies().includes(movie.id) ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i></button>
            <button class="btn--icon" data-dislike="${movie.id}" aria-label="Dislike"><i class="${getDislikedMovies().includes(movie.id) ? 'fa-solid' : 'fa-regular'} fa-thumbs-down"></i></button>
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

  renderRows();
  initSliders();

  /* ─────────────────────────────────────────
      Search bar
    ───────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.getElementById('search-container');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    // 1. Toggle Search Bar
    searchBtn.addEventListener('click', (e) => {
      // Prevent click from bubbling up to the document
      e.stopPropagation();

      searchContainer.classList.toggle('active');

      // Focus the input automatically when opened
      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // 2. Close search if clicking outside of the container
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
      }
    });

    // 3. Optional: Close on "Escape" key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchContainer.classList.remove('active');
        searchInput.value = ''; // Clear text
      }
    });
  });

  /* ─────────────────────────────────────────
     3. POSTER CLICK → MODAL
  ───────────────────────────────────────── */
  rowsContainer.addEventListener('click', (e) => {
    // Play button
    const playBtn = e.target.closest('[data-play]');
    if (playBtn) {
      openModal(Number(playBtn.dataset.play), true);
      return;
    }
    // Add button
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.stopPropagation();
      const movieId = Number(addBtn.dataset.add);
      const isAdded = toggleMyList(movieId);
      if (isAdded === 'FULL') {
        showToast('My List is full (max 50 movies).', 'error');
        return;
      }
      addBtn.innerHTML = `<i class="fa-solid ${isAdded ? 'fa-check' : 'fa-plus'}"></i>`;
      showToast(isAdded ? 'Added to My List' : 'Removed from My List', 'success');
      return;
    }
    // Like button
    const likeBtn = e.target.closest('[data-like]');
    if (likeBtn) {
      e.stopPropagation();
      const movieId = Number(likeBtn.dataset.like);
      const isLiked = toggleLikeMovie(movieId);
      likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i>`;

      // Update dislike icon if it was previously disliked
      const controls = likeBtn.closest('.poster__controls');
      const dislikeBtn = controls ? controls.querySelector('[data-dislike="' + movieId + '"]') : null;
      if (dislikeBtn) dislikeBtn.innerHTML = `<i class="fa-regular fa-thumbs-down"></i>`;

      // if (isLiked) showToast('Rated Netflix clone', 'success');
      return;
    }
    // Dislike button
    const dislikeBtn = e.target.closest('[data-dislike]');
    if (dislikeBtn) {
      e.stopPropagation();
      const movieId = Number(dislikeBtn.dataset.dislike);
      const isDisliked = toggleDislikeMovie(movieId);
      dislikeBtn.innerHTML = `<i class="${isDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down"></i>`;

      // Update like icon if it was previously liked
      const controls = dislikeBtn.closest('.poster__controls');
      const likeButton = controls ? controls.querySelector('[data-like="' + movieId + '"]') : null;
      if (likeButton) likeButton.innerHTML = `<i class="fa-regular fa-thumbs-up"></i>`;

      // if (isDisliked) showToast('Rated Netflix clone', 'success');
      return;
    }
    // Info button
    const infoBtn = e.target.closest('[data-info]');
    if (infoBtn) {
      openModal(Number(infoBtn.dataset.info), false);
      return;
    }
    // Click on poster image itself
    const poster = e.target.closest('.poster');
    if (poster && !e.target.closest('.poster__info')) {
      openModal(Number(poster.dataset.movieId), false);
    }
  });


  /* ─────────────────────────────────────────
     4. MODAL & VIDEO PLAYER
  ───────────────────────────────────────── */
  const overlay = $('#modal-overlay');
  const video = $('#modal-video');
  const playerOverlay = $('#player-overlay');

  // Modal action button elements
  const modalActionPlay = $('#modal-action-play');
  const modalActionAdd = $('#modal-action-add');
  const modalActionLike = $('#modal-action-like');
  const modalActionDislike = $('#modal-action-dislike');
  const modalAddIcon = $('#modal-add-icon');
  const modalLikeIcon = $('#modal-like-icon');
  const modalDislikeIcon = $('#modal-dislike-icon');

  let currentModalMovieId = null;

  function openModal(movieId, autoPlay) {
    const movie = getMovieById(movieId);
    if (!movie) return;

    currentModalMovieId = movieId;

    // Set info
    const match = 85 + Math.floor(Math.random() * 14);
    $('#modal-match').textContent = match + '% Match';
    $('#modal-year').textContent = movie.year;
    $('#modal-rating').textContent = movie.rating;
    $('#modal-duration').textContent = movie.duration;
    $('#modal-desc').textContent = movie.description;
    $('#modal-genres').innerHTML = `<strong>Genres:</strong> ${movie.genres.join(', ')}`;

    // Sync action button states from saved data
    const isAdded = getMyList().includes(movieId);
    const isLiked = getLikedMovies().includes(movieId);
    const isDisliked = getDislikedMovies().includes(movieId);

    modalAddIcon.className = `fa-solid ${isAdded ? 'fa-check' : 'fa-plus'}`;
    modalLikeIcon.className = `${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`;
    modalDislikeIcon.className = `${isDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`;

    // Tooltip titles
    modalActionAdd.title = isAdded ? 'Remove from My List' : 'Add to My List';
    modalActionLike.title = isLiked ? 'Unlike' : 'Like';
    modalActionDislike.title = isDisliked ? 'Remove rating' : 'Dislike';

    // Set video
    video.src = movie.videoUrl;
    video.load();
    playerOverlay.classList.remove('hidden');

    if (autoPlay) {
      video.play().catch(() => { });
      playerOverlay.classList.add('hidden');
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.body.style.overflow = '';
    currentModalMovieId = null;
  }

  $('#modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Play big button (poster overlay)
  $('#modal-play-big').addEventListener('click', () => {
    video.play().catch(() => { });
    playerOverlay.classList.add('hidden');
  });

  // Modal action bar — Play
  if (modalActionPlay) {
    modalActionPlay.addEventListener('click', () => {
      video.play().catch(() => { });
      playerOverlay.classList.add('hidden');
      // Scroll video into view
      $('#modal-player-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Modal action bar — Add to List
  if (modalActionAdd) {
    modalActionAdd.addEventListener('click', () => {
      if (!currentModalMovieId) return;
      const isAdded = toggleMyList(currentModalMovieId);
      if (isAdded === 'FULL') {
        showToast('My List is full (max 50 movies).', 'error');
        return;
      }
      modalAddIcon.className = `fa-solid ${isAdded ? 'fa-check' : 'fa-plus'}`;
      modalActionAdd.title = isAdded ? 'Remove from My List' : 'Add to My List';
      showToast(isAdded ? 'Added to My List' : 'Removed from My List', 'success');

      // Also sync the poster card in the row if visible
      syncPosterButton(currentModalMovieId, '[data-add]',
        `<i class="fa-solid ${isAdded ? 'fa-check' : 'fa-plus'}"></i>`);
    });
  }

  // Modal action bar — Like
  if (modalActionLike) {
    modalActionLike.addEventListener('click', () => {
      if (!currentModalMovieId) return;
      const isLiked = toggleLikeMovie(currentModalMovieId);
      modalLikeIcon.className = `${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`;
      modalDislikeIcon.className = 'fa-regular fa-thumbs-down'; // clear dislike
      modalActionLike.title = isLiked ? 'Unlike' : 'Like';
      modalActionDislike.title = 'Dislike';

      syncPosterButton(currentModalMovieId, '[data-like]',
        `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i>`);
      syncPosterButton(currentModalMovieId, '[data-dislike]',
        `<i class="fa-regular fa-thumbs-down"></i>`);
    });
  }

  // Modal action bar — Dislike
  if (modalActionDislike) {
    modalActionDislike.addEventListener('click', () => {
      if (!currentModalMovieId) return;
      const isDisliked = toggleDislikeMovie(currentModalMovieId);
      modalDislikeIcon.className = `${isDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`;
      modalLikeIcon.className = 'fa-regular fa-thumbs-up'; // clear like
      modalActionDislike.title = isDisliked ? 'Remove rating' : 'Dislike';
      modalActionLike.title = 'Like';

      syncPosterButton(currentModalMovieId, '[data-dislike]',
        `<i class="${isDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down"></i>`);
      syncPosterButton(currentModalMovieId, '[data-like]',
        `<i class="fa-regular fa-thumbs-up"></i>`);
    });
  }

  /** Update matching poster card button in the rows (if visible) */
  function syncPosterButton(movieId, selector, html) {
    const btn = rowsContainer.querySelector(`${selector}="${movieId}"]`);
    if (btn) btn.innerHTML = html;
  }

  // Show overlay when video ends
  video.addEventListener('ended', () => {
    playerOverlay.classList.remove('hidden');
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });



  /* ─────────────────────────────────────────
     5. NAVBAR
  ───────────────────────────────────────── */

  // Scroll detection
  const browseNav = $('#browse-nav');
  window.addEventListener('scroll', () => {
    browseNav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Profile dropdown
  const profile = $('#profile-toggle');
  profile.addEventListener('click', (e) => {
    e.stopPropagation();
    profile.classList.toggle('open');
  });
  document.addEventListener('click', () => profile.classList.remove('open'));

  // Logout
  $('#logout-btn').addEventListener('click', () => logout());

  // Mobile menu
  const mobileBtnEl = $('#mobile-menu-btn');
  const mobileOverlay = $('#mobile-nav-overlay');
  if (mobileBtnEl && mobileOverlay) {
    mobileBtnEl.addEventListener('click', () => {
      mobileOverlay.classList.toggle('open');
    });
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target === mobileOverlay) {
        mobileOverlay.classList.remove('open');
      }
    });
  }

})();
