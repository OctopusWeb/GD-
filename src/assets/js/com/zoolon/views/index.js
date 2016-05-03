
$(document).ready(function(){
	var app = $(".app");
	var bg = $("#bg");
	var bts = $("#bts").children();
	var logo = $("#logo");
	var slogan = $("#slogan");
	
	for(var i=0;i<bts.length;i++)
	{
		var bt = $(bts[i]);
		var enable = $at.Config.pages[i].enable;
		bt.click(new BtClickHandler(i).handler);
		$at.mouseChildren(bt,enable,true);
	}
	
	function BtClickHandler(idx)
	{
		this.handler = function()
		{
			hide(function(){
				goPage(idx);
			});
		}
	}
	
	function goPage(idx)
	{
		var link = $at.Config.pages[idx].link;
		window.location.href = link;
	}
	
	function show()
	{
		TweenMax.staggerFrom([bg,logo,slogan], 1, {opacity:0, delay:0.5}, 0.1);
		TweenMax.staggerFrom(bts, 2, {scale:0, delay:0.5, ease:Elastic.easeOut, force3D:true}, 0.1);
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenMax.staggerTo([logo,slogan,bg], 1, {opacity:0, delay:0.5}, 0.1,function(){
			onComplete();
		});
		TweenMax.staggerTo(bts, 0.5, {opacity:0, y:-100, ease:Back.easeIn}, 0.1);
	}
	
	var preloader = new $at.AppPreloader(app);
	preloader.load(function(){
		show();
		redraw();
	});
	
});


