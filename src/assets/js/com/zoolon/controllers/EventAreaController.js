define("eventAreaController",function(exporter){
	var eventAreaController  = function(controller,controllerArea){
		var provinceCenter=controllerArea.provinceCenter;
		var provinceCitycode = controllerArea.provinceCitycode;
		var cityCitycode=controllerArea.cityCitycode;
		var eventController = controller.eventController;
		var CesiumController = controller.cesiumController;
		var widgetsController = controller.widgetsController;
		var viewer = controller.cesiumController.cesiumViewer;
		var barController = new $at.BarController(controller);
		$(document).bind("ExternalCall",externalCall);
		
//		barController.drawBars("src/assets/data/proBar.json","pro");
//		barController.drawBars("src/assets/data/cityBar.json","city");
		
//		function initBar(){
//			barController.drawBars("http://localhost:8080/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro");
//			var citys = [110000,120000,130000,140000,150000,210000,220000,230000,
//						310000,320100,330100,340000,350000,360000,370000,410000,430000,
//						420000,440000,450000,460000,500000,510000,520000,530000,
//						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
//			for (var i =0;i<citys.length;i++) {
//				var cityUrl = "http://localhost:8080/portal/diagram/fp!getDayKpi.action?params.cityCodes="+citys[i]
//				barController.drawBars(cityUrl,"city");
//			}
//		}
//		barController.clear(true,false);
		
		var scene = viewer.scene;
		var layers = viewer.imageryLayers;
		var mapArea = false;
		var self = this;
		var selected = null;
		var traffiBol = false;
		
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
		
		var handler = viewer.screenSpaceEventHandler;
		handler.setInputAction(function (movement) {
			moveEvent(movement);
	    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	    handler.setInputAction(function (movement) {
	    	ClickEvent(movement)
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
	    handler.setInputAction(function (movement) {
	    	if(viewer.camera.getMagnitude() <= 1000000 && viewer.camera.getMagnitude() > 200000){
	    		CesiumController.clear();
	    		eventController.clear();
	    		barController.clear(true,false);
				eventController.active = false;
	    	}
	    }, Cesium.ScreenSpaceEventType.WHEEL);
		
		function moveEvent(movement){
			if(viewer.camera.getMagnitude() <= 200000){
					barController.clear(false,false);
			    	unselect();
			    	return;
			}
			var pickedObject = scene.drillPick(movement.endPosition);
		    if (pickedObject.length > 0) {
            	for (var i = 0; i < pickedObject.length; i++) {
	                var id = pickedObject[i].id;
	                if(!id){return}
	                if(id.substr){
	                	if (viewer.camera.getMagnitude() >= 1000001 && id.substr(0,1)=="p") {
				        	var primitive = pickedObject[i].primitive;
	        				select(primitive);
					    }else if(viewer.camera.getMagnitude() <= 1000000 && viewer.camera.getMagnitude() > 200001 && id.substr(0,1)=="c"){
				        	var primitive = pickedObject[i].primitive;
	        				select(primitive);
					    }
	                }
                	
		        }     
		    }else{
		    	unselect();
		    }
		}
		function ClickEvent(movement){
			if(viewer.camera.getMagnitude() <= 200000){
			    	unselect();
			    	return;
			}
			var pickedObject = scene.drillPick(movement.position);
	    	if (pickedObject.length > 0) {
	    		for (var i = 0; i < pickedObject.length; i++) {
	    			var pickID = pickedObject[i].id;
	    			if(pickID.substr){
	    			if (viewer.camera.getMagnitude() >= 1000001 && pickID.substr(0,1)=="p") {
	    				barController.clear(false,true);
			        	var center = pickID.substr(pickID.indexOf('-')+1,pickID.length);
			        	center =parseInt(center/10);
			        	var dataCode = pickID.substr(1,6);
				        viewer.camera.flyTo({
					        destination : Cesium.Cartesian3.fromDegrees(provinceCenter[center][0], provinceCenter[center][1]-8, 900000.0),
					        orientation : {
						        direction : new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476),
						        up : new Cesium.Cartesian3(0,0.7071067811865476,0.7071067811865476)
						    }
					        
					    });
				    }else if(viewer.camera.getMagnitude() < 1000000 && viewer.camera.getMagnitude() > 200001 && pickID.substr(0,1)=="c"){
				    	barController.clear(false,false);
				    	var dataCode = pickID.substr(1,6);
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
				    	loadDataSource(dataCode);
				    }
				    }
	    		}
	    	}
		}
		function select(primitive) {
			unselect();
		    selected = primitive;
		    var ids = primitive._instanceIds;
		    for (var j = 0; j < ids.length; j++) {
		        var id = ids[j];
		        if (id.indexOf("border") >= 0) {
		            continue;
		        }
		        var attributes = primitive.getGeometryInstanceAttributes(id);
		        attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.WHITE.withAlpha(0.3));
		    }
		}
		
		function unselect() {
		    if (selected) {
		        var ids = selected._instanceIds;
		        for (var j = 0; j < ids.length; j++) {
		            var id = ids[j];
		            if (id.indexOf("border") >= 0) {
		                continue;
		            }
		            var attributes = selected.getGeometryInstanceAttributes(id);
		            attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.WHITE.withAlpha(0.01));
		        }
		    }
		}
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
				cur_selectedIndex1=3
				eventController.clear();
				eventController.active = true;
				eventController.loadEvent(this.cityCode);
			}else{
				cur_selectedIndex1=0;
				eventController.clear();
				eventController.active = false;
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