define("eventAreaController",function(exporter){
	var eventAreaController  = function(controller){
		var eventController = controller.eventController;
		var CesiumController = controller.cesiumController;
		var widgetsController = controller.widgetsController;
		var viewer = controller.cesiumController.cesiumViewer;
		var barController = new $at.BarController(controller);
		
		
		$(document).bind("ExternalCall",externalCall);
//		setTimeout(initBar,100)
//		function initBar(){
//			console.log(provinceCenter.length)
//			barController.drawBars("http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro");
//			for (var i =0;i<provinceCitycode.length;i++) {
//				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+provinceCitycode[i]
//				barController.drawBars(cityUrl,i);
//			}
//		}
//		barController.clear(true,false);
		
		var scene = viewer.scene;
		var layers = viewer.imageryLayers;
		var mapArea = false;
		var self = this;
		var selected = null;
		var traffiBol = false;
		var Floating = false;
		
		CesiumController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
		CesiumController.getDsList = widgetsController.controllers.widget0.dsSelector.getDsList;
		eventController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
		
		$("#addMap").click(function(e){
			e.stopPropagation();
			self.changeMap();
		});
		$("#trafficEvent").click(function(e){
			e.stopPropagation();
			self.trafficEvent();
		})
		$("#trafficEvent1").click(function(e){
			e.stopPropagation();
			self.Floatingcar();
		})
		
		this.changeMap = function(){
			if(mapArea){
				layers.remove(road, true);
			}else{
				road = layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
				    url: 'http://restapi.amap.com/v3/raster?key=a17abd213251a15c878156e9003aaacc&x={TileCol}&y={TileRow}&z={TileMatrix}',
			        layer: 'USGSShadedReliefOnly',
			        style: 'default',
			        format: 'image/jpeg',
			        tileMatrixSetID: 'default028mm',
			        maximumLevel: 20,
				}));
				road.alpha = 0.5;
			}
			mapArea=!mapArea;
		}
		this.trafficEvent = function(){
			traffiBol=!traffiBol;
			if(traffiBol){
				$("#eventSource").show();
				$("#eventType").show();
				eventController.clear();
				eventController.active = true;
				
				eventController.loadEvent(this.cityCode);
			}else{
				$("#eventSource").hide();
				$("#eventType").hide();
				eventController.clear();
				eventController.active = false;
				
				cur_selectedIndex1=0;
				eventController.clear();
				eventController.active = false;
			}
			
		}
		
		this.Floatingcar = function(){
			Floating=!Floating;
			if(Floating){
				$("#sourceColors").show();
				$("#w0").show();
				
				$("#w2").show();
				$("#w3").show();
				$("#w4").show();
				$("#w5").show();
				$("#w6").show();

				CesiumController.loadDataSource(cur_cityCode);
			}else{
				$("#sourceColors").hide();
				$("#w0").hide();
				
				$("#w2").hide();
				$("#w3").hide();
				$("#w4").hide();
				$("#w5").hide();
				$("#w6").hide();
				
				CesiumController.clear();
			}
			
		}
		
		function loadDataSource(cityCode)
		{
			cur_cityCode = cityCode;
			CesiumController.cityCode = cityCode;
			widgetsController.loadDataSource(cityCode);
			CesiumController.loadDataSource(cityCode);	
		}
		function externalCall(e,data){
			var dataJson = JSON.parse(data);
			var cmd = dataJson.cmd;
			switch(cmd)
			{
				case "modolChoose":
				modolChoose(dataJson)
				break;
				
				case "cityChoose":
				cityChoose(dataJson)
				break;
				
				case "trafficEvent":
				trafficEvents(dataJson);
				break;
				
				case "roadConditions":
				roadConditions(dataJson)
				break;
			}
		}
		
		function roadConditions(dataJson){
			var parameter = dataJson.parameter;
			mapArea = !parameter;
			self.changeMap();
		}
		function trafficEvents(dataJson){
			var parameter = dataJson.parameter;
			traffiBol = !parameter;
			self.trafficEvent();
		}
		function modolChoose(dataJson){
			var parameter = dataJson.parameter;
			CesiumController.dataType = parameter;
			CesiumController.loadDataSource(cur_cityCode,parameter)
		}
		function cityChoose(dataJson){
			var dataType = dataJson.parameter;
			var AdCode = dataJson.cityCode;
			if(dataType == "pro"){
				console.log(dataType)
			}else if(dataType == "city"){
				barController.clear(false,false);
		    	if(traffiBol){
					cur_selectedIndex1=3;
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}else{
					cur_selectedIndex1=0;
					eventController.clear();
					eventController.active = false;
				}
		    	loadDataSource(AdCode);
			}
		}
	}
	return eventAreaController;
})