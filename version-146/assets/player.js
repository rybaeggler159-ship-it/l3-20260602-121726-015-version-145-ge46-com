function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var attached = false;
  var hls = null;

  function attachStream() {
    if (!video || attached) {
      return;
    }
    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
  }

  function startPlay() {
    attachStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (!video) {
    return;
  }

  if (overlay) {
    overlay.addEventListener('click', startPlay);
  }

  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function() {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('click', function() {
    if (video.paused) {
      startPlay();
    }
  });

  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
    }
  });
}
