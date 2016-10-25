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
		var cesiumType=1;
		
		var proArr=[];
		var proCenter=[];
		var navNum=10;
		var mapArea,traffiBol,Floating,Floating1,InducedBol,codeIndex = false;
		var Induceds = viewer.entities.add(new Cesium.Entity());
		
		eventInit();
		function eventInit(){
			var nav = $("#nav");
			
			var navLi=nav.find("ul li");
			navLi.eq(0).on("click",function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				Floating ? self.Floatingcar.clear() : self.Floatingcar.show();
			})
			
			navLi.eq(1).on("click",function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				traffiBol ? self.trafficEvent.clear() : self.trafficEvent.show();
			})
			
			navLi.eq(4).click(function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				Floating1 ? self.FloatingcarTime.clear() : self.FloatingcarTime.show();
			});
			
			
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
			
			
			$(".quanguo").click(function(e){
				e.stopPropagation();
				returnGuo();
			})
			function returnGuo(){
				cesiumType=1;
				if(Floating)contryBar();
				$("#leftBk").hide()
				codeIndex = false;
				Induceds.show = false;	
				InducedBol = false;
				$("#leftEchart").hide();
				$("#addMap div").eq(2).removeClass("mapSelect");
//				barController.clear
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
	    
		
		function contryBar(vars){
//			barController.drawBars("http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro");
			barController.drawBars("src/assets/data/全国-分源.json","pro",cesiumType,vars);
		}
		function cityBar(cityCode,vars){
//				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+cityCode
				var cityUrl = "src/assets/data/省份-不分源.json";
				barController.drawBars(cityUrl,"city",cesiumType,vars);
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
				cesiumType=2;
				$("#city").html(cityName);
				$(".quanguo  p").html(cityName);
				codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				borderController.show(false,true,codeIndex);
				if(Floating)cityBar(codeIndex);
				viewer.camera.flyTo({
					destination : Cesium.Cartesian3.fromDegrees(proCenter[index][0], proCenter[index][1]-6, 800000.0),
					orientation : {
				        direction : new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476),
				        up : new Cesium.Cartesian3(0,0.7071067811865476,0.7071067811865476)
				    }
				});
			}else if(type == "c"){
				cesiumType=3;
				barController.CityClear()
				borderController.show(false)
				InducedBol = true;
				$(".quanguo  p").html(cityName);
				$("#leftEchart").show();
				cur_cityCode = cityCode;
				if(Floating){
					ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cityCode}));
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
				if(Floating1){
					var dsList =CesiumController.getDsList(cur_cityCode);
					CesiumController.loadDataSource1(cur_cityCode,dsList);
				}
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
		$("#info").on('source',function (e,data) {
		  var values = JSON.parse(data);
		  if(cesiumType == 1){
		  	contryBar(values);
		  }else if(cesiumType == 2){
		  	cityBar(codeIndex,values);
		  }
		});
		this.trafficEvent = {}
		this.trafficEvent.show = function(){
			traffiBol=true;
			$("#rightSource").fadeIn();
			$("#eventSource").fadeIn();
			$("#eventType").fadeIn();
			eventController.clear();
			eventController.active = true;
			eventController.loadEvent(this.cityCode);
		}
		this.trafficEvent.clear = function(){
			traffiBol=false;
			$("#rightSource").fadeOut()
			eventController.clear();
			eventController.active = false;
		}

		this.Floatingcar = {}
		this.Floatingcar.show = function(){
			Floating=true;
			$("#leftSource").fadeIn()
			if(cesiumType == 1){
				contryBar();
			}else if(cesiumType == 2){
				cityBar(cur_cityCode);
				return;
			}
			ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cur_cityCode}));
		}
		this.Floatingcar.clear = function(){
			Floating=false;
			barController.CityClear();
			$("#leftSource").fadeOut()
			CesiumController.clear(true);
		}
		
		this.FloatingcarTime = {};
		this.FloatingcarTime.clear = function(){
			Floating1 = false;
			$(viewer.animation.container).hide();
			$(viewer.timeline.container).hide();
			CesiumController.clear(false);
			
		}
		this.FloatingcarTime.show = function(){
			Floating1=true;
			var dsList =CesiumController.getDsList(cur_cityCode);
			CesiumController.loadDataSource1(cur_cityCode,dsList);
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