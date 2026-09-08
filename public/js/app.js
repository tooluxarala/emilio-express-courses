document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert').forEach((alertEl) => {
    setTimeout(() => {
      alertEl.style.transition = 'opacity 0.4s ease';
      alertEl.style.opacity = '0';
      setTimeout(() => alertEl.remove(), 400);
    }, 5000);
  });
});
