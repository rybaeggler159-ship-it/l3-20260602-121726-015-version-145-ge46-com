(function () {
  function initMoviePlayer(sourceUrl) {
    const video = document.querySelector("[data-player-video]");
    const cover = document.querySelector("[data-player-cover]");
    const starters = Array.from(document.querySelectorAll("[data-player-start]"));
    const Hls = window.Hls;
    let connected = false;
    let hls = null;

    if (!video || !sourceUrl) {
      return;
    }

    const connect = () => {
      if (connected) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      connected = true;
    };

    const play = async () => {
      connect();
      video.setAttribute("controls", "controls");
      if (cover) {
        cover.classList.add("is-hidden");
      }
      try {
        await video.play();
      } catch (error) {
        video.focus();
      }
    };

    starters.forEach((button) => {
      button.addEventListener("click", play);
    });

    video.addEventListener("click", () => {
      if (!connected || video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
