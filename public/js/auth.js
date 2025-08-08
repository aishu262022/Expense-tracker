document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    // For now, only visual tab switching. No form switching.
  });
}); 