
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
			$("#cesiumBk").show();
			self.CityClear();
			$at.get(url,undefined,function(barData){
				if(dataType == "city" && type == 2)$(document).trigger("proLoad",barData);
				var dataSourcetype;
				var all = barData.validMileage[-1];
				var barDataChild = barData.children;
				var max = 0;
				for(x in barDataChild){
					if(max<barDataChild[x].validMileage)max=barDataChild[x].validMileage;
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
				if(vars==undefined|| vars.length ==0){
					$("#cesiumBk").hide();
					$("#NewsourceInfo").html("");
					$("#NewSourcechart").hide();
				}else{
					$("#NewSourcechart").show();
					self.drawSourceBars(url,dataSourcetype,type,[]);
					
				}
				
			})
		}
		
		this.drawSourceBars= function(url,dataType,type,vars){
			for(var i=0;i<vars.length;i++){
				url+="&params.dsCodes="+vars[i]
			}
			$at.get(url,undefined,function(barData){
				if(type == 1){
					var max = proMax*2;
					var all = proAll*2;
				}else if(type == 2){
					var max = cityMax*2;
					var all = cityAll*2;
				}else if(type == 3){
					var max = cityMax*2;
					var all = cityAll*2;
				}
				var barDataChild = barData.children;
				newChart(barData.validMileage,all)
				for(x in barDataChild){
					drawBar(barDataChild,dataType,x).then(function(codeData,barData,x){
						var barParse = new BarParse(codeData,barData,x);
						var cityBar = new CityBar(barParse,dataType,max,all);
					})
				}
				$("#cesiumBk").hide();
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
		
		function newChart(data,all){
			var i=0;
			var datas=[];
			var index="";
			
			var staticColors = [
					"#c93e3e",
					"#c55a4c",
					"#bf721c",
					"#bfa536",
					"#b7ab64",
					"#2ea19d",
					"#1e87b5",
					"#24669f",
					"#265497",
					"#064c9f",
					"#b5b5b5"
				];
			for(x in data){
				var label;
				if(x !=-1){
					datas.push({value:data[x], name:x,
				                	itemStyle: {
						                normal: {
						                    color: staticColors[i]
						                }
					            	}
				               })
				}
				for(var j=0;j<cur_dsCodesArr.length;j++){
					if(x == cur_dsCodesArr[j][0]) label=cur_dsCodesArr[j][1];
					if(x == -1)label="合计"
				}
				var par = parseInt(data[x]/all*10000)/100
				index+='<div class="newInfo"><div class="box" style="background-color: '+staticColors[i]+'";></div><p style="color: '+staticColors[i]+'">'+label+'</p><span class="label1" style="color: '+staticColors[i]+'">'+data[x]+'</span><span class="label0" style="color: '+staticColors[i]+'">'+par+'%</span></div>';
				i++;
			}
			index+='<div class="newInfo"><div class="box" style="background-color: #fff";></div><p style="color: #fff">总计</p><span class="label1" style="color: #fff">'+all+'</span><span class="label0" style="color: #fff">100%</span></div>';
			$("#NewsourceInfo").html(index);
			
			drawEchart(datas);
			function drawEchart(datas){
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
					cityCenter.push(codeDatas[i].properties.X_COORD,codeDatas[i].properties.Y_COORD,barData[x].validMileage)
				};
			}
			return cityCenter;
		}
		
		function CityBar(barParse,dataType,max,all){
			 var Box,wid,hei,colors;
			 if(dataType == "pro"){
			 	wid = 20000.0;
			 	colors = new Cesium.Color(1.0, 1.0, 1.0, 0.5);
			 }else if(dataType == "proSource"){
			 	wid = 18000.0;
			 	colors = Cesium.Color.fromCssColorString("#002D59")
			 }else if(dataType == "city"){
			 	wid = 10000.0;
			 	colors = new Cesium.Color(1.0, 1.0, 1.0, 0.5);
			 }else if(dataType == "citySource"){
			 	wid = 8000.0;
			 	colors = Cesium.Color.fromCssColorString("#002D59")
			 }
			 
			 hei = barParse[2]/max*wid*50;
			 var box = entities.add({
		        position : Cesium.Cartesian3.fromDegrees(parseFloat(barParse[0]),parseFloat(barParse[1]),hei/2),
		        cylinder : {
			        length : hei,
			        topRadius : wid,
			        bottomRadius : wid,
			        material : colors
			    }
		   	});
		   	
		   	cityArr.push(box);
		}	
	}
	return BarController;
})	