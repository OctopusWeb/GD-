//test
$(window).keyup(function(e){
	switch(e.keyCode)
	{
		case 49: //1
		ExternalCall(JSON.stringify({cmd:"goCity",cityCode:"110000"}));
		break;
		case 51: //3
		ExternalCall(JSON.stringify({cmd:"toggleWidgets"}));
		break;
	}
});
function ExternalCall(json)
{
	$(document).trigger("ExternalCall",json);
}
