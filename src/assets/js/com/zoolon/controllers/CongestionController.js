
define("CongestionController",function(exporter){
	var CongestionController = function(controller,eventArea)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var scene = viewer.scene;
		var firstUrl = "https://tp-restapi.amap.com/gate?";
		var key = "&serviceKey=53F229EBD6394D42D5714FA621FB1584";
		var showType = 0;
		var entities = viewer.entities;
		var isStart = false;
		var begin = 0;
		var roadLink;
		var roadCar=[];
		var colorMap = {};
		var winWidth =  parseInt(document.body.clientWidth);
	    var winHeight = parseInt(document.body.clientHeight);
//		tapEvent();
		$("#nav ul li").eq(2).on("click",function(){
			contrail.clear();
			if(roadLink){
				entities.remove(roadLink);
			}
			eventArea.trafficEvent.clear();
			eventArea.Floatingcar.clear();
			eventArea.FloatingcarTime.clear();
			CommonNow(cur_cityCode);
			$(".tabTitle").html("异常拥堵");
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
			contrail.clear();
			if(roadLink){
				entities.remove(roadLink);
			}
			$(".jamBk").show();
			eventArea.trafficEvent.clear();
			eventArea.Floatingcar.clear();
			eventArea.FloatingcarTime.clear();
			$(".tabTitle").html("常规拥堵");
			UnmommonNow(cur_cityCode);
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
						"isNormal":"0"
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
						"isNormal":"1"
						}
			getData("10001",JSON.stringify(data)).then(function(json){
				var index = creatDom(json,"road");
				var indexTime = creatDom(json,"time");
				$(".tabList").eq(0).find("ul").html(index);
				$(".tabList").eq(1).find("ul").html(indexTime);
				bindEvent()
			})
		}
	
		function creatDom(json,type){
			var dataInfo = json.data.rows;
			if(type == "time"){
				SortByWeight(dataInfo,"longTime")
			}
			var index="";
			
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
		function SortByWeight(array, key) {
		    return array.sort(function(a, b) {
		        var x = a[key]; var y = b[key];
		        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
		    });
		}
		
		function getData(sidCode,data){
			var code = "sid="+sidCode+"&resType=json&encode=utf-8&reqData="
			var urls = firstUrl+code+data+key;
			return $at.getJsonp(urls,function(data){
				return data;
			})
		}
		var contrail = new Contrail(viewer, {

	        timeline: {
	            speed: 4,
	        },
	        runner: {
	            autoHide: true,
	            show: false,
	            style: function (data) {
	                var source = data.source;
	                var b = colorMap[source];
	                if (b == undefined) {
	                    b = {
	                    	pixelSize : 5,
				            color : [255, 255, 255, 255],
				            outline : true,
				       		outlineColor : [181,181,181,255],
				       		outlineWidth : 2
	                    };
	                    colorMap[source] = b;
	                }
	                return b;
	            },
	        }
	    });
		
		function MommonEvent(citycode,eventId,insertTime){
			var data = {"city":citycode,
						"eventId":eventId,
						"type":"1",
						"insertTime":insertTime
						}
			
			getData("10002",JSON.stringify(data)).then(function(json){
				var index = roadInfo(json);
				$(".tabLiList ul").eq(0).html(index);
				drawCarPath(json.data.rows);
			})
		}
		
		function getData1(contrail,url1) {
//	        url: "http://tongji.amap.com/dipper-fp-srv/fp/getmeshuserfp?minx="+x1+"&miny="+y2+"&maxx="+x2+"&maxy="+y1+"&starttime="+time1+"&endtime="+time2,
		    sourceArrN=[];
		    $.ajax({
	             type: "get",
	             async: true,
	             url: url1,
	             dataType: "jsonp",
	             jsonp: "callback",
	             success: function(text){
			        var timestamp = Contrail.Tools.timestamp();
			        //    timestamp = 1481014104 * 1000;
//			        var timeRange = {
//			            start: timestamp - 5 * 60 * 1000,
//			            end: timestamp,
//			        }
			        
			        contrail.start();
			    	isStart = true;
			        timeRange = undefined;
			        var dataset = new Contrail.DataSet(timestamp, timeRange);

			        for (var key in text) {
			            var ps = text[key];
			            for (var d in ps) {
			                var pp = ps[d];
			                for (var i = 0; i < pp.length; i++) {
			                    var pData = pp[i].split(",");
			
			                    var time = Contrail.Tools.stringToTimestamp(pData[0]);
			                    dataset.addTick(d, pData[2], pData[1], time, {
			                        source: key,
			                    })
			                }
			            }
			        }
			
			
			        dataset.build(function () {
			            contrail.addDataSet(dataset);
			            if (isStart == false) {
		                    contrail.start();
		                    isStart = true;
			            }
			            trace("done!");
			        })
			        
			    }
		    });
		}
		function floatCarshow(){
			contrail.clear();
			
			var pos = new Cesium.Cartesian2(-100, -100);
			var cartesian = viewer.camera.pickEllipsoid(pos, scene.globe.ellipsoid);
			if (cartesian) {
	            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
	            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
	            var latitude = Cesium.Math.toDegrees(cartographic.latitude);

	        }
			var pos1 = new Cesium.Cartesian2(parseInt(winWidth)+100, parseInt(winHeight)+100);
			var cartesian1 = viewer.camera.pickEllipsoid(pos1, scene.globe.ellipsoid);
			if (cartesian1) {
	            var cartographic1 = Cesium.Cartographic.fromCartesian(cartesian1);
	            var longitude1 = Cesium.Math.toDegrees(cartographic1.longitude);
	            var latitude1 = Cesium.Math.toDegrees(cartographic1.latitude);
	        }
			var nowDate = new Date();
			var month = nowDate.getMonth()+1;
			month>9?month=month:month="0"+month;
			var day=nowDate.getDate();
			day>9?day=day : day = "0"+day;
			var hours = nowDate.getHours();
			var minutes = nowDate.getMinutes();
			
			if(minutes<16){
				minutes="59";
				hours=hours-1;
				var num=1000;
			}else{
				var num=1000;
			}
			hours>9?hours = hours :hours = "0"+hours;
			var time2 = nowDate.getFullYear()+""+month+day+hours+minutes+"00";
			var time1 = parseInt(time2)-num;			
			
			var url = "http://140.205.244.212/fp/getmeshuserfp?minx="+longitude+"&miny="+latitude1+"&maxx="+longitude1+"&maxy="+latitude+"&starttime="+time1+"&endtime="+time2
			begin = Contrail.Tools.timestamp();
       		getData1(contrail,url);
			viewer.clock.shouldAnimate = true;
			
		}

		function drawCarPath(rows){
			var positions = "["+rows[maxLength()].xys.replace(/;/g,',')+"]";
			var center = rows[maxLength()].xy.split(",")
			viewer.camera.flyTo({
				destination : Cesium.Cartesian3.fromDegrees(parseFloat(center[0])-0.001, parseFloat(center[1])-0.001, 2000.0),
				complete:function(){floatCarshow()}
			});
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
				$(this).siblings().css({"background":"none"})
				$(this).css({"background":"rgba(0,0,0,0.4)"})
				var insertTime = $(this).find(".roadInfo h4").eq(3).text();
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