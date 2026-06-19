document.addEventListener("DOMContentLoaded", function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var message = shell.querySelector(".player-message");
    var sourceUrl = shell.getAttribute("data-video-url");
    var hlsInstance = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachSource() {
      if (video.getAttribute("data-source-attached") === "true") {
        return Promise.resolve();
      }

      video.setAttribute("data-source-attached", "true");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放源加载异常，请刷新页面或稍后重试。");
          }
        });
        return Promise.resolve();
      }

      video.src = sourceUrl;
      setMessage("当前浏览器可能不支持 HLS，已尝试直接载入播放源。");
      return Promise.resolve();
    }

    overlay.addEventListener("click", function () {
      attachSource().then(function () {
        var playPromise = video.play();
        shell.classList.add("is-playing");
        setMessage("");

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
          });
        }
      });
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
