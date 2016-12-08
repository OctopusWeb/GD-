Contrail.DataSet = function (id, timeRange) {
    this.id = id;
    this.timeRange = undefined;
    this.geoRange = {
        minLat: 90,
        maxLat: -90,
        minLng: 180,
        maxLng: 0,
    }
    this.ticks = new Contrail.Array();
    this.keys = {};
    this.paths = new Contrail.Map();
    this.runners = new Cesium.PointPrimitiveCollection();
//  this.runners._rs = Cesium.RenderState.fromCache({
//      depthTest: {
//          enabled: true
//      },
//      depthMask: false,
//      blending: Cesium.BlendingState.ADDITIVE_BLEND
//  });

    this.ended = 0;
    if (timeRange != undefined && !isNaN(timeRange.start) && !isNaN(timeRange.end)) {
        this.timeRange = timeRange;
    }


    this.state = "no start";
};


Contrail.DataSet.prototype.addTick = function (pathId, lat, lng, timestamp, data) {

    var key = pathId + "_" + lat + "_" + lng + "_" + timestamp;
    if (this.keys[key]) {
        return false
    }
    else {
        var tick = new Contrail.Tick(pathId, lat, lng, timestamp, data);
        this.ticks.push(tick);
        return true;
    }
};


Contrail.DataSet.prototype.build = function (callback) {
    //释放对象
    Contrail.Tools.release(this.keys);
    //排序
    this.ticks.sort(function (a, b) {
        return a.timestamp - b.timestamp;
    });

    var start = 999999999999999999999;
    var end = 0;


    //创建路径
    for (var i = 0; i < this.ticks.length; i++) {
        var tick = this.ticks[i];
        var pathId = tick.pathId;
        var path = this.paths.get(pathId)
        if (path == undefined) {
            path = new Contrail.Path(pathId);
            this.paths.put(pathId, path);
        }

        if (this.timeRange == undefined) {
            if (start > tick.timestamp) {
                start = tick.timestamp;
            }
            if (end < tick.timestamp) {
                end = tick.timestamp;
            }
        }

        if (this.geoRange.minLat > tick.lat) {
            this.geoRange.minLat = tick.lat;
        }
        if (this.geoRange.maxLat < tick.lat) {
            this.geoRange.maxLat = tick.lat;
        }
        if (this.geoRange.minLng > tick.lng) {
            this.geoRange.minLng = tick.lng;
        }
        if (this.geoRange.maxLng < tick.lng) {
            this.geoRange.maxLng = tick.lng;
        }

        path.addTick(tick);
    }

    //释放对象

    Contrail.Tools.release(this.ticks);
    this.paths = this.paths.toArray();


    if (this.timeRange == undefined) {
        this.timeRange = {
            start: start,
            end: end
        }
    }
    else {
        var len = this.paths.length;
        for (var i = 0; i < len; i++) {
            this.paths[i].adjust(this.timeRange);
        }
    }

    if (callback) {
        callback();
    }
};

Contrail.DataSet.prototype.show = function (timeline, settings, complete) {
    if (this.state == "no start") {
        timeline.zoomTo(this.timeRange.start, this.timeRange.end, Cesium.ClockRange.LOOP_STOP);

        this.state = "running";
    }

    var timestamp = timeline.currentTimestamp();

    if (timestamp >= this.timeRange.end) {
        if (complete) {
            complete();
        }
    }


    var paths = this.paths;
    var len = paths.length;


    for (var i = 0; i < len; i++) {
        var path = this.paths[i];
        if (path.run(timestamp, settings, this.runners)) {
            this.ended++;
        }
    }


};



Contrail.DataSet.prototype.test = function () {

    console.log(this)

};

Contrail.DataSet.prototype.destroy = function () {

    Contrail.Tools.release(this.paths);
    this.runners.removeAll();
};


