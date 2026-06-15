// ==UserScript==
// @name         Video Rotate 90° with Fit - Erome
// @namespace    https://github.com/danmaclann
// @version      1.0
// @description  Adds a button to rotate video 90° and resize to fit, keeping rotation in fullscreen mode
// @author       You
// @match        *://*.erome.com/a/*
// @grant        none
// @downloadURL  https://github.com/danmaclann/erome_rotate_script/raw/refs/heads/main/erome_rotate.user.js
// @updateURL    https://github.com/danmaclann/erome_rotate_script/raw/refs/heads/main/erome_rotate.user.js
// @icon         https://www.erome.com/android-chrome-192x192.png
// ==/UserScript==

(function () {
    'use strict';

    const STATE = {
        rotation: 0
    };

    function getPlayer() {
        return document.querySelector('.player.video-js');
    }

    function getVideo() {
        return document.querySelector('.player.video-js video.vjs-tech');
    }

    function normalizeRotation(deg) {
        deg %= 360;
        if (deg < 0) deg += 360;
        return deg;
    }

    function isSideways(rotation) {
        const r = normalizeRotation(rotation);
        return r === 90 || r === 270;
    }

    function ensureButtons() {
        const player = getPlayer();
        if (!player) return;

        const controlBar = player.querySelector('.vjs-control-bar');
        if (!controlBar) return;

        if (!player.querySelector('.tm-rotate-left')) {
            const leftBtn = document.createElement('button');
            leftBtn.className = 'tm-rotate-left vjs-control vjs-button';
            leftBtn.type = 'button';
            leftBtn.textContent = '⟲';
            leftBtn.title = 'Rotate left 90°';
            leftBtn.setAttribute('aria-label', 'Rotate left 90 degrees');
            leftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                STATE.rotation -= 90;
                applyRotation();
            });

            const fsBtn = controlBar.querySelector('.vjs-fullscreen-control');
            if (fsBtn) controlBar.insertBefore(leftBtn, fsBtn);
            else controlBar.appendChild(leftBtn);
        }

        if (!player.querySelector('.tm-rotate-right')) {
            const rightBtn = document.createElement('button');
            rightBtn.className = 'tm-rotate-right vjs-control vjs-button';
            rightBtn.type = 'button';
            rightBtn.textContent = '⟳';
            rightBtn.title = 'Rotate right 90°';
            rightBtn.setAttribute('aria-label', 'Rotate right 90 degrees');
            rightBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                STATE.rotation += 90;
                applyRotation();
            });

            const fsBtn = controlBar.querySelector('.vjs-fullscreen-control');
            if (fsBtn) controlBar.insertBefore(rightBtn, fsBtn);
            else controlBar.appendChild(rightBtn);
        }

        if (!player.querySelector('.tm-rotate-reset')) {
            const resetBtn = document.createElement('button');
            resetBtn.className = 'tm-rotate-reset vjs-control vjs-button';
            resetBtn.type = 'button';
            resetBtn.textContent = 'Reset';
            resetBtn.title = 'Reset rotation';
            resetBtn.setAttribute('aria-label', 'Reset rotation');
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                STATE.rotation = 0;
                applyRotation();
            });

            const fsBtn = controlBar.querySelector('.vjs-fullscreen-control');
            if (fsBtn) controlBar.insertBefore(resetBtn, fsBtn);
            else controlBar.appendChild(resetBtn);
        }
    }

    function applyRotation() {
        const player = getPlayer();
        const video = getVideo();
        if (!player || !video) return;

        const rotation = normalizeRotation(STATE.rotation);
        const sideways = isSideways(rotation);

        player.classList.toggle('tm-video-rotated', sideways);
        player.style.overflow = 'hidden';

        video.style.position = 'absolute';
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.transformOrigin = 'center center';
        video.style.objectFit = 'contain';
        video.style.maxWidth = 'none';
        video.style.maxHeight = 'none';

        if (sideways) {
            video.style.width = '100vh';
            video.style.height = '100vw';
        } else {
            video.style.width = '100%';
            video.style.height = '100%';
        }

        video.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    }

    function injectCss() {
        if (document.getElementById('tm-rotate-style')) return;

        const css = document.createElement('style');
        css.id = 'tm-rotate-style';
        css.textContent = `
            .player.video-js {
                overflow: hidden !important;
            }

            .player.video-js .vjs-tech {
                transform-origin: center center !important;
            }

            .player.video-js .vjs-control-bar {
                z-index: 30 !important;
            }

            .player.video-js .vjs-big-play-button,
            .player.video-js .erome-dl-btn-video,
            .player.video-js .vjs-poster {
                z-index: 20 !important;
            }

            .player.video-js .tm-rotate-left,
            .player.video-js .tm-rotate-right,
            .player.video-js .tm-rotate-reset {
                min-width: 48px;
                font-size: 12px;
                line-height: 1;
            }

            .player.video-js.tm-video-rotated .vjs-control-bar {
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                transform: none !important;
            }
        `;
        document.head.appendChild(css);
    }

    function init() {
        injectCss();
        ensureButtons();
        applyRotation();
    }

    const mo = new MutationObserver(() => {
        init();
    });

    mo.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    document.addEventListener('fullscreenchange', () => {
        setTimeout(init, 100);
    });

    document.addEventListener('webkitfullscreenchange', () => {
        setTimeout(init, 100);
    });

    init();
})();
