var $at = {};

function define(path,func)
{
    var _rootObj = $at;
    var arr = path.split(".");
    var len = arr.length;
    var _parentObj = _rootObj;
    for(var i=0;i<len;i++)
    {
        if(i<len-1)
        {
            if(_parentObj[arr[i]] == undefined)_parentObj[arr[i]] = {};
            _parentObj = _parentObj[arr[i]];
        }
        else
        {
            if(_parentObj[arr[i]] == undefined)_parentObj[arr[i]] = func(_rootObj);
        }
    }
}

define("mouseChildren",function(exporter){
    return function(_view,value,changeAlpha)
    {
        if(value)
        {
            _view.get(0).style.pointerEvents = "";
        }
        else
        {
            _view.css("pointer-events","none");
        }
        if(changeAlpha)_view.css("opacity",value?1:0.5);
    }
});

define("get",function(exporter){
	return function(url,vars,onSuccess,dataType,onError)
	{
		return $.ajax({
			headers:{'Accept-Language':'zh-CN,zh;q=0.8'},
			//type:'POST',
			type:'GET',
			'url': url,
			data: vars,
			traditional:true,
			dataType:dataType == undefined ? 'json' : dataType,
			success: onSuccess,
			error:onError
		});
	}
});

define("getJsonp",function(exporter){
	return function(urls,onSuccess)
	{
		return $.ajax({
	        url: urls,
	        dataType: "jsonp",
	        jsonp: "callback",
	        success: onSuccess
	    })
	}
});

function trace(any)
{
    console.log(any);
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
