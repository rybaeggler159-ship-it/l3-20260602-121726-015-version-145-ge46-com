import { H as Hls } from './hls-vendor.js';

function setupHls(video, source, status) {
  if (!source) {
    status.textContent = '未找到播放源。';
    return null;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    status.textContent = '播放源已加载，正在使用浏览器原生 HLS。';
    return null;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      status.textContent = '高清播放源已就绪。';
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        status.textContent = '播放源加载失败，请稍后重试。';
        hls.destroy();
      }
    });
    return hls;
  }

  video.src = source;
  status.textContent = '当前浏览器不支持 HLS.js，已尝试直接加载播放源。';
  return null;
}

function initPlayer(root) {
  var video = root.querySelector('video');
  var button = root.querySelector('[data-play-button]');
  var status = root.querySelector('[data-player-status]');
  var hlsInstance = null;
  var initialized = false;

  if (!video || !button || !status) {
    return;
  }

  function ensureInitialized() {
    if (initialized) {
      return;
    }

    initialized = true;
    hlsInstance = setupHls(video, video.dataset.src, status);
  }

  button.addEventListener('click', function () {
    ensureInitialized();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        button.classList.add('is-hidden');
        status.textContent = '正在播放。';
      }).catch(function () {
        button.classList.remove('is-hidden');
        status.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
      });
    } else {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
    status.textContent = '正在播放。';
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
      status.textContent = '已暂停，点击继续播放。';
    }
  });

  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
    status.textContent = '播放结束。';
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
