﻿define("EventController", function(exporter) {
	var EventController = function(cesiumViewer) {
		var self = this;
		this.cesiumViewer = cesiumViewer;
		var viewer = this.cesiumViewer;
		
		this.active = false;
		
		 //飞到查看全国
		function flyToViewAll(duration,onComplete)
		{
			viewer.camera.flyTo({
				destination:new Cesium.Cartesian3(11774625.73689001,-1114014.9206093757,4616702.508886645),
				orientation : {
			        direction : new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476),
			        up : new Cesium.Cartesian3(0,0.7071067811865476,0.7071067811865476)
			    },
			    convert:false,
			    duration:duration,
			    complete:onComplete
			});
		}
	    //飞到当前城市
		function flyToCurrentCity(onComplete)
		{
			var city = self.getInfoByCityCode(cur_cityCode);
			$("#widgets #city").text(city.name);
			if(city == undefined)
			{
				onComplete();
			}
			else
			{
				if(city.name == "全国")
				{
					flyToViewAll(undefined,onComplete);
				}
				else
				{
					viewer.camera.flyTo({
						destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 100000.0),
						complete:onComplete
					});
				}
			}
		}
			
		//cur_cityCode = "100000";
		this.loadEvent = function(cityCode) {
			
			$(viewer.animation.container).hide();
			$(viewer.timeline.container).hide();
			flyToCurrentCity(function(){
				loadData();
			});

		}
		var timer;
		var eventSourceLoader;
		var eventTypeLoader;
		var eventCitysLoader;
		var eventCityLoader;
		var loadData = function(){
			if(eventSourceLoader!=undefined)eventSourceLoader.abort();
			if(eventTypeLoader!=undefined)eventTypeLoader.abort();
			if(eventCitysLoader!=undefined)eventCitysLoader.abort();
			if(eventCityLoader!=undefined)eventCityLoader.abort();
			
        	
			loadEventSourceCount();
			loadEventTypeCount();
			//console.log("cityCode; " +cur_cityCode);
			if (cur_cityCode == "100000") {
				
				loadAllCountryEvents();
			} else {
				loadCityEvents(cur_cityCode);
			}
			
			clearTimeout(timer);
			timer = setTimeout(loadData, 1000 * 60 * 2);
		}
		
		
		var loadEventSourceCount = function() {

			eventSourceLoader = exporter.Server.countEventBySource(cur_cityCode, function(data) {
				//console.log(data);
				if (data == "404") {
					loadEventSourceCount();
					return;
				}
				var sourceData = JSON.parse(data);

				var es0 = $("#widgets #eventSource #es0");
				//var es1 = $("#widgets #eventSource #es1");
				var es2 = $("#widgets #eventSource #es2");

				var t0 = $("#widgets #eventSource #es0 #text");
				var t02 = $("#widgets #eventSource #es0 #text2");
				//var t1 = $("#widgets #eventSource #es1 #text");
				var t2 = $("#widgets #eventSource #es2 #text");
				var t22 = $("#widgets #eventSource #es2 #text2");
				var setSource = function(source,sourceC) {

					es0.width(50 + '%');
					//es1.width(30 + '%');
					//es1.css('left', 40 + '%');
					es2.width(50 + '%');
					es2.css('left', 50+ '%');
					t0.text("当前有效："+sourceC[0]+'('+source[0] + '%)');
					//t1.text(sourceC[1]+'('+source[1] + '%)');
					t2.text("当前有效："+sourceC[2]+'('+source[2] + '%)');
					
				}
				var setSource2 = function(source,sourceC) {

					
					t02.text("当日累计："+sourceC[0]+'('+source[0] + '%)');
					//t1.text(sourceC[1]+'('+source[1] + '%)');
					t22.text("当日累计："+sourceC[2]+'('+source[2] + '%)');
					
				}
				var dayData = sourceData.dayCumulative;
				var curData = sourceData.currEffective;
				if (sourceData) {
					
					var s01 = curData[0].value;
					var s11 = curData[1].value;
					var s21 = curData[2].value;
					
					var total = s01+s11+s21;
					s01 = s01+s11;
				
					var p0 = Math.round(100*s01/total);
					//var p1 = Math.round(100*s11/total);
					var p1 = 0;
					var p2 = Math.round(100*s21/total);
					if(p0+p1+p2 >100) p0 = p0-(p0+p1+p2-100);
					if(p0+p1+p2 <100) p0 = p0+(100-p0-p1-p2);
					//console.log(p0);
					var source = new Array(p0,p1,p2);
					var sourceC = new Array(s01,s11,s21);
					setSource(source,sourceC);
					
					s01 = dayData[0].value;
					s11 = dayData[1].value;
					s21 = dayData[2].value;
					
					total = s01+s11+s21;
					s01 = s01+s11;
				
					p0 = Math.round(100*s01/total);
					//var p1 = Math.round(100*s11/total);
					p1 = 0;
					p2 = Math.round(100*s21/total);
					if(p0+p1+p2 >100) p0 = p0-(p0+p1+p2-100);
					if(p0+p1+p2 <100) p0 = p0+(100-p0-p1-p2);
					//console.log(p0);
					source = new Array(p0,p1,p2);
					sourceC = new Array(s01,s11,s21);
					setSource2(source,sourceC);
				}
			});
		}
		
		var loadEventTypeCount = function() {
			eventTypeLoader = exporter.Server.countEventByType(cur_cityCode, function(data) {
				//console.log(data);
				if (data == "404") {
					loadEventTypeCount();
					return;
				}
				var sourceData = eval(data);
				

				var map = {
					"事故" : 0,
					"施工类" : 0,
					"管制类" : 0,
					"关闭类" : 0,
					"其他" : 0,
					"交通流量" : 0
				};

				for (var i = 0; i < sourceData.length; i++) {
					map[sourceData[i].name] = sourceData[i].value;
				}
				$("#widgets #eventType #et1 #count").text(map["其他"]);
				$("#widgets #eventType #et2 #count").text(map["事故"]);
				$("#widgets #eventType #et3 #count").text(map["交通流量"]);
				$("#widgets #eventType #et4 #count").text(map["管制类"]);
				$("#widgets #eventType #et5 #count").text(map["施工类"]);
				$("#widgets #eventType #et6 #count").text(map["关闭类"]);
				
			});
		}
		
		
		var countEntities = [];
		this.firstTime = true;
		//获得全国的事件概况
		
		var loadEventCitysCount = function() {
			
			for(var i=0;i<countEntities.length;i++){
				viewer.entities.remove(countEntities[i]);
			}
			//console.log("loadEventCitysCount");
			var citys = "110000,120000,130100,140100,150100,210100,220100,230100," +
					"310000,320100,330100,340100,350100,360100,370100,410100,430100," +
					"440100,440300,450100,460100,500000,510100,520100,530100," +
					"540100,610100,620100,630100,640100,650100,420100";
			eventCitysLoader = exporter.Server.countEventByCity(citys, function(data) {
				//console.log(data);
				if (data == "404") {
					loadEventCitysCount();
					return;
				}
				//console.log("countEventByCity");
				var sourceData = eval(data);
				
				for(var i=0;i<sourceData.length;i++){
					var cityInfo = self.getInfoByCityCode(sourceData[i].code);
					
					var pinBuilder = new Cesium.PinBuilder();
					var position = Cesium.Cartesian3.fromDegrees(cityInfo.lat,cityInfo.lng);
					
					var cityPin = viewer.entities.add({
						name : sourceData[i].name,
						position : position,
						billboard : {
							image : pinBuilder.fromText(sourceData[i].value, Cesium.Color.BLACK,
									100).toDataURL(),

							verticalOrigin : Cesium.VerticalOrigin.BOTTOM

						}
					});
					countEntities.push(cityPin);
				}
				
				if(self.active && (cur_cityCode==="100000")){
					
				}else{
					for(var i=0;i<countEntities.length;i++){
						viewer.entities.remove(countEntities[i]);
					}
				}  
				countEntities = [];
			});
		}

		var loadAllCountryEvents = function() {

			//console.log("loadAllCountryEvents");
			loadEventCitysCount();
		}
		var eventFlagPic = {
				'1':'../../../../images/dataSource/pt2.png',
				'2':'../../../../images/dataSource/pt5.png',
				'3':'../../../../images/dataSource/pt4.png',
				'4':'../../../../images/dataSource/pt6.png',
				'5':'../../../../images/dataSource/pt1.png',
				'6':'../../../../images/dataSource/pt0.png'
		};
		var eventFlagPicCamera = {
				'1':'../../../../images/dataSource/ct2.png',
				'2':'../../../../images/dataSource/ct5.png',
				'3':'../../../../images/dataSource/ct4.png',
				'4':'../../../../images/dataSource/ct6.png',
				'5':'../../../../images/dataSource/ct1.png',
				'6':'../../../../images/dataSource/ct0.png'
		};
		var eventFlagColor = {
				'1':Cesium.Color.fromCssColorString('#e15049'),
				'2':Cesium.Color.fromCssColorString('#d69465'),
				'3':Cesium.Color.fromCssColorString('#3d93e9'),
				'4':Cesium.Color.fromCssColorString('#f5c13d'),
				'5':Cesium.Color.fromCssColorString('#8e6ac0'),
				'6':Cesium.Color.fromCssColorString('#ff7046')
			
		};
		var eventType;
		exporter.Server.getEventType(cur_cityCode, function(data) {
			    
				eventType=JSON.parse(data);
		});
		var eventMap = {};
	
		var eventEntities = [];
		var lastTimeEntites = {};
		
		var widgetes0 = $("#widgets #eventSource #es0");
		//var widgetes1 = $("#widgets #eventSource #es1");
		var widgetes2 = $("#widgets #eventSource #es2");
		var showes0 = true;
		var showes1 = true;
		var showes2 = true;
		//官方与权威
		widgetes0.click(function(e){
			
			if (cur_cityCode != "100000") {
				if(showes0){
				showes0 = false;
				}else{
					showes0 = true;
				}	
				showHideEntities(0,showes0);
				if(showes1){
					showes1 = false;
				}else{
					showes1 = true;
				}	
				showHideEntities(1,showes1);
			}
		});
		/*
		widgetes1.click(function(e){
			
			if (cur_cityCode != "100000") {
				if(showes1){
					showes1 = false;
				}else{
					showes1 = true;
				}	
				showHideEntities(1,showes1);
			}
		});*/
		widgetes2.click(function(e){
			
			if (cur_cityCode != "100000") {
				if(showes2){
					showes2 = false;
				}else{
					showes2 = true;
				}	
				showHideEntities(2,showes2);
			}
		});
		var entitySources = {};
		var showHideEntities = function(entitySource,show){
			
			for(var obj in lastTimeEntites){
				var source = entitySources[obj];
				//console.log(source);
				if(source !=null){				
					if(source==entitySource){
						lastTimeEntites[obj].show = show;
					}
				}
				
			}
		}
		
		var checkViewEntity = function(eventsData){
			for(var obj in lastTimeEntites){
				var exist = false;
				for(var i=0;i<eventsData.length;i++){
					var eventObj = eventsData[i];
					if(lastTimeEntites[eventObj.id] == null){
							
					}else{
						exist = true;
					}
				}
				if(!exist){
					viewer.entities.remove(lastTimeEntites[obj]);
					eventMap.remove(lastTimeEntites[obj].id);
					lastTimeEntites.remove(obj);
				}
				
			}
		}
		
		//获得城市的事件概况
		var loadEventByCity = function() {
			
			eventCityLoader = exporter.Server.queryEventByCity(cur_cityCode, function(data) {
				//console.log(data);
				if (data == "404") {
					loadEventByCity();
					return;
				}
				var sourceData = eval(data);
				var eventsData = sourceData[0].events;
				checkViewEntity(eventsData);
				entitySources = {};	
				var pinBuilder = new Cesium.PinBuilder();
				for(var i=0;i<eventsData.length;i++){
					var eventObj = eventsData[i];
					//console.log(eventObj.source);
					entitySources[eventObj.id] = eventObj.source;
					if(eventObj.type==null || eventObj.type=="") continue;
					var size = 30;
					var height = 0;
					var url;
					if(eventObj.pic){
						size = 40;
						height = 100;
						url = Cesium.buildModuleUrl(eventFlagPicCamera[eventObj.type]);
					}else{
						url = Cesium.buildModuleUrl(eventFlagPic[eventObj.type]);
					}
					var color = eventFlagColor[eventObj.type];
					
					if(eventObj.source==1){
						color = Cesium.Color.GOLD;
						size = 40;
					}
					//如果是新事件
					var newEvent = false;
					if(!self.firstTime){
						if(lastTimeEntites[eventObj.id] == null){
							//size = 60;
							height = 100;
							newEvent = true;
						}
					}
					eventMap[eventObj.id]=eventObj;
					//console.log(color);
					if(lastTimeEntites[eventObj.id] == null){
						var pos = (eventObj.lngLat).split(",");
						
						var eventPin = viewer.entities.add({
								name : eventObj.id,
								position : Cesium.Cartesian3.fromDegrees(pos[0],pos[1],height),
								billboard : {
									image : pinBuilder.fromUrl(url,color, size),
									verticalOrigin : Cesium.VerticalOrigin.BOTTOM
								}
							});
						
						lastTimeEntites[eventObj.id] = eventPin;
						if(newEvent)tweenPin(eventPin);//新事件
						
						function tweenPin(pin)
						{
							var obj = {scale:1};
							TweenMax.to(obj,1,{scale:3,onUpdate:function(_pin){
								_pin.billboard.scale = obj.scale;
							},onUpdateParams:[pin],yoyo:true,repeat:3});
						}
					}
					
				}
				if(self.firstTime) self.firstTime = false;
				
				showHideEntities(0,showes0);
				showHideEntities(1,showes1);
				showHideEntities(2,showes2);
			});
		}
		var infoBoxController = new InfoBoxController($("#infoBox"));
		var lineEntities=[];
		function removeLine(){
			
			for(var i=0; i< lineEntities.length;i++){
				viewer.entities.remove(lineEntities[i]);
			}
			lineEntities=[];
		}
		function flyToEvent(position,onComplete){
			removeLine();
			viewer.camera.flyTo({
				destination : Cesium.Cartesian3.fromDegrees(position.lng-0.002, position.lat-0.001, 3000.0),
				complete:onComplete
			});
		}
		
		var loadCityEvents = function(cityCode) {
			loadEventByCity();			
			
			//鼠标点击事件响应
			var selectPinHandler = new Cesium.ScreenSpaceEventHandler(
					viewer.scene.canvas);
			selectPinHandler.setInputAction(function(movement) {
				if(!self.active || cur_cityCode=="100000") return;
				//console.log(movement.position);
				var pickedObject = viewer.scene.pick(movement.position);
				
				if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
					var selectedPin = pickedObject.primitive;

					selectedPin.id.billboard.scale = 2;
					var timerPin;
					timerPin = setTimeout(function(){
						clearTimeout(timerPin);
						selectedPin.id.billboard.scale = 1;
					}, 1000 * 10 * 1)
					
					
					//将经纬度转为pix
					//var screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, starBurstState.center);
					var eventId = selectedPin.id.name;
					var eventObj = eventMap[eventId];
					
					var pos = (eventObj.lngLat).split(",");
					
					var position = {};
					position.lng=pos[0];
					position.lat=pos[1];
					flyToEvent(position,(function(id){
						exporter.Server.queryEventByCityAndId(cur_cityCode,id, function(data) {
							
							if (data == "404") {
								
								return;
							}
							var sourceData = JSON.parse(data);
							//console.log(sourceData);
							
							infoBoxController.updateInfo(sourceData);
							infoBoxController.open();
							//console.log("var: "+sourceData);
							if(!sourceData.shape || sourceData.shape == null) return;
							var shape = sourceData.shape;
							
							if(shape.length>0){
								
								var points = [];
								points.push(shape[0].startPoint.longitude);
								points.push(shape[0].startPoint.latitude);
								
								for(var i=0; i<shape[0].points.length;i++){
									points.push(shape[0].points[i].longitude);
									points.push(shape[0].points[i].latitude);
									
								}
								var lineEntity = viewer.entities.add({
							           	name : '',
							           	position : Cesium.Cartesian3.fromDegrees(pos[0],pos[1]),
							         	polyline : {
							         		positions :  Cesium.Cartesian3.fromDegreesArray(points),
							         		width : 5,
							         		material : new Cesium.PolylineOutlineMaterialProperty({
									            color : Cesium.Color.YELLOW,
									            outlineWidth : 4,
									            outlineColor : Cesium.Color.BLACK
									        })
							         	}
						        });
						        lineEntities = [];
								lineEntities.push(lineEntity);
								
							}
							
						});
					})(eventId));
				}else{
					infoBoxController.close();
				}

			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		}
        this.clear = function(){
        	//console.log("clear event");
        	self.firstTime = true;
        	if(timer!=undefined)
			{
				clearTimeout(timer);
				timer = undefined;
			}
			if(eventSourceLoader!=undefined)eventSourceLoader.abort();
			if(eventTypeLoader!=undefined)eventTypeLoader.abort();
			if(eventCitysLoader!=undefined)eventCitysLoader.abort();
			if(eventCityLoader!=undefined)eventCityLoader.abort();
			countEntities = [];
			lastTimeEntites = {};
			eventMap = {};
        	viewer.entities.removeAll();
		}
        
        var getEventTypeName = function(type){
        	//console.log(eventType);
        	if(!eventType) return "";
        	var name = "";
        	for(var i=0; i<eventType.length;i++){
        		if(type==eventType[i].code){
        			name = eventType[i].name;
        		}
        	}
        	return name;
        }
        var getEventSourceName = function(info){
        	var sName = "官方"
        	if(info.offcial==2){
        		sName = "高德用户";
        	}
        	return sName + "-" + info.nickName;
        }
        //infoBox
		function InfoBoxController(view)
		{
			this.view = view;
			var title = view.find(".title");
			var body = view.find(".body");
			var closeBt = view.find(".header .closeBt");
			var self = this;
			closeBt.click(function(){
				self.close();
			});
			this.updateInfo = function(info)
			{
				title.text(info!=undefined?info.roadName:"");
				if(info!=undefined)
				{
					var htmlStr = "";
					//console.log(info);
					htmlStr+="<div style='font-size:20px;'><label style='font-weight:bold;'>【事件类型】</label></div>";
					htmlStr+="<div style='font-size:20px;'>"+getEventTypeName(info.eventType)+"</div>";
					htmlStr+="<div style='font-size:20px;'><label style='font-weight:bold;'>【事件详情】</label></div>";
					htmlStr+="<div style='font-size:20px;'>"+info.eventDesc+"</div>";
					htmlStr+="<div style='font-size:20px;'><label style='font-weight:bold;'>【事件时间】</label></div>";
					htmlStr+="<div style='font-size:20px;'>"+getTimeDesc(info.timePeriod)+"</div>";
					htmlStr+="<div style='font-size:20px;'><label style='font-weight:bold;'>【事件来源】</label></div>";
					htmlStr+="<div style='font-size:20px;'>"+getEventSourceName(info)+"</div>";
					
					if(info.picture && info.picture!=""){
						htmlStr+="<div style='font-size:20px;'><img style='height:200px;width:auto;' src='"+info.picture+"'></div>";

					}
					body.html(htmlStr);
				}
				else
				{
					body.empty();
				}
			}
			
			this.open = function()
			{
				this.view.css("display","block");
				exporter.mouseChildren(this.view,true);
				TweenLite.to(this.view,0.5,{left:1480,ease:Expo.easeInOut});
			}
			
			this.close = function()
			{
				removeLine();
				flyToCurrentCity(function(){});
				
				this.view.css("display","none");
				exporter.mouseChildren(this.view,false);
				TweenLite.to(this.view,0.5,{left:1920,ease:Expo.easeInOut});
			}
		}
		function getTimeDesc(data){

			Date.prototype.format = function (fmt) {
			    var o = {
			        "M+": this.getMonth() + 1, //月份 
			        "d+": this.getDate(), //日 
			        "h+": this.getHours(), //小时 
			        "m+": this.getMinutes(), //分 
			        "s+": this.getSeconds(), //秒 
			        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			        "S": this.getMilliseconds() //毫秒 
			    };
			    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			    for (var k in o){
			        if (new RegExp("(" + k + ")").test(fmt)) {
			            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			        }
			    }
			    return fmt;
			};
			function timestampToTime(t){
				var d = new Date("2016-01-01 00:00:00");
				var dTimeStamp = Date.parse(d);
				var newTimeStamp = Number(dTimeStamp) + Number(t)*1000;
				var newD = new Date(newTimeStamp);
		
				return newD.format("hh:mm:ss");
		
			}
		
			if(data == null || data.daySel == undefined){
				console.log("get null");
				return null;
			}else{
				var strArr = [];
				switch (data.daySel){
					case 0:
						strArr.push("从");
						var startDate = new Date(data.startDate*1000);
						var startDateStr = startDate.format("yyyy-MM-dd");
						strArr.push(startDateStr);
						strArr.push(" ");
						strArr.push(timestampToTime(data.timeSlot[0].startTime));
						strArr.push("到");
						var endDate = new Date(data.endDate*1000);
						var endDateStr = endDate.format("yyyy-MM-dd");
						strArr.push(endDateStr);
						strArr.push(" ");
						strArr.push(timestampToTime(data.timeSlot[0].endTime));
		
						break;
					case 127:
						strArr.push("从");
						var startDate = new Date(data.startDate*1000);
						var startDateStr = startDate.format("yyyy-MM-dd");
						strArr.push(startDateStr);
						strArr.push("到");
						var endDate = new Date(data.endDate*1000);
						var endDateStr = endDate.format("yyyy-MM-dd");
						strArr.push(endDateStr);
						strArr.push("每天");
						for(var i=0;i<data.timeSlot.length;i++){
							var tmp = data.timeSlot[i];
							strArr.push(timestampToTime(tmp.startTime));
							strArr.push("-");
							strArr.push(timestampToTime(tmp.endTime));
							strArr.push(" ");
						}
						break;
					default :
						console.log("not find");
				}
				return strArr.join("");
			}
		};
	}
	
	return EventController;
});