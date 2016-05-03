define("MenuController",function(exporter){
	var MenuController = function(menu,controlBt){
		var self = this;
		var open = false;
		TweenLite.to(menu,0,{scale:0});
		initMenu();
		controlBt.click(menuControlHandler);
		
		$(document).click(function(){
			hide();
		});
		
		var items;
		function initMenu()
		{
			items = menu.find(".menuItem");
			for(var i=0;i<items.length;i++)
			{
				var item = items.eq(i);
				item.click(new ItemClick(i).handler);
			}
		}
		
		function ItemClick(idx)
		{
			this.handler = function(e)
			{
				e.stopImmediatePropagation();
				hide();
				selectIdx(idx);
			}
		}
		 
		function menuControlHandler(e)
		{
			e.stopImmediatePropagation();
			open?hide():show();
		}
		
		function show()
		{
			menu.show();
			$at.mouseChildren(menu,true);
			TweenLite.to(menu,0.5,{scale:1,alpha:1,ease:Expo.easeInOut});
			open = true;
		}
		
		function hide()
		{
			$at.mouseChildren(menu,false);
			TweenLite.to(menu,0.5,{scale:0,alpha:0,ease:Expo.easeInOut,onComplete:function(){
				menu.hide();
			}});
			open = false;
		}
		
		function selectIdx(idx)
		{
			var item = items.eq(idx);
			controlBt.text(item.text());
			if(self.onSelectItem != undefined)self.onSelectItem(item);
		}
	}
	return MenuController;
});
 