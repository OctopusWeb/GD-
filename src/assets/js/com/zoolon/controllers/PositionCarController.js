
define("PositionCarController",function(exporter){
	var PositionCarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var scene = viewer.scene;
		var positonArr = [];
		var start = Cesium.JulianDate.fromDate(new Date(2015, 12, 16, 16));
	    var stop = Cesium.JulianDate.addSeconds(start, 2000, new Cesium.JulianDate());
	    var Floating2 = false;
	    viewer.clock.startTime = Cesium.JulianDate.addSeconds(start, 1, new Cesium.JulianDate());
	    viewer.clock.stopTime = Cesium.JulianDate.addSeconds(start, 1000, new Cesium.JulianDate());
	    viewer.clock.currentTime = start.clone();
	    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; 
	    viewer.clock.multiplier = 10;
	    var m=0;
	    var self = this;
	    
	    var winWidth =  parseInt(document.body.clientWidth);
	    var winHeight = parseInt(document.body.clientHeight);
	    
	    viewer.screenSpaceEventHandler.setInputAction(function (movement) {
	    	if(!Floating2)return
	    	var cartesian0 = viewer.camera.pickEllipsoid(movement.position);
	        if (cartesian0) {
	            var cartographic0 = Cesium.Cartographic.fromCartesian(cartesian0);
	            var longitudeString0 = Cesium.Math.toDegrees(cartographic0.longitude);
	            var latitudeString0 = Cesium.Math.toDegrees(cartographic0.latitude);
	        };
	        viewer.camera.flyTo({
				destination:Cesium.Cartesian3.fromDegrees(longitudeString0, latitudeString0, 2000.0),
			    complete:function(){self.floatCar2.show()}
			});
	    	
	    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	    $("#nav ul li").eq(5).click(function(e){
			e.stopPropagation();
			$(this).toggleClass("selected");
			Floating2=!Floating2;
			if(!Floating2)self.floatCar2.clear();
		});
		this.floatCar2={};
		this.floatCar2.show=function(){
			$(viewer.animation.container).show();
			$(viewer.timeline.container).show();
			var pos = new Cesium.Cartesian2(parseInt(winWidth/4), parseInt(winHeight/4));
			var cartesian = viewer.camera.pickEllipsoid(pos, scene.globe.ellipsoid);
			if (cartesian) {
	            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
	            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
	            var latitude = Cesium.Math.toDegrees(cartographic.latitude);

	        }
			var pos1 = new Cesium.Cartesian2(parseInt(winWidth/4*3), parseInt(winHeight/4*3));
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
			var hours = nowDate.getHours()-1;
			var minutes = nowDate.getMinutes();
			minutes>9?minutes = minutes :minutes = "0"+minutes;
			if(minutes<16){
				minutes="59";
				hours=hours-1;
				var num=5500;
			}else{
				var num=1500;
			}
			hours>9?hours = hours :hours = "0"+hours;
			var time2 = nowDate.getFullYear()+""+month+day+hours+minutes+"00";
			var time1 = parseInt(time2)-num;
			firstPath = time1+"";
			firstPath = firstPath.substr(8,firstPath.length)
			
			add(longitude,longitude1,latitude,latitude1,time1,time2,1000);
		}
		this.floatCar2.clear=function(){
			$(viewer.animation.container).hide();
			$(viewer.timeline.container).hide();
			for(var i=0;i<positonArr.length;i++){
				entities.removeById(positonArr[i].id);
			}
			positonArr=[];
		}
		
		
	    
	    function add(x1,x2,y1,y2,time1,time2,num){
			 $.ajax({
	             type: "get",
	             async: true,
	             url: "http://dipper-fp.amap.com/fp/getmeshfp?minx="+x1+"&miny="+y2+"&maxx="+x2+"&maxy="+y1+"&starttime="+time1+"&endtime="+time2+"&limit="+num,
	             dataType: "jsonp",
	             jsonp: "callback",
	             success: function(json){
	                 for(var i=0;i<json.length;i++){
	                 	if(json[i].split(",")[1] >= parseInt(firstPath)){
	                 		console.log(json[i])
//	                 		demo(json[i].split(",")[4],json[i].split(",")[5]);
	                 		getById(json[i].split(",")[3],json[i].split(",")[2],x1,x2,y1,y2,time1,time2,num)
	                 	}
	                 	
//	                 	getById(json[i].split(",")[3],json[i].split(",")[2],x1,x2,y1,y2,time1,time2,num)
	                 }
	             },
	             error: function(){
	                 console.log('fail');
	             }
	        });
		}
	    
	    function demo(x,y){
	    	viewer.entities.add({
	            position : Cesium.Cartesian3.fromDegrees(x,y),
	            point : {
		            pixelSize : 5,
		            color : Cesium.Color.RED
		        }
	        }); 
	    }
	    
		function getById(id,dscode,x1,x2,y1,y2,time1,time2,num){
			console.log("http://dipper-fp.amap.com/fp/getuserfp?dscode="+dscode+"&userid="+id+"&starttime="+time1+"&endtime="+time2)
			$.ajax({
	             type: "get",
	             async: true,
	             url: "http://dipper-fp.amap.com/fp/getuserfp?dscode="+dscode+"&userid="+id+"&starttime="+time1+"&endtime="+time2,
	             dataType: "jsonp",
	             jsonp: "callback",
	             success: function(data){
	             	 var path=[];
	             	 if(data.length == 0)return
	                 for (var i=0;i<data.length;i++) {
						var positionArr=[];
						
						var la=parseFloat(data[i].split(",")[4]);
						var ln=parseFloat(data[i].split(",")[5]);
						var time = parseInt(data[i].split(",")[1]);
//						if(la>=x1&&la<=x2){
							positionArr.push(la,ln,time);
							path.push(positionArr);	
//						}				
					}
	              
//					path.sort(compare(2))
					Path(path);
	             },
	             error: function(err){
	             	console.log(JSON.stringify(err))
	             }
	         });
		}
		
		
		function Path(paths){
			if(paths.length ==0)return
				var myPosition = [];
				var myTime = [];
//				var firstPath = paths[0][2];
				for(var i=0;i<paths.length;i++){
					var la = parseFloat(paths[i][0]);
					var ln = parseFloat(paths[i][1]);
					var time = parseInt(paths[i][2])-firstPath;
						myPosition[i] = Cesium.Cartesian3.fromDegrees(la,ln);
						myTime[i] = Cesium.JulianDate.addSeconds(start,i/20, new Cesium.JulianDate());
				}
				function computeCirclularFlight() {
                    var property = new Cesium.SampledPositionProperty();
                    property.addSamples(myTime, myPosition);
                    return property;
                }
				
				pathMethod(computeCirclularFlight());
				
				function pathMethod(myPosition){
					var positon = viewer.entities.add({
			            availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
			                start : start,
			                stop : stop
			            })]),
			            position : myPosition,
			            point : {
				            pixelSize : 10,
				            color : Cesium.Color.WHITE
				        }
			        }); 
			        positonArr.push(positon);
				}
			}
		
		function compare(property){
		    return function(a,b){
		        var value1 = a[property];
		        var value2 = b[property];
		        return value1 - value2;
		    }
		}
	}
	return PositionCarController;
})	