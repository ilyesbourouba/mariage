function t_onReady(func) {
    if (document.readyState != "loading") {
        func();
    } else {
        document.addEventListener("DOMContentLoaded", func);
    }
}
function t_onFuncLoad(funcName, okFunc, time) {
    if (typeof window[funcName] === "function") {
        okFunc();
    } else {
        setTimeout(function () {
            t_onFuncLoad(funcName, okFunc, time);
        }, time || 100);
    }
}
function t396_initialScale(t) {
    var e = document.getElementById("rec" + t);
    if (e) {
        var i = e.querySelector(".t396__artboard");
        if (i) {
            window.tn_scale_initial_window_width ||
                (window.tn_scale_initial_window_width =
                    document.documentElement.clientWidth);
            var a = window.tn_scale_initial_window_width,
                r = [],
                n,
                l = i.getAttribute("data-artboard-screens");
            if (l) {
                l = l.split(",");
                for (var o = 0; o < l.length; o++)
                    r[o] = parseInt(l[o], 10);
            } else r = [320, 480, 640, 960, 1200];
            for (var o = 0; o < r.length; o++) {
                var d = r[o];
                a >= d && (n = d);
            }
            var _ =
                    "edit" ===
                    window.allrecords.getAttribute(
                        "data-tilda-mode",
                    ),
                c =
                    "center" ===
                    t396_getFieldValue(i, "valign", n, r),
                s =
                    "grid" ===
                    t396_getFieldValue(i, "upscale", n, r),
                w = t396_getFieldValue(i, "height_vh", n, r),
                g = t396_getFieldValue(i, "height", n, r),
                u =
                    (!!window.opr && !!window.opr.addons) ||
                    !!window.opera ||
                    -1 !== navigator.userAgent.indexOf(" OPR/");
            if (!_ && c && !s && !w && g && !u) {
                var h = parseFloat((a / n).toFixed(3)),
                    f = [
                        i,
                        i.querySelector(".t396__carrier"),
                        i.querySelector(".t396__filter"),
                    ],
                    v = Math.floor(parseInt(g, 10) * h) + "px",
                    p;
                i.style.setProperty("--initial-scale-height", v);
                for (var o = 0; o < f.length; o++)
                    f[o].style.setProperty(
                        "height",
                        "var(--initial-scale-height)",
                    );
                t396_scaleInitial__getElementsToScale(i).forEach(
                    function (t) {
                        t.style.zoom = h;
                    },
                );
            }
        }
    }
}
function t396_scaleInitial__getElementsToScale(t) {
    return t
        ? Array.prototype.slice
              .call(t.children)
              .filter(function (t) {
                  return (
                      t &&
                      (t.classList.contains("t396__elem") ||
                          t.classList.contains("t396__group"))
                  );
              })
        : [];
}
function t396_getFieldValue(t, e, i, a) {
    var r,
        n = a[a.length - 1];
    if (
        !(r =
            i === n
                ? t.getAttribute("data-artboard-" + e)
                : t.getAttribute(
                      "data-artboard-" + e + "-res-" + i,
                  ))
    )
        for (var l = 0; l < a.length; l++) {
            var o = a[l];
            if (
                !(o <= i) &&
                (r =
                    o === n
                        ? t.getAttribute("data-artboard-" + e)
                        : t.getAttribute(
                              "data-artboard-" + e + "-res-" + o,
                          ))
            )
                break;
        }
    return r;
}
((window.TN_SCALE_INITIAL_VER = "1.0"),
    (window.tn_scale_initial_window_width = null));
