/* Role-based auth (no PIN) + simple access control */
window.Auth = (() => {
  const SESSION = 'fmc_session';

  const ROLE_LABEL = {
    doctor: 'Doctor',
    counselor: 'Genetic Counselor',
    frontoffice: 'Front Office',
    admin: 'Admin'
  };

  // Page access matrix (tweak as you like)
  // If a page calls guardSessionOrRedirect(['doctor','admin']) only those roles can enter.
  // If it calls guardSessionOrRedirect() any logged-in role can enter.
  const DEFAULT_PERMS = {
    dashboard: ['doctor','counselor','frontoffice','admin'],
    bookings:  ['frontoffice','doctor','admin'],
    scan:      ['doctor','frontoffice'],          // FO can open to prep; Doctor finalizes
    counseling:['counselor','doctor','admin'],
    procedures:['doctor','admin'],
    compliance:['admin','doctor'],
    billing:   ['frontoffice','admin'],
    admin:     ['admin'],
    settings:  ['admin','doctor']
  };

  function signInWithRole(role) {
    if (!ROLE_LABEL[role]) throw new Error('Unknown role');
    const profile = {
      role,
      name: ROLE_LABEL[role],
      rmpRegNo: role === 'doctor' ? (localStorage.getItem('rmpRegNo') || '') : '',
      at: Date.now()
    };
    localStorage.setItem(SESSION, JSON.stringify(profile));
    return true;
  }

  function current() {
    const s = localStorage.getItem(SESSION);
    return s ? JSON.parse(s) : null;
  }

  function signOut() {
    localStorage.removeItem(SESSION);
    location.href = 'index.html';
  }

  // Idle lock (optional)
  function setupIdleLock() {
    if (localStorage.getItem('idleLock') !== '1') return;
    let t;
    const bump = () => { clearTimeout(t); t = setTimeout(() => signOut(), 5 * 60 * 1000); };
    ['click','keydown','pointermove','visibilitychange'].forEach(ev => document.addEventListener(ev, bump, {passive:true}));
    bump();
  }

  // Guard helpers
  function guardSessionOrRedirect(allowedRoles) {
    const s = current();
    if (!s) { location.href = 'index.html'; return; }
    if (Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(s.role)) {
      // Not allowed → send to dashboard
      location.href = 'dashboard.html';
    }
  }

  function showRoleBadge() {
    const s = current(); if (!s) return;
    const el = document.getElementById('roleBadge');
    if (el) el.textContent = `${ROLE_LABEL[s.role]}${s.rmpRegNo ? ' • ' + s.rmpRegNo : ''}`;
  }

  function pageAllowed(pageKey) {
    const s = current(); if (!s) return false;
    const allowed = DEFAULT_PERMS[pageKey] || DEFAULT_PERMS.dashboard;
    return allowed.includes(s.role);
  }

  return {
    signInWithRole,
    current,
    signOut,
    setupIdleLock,
    guardSessionOrRedirect,
    showRoleBadge,
    pageAllowed,
    ROLE_LABEL
  };
})();
