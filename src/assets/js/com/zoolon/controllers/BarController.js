
define("BarController",function(exporter){
	var BarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var proBox = entities.add(new Cesium.Entity());
		var cityBox = entities.add(new Cesium.Entity());
		var proSourceBox = entities.add(new Cesium.Entity());
		var citySourceBox = entities.add(new Cesium.Entity());
		var self = this;
		var proMax,proAll,cityMax,cityAll;
		
		var cityArr =[];
		this.citys = [110000,120000,130000,140000,150000,210000,220000,230000,
						310000,320100,330100,340000,350000,360000,370000,410000,430000,
						420000,440000,450000,460000,500000,510000,520000,530000,
						540000,610000,620000,630000,640000,650000,710000, 810000, 820000]
		this.drawBars= function(url,dataType,type,vars){
			self.CityClear();
			$at.get(url,undefined,function(barData){
				var dataSourcetype;
				var all = barData.dataNum[-1];
				var barDataChild = barData.children;
				var max = 0;
				for(x in barDataChild){
					if(max<barDataChild[x].dataNum)max=barDataChild[x].dataNum;
				}
				if(dataType == "pro"){
					proMax=max;proAll=all;
					dataSourcetype = "proSource"
				}else if(dataType == "city"){
					cityMax=max;cityAll=all;
					dataSourcetype = "citySource"
				}
				for(x in barDataChild){
					drawBar(barDataChild,dataType,x).then(function(codeData,barData,x){
						var barParse = new BarParse(codeData,barData,x);
						var cityBar = new CityBar(barParse,dataType,max,all);
					})
				}
				self.drawSourceBars(url,dataSourcetype,type,vars);
			})
		}
		
		this.drawSourceBars= function(url,dataType,type,vars){
			$at.get(url,vars,function(barData){
				if(type == 1){
					var max = proMax*2;
					var all = proMax*2;
				}else if(type == 2){
					var max = cityMax*2;
					var all = cityMax*2;
				}
				var barDataChild = barData.children;
				newChart(barData.validMileage)
				for(x in barDataChild){
					drawBar(barDataChild,dataType,x).then(function(codeData,barData,x){
						var barParse = new BarParse(codeData,barData,x);
						var cityBar = new CityBar(barParse,dataType,max,all);
					})
				}
			})
		}
		this.CityClear = function(){
			cityBox._children=[];
			proSourceBox._children=[];
			citySourceBox._children=[];
			for(var i=0;i<cityArr.length;i++){
				entities.removeById(cityArr[i]._id);
			}
			cityArr=[];
		}
		
		function newChart(data){
			var i=0;
			var datas=[];
			var staticColors = [
					"#FFFFFF",
					"#FFFF00",
					"#FF0000",
					"#3399FF",
					"#00FFFF",
					"#33CC33",
					"#9999CC",
					"#999966",
					"#CC6699",
					"#FF9999",
					"#669999"
				];
			for(x in data){
				
				datas.push({value:x, name:data[x],
			                	itemStyle: {
					                normal: {
					                    color: staticColors[i]
					                }
				            	}
			                })
				i++;
			}
			drawEchart(datas)
			function drawEchart(datas){
				console.log(datas)
				var myChart = echarts.init(document.getElementById('NewSourcechart'));
				var option = {
		             tooltip: {
				        trigger: 'item',
				        formatter: "{a} <br/>{b}: {c} ({d}%)"
				    },
				    series: [
				        {
				            type:'pie',
				            radius: ['50%', '80%'],
				            avoidLabelOverlap: false,
				            label: {
				                normal: {
				                    show: false,
				                    position: 'center'
				                },
				                emphasis: {
				                    show: true,
				                    textStyle: {
				                        fontSize: '30',
				                        fontWeight: 'bold'
				                    }
				                }
				            },
				            labelLine: {
				                normal: {
				                    show: false
				                }
				            },
				            data:datas
				        }
				    ]
		        };
		
		        // 使用刚指定的配置项和数据显示图表。
		        myChart.setOption(option);
			}
		}
		
		function drawBar(barData,dataType,x){
			var codeUrl;
			var obj = {
				then :function(Fun){
					this.fun = Fun;
				}
			}
			dataType == "pro" || dataType == "proSource" ? codeUrl = "src/assets/data/proArea.json" :codeUrl = "src/assets/data/cityArea.json";
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
			 var Box,wid,hei,colors;
			 if(dataType == "pro"){
			 	wid = 20000.0;
			 	colors = '#0c6bad';
			 }else if(dataType == "proSource"){
			 	wid = 22000.0;
			 	colors = '#fff';
			 }else if(dataType == "city"){
			 	wid = 8000.0;
			 	colors = '#0c6bad';
			 }else if(dataType == "citySource"){
			 	wid = 10000.0;
			 	colors = '#fff';
			 }
			 
			 hei = barParse[2]/max*wid*50;
			 var box = entities.add({
		        position : Cesium.Cartesian3.fromDegrees(parseFloat(barParse[0]),parseFloat(barParse[1]),hei/2),
		        box : {
		            dimensions : new Cesium.Cartesian3(wid, wid, hei),
		            material : Cesium.Color.fromCssColorString(colors)
		        }
		   	});
		   	
		   	cityArr.push(box);
		}	
	}
	return BarController;
})	