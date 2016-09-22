
define("CongestionController",function(exporter){
	var CongestionController = function(controller,eventArea)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var firstUrl = "https://tp-restapi.amap.com/gate?";
		var key = "&serviceKey=53F229EBD6394D42D5714FA621FB1584";
		var showType = 0;
		var entities = viewer.entities;
		var roadLink;
		var roadCar=[];
//		tapEvent();
		$("#nav ul li").eq(2).click(function(){
			for(var m=0;m<roadCar.length;m++){
				entities.remove(roadCar[m]);
			}
			if(roadLink){
				entities.remove(roadLink);
			}
			eventArea.trafficEvent(true);
			eventArea.Floatingcar(true);
			eventArea.FloatingcarTime(true);
			UnmommonNow(cur_cityCode);
			$(".tabLiList").fadeOut();
			if(showType == 0){
				$(".jamBk").toggle();
				$("#jam").fadeToggle();
			}else{
				$("#jam").fadeOut();
				$("#jam").fadeIn();
				$(".jamBk").show();
			}
			$("#nav ul li").eq(0).removeClass("selected");
			$("#nav ul li").eq(1).removeClass("selected");
			$("#nav ul li").eq(3).removeClass("selected");
			$("#nav ul li").eq(2).toggleClass("selected");
			$("#nav ul li").eq(4).removeClass("selected");
			showType = 0;
		});
		$("#nav ul li").eq(3).click(function(){
			for(var m=0;m<roadCar.length;m++){
				entities.remove(roadCar[m]);
			}
			if(roadLink){
				entities.remove(roadLink);
			}
			$(".jamBk").show();
			eventArea.trafficEvent(true);
			eventArea.Floatingcar(true);
			eventArea.FloatingcarTime(true);
			CommonNow(cur_cityCode);
			$(".tabLiList").fadeOut();
			if(showType == 1){
				$(".jamBk").toggle();
				$("#jam").fadeToggle();
			}else{
				$(".jamBk").show();
				$("#jam").fadeOut();
				$("#jam").fadeIn();
			}
			$("#nav ul li").eq(0).removeClass("selected");
			$("#nav ul li").eq(1).removeClass("selected");
			$("#nav ul li").eq(2).removeClass("selected");
			$("#nav ul li").eq(3).toggleClass("selected");
			$("#nav ul li").eq(4).removeClass("selected");
			showType = 1;
		})
		
		function CommonNow(citycode){
			var data = {"city":citycode,
						"orderType":"2",
						"isNormal ":"0"
						}
			getData("10001",JSON.stringify(data)).then(function(json){
				var index = creatDom(json);
				$(".tabList ul").eq(0).html(index);
				bindEvent()
			})
		}
		function UnmommonNow(citycode){
			var data = {"city":citycode,
						"orderType":"2",
						"isNormal ":"1"
						}
			getData("10001",JSON.stringify(data)).then(function(json){
				var index = creatDom(json);
				$(".tabList ul").eq(0).html(index);
				bindEvent()
			})
		}
	
		function creatDom(json){
			var index="";
			var dataInfo = json.data.rows;
			if(json.status.msg != "success"){
				index="数据加载错误，请重试"
			}else{
				for(var i=0;i<dataInfo.length;i++){
					var handleState="拥堵"
					if(dataInfo[i].handleState == 1){
						handleState="拥堵"
					}else if(dataInfo[i].handleState == 2){
						handleState="趋向严重"
					}else if(dataInfo[i].handleState == 3){
						handleState="趋向疏通"
					}
					index +="<li class="+dataInfo[i].eventId+"><h1>"+dataInfo[i].roadName+"</h1><h2>"+handleState+"</h2><h3>"+
					dataInfo[i].roadName+"</h3><div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon1.png'/>"+dataInfo[i].jamSpeed+"km/h</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon2.png'/>"+dataInfo[i].jamDist+"米</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon3.png'/>"+dataInfo[i].longTime+"min</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon4.png'/>"+dataInfo[i].insertTime+"</h4></div><h6>"+dataInfo[i].xy+"</h6></li>"
				}
			}

			return index;
		}
		
		function getData(sidCode,data){
			var code = "sid="+sidCode+"&resType=json&encode=utf-8&reqData="
			var urls = firstUrl+code+data+key;
			return $at.getJsonp(urls,function(data){
				return data;
			})
		}
		
		function MommonEvent(citycode,eventId,insertTime){
			var data = {"city":citycode,
						"eventId":eventId,
						"type":"1",
						"insertTime":insertTime
						}
			getData("10002",JSON.stringify(data)).then(function(json){
				var index = roadInfo(json);
				$(".tabLiList ul").eq(0).html(index);
				var linkId = drawCarPath(json.data.rows);
				var urls = "http://140.205.57.130/portal/pr/gps-service!getGpsInfo.action";
				var myDate = new Date();
				var year = myDate.getYear().toString()
				var time1 = "20"+year.substring(1,year.length);
				var time2 = parseInt(myDate.getMonth())+1;
				var time5 = parseInt(myDate.getMinutes())-15;
				if(time5<0){
					time5=time5+59
					var time4 = parseInt(myDate.getHours())-1;
				}else{
					var time4 = myDate.getHours()
				}
				time5%2==0?time5=time5:time5=time5-1;
				if(time4<0){time4=0};
				time2<10 ? time2 ="0" + time2:time2 =time2
				myDate.getDate()<10 ? time3 ="0" + myDate.getDate():time3 =myDate.getDate()
				time4<10 ? time4 ="0" + time4: time4 =time4
				time5<10 ? time5 ="0" + time5:time5 =time5
				var newTime = time1+""+time2+""+time3+""+time4+""+time5+"00";
				console.log(newTime)
				var datas = {
					"roadId":linkId,
					"time":newTime,
					"cityCode":citycode
				}
				parseCar(datas).then(function(json){
					var x = json.rows[0].gpsInfos[0].coord[0];
					var y = json.rows[0].gpsInfos[0].coord[1];
					viewer.camera.flyTo({
						destination : Cesium.Cartesian3.fromDegrees(x, y, 10000.0)
					});
					
					var start = Cesium.JulianDate.fromDate(new Date(2016, 9, 7, 9));
					var stop = Cesium.JulianDate.addSeconds(start, 300, new Cesium.JulianDate());
					
					viewer.clock.startTime = start.clone();
					viewer.clock.stopTime = stop.clone();
					viewer.clock.currentTime = start.clone();
					viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
					viewer.clock.multiplier = 1;
					viewer.clock.canAnimate  = true;
					viewer.clock.shouldAnimate = true;
					
					viewer.timeline.zoomTo(start, stop);
					for(var m=0;m<roadCar.length;m++){
						entities.remove(roadCar[m]);
					}
					roadCar=[];
					var jsonParse = new JsonParse(json);
					for(var i=0;i<jsonParse.length;i++){
						var moveCar = new MoveCar(jsonParse[i],start,stop);
					}
				});
			})
		}
		function JsonParse(json){
			var carArr = [];
			var self = this;
			self.SortByWeight = function(array, key) {
			    return array.sort(function(a, b) {
			        var x = a[key]; var y = b[key];
			        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
			    });
			}
			for(var i=0;i<json.rows.length;i++){
				var carData = [];
				var gpsArr = json.rows[i].gpsInfos;
				self.SortByWeight(gpsArr,"gpsTime")
				for(var m=0;m<gpsArr.length;m++){
					carData.push(gpsArr[m].coord);
				}
				carArr.push(carData);
			}
			
				
			return carArr;
		}
		function MoveCar(jsonParse,start,stop){
			var myPosition = [];
			var myTime = [];
			for(var i=0;i<jsonParse.length;i++){
				myPosition[i] = Cesium.Cartesian3.fromDegrees(jsonParse[jsonParse.length-i][0], jsonParse[jsonParse.length-i][1],10);
				myTime[i] = Cesium.JulianDate.addSeconds(start, i/jsonParse.length*300, new Cesium.JulianDate());
			}
			this.computeCirclularFlight = function() {
                var property = new Cesium.SampledPositionProperty();
                property.addSamples(myTime, myPosition);
                return property;
            }
			var Position = this.computeCirclularFlight();
			
			var car = viewer.entities.add({
	            availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
	                start : start,
	                stop : stop
	            })]),
	            position : Position,
	            point : {
		            color : Cesium.Color.WHITE, // default: WHITE
		            pixelSize : 10, // default: 1
		            outlineColor : Cesium.Color.BLUE, // default: BLACK
		            outlineWidth : 3, // default: 0
		            scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.4, 0.3, 0.2)
		        }
//	           	billboard :{
//		            image : 'src/assets/images/dataSource/car.png',
//		            sizeInMeters : true
//		        },
//	            path : {
//	                material:Cesium.Color.RED.withAlpha(0.1)
//	            }

	        }); 
	        roadCar.push(car);
		}
		
		function parseCar(datas){
			var urls = "http://140.205.57.130/portal/pr/gps-service!getGpsInfo.action";
//			var urls = "src/assets/data/roadCar.json"
			return $at.get(urls,datas,function(json){				
				return json;
			})
		}
		
		function drawCarPath(rows){
			var positions = "["+rows[maxLength()].xys.replace(/;/g,',')+"]";
			positions = JSON.parse(positions);
			if(roadLink){
				entities.remove(roadLink);
			}
			roadLink = entities.add({
		   		name:"roadLink",
	            polyline : {
			        positions : Cesium.Cartesian3.fromDegreesArray(positions),
			        width : 3,
			        material : Cesium.Color.RED.withAlpha(0.8)
//			        Cesium.Color.fromCssColorString('#0c6bad')
			    }
		    });
			
			function maxLength(){
				var max=0;
				for(var i=0;i<rows.length;i++){
					if(rows[max].length <rows[i].length){max=i}
				}
				return max;
			}
			return rows[maxLength()].linkId;
			
		}
		
		function roadInfo(json){
			var index="";
			var dataInfo = json.data.rows;
			if(json.status.msg != "success"){
				index="数据加载错误，请重试"
			}else{
				for(var i=0;i<dataInfo.length;i++){
					var handleState="拥堵"
					if(dataInfo[i].pubRunStatus == 1){
						handleState="拥堵"
					}else if(dataInfo[i].pubRunStatus == 2){
						handleState="趋向严重"
					}else if(dataInfo[i].pubRunStatus == 3){
						handleState="趋向疏通"
					}
					var roadType = "高速路"
					if(dataInfo[i].roadType == 0){
						roadType = "高速路"
					}else if(dataInfo[i].roadType == 1){
						roadType = "城市快速路"
					}else if(dataInfo[i].roadType == 2){
						roadType = "国道"
					}else if(dataInfo[i].roadType == 3){
						roadType = "主要道路"
					}else if(dataInfo[i].roadType == 4){
						roadType = "省道"
					}else if(dataInfo[i].roadType == 5){
						roadType = "次要道路"
					}else if(dataInfo[i].roadType == 6){
						roadType = "普通道路"
					}else if(dataInfo[i].roadType == 7){
						roadType = "县道"
					}else if(dataInfo[i].roadType == 8){
						roadType = "乡公路"
					}else if(dataInfo[i].roadType == 9){
						roadType = "县乡村内部道路"
					}
					index +="<li class="+dataInfo[i].linkId+"><h1>"+dataInfo[i].roadName+"</h1><h2>"+handleState+"</h2><h3>"+
					roadType+"</h3><div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon1.png'/>"+dataInfo[i].eventJamSpeed+"km/h</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon2.png'/>"+dataInfo[i].length+"</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon3.png'/>"+dataInfo[i].travelTime+"</h4></div>"+
					"<div class='roadInfo'><h4><img src='src/assets/images/dataSource/roadIcon4.png'/>"+dataInfo[i].createTime+"</h4></div></li>"
				}
			}

			return index;
		}
		
		function bindEvent(){
			$(".tabList li").click(function(){
				var num = $(".tabList li").index($(this));
				var citycode = cur_cityCode;
				var eventId = $(this).attr("class");
//				var xy = $(this).find("h6").text();
//				var x=xy.substring(0,xy.indexOf(","));
//				var y=xy.substring(xy.indexOf(",")+1,xy.length);
				var insertTime = $(this).find(".roadInfo h4").eq(3).text();
//				viewer.camera.flyTo({
//					destination : Cesium.Cartesian3.fromDegrees(x, y, 10000.0)
//				});
				
				MommonEvent(citycode,eventId,insertTime);
				$(".tabLiList").fadeOut();
				$(".tabLiList").fadeIn();
			})
		}

		function tapEvent(){
			
			var wrap = document.getElementById('jam');
			var windowWidth = wrap.clientWidth; //window 宽度;
	        var tabClick = wrap.querySelectorAll('.tabClick')[0];
	        var tabLi = tabClick.getElementsByTagName('li');
	        
	        var tabBox =  wrap.querySelectorAll('.tabBox')[0];
	        var tabList = tabBox.querySelectorAll('.tabList');
	        
	        var lineBorder = wrap.querySelectorAll('.lineBorder')[0];
	        var lineDiv = lineBorder.querySelectorAll('.lineDiv')[0];
	        
	        var tar = 0;
	        var endX = 0;
	        var dist = 0;
	        
	        tabBox.style.overflow='hidden';
	        tabBox.style.position='relative';
	        tabBox.style.width=windowWidth*tabList.length+"px";
	        
	        for(var i = 0 ;i<tabLi.length; i++ ){
	              tabList[i].style.width=windowWidth+"px";
	              tabList[i].style.float='left';
	              tabList[i].style.float='left';
	              tabList[i].style.padding='0';
	              tabList[i].style.margin='0';
	              tabList[i].style.verticalAlign='top';
	              tabList[i].style.display='table-cell';
	        }
	        
	        for(var i = 0 ;i<tabLi.length; i++ ){
	            tabLi[i].start = i;
	            tabLi[i].onclick = function(){
	                var star = this.start;
	                for(var i = 0 ;i<tabLi.length; i++ ){
	                    tabLi[i].className='';
	                };
	                tabLi[star].className='active';
	                init.lineAnme(lineDiv,windowWidth/tabLi.length*star)
	                init.translate(tabBox,windowWidth,star);
	                endX= -star*windowWidth;
	            }
	        }
	        
	        function OnTab(star){
	            if(star<0){
	                star=0;
	            }else if(star>=tabLi.length){
	                star=tabLi.length-1
	            }
	            for(var i = 0 ;i<tabLi.length; i++ ){
	                tabLi[i].className='';
	            };
	            
	             tabLi[star].className='active';
	            init.translate(tabBox,windowWidth,star);
	            endX= -star*windowWidth;
	        };
	        
	        tabBox.addEventListener('touchstart',chstart,false);
	        tabBox.addEventListener('touchmove',chmove,false);
	        tabBox.addEventListener('touchend',chend,false);
	        //按下
	        function chstart(ev){
	        	alert(111)
	            ev.preventDefault;
	            var touch = ev.touches[0];
	            tar=touch.pageX;
	            tabBox.style.webkitTransition='all 0s ease-in-out';
	            tabBox.style.transition='all 0s ease-in-out';
	        };
	        //滑动
	        function chmove(ev){
	            var stars = wrap.querySelector('.active').start;
	            ev.preventDefault;
	            var touch = ev.touches[0];
	            var distance = touch.pageX-tar;
	            dist = distance;
	            init.touchs(tabBox,windowWidth,tar,distance,endX);
	            init.lineAnme(lineDiv,-dist/tabLi.length-endX/4);
	        };
	        //离开
	        function chend(ev){
	            var str= tabBox.style.transform;
	            var strs = JSON.stringify(str.split(",",1));  
	            endX = Number(strs.substr(14,strs.length-18)); 
	            
	            if(endX>0){
	                init.back(tabBox,windowWidth,tar,0,0,0.3);
	                endX=0
	            }else if(endX<-windowWidth*tabList.length+windowWidth){
	                endX=-windowWidth*tabList.length+windowWidth
	                init.back(tabBox,windowWidth,tar,0,endX,0.3);
	            }else if(dist<-windowWidth/3){
	                 OnTab(tabClick.querySelector('.active').start+1);
	                 init.back(tabBox,windowWidth,tar,0,endX,0.3);
	            }else if(dist>windowWidth/3){
	                 OnTab(tabClick.querySelector('.active').start-1);
	            }else{
	                 OnTab(tabClick.querySelector('.active').start);
	            }
	            var stars = wrap.querySelector('.active').start;
	            init.lineAnme(lineDiv,stars*windowWidth/4);
	            
	        };
	        $("#jam").hide();
		};
		
	    var init={
	        translate:function(obj,windowWidth,star){
	            obj.style.webkitTransform='translate3d('+-star*windowWidth+'px,0,0)';
	            obj.style.transform='translate3d('+-star*windowWidth+',0,0)px';
	            obj.style.webkitTransition='all 0.3s ease-in-out';
	            obj.style.transition='all 0.3s ease-in-out';
	        },
	        touchs:function(obj,windowWidth,tar,distance,endX){
	            obj.style.webkitTransform='translate3d('+(distance+endX)+'px,0,0)';
	            obj.style.transform='translate3d('+(distance+endX)+',0,0)px';
	        },
	        lineAnme:function(obj,stance){
	            obj.style.webkitTransform='translate3d('+stance+'px,0,0)';
	            obj.style.transform='translate3d('+stance+'px,0,0)';
	            obj.style.webkitTransition='all 0.1s ease-in-out';
	            obj.style.transition='all 0.1s ease-in-out';
	        },
	        back:function(obj,windowWidth,tar,distance,endX,time){
	            obj.style.webkitTransform='translate3d('+(distance+endX)+'px,0,0)';
	            obj.style.transform='translate3d('+(distance+endX)+',0,0)px';
	            obj.style.webkitTransition='all '+time+'s ease-in-out';
	            obj.style.transition='all '+time+'s ease-in-out';
	        },
	    
		}
		
	}
	return CongestionController;
})