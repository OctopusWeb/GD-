
define("BarController",function(exporter){
	var BarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBox = entities.add(new Cesium.Entity());
		var cityBox = []
		this.citys = [110000,120000,130000,140000,150000,210000,220000,230000,
						310000,320100,330100,340000,350000,360000,370000,410000,430000,
						420000,440000,450000,460000,500000,510000,520000,530000,
						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
		
		for(var i=0;i<this.citys.length;i++){
			var name = entities.add(new Cesium.Entity());
			cityBox.push(name);
		}
		this.drawBars= function(url,dataType){
			$at.get(url,undefined,function(barData){
				var all = barData[0].dataNum;
				if(barData[1]){
					var max = barData[1].dataNum;
				}else{
					var max = barData[0].dataNum;
				}
				for(var i=1;i<barData.length;i++){ 
				  if(max<barData[i].dataNum)max=barData[i].dataNum;
				}
				for(var i=0;i<barData.length;i++){
					drawBar(barData[i],dataType).then(function(codeData,barData){
						var barParse = new BarParse(codeData,barData);
						var cityBar = new CityBar(barParse,dataType,max,all);
					})
				}
			})
		}
		this.clear = function(bol,bol1,num){
			proBox.show = bol;
			for(var i=0;i<cityBox.length;i++){
				cityBox[i].show = false;
			}
			if(num != undefined){
				cityBox[num].show = bol1;
			}
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
		
		function CityBar(barParse,dataType,max,all){
			 var Box,wid,hei;
			 dataType == "pro" ? Box = proBox :Box = cityBox[dataType];
			 dataType == "pro" ? wid = 20000.0 :wid = 8000.0;
			 hei = barParse[2]/max*wid*50;
			 entities.add({
		        parent : Box,
		        position : Cesium.Cartesian3.fromDegrees(barParse[0], barParse[1],hei/2),
		        box : {
		            dimensions : new Cesium.Cartesian3(wid, wid, hei),
		            material : Cesium.Color.fromCssColorString('#0c6bad')
		        }
//	            label : {
//	                text : 'Label on top of scaling billboard'
//	            }
		   	});
		}	
	}
	return BarController;
})	