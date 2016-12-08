var Launcher = {
    root: "./Contrail",
    load: function (scriptURL) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = scriptURL;
        document.body.appendChild(script);
    },
    scripts: [
        "/Scene/Contrail.js",
        "/Scene/DataSet.js",
        "/Scene/Path.js",
        "/Scene/Runner.js",
        "/Scene/Tick.js",
        "/Util/Array.js",
        "/Util/Memory.js",
        "/Util/Tools.js"
    ],
    init: function () {
        for (var i = 0; i < this.scripts.length; i++) {
            var script = this.scripts[i];
            this.load(this.root + script);
        }
    }
};


Launcher.init();





