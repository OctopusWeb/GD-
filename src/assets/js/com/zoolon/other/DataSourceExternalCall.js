//test
$(window).keyup(function(e){
	switch(e.keyCode)
	{
		case 49: //1
		numShow=true;
		$(".label0").hide();
		$(".label1").show();
//		ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"110000"}));
		break;
		case 50: //2
		numShow=false;
		$(".label0").show();
		$(".label1").hide();
//		ExternalCall(JSON.stringify({cmd:"toggleWidgets"}));
		break;
	}
});
function ExternalCall(json)
{
	$(document).trigger("ExternalCall",json);
}
