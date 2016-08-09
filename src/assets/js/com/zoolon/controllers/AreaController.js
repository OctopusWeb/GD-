define("controllerArea",function(exporter){
	var controllerArea  = function(controller){
		var viewer = controller.cesiumController.cesiumViewer;
		var scene = viewer.scene;
		var self = this;
		self.provinceCenter=[];
		self.provinceCitycode = [];
		self.cityCitycode=[];
		this.init = function(){
			loadData("src/assets/data/proArea.json").then(function(data){
				var parseArea = new ParseArea(data,"p");
				for (var m=0;m<parseArea.length;m++) {
					var areaController = new AreaController("p"+self.provinceCitycode[m],parseArea[m],m);
				}
			})
			loadData("src/assets/data/cityArea.json").then(function(data){
				var parseArea = new ParseArea(data,"c");
				for (var m=0;m<parseArea.length;m++) {
					var areaController = new AreaController("c"+self.cityCitycode[m],parseArea[m],m);
				}
			})
		}
		function loadData(url){
			var obj = {
				then : function(Fun){
					this.fun = Fun;
				}
			}
			$at.get(url,undefined,function(data){
				obj.fun(data);
			})
			return obj;
		}
		
		function ParseArea(datas,dataType){
			var areaArray = [];
			this.changeArray = function(BigArray){
					if(BigArray.length != 1){
					var smallArray=[];
					for (var i=0;i<BigArray.length;i++) {
						smallArray = smallArray.concat(BigArray[i])
					}
					BigArray=[];
					BigArray.push(smallArray)	
				}
				if(typeof(BigArray[0][0][0]) == "number"){
					BigArray=BigArray
				}else{
					var smallArray=[];
					for (var i=0;i<BigArray[0].length;i++) {
						smallArray = smallArray.concat(BigArray[0][i])
					}
					BigArray=[];
					BigArray.push(smallArray);
				}
				return BigArray[0]
			}
			for(var m=0;m<datas.features.length;m++){
				
				var data = datas.features[m];
				if(dataType == "p"){
					self.provinceCenter.push([data.properties.X_CENTER,data.properties.Y_CENTER]);
        			self.provinceCitycode.push(data.properties.AD_CODE);
				}else{
					self.cityCitycode.push(data.properties.AD_CODE);
				}
				var degreesArray = this.changeArray(data.geometry.coordinates);
		        areaArray.push(degreesArray);
			}
			return areaArray;
		}
	
		function AreaController(areaType,parse,num){
			var degreesArray=[];
			var geometryInstances = [];
			var boundaries = parse;
	        for (var i = 0; i < boundaries.length; i++) {
	            degreesArray.push(boundaries[i][0], boundaries[i][1]);
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
                id:areaType+"-"+num
            });
            geometryInstances.push(geometryInstance);
            var polygon = scene.primitives.add(new Cesium.Primitive({
	            releaseGeometryInstances: false,
	            geometryInstances: geometryInstances,
	            appearance: new Cesium.PerInstanceColorAppearance({}),
	        }));
		}	
	}
	return controllerArea;
});