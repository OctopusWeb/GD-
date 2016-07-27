var adjustCesium = function(){
	var clientWidth = document.body.clientWidth;
    var clientHeight = document.body.clientHeight;
    var scalex = clientWidth/1920;
    var scaley = clientHeight/1080;
    var scale = scalex;
    if(scale > scaley) scale = scaley;
    
    
    var offX,offY;
    var width = 1920*scale;
	var height = 1080*scale;
	
	offX = (clientWidth-width)/2;
	offY = (clientHeight-height)/2;
	//console.log(width);
	//console.log(height);
	$("#cesiumContainer").prependTo("body");
	$("#cesiumContainer").css("width",width+"px");
	$("#cesiumContainer").css("height",height+"px");
	$("#cesiumContainer").css("left",offX+"px");
	$("#cesiumContainer").css("top",offY+"px");
	
}
var redraw = function () {
	//console.log("redraw");
    var clientWidth = document.body.clientWidth;
    var clientHeight = document.body.clientHeight;
    //if(clientWidth == 1920) return;
    var bigger = (clientWidth > 1920) ? true : false;
    var scalex = clientWidth/1920;
    var scaley = clientHeight/1080;
    var scale = scalex;
    if(scale > scaley) scale = scaley;
    var offX,offY;
  
    var width = 1920*scale;
	var height = 1080*scale;
	
	offX = (clientWidth-width)/2;
	offY = (clientHeight-height)/2;
    
    
    
    var app = $(".app");
    var url = window.location.href;
//console.log(window.location.href);
    if(url.indexOf("dataSource")>=0 || url.indexOf("operationAnalysis")>0){
	app.css("width","0px");
	app.css("height","0px");
	app.css("transform","matrix("+scale+", 0, 0, "+scale+", "+offX+", "+offY+")");
//console.log("hava map");
    	adjustCesium();
    }else{
	offX = (clientWidth-1920)/2;
	offY = (clientHeight-1080)/2;
	//console.log(offX);
	//console.log(offY);
	app.css("transform","matrix("+scale+", 0, 0, "+scale+", "+offX+", "+offY+")");
    }
    
   
	
};


$(window).resize(function (e) {
	//alert("resize");
	redraw();
});