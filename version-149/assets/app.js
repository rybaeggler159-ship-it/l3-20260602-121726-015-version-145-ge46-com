(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function updateGrid(targetId) {
        var grid = document.getElementById(targetId);
        if (!grid) {
            return;
        }
        var searchInput = document.querySelector('.site-search[data-target="' + targetId + '"]');
        var query = normalize(searchInput ? searchInput.value : "");
        var filters = selectAll('.movie-filter[data-target="' + targetId + '"]');
        var activeFilters = filters.map(function (filter) {
            return {
                key: filter.getAttribute("data-filter"),
                value: normalize(filter.value)
            };
        });

        selectAll(".movie-card", grid).forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchedText = !query || haystack.indexOf(query) !== -1;
            var matchedFilters = activeFilters.every(function (filter) {
                if (!filter.value) {
                    return true;
                }
                return normalize(card.getAttribute("data-" + filter.key)) === filter.value;
            });
            card.classList.toggle("is-filtered-out", !(matchedText && matchedFilters));
        });
    }

    function bindSearch() {
        selectAll(".site-search").forEach(function (input) {
            input.addEventListener("input", function () {
                updateGrid(input.getAttribute("data-target"));
            });
        });
        selectAll(".movie-filter").forEach(function (filter) {
            filter.addEventListener("change", function () {
                updateGrid(filter.getAttribute("data-target"));
            });
        });
    }

    function bindMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = selectAll(".hero-slide", carousel);
        var dots = selectAll(".hero-dot", carousel);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    window.initPlayer = function (videoUrl, videoId) {
        var video = document.getElementById(videoId);
        var button = document.querySelector(".video-start");
        if (!video || !videoUrl) {
            return;
        }
        var started = false;
        function start() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = videoUrl;
                }
            }
            if (button) {
                button.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        bindMenu();
        bindSearch();
        bindCarousel();
    });
})();
