if (!window.mainTracker) {
    window.mainTracker = "tilda";
}
window.tildastatcookie = "no";
setTimeout(function () {
    (function (d, w, k, o, g) {
        var n = d.getElementsByTagName(o)[0],
            s = d.createElement(o),
            f = function () {
                n.parentNode.insertBefore(s, n);
            };
        s.type = "text/javascript";
        s.async = true;
        s.key = k;
        s.id = "tildastatscript";
        s.src = g;
        if (w.opera == "[object Opera]") {
            d.addEventListener("DOMContentLoaded", f, false);
        } else {
            f();
        }
    })(
        document,
        window,
        "aed5bb11e83b8f0989507efd8c6904b3",
        "script",
        "https://static.tildacdn.net/js/tilda-stat-1.0.min.js",
    );
}, 2000);
