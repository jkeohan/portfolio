	(function () { 
	//Dimensions and padding
				var margin = {top:20,right:30,bottom:50,left:50}
			var w = 800- margin.left - margin.right;
			var h = 600 - margin.top - margin.bottom;
			var tooltipcolor;
		
			var padding = [ 20, 10, 50, 50 ];  //Top, right, bottom, left

  		// var color = d3.scale.linear()
				//  .range(['#B8B800','#296629'])
			var color = d3.scale.category10()
			// var regions = d3.scale.linear()
			// 	.domain(["North America", "Latin America", "Asia", "Africa"])
			// 	.range(["red","blue","green"])

			//Set up date formatting and years
			var dateFormat = d3.time.format("%Y");

			//Set up scales
			var xScale = d3.time.scale()
								.range([ margin.left, w - margin.left - margin.right]);
			
			var yScale = d3.scale.linear()
								.range([ margin.top, h - margin.bottom ]);
									//.range([ margin.top, h - margin.bottom ]);

			//Configure axis generators
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(15)
							.tickFormat(function(d) {
								return dateFormat(d);
							});

			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left");        

			//Configure line generator
			var line = d3.svg.line()
				.x(function(d) { return xScale(dateFormat.parse(d.year));})
				.y(function(d) {return yScale(+d.amount);
				});

			//Create main SVG
			var svg = d3.select(".lineChart")
						.append("svg")
							.attr("width", w + margin.left + margin.right)
							.attr("height", h)
						.append("g")

			var tooltip = d3.select(".lineChart").append("div") 
						.attr("class","s3tooltip")

			var tooltipTail = d3.select(".lineChart").append('div')
					.attr("class","tooltipTail hidden")
					//.classed("hidden",true)

			//Load data
			d3.csv("data/data_regions.csv", function(data) {
	

				//d3.text("tooltip.html", function(data) { d3.select(".sideBar").append("div").attr("id", "modal").html(data)})
				var sideBar = d3.select(".sideBar").append("div").attr("id", "modal")

				var regions = d3.nest().key(function(d) { return d["Region"]}).sortKeys(d3.ascending).entries(data)
      	regions = regions.filter(function(d) { return !(d.key == "World")})
      

      	function colorize (regions) {
					regions.forEach( function(d,i) {
						d.color = color(i);
					})
				}

				colorize(regions)

	
				//New array with all the years, for referencing later
				//var years = ["2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012"];
				var years = d3.keys(data[0]).filter( function(key) { return key != "Location" && key != "Region" } ) 
			
				//console.log(years)
				//Create a new, empty array to hold our restructured dataset
				var dataset = [];

				//Loop once for each row in data
				for (var i = 0; i < data.length; i++) {

					//Create new object with Location name and empty array
					dataset[i] = {
						location: data[i].Location,
						region: data[i].Region,
						headlines: []
					};

					//Loop through all the years
					for (var j = 0; j < years.length; j++) {

						// If value is not empty
						if (data[i][years[j]]) {
							//Add a new object to the emissions data array
							//for this country
							dataset[i].headlines.push({
								year: years[j],
								amount: data[i][years[j]]

							});
						}
					}
				}

				var iceland = dataset.filter(function(d) { return d.location == "Iceland"})
			
				mouseOver(iceland[0])
				//Uncomment to log the original data to the console
				 //console.log(data);

				//Uncomment to log the newly restructured dataset to the console
				 //console.log(dataset);



				//Set scale domains
				// xScale.domain([ 
				// 	d3.min(years, function(d) {
				// 		return dateFormat.parse(d);
				// 	}),
				// 	d3.max(years, function(d) {
				// 		return dateFormat.parse(d);
				// 	})
				// ]);
				xScale.domain(
					d3.extent(years, function(d) { return dateFormat.parse(d)}))

				yScale.domain([ 
					d3.max(dataset, function(d) {
						return d3.max(d.headlines, function(d) {
							return +d.amount;
						});
					}),
					0
				]);

				//Make a group for each Nationality
				var groups = svg.selectAll("g")
					.data(dataset)
					.enter()
					.append("g")
						// .attr("class", function(d) {
						// 	//console.log(d.region)
						// 	switch (d.region) {
						// 		case "Oceana": return "line blue"
						// 		case "Europe": return "line Europe"
						// 		case "North America": return "line NA"
						// 		default: return "line"
						// 	}							
					//})
				

				//Append a title with the Nationality name (so we get easy tooltips)
				// groups.append("title")
				// 	.text(function(d) {
				// 		return d.location;
				// 	});

				var text = groups.append("text")
					.attr("class", "label")
					.attr("x", w - 40 )

				//Within each group, create a new line/path,
				//binding just the headlines data to each one
				groups.selectAll("path")
					//.data(dataset) //using this format will warp the line color and append World as the 
					//title for every line
					.data(function(d) { return [d]})
					.enter()
					.append("path")	
					.style("stroke", 
						function(d,i) { 
      				var val;
							regions.forEach(function(obj) {
			
								if(d.region === obj.key) { 

									val = obj.color } 
							})
							d.color = val
						
							return val
	      		})
					.style("stroke-width", 3)
					// .style("stroke", function(d) { 
					// 	return color(d.region ) } )
					//.attr("class", "line")
					.attr("class", function(d) {
							//console.log(d.region)
							switch (d.region) {
								case "Oceana": return "line Oceana"
								case "Europe": return "line Europe"
								case "North America": return "line NA"
								case "Asia": return "line Asia"
								case "Middle East": return "line ME"
								case "Latin America": return "line LA"
								default: return "line"
							}							
					})
				
					.on("mouseover", function(d) {
				

						tooltip1(d);
						mouseOver(d,d.color)
						//tooltip2(d) 
					})
					.on("mouseout", function(d) {
						mouseout(d)
					})
					//.attr("d", line)
						.attr("d", function(d) { return line(d.headlines)} )
					.append("title").text(function(d) { 
						console.log(d)
						return d.location})
			
				function mouseOver(d,color) {

					console.log(d)
							sideBar.html(

										"<table> <tr>" +
										        "<th></th>" +
										   " </tr>" +
										    "<tr><td>Country</td>" + "<td>" + d.location  + "</td></tr>" +
										     "<tr><td>Region</td>" + "<td>" + d.region  + "</td></tr>" +
										     "<tr><td>2002</td>" + "<td>" + d.headlines[0].amount  + "</td></tr>" +
										     "<tr><td>2003</td>" + "<td>" + d.headlines[1].amount   + "</td></tr>" +
										     "<tr><td>2004</td>" + "<td>" + d.headlines[2].amount   + "</td></tr>" +
										     "<tr><td>2005</td>" + "<td>" + d.headlines[3].amount   + "</td></tr>" +
										     "<tr><td>2006</td>" + "<td>" + d.headlines[4].amount  + "</td></tr>" +
										     "<tr><td>2007</td>" + "<td>" + d.headlines[5].amount   + "</td></tr>" +
										     "<tr><td>2008</td>" + "<td>" + d.headlines[6].amount   + "</td></tr>" +
										     "<tr><td>2009</td>" + "<td>" + d.headlines[7].amount   + "</td></tr>" +
										     "<tr><td>2010</td>" + "<td>" + d.headlines[8].amount  + "</td></tr>" +
										     "<tr><td>2011</td>" + "<td>" + d.headlines[9].amount   + "</td></tr>" +
										     "<tr><td>2012</td>" + "<td>" + d.headlines[10].amount   + "</td></tr>" +
						
										//     <tr><td>Region  </td><td class="data"></td></tr>
										// <tr><td>Wins</td><td class="data"></td></tr>
										//     <tr><td>Losses</td><td class="data"></td></tr>
										//     <tr><td>Draws</td><td class="data"></td></tr>
										//     <tr><td>Points</td><td class="data"></td></tr>
										//     <tr><td>Goals For</td><td class="data"></td></tr>
										//     <tr><td>Goals Against</td><td class="data"></td></tr>
										//     <tr><td>Clean Sheets</td><td class="data"></td></tr>
										//     <tr><td>Yellow Cards</td><td class="data"></td></tr>
										//     <tr><td>Red Cards</td><td class="data"></td></tr> 
										//      <tr><td>Red Cards</td><td class="data"></td></tr> 
										//       <tr><td>Red Cards</td><td class="data"></td></tr> 
										//      <tr><td>Red Cards</td><td class="data"></td></tr> 
										"</table>"
							).style("background-color", "#d6e9c6" )
				}

	 					function getSortedKeys(obj) {
	 							
								    var keys = []; for(var val in obj) keys.push(val);
								    console.log(keys)
								    return keys.sort(function(a,b){return obj[a]-obj[b]});
									}
				function mouseout(d){
					// tooltip.transition().duration(200).style("opacity",0)
					// d3.select(".tooltipTail").classed("hidden",true)
					d3.selectAll("path").transition().style("stroke-width", 3)
				
				}

		function tooltip1 (d){


							var yl = yScale(+d.headlines[d.headlines.length -1 ].amount) 
							tooltipTail(d)
							text.attr("y", yScale(+d.headlines[d.headlines.length -1 ].amount) + 4 )

							tooltip.style("opacity",0)
			  				tooltip.style("border" , "3px solid " + d.color).transition().duration(1000).style("opacity",1)
	      				tooltip.html(
								'<span class="countryName">' + d.location + '</span><br/>') //+ 
								// '2012: <span class="value">' + d. + '%</span><br/>'  + 
								// "2012"+ ": " + '<span class="value">' + "2010" + '%</span>')
							//.style("left", (d3.event.pageX - 30) + "px")
							//.style("top", (d3.event.pageY -50 ) + "px")
					// 	var tailX = w -70;
					// var tailY = yScale(+d.headlines[d.headlines.length -1 ].amount) 
							 	.style("left", w - 35 + "px")
								.style("top", yl -18 + "px")

					}

				function tooltipTail (d) {

						var currentYear = d.headlines
						var tailX = w -70;
						var tailY = yScale(+d.headlines[d.headlines.length -1 ].amount) 
					  var tail = d3.select(".tooltipTail").classed("hidden",false)
					  .style("border-right" , "25px solid " + d.color)
					  	.transition().duration(1000)
							.style("left", tailX + 5 + "px")
							.style("top", tailY -8 + "px")
							
				}

				//Axes
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (h - padding[2]) + ")")
					.call(xAxis);

				svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + (padding[3]) + ",0)")
					.call(yAxis)
                // Add rotated "Number of Headlines" unit of measure text to x-axis
                        .append("text")
                        .attr("class", "label")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -20)
                        .attr("y", 5)
                        .attr("dy", ".91em")
                        .style("text-anchor", "end")
                        .text("Percent of Engery Generation ");
                

			});
})()
			//End USA data load function
//1. Tooltip is positioned at top of page
//RESOLUTION: changed code to select(".tooltip") instead of body
