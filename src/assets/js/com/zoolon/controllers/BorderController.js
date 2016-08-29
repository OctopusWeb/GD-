
define("BorderController",function(exporter){
	var BorderController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBorder = []
		this.citys = [110000,120000,130000,140000,150000,210000,220000,230000,
						310000,320100,330100,340000,350000,360000,370000,410000,430000,
						420000,440000,450000,460000,500000,510000,520000,530000,
						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
		
		for(var i=0;i<this.citys.length;i++){
			var name = entities.add(new Cesium.Entity());
			proBorder.push(name);
		}
		
		loadData("src/assets/data/proArea.json").then(function(data){
			var parseBorder = new ParseBorder(data);
			for (var m=0;m<parseBorder.length;m++) {
				var border = new Border(parseBorder[m],proBorder[m]);
			}
		})
		
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
		function ParseBorder(data){
			var borderArr = [];
			for(var i=0;i<data.features.length;i++){
				borderArr.push(data.features[i].geometry.coordinates[0]);
			}
			return borderArr;
		}
		function Border(data,parents){
			var positions=[]
			var positionArr = [];
			if(typeof(data[0][0]) == "number"){
				positionArr.push(data);	
			}else{
				positionArr = data;
			}
			for(var m=0;m<positionArr.length;m++){
				for(var i=0;i<positionArr[m].length;i++){
					positions.push(positionArr[m][i][0],positionArr[m][i][1])
				}
				entities.add({
			        parent : parents,
			         polyline : {
				        positions : Cesium.Cartesian3.fromDegreesArray(positions),
				        width : 1,
				        material : Cesium.Color.WHITE
				    }
			    });
			}
			
		}
		this.show = function(bol,num){
			for(var i=0;i<proBorder.length;i++){
				proBorder[i].show = false;
			}
			if(num){
				proBorder[num].show = bol;
			}
		}
	}
	return BorderController;
})