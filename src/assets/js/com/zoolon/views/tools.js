$(document).ready(function(){
	var app = $(".app");
	var topBar = $("#topBar");
	var topBarController = new $at.TopBarController();
	topBarController.onPre = function()
	{
		hide(function(){
			$at.GeneralManager.goPrePage(5);
		});
	}
	topBarController.onNext = function()
	{
		hide(function(){
			$at.GeneralManager.goNextPage(5);
		});
	}
	topBarController.onHome = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	
	var slogan = $("#slogan");
	var bg = $("#bg");
	var arr = $("#apps").children();
	arr.push(slogan);
	
	function show()
	{
		TweenLite.from(bg,1,{alpha:0});
		TweenMax.staggerFrom(arr, 2, {scale:0.5,alpha:0, delay:0.5, ease:Elastic.easeOut, force3D:true}, 0.1);
		TweenLite.from(topBar,1,{y:-90});
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenLite.to(topBar,1,{y:-90,ease:Expo.easeInOut});
		TweenLite.to(bg,1,{alpha:0,delay:0.5});
		TweenMax.staggerTo(arr, 0.5, {opacity:0, y:-100, ease:Back.easeIn}, 0.1,function(){
			onComplete();
		});
	}
	
	var preloader = new $at.AppPreloader(app);
	preloader.load(function(){
		show();
		redraw();
	});
});
