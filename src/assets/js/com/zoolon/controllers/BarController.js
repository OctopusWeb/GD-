
define("BarController",function(exporter){
	var BarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBox = entities.add(new Cesium.Entity());
		var cityBox = entities.add(new Cesium.Entity());
		this.citys = [110000,120000,130000,140000,150000,210000,220000,230000,
						310000,320100,330100,340000,350000,360000,370000,410000,430000,
						420000,440000,450000,460000,500000,510000,520000,530000,
						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
		this.drawBars= function(url,dataType,vars){
//			cityBox._children=[]; 
//			清除citybox;
			$at.get(url,vars,function(barData){
				var all = barData.dataNum[-1];
				var barDataChild = barData.children;
				var max = 0;
				for(x in barDataChild){
					if(max<barDataChild[x].dataNum)max=barDataChild[x].dataNum;
				}
				for(x in barDataChild){
					drawBar(barDataChild,dataType,x).then(function(codeData,barData,x){
						var barParse = new BarParse(codeData,barData,x);
						var cityBar = new CityBar(barParse,dataType,max,all);
					})
				}
			})
		}
		this.clear = function(bol,bol1){
			proBox.show = bol;
			cityBox.show = bol1;
		}
		
		function drawBar(barData,dataType,x){
			var codeUrl;
			var obj = {
				then :function(Fun){
					this.fun = Fun;
				}
			}
			dataType == "pro" ? codeUrl = "src/assets/data/proArea.json" :codeUrl = "src/assets/data/cityArea.json";
			$at.get(codeUrl,undefined,function(codeData){
				obj.fun(codeData,barData,x);
			})
			return obj;
		}
		function BarParse(codeData,barData,x){
			var cityCenter = [];
			var codeDatas = codeData.features;
			for (var i=0;i<codeDatas.length;i++) {
				if(codeDatas[i].properties.AD_CODE == x){
					cityCenter.push(codeDatas[i].properties.X_COORD,codeDatas[i].properties.Y_COORD,barData[x].dataNum)
				};
			}
			return cityCenter;
		}
		
		function CityBar(barParse,dataType,max,all){
			 var Box,wid,hei;
			 dataType == "pro" ? Box = proBox :Box = cityBox;
			 dataType == "pro" ? wid = 20000.0 :wid = 8000.0;
			 hei = barParse[2]/max*wid*50;
			 entities.add({
		        parent : Box,
		        position : Cesium.Cartesian3.fromDegrees(parseFloat(barParse[0]),parseFloat(barParse[1]),hei/2),
		        box : {
		            dimensions : new Cesium.Cartesian3(wid, wid, hei),
		            material : Cesium.Color.fromCssColorString('#0c6bad')
		        }
		   	});
		}	
	}
	return BarController;
})	