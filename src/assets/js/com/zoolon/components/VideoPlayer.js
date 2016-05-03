define("VideoPlayer",function(exporter){
	var VideoPlayer = function(vars)
	{
		var self = this;
		this.url = vars.url;
		this.subtitles = vars.subtitles;
		this.width = vars.width;
		this.height = vars.height;
		this.view = $("<div>");
		this.videoView = $("<video>",{
			style:"position:absolute;",
			src:self.url
		});
		this.videoView.appendTo(this.view);
		this.subtitlesView = $("<div>",{
			style:"position:absolute;color:#ffffff;font-size:40px;text-align:center;font-family:黑体;text-shadow: 0 5px 5px #000; "
		});
		this.subtitlesView.appendTo(this.view);
		this.subtitlesView.width(this.width);
		this.subtitlesView.css("top",this.height - 100);
		this.video = this.videoView.get(0);
		if(vars.loop)
		{
			this.video.loop = true;
		}
		//加载字幕
		$.get(this.subtitles,function(data){
			var parser = new SubtitlesParser(data);
			self.video.play();
			var len = parser.timeRanges.length;
			self.video.ontimeupdate = function()
			{
				var currentTime = self.video.currentTime;
				var currentSubtitle = "";
				for(var i=0;i<len;i++)
				{
					var timeRange = parser.timeRanges[i];
					if(currentTime>=timeRange[0] && currentTime<=timeRange[1])
					{
						currentSubtitle = parser.subtitles[i];
						break;
					}
				}
				self.subtitlesView.text(currentSubtitle);
			}
		});
	}
	
	function SubtitlesParser(data)
	{
		var rows = data.split("\r\n");
		var times = [];
		this.subtitles = [];
		this.timeRanges = [];
		for(var i=0;i<rows.length;i++)
		{
			i%2 == 0 ? times.push(rows[i]) : this.subtitles.push(rows[i]);
		}
		for(i=0;i<times.length;i++)
		{
			var str = times[i];
			var timeStrRange = str.split("-");
			var timeRange = [timeStrToSeconds(timeStrRange[0]),timeStrToSeconds(timeStrRange[1])];
			this.timeRanges.push(timeRange);
		}
	}
	
	function timeStrToSeconds(str)
	{
		var arr = str.split(":");
		var h = Number(arr[0]);
		var m = Number(arr[1]);
		var s = Number(arr[2]);
		return s+m*60+h*3600;
	}
	
	return VideoPlayer;
});
