(function () {
  const API = window.API_BASE_URL;

  if (localStorage.getItem('token')) {
    window.location.replace('dashboard.html');
    return;
  }

  const form = document.getElementById('auth-form');
  const submitBtn = document.getElementById('auth-submit');
  const errorEl = document.getElementById('auth-error');
  const tabs = document.querySelectorAll('.tab');

  let mode = 'login';

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      submitBtn.textContent = mode === 'login' ? 'Login' : 'Register';
      errorEl.textContent = '';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const formData = new FormData(form);
    const email = formData.get('email').trim();
    const password = formData.get('password');

    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'login' ? 'Signing in...' : 'Creating account...';

    try {
      const res = await fetch(`${API}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || 'Something went wrong';
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.user.email);
      window.location.replace('dashboard.html');
    } catch (err) {
      errorEl.textContent = 'Network error. Is the backend running?';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Login' : 'Register';
    }
  });
})();
