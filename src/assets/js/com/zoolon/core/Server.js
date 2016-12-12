define("Server",function(exporter){
	var Server = {};
	
	Server.getSign = function(ts)
	{
		var privateKey = "gpsfp";
		return $.md5(privateKey+ts);
	}
	
	//此接口提供按照城市citycode和时间返回实时GPS点的数据文件
	Server.getTrafficFpData = function(citycode,dsCodes,type,onSuccess)
	{
		var vars = {};
		vars.ts = exporter.TimeUtil.getTimestampBefore(0);
		vars.sign = Server.getSign(vars.ts);
		vars.citycode = citycode;
		if(dsCodes!=undefined)vars.dscode = dsCodes.join(',');
		if(type == 2)
		{
			vars.type = type;
			vars.timeInterval = 5;
			vars.maxGpsNum = 1000000;
		}
		var url = exporter.Config.request.getTrafficFpData;
		var timeRange = exporter.TimeUtil.getTimeRangeBefore(5);
		return exporter.get(url,vars,function(data){
			var obj = {
				timeRange:timeRange,
				data:data
			};
			onSuccess(obj);
		},'text');
	}
	
	Server.getTrafficFpData1 = function(citycode,dsCodes,type,onSuccess)
	{
		var vars = {};
		vars.ts = exporter.TimeUtil.getTimestampBefore(0);
		vars.sign = Server.getSign(vars.ts);
		vars.citycode = citycode;
		if(dsCodes!=undefined)vars.dscode = dsCodes.join(',');
		if(type == 2)
		{
			vars.type = type;
			vars.timeInterval = 5;
			vars.maxGpsNum = 1000000;
		}
		var url = exporter.Config.request.getTrafficFpData1;
		var timeRange = exporter.TimeUtil.getTimeRangeBefore(5);
		return exporter.get(url,vars,function(data){
			var obj = {
				timeRange:timeRange,
				data:data
			};
			onSuccess(obj);
		},'text');
	}
	
	Server.getHistoryTrafficFpData = function(citycode,onSuccess)
	{
		var vars = {};
		vars.ts = exporter.TimeUtil.getTimestampBefore(0);
		vars.sign = Server.getSign(vars.ts);
		vars.citycode = citycode;
		vars.type = 1;
		var url = exporter.Config.request.getTrafficFpData;
		//时间轴设定为昨天24小时
		var timeRange = (function(){
			var now = new Date();
			var yestoday = now.getTime() - 60*60*24*1000;
			var tStr = new Date(yestoday).Format("yyyy-MM-dd");
			return tStr+"T00:00:00Z/"+tStr+"T24:00:00Z";
		})();
		return exporter.get(url,vars,function(data){
			var obj = {
				timeRange:timeRange,
				data:data
			};
			onSuccess(obj);
		},'text');
	}
	Server.getEventType = function(citycode,onSuccess)
	{
		var vars = {};
		//vars.citycode = citycode;
		var url = exporter.Config.request.getEventType;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	Server.queryEventByCity = function(citycode,onSuccess)
	{
		var vars = {};
		vars.city = citycode;
		var url = exporter.Config.request.queryEventByCity;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	
	Server.countEventByType = function(citycode,onSuccess)
	{
		var vars = {};
		if(citycode !="100000")
		vars.city = citycode;
		var url = exporter.Config.request.countEventByType;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	Server.countEventBySource = function(citycode,onSuccess)
	{
		var vars = {};
		if(citycode !="100000")
		vars.city = citycode;
		var url = exporter.Config.request.countEventBySource;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	Server.countEventByCity = function(citys,onSuccess)
	{
		var vars = {};
		vars.city = citys;
		var url = exporter.Config.request.countEventByCity;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	Server.queryEventByCityAndId = function(cityCode,eventId,onSuccess)
	{
		var vars = {};
		vars.id = eventId;
		vars.city = cityCode;
		var url = exporter.Config.request.queryEventByCityAndId;
		
		return exporter.get(url,vars,function(data){
			
			onSuccess(data);
		},'text');
	}
	return Server;
});

define("TimeUtil",function(exporter){
	var TimeUtil = {};
	
	TimeUtil.getTimestampBefore = function(minute)
	{
		var now = new Date();
		var beforeTime = now.getTime() - 60*minute*1000;
		return Math.round(beforeTime/1000);
	}
	
	TimeUtil.getTimeRangeBefore = function(minute)
	{
		var now = new Date();
		var beforeTime = now.getTime() - 60*minute*1000;
		return new Date(beforeTime).Format("yyyy-MM-ddThh:mm:ssZ")+"/"+now.Format("yyyy-MM-ddThh:mm:ssZ");
	}
	
	TimeUtil.getTimeRangeBeforeFromTo = function(minute0,minute1)
	{
		var now = new Date();
		var time0 = now.getTime() - 60*minute0*1000;
		var time1 = now.getTime() - 60*minute1*1000;
		return new Date(time0).Format("yyyy-MM-ddThh:mm:ssZ")+"/"+new Date(time1).Format("yyyy-MM-ddThh:mm:ssZ");
	}
	
	TimeUtil.getLastMonthDate = function()
	{
		var dt= new Date();
		var year = dt.getFullYear();
		var month = dt.getMonth() + 1;

		if (month == 1) {
			year = parseInt(year) - 1;
			month = 12;
		} else {
			month = month - 1;
		}

		return year+"-"+(month<10?"0"+month:month)+"-01";
	}
	
	return TimeUtil
});
