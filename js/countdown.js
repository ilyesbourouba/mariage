(function () {
    // 20 octobre 2026, 16h00 heure d'Algerie (UTC+1) - ouverture des portes.
    // Fixe en UTC pour que le compte a rebours soit identique depuis l'etranger.
    var eventDate = new Date(
        Date.UTC(2026, 9, 20, 15, 0, 0),
    );
    var elDays =
        document.getElementById("days");
    var elHours =
        document.getElementById("hours");
    var elMins =
        document.getElementById("minutes");
    var elSecs =
        document.getElementById("seconds");
    var prev = {
        days: null,
        hours: null,
        minutes: null,
        seconds: null,
    };
    var revealed = false;
    // Les secondes changent chaque seconde : avec le bascule lent de 520ms
    // le chiffre restait invisible plus de la moitie du temps. On garde le
    // mouvement ample pour jours/heures/minutes, rapide pour les secondes.
    function flip(el, newVal, fast) {
        if (el.textContent === newVal)
            return;
        var wait = fast ? 130 : 520;
        if (fast) el.classList.add("flip-fast");
        el.classList.add("flip-out");
        setTimeout(function () {
            el.classList.remove("flip-out");
            el.classList.add("flip-in");
            el.textContent = newVal;
            el.offsetHeight;
            el.classList.remove("flip-in");
        }, wait);
    }
    function tick() {
        var now = new Date();
        var dist = eventDate - now;
        if (dist < 0) {
            document.getElementById(
                "countdownContainer",
            ).innerHTML = "\u00c0 tr\u00e8s bient\u00f4t !";
            return;
        }
        var d = String(
            Math.floor(dist / 86400000),
        );
        var h = String(
            Math.floor(
                (dist % 86400000) / 3600000,
            ),
        ).padStart(2, "0");
        var m = String(
            Math.floor(
                (dist % 3600000) / 60000,
            ),
        ).padStart(2, "0");
        var s = String(
            Math.floor(
                (dist % 60000) / 1000,
            ),
        ).padStart(2, "0");
        if (d !== prev.days) {
            flip(elDays, d);
            prev.days = d;
        }
        if (h !== prev.hours) {
            flip(elHours, h);
            prev.hours = h;
        }
        if (m !== prev.minutes) {
            flip(elMins, m);
            prev.minutes = m;
        }
        if (s !== prev.seconds) {
            flip(elSecs, s, true);
            prev.seconds = s;
        }
    }
    tick();
    setInterval(tick, 1000);
    function doReveal() {
        if (revealed) return;
        revealed = true;
        document
            .querySelectorAll(".number")
            .forEach(function (el) {
                el.classList.add(
                    "revealed",
                );
            });
        document
            .querySelectorAll(".label")
            .forEach(function (el) {
                el.classList.add(
                    "revealed",
                );
            });
        document
            .querySelectorAll(".separator")
            .forEach(function (el) {
                el.classList.add(
                    "revealed",
                );
            });
    }
    var observer = new IntersectionObserver(
        function (entries) {
            if (entries[0].isIntersecting) {
                doReveal();
                observer.disconnect();
            }
        },
        {
            threshold: 0.4,
        },
    );
    observer.observe(
        document.getElementById(
            "countdownContainer",
        ),
    );
    setTimeout(function () {
        var r = document
            .getElementById(
                "countdownContainer",
            )
            .getBoundingClientRect();
        if (
            r.top < window.innerHeight &&
            r.bottom > 0
        )
            doReveal();
    }, 200);
})();
