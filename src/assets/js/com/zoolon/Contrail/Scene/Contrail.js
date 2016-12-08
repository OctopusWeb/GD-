/*
 settings

 */

var Contrail = function (cesiumViewer, settings) {

    settings.timeline = settings.timeline ? settings.timeline : 1;

    //Cesium变量
    this.viewer = cesiumViewer;
    this.scene = this.viewer.scene;
    this.timeline = new Contrail.Timeline(cesiumViewer, this);
    this.timeline.speed(settings.timeline.speed);
    //
    this.settings = settings;
    this.dataSets = new Contrail.Array();
};


Contrail.prototype.addDataSet = function (dataSet) {

    this.dataSets.push(dataSet);
    this.scene.primitives.add(dataSet.runners);

};

Contrail.prototype.shift = function (dataSet) {

    if (this.dataSets.length > 0) {
        var ds = this.dataSets[0];
        ds.destroy();
        this.scene.primitives.remove(ds.runners);
        ds = null;
        this.dataSets.shift();
    }

    this.dataSets.push(dataSet);
    this.scene.primitives.add(dataSet.runners);

};


Contrail.prototype.ticker = function (that, timeline) {


    if (that.dataSets.length > 0) {
        var dataSet = that.dataSets[0];
        if (dataSet) {
            dataSet.show(timeline, that.settings);
        }


    }
};


Contrail.prototype.start = function () {
    this.timeline.start(this);
};

Contrail.prototype.fitView = function (geoRange, height, callback) {
    var center = Cesium.Rectangle.center(Cesium.Rectangle.fromDegrees(geoRange.minLng, geoRange.minLat, geoRange.maxLng, geoRange.maxLat));
    this.viewer.camera.flyTo({
        //destination: Cesium.Rectangle.fromDegrees(minLng, minLat, maxLng, maxLat)
        destination: Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, height),
        duration: 1,
        complete: function () {
            if (callback) {
                callback();
            }
        }
    });
};

Contrail.prototype.clear = function (dataSet) {
    this.timeline.stop(this);
    for (var i = 0; i < this.dataSets.length; i++) {
        var data = this.dataSets[i];
        data.destroy();
        this.scene.primitives.remove(data.runners);
        data = null;
    }

    this.dataSets = new Contrail.Array();
};