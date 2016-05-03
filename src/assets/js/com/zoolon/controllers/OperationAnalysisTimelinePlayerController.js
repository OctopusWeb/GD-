define("OperationAnalysisTimelinePlayerController",function(exporter){
	var OperationAnalysisTimelinePlayerController = function()
	{
		var self = this;
		var player = $("#timelinePlayer");
		var preBt = player.find("#preBt");
		var playBt = player.find("#playBt");
		var nextBt = player.find("#nextBt");
		var pointer = $("#pointer");
		var info = player.find("#info");
		var playing = false;
		var speed = 10;
		var initX = parseInt(pointer.css("left"));
		var maxW = 1761;
		var loop = false;
		var playComplete = false;
		updateInfo();
		
		preBt.click(preHandler);
		playBt.click(playHandler);
		nextBt.click(nextHandler);
		
		function tick()
		{
			if(playing)
			{
		  		var tx = parseInt(pointer.css("left"));
		  		tx+=1*speed;
		  		if(tx>=(initX+maxW))
		  		{
		  			if(loop || playComplete)
		  			{
		  				tx = initX;
		  				playComplete = false;
		  			}
		  			else
		  			{
		  				playHandler();
		  				tx = initX+maxW;
		  				playComplete = true;
		  			}
		  		}
		  		pointer.css("left",tx);
		  		if(self.onUpdate!=undefined)self.onUpdate();
			}
		  	Cesium.requestAnimationFrame(tick);
		}
		tick();
		
		this.getSpeed = function()
		{
			return speed;
		}
		
		this.getProgress = function()
		{
			var tx = parseInt(pointer.css("left"));
			return (tx-initX)/maxW*100;
		}
		
		this.reset = function()
		{
			playing = true;
			playHandler();
			pointer.css("left",initX);
			playComplete = false;
		}
		
		this.getControls = function()
		{
			return {
				'pre':preBt,
				'play':playBt,
				'next':nextBt
			};
		}
		
		function preHandler()
		{
			if(speed>1)
			{
				speed--;
				updateInfo();
			}
		}
		
		function playHandler()
		{
			playing = !playing;
			playBt.css("background-image","url(src/assets/images/operationAnalysis/"+(playing?"stopBt":"playBt")+".png)");
		}
		
		function nextHandler()
		{
			if(speed<100)
			{
				speed++;
				updateInfo();
			}
		}
		
		function updateInfo()
		{
			info.text("倍速×"+speed);
		}
	}
	return OperationAnalysisTimelinePlayerController;
});
