/* =====================================================
   USERS — Dummy credentials & session management
   ===================================================== */

/** Default dummy users */
const DEFAULT_USERS = [
  { email: "test@netflix.com",  password: "netflix123", name: "Demo User" },
  { email: "demo@netflix.com",  password: "demo123",    name: "Demo User" },
  { email: "admin@netflix.com", password: "admin123",   name: "Admin" }
];

/** Load users from localStorage or use defaults */
function getUsers() {
  const stored = localStorage.getItem('netflix_users');
  if (stored) {
    try { return JSON.parse(stored); }
    catch { /* fall through */ }
  }
  // Initialise with defaults
  localStorage.setItem('netflix_users', JSON.stringify(DEFAULT_USERS));
  return [...DEFAULT_USERS];
}

/** Save users array to localStorage */
function saveUsers(users) {
  localStorage.setItem('netflix_users', JSON.stringify(users));
}

/** Find a user by email & password — returns user object or null */
function findUser(email, password) {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) || null;
}

/** Register a new user. Returns { success, message, user? } */
function registerUser(name, email, password) {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);
  return { success: true, message: 'Account created!', user: newUser };
}

/** Store logged-in session */
function setSession(user) {
  localStorage.setItem('netflix_session', JSON.stringify({
    email: user.email,
    name: user.name,
    loggedInAt: Date.now()
  }));
}

/** Get current session — returns session object or null */
function getSession() {
  const raw = localStorage.getItem('netflix_session');
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

/** Check if user is logged in */
function isLoggedIn() {
  return getSession() !== null;
}

/** Clear session (logout) */
function clearSession() {
  localStorage.removeItem('netflix_session');
}
/** Get My List */
function getMyList() {
  const session = getSession();
  if (!session) return [];
  const raw = localStorage.getItem(`netflix_list_${session.email}`);
  return raw ? JSON.parse(raw) : [];
}

/** Toggle My List (Add/Remove) */
function toggleMyList(movieId) {
  const session = getSession();
  if (!session) return false;
  const list = getMyList();
  const index = list.indexOf(movieId);
  let added = false;
  if (index === -1) {
    if (list.length >= 50) return 'FULL';
    list.push(movieId);
    added = true;
  } else {
    list.splice(index, 1);
  }
  localStorage.setItem(`netflix_list_${session.email}`, JSON.stringify(list));
  return added;
}
/** Get Liked Movies */
function getLikedMovies() {
  const session = getSession();
  if (!session) return [];
  const raw = localStorage.getItem(`netflix_liked_${session.email}`);
  return raw ? JSON.parse(raw) : [];
}

/** Toggle Like Movie */
function toggleLikeMovie(movieId) {
  const session = getSession();
  if (!session) return false;
  const list = getLikedMovies();
  const index = list.indexOf(movieId);
  let added = false;
  if (index === -1) {
    list.push(movieId);
    added = true;
    // Remove from dislikes if it was disliked
    const disliked = getDislikedMovies();
    const dIndex = disliked.indexOf(movieId);
    if (dIndex !== -1) {
      disliked.splice(dIndex, 1);
      localStorage.setItem(`netflix_disliked_${session.email}`, JSON.stringify(disliked));
    }
  } else {
    list.splice(index, 1); // remove like
  }
  localStorage.setItem(`netflix_liked_${session.email}`, JSON.stringify(list));
  return added;
}

/** Get Disliked Movies */
function getDislikedMovies() {
  const session = getSession();
  if (!session) return [];
  const raw = localStorage.getItem(`netflix_disliked_${session.email}`);
  return raw ? JSON.parse(raw) : [];
}

/** Toggle Dislike Movie */
function toggleDislikeMovie(movieId) {
  const session = getSession();
  if (!session) return false;
  const list = getDislikedMovies();
  const index = list.indexOf(movieId);
  let added = false;
  if (index === -1) {
    list.push(movieId);
    added = true;
    // Remove from likes if it was liked
    const liked = getLikedMovies();
    const lIndex = liked.indexOf(movieId);
    if (lIndex !== -1) {
      liked.splice(lIndex, 1);
      localStorage.setItem(`netflix_liked_${session.email}`, JSON.stringify(liked));
    }
  } else {
    list.splice(index, 1); // remove dislike
  }
  localStorage.setItem(`netflix_disliked_${session.email}`, JSON.stringify(list));
  return added;
}

