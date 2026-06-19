document.addEventListener("DOMContentLoaded", function () {
  bindMobileMenu();
  bindHeroCarousel();
  bindFilters();
  applyQueryStringFilters();
});

function bindMobileMenu() {
  var toggle = document.querySelector(".menu-toggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    document.body.classList.toggle("menu-open");
  });
}

function bindHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");

  if (!slides.length) {
    return;
  }

  var current = 0;
  var timer = window.setInterval(function () {
    showSlide(current + 1);
  }, 5200);

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      restart();
    });
  }
}

function bindFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

  scopes.forEach(function (scope) {
    var searchInput = scope.querySelector("[data-live-search]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var regionSelect = scope.querySelector("[data-filter-region]");
    var yearSelect = scope.querySelector("[data-filter-year-select]");
    var yearButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-year]"));
    var clearButton = scope.querySelector("[data-clear-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card-list] > article, [data-card-list] > a"));
    var count = scope.querySelector("[data-result-count]");
    var selectedYear = "";

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function cardText(card) {
      return normalized([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" "));
    }

    function update() {
      var query = normalized(searchInput ? searchInput.value : "");
      var selectedType = normalized(typeSelect ? typeSelect.value : "");
      var selectedRegion = normalized(regionSelect ? regionSelect.value : "");
      var selectedYearValue = normalized(yearSelect ? yearSelect.value : selectedYear);
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var cardType = normalized(card.getAttribute("data-type"));
        var cardRegion = normalized(card.getAttribute("data-region"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var matches = true;

        if (query && text.indexOf(query) === -1) {
          matches = false;
        }

        if (selectedType && cardType !== selectedType) {
          matches = false;
        }

        if (selectedRegion && cardRegion !== selectedRegion) {
          matches = false;
        }

        if (selectedYearValue && cardYear !== selectedYearValue) {
          matches = false;
        }

        card.classList.toggle("is-hidden", !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", update);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", update);
    }

    if (regionSelect) {
      regionSelect.addEventListener("change", update);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", update);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedYear = button.getAttribute("data-filter-year") || "";
        yearButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        update();
      });
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        selectedYear = "";
        if (searchInput) {
          searchInput.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        yearButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        update();
      });
    }

    update();
  });
}

function applyQueryStringFilters() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var type = params.get("type") || "";
  var sort = params.get("sort") || "";

  var searchInput = document.querySelector("[data-live-search]");
  var typeSelect = document.querySelector("[data-filter-type]");

  if (searchInput && query) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event("input"));
  }

  if (typeSelect && type) {
    typeSelect.value = type;
    typeSelect.dispatchEvent(new Event("change"));
  }

  if (sort === "year") {
    var cardList = document.querySelector("[data-card-list]");
    if (cardList) {
      var cards = Array.prototype.slice.call(cardList.children);
      cards.sort(function (a, b) {
        var yearA = parseInt(a.getAttribute("data-year"), 10) || 0;
        var yearB = parseInt(b.getAttribute("data-year"), 10) || 0;
        return yearB - yearA;
      });
      cards.forEach(function (card) {
        cardList.appendChild(card);
      });
    }
  }
}
