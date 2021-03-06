
define("PositionCarController",function(exporter){
	var PositionCarController = function(controller)
	{
		var viewer = controller.cesiumController.cesiumViewer;
	    var Floating2 = false;
	    var scene = viewer.scene;
	    var self = this;
	    
	    var isStart = false;
		var begin = 0;
		var colorMap = {};
		var sourceValue;
	    
	    var winWidth =  parseInt(document.body.clientWidth);
	    var winHeight = parseInt(document.body.clientHeight);
	    var staticColors = [
			"rgba(181,181,181,255)",
			"rgba(201,62,62,255)",
			"rgba(38,84,151,255)",
			"rgba(0,255,0,255)"
		];
	    viewer.screenSpaceEventHandler.setInputAction(function (movement) {
	    	if(!Floating2)return
	    	$.getJSON("http://tongji.amap.com/portal/diagram/fp!getTopDsGroupByCity.action?params.cityCodes="+cur_cityCode,function(data){
		    	sourceValue = data;
		    	for(x in data){
		    		$(".positionCar ul li").eq(parseInt(data[x].rank)-1).find("h3").html(data[x].ds_name);
		    		var color = staticColors[sourceValue[x].category/1000]
		    		$(".positionCar ul li").eq(parseInt(data[x].rank)-1).find("h2").css({"background":color});
		    	}
		    	
		    })
	    	clearTimeout(timer1);
	    	viewer.clock.multiplier = 4;
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
	    $("#nav ul li").eq(4).click(function(e){
//			if($("#nav ul li").eq(4).attr("class") == "selected")$("#nav ul li").eq(4).trigger("click");
//			$(this).toggleClass("selected");
			Floating2=!Floating2;
			if(!Floating2)self.floatCar2.clear();
		});
		this.floatCar2={};
		this.floatCar2.show=function(){
			self.floatCar2.clear();
			
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
       		getData(contrail,url);
			viewer.clock.shouldAnimate = true;
			
		}
		this.floatCar2.clear=function(){
			contrail.clear();
			clearTimeout(timer1);
			$(".positionCar").hide();
		}
		
		var staticColors1 = [
			[181,181,181,255],
			[201,62,62,255],
			[38,84,151,255],
			[0,255,0,255]
		];
		var sourceArrN=[];
		
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
	                for(x in sourceValue){
	                	if(data.source == x){
	                		color = sourceValue[x].category/1000;
	                	}
	                }
	                if (b == undefined) {
	                    b = {
	                    	pixelSize : 8,
				            color : [255, 255, 255, 255],
				            outline : true,
				       		outlineColor : staticColors1[color],
				       		outlineWidth : 2
	                    };
	                    colorMap[source] = b;
	                }
	                return b;
	            },
	        }
	    });
		
		
		
		function getData(contrail,url1) {
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
			        var timeRange = {
			            start: timestamp - 10 * 60 * 1000,
			            end: timestamp,
			        }
			        
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
			        $(".positionCar").show();
			        clearTimeout(timer1);
			        timer1 = setTimeout(function () {
			            self.floatCar2.show()
			        }, 1000*60*2);
			    }
		    });
		}
		function compare(property){
		    return function(a,b){
		        var value1 = a[property];
		        var value2 = b[property];
		        return value2 - value1;
		    }
		}
	}
	return PositionCarController;
})	