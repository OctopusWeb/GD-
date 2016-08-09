/**
 * 默认配置
 */
define("Config",function(exporter){
	var Config = {};
	
	Config.debugMode = true;
	
	Config.pages = [
		{link:"dataSource.html",enable:true},
		{link:"qualityAnalysis.html",enable:true},
		{link:"qualityMonitoring.html",enable:true},
		{link:"operationAnalysis.html",enable:true},
		{link:"operationMonitoring.html",enable:false},
		{link:"tools.html",enable:false}
	];
	
	Config.request = {
		getDayKpi:Config.debugMode ? "src/assets/data/getDayKpi.json" :"http://140.205.57.130/portal/diagram/fp!getDayKpi.action",
		getDailyKpi:Config.debugMode ? "src/assets/data/getDailyKpi.json" : "http://140.205.57.130/portal/diagram/fp!getDailyKpi.action",
		getValidMileageRatioTotalMileage:Config.debugMode ? "src/assets/data/getValidMileageRatioTotalMileage.json" : "http://140.205.57.130/portal/diagram/fp!getValidMileageRatioTotalMileage.action",
		getDsPercent:Config.debugMode ? "src/assets/data/getDsPercent.json" : "http://140.205.57.130/portal/diagram/fp!getDsPercent.action",
		getCoveredCitys:Config.debugMode ? "src/assets/data/getCoveredCitys.json" : "http://140.205.57.130/portal/diagram/fp!getCoveredCitys.action",
		
		getRadioResult:Config.debugMode ? "src/assets/data/getRadioResult.json" : "http://140.205.57.130/portal/diagram/bi!getRadioResult.action",
		getPulseResult:Config.debugMode ? "src/assets/data/getPulseResult.json" : "http://140.205.57.130/portal/diagram/bi!getPulseResult.action",
		getRouteAvoidJamResult:Config.debugMode ? "src/assets/data/getRouteAvoidJamResult.json" : "http://140.205.57.130/portal/diagram/bi!getRouteAvoidJamResult.action",
		
		getTrafficFpData:Config.debugMode ? "src/assets/data/201511041845_110000/201511041845_110000.txt" :"http://140.205.176.207/TrafficFpData/getData",
		
		getDataSources:Config.debugMode ? "src/assets/data/getDSbyCity.json" : "http://140.205.57.130/portal/fp/component!getDSbyCity.action",
		
		getCitys:Config.debugMode ? "src/assets/data/city.json" : "http://140.205.57.130/portal/fp/component!getCitys.action",
			
		//事件接口
		getEventType:Config.debugMode ? "src/assets/data/getEventType.json" :"http://140.205.57.130/portal/diagram/ugc-query!getEventInfos.action",
		//getEventType:Config.debugMode ? "src/assets/data/getEventType.json" :"http://140.205.57.130/portal/diagram/ugc-query!getEventTypes.action",
		queryEventByCity:Config.debugMode ? "src/assets/data/queryEventByCity.json" : "http://140.205.57.130/portal/diagram/ugc-query!queryByCity.action",
		countEventByType:Config.debugMode ? "src/assets/data/countEventByType.json" : "http://140.205.57.130/portal/diagram/ugc-query!countByType.action",
		countEventBySource:Config.debugMode ? "src/assets/data/countEventBySource.json" : "http://140.205.57.130/portal/diagram/ugc-query!countDayCumulativeAndCurrEffective.action",
		countEventByCity:Config.debugMode ? "src/assets/data/countEventByCity.json" : "http://140.205.57.130/portal/diagram/ugc-query!countByCity.action",
		queryEventByCityAndId:Config.debugMode ? "src/assets/data/queryEventByCityAndId.json" : "http://140.205.57.130/portal/diagram/ugc-query!queryByCityAndId.action",
		
	};
	
	return Config;
});
//用于数据源的全局变量
var cur_selectedIndex = 0;
var cur_selectedIndex1 = 0;
var cur_cityCode = "100000";
