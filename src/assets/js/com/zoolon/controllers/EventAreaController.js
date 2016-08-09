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
		
		barController.drawBars("src/assets/data/proBar.json","pro");
		barController.drawBars("src/assets/data/cityBar.json","city");
		barController.clear(true,false);
		
		
		
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
                	if (viewer.camera.getMagnitude() >= 1000001 && id.substr(0,1)=="p") {
			        	var primitive = pickedObject[i].primitive;
        				select(primitive);
				    }else if(viewer.camera.getMagnitude() <= 1000000 && viewer.camera.getMagnitude() > 200001 && id.substr(0,1)=="c"){
			        	var primitive = pickedObject[i].primitive;
        				select(primitive);
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
	    			if (viewer.camera.getMagnitude() >= 1000001 && pickID.substr(0,1)=="p") {
	    				barController.clear(false,true);
			        	var center = pickID.substr(pickID.indexOf('-')+1,pickID.length);
			        	var dataCode = pickID.substr(1,6);
				        viewer.camera.flyTo({
					        destination : Cesium.Cartesian3.fromDegrees(provinceCenter[center][0], provinceCenter[center][1], 900000.0)
					    });
				    }else if(viewer.camera.getMagnitude() < 1000000 && viewer.camera.getMagnitude() > 200001 && pickID.substr(0,1)=="c"){
				    	barController.clear(false,false);
				    	var dataCode = pickID.substr(1,6);
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
				    	loadDataSource(dataCode);
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
	}
	return eventAreaController;
})