﻿define("EventController", function(exporter) {
	var EventController = function(cesiumViewer) {
		var self = this;
		this.cesiumViewer = cesiumViewer;
		var viewer = this.cesiumViewer;
		var entityId = [];
		var city;
		
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
			city = self.getInfoByCityCode(cur_cityCode);
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
				else{
					if(cur_selectedIndex1 == 3){
						onComplete(city);
					}else
					{
						viewer.camera.flyTo({
							destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 100000.0),
							complete:onComplete
						});
					}
					
				}
				
			}
		}
			
		//cur_cityCode = "100000";
		this.loadEvent = function(cityCode,types) {
			$(viewer.animation.container).hide();
			$(viewer.timeline.container).hide();
			if(types){
				if(eventSourceLoader!=undefined)eventSourceLoader.abort();
				if(eventTypeLoader!=undefined)eventTypeLoader.abort();
				if(eventCitysLoader!=undefined)eventCitysLoader.abort();
				if(eventCityLoader!=undefined)eventCityLoader.abort();
				
	        	
				loadEventSourceCount();
				loadEventTypeCount();
				loadEventCitys()
				return
			}
			flyToCurrentCity(function(){
				loadData();
				if (cur_cityCode == "100000") {
				}else{
					addMouseHander();
				}
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
				loadEventByCity();			
				
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

					es0.width(100 + '%');
					//es1.width(30 + '%');
					//es1.css('left', 40 + '%');
					es2.width(100 + '%');
					es2.css('left', 0+ '%');
//					t0.text("当前有效："+sourceC[0]+'('+source[0] + '%)');
					t0.html("<div class='label0'>"+"当前有效："+source[0] + '%'+"</div>"+"<div class='label1'>"+"当前有效："+sourceC[0]+'('+source[0] + '%)'+"</div>");
					//t1.text(sourceC[1]+'('+source[1] + '%)');
//					t2.text("当前有效："+sourceC[2]+'('+source[2] + '%)');
					t2.html("<div class='label0'>"+"当前有效："+source[2] + '%'+"</div>"+"<div class='label1'>"+"当前有效："+sourceC[2]+'('+source[2] + '%)'+"</div>");
					
				}
				var setSource2 = function(source,sourceC) {

					
//					t02.text("当日累计："+sourceC[0]+'('+source[0] + '%)');
					t02.text("当日累计："+source[0] + '%');
					t02.html("<div class='label0'>"+"当日累计："+source[0] + '%'+"</div>"+"<div class='label1'>"+"当日累计："+sourceC[0]+'('+source[0] + '%)'+"</div>");
					//t1.text(sourceC[1]+'('+source[1] + '%)');
//					t22.text("当日累计："+sourceC[2]+'('+source[2] + '%)');
//					t22.text("当日累计："+source[2] + '%');
					t22.html("<div class='label0'>"+"当日累计："+source[2] + '%'+"</div>"+"<div class='label1'>"+"当日累计："+sourceC[2]+'('+source[2] + '%)'+"</div>");
					
				}
				var dayData = sourceData.dayCumulative;
				var curData = sourceData.currEffective;
				if (sourceData && curData) {
					
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
				if (data == "404") {
					loadEventTypeCount();
					return;
				}
				var sourceData = eval(data);

				var map = {
					"事故" : 0,
					"施工类" : 0,
					"管制类" : 0,
					"路面" : 0,
					"其他" : 0,
					"流量" : 0
				};

				for (var i = 0; i < sourceData.length; i++) {
					map[sourceData[i].name] = sourceData[i].value;
				}
				var all = map["其他"]+map["事故"]+map["流量"]+map["管制类"]+map["施工类"]+map["路面"];
				$("#widgets #eventType #et2 #count").html("<div class='label0'>"+parseFloat(map["事故"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["事故"]+"</div>");
				$("#widgets #eventType #et5 #count").html("<div class='label0'>"+parseFloat(map["施工类"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["施工类"]+"</div>");
				$("#widgets #eventType #et4 #count").html("<div class='label0'>"+parseFloat(map["管制类"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["管制类"]+"</div>");
				$("#widgets #eventType #et6 #count").html("<div class='label0'>"+parseInt(map["路面"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["路面"]+"</div>");
				$("#widgets #eventType #et1 #count").html("<div class='label0'>"+parseFloat(map["流量"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["流量"]+"</div>");
				$("#widgets #eventType #et3 #count").html("<div class='label0'>"+parseFloat(map["其他"]/all*100).toFixed(2)+"%"+"</div>"+"<div class='label1'>"+map["其他"]+"</div>");
				drawEchart();
				function drawEchart(){
					var myChart = echarts.init(document.getElementById('rightEchart'));
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
					            data:[
					                {value:map["事故"], name:'事故',
					                	itemStyle: {
							                normal: {
							                    color: '#C93F3F'
							                }
						            	}
					                },
					                {value:map["施工类"], name:'施工类',
					                	itemStyle: {
							                normal: {
							                    color: '#BF721D'
							                }
						            	}
					                },
					                {value:map["管制类"], name:'管制类',
					                	itemStyle: {
							                normal: {
							                    color: '#2EA09D'
							                }
						            	}
					                },
					                {value:map["路面"], name:'路面',
					                	itemStyle: {
							                normal: {
							                    color: '#B7AB65'
							                }
						            	}
					                },
					                {value:map["流量"], name:'流量',
					                	itemStyle: {
							                normal: {
							                    color: '#1F87B5'
							                }
						            	}
					                },
					                {value:map["其他"], name:'其他',
					                	itemStyle: {
							                normal: {
							                    color: '#084c9f'
							                }
						            	}
					                }
					            ]
					        }
					    ]
			        };
			
			        // 使用刚指定的配置项和数据显示图表。
			        myChart.setOption(option);
			        $(".rightEchart").show();
				}
				
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
					var position = Cesium.Cartesian3.fromDegrees(parseFloat(cityInfo.lat),parseFloat(cityInfo.lng));
					var cityPinId = "cityPin"+i;
					var pic = drawPic(sourceData[i].value);
					var cityPin = viewer.entities.add({
						name : sourceData[i].name,
						position : position,
						id:cityPinId,
						billboard : {
//							image : pinBuilder.fromText(sourceData[i].value, Cesium.Color.fromCssColorString("#c93f3f"),
//									100).toDataURL(),
//				            rotation : Cesium.Math.PI_OVER_FOUR,
							horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
							image : pic,
							scale : 0.4,
							verticalOrigin : Cesium.VerticalOrigin.BOTTOM
						}
					});
					entityId.push(cityPinId);
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
		
		var loadEventCitys = function() {
			for(var i=0;i<countEntities.length;i++){
				viewer.entities.remove(countEntities[i]);
			}
			//console.log("loadEventCitysCount");
			
			eventCitysLoader = exporter.Server.countEventByCity(cur_cityCode, function(data) {
				//console.log(data);
				if (data == "404") {
					loadEventCitys();
					return;
				}
				//console.log("countEventByCity");
				var sourceData = eval(data);
				for(var i=0;i<sourceData.length;i++){
					var cityInfo = self.getInfoByCityCode(sourceData[i].code);
					var pinBuilder = new Cesium.PinBuilder();
					var position = Cesium.Cartesian3.fromDegrees(parseFloat(cityInfo.lat),parseFloat(cityInfo.lng));
					var cityPinId = "cityPin"+i;
					var pic = drawPic(sourceData[i].value);
					var cityPin = viewer.entities.add({
						name : sourceData[i].name,
						position : position,
						id:cityPinId,
						billboard : {
							horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
							image : pic,
							scale : 0.4,
							verticalOrigin : Cesium.VerticalOrigin.BOTTOM
						}
					});
					entityId.push(cityPinId);
					countEntities.push(cityPin);
				}
				
				if(self.active){
					
				}else{
					for(var i=0;i<countEntities.length;i++){
						viewer.entities.remove(countEntities[i]);
					}
				}  
				countEntities = [];
			});
		}
		function drawPic(text){
			var imgs = new Image();
			var canvas = document.getElementById('myCanvas');
			var img = document.getElementById("img");
			var ctx=canvas.getContext('2d');
			ctx.font="60px Arial";
			ctx.fillStyle="#fff";
			ctx.drawImage(img,0,0);
			ctx.fillText(text,23,62);
			imgs.src = canvas.toDataURL()
			return imgs;
		}

		var loadAllCountryEvents = function() {

			//console.log("loadAllCountryEvents");
			loadEventCitysCount();
		}
		var picUrl = {
				'1':'src/assets/images/dataSource/npt2.png',
				'2':'src/assets/images/dataSource/npt5.png',
				'8':'src/assets/images/dataSource/npt4.png',
				'3':'src/assets/images/dataSource/npt6.png',
				'5':'src/assets/images/dataSource/npt1.png',
				'6':'src/assets/images/dataSource/npt0.png'
		};
		
		var picUrlCamera = {
				'1':'src/assets/images/dataSource/nct2.png',
				'2':'src/assets/images/dataSource/nct5.png',
				'8':'src/assets/images/dataSource/nct4.png',
				'3':'src/assets/images/dataSource/nct6.png',
				'5':'src/assets/images/dataSource/nct1.png',
				'6':'src/assets/images/dataSource/nct0.png'
		};
		var eventFlagPic = {
				'1':'../../../../images/dataSource/pt2.png',
				'2':'../../../../images/dataSource/pt5.png',
				'8':'../../../../images/dataSource/pt4.png',
				'3':'../../../../images/dataSource/pt6.png',
				'5':'../../../../images/dataSource/pt1.png',
				'6':'../../../../images/dataSource/pt0.png'
		};
		var eventFlagPicCamera = {
				'1':'../../../../images/dataSource/ct2.png',
				'2':'../../../../images/dataSource/ct5.png',
				'8':'../../../../images/dataSource/ct4.png',
				'3':'../../../../images/dataSource/ct6.png',
				'5':'../../../../images/dataSource/ct1.png',
				'6':'../../../../images/dataSource/ct0.png'
		};
		var eventFlagColor = {
				'1':Cesium.Color.fromCssColorString('#e15049'),
				'2':Cesium.Color.fromCssColorString('#d69465'),
				'8':Cesium.Color.fromCssColorString('#3d93e9'),
				'3':Cesium.Color.fromCssColorString('#f5c13d'),
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
			var tmpLast = {};
			for(var obj in lastTimeEntites){
				var exist = false;
				for(var i=0;i<eventsData.length;i++){
					var eventObj = eventsData[i];
					if(eventObj.id == obj){
						exist = true;
						tmpLast[obj] = lastTimeEntites[obj];
						continue;
					}else{
						
					}
				}
				if(!exist){
					viewer.entities.remove(lastTimeEntites[obj]);
					eventMap[obj]=undefined;
					lastTimeEntites[obj]=undefined;  
				}
				
			}
			lastTimeEntites = tmpLast;
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
					
					if(!eventFlagPicCamera[eventObj.type] || !eventFlagPic[eventObj.type] || !eventFlagColor[eventObj.type]) {
						continue;
					}
					
					//console.log(eventObj.source);
					entitySources[eventObj.id] = eventObj.source;
					if(eventObj.type==null || eventObj.type=="") continue;
					var size = 30;
					var height = 1;
					var url;
					if(eventObj.pic){
						size = 40;
						height = 100;
//						url = Cesium.buildModuleUrl(eventFlagPicCamera[eventObj.type]);
						url = picUrlCamera[eventObj.type];
					}else{
//						url = Cesium.buildModuleUrl(eventFlagPic[eventObj.type]);
						url = picUrl[eventObj.type];
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
						var eventPinId = "eventPin"+i;
						var eventPin = viewer.entities.add({
								name : eventObj.id,
								id:eventPinId,
								position : Cesium.Cartesian3.fromDegrees(pos[0],pos[1],height),
								billboard : {
//									image : pinBuilder.fromUrl(url,color, size),picUrl
									image : url,
									scale : 0.3, // default: 1.0
									verticalOrigin : Cesium.VerticalOrigin.BOTTOM
								}
							});
						entityId.push(eventPinId);
						lastTimeEntites[eventObj.id] = eventPin;
						if(newEvent)tweenPin(eventPin);//新事件
						
						function tweenPin(pin)
						{
							var obj = {scale:0.3};
							TweenMax.to(obj,1,{scale:1,onUpdate:function(_pin){
								_pin.billboard.scale = obj.scale;
							},onUpdateParams:[pin],yoyo:true,repeat:1});
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
				destination : Cesium.Cartesian3.fromDegrees(parseFloat(position.lng)-0.001, parseFloat(position.lat)-0.001, 2000.0),
				complete:onComplete
			});
		}
		
		
		var addMouseHander = function() {
			
			//鼠标点击事件响应
			var selectPinHandler = new Cesium.ScreenSpaceEventHandler(
					viewer.scene.canvas);
			selectPinHandler.setInputAction(function(movement) {
				if(!self.active || cur_cityCode=="100000") return;
				removeLine();
				//console.log(movement.position);
				var pickedObjects = viewer.scene.drillPick(movement.position);
				for (var i = 0; i < pickedObjects.length; i++) {
	    			var pickedObject = pickedObjects[i];	    	
					if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
						var selectedPin = pickedObject.primitive;
	
						selectedPin.id.billboard.scale = 1;
						var timerPin;
						timerPin = setTimeout(function(){
							clearTimeout(timerPin);
							selectedPin.id.billboard.scale = 0.3;
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
									var lineEntityId = "lineEntityId"+i;
									var lineEntity = viewer.entities.add({
								           	name : sourceData.eventDesc,
								           	id:lineEntityId,
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
							        entityId.push(lineEntityId);
							        //lineEntities = [];
									lineEntities.push(lineEntity);
									
								}
								
							});
						})(eventId));
						return;
					}else{
						infoBoxController.close();
					}
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
			for (var i=0;i<entityId.length;i++) {
				viewer.entities.removeById(entityId[i])
			}
			entityId=[];
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
					htmlStr+="<div style='font-size:18px;border-top:1px #202020 solid;padding-top:10px;color:#fff;display:inline-block;'>"+info.eventDesc+"</div>";
					htmlStr+="<div style='font-size:18px;border-bottom:1px #202020 solid;padding-bottom:10px;color:#fff'>"+getTimeDesc(info.timePeriod)+"</div>";
					htmlStr+="<div style='font-size:18px;margin-bottom:10px;color:#fff'>"+getEventTypeName(info.eventType)+"</div>";
					htmlStr+="<div style='font-size:18px;margin-bottom:10px;color:#fff'>"+getEventSourceName(info)+"</div>";
					
					if(info.picture && info.picture!=""){
						htmlStr+="<div style='font-size:18px;'><img style='height:200px;width:auto;' src='"+info.picture+"'></div>";

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
				TweenLite.to(this.view,0.5,{left:500,ease:Expo.easeInOut});
			}
			
			this.close = function()
			{
				removeLine();
				flyToCurrentCity(function(){
//					console.log(city)
//					viewer.camera.flyTo({
//						destination : Cesium.Cartesian3.fromDegrees(city.lat, city.lng, 90000.0)
//					});	
				});
				
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
						strArr.push("");
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
						strArr.push("");
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