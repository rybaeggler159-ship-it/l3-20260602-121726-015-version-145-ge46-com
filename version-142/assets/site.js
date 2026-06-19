(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var menuToggle = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  qsa('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
      image.setAttribute('aria-hidden', 'true');
    });
  });

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var list = qs('[data-card-list]');
    var input = qs('[data-local-search]', panel);
    var buttons = qsa('[data-filter]', panel);
    var activeFilter = 'all';

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.textContent
      ].join(' '));
    }

    function applyFilter() {
      if (!list) {
        return;
      }

      var keyword = normalize(input ? input.value : '');
      var visible = 0;

      qsa('.movie-card', list).forEach(function (card) {
        var text = cardText(card);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
        var shouldShow = matchKeyword && matchFilter;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      var old = qs('.no-results', list.parentNode);
      if (old) {
        old.remove();
      }

      if (!visible) {
        var empty = document.createElement('div');
        empty.className = 'no-results jelly-card';
        empty.textContent = '当前筛选条件下暂无结果。';
        list.parentNode.insertBefore(empty, list.nextSibling);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = button.dataset.filter || 'all';
        applyFilter();
      });
    });
  });

  function renderSearch() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');
    var input = qs('[data-search-input]');

    if (!results || !summary || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card jelly-card">',
        '  <a href="' + escapeHtml(movie.url) + '">',
        '    <div class="poster-wrap video-card-hover">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy" />',
        '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="poster-score">' + escapeHtml(movie.score) + '</span>',
        '      <span class="play-hover">▶</span>',
        '    </div>',
        '    <div class="movie-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '      <div class="tag-row">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function runSearch(value) {
      var term = normalize(value);

      if (!term) {
        summary.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      var matched = data.filter(function (movie) {
        return normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' ')
        ].join(' ')).indexOf(term) !== -1;
      }).slice(0, 120);

      summary.textContent = '找到 ' + matched.length + ' 条相关结果。';
      results.innerHTML = matched.length
        ? matched.map(card).join('')
        : '<div class="no-results jelly-card">没有找到匹配内容，请更换关键词。</div>';
    }

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    runSearch(query);
  }

  renderSearch();
})();
