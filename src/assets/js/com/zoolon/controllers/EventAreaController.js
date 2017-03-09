/**
 * 
 */
define("eventAreaController",function(exporter){
	var eventAreaController  = function(controller){
		var eventController = controller.eventController;
		var eventVController = controller.eventVController;
		var CesiumController = controller.cesiumController;
		var widgetsController = controller.widgetsController;
		widgetsController.controllers.widget1.onSelectCity = selectCityHandler;

		var viewer = controller.cesiumController.cesiumViewer;
		var barController = new $at.BarController(controller);
		var borderController = new $at.BorderController(controller);
		var provinceCitycode = barController.citys;
		var layers = viewer.imageryLayers;
		var self = this;
		var dsCodes = undefined;
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		var cesiumType=1;
		var cityBorder;
		
		var proArr=[];
		var proCenter=[];
		var navNum=10;
		var mapArea,traffiBol,Floating,Floating1,InducedBol,codeIndex,Spacebol,traffiBolV = false;
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
			navLi.eq(6).on("click",function(e){
				e.stopPropagation();
				$(this).toggleClass("selected");
				traffiBolV ? self.trafficVideo.clear() : self.trafficVideo.show();
			})
			
			navLi.eq(4).click(function(e){
				if($("#nav ul li").eq(5).attr("class") == "selected")$("#nav ul li").eq(5).trigger("click");
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
					}else{
						$(this).addClass("mapSelect");
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
					$(this).removeClass("mapSelect");
				}else{
					$(this).addClass("mapSelect");
				}
				self.changeMap();
			});
			$("#addMap div").eq(0).click(function(e){
				e.stopPropagation();
				if(cesiumType !=3 ){return}
				if($(this).hasClass("mapSelect")){
					$(this).removeClass("mapSelect");
					self.SpaceTime.clear();
				}else{
					$(this).addClass("mapSelect");
					self.SpaceTime.show();
				}
			});
			
			$("#widgets #w1 #menu #searchIcon").click(function(e){
				returnGuo();
			})
			function returnGuo(){
				cur_cityCode = 100000;
				cesiumType=1;
				viewer.entities.remove(cityBorder);
				$("#addMap div").eq(0).removeClass("mapSelect");
				self.SpaceTime.clear();
				if(Floating)contryBar();
				$("#leftBk").hide();
				codeIndex = false;
				Induceds.show = false;	
				InducedBol = false;
				$("#leftEchart").hide();
				$(".leftEchart").hide();
				$("#addMap div").eq(2).removeClass("mapSelect");
				CesiumController.clear(false);
				borderController.show(true);
				$(".quanguo").html("全国");
				$("#guo span").html("全国");
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"100000"}));
				if(traffiBol && $("#rightSource").css("display") == "block"){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(this.cityCode);
				}
				if(traffiBolV && $("#rightSource").css("display") == "block"){
					eventVController.clear();
					eventVController.active = true;
					eventVController.loadEvent(this.cityCode);
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
			
			$(".UserPic").click(function(e){
				e.stopPropagation();
				$(".UserPic").fadeOut()
			})
			
			$("#spaceTime").click(function(){
				$("#spaceTime").hide();
			})
			var induced = new Induced(InducedParse,"src/assets/images/dataSource/Induceds.jpg");
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
		viewer.screenSpaceEventHandler.setInputAction(function (movement) {
	    	
	    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		handler.setInputAction(function (movement) {
	    	ClickEvent(movement)
	    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
//	    handler.setInputAction(function (movement) {
//	    	console.log("null")
//	    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );
		
		function contryBar(vars){
			barController.drawBars("http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes=100000","pro",cesiumType,dsCodes);
//			barController.drawBars("src/assets/data/全国-分源.json","pro",cesiumType,dsCodes);
		}
		function cityBar(cityCode,vars){
				
				var cityUrl = "http://140.205.57.130/portal/diagram/fp!getDayKpi.action?params.cityCodes="+cityCode
//				var cityUrl = "src/assets/data/省份-不分源.json";
				barController.drawBars(cityUrl,"city",cesiumType,dsCodes);
		}
		
		function Induced(parse,imgUrl){
			for(var i=0;i<parse.length;i++){
				var lat = parse[i][1].split(",");
				var bluePin = viewer.entities.add({
					parent : Induceds,
				    position : Cesium.Cartesian3.fromDegrees(lat[0],lat[1]),
				    name : "I"+parse[i][2],
				    billboard : {
				        image : imgUrl,
				        scale : 0.4,
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
		            	scaleByDistance : new Cesium.NearFarScalar(1.5e2, 1, 0.8, 0.6)
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
				$(".quanguo").html(cityName);
				codeIndex = indexOf(borderController.citys, parseInt(cityCode/10000)*10000);
				borderController.show(false,true,codeIndex);
				if(Floating)cityBar(parseInt(cityCode/10000)*10000);
				cur_cityCode = parseInt(cityCode/10000)*10000;
				$(document).trigger("loadList",cur_cityCode);
				if(traffiBol){
					eventController.clear();
					eventController.active = true;
					eventController.loadEvent(cur_cityCode,true);
				}
				if(traffiBolV){
					eventVController.clear();
					eventVController.active = true;
					eventVController.loadEvent(cur_cityCode,true);
				}
				viewer.camera.flyTo({
					destination : Cesium.Cartesian3.fromDegrees(proCenter[index][0], proCenter[index][1]-6, 800000.0),
					orientation : {
				        direction : new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476),
				        up : new Cesium.Cartesian3(0,0.7071067811865476,0.7071067811865476)
				    }
				});
			}else if(type == "c"){
				cesiumType=3;
				barController.CityClear();
				borderController.show(false);
				InducedBol = true;
				$(".quanguo").html(cityName);
				cur_cityCode = cityCode;
//				drcwCityborder(cur_cityCode)
				if(Floating){
					cityBar(cityCode);
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
				if(traffiBolV){
					eventVController.clear();
					eventVController.active = true;
					eventVController.loadEvent(this.cityCode);
				}
				if(Floating1){
					var dsList =CesiumController.getDsList(cur_cityCode);
					CesiumController.loadDataSource1(cur_cityCode,dsList);
				}
			}else if(type == "I"){
				var urls = "http://10.101.83.99/UserPic?picid="+pickID.substring(1,pickID.length);
				$(".UserPic").fadeIn();
				$(".UserPic img").attr({"src":urls});
			}else if(type == "o"){
				cesiumType=3;
				InducedBol = true;
				$(".quanguo").html(cityName);
				$("#leftEchart").hide();
				$(".leftEchart").hide();
				cur_cityCode = cityCode;
//				drcwCityborder(cur_cityCode)
				if(Floating){
					cityBar(cityCode);
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
				if(traffiBolV){
					eventVController.clear();
					eventVController.active = true;
					eventVController.loadEvent(this.cityCode);
				}
				if(Floating1){
					var dsList =CesiumController.getDsList(cur_cityCode);
					CesiumController.loadDataSource1(cur_cityCode,dsList);
				}
				self.SpaceTime.clear();
				$("#addMap div").eq(0).removeClass("mapSelect");
			}else if(type == "s"){
				$("#spaceTime").show();
			}
		}
		function selectCityHandler(info)
		{
			cesiumType=3;
			InducedBol = true;
			borderController.show(false)
			$(".quanguo").html(info.name);
			$("#leftEchart").hide();
			$(".leftEchart").hide();
			cur_cityCode = info.citycode;
			if(Floating){
				cityBar(info.citycode);
				ExternalCall(JSON.stringify({cmd:"goCity",cityCode:cur_cityCode}));
			}else{
				var city = CesiumController.getInfoByCityCode(cur_cityCode);
				$("#city").html(info.name)
				viewer.camera.flyTo({
					destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 100000.0)
				});
			}
			if(traffiBol){
				eventController.clear();
				eventController.active = true;
				eventController.loadEvent(info.citycode);
			}
			if(traffiBolV){
				eventVController.clear();
				eventVController.active = true;
				eventVController.loadEvent(info.citycode);
			}
			if(Floating1){
				var dsList =CesiumController.getDsList(cur_cityCode);
				CesiumController.loadDataSource1(cur_cityCode,dsList);
			}
//			loadDataSource(info.citycode);
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
				$(".quanguo").html(cityTxt);
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
				$(".quanguo").html(cityTxt);
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
				if(traffiBolV){
					eventVController.clear();
					eventVController.active = true;
					eventVController.loadEvent(this.cityCode);
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
		$("#info").on('source',function (e,data,dataArr) {
		  var values = JSON.parse(data);
		  dsCodes = values;
		  if(cesiumType == 1){
		  	contryBar(values);
		  }else if(cesiumType == 2){
		  	cityBar(cur_cityCode,values);
		  }else if(cesiumType == 3){
		  	cityBar(cur_cityCode,values);
		  }
		});
		
		
		this.trafficEvent = {};
		this.trafficEvent.show = function(){
			traffiBol=true;
			$("#rightSource").fadeIn();
			$("#eventSource").fadeIn();
			$("#eventType").fadeIn();
			eventController.clear();
			eventController.active = true;
			if(cesiumType == 2){
				eventController.clear();
				eventController.active = true;
				eventController.loadEvent(cur_cityCode,true);
			}else{
				eventController.loadEvent(this.cityCode);
			}
			
		}
		this.trafficEvent.clear = function(){
			traffiBol=false;
			$("#rightSource").fadeOut()
			eventController.clear();
			eventController.active = false;
		}
		
		this.trafficVideo = {};
		this.trafficVideo.show = function(){
			traffiBolV=true;
			eventVController.clear();
			eventVController.active = true;
			if(cesiumType == 2){
				eventVController.clear();
				eventVController.active = true;
				eventVController.loadEvent(cur_cityCode,true);
			}else{
				eventVController.loadEvent(this.cityCode);
			}
			
		}
		this.trafficVideo.clear = function(){
			traffiBolV=false;
			eventVController.clear();
			eventVController.active = false;
		}

		this.Floatingcar = {};
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
			$("#leftSource").fadeOut();
			$("#leftEchart").hide();
			$(".leftEchart").hide();
			CesiumController.clear(true);
		}
		
		this.FloatingcarTime = {};
		this.FloatingcarTime.clear = function(){
			Floating1 = false;
			CesiumController.clear(false);
			
		}
		this.FloatingcarTime.show = function(){
			Floating1=true;
			var dsList =CesiumController.getDsList(cur_cityCode);
			CesiumController.loadDataSource1(cur_cityCode,dsList);
		}
		
		this.SpaceTime = {};
		this.SpaceTime.clear = function(){
			Spacebol = false;
			$("#spanTime").fadeOut();
			viewer.entities.removeById("spaceTimeRoad");
			viewer.entities.removeById("spaceTimeRoad1");
			viewer.entities.removeById("spaceTimeRoad2");
			$("#spaceTime").fadeOut();
		}
		this.SpaceTime.show = function(){
			Spacebol=true;
			$at.get("http://100.81.154.179:8080/spacetimeDiagram/getCityList?city="+cur_cityCode+"&daytime=20161101",undefined,function(datas){
				var index="";
				for(var i=0;i<datas.data.length;i++){
					index+="<li class="+datas.data[i].id+"><h1>"+datas.data[i].roadName+"</h1><h4>"+datas.data[i].startName+"</h4><h5>至</h5><h4>"+datas.data[i].endName+"</h4></li>"
				}
				$("#spanTime ul").html(index);
				spaceBind();
			})
			$("#spanTime").fadeIn();
		}
		var inter = "";
		var road = "";
		this.changeMap = function(){
			if(mapArea){
				clearInterval(inter);
				layers.remove(road, true);
			}else{
				addMap();
				inter = setInterval(addMap,5*60*1000)
				function addMap(){
					if(road != "")layers.remove(road, true);
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
				
			}
			mapArea=!mapArea;
		}
		
		function drcwCityborder(cityCode){
			$at.get("src/assets/data/cityArea.json").then(function(data){
				for(var i=0;i<data.features.length;i++){
					if(data.features[i].properties.AD_CODE == cityCode){
						Border(data.features[i].geometry.coordinates);
					}
				}
			})
		}
		function spaceBind(){
			$("#spanTime ul li").on("click",function(){
				var id = $(this).attr("class")
				$at.get("http://100.81.154.179:8080/spacetimeDiagram/getSpaceTimeDiagram?city="+cur_cityCode+"&id="+id+"&daytime=20161101",undefined,function(datas){
					console.log(datas)
					var positions = datas.data[0].xys.replace(/\;/g,",");
					var center = datas.data[0].centerPoint.split(",");
					spaceRoad(positions,datas.data[0].url,center);
				})
			})
		}
		function spaceRoad(positions,url,center){
			var po = positions.split(",")
			viewer.entities.removeById("spaceTimeRoad");
			viewer.entities.removeById("spaceTimeRoad1");
			viewer.entities.removeById("spaceTimeRoad2");
			positions = eval("["+positions+"]");
			viewer.camera.flyTo({
				destination:Cesium.Cartesian3.fromDegrees(parseFloat(center[0])+0.01,parseFloat(center[1])+0.01,30000)
			});
			$("#spaceTime").attr({"src":url})
			$("#spaceTime").fadeIn();
			spaceTimeRoad = viewer.entities.add({
				name : "spaceTimeRoad",
				id : "spaceTimeRoad",
	            polyline : {
			        positions : Cesium.Cartesian3.fromDegreesArray(positions),
			        width : 4,
			        material : new Cesium.PolylineOutlineMaterialProperty({
			            color : Cesium.Color.ORANGE,
			            outlineWidth : 2,
			            outlineColor : Cesium.Color.LIGHTSLATEGRAY   
			        })
			    }
		    });
		    spaceTimeRoad1 = viewer.entities.add({
		   		id : "spaceTimeRoad1",
				position : Cesium.Cartesian3.fromDegrees(po[0],po[1],0),
				billboard : {
					image : "src/assets/images/dataSource/start.png",
					scale : 0.4, 
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM
				}
			});
			spaceTimeRoad2 = viewer.entities.add({
				id : "spaceTimeRoad2",
				position : Cesium.Cartesian3.fromDegrees(po[po.length-2],po[po.length-1],0),
				billboard : {
					image : "src/assets/images/dataSource/stop.png",
					scale : 0.4, 
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM
				}
			});
			
		}
		
		function Border(data){
			var positions=[];
			var positionArr = [];
			if(typeof(data[0][0]) == "number"){
				positionArr.push(data);	
			}else{
				positionArr = data;
			}
			for(var m=0;m<positionArr.length;m++){
				for(var i=0;i<positionArr[m].length;i++){
					positions.push(positionArr[m][i][0],positionArr[m][i][1]);
				}
				cityBorder = viewer.entities.add({
			        polygon : {
				        hierarchy : Cesium.Cartesian3.fromDegreesArray(positions),
				        material : Cesium.Color.fromCssColorString('#0c6bad').withAlpha(0.01),
				        outline : true,
				        outlineColor : Cesium.Color.fromCssColorString('#0c6bad'),
				        outlineWidth : 3
				    }
			    });
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