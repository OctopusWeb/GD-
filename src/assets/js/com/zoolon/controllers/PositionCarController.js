
define("PositionCarController",function(exporter){
	var PositionCarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
		var entities = viewer.entities;
		var scene = viewer.scene;
		var positonArr = [];
		var start = Cesium.JulianDate.fromDate(new Date(2015, 12, 16, 16));
	    var stop = Cesium.JulianDate.addSeconds(start, 200, new Cesium.JulianDate());
	    var Floating2 = false;
	    viewer.clock.startTime = Cesium.JulianDate.addSeconds(start, 1, new Cesium.JulianDate());
	    viewer.clock.stopTime = stop.clone();
	    viewer.clock.currentTime = start.clone();
	    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; 
	    viewer.clock.multiplier = 1;
	    
	    $("#nav ul li").eq(5).click(function(e){
			e.stopPropagation();
			$(this).toggleClass("selected");
			Floating2=!Floating2;
			if(Floating2){
				var pos = new Cesium.Cartesian2(0, 0);
				var cartesian = viewer.camera.pickEllipsoid(pos, scene.globe.ellipsoid);
				if (cartesian) {
		            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
		            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		            var latitude = Cesium.Math.toDegrees(cartographic.latitude);

		        }
				var pos1 = new Cesium.Cartesian2(1920, 1080);
				var cartesian1 = viewer.camera.pickEllipsoid(pos1, scene.globe.ellipsoid);
				if (cartesian1) {
		            var cartographic1 = Cesium.Cartographic.fromCartesian(cartesian);
		            var longitude1 = Cesium.Math.toDegrees(cartographic1.longitude);
		            var latitude1 = Cesium.Math.toDegrees(cartographic1.latitude);
		        }
				var nowDate = new Date();
				var month = nowDate.getMonth()+1;
				month>9?month=month:month="0"+month;
				var day=nowDate.getDate();
				day>9?day=day : day = "0"+day;
				var hours = nowDate.getHours();
				hours>9?hours = hours :hours = "0"+hours;
				var minutes = nowDate.getMinutes();
				minutes>9?minutes = minutes :minutes = "0"+minutes;
				minutes>50?minutes=50:minutes=minutes;
				var time1 = nowDate.getFullYear()+""+month+day+hours+minutes+"00";
				var time2 = parseInt(time1)+1000;
				add(longitude,longitude1,latitude,latitude1,time1,time2,1000);
			}else{
				for(var i=0;i<positonArr.length;i++){
					entities.removeById(positonArr[i].id);
				}
				positonArr=[];
			}
		});
	    
	    function add(x1,x2,y1,y2,time1,time2,num){
	    	console.log("http://dipper-fp.amap.com/fp/getmeshfp?minx="+x1+"&miny="+x2+"&maxx="+y1+"&maxy="+y2+"&starttime="+time1+"&endtime="+time1+"&limit="+num)
			 $.ajax({
	             type: "get",
	             async: false,
	             url: "http://dipper-fp.amap.com/fp/getmeshfp?minx="+x1+"&miny="+x2+"&maxx="+y1+"&maxy="+y2+"&starttime="+time1+"&endtime="+time1+"&limit="+num,
	             dataType: "jsonp",
	             jsonp: "callback",
	             success: function(json){
	                 for(var i=0;i<json.length;i++){
	                 	getById(json[i].split(",")[3],json[i].split(",")[2],x1,x2,y1,y2,time1,time2,num)
	                 }
	             },
	             error: function(){
	                 console.log('fail');
	             }
	        });
		}
		function getById(id,dscode,x1,x2,y1,y2,time1,time2,num){
			$.ajax({
	             type: "get",
	             async: false,
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
						if(la>=x1 && la<=x2 && ln>=y1 && ln<=y2){
							positionArr.push(la,ln,time);
							path.push(positionArr);
						}
						
					}
//						path.sort(compare(2))
					Path(path);
	             },
	             error: function(err){
	             	console.log(JSON.stringify(err))
	             }
	         });
		}
		
		
		function Path(paths){
			var myPosition = [];
			var myTime = [];
			for(var i=0;i<paths.length;i++){
				var la = parseFloat(paths[i][0]);
				var ln = parseFloat(paths[i][1]);
				var time = parseInt(paths[i][2])-151233;
					myPosition[i] = Cesium.Cartesian3.fromDegrees(la,ln);
					myTime[i] = Cesium.JulianDate.addSeconds(start,time, new Cesium.JulianDate());
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
			            pixelSize : 5,
			            color : Cesium.Color.RED
			        },
		            path : {
		                material:Cesium.Color.BLUE.withAlpha(0.01),
		                width:2
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