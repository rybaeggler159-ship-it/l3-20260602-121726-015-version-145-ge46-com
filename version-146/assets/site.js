(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function() {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  startHero();

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var list = document.querySelector('[data-filter-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var keyword = normalize(filterInput ? filterInput.value : '');
    var category = filterSelect ? filterSelect.value : 'all';
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = category === 'all' || card.getAttribute('data-category') === category;
      var show = matchKeyword && matchCategory;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  function runSort() {
    if (!list || !sortSelect) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var mode = sortSelect.value;

    cards.sort(function(a, b) {
      if (mode === 'year-desc') {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      }
      if (mode === 'year-asc') {
        return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
      }
      if (mode === 'title-asc') {
        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
      }
      return 0;
    });

    cards.forEach(function(card) {
      list.appendChild(card);
    });
    runFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', runFilter);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', runFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', runSort);
  }

  runFilter();

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function() {
      backTop.classList.toggle('show', window.scrollY > 420);
    });
    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
