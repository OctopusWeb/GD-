Contrail.Timeline = function (cesiumViewer, contrail) {
    this.timeline = cesiumViewer.timeline;
    this.clock = this.timeline._clock;
    this.isStart = false;
    this.contrail = contrail;


    var that = this;
    this.clock.onTick.addEventListener(function (clock) {

        if (that.isStart) {

            that.contrail.ticker(that.contrail, that);

        }
    })
};

Contrail.Timeline.prototype.currentTimestamp = function () {
    return Cesium.JulianDate.toDate(this.clock.currentTime).getTime();
};

Contrail.Timeline.prototype.zoomTo = function (start, end, cesiumClockRange) {
    this.clock.startTime = Cesium.JulianDate.fromDate(new Date(start));
    this.clock.stopTime = Cesium.JulianDate.fromDate(new Date(end));
    this.clock.currentTime = Cesium.JulianDate.fromDate(new Date(start));
    this.clock.clockRange = cesiumClockRange;
    this.timeline.zoomTo(Cesium.JulianDate.fromDate(new Date(start)), Cesium.JulianDate.fromDate(new Date(end)));

};

Contrail.Timeline.prototype.start = function () {
    this.isStart = true;

};

Contrail.Timeline.prototype.speed = function (speed) {
    this.clock.multiplier = speed;

};

Contrail.Timeline.prototype.stop = function () {
    this.isStart = false;
};