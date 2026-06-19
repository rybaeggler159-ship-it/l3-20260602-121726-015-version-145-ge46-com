(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    if (slides.length) {
      showSlide(0);
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));
    filterForms.forEach(function (form) {
      var input = form.querySelector("input[name='filter-q']");
      var year = form.querySelector("select[name='filter-year']");
      var region = form.querySelector("select[name='filter-region']");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
      var empty = document.querySelector(".empty-result");

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchRegion = !regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
          var visible = matchKeyword && matchYear && matchRegion;

          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        applyFilter();
      }
    });
  });

  window.initMoviePlayer = function (videoSource) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var errorBox = document.querySelector(".player-error");
    var hls = null;
    var attached = false;

    if (!video || !videoSource) {
      return;
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add("is-visible");
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoSource);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showError("播放暂不可用，请稍后再试");
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            showError("播放暂不可用，请稍后再试");
          } else {
            showError("播放暂不可用，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSource;
      } else {
        showError("播放暂不可用，请稍后再试");
      }
    }

    function startPlayback() {
      attachSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
