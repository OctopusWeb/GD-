define("DebugTool",function(){
	var DebugTool = {};
	DebugTool.isOpen = false;
	DebugTool.view = $("<div>",{
		style:"border:solid 1px;background:#000000;position:absolute;font-size:30px;color:#ffffff;width:960px;height:400px;left:960px;padding:10px;",
	})
	
	$(window).keyup(function(e){
//		if(e.keyCode == 68) //d
//		{
//			DebugTool.isOpen?DebugTool.close():DebugTool.show();
//		}
	});
	
	DebugTool.show = function()
	{
		DebugTool.isOpen = true;
		DebugTool.view.appendTo($(".app"));
	}
	
	DebugTool.close = function()
	{
		DebugTool.isOpen = false;
		DebugTool.view.remove();
	}
	
	DebugTool.html = function(htmlStr)
	{
		DebugTool.view.html(htmlStr);
	}
	
	DebugTool.clear = function()
	{
		DebugTool.view.html("");
	}
	
	return DebugTool;
});