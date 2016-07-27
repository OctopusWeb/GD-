$(document).ready(function(){
	var app = $(".app");
	var topBar = $("#topBar");
	var topBarController = new $at.TopBarController();
	topBarController.onPre = function()
	{
		hide(function(){
			$at.GeneralManager.goPrePage(2);
		});
	}
	topBarController.onNext = function()
	{
		hide(function(){
			$at.GeneralManager.goNextPage(2);
		});
	}
	topBarController.onHome = function()
	{
		hide(function(){
			window.location.href = "index.html";
		});
	}
	
	var vars = {};
	vars.url = "src/assets/video/质量监控(mp4无字幕).webm";
	vars.subtitles = "src/assets/video/质量监控（字幕）.txt";
	vars.width = 1920;
	vars.height = 1080;
	vars.loop = true;
	var videoPlayer = new $at.VideoPlayer(vars);
	videoPlayer.view.insertBefore(topBar);
	
	function show()
	{
		TweenLite.from(topBar,1,{y:-90});
	}
	
	function hide(onComplete)
	{
		$at.mouseChildren(app,false);
		TweenLite.to(videoPlayer.view,0.5,{alpha:0});
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
