t_onReady(function () {
    t_onFuncLoad(
        "t_loadJsFile",
        function () {
            t_loadJsFile(
                "https://static.tildacdn.net/js/tilda-variant-select-1.0.min.js",
                function () {
                    t_onFuncLoad(
                        "t_input_radiobuttons_init",
                        function () {
                            try {
                                t_input_radiobuttons_init(
                                    "2487446233",
                                    "1778524967946",
                                );
                            } catch (e) {
                                console.log(
                                    e,
                                );
                            }
                        },
                    );
                },
            );
        },
    );
});
