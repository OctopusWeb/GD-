$(document).ready(function(){
	var app = $(".app");
	var topBar = $("#topBar");
	var widgets = $("#widgets").children();
	var addMap = $("#addMap");
	var topBarController = new $at.TopBarController();
	
	//$("#cesiumContainer").prependTo("body");	
	$("#cesiumContainer").css("position","absolute");
	
	app.css("background","none");
	app.css("position","absolute");
	
	app.css("overflow","visible");
	
	$("#eventSource").hide();
	
	topBarController.onPre = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	topBarController.onNext = function()
	{
		hide(function(){
			$at.GeneralManager.goNextPage(0);
		});
	}
	topBarController.onHome = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	
	var controller = new $at.DataSourceController();
	
	function show()
	{
		TweenMax.staggerFrom(widgets, 2, {scale:0.5,alpha:0, delay:0.5, ease:Elastic.easeOut, force3D:true}, 0.1,function(){
			controller.showCompleteHandler();
		});
		TweenLite.from(topBar,1,{y:-90});
		TweenLite.from($("#cesiumContainer"),1,{alpha:0});
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenLite.to($("#cesiumContainer"),1,{alpha:0});
		TweenMax.staggerTo(widgets, 0.5, {opacity:0, y:-100, ease:Back.easeIn}, 0.1,function(){
			onComplete();
		});
		TweenLite.to(topBar,1,{y:-90,ease:Expo.easeInOut});
	}
	
	$(".icon").bind("click",function(e){
		e.stopPropagation();
		var claDom = $(this);
		claDom.attr("class") == "icon" ? claDom.addClass("changeIcon"):claDom.removeClass("changeIcon");
	})
	
	var preloader = new $at.AppPreloader(app);
	preloader.load(function(){
		show();
		redraw();
	});
		
	
	var eventArea = new $at.eventAreaController(controller);
	
})



