define("GeneralManager",function(exporter){
	var GeneralManager = {};
	
	/*
	 * 上一页
	 */
	GeneralManager.goPrePage = function(currentPageIdx)
	{
		var prePageIdx = currentPageIdx-1;
		if(prePageIdx>-1)
		{
			var prePage = $at.Config.pages[prePageIdx];
			if(prePage.enable)
			{
				window.location.href = prePage.link;
			}
			else
			{
				GeneralManager.goPrePage(prePageIdx);
			}
		}
		else
		{
			window.location.href = "index.html";
		}
	}
	
	/**
	 * 下一页
	 */
	GeneralManager.goNextPage = function(currentPageIdx)
	{
		var nextPageIdx = currentPageIdx+1;
		var len = $at.Config.pages.length;
		if(nextPageIdx<len)
		{
			var nextPage = $at.Config.pages[nextPageIdx];
			if(nextPage.enable)
			{
				window.location.href = nextPage.link;
			}
			else
			{
				GeneralManager.goNextPage(nextPageIdx);
			}
		}
		else
		{
			window.location.href = "end.html";
		}
	}
	
	return GeneralManager;
});
