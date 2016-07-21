function controllerArea(viewer){
	var scene = viewer.scene;
	var handler;
	var selected = null;
	var cityCenter=[];
	var cityArray=["110000","120000","130000","140000","150000","210000","220000","230000","310000","320000","330000","340000","350000","360000","370000"
	,"410000","420000","430000","440000","450000","460000","500000","510000","520000","530000","540000","610000","620000","630000","640000","650000"];
	
	drawAreaJson1("src/assets/data/chinas.json",Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(1)));
	
	for(var i=0;i<cityArray.length;i++){
			var dataurl = "src/assets/data/"+cityArray[i]+".json";
			drawAreaJson2(dataurl,Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE.withAlpha(1)));
	}
	mouseEvent();
	function drawAreaJson1(url,linecolors){
		$.getJSON(url,function(datas){
			for(var m=0;m<datas.childs.length;m++){
				cityCenter.push(datas.childs[m].center)
				var data = datas.childs[m];
				drawArea1(data,linecolors,m);
			}
		})
	}
	function drawAreaJson2(url,linecolors){
		$.getJSON(url,function(datas){
			for(var m=0;m<datas.childs.length;m++){
				var data = datas.childs[m];
				drawArea2(data,linecolors);
			}
		})
	}
	function drawArea1(data,linecolors,num){
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
	function drawArea2(data,linecolors){
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
//	    handler.setInputAction(function (movement) {
//	        
//	    }, Cesium.ScreenSpaceEventType.WHEEL);
	    handler.setInputAction(function (movement) {
	    	var pickedObject = scene.pick(movement.position);
	   		if (Cesium.defined(pickedObject)) {
	   			var pickID=pickedObject.id;
	   			pickID = pickID.substr(pickID.indexOf('-')+1,pickID.length);
		        viewer.camera.flyTo({
			        destination : Cesium.Cartesian3.fromDegrees(cityCenter[pickID][1], cityCenter[pickID][0], 2000000.0)
			    });
		    }
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
	}
    	
	function moveEvent(movement){
	    var pickedObject = scene.drillPick(movement.endPosition);
	    if (pickedObject.length > 0) {	
	        try {	            
            	for (var i = 0; i < pickedObject.length; ++i) {
	                var id = pickedObject[i].id;
	                	if (viewer.camera.getMagnitude() >= 2000000) {
					        if(id.substr(0,1)=="p"){
					        	var primitive = pickedObject[i].primitive;
                				select(primitive);
					        }
					    }else{
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
	
	        attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.WHITE.withAlpha(1));
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
}
