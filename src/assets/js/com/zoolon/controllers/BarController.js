
define("BarController",function(exporter){
	var BarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBox = entities.add(new Cesium.Entity());
		var cityBox = entities.add(new Cesium.Entity());
		this.drawBars= function(url,dataType){
			$at.get(url,undefined,function(barData){
				for(var i=0;i<barData.length;i++){
					drawBar(barData[i],dataType).then(function(codeData,barData){
						var barParse = new BarParse(codeData,barData)
						var cityBar = new CityBar(barParse,dataType);
					})
				}
			})
		}
		this.clear = function(bol,bol1){
			proBox.show = bol;
			cityBox.show = bol1;
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
					cityCenter.push(codeDatas[i].properties.X_COORD,codeDatas[i].properties.Y_COORD,barData.dataNum)
				};
			}
			return cityCenter;
		}
		
		function CityBar(barParse,dataType){
			 var Box;
			 dataType == "pro" ? Box = proBox :Box = cityBox;
			 entities.add({
		        parent : Box,
		        position : Cesium.Cartesian3.fromDegrees(barParse[0], barParse[1],barParse[2]/40),
		        box : {
		            dimensions : new Cesium.Cartesian3(20000.0, 20000.0, barParse[2]/20),
		            material : Cesium.Color.fromRandom({alpha : 1.0})
		        }
		   });
		}	
	}
	return BarController;
})	