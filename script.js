// Aguará Paintball - efectos simples de entrada
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});

document.querySelectorAll('.card, .promo-box, .reservation').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});
