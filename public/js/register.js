document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.message || "Registration failed", "error");
        return;
      }

      showToast("Registration successful! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }
  });

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
