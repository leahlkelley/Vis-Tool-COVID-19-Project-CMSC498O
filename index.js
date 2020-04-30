const state_abbrevs = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"};
const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const years = {"2010":1, "2011": 2, "2012": 3, "2013": 4, "2014": 5, "2015": 6, "2016": 7, "2017": 8, "2018": 9, "2019": 10, "2020": 10}

var data = [];
var state_data = {};
var pop = [];
var year;

Papa.parsePromise = function(date) {
    var file = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/` +
        `csse_covid_19_daily_reports/${date}.csv`;
    return new Promise(function(complete, error) {
        Papa.parse(file, {download: true, complete, error});
    })
}

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
    Papa.parsePromise($('#date').val()).then(function(results) {
        createMap(results.data);
    });
});

function updateMap() {
    // Delete old map
    $("#map").html("");

    // Load data for date
    Papa.parsePromise($('#date').val()).then(function(results) {
        createMap(results.data);
    });
}

function loadData() {
   var population_data = Papa.parse(`https://raw.githubusercontent.com/samanthalevin1/finalproject/master/nst-est2019-01.csv`, {
      download: true,
      complete: function(results, file){
        pop = results.data;
       }
     });
}

function createMap(data) {
    // Create map data
    var map_data = {};

    // Create legend titles
    var legendTitles = [];


    var totalConfirmed = 0;
    var totalDeaths = 0;

    STATE_INDEX = 2;
    CONFIRMED_INDEX = 7;
    DEATHS_INDEX = 8;

    if (moment($('#date').val()) <= moment('2020-03-09')) {
        STATE_INDEX = -1;
        CONFIRMED_INDEX = 3;
        DEATHS_INDEX = 4;
    }
    else if (moment($('#date').val()) <= moment('2020-03-21')) {
        STATE_INDEX = 0;
        CONFIRMED_INDEX = 3;
        DEATHS_INDEX = 4;
        console.log(1)
    }

    for (var state in state_abbrevs) {
        map_data[state_abbrevs[state]] = {'confirmed': 0, 'deaths': 0};
    };

    data.forEach(state => {
        var stateAbbrev;

        if (STATE_INDEX === -1) {
            var cityStateData = state[0].split(',');
            stateAbbrev = cityStateData[cityStateData.length - 1].trim();
        }
        else {
            stateAbbrev = state_abbrevs[state[STATE_INDEX]]; 
        }

        if (Object.values(state_abbrevs).indexOf(stateAbbrev) !== -1) {
            console.log(1)
            map_data[stateAbbrev].confirmed += Number(state[CONFIRMED_INDEX]);
            map_data[stateAbbrev].deaths += Number(state[DEATHS_INDEX]);

            totalConfirmed += Number(state[CONFIRMED_INDEX]);
            totalDeaths += Number(state[DEATHS_INDEX]);
        }
    });

    console.log(map_data)

    // Add population data to the map
    // pop.forEach(s => {
    //     if (!map_data[state_abbrevs[s[0]]]) {
    //         map_data[state_abbrevs[s[0]]] = {};
    //     }
    //     map_data[state_abbrevs[s[0]]].population = s[years[year]];
    // });

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
                var date = moment(new Date(($("#date").val()))).format('MM-DD-YYYY');
                var weeklyData = [];
                var promises = [];
                for (var i = 0; i < 7; i++) {
                    promises.push(Papa.parsePromise(date).then(function(results) {
                        var dailyData = {};
                        results.data.forEach(curState => {
                            if (curState[2] === state.properties.name) {
                                if (!dailyData.confirmed) {
                                    dailyData = {"confirmed": 0, "deaths": 0};
                                }
                                
                                dailyData.confirmed += Number(curState[7]);
                                dailyData.deaths += Number(curState[8]);
                            }
                        });
                        weeklyData.push({'confirmed': dailyData.confirmed, 'deaths': dailyData.deaths, 'date': moment(results.data[2][4].substring(0, 10)).format('MM-DD-YYYY')});
                    }));
                    date = moment(date).subtract(1, 'day').format('MM-DD-YYYY');
                }

                Promise.all(promises).then(values => {
                    createLineChart(weeklyData, state.properties.name);
                });
            });
        }
    });

    // Create legend
    var width = document.getElementById("map").getAttribute("width");
    var height = document.getElementById("map").getAttribute("height");
    var svg = d3.select("svg");

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
function createLineChart(map_data, state) {
    // set the dimensions 
    var width = document.getElementById("vis").getAttribute("width");
    var height = document.getElementById("vis").getAttribute("height");

    var vis = d3.select("#vis").attr("width", width).attr("height", height);
    var margins = { top: 20, bottom: 50, left: 50, right: 10 };

    /** Jonathan, the scales are a bit off (domain and range)
     * x -> date/time
     * y -> population
     */
    var xScale = d3.time.scale()
                .domain(d3.extent(map_data.map(d => new Date(d.date))))
                .range([margins.left, width - margins.right]);
    var yScale = d3.scale.linear()
                .domain([0, d3.max(map_data.map(d => d.confirmed))])
                .range([height - margins.top - margins.bottom, 0]);
    // Create line for the following: deaths, confirmed, recovered    
    var death_line = d3.svg.line()
        .x(function(d) { return xScale(new Date(d.date));})
        .y(function(d) { return yScale(d.deaths); });

    var confirmed_line = d3.svg.line()
        .x(function(d) { return xScale(new Date(d.date));})
        .y(function(d) { return yScale(d.confirmed); });

    var recovered_line = d3.svg.line()
        .x(function(d) { return xScale(new Date(d.date));})
        .y(function(d) { return yScale(d.recovered); });
    // Add path for the following: deaths, confirmed, recovered 
    vis.append("path")
      .datum(map_data)
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", death_line);

    vis.append("path")
      .datum(map_data)
      .attr("class", "line")
      .style("stroke", "blue")
      .attr("d", confirmed_line);

    vis.append('g')
        // .attr('transform', 'translate(0, ' + height + ')')
        .call(d3.axisBottom().scale(xScale))

    // vis.append("path")
    //   .data(map_data[state])
    //   .attr("class", "line")
    //   .style("stroke", "green")
    //   .attr("d", recovered_line);

    // Add appropriate labels for x and y axis 
}