define("AppPreloader",function(exporter){
	var AppPreloader = function(app)
	{
		var self = this;
		var clientWidth = document.body.clientWidth;
	    var clientHeight = document.body.clientHeight;
		this.view = $("<div>",{
			style:"position:absolute;background-color:#000000;width:"+clientWidth+"px;height:"+clientHeight+"px;"
		}).appendTo(app);
		
		var opts = {
			color:"#ffffff"
		};
		var spinner = new Spinner(opts);
		spinner.spin(this.view.get(0));
		
		this.load = function(onComplete)
		{
			$(window).load(function(){
				self.view.remove();
				onComplete();
			});
		}
	}
	return AppPreloader;
});
