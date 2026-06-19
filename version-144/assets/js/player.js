import { H as Hls } from './video-player.js';

const instances = new WeakMap();

function attachStream(video) {
    const source = video.getAttribute('data-stream');
    if (!source || video.dataset.ready === '1') {
        return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        instances.set(video, hls);
        return;
    }
    video.src = source;
}

function startPlayer(shell) {
    const video = shell.querySelector('.js-player');
    if (!video) {
        return;
    }
    attachStream(video);
    video.setAttribute('controls', 'controls');
    shell.classList.add('is-playing');
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {
            shell.classList.remove('is-playing');
        });
    }
}

document.querySelectorAll('[data-player]').forEach((shell) => {
    shell.querySelectorAll('[data-play-trigger]').forEach((button) => {
        button.addEventListener('click', () => startPlayer(shell));
    });
    const video = shell.querySelector('.js-player');
    if (video) {
        video.addEventListener('click', () => {
            if (!shell.classList.contains('is-playing')) {
                startPlayer(shell);
            }
        });
    }
});
