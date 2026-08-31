(function () {
    var overlay =
        document.getElementById("weiOverlay");
    var videoWrap =
        document.getElementById("weiVideoWrap");
    var video =
        document.getElementById("weiVideo");
    var audio =
        document.getElementById("weiAudio");
    var audioBtn =
        document.getElementById("weiAudioBtn");
    var iconPause =
        document.getElementById("weiIconPause");
    var iconPlay =
        document.getElementById("weiIconPlay");
    var done = false;
    var audioUnlocked = false;

    // ── Samsung/Android fix ──
    // Non-muted audio.play() is not reliably accepted from a touchstart
    // gesture on Samsung Internet / Android Chrome (it IS accepted on iOS
    // Safari). Muted video is exempt from this restriction, so it always
    // worked fine. Fix: use touchstart only to silently "prime" the audio
    // element (play then immediately pause) so it's unlocked for this
    // session, without running the full open sequence from touchstart. The
    // actual sequence starts on click only, which both platforms accept
    // reliably — so audio and video always start together on both iPhone
    // and Samsung.
    function unlockAudio() {
        if (audioUnlocked) return;
        audioUnlocked = true;
        var p = audio.play();
        if (p && p.then) {
            p.then(function () {
                audio.pause();
                audio.currentTime = 0;
            }).catch(function () {});
        } else {
            audio.pause();
        }
    }

    function startVideo() {
        if (done) return;
        done = true;

        // Fade out envelope
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        setTimeout(function () {
            overlay.style.display = "none";
        }, 1400);

        // Show and play video
        videoWrap.classList.add("wei-video-in");
        var vp = video.play();
        if (vp && vp.catch)
            vp.catch(function () {});

        // Start music simultaneously
        audio.volume = 1;
        var ap = audio.play();
        if (ap && ap.catch)
            ap.catch(function () {});
    }

    function endSequence() {
        // Fade out video
        videoWrap.classList.remove(
            "wei-video-in",
        );
        videoWrap.classList.add(
            "wei-video-out",
        );
        setTimeout(function () {
            videoWrap.style.display = "none";
        }, 1400);

        // Show floating audio button
        audioBtn.style.visibility = "visible";
        audioBtn.style.opacity = "1";
    }

    // Prime audio silently on first touch, start the real sequence on click
    overlay.addEventListener(
        "touchstart",
        unlockAudio,
        {
            passive: true,
        },
    );
    overlay.addEventListener(
        "click",
        startVideo,
    );

    // Fade video 0.8s before end
    video.addEventListener(
        "timeupdate",
        function () {
            if (
                video.duration &&
                video.currentTime >=
                    video.duration - 0.8 &&
                !video.dataset.fading
            ) {
                video.dataset.fading = "1";
                endSequence();
            }
        },
    );

    // Audio button toggle
    audioBtn.addEventListener(
        "click",
        function () {
            if (audio.paused) {
                audio.play();
                iconPlay.style.display = "none";
                iconPause.style.display =
                    "block";
            } else {
                audio.pause();
                iconPlay.style.display =
                    "block";
                iconPause.style.display =
                    "none";
            }
        },
    );

    video.load();
})();
