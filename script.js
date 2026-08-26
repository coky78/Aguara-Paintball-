document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const cards = document.querySelectorAll('.card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [{opacity: 0, transform: 'translateY(24px)'}, {opacity: 1, transform: 'translateY(0)'}],
          {duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards'}
        );
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .12});
  cards.forEach(card => observer.observe(card));
});

const mobileMenu = document.querySelector('.mobile-menu');
const menuButton = document.querySelector('.menu-btn');
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuButton.textContent = mobileMenu.classList.contains('open') ? '×' : '☰';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuButton.textContent = '☰';
  }));
}
document.querySelectorAll('.faq-pro details').forEach(d => {
  d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('.faq-pro details').forEach(x => { if (x !== d) x.removeAttribute('open'); });
  });
});
