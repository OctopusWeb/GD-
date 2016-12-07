/**
 * 城市选择
 * 
 * 1.增加热度排序
 * 2.增加字母排序
 */
define("CitySelector",function(exporter){
	var CitySelector = function()
	{
		var toggled = false;
		var self = this;
		var view = $("#widgets #w1");
		var openBt = $(".quanguo");
		var winController = new WinController(view.find("#menu"),selectCity);
		
		$("#widgets #w1 #menu #searchIcon").click(function(){
			winController.close();
		})
		
		openBt.mousedown(function(e){
			var tl = setTimeout(function(){
				openBt.unbind("mouseup");
				longPressHandler();
			},1000);
			openBt.mouseup(function(){
				clearTimeout(tl);
				openBt.unbind("mouseup");
				clickHandler();
			});
		});
		
		function clickHandler()
		{
			winController.open();
		}
		
		function longPressHandler()
		{
			TweenLite.to(bt0,0.5,{alpha:toggled?0:0.5});
			toggled = !toggled;
			if(self.ontoggle!=undefined)self.ontoggle(toggled);
		}
		
		this.value = function(newValue)
		{
			view.find("#info0").text(newValue);
		}
	   		
   		this.getInfoByCityCode = function(cityCode)
   		{
   			return winController.getInfoByCityCode(cityCode);
   		}
   		
		function selectCity(info)
		{
			winController.close();
	   		if(self.onSelectCity!=undefined)self.onSelectCity(info);
		}
	}
	return CitySelector;
	
	/**
	 * 选择窗口
	 */
	function WinController(view,selectCity)
	{
		var self = this;
		var isOpen = false;
		var closeBt = view.find("#closeBt");
		var inputFeild = view.find("input");
		var parser,tabController;
		
		view.mousedown(function(e){
			e.stopImmediatePropagation();
		});
		
		closeBt.click(function(e){
			self.close();
		});
		
		inputFeild.keyup(search);
		
		loadThenParseCityInfo(function(){
			tabController = new TabController(view,parser,selectCity);
		});
		
		function search()
		{
			if(tabController!=undefined)tabController.showIdx(6);
			var keyStr = inputFeild.val();
			tabController.setSearch(keyStr);
		}
		
		//加载后解析城市数据
	   	function loadThenParseCityInfo(onComplete)
	   	{
	   		$.get("src/assets/data/city_20150611.txt",function(data){
	   			parser = new CityDataParser(data);
	   			$at.get(exporter.Config.request.getCitys,null,function(list){
	   				parser.concatData(list);
	   				onComplete();
	   			});
	   		});
	   	}
		
		this.open = function()
		{
			if(isOpen)return;
			var openBt = $("#widgets #w1 #bt0");
			openBt.hide();
			var box = $("#widgets #w1 #box");
			box.css("background-image","none");
			var info = $("#widgets #w1 #info0");
			TweenLite.to(info,0.5,{alpha:0});
			TweenLite.to(box,0.5,{width:366,height:400,x:-366+122,y:-400+86,ease:Cubic.easeInOut});
			
			exporter.mouseChildren(view,false);
	   		view.show();
	   		TweenLite.set(view,{alpha:0,width:122,height:86,x:0,y:0});
	   		TweenLite.to(view,0.5,{alpha:1,width:366,height:400,x:-366+122,y:-400+86,ease:Cubic.easeInOut,onComplete:function(){
	   			exporter.mouseChildren(view,true);
	   		}});
	   		isOpen = true;
	   		
	   		$(window).bind("mousedown",mousedownHandler);
		}
		
		this.close = function()
		{
			var openBt = $("#widgets #w1 #bt0");
			openBt.show();
			var box = $("#widgets #w1 #box");
			box.css("background-image","url(src/assets/images/dataSource/w1.png)");
			TweenLite.to(box,0.5,{width:122,height:86,x:0,y:0,ease:Cubic.easeInOut});
			var info = $("#widgets #w1 #info0");
			TweenLite.to(info,0.5,{alpha:1});
			
			exporter.mouseChildren(view,false);
	   		TweenLite.to(view,0.5,{alpha:0,width:122,height:86,x:0,y:0,ease:Cubic.easeInOut});
	   		isOpen = false;
	   		
	   		$(window).unbind("mousedown",mousedownHandler);
		}
		
		function mousedownHandler(e)
		{
			self.close();
		}
		
		this.getInfoByCityCode = function(cityCode)
		{
			return parser!=undefined ? parser.getInfoByCityCode(cityCode) : undefined;
		}
	}
	
	function TabController(view,parser,selectCity)
	{
		var self = this;
		var tabs = view.find("#citiesSort .bt");
		var ct = view.find("#container");
		var currentIdx = -1;
		
		tabs.each(function(i){
			var tabContainer = $("<div>");
			tabContainer.hide();
			tabContainer.appendTo(ct);
			
			$(this).click(function(e){
				self.showIdx(i);
			});
		});
		
		initTabContainers();
		
		function initTabContainers()
		{
			tabs.each(function(i){
				var tabContainer = ct.children().eq(i);
				if(i == 0)
				{
					createHotSortView(tabContainer);
				}
				else if(i < 6)
				{
					createLetterSortView($(this).text(),tabContainer);
				}
			});
		}
		
		/**
		 * 生成城市排名视图 
		 */
		function createHotSortView(tabContainer)
		{
			var arr = parser.sortByHot();
			$.each(arr,function(i){
				var item = new IndexItem(i,this,selectCity);
				item.view.appendTo(tabContainer);
			});
		}
		
		/**
		 * 生成字母排名视图 
		 */
		function createLetterSortView(letters,tabContainer)
		{
			 var map = parser.sortByLetters(letters);
			 for(letter in map)
			 {
			 	var letterContainer = $("<div>",{style:"clear:both;"});
			 	letterContainer.appendTo(tabContainer);
			 	var letterDiv = $("<div>",{style:"float:left;font-size:22px;background:#222266;line-height:30px;width:30px;text-align:center;"});
			 	letterDiv.appendTo(letterContainer);
			 	letterDiv.text(letter.toUpperCase());
			 	var arr = map[letter];
			 	for(var i=0;i<arr.length;i++)
			 	{
			 		var item = new CommonItem(arr[i],selectCity);
			 		item.view.appendTo(letterContainer);
			 	}
			 }
		}
		
		this.setSearch = function(keyStr)
		{
			var tabContainer = ct.children().eq(6);
			tabContainer.empty();
			var arr = parser.searchCities(keyStr);
			for(var i=0;i<arr.length;i++)
		 	{
		 		var item = new CommonItem(arr[i],selectCity);
		 		item.view.appendTo(tabContainer);
		 	}
		}
		
		this.showIdx = function(idx)
		{
			var tab,tabContainer;
			if(currentIdx>-1)
			{
				tab = tabs.eq(currentIdx);
				tab.removeClass("selected");
				tabContainer = ct.children().eq(currentIdx);
				tabContainer.hide();
			}
			currentIdx = idx;
			tab = tabs.eq(idx);
			tab.addClass("selected");
			tabContainer = ct.children().eq(idx);
			tabContainer.show();
		}
		
		this.showIdx(0);
		this.setSearch("");
	}
	
	function IndexItem(idx,data,onClick)
   	{
   		this.idx = idx;
   		this.data = data;
   		this.view = $("<div>",{'class':'searchItem'});
   		this.view.text(idx+"."+data.name);
   		this.view.click(function(e){
   			onClick(data);
   		});
   	}
   	
   	function CommonItem(data,onClick)
   	{
   		this.data = data;
   		this.view = $("<div>",{'class':'searchItem'});
   		this.view.text(data.name);
   		this.view.click(function(e){
   			onClick(data);
   		});
   	}
	
	/*
	 * 数据解析
	 */
	function CityDataParser(data)
   	{
   		var rows = data.split("\r\n");
   		//移除前2行
   		rows.shift();
   		rows.shift();
   		this.dic = {};
 		rows.unshift("100000,100000,china,0,0,全国");
   		for(var i=0;i<rows.length;i++)
   		{
   			var row = rows[i];
   			var arr = row.split(",");
   			this.dic[arr[0]] = arr;
   		}
   		
   		this.searchCities = function(keyStr)
   		{
   			var arr = [];
   			for(cityCode in this.dic)
   			{
	   			var info = this.getInfoByCityCode(cityCode);
	   			if(cityCode.indexOf(keyStr)>-1)
   				{
   					arr.push(info);
   				}
   				else if(info.name.indexOf(keyStr)>-1)
   				{
	   				arr.push(info);
   				}
   				else if(info.pinyin!=undefined && info.pinyin.indexOf(keyStr)>-1)
   				{
   					arr.push(info);
   				}
   			}
   			return arr;
   		}
   		
   		this.getInfoByCityCode = function(cityCode)
   		{
   			var arr = this.dic[cityCode];
   			return {
   				citycode:arr[0],
   				citycodeOfugc:arr[1],
   				type:arr[2],
   				lat:arr[3]/3600000,
   				lng:arr[4]/3600000,
   				name:arr[5],
   				pinyin:arr[6],
   				rank:arr[7]
   			};
   		}
   		
   		this.concatData = function(list) 
   		{
   			for(var cityCode in this.dic)
   			{
   				var info;
   				if(cityCode == "100000")
   				{
   					info = {
   						pinyin:"quan guo",
   						rank:1000000
   					};
   				}
   				else
   				{
   					info = getInfoByCityCodeInList(cityCode);
   				}
   				if(info!=undefined)
   				{
   					this.dic[cityCode].push(info.pinyin);
   					this.dic[cityCode].push(info.rank);
   				}
   			}
   			
   			function getInfoByCityCodeInList(cityCode)
   			{
   				var info;
   				var len = list.length;
   				for(var i=0;i<len;i++)
   				{
   					if(cityCode == list[i].value)
   					{
   						info = list[i];
   						break;
   					}
   				}
   				return info;
   			}
   		}
   		
   		/**
   		 * 按热度排序
   		 */
   		this.sortByHot = function()
   		{
   			var arr = [];
   			for(var cityCode in this.dic)
   			{
   				var info = this.getInfoByCityCode(cityCode);
   				if(info.rank == undefined)info.rank = 0;
   				arr.push(info);
   			}
   			arr.sort(function(a,b){
   				return b.rank - a.rank;
   			});
   			return arr;
   		}
   		
   		/*
   		 * 按字母排序
   		 */
   		this.sortByLetters = function(letters)
   		{
   			var map = {};
   			letters = letters.toLowerCase();
   			for(var i=0;i<letters.length;i++)
   			{
   				var word = letters.charAt(i);
   				map[word] = [];
   			}
   			for(var cityCode in this.dic)
   			{
   				var info = this.getInfoByCityCode(cityCode);
   				if(info.pinyin!=undefined)
   				{
   					var firstWord = info.pinyin.charAt(0);
   					if(info.rank == undefined)info.rank = 0;
   					if(letters.indexOf(firstWord) > -1)map[firstWord].push(info);
   				}
   			}
   			for(var letter in map)
   			{
   				map[letter].sort(function(a,b){
   					return b.rank - a.rank;
   				});
   			}
   			return map;
   		}
   	}
});