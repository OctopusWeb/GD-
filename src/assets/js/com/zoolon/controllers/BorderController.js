
define("BorderController",function(exporter){
	var BorderController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBorder = [];
		var self = this;
		this.citys = [110000,120000,130000,140000,150000,210000,220000,230000,
						310000,320000,330000,340000,350000,360000,370000,410000,430000,
						420000,440000,450000,460000,500000,510000,520000,530000,
						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
		
		for(var i=0;i<self.citys.length;i++){
			var name = entities.add(new Cesium.Entity());
			proBorder.push(name);
		}
		var pro = entities.add(new Cesium.Entity());
		
		loadData("src/assets/data/proArea.json").then(function(data){
			var parseBorder = new ParseBorder(data);
			for (var m=0;m<parseBorder.length;m++) {
				var areaCode = "p" + parseBorder[m].properties.AD_CODE+parseBorder[m].properties.NAME+"-"+m;
				parseBorders = parseBorder[m].geometry.coordinates[0];
				var border = new Border(parseBorders,pro,areaCode);
			}
		})
		
		loadData("src/assets/data/cityArea.json").then(function(data){
			var parseBorder = new ParseBorder(data);
			for (var m=0;m<parseBorder.length;m++) {
				var areaCode = parseInt(parseBorder[m].properties.AD_CODE/10000)*10000;
				var areaInfo = "c"+parseBorder[m].properties.AD_CODE+parseBorder[m].properties.NAME+"-"+m
				var index = indexOf(self.citys, areaCode);
				parseBorders = parseBorder[m].geometry.coordinates[0]
				var border = new Border(parseBorders,proBorder[index],areaInfo);
				
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
				borderArr.push(data.features[i]);
			}
			return borderArr;
		}
		function Border(data,parents,citycode){
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
			   		name:citycode,
			        polygon : {
				        hierarchy : Cesium.Cartesian3.fromDegreesArray(positions),
				        material : Cesium.Color.fromCssColorString('#0c6bad').withAlpha(0.005),
				        outline : true,
				        outlineColor : Cesium.Color.fromCssColorString('#0c6bad').withAlpha(0.1)
				    }
			    });
			}
			
		}
		this.show = function(bol1,bol2,num){
			pro.show = bol1;
			for(var i=0;i<proBorder.length;i++){
				proBorder[i].show = false;
			}
//			proBorder[0].show = true;
			if(num != undefined){
				proBorder[num].show = bol2;
			}
		}
		
		function indexOf(arr, str){
		    if(arr && arr.indexOf){
		        return arr.indexOf(str);
		    }
		    var len = arr.length;
		    for(var i = 0; i < len; i++){
		        if(arr[i] == str){
		            return i;
		        }
		    }
		    return -1;
		}
	}
	return BorderController;
})