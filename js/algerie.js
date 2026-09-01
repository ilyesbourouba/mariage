/* Algerian wedding sections: scroll reveal, calendar file, RSVP submit. */
(function () {
    "use strict";

    /* ------------------------------------------------------------------
       À CONFIGURER — remplacer ces deux valeurs.
       WHATSAPP : numéro au format international sans "+" ni espaces.
       FORMSPREE: endpoint https://formspree.io/f/xxxxxxx (ou autre service).
                  Laisser vide -> le formulaire bascule sur WhatsApp.
       ------------------------------------------------------------------ */
    var WHATSAPP = "213XXXXXXXXX";
    var FORMSPREE = "";

    /* --- date de l'événement : 20 octobre 2026, 19h00, heure d'Algérie --- */
    var EVENT_START = "20261020T180000Z"; // 19:00 UTC+1
    var EVENT_END = "20261021T000000Z"; // 01:00 UTC+1

    /* --- reveal on scroll --------------------------------------------- */
    function initReveal() {
        var els = document.querySelectorAll(".dz-reveal");
        if (!els.length) return;

        if (!("IntersectionObserver" in window)) {
            Array.prototype.forEach.call(els, function (el) {
                el.classList.add("is-in");
            });
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

        Array.prototype.forEach.call(els, function (el, i) {
            el.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
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
            lines.push("Enfants : " + (data.enfants || "0"));
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
            var declined = form.querySelector(
                'input[name="reponse"]:checked',
            );
            var isNo =
                declined &&
                declined.value.indexOf("ne pourrai pas") !== -1;
            if (counts) counts.style.display = isNo ? "none" : "";
        }

        Array.prototype.forEach.call(radios, function (r) {
            r.addEventListener("change", syncCounts);
        });
        syncCounts();

        function say(msg, ok) {
            if (!status) return;
            status.textContent = msg;
            status.className =
                "dz-form__status " + (ok ? "is-ok" : "is-err");
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
                        btn.textContent =
                            btn.dataset.label || "Envoyer";
                    }
                });
        });

        /* Lien WhatsApp de secours sous le formulaire. */
        var wa = document.getElementById("dzWhatsApp");
        if (wa) wa.href = "https://wa.me/" + WHATSAPP;
    }

    function init() {
        initReveal();
        initCalendar();
        initForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
