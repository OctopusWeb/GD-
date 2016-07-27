$(document).ready(function(){
	var app = $(".app");
	
	var vars = {};
	vars.url = "src/assets/video/片尾短片(mp4无字幕).webm";
	vars.subtitles = "src/assets/video/片尾短片（字幕）.txt";
	vars.width = 1920;
	vars.height = 1080;
	var videoPlayer = new $at.VideoPlayer(vars);
	videoPlayer.view.appendTo(app);
	videoPlayer.video.onended = function()
	{
		window.location.href = "index.html";
	}
	redraw();
});