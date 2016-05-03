define("TopBarController",function(exporter){
	var TopBarController = function()
	{
		var topBar = $("#topBar");
		var preBt = $("#topBar #preBt");
		var nextBt = $("#topBar #nextBt");
		var logo = $("#topBar #logo");
		var self = this;
		
		preBt.click(function(){
			self.onPre();
		});
		
		nextBt.click(function(){
			self.onNext();
		});
		
		logo.click(function(){
			self.onHome();
		});
	}
	return TopBarController;
});
