function controllerArea(viewer){
	var scene = viewer.scene;
	var handler;
	var selected = null;
	var provinceCenter=[];
	var cityCenter=[];
	var mapArea=false;
	var layers = viewer.imageryLayers;
	$.ajaxSetup({
	  async: false
	});
	var cityArray=["110000","120000","130000","140000","150000","210000","220000","230000","240000","310000","320000","330000","340000","350000","360000","370000"
	,"410000","420000","430000","440000","450000","460000","500000","510000","520000","530000","540000","610000","620000","630000","640000","650000"];
	
	drawAreaJson1("src/assets/data/chinas.json");
	
	for(var i=0;i<cityArray.length;i++){
		var dataurl = "src/assets/data/"+cityArray[i]+".json";
		drawAreaJson2(dataurl);
	}
	mouseEvent();
	function drawAreaJson1(url){
		$.getJSON(url,function(datas){
			for(var m=0;m<datas.childs.length;m++){
				provinceCenter.push(datas.childs[m].center)
				var data = datas.childs[m];
				drawArea1(data,m);
			}
		})
	}
	function drawAreaJson2(url){
		$.getJSON(url,function(datas){
			for(var m=0;m<datas.childs.length;m++){
				var data = datas.childs[m];
				drawArea2(data);
			}
		})
	}
	function drawArea1(data,num){
		var boundaries = data.boundaries;
        var geometryInstances = [];
        for (var i = 0; i < boundaries.length; i++) {
            var degreesArray = [];
            var boundary = boundaries[i];
            for (var j = 0; j < boundary.length; j++) {
                degreesArray.push(boundary[j][1], boundary[j][0]);
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
                id:"p"+ data.adcode + "_" + i+"-"+num
            });
            geometryInstances.push(geometryInstance);
        }
        var polygon1 = scene.primitives.add(new Cesium.Primitive({
            releaseGeometryInstances: false,
            geometryInstances: geometryInstances,
            appearance: new Cesium.PerInstanceColorAppearance({}),

        }));

	}
	function drawArea2(data){
		var boundaries = data.boundaries;
        var geometryInstances = [];
        for (var i = 0; i < boundaries.length; i++) {
            var degreesArray = [];
            var boundary = boundaries[i];
            for (var j = 0; j < boundary.length; j++) {
                degreesArray.push(boundary[j][1], boundary[j][0]);
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
                id: "c"+data.adcode + "_" + i
            });
            geometryInstances.push(geometryInstance);
        }
        var polygon3 = scene.primitives.add(new Cesium.Primitive({
            releaseGeometryInstances: true,
            geometryInstances: geometryInstances,
            appearance: new Cesium.PerInstanceColorAppearance({}),

        }));
	}

	function mouseEvent(){
		var handler = viewer.screenSpaceEventHandler;
		handler.setInputAction(function (movement) {
	        moveEvent(movement);
	    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	    handler.setInputAction(function (movement) {
	    	var pickedObject = scene.drillPick(movement.position);
	    	var cartesian = viewer.camera.pickEllipsoid(movement.position, scene.globe.ellipsoid);
	    	if (pickedObject.length > 0) {
	    		for (var i = 0; i < pickedObject.length; ++i) {
	    			var pickID = pickedObject[i].id;
	    			if (viewer.camera.getMagnitude() >= 1000001) {
				        if(pickID.substr(0,1)=="p"){
				        	pickID = pickID.substr(pickID.indexOf('-')+1,pickID.length);
					        viewer.camera.flyTo({
						        destination : Cesium.Cartesian3.fromDegrees(provinceCenter[pickID][1], provinceCenter[pickID][0], 900000.0)
						    });
				        }
				    }else{
				    	if(pickID.substr(0,1)=="c"){
				        	if (cartesian) {
					            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
					            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
					            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);							
								var dataCode = pickID.substr(1,2);
								dataCode=parseInt(dataCode)*10000;
								console.log(dataCode)
								var data = {cmd:'goCity',cityCode:dataCode};
								$(document).trigger('ExternalCall',JSON.stringify(data));
					        }
				        }
				    }
	    		}
	    	}
	        unselect();
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
	}
    	
	function moveEvent(movement){
	    var pickedObject = scene.drillPick(movement.endPosition);
	    if (pickedObject.length > 0) {
	        try {	            
            	for (var i = 0; i < pickedObject.length; ++i) {
	                var id = pickedObject[i].id;
	                	if (viewer.camera.getMagnitude() >= 1000001) {
					        if(id.substr(0,1)=="p"){
					        	var primitive = pickedObject[i].primitive;
                				select(primitive);
					        }
					    }else if(viewer.camera.getMagnitude() <= 1000000 && viewer.camera.getMagnitude() > 200001){
					    	if(id.substr(0,1)=="c"){
					        	var primitive = pickedObject[i].primitive;
                				select(primitive);
					        }
					    }  
		        }     
	        }
	        catch (e) {
	        }
	    }else{
	    	unselect();
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
		cesiumController.cityCode = cityCode;
		widgetsController.loadDataSource(cityCode);
		if(cur_selectedIndex==3){
			eventController.clear();
			eventController.loadEvent(cur_cityCode);
		}else{
			
			cesiumController.loadDataSource(cityCode);
		}
		
	}
	
	$("#addMap").click(function(){
		changeMap();
	})
	function changeMap(){
		if(mapArea){
			layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
			    url : 'http://192.168.1.254:8080/png?x={TileCol}&y={TileRow}&z={TileMatrix}',
		        layer : 'USGSShadedReliefOnly',
		        style : 'default',
		        format : 'image/jpeg',
		        tileMatrixSetID : 'default028mm',
		        maximumLevel: 19,
		        credit : new Cesium.Credit('U. S. Geological Survey')
			}));
		}else{
			layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
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
}
