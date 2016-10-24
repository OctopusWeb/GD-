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
		var self = this;
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		
		var proArr=[];
		var proCenter=[];
		var navNum=10;
		var mapArea,traffiBol,Floating,Floating1,InducedBol,codeIndex = false;
		var Induceds = viewer.entities.add(new Cesium.Entity());
		
		eventInit();
		function eventInit(){
			$("#search").click(function(){
				var search = $("#chooseSource").val()
				screening(search);
			});
			$("#dataSour").click(function(){
				$("#dsSelector").animate({"left":"80px"});
				$("#dataSour").hide();
			});
			$("#addMap div").eq(2).click(function(e){
				if(InducedBol){
					if($(this).hasClass("mapSelect")){
						$(this).removeClass("mapSelect");
						$(this).find("img").attr({"src":"src/assets/images/dataSource/sourceIcon9.png"})
					}else{
						$(this).addClass("mapSelect");
						$(this).find("img").attr({"src":"src/assets/images/dataSource/sourceIcon91.png"})
					}
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
				if($(this).hasClass("mapSelect")){
					$(this).find("img").attr({"src":"src/assets/images/dataSource/sourceIcon6.png"})
					$(this).removeClass("mapSelect");
				}else{
					$(this).addClass("mapSelect");
					$(this).find("img").attr({"src":"src/assets/images/dataSource/sourceIcon61.png"})
				}
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
				e.stopPropagation();
				returnGuo();
			})
			function returnGuo(){
				$("#leftBk").hide()
				codeIndex = false;
				Induceds.show = false;	
				InducedBol = false;
				$("#leftEchart").hide();
				$("#addMap div").eq(2).removeClass("mapSelect");
				barController.CityClear();
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					barController.clear(true,false);
				}
				CesiumController.clear(false);
				borderController.show(true);
				$(".quanguo p").html("全国");
				$("#guo span").html("全国");
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"100000"}));
				if(traffiBol && $("#rightSource").css("display") == "block"){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}
			}
			$(".tabClick li").eq(0).click(function(){
				$(".tabClick li").eq(0).addClass("active")
				$(".tabClick li").eq(1).removeClass("active")
				$(".tabList").eq(0).show()
				$(".tabList").eq(1).hide()
			})
			$(".tabClick li").eq(1).click(function(){
				$(".tabClick li").eq(1).addClass("active")
				$(".tabClick li").eq(0).removeClass("active")
				$(".tabList").eq(1).show()
				$(".tabList").eq(0).hide()
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
				$(".customCheckBox").eq(i).hide();
				search = search.toLowerCase();
				var se = search.replace(/(.)(?=[^$])/g,"$1,").split(",")
				var num=0;
				var boxVal = $(".customCheckBox").eq(i).find("span").html().toLowerCase();
				for(var m=0;m<se.length;m++){
					if(boxVal.indexOf(se[m])>=0){
						num++
					}
				}
				if(num==se.length){$(".customCheckBox").eq(i).show()}
			}
		}
		function navHide(){
			navNum--
			if(navNum==0){
				$("#nav").animate({"left":"-80px"})
				$("#leftSource").animate({"left":"30px"})
				$("#jam").animate({"left":"30px"})
				$(".jamBk1").animate({"left":"-80px"})
				clearInterval(navTime);
				$("#navShow").fadeIn()
			}
		}
		function navShow(){
			navNum=10;
			$("#navShow").fadeOut()
			$("#nav").animate({"left":"0px"})
			$("#leftSource").animate({"left":"110px"})
			$("#jam").animate({"left":"110px"})
			$(".jamBk1").animate({"left":"0px"})
		}
		handler.setInputAction(function (movement) {
	    	ClickEvent(movement)
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
	    
		contryBar();
		function contryBar(){
//			barController.drawBars("http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro");
			barController.drawBars("src/assets/data/全国-分源.json","pro");
		}
		function cityBar(cityCode){
//				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+cityCode
				var cityUrl = "src/assets/data/省份-不分源.json";
				barController.drawBars(cityUrl,"city");
		}
		function sourceBar(cityCode,dataType,source){
//				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+cityCode
				var cityUrl = "src/assets/data/省份-不分源.json";
				barController.drawBars(cityUrl,dataType,source);
		}
		
		function Induced(parse){
			for(var i=0;i<parse.length;i++){
				var lat = parse[i][1].split(",");
				var bluePin = viewer.entities.add({
					parent : Induceds,
				    position : Cesium.Cartesian3.fromDegrees(lat[0],lat[1]),
				    name : "I"+parse[i][2],
				    billboard : {
				        image : "src/assets/images/dataSource/Induceds.jpg",
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
		            	scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.6, 0.5, 0.4)
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
			var index = pickID.substr(num+1,pickID.length+1);
			if(type == "p"){
				$("#city").html(cityName);
				$(".quanguo  p").html(cityName);
				codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					cityBar(cityCode/10000*10000)
					barController.clear(false,true);
				}
				if($("#nav ul li").eq(5).attr("class") == "selected"){
					proNumshow(cityCode,cur_dsCodes,cur_label)
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
				barController.clear(false,false)
			}else if(type == "I"){
				var urls = "http://10.101.83.99/UserPic?picid="+pickID.substring(1,pickID.length);
				$(".UserPic").fadeIn();
				$(".UserPic img").attr({"src":urls});
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
				var cityCode = $(this).attr("class").toString();
				var codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				if($("#leftSource").css("display") == "none"){
					barController.clear(false,false);
				}else{
					cityBar(cityCode/10000*10000)
					barController.clear(false,true);
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
			for (var i=0;i<cityData.length;i++) {
				var cityInfo = cityData[i].properties;
				if(parseInt(cityInfo.AD_CODE/10000) == parseInt(cityCode/10000) || cityCode == "100000"){
					if(cityCode == "100000"){
						proArr.push(cityInfo.AD_CODE)
					}
					var cityInfoArray=[];
					var proCentertime = [];
					proCentertime.push(cityInfo.X_COORD,cityInfo.Y_COORD,cityInfo.AD_CODE);
					//pro
					proCenter.push(proCentertime);
					cityInfoArray.push(cityInfo.AD_CODE,cityInfo.NAME);
					cityArray.push(cityInfoArray);
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
					cityBar(cityCode/10000*10000)
					barController.clear(false,true);
					return;
				}else if(cur_cityCode == "100000"){
					barController.clear(true,false);
				}
				$("#leftSource").fadeIn()
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cur_cityCode}));
			}else{
				barController.clear(false,false);
				$("#leftSource").fadeOut()
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
				var dsList =CesiumController.getDsList(cur_cityCode);
				CesiumController.loadDataSource1(cur_cityCode,dsList);
				
			}else{
				$(viewer.animation.container).hide();
				$(viewer.timeline.container).hide();
				barController.clear(false,false);
				CesiumController.clear(false);
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
	return eventAreaController;
})