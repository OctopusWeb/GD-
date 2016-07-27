/*
 * 运营分析图表
 */
define("OperationAnalysisChartController",function(exporter){
	var OperationAnalysisChartController = function()
	{
		var self = this;
		var chart = $("#chart");
		var ct = createDrawArea().appendTo(chart);
		var monthLabels = createMonthLabels();
		var points = createPoints();
		var lineCanvas = createLineCanvas().appendTo(ct);
		var valueLabels = createValueLabels();
		var max = 4;
		
		//生成画线区域
		function createDrawArea()
		{
			var area = $("<div>",{
				style:"position:absolute;width:1761px;height:116px;left:40px;top:10px;"
			});
			return area;
		}
		
		//生成月份的文字
		function createMonthLabels()
		{
			var arr = [];
			for(var i=0;i<13;i++)
			{
				var label = $("<div>");
				label.addClass("monthLabel");
				label.appendTo(chart);
				label.css("left",45+146.7*i);
				arr.push(label);
			}
			return arr;
		}
		
		//生成点
		function createPoints()
		{
			var arr = [];
			for(var i=0;i<13;i++)
			{
				var point = new Point();
				point.view.appendTo(ct);
				point.view.css("left",146.7*i);
				point.view.css("top",116);
				arr.push(point);
			}
			return arr;
		}
		
		function createLineCanvas()
		{
			var lineCanvas = $("<canvas>",{
				style:"position:absolute;"
			});
			lineCanvas.get(0).width = 1761;
			lineCanvas.get(0).height = 116;
			return lineCanvas;
		}
		
		function createValueLabels()
		{
			var arr = [];
			for(var i=0;i<5;i++)
			{
				var label = $("<div>");
				label.addClass("valueLabel");
				label.appendTo(chart);
				label.css("top",8+26*i);
				label.text(0);
				arr.push(label);
			}
			return arr;
		}
		
		this.setMonthLabels = function(labels)
		{
			for(var i=0;i<monthLabels.length;i++)
			{
				var label = monthLabels[i];
				label.text(labels[i]);
			}
		}
		
		this.setMaxValue = function(maxValue)
		{
			max = maxValue;
			for(var i=0;i<valueLabels.length;i++)
			{
				var label = valueLabels[i];
				var value = maxValue - maxValue/(valueLabels.length-1)*i;
				value = Math.round(value*10)/10;
				label.text(value);
			}
		}
		
		this.setValues = function(values)
		{
			var initValues = this.getValues();
			TweenLite.to(initValues,1,{endArray:values,onUpdate:function(){
				for(var i=0;i<points.length;i++)
				{
					var point = points[i];
					var value = initValues[i];
					point.bindValue(value);
					lineCanvas.get(0).width = 1761;
					self.drawRect();
					self.drawLine();
				}
			}});
		}
		
		this.getValues = function()
		{
			var arr = [];
			for(var i=0;i<points.length;i++)
			{
				var point = points[i];
				var ty = parseInt(point.view.css("top"));
				var value = (1 - ty/ct.height())*max;
				arr.push(value);
			}
			return arr;
		}
		
		this.drawRect = function()
		{
			var context = lineCanvas.get(0).getContext("2d");
			context.fillStyle = "rgba(0,0,0,0.5)";
			context.beginPath();
			for(var i=0;i<points.length;i++)
  			{
  				var p = points[i];
  				context[i==0?"moveTo":"lineTo"](parseInt(p.view.css("left")),parseInt(p.view.css("top")));
  			}
  			context.lineTo(1761,116);
  			context.lineTo(0,116);
  			context.lineTo(0,0);
  			context.fill();
  			context.closePath();
		}
		
		this.drawLine = function()
		{
			var context = lineCanvas.get(0).getContext("2d");
			context.strokeStyle = "rgba(255,255,255,1)";
			context.lineWidth = 2;
			context.beginPath();
  			for(var i=0;i<points.length;i++)
  			{
  				var p = points[i];
  				context[i==0?"moveTo":"lineTo"](parseInt(p.view.css("left")),parseInt(p.view.css("top")));
  			}
  			context.stroke();
  			context.closePath();
		}
		
		this.setSource = function(ds)
		{
			this.setMaxValue(ds.maxValue);
			this.setMonthLabels(ds.labels);
			this.setValues(ds.values);
		}
		
		//点
		function Point()
		{
			this.view = $("<div>",{
				style:"position:absolute;visibility:hidden;"
			});
			
			$("<div>",{
				style:"width:4px;height:4px;background:#ff0000;position:absolute;left:-2px;top:-2px;"
			}).appendTo(this.view);
			
			this.bindValue = function(value)
			{
				var ty = (1-value/max)*ct.height();
				this.view.css("top",ty);
			}
		}
		
		this.setMaxValue(max);
	}
	return OperationAnalysisChartController;
});
