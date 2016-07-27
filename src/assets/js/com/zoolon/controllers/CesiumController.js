
define("CesiumController",function(exporter){
	var CesiumController = function(divId)
	{
		var option = {
			baseLayerPicker:false,
			navigationHelpButton:false,
			homeButton:false,
			fullscreenButton:false,
			geocoder:false,
			infoBox:false,
			sceneModePicker:false,
			sceneMode:Cesium.SceneMode.COLUMBUS_VIEW
		};
		Cesium.BingMapsApi.defaultKey = "AknGwyGtxa9zlcMazOG8GVPwpFATmyYf5GQOSwOMqTd-JTKe8h4Qwdu0WJRgQvfi";
//		if(!exporter.Config.debugMode)
//		{
			option.imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
//		        url : 'http://30.28.6.130:8888/png?x={TileCol}&y={TileRow}&z={TileMatrix}',
		        url : 'http://192.168.1.254:8080/png?x={TileCol}&y={TileRow}&z={TileMatrix}',
		        layer : 'USGSShadedReliefOnly',
		        style : 'default',
		        format : 'image/jpeg',
		        tileMatrixSetID : 'default028mm',
		        maximumLevel: 19,
		        credit : new Cesium.Credit('U. S. Geological Survey')
		    });
//		}
		var viewer = new Cesium.Viewer(divId,option);
		this.cesiumViewer = viewer;
		var DataType = {
			realTime:0,
			snapshot:1,
			history:2
		};
		
		//隐藏cesium的logo
		$(".cesium-viewer-bottom").hide();
		
		//加载区域轮廓
		var promise = Cesium.GeoJsonDataSource.load('src/assets/data/地市级行政区划抽稀后.json');
		var self = this;
		var areaSource;
		promise.then(function(dataSource){
			areaSource = dataSource;
			self.setAreaVisible(false);
			viewer.dataSources.add(dataSource);
		}).otherwise(function(error){
			window.alert(error);
		});
		
		this.dataType = DataType.snapshot;
		this.cityCode;
		this.dsCodes;
		
		function init()
		{
			flyToViewAll(0);
		}
		
		this.loadDataSource = function(cityCode,dsCodes)
		{
			this.cityCode = cityCode;
			this.dsCodes = dsCodes;
			this.clear();
			flyToCurrentCity(function(){
				switch(self.dataType)
				{
					case DataType.realTime:
					showRealTime();
					break;
					case DataType.snapshot:
					showSnapshot();
					break;
					case DataType.history:
					showHistory();
					break;
				}
			});
		}
		
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
			var city = self.getInfoByCityCode(self.cityCode);
			if(city == undefined)
			{
				onComplete();
			}
			else
			{
				$("#widgets #city").text(city.name);
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
		
		var customDataSource,dataLoader,timer;
		//显示实时数据
		function showRealTime()
		{
			$(viewer.animation.container).show();
			$(viewer.timeline.container).show();
			loadRealTimeData();
		}
		
		function loadRealTimeData()
		{
			if(self.cityCode == "100000")return;//全国时不请求数据
			dataLoader = exporter.Server.getTrafficFpData(self.cityCode,self.dsCodes,undefined,function(data){
				if(data.data == "404")
				{
					loadRealTimeData();
					return;
				}
				if(customDataSource!=undefined)customDataSource.destroy();
				customDataSource = new CustomDataSource(data);
				viewer.dataSources.add(customDataSource.czmlDataSource);
				viewer.clock.multiplier = 30;
				viewer.clock.shouldAnimate = true;
				clearTimeout(timer);
				timer = setTimeout(loadRealTimeData,1000*60*5);
			});
		}
		
		//显示快照模式
		function showSnapshot()
		{
			$(viewer.animation.container).hide();
			$(viewer.timeline.container).hide();
			SnapshotDataSource.untoggledSources = [];//清除未选中记忆
			loadSnapshotData();
		}
		
		function loadSnapshotData()
		{
			if(self.cityCode == "100000")return;//全国时不请求数据
			dataLoader = exporter.Server.getTrafficFpData(self.cityCode,self.dsCodes,2,function(data){
				if(data.data == "404")
				{
					loadSnapshotData();
					return;
				}
				if(customDataSource!=undefined)customDataSource.destroy();
				customDataSource = new SnapshotDataSource(data);
				clearTimeout(timer);
				timer = setTimeout(loadSnapshotData,1000*30);
			});
		}
		
		//显示历史数据
		function showHistory()
		{
			$(viewer.animation.container).show();
			$(viewer.timeline.container).show();
			if(self.cityCode == "100000")return;//全国时不请求数据
			dataLoader = exporter.Server.getHistoryTrafficFpData(self.cityCode,function(data){
				if(data.data == "404")
				{
					showHistory();
					return;
				}
				customDataSource = new CustomDataSource(data);
				viewer.dataSources.add(customDataSource.czmlDataSource);
				viewer.clock.multiplier = 1300;
				viewer.clock.shouldAnimate = true;
			});
		}
		
		this.clear=function()
		{
			if(timer!=undefined)
			{
				clearTimeout(timer);
				timer = undefined;
			}
			viewer.clock.shouldAnimate = false;
			if(dataLoader!=undefined)dataLoader.abort();
			if(customDataSource!=undefined)
			{
				customDataSource.destroy();
				customDataSource = undefined;
			}
			exporter.DebugTool.clear();
			$("#sourceColors").hide();
			
			isDataSourceListReady = false;
			$(document).unbind("dataSourceListReady");
		}
		
		/**
		 * 设置区域的显示隐藏
		 */
		this.setAreaVisible = function(visible)
		{
			if(areaSource == undefined)return;
			var areas = areaSource.entities.values;
			for(var i=0;i<areas.length;i++)
			{
				var area = areas[i];
				area.show = visible;
			}
		}
		
		init();
		
		//数据解析
		function DataParser(data)
		{
			var rows = [];
			if(data.indexOf("&#9;") > -1)//简单验证数据的合法性
			{
				rows = data.split("&#9;");//tab
			}
			if(rows.length>0)
			{
				while(rows[rows.length-1].length == 0)//当最后一行为空时移除
				{
					rows.pop();
				}
			}
			for(var i=0;i<rows.length;i++)
			{
				rows[i] = rows[i].split(",");
			}
			
			if(rows.length > 1000000)rows.splice(1000000,rows.length-1000000);
			
			this.getRows = function()
			{
				return rows;
			}
			
			this.getRowCount = function()
			{
				return rows.length;
			}
			
			this.getPaths = function()
			{
				var paths = [];
				var pathId = "";
				var path;
				for(var i=0;i<rows.length;i++)
				{
					if(rows[i][0] != pathId)
					{
						path = [];
						paths.push(path);
					}
					else
					{
						path = paths[paths.length-1];
					}
					pathId = rows[i][0];
					path.push(rows[i]);
				}
				
				if(paths.length > 15000)paths.splice(15000,paths.length-15000);
				return paths;
			}
		
			//获取所有的轨迹
			this.getHistoryPaths = function()
			{
				var paths = [];             // 所有路径数据
				var pathId = "";            // 当前路径ID
				var pathMap = {};           // 路径排序的Map
				var yuzhi = 1000;               // 过滤的阈值
				for(var i=0;i<rows.length;i++)
				{
					pathId = rows[i][0];  // 当前的浮动点ID
					if(!pathMap[pathId])      // 当前浮动点的路径ID  没在Map中出现
					{
						pathMap[pathId] = [];
						pathMap[pathId].push(rows[i]); // 初始化该map的路径并push进第一个点
						paths.push(pathMap[pathId]);   // 把新初始化路径添加到总路径数组中
					}
					else // 该浮动点ID在路径中出现
					{
						var t_length = pathMap[pathId].length;
						var t_8601t1 = toISO8601Date(pathMap[pathId][t_length-1][3]);
						var t_cesiumt1 = Cesium.JulianDate.fromIso8601(t_8601t1);
						var t_8601t2 = toISO8601Date(rows[i][3]);
						var t_cesiumt2 = Cesium.JulianDate.fromIso8601(t_8601t2);
						
						var leftPoint = Cesium.Cartesian3.fromDegrees(pathMap[pathId][t_length-1][1], pathMap[pathId][t_length-1][2], 0);
						var rightPoint = Cesium.Cartesian3.fromDegrees(rows[i][1], rows[i][2], 0);
						if(Cesium.Cartesian3.distance(leftPoint,rightPoint)>yuzhi || Cesium.JulianDate.secondsDifference(t_cesiumt2,t_cesiumt1)>600)// 连续时间的 两个点的间距大于阈值
						{
							pathMap["a"+new Date().getTime() + Math.random()] = pathMap[pathId].concat(); // 用一个随机数索引，另存该path数据
							delete pathMap[pathId];
							pathMap[pathId] = [];          
							pathMap[pathId].push(rows[i]); // 初始化该map的路径并push进第一个点
							paths.push(pathMap[pathId]);  
						}	
						else // 小于阈值
						{
							pathMap[pathId].push(rows[i]);
						}
					}
				}
				var filterPaths = [];
				for(i=0;i<paths.length;i++)
				{
					if(paths[i].length > 50)
					{
						filterPaths.push(paths[i]);
					}
				}
				return filterPaths;
				return paths;
			}
		}
		
		function SnapshotDataSource(data)
		{
			var _self = this;
			var dataParser = new DataParser(data.data);
			this.collection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
			var colorMap = new ColorMap();
			
			//画出所有的点
			function drawAllPoints()
			{
				var rows = dataParser.getRows();
				var len = rows.length;
				
				//显示调试信息
				var info = "浮动点个数:"+len;
				exporter.DebugTool.html(info);
			
				for(var i=0;i<len;i++)
				{
					var p = _self.collection.add({
						position:getPointPosition(i),
						show:true,
						color:getPointColor(i),
						pixelSize:3
					});
					p.value = rows[i][4];
				}
			
				function getPointColor(idx)
				{
					var p = rows[idx];
					var type = p[4];
					return colorMap.getColorByType(type);
				}
				
				function getPointPosition(idx)
				{
					var p = rows[idx];
					var lat = p[1];
					var lng = p[2];
					return Cesium.Cartesian3.fromDegrees(lat, lng);
				}
			}
			
			function showSourceColors()
			{
				var container = $("#sourceColors");
				container.show();
				container.empty();
				var list = colorMap.getShowList();
				var colorItems = [];
				for(var i=0;i<list.length;i++)
				{
					var item = new ColorItem(list[i]);
					item.view.appendTo(container);
					colorItems.push(item);
				}
				var totalItem = new TotalItem();
				totalItem.view.appendTo(container);
				
				var tx = 1920 - container.outerWidth() - 45;
				container.css("left",tx);
				
				for(var i=0;i<SnapshotDataSource.untoggledSources.length;i++)
				{
					var label = SnapshotDataSource.untoggledSources[i];
					var item = getColorItemByLabel(label);
					item.view.trigger("click");
				}
				
				function ColorItem(obj)
				{
					this.data = obj;
					var htmlStr  =  '<div class="item">'+
									'	<div class="colorBox"></div>'+
									'	<label></label>'+
									'</div>';
					this.view = $(htmlStr);
					var colorBox = this.view.find(".colorBox");
					colorBox.css("background-color",obj.color);
					var label = this.view.find("label");
					var pointsLen = _self.getPointsLengthOf(obj.value);
					label.text(obj.label+"("+pointsLen+")");
					label.css("color",obj.type == 0?"#1cc5e1":"#ffbf31");
					var toggled = true;
					this.view.click(function(){
						$(this).toggleClass("selected");
						toggled = !toggled;
						_self.visibilityPointsOf(obj.value,toggled);
						
						var index = SnapshotDataSource.untoggledSources.indexOf(obj.label);
						if(toggled == false)
						{
							if(index == -1)SnapshotDataSource.untoggledSources.push(obj.label);
						}
						else
						{
							if(index > -1)SnapshotDataSource.untoggledSources.splice(index,1);
						}
					});
				}
				
				function getColorItemByLabel(label)
				{
					var result;
					for(var i=0;i<colorItems.length;i++)
					{
						var item = colorItems[i];
						if(item.data.label == label)
						{
							result = item;
							break;
						}
					}
					return result;
				}
				
				function TotalItem()
				{
					this.view = $("<div>",{style:"padding:5px;color:#ffffff;font-size:16px;font-family:黑体;"});
					this.view.text("总计:"+_self.collection.length);
				}
			}
			
			this.getPointsLengthOf = function(value)
			{
				var len = 0;
				for(var i=0;i<this.collection.length;i++)
				{
					var p = this.collection.get(i);
					if(typeof(value) == "number")
					{
						if(p.value == value)
						{
							len++;
						}
					}
					else
					{
						var arr = value.split(",");
						if(arr.indexOf(p.value.toString())>-1)
						{
							len++;
						}
					}
				}
				return len;
			}
			
			this.visibilityPointsOf = function(value,bol)
			{
				for(var i=0;i<this.collection.length;i++)
				{
					var p = this.collection.get(i);
					if(typeof(value) == "number")
					{
						if(p.value == value)
						{
							p.show = bol;
						}
					}
					else
					{
						var arr = value.split(",");
						if(arr.indexOf(p.value.toString())>-1)
						{
							p.show = bol;
						}
					}
				}
			}
			
			this.destroy = function()
			{
				viewer.scene.primitives.remove(this.collection);
			}
			
			//drawPointTest();
			drawAllPoints();
			showSourceColors();
		}
		
		//记录未选中的
		SnapshotDataSource.untoggledSources = [];
		
		function ColorMap()
		{
			var staticColors = [
				"#FFFFFF",
				"#FFFF00",
				"#FF0000",
				"#3399FF",
				"#00FFFF",
				"#33CC33",
				"#9999CC",
				"#999966",
				"#CC6699",
				"#FF9999",
				"#669999"
			];
			
			var colorMapList;
			var map = {};
			
			function getColorMapList()
			{
				if(colorMapList == undefined)
				{
					colorMapList = [];
					var dsList = self.getDsList();
					var len = dsList.length;
					for(var i=0;i<len;i++)
					{
						var obj = dsList[i];
						if(i<staticColors.length-1)
						{
							obj.color = staticColors[i];
						}
						else
						{
							obj.color = staticColors[staticColors.length-1];
							obj.label = "其他";
						}
						colorMapList.push(obj);
					}
				}
			}
			
			this.getColorByType = function(type)
			{
				getColorMapList();
				var currentColor;
				if(map[type] == undefined)
				{
					var len = colorMapList.length;
					for(var i=0;i<len;i++)
					{
						if(colorMapList[i].value == type)
						{
							currentColor = colorMapList[i].color;
							map[type] = colorMapList[i];
							break;
						}
					}
					//出现50009不在列表里
					if(currentColor == undefined)
					{
						trace("NO TYPE："+type);
						currentColor = staticColors[staticColors.length-1];
					}
				}
				else
				{
					currentColor = map[type].color;
				}
				return Cesium.Color.fromCssColorString(currentColor);
			}
			
			this.getShowList = function()
			{
				var showList = [];
				var len = colorMapList.length;
				var otherItems = [];
				for(var i=0;i<len;i++)
				{
					var item = map[colorMapList[i].value];
					if(item != undefined && item.label != "其他")
					{
						showList.push(item);
					}
					else if(item != undefined)
					{
						otherItems.push(item);
					}
				}
				if(otherItems.length>0)
				{
					showList.push({
						color:otherItems[0].color,
						label:otherItems[0].label,
						type:otherItems[0].type,
						value:(function(){
							var arr = [];
							for(var i=0;i<otherItems.length;i++)
							{
								arr.push(otherItems[i].value);
							}
							return arr.join(",");
						})()
					});
				}
				if(showList.length>11)showList.splice(11,showList.length-11);
				return showList;
			}
		}
		
		//自定义的CzmlDataSource
		function CustomDataSource(data) 
		{
			var dataParser = new DataParser(data.data);
			this.czmlDataSource = new Cesium.CzmlDataSource();
			var czml = [];
			//czml配置
			czml.push({
				"id":"document",
		    	"version":"1.0"
			});
			//创建所有的点
			var paths = self.dataType == DataType.realTime ? dataParser.getPaths() : dataParser.getHistoryPaths();
			var len = paths.length;
			
			//显示调试信息
			var info = "浮动点个数:"+dataParser.getRowCount();
			info+= "<br>";
			info+="轨迹条数:"+len;
			if(len>0)
			{
				info+= "<br>";
				info+="首条轨迹浮动点个数:"+paths[0].length;
				info+= "<br>";
				info+="最后一条轨迹浮动点个数:"+paths[len-1].length;
			}
			exporter.DebugTool.html(info);
			if(len>0)
			{
				drawPaths();
				drawPoints();
			}
			this.czmlDataSource.process(czml);
			
			//画出轨迹
			function drawPaths()
			{
				for (var i=0;i<len;i++)
				{
					var line = {
						"polyline":{
							"positions":{
								"cartesian":getCartesianFromPath(i,true,false)
							},
							"width" : 2,
					        "material":{
					        	"solidColor":{
					        		"color":{"rgba": [255, 255, 0, 30]}
					        	} 
					        }
						}
					};
					
					if(self.dataType == DataType.history)
					{
						line.polyline.show = [];
						line.polyline.show.push({
							"boolean":false
						});
						line.polyline.show.push({
							interval:getIntervalForPath(i),
							"boolean":true
						});
					}
					
					czml.push(line);
				}
			}
		
			function getIntervalForPath(idx)
			{
				var path = paths[idx];
				var p0 = path[0];
				var p1 = path[path.length-1];
				var t0 = toISO8601Date(p0[3]);
				var t1 = toISO8601Date(p1[3]);
				
				//原始模式
				//return t0+"/"+t1;
				
				//叠加模式
				//return t0+"/"+data.timeRange.split("/")[1];
				
				//延长4小时
				var lastDate = Cesium.JulianDate.fromIso8601(t0);
				var newDate = new Cesium.JulianDate();
				Cesium.JulianDate.addHours(lastDate,4,newDate);
				return t0+"/"+Cesium.JulianDate.toIso8601(newDate);
			}
			
			//画时间轴上的点
			function drawPoints()
			{
				for (var i=0;i<len;i++)
				{
					var p = {
						"availability":data.timeRange,
						"point":{
							"color": { "rgba": [255, 255, 255, 255] },
				            "pixelSize" : 3,
				            "outlineColor" : { "rgba": [0, 0, 255, 50] },
							"outlineWidth" : 1
						},
						"position":{
							"cartesian":fixCartesianPath(getCartesianFromPath(i))
						}
					};
					czml.push(p);
				}
			}
			
			function fixCartesianPath(path)
			{
				//历史数据不处理
				if(self.dataType == DataType.history)return path;
				
				var firstPoint = [path[0],path[1],path[2],path[3]];
				var len = path.length;
				var lastPoint = [path[len-4],path[len-3],path[len-2],path[len-1]];
				var range = data.timeRange.split("/");
				firstPoint[0] = range[0];
				lastPoint[0] = range[1];
				path = firstPoint.concat(path);
				path = path.concat(lastPoint);
				return path;
			}
			
			function getCartesianFromPath(idx,forTimeline,withDate)
			{
				if(forTimeline == undefined)forTimeline = true;
				if(withDate == undefined)withDate = true;
				var arr = [];
				var path = paths[idx];
				var len = path.length;
				for (var i=0;i<len;i++)
				{
					var pointOfPath = path[i];
					var lat = pointOfPath[1];
					var lng = pointOfPath[2];
					var pos = Cesium.Cartesian3.fromDegrees(lat, lng);
					if(pointOfPath[3] != undefined)
					{
						var dateStr = toISO8601Date(pointOfPath[3]);
						if(forTimeline)
						{
							if(withDate)
							{
								arr = arr.concat([dateStr,pos.x,pos.y,pos.z]);
							}
							else
							{
								arr = arr.concat([pos.x,pos.y,pos.z]);
							}
						}
						else
						{
							arr = arr.concat([lat,lng]);
						}
					}
				}
				return arr;
			}
			
			this.destroy = function()
			{
				viewer.dataSources.remove(this.czmlDataSource,true);
			}
		}
	}
	
	function toISO8601Date(str)
	{
		var YYYY = str.substr(0,4);
		var MM = str.substr(4,2);
		var DD = str.substr(6,2);
		var HH = str.substr(8,2);
		var mm = str.substr(10,2);
		var ss = str.substr(12,2);
		return YYYY+"-"+MM+"-"+DD+"T"+HH+":"+mm+":"+ss+"Z";
	}
	return CesiumController;
});