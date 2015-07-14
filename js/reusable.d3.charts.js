d3.models = {};

//var rlegend = d3.edge.legend().fontSize(15)
//svg.datum(yearMean).call(rlegend)

d3.models.legend = function () {

	var fontSize = 15;
	var width = 650;
	var height = 400;

	var dispatch = d3.dispatch("mouseOver", "mouseOut");

	function render(selection) {
		//console.log(selection)//outs
		selection.each(function(_data) { 
			//console.log(_data)
			var legend = selection.selectAll("legend").data(_data).enter().append("g")
				.attr("class", "legend")
				.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"})

			 legend.append('rect')
			 		.attr({ x:width+5, y:5, width: 10, height: 10 })
          .style("fill", function (d, i) { return d.color ;
        })

        legend.append('text')
        	.attr({ x: width+25, y: 15})
  		//.attr("dy", ".35em")
		  		.text(function (d, i) { return d.key })
		      .attr("class", "textselected")
		      .style("text-anchor", "start")
		      .style("font-size", fontSize)
		      .on("mouseover",dispatch.mouseOver)
		      .on("mouseout", dispatch.mouseOut)
		})//_selection.each
	}

	render.fontSize = function(_x) {
		if (!arguments.length) return fontSize;
		fontSize = _x;
		return this;
	}
	render.width = function(_x) {
		if (!arguments.length) return width;
		width = _x;
		return this;
	}
	render.height = function(_x) {
		if (!arguments.length) return height;
		height = _x;
		return this;
	}
	d3.rebind(render, dispatch, "on")
	return render
}
