Contrail.Runner = function (settings, runners) {

    this.settings = settings;
    var style = settings.style;

    this.graphic = runners.add({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        pixelSize: style.pixelSize,
        outlineColor: Cesium.Color.fromBytes(style.outlineColor[0], style.outlineColor[1], style.outlineColor[2], style.outlineColor[3]),
        outlineWidth: style.outlineWidth,
        color: Cesium.Color.fromBytes(style.color[0], style.color[1], style.color[2], style.color[3]),
        // color: Cesium.Color.fromRandom().withAlpha(1),
        show: true
    });
};

Contrail.Runner.prototype.move = function (targetPos) {

    if (this.graphic) {
        if (this.graphic.show == false) {
            this.graphic.show = true;
        }

        this.graphic.position = targetPos;
    }
    else {
        console.log("no")
    }

};

Contrail.Runner.prototype.getPosition = function () {
    if (this.graphic) {
        return this.graphic.position;
    }

    return null;
};

Contrail.Runner.prototype.hide = function () {

    if (this.graphic) {
        this.graphic.show = false;
    }

};
