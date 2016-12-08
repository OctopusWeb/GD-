Contrail.Path = function (pathId) {
    this.pathId = pathId;
    this.ticks = new Contrail.Array();
    this.lastTick = null;
    this.runner = null;
};

Contrail.Path.prototype.addTick = function (tick) {
    this.ticks.push(tick);
    return true;
};

Contrail.Path.prototype.adjust = function (timeRange) {
    var dis = timeRange.end - timeRange.start;
    var len = this.ticks.length;
    var unit = dis / len;


    for (var i = 0; i < len; i++) {
        var tick = this.ticks[i];
        tick.timestamp = Math.round(timeRange.start + i * unit);

        if (i == len - 1) {
            tick.timestamp = timeRange.end;
        }
    }
}


Contrail.Path.prototype.run = function (timestamp, settings, runners) {


    if (this.lastTick != timestamp) {
        this.lastTick = timestamp;
        var array = this.range(this.lastTick, timestamp);


        if (array.length > 1) {
            // console.log("insert")


            var times = [];
            var points = [];

            for (var i = 0; i < array.length; i++) {
                var tick = array[i];
                times.push(tick.timestamp);
                points.push(tick.getPosition());

            }

            var spline = new Cesium.CatmullRomSpline({
                times: times,
                points: points,
                // firstTangent:startPoint,
                //lastTangent:endPoint
            });

            try {
                var newPos = spline.evaluate(timestamp);
                if (this.runner == null) {

                    var type = typeof settings.runner.style;

                    var config = settings.runner;

                    if (type == "function") {
                        config = {};
                        config.style = settings.runner.style(array[0].data);
                    }


                    this.runner = new Contrail.Runner(config, runners);
                }

                // var dis = Cesium.Cartesian3.distance(this.runner.getPosition(), newPos);
                //  if(dis==0)
                //  {
                //console.log(times);
                // console.log(points);
                // console.log(newPos);
                // console.log(timestamp);
                //   }


                this.runner.move(newPos);


            }
            catch (e) {
                //console.log(this.pathId);
                //console.log(times);
                //console.log(Contrail.Tools.parseTimestamp(timestamp));
                // console.log(timestamp);
                //console.log("----------------------------");
                console.log("out");
            }

        }


    }

    return false;
};


Contrail.Path.prototype.range = function (start, end) {
    var begin = Contrail.Tools.timestamp();
    var result = new Contrail.Array();
    var len = this.ticks.length;
    var last = this.ticks[len - 1];
    var first = this.ticks[0];

    if (end < first.timestamp || (start != null && start < first.timestamp) || (start != null && start > last.timestamp)) {
        this.wait();
    } else if (end >= last.timestamp) {
        this.end();
    } else if (start == null) {
        // console.log("start")
        if (len == 0) {

        }
        else {
            for (var i = 0; i < len; i++) {
                var tick = this.ticks[i];
                result.push(tick);
                if (tick.timestamp > end) {
                    break;
                }
            }
        }

        if (result.length == 1) {
            result = new Contrail.Array();
        }


    }
    else {
        // console.log("run")
        if (start > end) {
            var t = start;
            start = end;
            end = t;
            // console.log("back")
        }

        // console.log(Contrail.Tools.parseTimestamp(start), Contrail.Tools.parseTimestamp(end));
        // console.log(Contrail.Tools.parseTimestamp(first.timestamp), Contrail.Tools.parseTimestamp(last.timestamp))
        var got = false;
        for (var i = 0; i < len; i++) {
            var tick = this.ticks[i];
            var tickstamp = tick.timestamp;

            if (tickstamp >= start) {


                if (got == false) {
                    if (i > 0) {
                        result.push(this.ticks[i - 1]);
                    }

                    got = true;
                }

                result.push(tick);
            }

            if (tickstamp > end) {
                break;
            }
        }
        // console.log(result.length)

    }

    var di = Contrail.Tools.timestamp() - begin;

    if (di > 100) {
        //console.log(Contrail.Tools.timestamp() - begin)
    }


    return result;
};

Contrail.Path.prototype.wait = function () {
    if (this.runner) {
        this.runner.hide();
    }

    this.lastTick = null;
};


Contrail.Path.prototype.end = function () {
    if (this.runner) {
        this.runner.hide();
    }

    this.lastTick = null;
};


