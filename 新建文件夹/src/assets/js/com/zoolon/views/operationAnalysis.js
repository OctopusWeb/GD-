$(document).ready(function(){
	var app = $(".app");
	var topBar = $("#topBar");
	var topBarController = new $at.TopBarController();
	
	
	//$("#cesiumContainer").css("width","100%");
	//$("#cesiumContainer").css("height","100%");
	$("#cesiumContainer").css("position","absolute");
	app.css("background","none");
	app.css("position","absolute");
	
	app.css("overflow","visible");
		
	
	
	topBarController.onPre = function()
	{
		hide(function(){
			$at.GeneralManager.goPrePage(3);
		});
	}
	topBarController.onNext = function()
	{
		hide(function(){
			$at.GeneralManager.goNextPage(3);
		});
	}
	topBarController.onHome = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	
	function show()
	{
		$("#chartContainer").show();
		TweenLite.from($("#chartContainer"),1,{y:1920,ease:Expo.easeInOut});
		TweenLite.from(topBar,1,{y:-90});
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenLite.to($("#cesiumContainer"),1,{alpha:0});
		TweenLite.to($("#chartContainer"),1,{y:1920,ease:Expo.easeInOut});
		TweenLite.to(topBar,1,{y:-90,ease:Expo.easeInOut,onComplete:function(){
			onComplete();
		}});
	}
	
	$(document).bind("ExternalCall",externalCall);
	
	function externalCall(e,data)
	{
		var json = JSON.parse(data);
		var cmd = json.cmd;
		switch(cmd)
		{
			case "pre":
			timelinePlayerController.getControls()["pre"].trigger("click");
			break;
			case "next":
			timelinePlayerController.getControls()["next"].trigger("click");
			break;
			case "control":
			timelinePlayerController.getControls()["play"].trigger("click");
			break;
			case "option":
			var items = json.value.split(",");
			$("#menuBt0").text(items[0]);
			$("#menuBt1").text(items[1]);
			updateSource();
			break;
		}
	}
	
	//菜单
	var menuController0 = new $at.MenuController($("#menu0"),$("#menuBt0"));
	var menuController1 = new $at.MenuController($("#menu1"),$("#menuBt1"));
	menuController0.onSelectItem = selectItemHandler;
	menuController1.onSelectItem = selectItemHandler;
	
	//图表
	var chartController = new $at.OperationAnalysisChartController();
	
	//时间轴播放器
	var timelinePlayerController = new $at.OperationAnalysisTimelinePlayerController();
	timelinePlayerController.onUpdate = updateHandler;
	
	//地图控制器
	var mapController = new $at.OperationAnalysisMapController();
	mapController.initComplete = updateSource;
	
	function getSelectedItems()
	{
		return [$("#menuBt0").text(),$("#menuBt1").text()];
	}
	
	function selectItemHandler(item)
	{
		updateSource();
	}
	
	function updateSource()
	{
		var items = getSelectedItems();
		var url;
		var vars = {};
		switch(items[0])
		{
			case "播报":
			url = $at.Config.request.getRadioResult;
			break;
			case "导航":
			url = $at.Config.request.getPulseResult;
			vars["params.type"] = 2;
			break;
			case "路线规划":
			url = $at.Config.request.getPulseResult;
			vars["params.type"] = 0;
			break;
			case "重新规划":
			url = $at.Config.request.getPulseResult;
			vars["params.type"] = 1;
			break;
			case "躲避拥堵":
			url = $at.Config.request.getRouteAvoidJamResult;
			break;
		}
		vars["params.citys"] = [110000,120000,130100,140100,150100,210100,
								220100,230100,310000,320100,330100,340100,
								350100,360100,370100,410100,430100,440100,
								440300,450100,460100,500000,510100,520100,
								530100,540100,610100,620100,630100,640100,
								650100,420100]
		vars["params.date"] = $at.TimeUtil.getLastMonthDate();
		$at.get(url,vars,function(data){
			var parser = new DataParser(items[1] == "用户数" ? data.uv : data.pv);
			var chartDataSource = parser.getChartDataSource();
			chartController.setSource(chartDataSource);
			var mapDataSource = parser.getMapDataSource();
			mapController.setSource(mapDataSource);
			timelinePlayerController.reset();
		});
	}
	
	function updateHandler()
	{
		mapController.update(timelinePlayerController.getProgress());
	}
	
	var preloader = new $at.AppPreloader(app);
	preloader.load(function(){
		show();
		redraw();
		//adjustCesium();
	});
	
	//数据处理器
	function DataParser(data)
	{
		var json = data;
		this.getChartDataSource = function()
		{
			var ds = {};
			ds.labels = [];
			ds.values = [];
			ds.maxValue = 4;
			for(var key in json)
			{
				var str = Number(key.split("-")[1]) + "月";
				ds.labels.push(str);
				var value = Number(json[key]["100000"].ratio);
				ds.maxValue = ds.maxValue<value?Math.ceil(value):ds.maxValue;
				ds.values.push(value);
			}
			return ds;
		}
		
		this.getMapDataSource = function()
		{
			var ds = {};
			ds.list = [];
			ds.times = [];
			ds.json = json;
			ds.maxValue = 0;
			var p0;
			for(var key in json)
			{
				ds.times.push(key);
				var p = json[key];
				if(p0 == undefined)p0 = p;
				for(citycode in p)
				{
					var ratio = p[citycode].ratio;
					if(ratio>ds.maxValue)ds.maxValue = ratio;
				}
			}
			
			for(var key in p0)
			{
				if(key != "100000")
				{
					var obj = {};
					obj.citycode = key;
					ds.list.push(obj);
				}
			}
			return ds;
		}
	}
});
