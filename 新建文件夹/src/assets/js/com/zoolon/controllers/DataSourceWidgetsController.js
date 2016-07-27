define("DataSourceWidgetsController",function(exporter){
	var DataSourceWidgetsController = function()
	{
		var self = this;
		var customLoadController;
		var loaders = [];
		function init()
		{
			self.controllers = {
				"widget0":new exporter.controllers.dataSource.Widget0(),
				"widget1":new exporter.controllers.dataSource.Widget1(),
				"widget5":new exporter.controllers.dataSource.Widget5(),
				"widget6":new exporter.controllers.dataSource.Widget6(),
				"widget2":new exporter.controllers.dataSource.Widget2(),
				"widget3":new exporter.controllers.dataSource.Widget3(),
				"widget4":new exporter.controllers.dataSource.Widget4(),
				"widget7":new exporter.controllers.dataSource.Widget7()
			};
			
			$at.get($at.Config.request.getCoveredCitys,null,function(json){
				self.controllers["widget1"].value(json.size);
			});
		}
		
		this.loadDataSource = function(cityCode)
		{
			this.cityCode = cityCode;
			while(loaders.length>0)
			{
				var loader = loaders[0];
				loader.abort();
				loaders.shift();
			}
			if(customLoadController != undefined)
			{
				customLoadController.dispose();
			}
			//获取上月日均GPS点/覆盖里程
			var vars = {};
			if(cityCode != "100000")
			{
				vars["params.cityCodes"] = cityCode;
			}
			vars["params.date"] = exporter.TimeUtil.getLastMonthDate();
			loaders.push($at.get($at.Config.request.getDailyKpi,vars,function(json){
				self.controllers["widget5"].numController.value(json.dataNum);
				self.controllers["widget6"].numController.value(json.validMileage);
			}));
			//当日累计GPS点/覆盖里程
			customLoadController = new exporter.CustomLoadController(this);
			
			loaders.push($at.get($at.Config.request.getValidMileageRatioTotalMileage,vars,function(json){
				self.controllers["widget4"].value(json);
			}));
			
			loaders.push($at.get($at.Config.request.getDsPercent,vars,function(json){
				self.controllers["widget0"].setSource([json.zhongbao,json.hangye]);
			}));
			
			this.controllers["widget0"].dsSelector.loadSource(cityCode);
		}
		
		init();
	}
	return DataSourceWidgetsController;
}); 

define("CustomLoadController",function(exporter){
	var CustomLoadController = function(dataSourceWidgetsController)
	{
		var time = 7*60;
		var lastJson;
		var loader,timer;
		//初次加载
		firstLoad(function(json){
			dataSourceWidgetsController.controllers["widget2"].numController.value(json.dataNum*0.9);
			dataSourceWidgetsController.controllers["widget3"].numController.value(json.validMileage*0.9);
			tween(json);
		});
		
		function loadData(onComplete,onError)
		{
			var vars = {};
			if(dataSourceWidgetsController.cityCode != "100000")
			{
				vars["params.cityCodes"] = dataSourceWidgetsController.cityCode;
			}
			loader = $at.get($at.Config.request.getDayKpi,vars,function(json){
				json != null ? onComplete(json) : onError();
			},undefined,onError);
		}
		
		function firstLoad(onComplete)
		{
			loadData(onComplete,function(e){
				firstLoad(onComplete);
			});
		}
		
		function preLoad(onComplete)
		{
			loadData(onComplete,function(e){
				preLoad(onComplete);
			});
		}
		
		function tween(currentJson)
		{
			TweenLite.delayedCall(time-60,function(){
				preLoad(function(json){
					lastJson = json;
				});
			});
			dataSourceWidgetsController.controllers["widget2"].numController.tweenValueTo(time,currentJson.dataNum);
			dataSourceWidgetsController.controllers["widget3"].numController.tweenValueTo(time,currentJson.validMileage,function(){
				if(lastJson!=undefined)
				{
					tween(lastJson);
				}
				else
				{
					loader.abort();
					preLoad(function(json){
						lastJson = json;
						tween(lastJson);
					});
				}
			});
		}
		
		function getCurrentDate()
		{
			return new Date().Format("yyyy-MM-dd hh:mm:ss");
		}
		
		this.dispose = function()
		{
			if(loader!=undefined)loader.abort();
			if(timer!=undefined)clearTimeout(timer);
			dataSourceWidgetsController.controllers["widget2"].numController.killTween();
			dataSourceWidgetsController.controllers["widget3"].numController.killTween();
		}
	}
	return CustomLoadController;
});


define("NumController",function(exporter){
	var NumController = function(nums)
	{
		var self = this;
		
		var _value = 0;
		var tween;
		
		this.value = function(newValue)
		{
			if(newValue == undefined)
			{
				return _value;
			}
			else
			{
				_value = Math.round(newValue);
				
				var len = nums.length;
				var str = String(_value);
				str = str.split("").reverse().join("");
				for(var i=0;i<len;i++)
				{
					var num = $(nums[len-1-i]);
					var numStr = str.charAt(i);
					num.text(numStr);
				}
			}
		}
		
		this.tweenValueTo = function(duration,newValue,onComplete)
		{
			var obj = {value:this.value()};
			tween = TweenLite.to(obj,duration,{value:newValue,onUpdate:function(){
				self.value(obj.value);
			},onComplete:onComplete});
		}
		
		this.killTween = function()
		{
			if(tween!=undefined)tween.kill();
		}
	}
	return NumController;
});

/**
 * 众包/行业
 */
define("controllers.dataSource.Widget0",function(exporter){
	var Widget0 = function()
	{
		var info0 = $("#widgets #w0 #info0");
		var info1 = $("#widgets #w0 #info1");
		var info = $("#widgets #w0 #info");
		var t0 = info0.children().first();
		var t1 = info1.children().first();
		this.setSource = function(source)
		{
			var s0 = source[0]<30?30:source[0];
			s0 = s0>70?70:s0;
			var s1 = 100-s0;
			info0.width(s0+'%');
			info1.width(s1+'%');
			info1.css('left',s0+'%');
			t0.text(source[0]+'%');
			t1.text(source[1]+'%');
		}
		var self = this;
		this.dsSelector = new DsSelector(this);
		info.click(function(){
			self.dsSelector.getIsOpen()?self.dsSelector.close():self.dsSelector.open();
		});
	}
	return Widget0;
	
	//数据源选择
	function DsSelector(widget)
	{
		var view = $("#widgets #w0 #dsSelector");
		var container = $("#widgets #w0 #dsSelector .body");
		var cbs = [];
		var loader;
		var header = $("#widgets #w0 #dsSelector .header #submitBt");
		var cb0 = new CustomCheckBoxController($("#widgets #w0 #dsSelector .header .customCheckBox"),{label:"选择前十项"}); //选择10项
		var submitBt = $("#widgets #w0 #dsSelector .header #submitBt");
		var isOpen = false;
		var dsList;
		
		view.bind("mousedown",function(e){
			e.stopImmediatePropagation();
		});
		
		function initHeader()
		{
			cb0.setSelected(true);
			exporter.mouseChildren(cb0.view,false,true);
			exporter.mouseChildren(submitBt,false,true);
		}
		initHeader();
		cb0.view.click(function(e){
			var len = 10;
			len = cbs.length>len?len:cbs.length;
			for(var i=0;i<len;i++)
			{
				var cb = cbs[i];
				cb.setSelected(cb0.selected);
			}
		});
		var self = this;
		submitBt.click(function(e){
			var values = self.getSelectedValues();
			if(values.length == 0)return;
			self.close(function(){
				if(widget.onSubmit!=undefined)widget.onSubmit(values);
			});
		});
		
		this.getIsOpen = function()
		{
			return isOpen;
		}
		
		this.reset = function()
		{
			initHeader();
			if(loader!=undefined)
			{
				loader.abort();
			}
			while(cbs.length>0)
			{
				var cb = cbs[0];
				cb.view.remove();
				cbs.shift();
			}
		}
		
		this.loadSource = function(cityCode)
		{
			this.reset();
			var vars = {
				"params.cityCodes":cityCode
			};
			loader = $at.get(exporter.Config.request.getDataSources,vars,function(list){
				dsList = list;
				for(var i=0;i<list.length;i++)
				{
					var cb = new CustomCheckBoxController($('<div class="customCheckBox"><div></div><span>label</span></div>'),list[i]);
					cb.view.appendTo(container);
					cbs.push(cb);
					if(i<10)
					{
						cb.setSelected(true);
					}
				}
				
				exporter.mouseChildren(cb0.view,true,true);
				exporter.mouseChildren(submitBt,true,true);
				
				$(document).trigger("dataSourceListReady",cityCode);
			});
		}
		
		this.getDsList = function()
		{
			return dsList;
		}
		
		this.getSelectedValues = function()
		{
			var values = [];
			for(var i=0;i<cbs.length;i++)
			{
				var cb = cbs[i];
				if(cb.selected)values.push(cb.data.value);
			}
			return values;
		}
		
		this.open = function()
		{
			var w0 = $("#widgets #w0");
			w0.css("background-color",view.css("background-color"));
			var info0 = $("#widgets #w0 #info0");
			var info1 = $("#widgets #w0 #info1");
			var info = $("#widgets #w0 #info");
			TweenLite.to([info0,info1,info],0.5,{alpha:0});
			exporter.mouseChildren(info,false);
			
			exporter.mouseChildren(view,false);
			view.show();
			TweenLite.set(view,{height:86,alpha:0});
			TweenLite.to([w0,view],0.5,{height:300,alpha:1,ease:Cubic.easeInOut,onComplete:function(){
				exporter.mouseChildren(view,true);
			}});
			isOpen = true;
			
			$(window).bind("mousedown",mouseDownHandler);
		}
		
		this.close = function(onComplete)
		{
			var w0 = $("#widgets #w0");
			var info0 = $("#widgets #w0 #info0");
			var info1 = $("#widgets #w0 #info1");
			var info = $("#widgets #w0 #info");
			TweenLite.to([info0,info1,info],0.5,{alpha:1});
			exporter.mouseChildren(info,false);
			
			exporter.mouseChildren(view,false);
			TweenLite.to(view,0.5,{height:86,alpha:0,ease:Cubic.easeInOut});
			TweenLite.to(w0,0.5,{height:86,ease:Cubic.easeInOut,onComplete:function(){
				exporter.mouseChildren(info,true);
				if(onComplete!=undefined)onComplete();
			}});
			isOpen = false;
			
			$(window).unbind("mousedown",mouseDownHandler);
		}
		
		function mouseDownHandler(e)
		{
			self.close();
		}
	}
	
	//自定义选择框
	function CustomCheckBoxController(view,data)
	{
		this.view = view;
		this.data = data;
		this.selected = this.view.hasClass("customCheckBoxSelected");
		var label = this.view.find("span");
		label.text(data.label);
		if(data.type!=undefined)
		{
			label.css("color",data.type == 0?"#1cc5e1":"#ffbf31");
		}
		var self = this;
		this.view.click(function(e){
			self.setSelected(!self.selected);
		});
		
		this.setSelected = function(value)
		{
			this.selected = value;
			this.view[value?"addClass":"removeClass"]("customCheckBoxSelected");
		}
	}
});

//已覆盖城市
define("controllers.dataSource.Widget1",function(exporter){
	var Widget1 = function()
	{
		$at.CitySelector.call(this);
	}
	return Widget1;
});

define("controllers.dataSource.Widget2",function(exporter){
	var Widget2 = function()
	{
		var nums = $("#widgets #w2").children();
		this.numController = new exporter.NumController(nums);
	}
	return Widget2;
});

define("controllers.dataSource.Widget3",function(exporter){
	var Widget3 = function()
	{
		var nums = $("#widgets #w3").children();
		this.numController = new exporter.NumController(nums);
	}
	return Widget3;
});

define("controllers.dataSource.Widget4",function(exporter){
	var Widget4 = function()
	{
		this.value = function(newValue)
		{
			$("#widgets #w4 .number").text(newValue);
		}
	}
	return Widget4;
});

define("controllers.dataSource.Widget5",function(exporter){
	var Widget5 = function()
	{
		var nums = $("#widgets #w5").children();
		this.numController = new exporter.NumController(nums);
	}
	return Widget5;
});

define("controllers.dataSource.Widget6",function(exporter){
	var Widget6 = function()
	{
		var nums = $("#widgets #w6").children();
		this.numController = new exporter.NumController(nums);
	}
	return Widget6;
});

define("controllers.dataSource.Widget7",function(exporter){
	var Widget7 = function()
	{
		$at.ModeSelector.call(this);
	}
	return Widget7;
});
