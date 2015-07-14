var m = {top:50,bottom:60,left:70,right:150};
var width = 650 - m.left - m.right;
var height = 400 - m.top - m.bottom;
var currentYear = "2002";
var tooltip;

var svg = d3.select(".regionalstats").append('svg')
	.attr("width",width + m.left + m.right)
	.attr("height", height + m.top + m.bottom)
	.append('g').attr("transform","translate(" + m.left + "," + m.top + ")")//.attr("transform","translate(50,50)")

//Create scales
var yScale = d3.scale.linear().range([height,0]);
var xScale = d3.scale.linear().range([0,width+2]);
var radiusScale = d3.scale.sqrt().range([6,20])
//var radiusScale = d3.scale.linear().range([6,20])
var colorScale = d3.scale.category10()

//Create axises
var yAxis = d3.svg.axis();
var xAxis = d3.svg.axis();

d3.csv("data/data_regions.csv", render)

var radio_buttons = d3.selectAll('.radio_buttons').on("click", function() {
      console.log(this.value)
     // build_chart(radio)
})


function render(data) {
	console.log(data)

	var filterOutWorld = data.filter(function(d,i) { return d["Location"] } )
	var keys = d3.keys(data[0]).filter(function(key) { return !(key == "Location" || key == "Region") })
	var locations = (data.filter(function(d) { return !(d.Location == "World") } ) ).map(function(d)  { return d.Location } )
	var regions = d3.set(data.map(function(d) {  return d.Region } ) ).values().sort(d3.acscending) 

	var yearMean = d3.nest().key(function(d) { return d["Region"] } ).sortKeys(d3.ascending)
	  	.rollup(function(v) { 
	  		//console.log(v)// [Object, Object]  each obj is a row of data
	  		return { mean: mean(v), countries: v.map(function(c) { return c.Location} ) } 
	 			} )
			.entries(filterOutWorld)

	function mean(val) { 
		var obj = {};
		keys.forEach(function(year) {
			var y = d3.mean(val, function(m) { return +m[year] 
			} )
			obj[year] = d3.format(".2f")(y) 
		})
		return obj
	}//

	update(currentYear)

	function update(year) {
		
		yScale.domain([0,d3.max(yearMean, function(d) { return +d.values.mean["2012"] + 7 } ) ] )//.range([height,0])
		xScale.domain([0,d3.max(yearMean, function(d) { return +d.values.mean[year] + 4  } ) ] )//.range([0,width])
		radiusScale.domain(d3.extent(yearMean, function(d) {  return +d.values.countries.length } ) )

		var circles = svg.selectAll("circle").data(yearMean)
		circles.enter().append("circle")
			.attr("cy", function(d,i) { return yScale(+d.values.mean["2012"]) })
			.attr("cx", function(d,i) { return xScale(+d.values.mean[year]) })
			.attr("r", function(d) { d.radius = radiusScale(+d.values.countries.length)
				return radiusScale(+d.values.countries.length)})
			.attr("class",function(d) { return d.key})
			.style("fill",function(d,i) { d.color = colorScale(i); return d.color})
			.style("opacity",.8)
			.on("mouseover", mouseOver)
			.on("mouseout", mouseOut)
			.append('title')

		//Update Axises
		yAxis.scale(yScale).orient("left")
		.innerTickSize(-width)
		.tickFormat(function(d) { return d + "%" } )

		xAxis.scale(xScale).orient("bottom")
		.innerTickSize(-height)
		.tickFormat(function(d) { return d + "%" } )

		//Add Axis Title's
		svg.append("g").attr("class","y Axis").call(yAxis)//.attr("transform","translate(40,0)")
			.append("text")//.style("text-anchor","start")
      		.attr({ class: "ylabel", y: -60, x: -290, dy: ".71em" })
      		.attr("transform", "rotate(-90)")	
      		.text("2012 Renewable Energy Output").style("font-size",20)

		svg.append('g').attr("class","x Axis").call(xAxis).attr("transform","translate(0," + height + ")")
			.append("text").style("text-anchor", "middle")
      		.attr({  class: "xlabel", x: width/2 , y: 50})
      		.text("2002 Renewable Energy Output").style("font-size",20)
	}

	////////D3 Vertical Legend Reusable//////////////////////////
	var rlegend = d3.models.legend().fontSize(15)
		.on("mouseOver", function(d) { d3.select(this).transition().duration(1000).style("font-weight","bold") ;
			 mouseOver(d); 
			 //console.log(d)
			}) 
		.on("mouseOut", function(d) { d3.select(this).transition().duration(1000).style("font-weight","normal") ;
	     mouseOut(d); } )
	svg.datum(yearMean).call(rlegend)
	////////D3 Vertical Legend Reusable//////////////////////////

	function mouseOver(d) {
	 	var cColor = d.color
		var c = d3.select("." + d.key.split(" ")[0])//.transition().attr("r",30)
		var cx = +c.attr("cx")
	 	var cy = +c.attr("cy")
		c.call(displayToolTip,d,cColor,cx,cy)

		var radiusOver = c.node().r.animVal.value;
			c.transition().duration(250)
			.attr("stroke-width",20)
			.attr("stroke", "rgba(230,230,230, .8)")
			.attr("r", d.radius + 10)

		var line1 = svg.append("line").datum(d)
			line1
				.attr("x1",xScale(0) )
				.attr("y1", function(d) { return yScale(+d.values.mean["2012"] ) } )
				.attr("x2", function(d) { return xScale(+d.values.mean[currentYear]) })
				.attr("y2", function(d) { return yScale(+d.values.mean["2012"])})
				.attr("stroke-width", 1)
				.attr("stroke", d.color ) //d3.select(this).style("fill")  )
				.style("opacity",1)
				.attr("class","line1")

		var line2 = svg.append("line").datum(d)
			line2
				.attr("x1", function(d) { return xScale(+d.values.mean[currentYear]) } )
				.attr("y1", height )
				.attr("x2", function(d) { return xScale(+d.values.mean[currentYear]) })
				.attr("y2", function(d) { return yScale(+d.values.mean["2012"])})
				.attr("stroke-width", 1)
				.attr("stroke", d.color  )
				.style("opacity",1)
				.attr("class","line2")
		
			.attr("r",radiusOver + 10)
	}

	function mouseOut(d) {

		var c = d3.select("." + d.key.split(" ")[0])//.transition().attr("r",30)

		c.transition().duration(250)
			.attr("stroke-width",0)
			.attr("stroke", "rgba(230,230,230, .8)")
			.attr("r",d.radius )

		d3.selectAll(".line1").transition().duration(250).style("opacity",0).remove()
		d3.selectAll(".line2").transition().duration(250).style("opacity",0).remove()

		tooltip.transition().duration(250).style('opacity',0).remove()

	}

	function displayToolTip(selection,d,color,cx,cy) { 

			tooltip = d3.select(".regionalstats").append("div").attr("class","d3tooltip")
			tooltip.style("font-size", 10)
			tooltip.style("border" , "3px solid " + color )
				.transition().duration(250).style("opacity",1)

			tooltip.html(
			'<span class="regionName">' + d.key + '</span><br/>' + 
			'<hr  class="d3tooltiphr" style="border: 1px solid ' +  color + ' " ' +  '>' +
			'<span class="key">2002:</span> <span class="value">' + +d.values.mean["2002"] + '%</span><br/>'  + 
			'<span class="key">2012:</span> <span class="value">' + +d.values.mean["2012"] + '%</span><br/>' + 
			'<hr class="d3tooltiphr" style="border: 1px solid ' +  color + ' " ' +  '>' +
			'<span class="key">Countries:</span>  <span class="value">' + d.values.countries.length + '</span>')
				.style("left", function() {
			 if ((cx + 100) > width ) { return (cx -30) + "px" } 
				else { return (cx + 100) + "px" } 
			} )
			.style("top", (cy) + "px")

			return tooltip
	}

}//render

