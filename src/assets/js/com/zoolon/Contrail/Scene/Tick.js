Contrail.Tick = function (pathId, lat, lng, timestamp, data) {
    this.pathId = pathId;
    this.lat = lat;
    this.lng = lng;
    this.timestamp = timestamp;
    this.data = data;
    this.position = null;

};

Contrail.Tick.prototype.getPosition = function () {
    if (this.position == null) {
        this.position = Cesium.Cartesian3.fromDegrees(this.lng, this.lat, 0)
    }
    return this.position;

};