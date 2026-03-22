/* =====================================================
   AUTH — Login / Signup / Session guard
   Uses functions from users.js (loaded before this file).
   ===================================================== */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Handle login form submission.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message: string }}
 */
function handleLogin(email, password) {
  email = email.trim();
  password = password.trim();

  if (!email) return { success: false, message: 'Email is required.' };
  if (!EMAIL_REGEX.test(email)) return { success: false, message: 'Enter a valid email address.' };
  if (!password) return { success: false, message: 'Password is required.' };
  if (password.length < 4) return { success: false, message: 'Password must be at least 4 characters.' };

  const user = findUser(email, password);
  if (!user) return { success: false, message: 'Invalid email or password.' };

  setSession(user);
  return { success: true, message: 'Welcome back, ' + user.name + '!' };
}

/**
 * Handle signup form submission.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message: string }}
 */
function handleSignup(name, email, password) {
  name = name.trim();
  email = email.trim();
  password = password.trim();

  if (!name) return { success: false, message: 'Name is required.' };
  if (name.length < 2) return { success: false, message: 'Name must be at least 2 characters.' };
  if (!email) return { success: false, message: 'Email is required.' };
  if (!EMAIL_REGEX.test(email)) return { success: false, message: 'Enter a valid email address.' };
  if (!password) return { success: false, message: 'Password is required.' };
  if (password.length < 4) return { success: false, message: 'Password must be at least 4 characters.' };

  const result = registerUser(name, email, password);
  if (!result.success) return result;

  setSession(result.user);
  return { success: true, message: 'Welcome, ' + name + '!' };
}

/**
 * Auth guard — call on protected pages.
 * Redirects to login if not authenticated.
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.replace('login.html');
    return false;
  }
  return true;
}

/** Logout and redirect */
function logout() {
  clearSession();
  window.location.replace('index.html');
}
