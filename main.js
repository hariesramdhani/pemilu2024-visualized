
let w = 1200,
    h = 400;

let margin = {
    top: 60,
    bottom: 40,
    left: 70,
    right: 40
};

let tooltip = d3.select(`#test`)
                .append("div")
                .style("position", "fixed")
                .style("z-index", 1)
                .style("visibility", "hidden");;

// define map projection
let projection = d3.geoMercator()
                    .translate([-1900, 150])
                    .scale([1200]);

//Define default path generator
let path = d3.geoPath()
            .projection(projection);

// Create the SVG for the map            
let svg = d3.select(`#test`)
            .append("svg")
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("tranform", `translate(${margin.left}, ${margin.top})`);

let APIurl = `https://raw.githubusercontent.com/hariesramdhani/temp-api/main/data/kpu_provinces_data.json`;

// Make the number easier to read
let commaSeparate = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let lengthOfData;
let jsonFeatures;
let voteData;
let date;
let totalCandidateOneCount = 0;
let totalCandidateTwoCount = 0;
let totalCandidateThreeCount = 0;

await d3.json(APIurl, (error, data) => {

	console.log(data);

	lengthOfData = Object.keys(data["data"]).length;

	date = new Date(data["timestamp"] * 1000)

	Object.keys(data["data"]).forEach(obj => {
		if(data["data"][obj]["paslon_1_count"] !== "") {
			totalCandidateOneCount += parseInt(data["data"][obj]["paslon_1_count"].replaceAll(".", ""));
		}

		if(data["data"][obj]["paslon_2_count"] !== "") {
			totalCandidateTwoCount += parseInt(data["data"][obj]["paslon_2_count"].replaceAll(".", ""));
		}

		if(data["data"][obj]["paslon_3_count"] !== "") {
			totalCandidateThreeCount += parseInt(data["data"][obj]["paslon_3_count"].replaceAll(".", ""));
		}
	})

	let totalAllCount = totalCandidateOneCount + totalCandidateTwoCount + totalCandidateThreeCount


	d3.select("#last_updated")
        .text(() => {
          return date;
        })

	d3.select("#paslon_1_count")
        .text(() => {
          return commaSeparate(totalCandidateOneCount);
        })

	d3.select("#paslon_1_percentage")
        .text(() => {
          return `${(totalCandidateOneCount/totalAllCount * 100).toFixed(2)}%`;
        })

	d3.select("#paslon_2_count")
        .text(() => {
          return commaSeparate(totalCandidateTwoCount);
        })

	d3.select("#paslon_2_percentage")
        .text(() => {
          return `${(totalCandidateTwoCount/totalAllCount * 100).toFixed(2)}%`;
        })

	d3.select("#paslon_3_count")
        .text(() => {
          return commaSeparate(totalCandidateThreeCount);
        })

	d3.select("#paslon_3_percentage")
        .text(() => {
          return `${(totalCandidateThreeCount/totalAllCount * 100).toFixed(2)}%`;
        })

	d3.json("src/assets/json/indonesia.json", (error, id) => {
		jsonFeatures = topojson.feature(id, id.objects.regions).features;

		for (let j = 0; j < jsonFeatures.length; j++) {

			voteData = data["data"][jsonFeatures[j]["properties"]["name"].toUpperCase()]
			

			Object.keys(data["data"]["ACEH"]).forEach(key => {
				try {
					if (voteData[key].includes("%")) {
						jsonFeatures[j]["properties"][key] = voteData[key]
					} else {
						jsonFeatures[j]["properties"][key] = parseInt(voteData[key].replaceAll(".", ""))
					}
					
				} catch (error) {
					console.log(error)
				}
			});
			
		}

		svg.selectAll(".province")
			.data(jsonFeatures)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "province")
			.attr("id", d => {
				// Create specific ID for each paths, so it will be easier for the on mouseover event
				return d["properties"]["postal"];
			})
			.style("fill", d => {

				if (d3.max([d["properties"]["paslon_1_count"], d["properties"]["paslon_2_count"], d["properties"]["paslon_3_count"]]) === d["properties"]["paslon_1_count"]) {
					return "#3C3D7C"
				} else if (d3.max([d["properties"]["paslon_1_count"], d["properties"]["paslon_2_count"], d["properties"]["paslon_3_count"]]) === d["properties"]["paslon_2_count"]) {
					return "#FFE770"
				} else if (d3.max([d["properties"]["paslon_1_count"], d["properties"]["paslon_2_count"], d["properties"]["paslon_3_count"]]) === d["properties"]["paslon_3_count"]) {
					return "#A3333D"
				} else {
					return "#CCCCCC"
				}
			}).style('stroke', 'black')
			.on("mouseover", d => {
  
			  let tempTotal = d["properties"]["paslon_1_count"] + d["properties"]["paslon_2_count"] + d["properties"]["paslon_3_count"]
			  let tempCandidateOnePercentage = ((d["properties"]["paslon_1_count"] / tempTotal) * 100).toFixed(2)
			  let tempCandidateTwoPercentage = ((d["properties"]["paslon_2_count"] / tempTotal) * 100).toFixed(2)
			  let tempCandidateThreePercentage = ((d["properties"]["paslon_3_count"] / tempTotal) * 100).toFixed(2)
  
			  // Tooltip will appear on mouseover
			  tooltip.html(`
				<div class="tooltip" tyle="display:flex; flex-direction: column;">
					<p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">
						${d["properties"]["name"].toUpperCase()}
					</p>
					<div style="display:flex; flex-direction: row; justify-content: space-between;">
						<div style="display:flex; flex-direction: column;">
							<p style="font-size: 20px; font-weight: bold; color: #3C3D7C">
								${tempCandidateOnePercentage}%
							</p>
							<p>
								${commaSeparate(d["properties"]["paslon_1_count"])}
							</p>
						</div>
						<div style="display:flex; flex-direction: column;">
							<p style="font-size: 20px; font-weight: bold; color: #B89900">
								${tempCandidateTwoPercentage}%
							</p>
							<p>
								${commaSeparate(d["properties"]["paslon_2_count"])}
							</p>
						</div>
						<div style="display:flex; flex-direction: column;">
							<p style="font-size: 20px; font-weight: bold; color: #A3333D">
								${tempCandidateThreePercentage}%
							</p>
							<p>
								${commaSeparate(d["properties"]["paslon_3_count"])}
							</p>
						</div>
					</div>
				</div>
			  `)
  
			  tooltip.style("visibility", "visible");
			})
			.on("mouseout", () => {
				tooltip.style("visibility", "hidden");
			})
			.on("mousemove", () => {
				tooltip.style("top", `${d3.event.clientY - 100}px`)
						.style("left", `${d3.event.clientX - 80}px`);    
			})
	})


})
