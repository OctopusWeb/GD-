
define("DataSourceController",function(exporter){
	var DataSourceController = function()
	{
		var cesiumController = new exporter.CesiumController("cesiumContainer");
		this.cesiumController = cesiumController;
		var widgetsController = new exporter.DataSourceWidgetsController();
		this.widgetsController = widgetsController;
		var eventController = new exporter.EventController(cesiumController.cesiumViewer);
		this.eventController = eventController;

		function init()
		{
			widgetsController.controllers.widget0.onSubmit = selectSourcesHandler;
			widgetsController.controllers.widget1.onSelectCity = selectCityHandler;
			widgetsController.controllers.widget1.ontoggle = areaVisibleToggleHandler;
			widgetsController.controllers.widget7.onSelect = switchDataSourceHandler;
			cesiumController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
			cesiumController.getDsList = widgetsController.controllers.widget0.dsSelector.getDsList;
			eventController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
			$(document).bind("ExternalCall",externalCall);
			
			widgetsController.loadDataSource("100000");
			$at.mouseChildren($("#widgets #w7"),false);
		}
		
		function externalCall(e,data)
		{
			var json = JSON.parse(data);
			var cmd = json.cmd;
			switch(cmd)
			{
				case "goCity":
				loadDataSource(json.cityCode);
				break;
				case "toggleWidgets":
				$("#city").toggle();
				$("#w2").toggle();
				$("#w3").toggle();
				$("#w4").toggle();
				$("#w5").toggle();
				$("#w6").toggle();
				break;
			}
		}
		
		function selectSourcesHandler(dsCodes)
		{
			cur_dsCodes = dsCodes;
			if(cesiumController.dataType == 2)return;
//			cesiumController.loadDataSource(cesiumController.cityCode,dsCodes);
			cesiumController.loadDataSource(cur_cityCode,dsCodes);
		}
		
		function selectCityHandler(info)
		{
			loadDataSource(info.citycode);
		}
		
		function areaVisibleToggleHandler(toggled)
		{
			cesiumController.setAreaVisible(toggled);
		}
		
		function switchDataSourceHandler(selectedIdx)
		{
			cur_selectedIndex = selectedIdx;
			if(selectedIdx==3){
				$("#sourceColors").hide();
				$("#w0").hide();
				
				$("#w2").hide();
				$("#w3").hide();
				$("#w4").hide();
				$("#w5").hide();
				$("#w6").hide();
				
				$("#eventSource").show();
				$("#eventType").show();
				eventController.clear();
				cesiumController.clear();
				eventController.active = true;
				
				eventController.loadEvent(this.cityCode);
				
			}else{
				$("#sourceColors").show();
				$("#w0").show();
				
				$("#w2").show();
				$("#w3").show();
				$("#w4").show();
				$("#w5").show();
				$("#w6").show();
				
				$("#eventSource").hide();
				$("#eventType").hide();
				eventController.clear();
				eventController.active = false;
				cesiumController.dataType = selectedIdx;
				cesiumController.loadDataSource(cur_cityCode);
				
			}
			
		}
		
		function loadDataSource(cityCode)
		{
			cur_cityCode = cityCode;
			cesiumController.cityCode = cityCode;
			widgetsController.loadDataSource(cityCode);
			
			if(cur_selectedIndex==3){
				eventController.clear();
				eventController.loadEvent(cur_cityCode);
			}else{
				//如果点击了事件图层
				if(cur_selectedIndex1==3){
					eventController.clear();
					eventController.loadEvent(cur_cityCode);
				}
				cesiumController.loadDataSource(cityCode);
			}
			
		}
		
		init();
		
		//当显示动画完成后执行
		this.showCompleteHandler = function()
		{
			cesiumController.loadDataSource("100000");
			$at.mouseChildren($("#widgets #w7"),true);
		}
	}
	return DataSourceController;
});
