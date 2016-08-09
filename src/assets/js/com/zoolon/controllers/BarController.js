
define("BarController",function(exporter){
	var BarController = function(controller)
	{
		this.drawBars= function(url,dataType){
			$at.get(url,undefined,function(barData){
				for(var i=0;i<barData.length;i++){
					drawBar(barData[i],dataType).then(function(codeData,barData){
						var barParse = new BarParse(codeData,barData)
						var cityBar = new CityBar(barParse);
					})
				}
			})
		}
		
		function drawBar(barData,dataType){
			var codeUrl;
			var obj = {
				then :function(Fun){
					this.fun = Fun;
				}
			}
			dataType == "pro" ? codeUrl = "src/assets/data/proArea.json" :codeUrl = "src/assets/data/cityArea.json";
			$at.get(codeUrl,undefined,function(codeData){
				obj.fun(codeData,barData);
			})
			return obj;
		}
		
		function BarParse(codeData,barData){
			
			var cityCenter = [];
			var codeDatas = codeData.features;
			for (var i=0;i<codeDatas.length;i++) {
				if(codeDatas[i].properties.AD_CODE == barData.cityCode){
					console.log(codeDatas[i].properties.X_CENTER+"++++++"+codeDatas[i].properties.Y_CENTER)
					cityCenter.push(codeDatas[i].properties.X_CENTER,codeDatas[i].properties.Y_CENTER,barData.dataNum)
				};
			}
			return cityCenter;
		}
		
		function CityBar(barParse){
			var viewer = controller.cesiumController.cesiumViewer;
			var blueBox = viewer.entities.add({
			    position: Cesium.Cartesian3.fromDegrees(barParse[0], barParse[1],barParse[2]/20),
			    box : {
			        dimensions : new Cesium.Cartesian3(20000.0, 20000.0, barParse[2]/10),
			        material : Cesium.Color.BLUE
			    }
			});
		}	
	}
	return BarController;
})	