Contrail.Tools = function () {

}

Contrail.Tools.get = function (url, params, callback) {
    $.ajax({
        headers: {'Accept-Language': 'zh-CN,zh;q=0.8'},
        //type:'POST',
        type: 'GET',
        'url': url,
        data: params,
        traditional: true,

        success: function (data, textStatus) {

            //   console.log(textStatus);
            callback(data);

        },
        error: function () {
            console.error("Contrail.Tools.get ERROR");
        }
    });
}


Contrail.Tools.timestamp = function () {
    return new Date().getTime();
}

Contrail.Tools.parseTimestamp = function (timestamp) {
    var date = new Date();
    date.setTime(timestamp);


    return date.format('yyyy-MM-dd hh:mm:ss');
}

Contrail.Tools.stringToObject = function (string) {
    var result = {
        part: {
            YYYY: string.substr(0, 4),
            MM: string.substr(4, 2),
            DD: string.substr(6, 2),
            HH: string.substr(8, 2),
            mm: string.substr(10, 2),
            ss: string.substr(12, 2),
        }

    };
    // result.str = result.part.YYYY + "-" + result.part.MM + "-" + result.part.DD + " " + result.part.HH + ":" + result.part.mm + ":" + result.part.ss;
    // result.iso = result.part.YYYY + "-" + result.part.MM + "-" + result.part.DD + "T" + result.part.HH + ":" + result.part.mm + ":" + result.part.ss + "Z";
    //  result.obj = new Date(result.str);
    // result.timestamp = result.obj.getTime();
    result.timestamp = new Date(result.part.YYYY + "-" + result.part.MM + "-" + result.part.DD + " " + result.part.HH + ":" + result.part.mm + ":" + result.part.ss).getTime();
    return result;
}

Contrail.Tools.stringToTimestamp = function (string) {
    var YYYY = string.substr(0, 4);
    var MM = string.substr(4, 2);
    var DD = string.substr(6, 2);
    var HH = string.substr(8, 2);
    var mm = string.substr(10, 2);
    var ss = string.substr(12, 2);

    //  return moment(string, "YYYYMMDDHHmmss");
    return new Date(YYYY + "-" + MM + "-" + DD + " " + HH + ":" + mm + ":" + ss + "").getTime();
}


Contrail.Tools.stringToDate = function (string) {

    var YYYY = string.substr(0, 4);
    var MM = string.substr(4, 2);
    var DD = string.substr(6, 2);
    var HH = string.substr(8, 2);
    var mm = string.substr(10, 2);
    var ss = string.substr(12, 2);
    return new Date(YYYY + "-" + MM + "-" + DD + " " + HH + ":" + mm + ":" + ss + "");

}

Contrail.Tools.string2JulianDate = function (string) {
    var date = Contrail.Tools.stringToDate(string);
    return Cesium.JulianDate.fromDate(date);
}

Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}

Contrail.Tools.toISO8601Date = function (str) {
    var YYYY = str.substr(0, 4);
    var MM = str.substr(4, 2);
    var DD = str.substr(6, 2);
    var HH = str.substr(8, 2);
    var mm = str.substr(10, 2);
    var ss = str.substr(12, 2);
    return YYYY + "-" + MM + "-" + DD + "T" + HH + ":" + mm + ":" + ss + "Z";
}

Contrail.Tools.random = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

Contrail.Tools.release = function (obj) {
    delete obj;
    obj = null;
    obj = undefined;
}