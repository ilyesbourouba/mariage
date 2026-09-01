/* Algerian wedding sections: scroll reveal, calendar file, RSVP submit. */
(function () {
    "use strict";

    /* ------------------------------------------------------------------
       À CONFIGURER — remplacer ces deux valeurs.
       WHATSAPP : numéro au format international sans "+" ni espaces.
       FORMSPREE: endpoint https://formspree.io/f/xxxxxxx (ou autre service).
                  Laisser vide -> le formulaire bascule sur WhatsApp.
       ------------------------------------------------------------------ */
    var WHATSAPP = "213698095449";
    var FORMSPREE = "https://formspree.io/f/xzebendd";

    /* --- date de l'événement : 20 octobre 2026, 16h00, heure d'Algérie --- */
    var EVENT_START = "20261020T150000Z"; // 16:00 UTC+1
    var EVENT_END = "20261020T210000Z"; // 22:00 UTC+1

    /* --- reveal on scroll --------------------------------------------- */
    function initReveal() {
        var els = document.querySelectorAll(".dz-reveal, .dz-orn");
        if (!els.length) return;

        if (!("IntersectionObserver" in window)) {
            Array.prototype.forEach.call(els, function (el) {
                el.classList.add("is-in");
            });
            Array.prototype.forEach.call(
                document.querySelectorAll(".dz-title"),
                function (t) {
                    t.classList.add("is-lit");
                },
            );
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-in");
                    var title = entry.target.querySelector(".dz-title");
                    if (title) title.classList.add("is-lit");
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

        /* Le décalage repart de zéro à chaque section, sinon tout ce qui
           suit la première hérite du délai maximum. */
        var counts = {};
        Array.prototype.forEach.call(els, function (el) {
            if (el.classList.contains("dz-reveal")) {
                var sec = el.closest(".dz-section");
                var key = (sec && sec.id) || "_";
                counts[key] = (counts[key] || 0) + 1;
                el.style.transitionDelay =
                    Math.min(counts[key] - 1, 5) * 0.09 + "s";
            }
            io.observe(el);
        });
    }

    /* --- .ics ---------------------------------------------------------- */
    function initCalendar() {
        var btn = document.getElementById("dzCalendar");
        if (!btn) return;

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            var ics = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Ilyes et Yasmine//Mariage//FR",
                "BEGIN:VEVENT",
                "UID:mariage-ilyes-yasmine-20261020",
                "DTSTAMP:" + EVENT_START,
                "DTSTART:" + EVENT_START,
                "DTEND:" + EVENT_END,
                "SUMMARY:Mariage d'Ilyes et Yasmine",
                "LOCATION:Salle des Fetes Palais Layal, Alger",
                "DESCRIPTION:Nous serions honores de votre presence.",
                "GEO:36.7865474;3.2468925",
                "END:VEVENT",
                "END:VCALENDAR",
            ].join("\r\n");

            var blob = new Blob([ics], {
                type: "text/calendar;charset=utf-8",
            });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "mariage-ilyes-yasmine.ics";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 1000);
        });
    }

    /* --- RSVP ---------------------------------------------------------- */
    function buildMessage(data) {
        var lines = [
            "Confirmation de présence — Mariage Ilyes & Yasmine",
            "",
            "Famille : " + (data.famille || "—"),
            "Nom : " + (data.nom || "—"),
            "Téléphone : " + (data.telephone || "—"),
            "Réponse : " + (data.reponse || "—"),
        ];
        if (data.reponse !== "Avec regret, je ne pourrai pas venir") {
            lines.push("Adultes : " + (data.adultes || "0"));
        }
        if (data.chanson) lines.push("Chanson : " + data.chanson);
        if (data.message) lines.push("Message : " + data.message);
        return lines.join("\n");
    }

    function initForm() {
        var form = document.getElementById("dzRsvp");
        if (!form) return;

        var status = document.getElementById("dzRsvpStatus");
        var counts = document.getElementById("dzCounts");
        var radios = form.querySelectorAll('input[name="reponse"]');

        function syncCounts() {
            var declined = form.querySelector('input[name="reponse"]:checked');
            var isNo =
                declined && declined.value.indexOf("ne pourrai pas") !== -1;
            if (counts) counts.style.display = isNo ? "none" : "";
        }

        Array.prototype.forEach.call(radios, function (r) {
            r.addEventListener("change", syncCounts);
        });
        syncCounts();

        function say(msg, ok) {
            if (!status) return;
            status.textContent = msg;
            status.className = "dz-form__status " + (ok ? "is-ok" : "is-err");
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var fd = new FormData(form);
            var data = {};
            fd.forEach(function (v, k) {
                data[k] = typeof v === "string" ? v.trim() : v;
            });

            if (!data.nom || !data.telephone || !data.reponse) {
                say(
                    "Merci de renseigner votre nom, votre téléphone et votre réponse.",
                    false,
                );
                return;
            }

            /* Pas d'endpoint configuré : on envoie via WhatsApp. */
            if (!FORMSPREE) {
                var url =
                    "https://wa.me/" +
                    WHATSAPP +
                    "?text=" +
                    encodeURIComponent(buildMessage(data));
                window.open(url, "_blank", "noopener");
                say(
                    "Merci ! WhatsApp s'ouvre avec votre réponse — il ne reste plus qu'à l'envoyer.",
                    true,
                );
                return;
            }

            /* Récapitulatif lisible + sujet, pour l'e-mail Formspree. */
            if (data.reponse === "Avec regret, je ne pourrai pas venir") {
                fd.delete("adultes");
                delete data.adultes;
            }
            fd.set(
                "_subject",
                "RSVP mariage — " +
                    (data.famille || data.nom) +
                    " — " +
                    (data.adultes ? data.adultes + " adulte(s)" : "ne vient pas"),
            );
            fd.set("recapitulatif", buildMessage(data));

            var btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.dataset.label = btn.textContent;
                btn.textContent = "Envoi…";
            }

            fetch(FORMSPREE, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: fd,
            })
                .then(function (res) {
                    if (!res.ok) throw new Error(res.status);
                    form.reset();
                    syncCounts();
                    say(
                        "Merci ! Votre réponse nous est bien parvenue. À très bientôt, inchallah.",
                        true,
                    );
                })
                .catch(function () {
                    say(
                        "L'envoi a échoué. Vous pouvez nous confirmer directement sur WhatsApp.",
                        false,
                    );
                })
                .finally(function () {
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = btn.dataset.label || "Envoyer";
                    }
                });
        });

        /* Lien WhatsApp de secours sous le formulaire. */
        var wa = document.getElementById("dzWhatsApp");
        if (wa) wa.href = "https://wa.me/" + WHATSAPP;
    }

    /* --- scroll-driven motion ------------------------------------------
       Un seul écouteur de scroll, tout passe par requestAnimationFrame et
       n'écrit que des transforms / hauteurs : pas de reflow en boucle.
       -------------------------------------------------------------------- */
    function initMotion() {
        var reduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            var fillStatic = document.querySelector(".dz-timeline__fill");
            if (fillStatic) fillStatic.style.height = "100%";
            Array.prototype.forEach.call(
                document.querySelectorAll(".dz-step__dot"),
                function (d) {
                    d.classList.add("is-lit");
                },
            );
            return;
        }

        var bar = document.querySelector(".dz-progress__bar");
        var layers = [];
        var rail = document.querySelector(".dz-timeline__rail");
        var fill = document.querySelector(".dz-timeline__fill");
        var dots = [];
        var ticking = false;

        Array.prototype.forEach.call(
            document.querySelectorAll("[data-dz-parallax]"),
            function (el) {
                layers.push({
                    el: el,
                    speed:
                        parseFloat(el.getAttribute("data-dz-parallax")) || 0.1,
                });
            },
        );

        Array.prototype.forEach.call(
            document.querySelectorAll(".dz-step"),
            function (step) {
                var dot = step.querySelector(".dz-step__dot");
                if (dot) dots.push(dot);
            },
        );

        function frame() {
            ticking = false;
            var vh = window.innerHeight;

            /* barre de progression */
            if (bar) {
                var doc = document.documentElement;
                var max = doc.scrollHeight - vh;
                var p = max > 0 ? doc.scrollTop / max : 0;
                bar.style.transform =
                    "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
            }

            /* calques en parallaxe */
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                var r = l.el.getBoundingClientRect();
                if (r.bottom < -240 || r.top > vh + 240) continue;
                var centred = r.top + r.height / 2 - vh / 2;
                l.el.style.transform =
                    "translate3d(0," +
                    (-centred * l.speed).toFixed(1) +
                    "px,0)";
            }

            /* remplissage de la frise + points allumés */
            if (rail && fill) {
                var rr = rail.getBoundingClientRect();
                if (rr.bottom > -200 && rr.top < vh + 200) {
                    var line = vh * 0.55;
                    var prog = (line - rr.top) / rr.height;
                    prog = Math.min(1, Math.max(0, prog));
                    fill.style.height = (prog * 100).toFixed(2) + "%";
                    var lit = rr.top + rr.height * prog;
                    for (var d = 0; d < dots.length; d++) {
                        var dr = dots[d].getBoundingClientRect();
                        dots[d].classList.toggle(
                            "is-lit",
                            dr.top + dr.height / 2 <= lit,
                        );
                    }
                }
            }
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(frame);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        frame();
    }

    function init() {
        initReveal();
        initMotion();
        initCalendar();
        initForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
