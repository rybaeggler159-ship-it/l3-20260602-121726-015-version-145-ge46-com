const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

const slider = document.querySelector("[data-hero-slider]");

if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const next = slider.querySelector("[data-hero-next]");
  const prev = slider.querySelector("[data-hero-prev]");
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle("is-active", itemIndex === current);
    });
    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle("is-active", itemIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      restart();
    });
  });

  if (next) {
    next.addEventListener("click", () => {
      showSlide(current + 1);
      restart();
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(current - 1);
      restart();
    });
  }

  if (slides.length > 1) {
    start();
  }
}

const normalize = (value) => String(value || "").trim().toLowerCase();

const applyFilter = (keyword) => {
  const list = document.querySelector("[data-filter-list]");
  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
  const query = normalize(keyword);
  let visibleCount = 0;

  cards.forEach((card) => {
    const haystack = normalize([
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.hot
    ].join(" "));
    const matched = !query || haystack.includes(query);
    card.style.display = matched ? "" : "none";
    if (matched) {
      visibleCount += 1;
    }
  });

  const empty = document.querySelector("[data-empty-state]");
  if (empty) {
    empty.classList.toggle("is-visible", visibleCount === 0);
  }
};

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";
const filterInput = document.querySelector("[data-filter-input]");

if (filterInput) {
  filterInput.value = initialQuery;
  applyFilter(initialQuery);
  filterInput.addEventListener("input", () => applyFilter(filterInput.value));
}

document.querySelectorAll("[data-inline-filter-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (form.hasAttribute("data-site-search-form") && form.getAttribute("action")) {
      return;
    }
    event.preventDefault();
    const input = form.querySelector("[data-filter-input]");
    applyFilter(input ? input.value : "");
  });
});

document.querySelectorAll("[data-site-search-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const input = form.querySelector("input[name='q']");
    if (!input) {
      return;
    }
    const value = input.value.trim();
    if (!value) {
      event.preventDefault();
      window.location.href = "./search.html";
    }
  });
});
