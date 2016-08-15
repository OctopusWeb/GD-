/**
 * 模式选择
 */
define("ModeSelector",function(exporter){
	var ModeSelector = function()
	{
		var self = this;
		var view = $("#widgets #w7");
		var box = view.find("#box");
		var label = view.find("#label");
		var menu = new MenuController(selectHandler);
		menu.view.appendTo(view);
		
		box.click(function(e){
			menu.open();
		});
		
		function selectHandler(data)
		{
			box.css("backgroundColor",data.color);
			label.text(data.label);
			if(self.onSelect!=undefined)self.onSelect(data.idx);
		}
	}
	return ModeSelector;
	
	function MenuController(selectHandler)
	{
		var self = this;
		this.view = $("<div>");
		this.view.attr("id","menu");
		var colors = ["#669933","#ff0000","#009fe8"];
		var texts = ["实时数据","快照模式","历史数据"];
		
		this.view.bind("mousedown",function(e){
			e.stopImmediatePropagation();
		});
		
		for(var i=0;i<texts.length;i++)
		{
			var info = {
				label:texts[i],
				color:colors[i],
				idx:i
			};
			var item = new MenuItem(info,clickHandler);
			item.view.appendTo(this.view);
		}
		
		this.open = function()
		{
			var box = $("#widgets #w7 #box");
			exporter.mouseChildren(box,false);
			box.css("background-image","none");
			exporter.mouseChildren(this.view,false);
			TweenLite.set(self.view,{alpha:0});
			TweenLite.to(box,0.5,{width:195,height:195,x:-111,y:0,ease:Cubic.easeInOut,onComplete:function(){
				self.view.show();
				TweenLite.to(self.view,0.3,{alpha:1});
				exporter.mouseChildren(self.view,true);
			}});
			
			$(window).bind("mousedown",mousedownHandler);
		}
		
		this.close = function()
		{
			exporter.mouseChildren(self.view,false);
			TweenLite.to(self.view,0.3,{alpha:0});
			var box = $("#widgets #w7 #box");
			TweenLite.to(box,0.5,{width:86,height:86,x:0,y:0,ease:Cubic.easeInOut,onComplete:function(){
				exporter.mouseChildren(box,true);
				box.css("background-image", "url(src/assets/images/dataSource/switchBt.png)");
			}});
			$(window).unbind("mousedown",mousedownHandler);
		}
		
		function mousedownHandler(e)
		{
			self.close();
		}
		
		function clickHandler(data)
		{
			self.close();
			selectHandler(data);
		}
	}
	
	function MenuItem(data,onClick)
	{
		this.view = $("<div class='menuItem'>");
		this.view.css("background",data.color);
		this.view.text(data.label);
		
		this.view.click(function(e){
			onClick(data);
		});
	}
});