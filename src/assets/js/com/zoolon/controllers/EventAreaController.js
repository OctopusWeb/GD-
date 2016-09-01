define("eventAreaController",function(exporter){
	var eventAreaController  = function(controller){
		var eventController = controller.eventController;
		var CesiumController = controller.cesiumController;
		var widgetsController = controller.widgetsController;
		var viewer = controller.cesiumController.cesiumViewer;
		var barController = new $at.BarController(controller);
		var borderController = new $at.BorderController(controller);
		var provinceCitycode = barController.citys;
		
		var layers = viewer.imageryLayers;
		var mapArea = false;
		var self = this;
		var traffiBol = false;
		var Floating = false;
		var citySlected = false;
		var proCenter=[];
//		var cityCenter=[];
		
		eventInit();
		function eventInit(){
			$("#addMap div").eq(1).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("mapSelect")
				self.changeMap();
			});
			$(".controller").eq(1).click(function(e){
				e.stopPropagation();
				self.trafficEvent();
			})
			$(".controller").eq(0).click(function(e){
				e.stopPropagation();
				self.Floatingcar();
			})
			
			$("body").click(function(e){
				e.stopPropagation();
				$("#pro ul").hide();
				$("#cities ul").hide();
			})
			$(".quanguo").click(function(){
				$(".quanguoBox").toggleClass("quanguoHide");
			})
			
			$("#guo").click(function(e){
				e.stopPropagation();
				barController.clear(true,false);
				borderController.show(true);
				$(".quanguo p").html("全国");
				$("#guo span").html("全国");
				$("#pro span").html("请选择省份");
				$("#cities span").html("请选择城市")
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"100000"}));
				if(traffiBol){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}
				
			})
			$("#pro").click(function(e){
				e.stopPropagation();
				$("#pro ul").show();
				citySlected = true;
			})
			$("#cities").click(function(e){
				e.stopPropagation();
				if(citySlected){
					$("#cities ul").show();
					$("#cities ul li").unbind("click")
					bindCity($("#cities ul li"));
				}
			})
			parseCityInfo();
			borderController.show(true)
		}
		
		$(document).bind("ExternalCall",externalCall);
		setTimeout(initBar,100)
		function initBar(){
//			barController.drawBars("http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro");
//			for (var i =0;i<provinceCitycode.length;i++) {
//				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+provinceCitycode[i]
//				barController.drawBars(cityUrl,i);
//			}
			barController.drawBars("src/assets/data/proBar.json","pro");
			for (var i =0;i<provinceCitycode.length;i++) {
				barController.drawBars("src/assets/data/cityBar.json",i);
			}
		}
		barController.clear(true,false);
		
		
		function parseCityInfo(){
			initCityInfo("100000").then(function(data,citycode){
				var cityParse =new CityParse(data,citycode);
				var cityContorller = new CityContorller(cityParse);
				cityContorller.append($("#pro ul"));
				initCity($("#pro ul li"))
			})
		}
		function initCity(dom){
			dom.click(function(e){
				e.stopPropagation()
				var index = dom.index($(this));
				dom.parent().hide();
				dom.parent().parent().find("h1").html($(this).html());
				var cityTxt = $(this).html();
				cityTxt = cityTxt.substr(cityTxt.indexOf(".")+1,cityTxt.length)
				$("#city").html(cityTxt);
				$(".quanguo  p").html(cityTxt);
				$("#pro span").html(cityTxt);
				$("#cities span").html("请选择城市");
				var cityCode = $(this).attr("class").toString();
				var codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				barController.clear(false,true,codeIndex);
				borderController.show(false,true,codeIndex);
				viewer.camera.flyTo({
					destination : Cesium.Cartesian3.fromDegrees(proCenter[index][0], proCenter[index][1]-6, 800000.0),
					orientation : {
				        direction : new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476),
				        up : new Cesium.Cartesian3(0,0.7071067811865476,0.7071067811865476)
				    }
				});
				initCityInfo(cityCode).then(function(data,citycode){
					var cityParse =new CityParse(data,citycode);
					var cityContorller = new CityContorller(cityParse);
					cityContorller.append($("#cities ul"));
				})
			})
		}
		function bindCity(dom){
				dom.click(function(e){
					barController.clear(false,false)
					borderController.show(false)
					e.stopPropagation()
					dom.parent().hide();
					dom.parent().parent().find("h1").html($(this).html())
					var cityTxt = $(this).html();
					cityTxt = cityTxt.substr(cityTxt.indexOf(".")+1,cityTxt.length);
					$(".quanguo  p").html(cityTxt);
					$("#cities span").html(cityTxt);
					var adCode = $(this).attr("class").toString();
					cur_cityCode = adCode;
					if(Floating){
						ExternalCall(JSON.stringify({cmd:"goCity",cityCode:adCode}));
					}else{
						var city = CesiumController.getInfoByCityCode(cur_cityCode);
						$("#city").html(city.name)
						viewer.camera.flyTo({
							destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 100000.0)
						});
						
					}
					if(traffiBol){
						eventController.clear();
						eventController.active = true;
						eventController.loadEvent(this.cityCode);
					}
				})
		}
		function initCityInfo(cityCode){
			var obj = {
				then:function(Fun){
					this.fun = Fun;
				}
			}
			cityCode == "100000" ? areaUrl = "src/assets/data/proArea.json" : areaUrl = "src/assets/data/cityArea.json"
			$.getJSON(areaUrl,function(data){
				obj.fun(data,cityCode);
			})
			return obj;
		}
		
		function CityParse(data,cityCode){
			var cityData = data.features;
			var cityArray=[];
//			cityCenter=[]
			for (var i=0;i<cityData.length;i++) {
				var cityInfo = cityData[i].properties;
				if(parseInt(cityInfo.AD_CODE/10000) == parseInt(cityCode/10000) || cityCode == "100000"){
					var cityInfoArray=[];
					var proCentertime = [];
					proCentertime.push(cityInfo.X_COORD,cityInfo.Y_COORD)
					proCenter.push(proCentertime);
					cityInfoArray.push(cityInfo.AD_CODE,cityInfo.NAME);
					cityArray.push(cityInfoArray);
				}else{
//					var cityCentertime = [];
//					cityCentertime.push(cityInfo.X_COORD,cityInfo.Y_COORD)
//					cityCenter.push(proCentertime);
				}
			}
			return cityArray;
		}
		function CityContorller(parse){
			var index = "";
			for(var i=0;i<parse.length;i++){
				var index0 = "<li class = '"+parse[i][0]+"'>"+i+"."+parse[i][1]+"</li>";
				index+=index0;
			}
			this.append=function(dom){
				dom.html(index);
			}
		}		
		
		this.changeMap = function(){
			if(mapArea){
				layers.remove(road, true);
			}else{
				road = layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
				    url: 'http://restapi.amap.com/v3/raster?key=a17abd213251a15c878156e9003aaacc&x={TileCol}&y={TileRow}&z={TileMatrix}',
			        layer: 'USGSShadedReliefOnly',
			        style: 'default',
			        format: 'image/jpeg',
			        tileMatrixSetID: 'default028mm',
			        maximumLevel: 20,
				}));
				road.alpha = 0.5;
			}
			mapArea=!mapArea;
		}
		this.trafficEvent = function(){
			traffiBol=!traffiBol;
			if(traffiBol){
				$("#rightSource").show()
				$("#eventSource").show();
				$("#eventType").show();
				eventController.clear();
				eventController.active = true;
				
				eventController.loadEvent(this.cityCode);
			}else{
				$("#rightSource").hide()
//				$("#eventSource").hide();
//				$("#eventType").hide();
				eventController.clear();
				eventController.active = false;
				
				cur_selectedIndex1=0;
				eventController.clear();
				eventController.active = false;
			}
			
		}
		
		this.Floatingcar = function(){
			Floating=!Floating;
			if(Floating){
				$("#leftSource").show()
//				$("#sourceColors").show();
//				$("#w0").show();
//				
//				$("#w2").show();
//				$("#w3").show();
//				$("#w4").show();
//				$("#w5").show();
//				$("#w6").show();

				CesiumController.loadDataSource(cur_cityCode);
			}else{
				$("#leftSource").hide()
//				$("#sourceColors").hide();
//				$("#w0").hide();
//				
//				$("#w2").hide();
//				$("#w3").hide();
//				$("#w4").hide();
//				$("#w5").hide();
//				$("#w6").hide();
				
				CesiumController.clear();
			}
		}
		
		function loadDataSource(cityCode)
		{
			cur_cityCode = cityCode;
			CesiumController.cityCode = cityCode;
			widgetsController.loadDataSource(cityCode);
			CesiumController.loadDataSource(cityCode);	
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
		
		function externalCall(e,data){
			var dataJson = JSON.parse(data);
			var cmd = dataJson.cmd;
			switch(cmd)
			{
				case "modolChoose":
				modolChoose(dataJson)
				break;
				
				case "cityChoose":
				cityChoose(dataJson)
				break;
				
				case "trafficEvent":
				trafficEvents(dataJson);
				break;
				
				case "roadConditions":
				roadConditions(dataJson)
				break;
			}
		}
		
		function roadConditions(dataJson){
			var parameter = dataJson.parameter;
			mapArea = !parameter;
			self.changeMap();
		}
		function trafficEvents(dataJson){
			var parameter = dataJson.parameter;
			traffiBol = !parameter;
			self.trafficEvent();
		}
		function modolChoose(dataJson){
			var parameter = dataJson.parameter;
			CesiumController.dataType = parameter;
			CesiumController.loadDataSource(cur_cityCode,parameter)
		}
		function cityChoose(dataJson){
			var dataType = dataJson.parameter;
			var AdCode = dataJson.cityCode;
			if(dataType == "pro"){
				console.log(dataType)
			}else if(dataType == "city"){
				barController.clear(false,false);
		    	if(traffiBol){
					cur_selectedIndex1=3;
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}else{
					cur_selectedIndex1=0;
					eventController.clear();
					eventController.active = false;
				}
		    	loadDataSource(AdCode);
			}
		}
	}
	return eventAreaController;
})