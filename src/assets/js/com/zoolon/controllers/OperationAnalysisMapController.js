/**
 * 运营分析地图控制器
 */
define("OperationAnalysisMapController",function(exporter){
	var OperationAnalysisMapController = function()
	{
		var self = this;
		var option = {
			animation:false,
			timeline:false,
			baseLayerPicker:false,
			navigationHelpButton:false,
			homeButton:false,
			fullscreenButton:false,
			geocoder:false,
			infoBox:false,
			sceneModePicker:false,
			sceneMode:Cesium.SceneMode.COLUMBUS_VIEW
		};
		if(!exporter.Config.debugMode)
		{
			option.imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
		        url : 'http://30.28.6.130:8888/png?x={TileCol}&y={TileRow}&z={TileMatrix}',
		        layer : 'USGSShadedReliefOnly',
		        style : 'default',
		        format : 'image/jpeg',
		        tileMatrixSetID : 'default028mm',
		        maximumLevel: 19,
		        credit : new Cesium.Credit('U. S. Geological Survey')
		    });
		}
		var viewer = new Cesium.Viewer("cesiumContainer",option);
		
		//隐藏cesium的logo
		$(".cesium-viewer-bottom").hide();
		
		viewer.camera.position = new Cesium.Cartesian3(11774625.73689001,-1114014.9206093757,4616702.508886645);
	    viewer.camera.direction = new Cesium.Cartesian3(0,0.7071067811865476,-0.7071067811865476);
	    var parser;
	    loadThenParseCityInfo(function(){
	    	if(self.initComplete!=undefined)self.initComplete();
	    });
	    
	    //侦听柱子的鼠标事件
	    var overBar;
		var selectedBar;
	    var highlightBarHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		highlightBarHandler.setInputAction(
			function (movement)
			{
				
				if(overBar!=undefined && overBar!==selectedBar)overBar.material.uniforms.outlineWidth = 0;
				var pickedObject = viewer.scene.pick(movement.endPosition);
				if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive))
				{
					//console.log("move");
					overBar = pickedObject.primitive;
					if(overBar!==selectedBar)
					{
						overBar.material.uniforms.outlineWidth = 5;
            			overBar.material.uniforms.outlineColor = Cesium.Color.fromCssColorString("#ffff00");
					}
				}
				else
				{
					overBar = undefined;
				}
			},
			Cesium.ScreenSpaceEventType.MOUSE_MOVE
		);
		
		var selectBarHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		selectBarHandler.setInputAction(
			function (movement) {
				//console.log("click");
				if(selectedBar!=undefined)
				{
					selectedBar.material.uniforms.outlineWidth = 0;
				}
				var pickedObject = viewer.scene.pick(movement.position);
				if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive))
				{
					selectedBar = pickedObject.primitive;
					selectedBar.material.uniforms.outlineWidth = 5;
            		selectedBar.material.uniforms.outlineColor = Cesium.Color.fromCssColorString("#0000ff");
            		infoBoxController.open();
				}
				else
				{
					selectedBar = undefined;
					infoBoxController.close();
				}
				self.updateInfo();
			},
			Cesium.ScreenSpaceEventType.LEFT_CLICK
		);
	    
	    var polylines;
	    this.setSource = function(ds)
	    {
	    	infoBoxController.close();
	    	overBar = undefined;
	    	selectedBar = undefined;
	    	this.updateInfo();
	    	
	    	this.ds = ds;
	    	var primitives = viewer.scene.primitives;
	    	primitives.removeAll();
	    	polylines = createPolyLines();
	    	this.update(0);
	    	
	    	function createPolyLines()
	    	{
	    		var arr = [];
	    		var polylineCollection = new Cesium.PolylineCollection();
	    		for(var i=0;i<ds.list.length;i++)
	    		{
	    			var polyline = polylineCollection.add();
		            polyline.width = 20;
		            polyline.material = Cesium.Material.fromType('PolylineOutline');
            		polyline.material.uniforms.outlineWidth = 0;
            		polyline.material.uniforms.color = new Cesium.Color.fromRandom({alpha:1})

		            arr.push(polyline);
	    		}
	    		primitives.add(polylineCollection);
	    		return arr;
	    	}
	    }
	    
	    var infoBoxController = new InfoBoxController($("#infoBox"));
	    this.update = function(progress)
	    {
	    	var s = 100/12;
	    	var idx = Math.floor(progress/s);
	    	var per = (progress - idx*s)/s;
	    	var ellipsoid = viewer.scene.globe.ellipsoid;
    		for (var i=0; i<polylines.length; i++)
    		{
	            var polyline = polylines[i];
				var info = parser.getInfoByCityCode(this.ds.list[i].citycode);
	    		var time = this.ds.times[idx];
	    		var th0 = this.ds.json[time][info.citycode].ratio;
	    		//下一个高度
	    		var nextTime = (idx<this.ds.times.length-1)?this.ds.times[idx+1]:time;
	    		var th1 = this.ds.json[nextTime][info.citycode].ratio;
	    		var th = th0+(th1-th0)*per;
	    		var max = this.ds.maxValue;
	    		polyline.positions = ellipsoid.cartographicArrayToCartesianArray([
	                Cesium.Cartographic.fromDegrees(info.lat,info.lng, 0),
	                Cesium.Cartographic.fromDegrees(info.lat,info.lng, 1500000*th/max)
	            ]);
	            polyline.info = info;
	            polyline.info.ratio = th;
	            polyline.info.tb = this.ds.json[time][info.citycode].tb;
	            polyline.info.hb = this.ds.json[time][info.citycode].hb;
	        }
    		this.updateInfo();
	    }
	    
	    this.updateInfo = function()
	    {
    		infoBoxController.updateInfo(selectedBar==undefined?undefined:selectedBar.info);
	    }
	   
	   //加载后解析城市数据
	   function loadThenParseCityInfo(onComplete)
	   {
	   		$.get("src/assets/data/city_20150611.txt",function(data){
	   			parser = new CityDataParser(data);
	   			onComplete();
	   		});
	   }
	   
	   function CityDataParser(data)
	   {
	   		var rows = data.split("\r\n");
	   		//移除前2行
	   		rows.shift();
	   		rows.shift();
	   		this.dic = {};
	   		for(var i=0;i<rows.length;i++)
	   		{
	   			var row = rows[i];
	   			var arr = row.split(",");
	   			this.dic[arr[0]] = arr;
	   		}
	   		
	   		this.getInfoByCityCode = function(cityCode)
	   		{
	   			var arr = this.dic[cityCode];
	   			return {
	   				citycode:arr[0],
	   				citycodeOfugc:arr[1],
	   				type:arr[2],
	   				lat:arr[3]/3600000,
	   				lng:arr[4]/3600000,
	   				name:arr[5]
	   			};
	   		}
	   }
	}
	return OperationAnalysisMapController;
	
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
			title.text(info!=undefined?info.name:"");
			if(info!=undefined)
			{
				var htmlStr = "";
				htmlStr+="<div style='font-size:20px;'>同比去年:"+info.tb+"</div>";
				htmlStr+="<div style='font-size:20px;'>环比上月:"+info.hb+"</div>";
				htmlStr+="<div style='font-size:20px;'>增长率    :"+Math.round(info.ratio*100)/100+"</div>";
				//htmlStr+="<div>citycode:"+info.citycode+"</div>";
				//htmlStr+="<div>type:"+info.type+"</div>";
				//htmlStr+="<div>lat:"+info.lat+"</div>";
				//htmlStr+="<div>lng:"+info.lng+"</div>";
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
			TweenLite.to(this.view,0.5,{left:1610,ease:Expo.easeInOut});
		}
		
		this.close = function()
		{
			this.view.css("display","none");
			exporter.mouseChildren(this.view,false);
			TweenLite.to(this.view,0.5,{left:1920,ease:Expo.easeInOut});
		}
	}
});
