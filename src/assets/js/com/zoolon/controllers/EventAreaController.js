/**
 * sslsslsll
 */
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
		var Floating1 = false;
		var citySlected = false;
		var InducedBol = false;
		var proCenter=[];
		var codeIndex = false;
		var navNum=10;
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		var Induceds = viewer.entities.add(new Cesium.Entity());
//		var cityCenter=[];
		eventInit();
		function eventInit(){
			$("#search").click(function(){
				var search = $("#chooseSource").val()
				screening(search);
			})
			$("#nav ul li").eq(5).click(function(){
				if($(this).attr("class") == "selected"){
					$(".jamBk2").show();
					self.trafficEvent(true);
					self.Floatingcar(true);
					self.FloatingcarTime(true);
					$("#nav ul li").eq(0).removeClass("selected");
					$("#nav ul li").eq(1).removeClass("selected");
					$("#nav ul li").eq(3).removeClass("selected");
					$("#nav ul li").eq(2).removeClass("selected");
					$("#nav ul li").eq(4).removeClass("selected");
				}else{
					cur_dsCodes=undefined;
					$(".jamBk2").hide()
					CesiumController.clear(false);
					$("#dsSelector").hide()
				}
	//			self.dsSelector.getIsOpen()?self.dsSelector.close():self.dsSelector.open();
			});
			$("#addMap div").eq(2).click(function(e){
				if(InducedBol){
					$(this).toggleClass("mapSelect");
					e.stopPropagation();
					if(Induceds.show){
						Induceds.show = false;
					}else{
						Induceds.show = true;
					}
					
				}
				
			});
			$("#addMap div").eq(1).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("mapSelect");
				self.changeMap();
			});
			$("#nav ul li").eq(4).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				self.FloatingcarTime();
			});
			$("#nav ul li").eq(1).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				self.trafficEvent();
			})
			$("#nav ul li").eq(0).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				self.Floatingcar();
			})
			
			$("body").click(function(e){
				e.stopPropagation();
				$("#pro ul").hide();
				$("#cities ul").hide();
			})
			$(".quanguo").click(function(e){
//				$(".quanguoBox").toggleClass("quanguoHide");
				e.stopPropagation();
				codeIndex = false;
				Induceds.show = false;	
				InducedBol = false;
				$("#leftEchart").hide();
				$("#addMap div").eq(2).removeClass("mapSelect");
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					barController.clear(true,false);
				}
				CesiumController.clear(false);
				borderController.show(true);
				$(".quanguo p").html("全国");
				$("#guo span").html("全国");
				$("#pro span").html("请选择省份");
				$("#cities span").html("请选择城市")
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"100000"}));
				if(traffiBol && $("#rightSource").css("display") == "block"){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}
			})
			
			$("#guo").click(function(e){
				e.stopPropagation();
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					barController.clear(true,false);
				}
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
				$("#pro ul").fadeIn();
				citySlected = true;
			})
			$("#cities").click(function(e){
				e.stopPropagation();
				if(citySlected){
					$("#cities ul").fadeIn();
					$("#cities ul li").unbind("click")
					bindCity($("#cities ul li"));
				}
			})
			
			navTime = setInterval(navHide,1000);
			$("#navShow").click(function(){
				navShow();
				navTime = setInterval(navHide,1000);
			})
			$(".UserPic").click(function(e){
				e.stopPropagation();
				$(".UserPic").fadeOut()
			})
			var induced = new Induced(InducedParse);
			parseCityInfo();
			borderController.show(true);
			barController.clear(false,false);
			Induceds.show = false;
		}
		function screening(search){
			for(var i=1;i<$(".customCheckBox").length;i++){
				$(".customCheckBox").eq(i).hide()
				var boxVal = $(".customCheckBox").eq(i).find("span").html();
				if(boxVal.indexOf(search)>=0){
					$(".customCheckBox").eq(i).show()
				}
			}
		}
		function navHide(){
			navNum--
			if(navNum==0){
				$("#nav").animate({
					"left":"-80px"
				})
				$("#leftSource").animate({
					"left":"30px"
				})
				$("#jam").animate({
					"left":"30px"
				})
				$("#dsSelector").animate({
					"left":"10px"
				})
				$(".jamBk1").animate({
					"left":"-80px"
				})
				clearInterval(navTime);
				$("#navShow").fadeIn()
			}
		}
		function navShow(){
			navNum=10;
			$("#navShow").fadeOut()
			$("#nav").animate({
				"left":"0px"
			})
			$("#leftSource").animate({
				"left":"110px"
			})
			$("#jam").animate({
				"left":"110px"
			})
			$("#dsSelector").animate({
				"left":"80px"
			})
			$(".jamBk1").animate({
				"left":"0px"
			})
		}
		handler.setInputAction(function (movement) {
	    	ClickEvent(movement)
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
		
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
		
		function Induced(parse){
			for(var i=0;i<parse.length;i++){
				var lat = parse[i][1].split(",")
				var bluePin = viewer.entities.add({
					parent : Induceds,
				    position : Cesium.Cartesian3.fromDegrees(lat[0],lat[1]),
				    name : "I"+parse[i][2],
				    billboard : {
				        image : "src/assets/images/dataSource/Induceds.jpg",
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
		            	scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.9, 0.8, 0.7)
				    }
				});
			}
		}
		
		function ClickEvent(movement){
			var pickedObject = viewer.scene.drillPick(movement.position);
	    	if (pickedObject.length > 0) {
	    		for (var i = 0; i < pickedObject.length; i++) {
	    			var pickID = pickedObject[i].id;
	    			advanceCity(pickID.name)
	    		}
	    	}
		}
		function advanceCity(pickID){
			var type = pickID.substr(0,1);
			var cityCode = pickID.substr(1,6);
			var num = pickID.indexOf("-");
			var cityName = pickID.substring(7,num);
			var index = pickID.substr(num+1,pickID.length+1)
			if(type == "p"){
				$("#city").html(cityName);
				$(".quanguo  p").html(cityName);
				$("#pro span").html(cityName);
				$("#cities span").html("请选择城市");
				codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					barController.clear(false,true,codeIndex);
				}
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
			}else if(type == "c"){
				borderController.show(false)
				InducedBol = true;
				$(".quanguo  p").html(cityName);
				$("#cities span").html(cityName);
				$("#leftEchart").show();
				cur_cityCode = cityCode;
				if(Floating && $("#leftSource").css("display") == "block"){
					ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cityCode}));
				}else{
					var city = CesiumController.getInfoByCityCode(cur_cityCode);
					$("#city").html(city.name)
					viewer.camera.flyTo({
						destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 100000.0)
					});
				}
				if(traffiBol && $("#rightSource").css("display") == "block"){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}
				if(Floating1){
					var dsList =CesiumController.getDsList(cur_cityCode);
					CesiumController.loadDataSource1(cur_cityCode,dsList);
				}
				if($("#nav ul li").eq(5).attr("class") == "selected"){
					CesiumController.loadDataSource(cur_cityCode,cur_dsCodes);
				}
				
				barController.clear(false,false)
			}else if(type == "I"){
				console.log(pickID.substring(1,pickID.length))
				var urls = "http://10.101.83.99/UserPic?picid="+pickID.substring(1,pickID.length);
				$(".UserPic").fadeIn();
				$(".UserPic img").attr({"src":urls})
			}
		}
		
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
				dom.parent().fadeOut();
				dom.parent().parent().find("h1").html($(this).html());
				var cityTxt = $(this).html();
				cityTxt = cityTxt.substr(cityTxt.indexOf(".")+1,cityTxt.length)
				$("#city").html(cityTxt);
				$(".quanguo  p").html(cityTxt);
				$("#pro span").html(cityTxt);
				$("#cities span").html("请选择城市");
				var cityCode = $(this).attr("class").toString();
				var codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					barController.clear(false,true,codeIndex);
				}
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
					dom.parent().fadeOut();
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
		this.trafficEvent = function(bol){
			if(bol){
				$("#rightSource").fadeOut()
//				$("#eventSource").hide();
//				$("#eventType").hide();
				cur_selectedIndex1=0;
				eventController.clear();
				eventController.active = false;
				traffiBol = false;
				return
			}
			traffiBol=!traffiBol;
			if(traffiBol){
				$("#rightSource").fadeIn()
				$("#eventSource").fadeIn();
				$("#eventType").fadeIn();
				eventController.clear();
				eventController.active = true;
				
				eventController.loadEvent(this.cityCode);
			}else{
				$("#rightSource").fadeOut()
//				$("#eventSource").hide();
//				$("#eventType").hide();
				
				cur_selectedIndex1=0;
				eventController.clear();
				eventController.active = false;
			}
			
		}
		
		this.Floatingcar = function(bol){
			if(bol){
				$("#leftSource").fadeOut()
				CesiumController.clear(true);
				barController.clear(false,false);
				Floating = false;
				return
			}
			Floating=!Floating;
			if(Floating){
				if(cur_cityCode == "100000" && codeIndex){
					$("#leftSource").fadeIn()
					barController.clear(false,true,codeIndex);
					return;
				}else if(cur_cityCode == "100000"){
					barController.clear(true,false);
				}
				$("#leftSource").fadeIn()
//				$("#sourceColors").show();
//				$("#w0").show();
//				
//				$("#w2").show();
//				$("#w3").show();
//				$("#w4").show();
//				$("#w5").show();
//				$("#w6").show();
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cur_cityCode}));
			}else{
				barController.clear(false,false);
				$("#leftSource").fadeOut()
//				$("#sourceColors").hide();
//				$("#w0").hide();
//				
//				$("#w2").hide();
//				$("#w3").hide();
//				$("#w4").hide();
//				$("#w5").hide();
//				$("#w6").hide();
				CesiumController.clear(true);
			}
		}
		this.FloatingcarTime = function(bol){
			if(bol){
				$(viewer.animation.container).hide();
				$(viewer.timeline.container).hide();
				CesiumController.clear(false);
				Floating1 = false;
				return
			}
			Floating1=!Floating1;
			if(Floating1){
//				if(cur_cityCode == "100000" && codeIndex){
//					barController.clear(false,true,codeIndex);
//					return;
//				}else if(cur_cityCode == "100000"){
//					barController.clear(true,false);
//				}
				var dsList =CesiumController.getDsList(cur_cityCode);
				CesiumController.loadDataSource1(cur_cityCode,dsList);
			}else{
				$(viewer.animation.container).hide();
				$(viewer.timeline.container).hide();
				barController.clear(false,false);
				CesiumController.clear(false);
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