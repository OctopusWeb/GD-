//test
$(window).keyup(function(e){
	switch(e.keyCode)
	{
		case 49: //1
		ExternalCall(JSON.stringify({cmd:"pre"}));
		break;
		case 50: //2
		ExternalCall(JSON.stringify({cmd:"next"}));
		break;
		case 51:
		ExternalCall(JSON.stringify({cmd:"control"}));
		break;
		case 52:
		ExternalCall(JSON.stringify({cmd:"option",value:"播报,用户数"}));
		break;
	}
});
function ExternalCall(json)
{
	$(document).trigger("ExternalCall",json);
}
