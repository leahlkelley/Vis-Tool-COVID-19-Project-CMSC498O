const state_abbrevs = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"};
const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const years = {"2010":1, "2011": 2, "2012": 3, "2013": 4, "2014": 5, "2015": 6, "2016": 7, "2017": 8, "2018": 9, "2019": 10, "2020": 10}

var data = [];
var state_data = {};
var pop = [];
var year;

$( function() {

     $("#visual").dialog( {
        autoOpen: false,
        show: true,
        modal: true,
        draggable: false,
        resizable: false,
        minWidth: 1000,
        minHeight: 550
    });

    // Init datepicker
    $("#date").datepicker({
        dateFormat: "mm-dd-yy",
        defaultDate: "-1",
        maxDate: "-1",
        minDate: "01-22-2020"
    });

    // Set date to yesterday's date
    $("#date").datepicker("setDate", "-1");

    // Load data for date
    loadData();
});

function updateMap() {
    // Delete old map
    $("#map").html("");

    // Load data for date
    loadData();
}

function loadData() {
  year = ($("#date").val()).substring(6);
//  console.log("year: "+ year);
   var population_data = Papa.parse(`https://raw.githubusercontent.com/samanthalevin1/finalproject/master/nst-est2019-01.csv`, {
      download: true,
      complete: function(results, file){
        pop = results.data;

       }
     });
    var result = Papa.parse(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/` +
        `csse_covid_19_daily_reports/${$("#date").val()}.csv`, {
        download: true,
        complete: function(results, file) {
	        data = results.data;

        createMap();
        }
    });
}

function createMap() {
    // Create map data
    var map_data = {};

    // Create legend titles
    var legendTitles = [];


    var totalConfirmed = 0;
    var totalDeaths = 0;

    data.forEach(state => {
        if (states.includes(state[2])) {
            if (!map_data[state_abbrevs[state[2]]]) {
                map_data[state_abbrevs[state[2]]] = {"confirmed": 0, "deaths": 0};
            }
            else {
                map_data[state_abbrevs[state[2]]].confirmed += Number(state[7]);
                map_data[state_abbrevs[state[2]]].deaths += Number(state[8]);

                totalConfirmed += Number(state[7]);
                totalDeaths += Number(state[8]);
            }
        }
    })
    console.log(map_data)

    // Add population data to the map
    pop.forEach(s => {
        if (s[0] !== "" && s[0] !== "Puerto Rico") {
            map_data[state_abbrevs[s[0]]].population = s[years[year]];
        }
    });

console.log(map_data)
    Object.keys(map_data).forEach(state => {
        // Create legend title
        var min = (Math.floor(Number(map_data[state].confirmed) / 10000.0) * 10000.0);
        var max = (Math.ceil(Number(map_data[state].confirmed) / 10000.0) * 10000.0);
        max = max == 0 ? 10000 : max;
        var legendTitle = min + " to " + max;
        map_data[state].fillKey = legendTitle;
        if (!legendTitles.includes(legendTitle))
            legendTitles.push(legendTitle);
    });
console.log(map_data)

    $('#total-confirmed').html(totalConfirmed.toLocaleString());
    $('#total-deaths').html(totalDeaths.toLocaleString());


    // Sort titles by start numbers
    legendTitles = legendTitles.sort((a, b) => parseInt(a.substring(0, a.indexOf(' '))) - parseInt(b.substring(0, b.indexOf(' '))));

    // Adjust for gaps in legend
    for (var i = 0; i < legendTitles.length - 1; i++) {
        var prev = parseInt(legendTitles[i].substring(legendTitles[i].lastIndexOf(' ')));
        var next = parseInt(legendTitles[i + 1].substring(0, legendTitles[i + 1].indexOf(' ')));
        var localLoops = 0;
        while (prev < next) {
            legendTitles.splice(i + 1 + localLoops++, 0, prev + " to " + (prev + 10000));
            prev += 10000;
        }
    }

    // Create fills object
    var fills = {};
    for (var i = 0; i < legendTitles.length; i++) {
        fills[legendTitles[i]] = "#00" + Math.floor(255 * (legendTitles.length - i) / legendTitles.length).toString(16) + "FF";
    }

    // Create map UI
    var datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        fills: fills,
        geographyConfig: {
            popupTemplate: function(geo, data) {
                console.log(data);
                var popup = [`<div class="hoverinfo"><strong>${geo.properties.name}</strong><br>Confirmed cases: ${data.confirmed}` +
                            `<br>Deaths: ${data.deaths}` + `<br>Population: ${data.population}</div>`];

                return popup;
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(state) {
              // Set modal title
                $( "#visual" ).dialog( "option", "title", "Deaths/Confirmed/Recovered in " + state.properties.name);
                
                // Show modal!
                $("#visual").dialog("open");

                // Clear old chart
                $("#vis").html("");

                // Create bar graph
                createLineChart(state.properties.name);  
            });
        }
    });

    // Create legend
    var width = document.getElementById("map").getAttribute("width");
    var height = document.getElementById("map").getAttribute("height");
    var svg = d3v5.select("svg");

    // Create dots
    svg.selectAll("dots")
    .data(legendTitles)
    .enter()
    .append("circle")
    .attr("cx", $("#map").width() - 170)
    .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", (d, i) => "#00" + Math.floor(255 * (legendTitles.length - i) / legendTitles.length).toString(16) + "FF");

    // Create labels
    svg.selectAll("labels")
    .data(legendTitles)
    .enter()
    .append("text")
    .attr("x", $("#map").width() - 160)
    .attr("y", function(d,i){ return 101 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    //.style("fill", function(d){ return color(d)})
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

    svg.append('text')
    .attr("x", $("#map").width() - 175)
    .attr("y", 80)
    .text("Confirmed Cases: ")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
}

// Line chart for selected state
function createLineChart(state) {

    // Get x-y data
    var graph_data = [];

    /** Jonathan, I do not think I pushed the population data 
     * in correctly -- this is used for the yScale
     */
    state_data[state].forEach(d => {
        graph_data.push({deaths: d["Deaths"], confirmed: d["Confirmed"], recovered: d["Recovered"], population: d["Population"], time: d["Time"]});
    });

    console.log(graph_data);

    // set the dimensions 
    var width = document.getElementById("vis").getAttribute("width");
    var height = document.getElementById("vis").getAttribute("height");

    var vis = d3v5.select("#vis").attr("width", width).attr("height", height);
    var margins = { top: 20, bottom: 50, left: 50, right: 10 };

    /** Jonathan, the scales are a bit off (domain and range)
     * x -> date/time
     * y -> population
     */
    var xScale = d3v5.scaleTime()
                .domain(d3v5.extent(graph_data, function(d) { return d.time; }))
                .range([margins.left, width - margins.right]);
    
    var yScale = d3v5.scaleLinear()
                .domain([0, d3v5.max(graph_data.map(d => d.population))])
                .range([height - margins.top - margins.bottom, 0]);

    // Create line for the following: deaths, confirmed, recovered    
    var death_line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.deaths); });

    var confirmed_line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.confirmed); });

    var recovered_line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.recovered); });

    // Add path for the following: deaths, confirmed, recovered 
    vis.append("path")
      .data(graph_data)
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", death_line);

    vis.append("path")
      .data(graph_data)
      .attr("class", "line")
      .style("stroke", "blue")
      .attr("d", confirmed_line);

    vis.append("path")
      .data(graph_data)
      .attr("class", "line")
      .style("stroke", "green")
      .attr("d", recovered_line);

    // Add appropriate labels for x and y axis 
}