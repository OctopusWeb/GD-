$(document).ready(function(){
	var app = $(".app");
	var topBar = $("#topBar");
	var topBarController = new $at.TopBarController();
	topBarController.onPre = function()
	{
		hide(function(){
			$at.GeneralManager.goPrePage(4);
		});
	}
	topBarController.onNext = function()
	{
		hide(function(){
			$at.GeneralManager.goNextPage(4);
		});
	}
	topBarController.onHome = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	
	var bg = $("#bg");
	var items = $("#items");
	var time = $("#time");
	var info = $("#info");
	
	function show()
	{
		TweenLite.from(topBar,1,{y:-90});
		TweenLite.from([bg,items,time,info],1,{alpha:0});
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenLite.to([bg,items,time,info],1,{alpha:0});
		TweenLite.to(topBar,1,{y:-90,ease:Expo.easeInOut,onComplete:function(){
			onComplete();
		}});
	}
	
	var preloader = new $at.AppPreloader(app);
	preloader.load(function(){
		show();
		redraw();
	});
});
