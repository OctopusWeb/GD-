define("controllerArea",function(exporter){
	var controllerArea  = function(CesiumController,widgetsController){
		var handler;
		var selected = null;
		var provinceCenter=[];
		var cityCenter=[];
		var mapArea=false;
		var trafficEvent = true;
		
		var viewer = CesiumController.cesiumViewer;
		var scene = viewer.scene;
		var layers = viewer.imageryLayers;
		var cityArray=[];
		
		var eventController = new exporter.EventController(viewer);
		CesiumController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
		CesiumController.getDsList = widgetsController.controllers.widget0.dsSelector.getDsList;
		eventController.getInfoByCityCode = widgetsController.controllers.widget1.getInfoByCityCode;
		
		this.drawAreaJson1 = function(url){
			//$.getJSON(url,function(datas){
			$at.get(url,undefined,function(datas){
				for(var m=0;m<datas.features.length;m++){
					var data = datas.features[m];
					var center = [data.properties.X_CENTER,data.properties.Y_CENTER];
	        		provinceCenter.push(center);
					drawArea1(data,"p",m);
				}
			})
		}
		this.drawAreaJson2 = function(url){
			$at.get(url,undefined,function(datas){
				for(var m=0;m<datas.features.length;m++){
					var data = datas.features[m];
					var center = [data.properties.X_CENTER,data.properties.Y_CENTER];
	        		cityCenter.push(center);
					drawArea1(data,"c","");
				}
			});
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
			}
			mapArea=!mapArea;
		}
		this.trafficEvent = function(){
			if(trafficEvent){
				eventController.clear();
				eventController.active = true;
				eventController.loadEvent(this.cityCode);
			}else{
				eventController.clear();
				eventController.active = false;
			}
			trafficEvent=!trafficEvent;
		}
		this.mouseEvent = function(){
			var handler = viewer.screenSpaceEventHandler;
			handler.setInputAction(function (movement) {
		        moveEvent(movement);
		    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		    handler.setInputAction(function (movement) {
		    	ClickEvent(movement)
		    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
		}
		function drawArea1(data,areaType,num){
			var boundaries = data.geometry.coordinates;
			typeof(boundaries[0][0][0]) == "number" ?boundaries=boundaries : boundaries=boundaries[0];
			if(boundaries.length ==1){
				boundaries=boundaries
			}else{
				var boundarie=[];
				for (var i=0;i<boundaries.length;i++) {
					boundarie = boundarie.concat(boundaries[i])
				}
				boundaries=[];
				boundaries.push(boundarie)
			}
	        var geometryInstances = [];
	        for (var i = 0; i < boundaries.length; i++) {
	            var degreesArray = [];
	            var boundary = boundaries[i];
	            for (var j = 0; j < boundary.length; j++) {
	                degreesArray.push(boundary[j][0], boundary[j][1]);
	            }
	        }
	        var geometryInstance = new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray(degreesArray)
                    ),
                    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                    extrudedHeight: 0,
                    height: 0,
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(0.01)),
                },
                id:areaType+ data.properties.AD_CODE+"-"+num
            });
            geometryInstances.push(geometryInstance);
	        var polygon1 = scene.primitives.add(new Cesium.Primitive({
	            releaseGeometryInstances: false,
	            geometryInstances: geometryInstances,
	            appearance: new Cesium.PerInstanceColorAppearance({}),
	
	        }));
		}
		function moveEvent(movement){
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
				    }else if(viewer.camera.getMagnitude() <= 200000){
				    	unselect();
				    }
		        }     
		    }else{
		    	unselect();
		    }
		}
		function ClickEvent(movement){
			var pickedObject = scene.drillPick(movement.position);
	    	if (pickedObject.length > 0) {
	    		for (var i = 0; i < pickedObject.length; i++) {
	    			var pickID = pickedObject[i].id;	
	    			if (viewer.camera.getMagnitude() >= 1000001 && pickID.substr(0,1)=="p") {
			        	var center = pickID.substr(pickID.indexOf('-')+1,pickID.length);
				        viewer.camera.flyTo({
					        destination : Cesium.Cartesian3.fromDegrees(provinceCenter[center][0], provinceCenter[center][1], 900000.0)
					    });
				    }else if(viewer.camera.getMagnitude() < 1000000 && pickID.substr(0,1)=="c"){
				    	var dataCode = pickID.substr(1,6);
				    	dataCode == "110100" ? dataCode="110000":dataCode=dataCode;
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
		function loadDataSource(cityCode)
		{
			cur_cityCode = cityCode;
			CesiumController.cityCode = cityCode;
			widgetsController.loadDataSource(cityCode);
			if(cur_selectedIndex==3){
				eventController.clear();
				eventController.loadEvent(cityCode);
			}else{
				
				CesiumController.loadDataSource(cityCode);
			}
			
		}
		
		Array.prototype.S=String.fromCharCode(2);  
		Array.prototype.in_array=function(e)  
		{  
		var r=new RegExp(this.S+e+this.S);  
		return (r.test(this.S+this.join(this.S)+this.S));  
		}
	}
	return controllerArea;
});