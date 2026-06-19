(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function playHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);
    playHero();

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        playHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        playHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        playHero();
      });
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search, .page-search'));

  function applySearch(value) {
    var query = value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !match);

      if (match) {
        visible += 1;
      }
    });

    var empty = document.querySelector('.empty-state');
    if (empty) {
      empty.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applySearch(input.value);

      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
    });
  });
})();
