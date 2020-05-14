
const state_abbrevs = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"};
const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const years = {"2010":1, "2011": 2, "2012": 3, "2013": 4, "2014": 5, "2015": 6, "2016": 7, "2017": 8, "2018": 9, "2019": 10, "2020": 10}

var data = [];
var state_data = {};
var county_data = {};
var pop = {};
var year;
var datamap;

// loading COVID data from github
Papa.parsePromise = function(date) {

    var file = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/` +
        `csse_covid_19_daily_reports/${date}.csv`;
    return new Promise(function(complete, error) {
        Papa.parse(file, {download: true, complete, error});
    })
}

// Load/parse county data
function loadCountyData() {
  Papa.parse('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv', {download: true, complete: function(results) {
    console.log(results.data)
    results.data.forEach(record => {
      if (!county_data[record[0]])
        county_data[record[0]] = {};

      if (!county_data[record[0]][record[2]])
        county_data[record[0]][record[2]] = [];
      
      county_data[record[0]][record[2]].push({county: record[1], cases: Number(record[4]), deaths: Number(record[5])});  
    });
  }});
}


$( function() {
     $("#visual").dialog( {
        autoOpen: false,
        show: true,
        modal: true,
        draggable: false,
        resizable: false,
        minWidth: 1100,
        minHeight: 650
    });

    // Load county data
    loadCountyData();

    // Init datepicker
    $("#date").datepicker({
        dateFormat: "mm-dd-yy",
        defaultDate: "-1",
        maxDate: "-1",
        minDate: "01-22-2020"
    });

    // Set date to yesterday's date
    $("#date").datepicker("setDate", "-1");

    // Load population data and create map
    loadData();
});

function updateMap() {
        // create a new map, start by loading data for that date
        Papa.parsePromise($('#date').val()).then(function(results) {
            if (document.getElementById("map-type").value == "confirmed") {
              console.log("make confirmed map")
              createMap(results.data);
              
            } else {
              console.log("make deaths map")
              createDeathMap(results.data);
            }
        });
}



function loadData() {
  d3.json("https://datausa.io/api/data?drilldowns=State&measures=Population&year=2018", function(receivedData){
    // Format pop data and place in pop object
    receivedData.data.forEach(state => pop[state.State] = state.Population);
    console.log(pop)
    // Load data for date and create map
    Papa.parsePromise($('#date').val()).then(function(results) {
        createMap(results.data);
    });
  });
}

//date slider d3v3 based on: http://bl.ocks.org/zanarmstrong/ddff7cd0b1220bc68a58
var sliderMargin = {top:25, right:50, bottom:25, left:50},
    width = 950 - sliderMargin.left - sliderMargin.right,
    height = 75 - sliderMargin.top - sliderMargin.bottom;

var formatDate = d3.time.format("%b %d");
var formatDateForJQuery = d3.time.format("%m-%d-%Y")
var formatDateForCounty = d3.time.format("%Y-%m-%d")
var startDate = new Date("2020-01-23");
var endDate = new Date();
endDate.setDate(endDate.getDate()-1);
console.log(formatDateForJQuery(startDate))

var timeScale = d3.time.scale()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true);
var startValue = timeScale(endDate),
    startingValue = endDate;


var brush = d3.svg.brush()
    .x(timeScale)
    .extent([startingValue, startingValue])
    .on("brush", brushed);

var svgSlider = d3.select("#date-slider").append("svg")
    .attr("width", width + sliderMargin.left + sliderMargin.right)
    .attr("height", height + sliderMargin.top + sliderMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + sliderMargin.left + "," + sliderMargin.top + ")");

svgSlider.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
    .scale(timeScale)
    .orient("bottom")
    .tickFormat(function(d) {
      return formatDate(d);
    }))
    .select(".domain")
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");

var slider = svgSlider.append("g")
    .attr("class", "slider")
    .call(brush);

  slider.selectAll(".extent,.resize")
    .remove();

  slider.select(".background")
    .attr("height", height);

  var handle = slider.append("g")
    .attr("class", "handle")

  handle.append("path")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("d", "M 0 -18 V 18")

  handle.append('text')
    .text(startingValue)
    .attr("class", "date-slider-text")
    .attr("transform", "translate(" + (-18) + " ," + (height / 2 - 25) + ")");

  slider
    .call(brush.event)


function brushed() {
    var value = brush.extent()[0];

    if (d3.event.sourceEvent) { // not a programmatic event
        value = timeScale.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
    }

    handle.attr("transform", "translate(" + timeScale(value) + ",0)");
    handle.select('text').text(formatDate(value));
    document.getElementById("date").value = `${formatDateForJQuery(value)}`
    updateMap();

}

//end date slider





//initial map creation
function createMap(data) {
    $(".map-legend").html("");
    $("#map").html("");
    // Create map data
    var map_data = {};
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
    }

    for (var state in state_abbrevs) {
        map_data[state_abbrevs[state]] = {'confirmed': 0, 'deaths': 0, 'population': pop[state]};
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
            // console.log(1)
            map_data[stateAbbrev].confirmed += Number(state[CONFIRMED_INDEX]);
            map_data[stateAbbrev].deaths += Number(state[DEATHS_INDEX]);


            // Add pop data to map_data
            // if (Object.keys(pop).includes(state[STATE_INDEX]))
            //   map_data[stateAbbrev].population = pop[state[STATE_INDEX]];

            totalConfirmed += Number(state[CONFIRMED_INDEX]);
            totalDeaths += Number(state[DEATHS_INDEX]);
        }
    });

    Object.keys(map_data).forEach(state => {
      if ( map_data[state].confirmed == 0) { 
        map_data[state].fillKey = 'ZERO'
      } else {
        map_data[state].fillKey = map_data[state].confirmed;
      }
        
    });

    $('#total-confirmed').html(totalConfirmed.toLocaleString());
    $('#total-deaths').html(totalDeaths.toLocaleString());


    //find the maximum and minimum number of cases
    var confirmedCasesNumbers = [];
    Object.keys(map_data).forEach(state => {
        map_data[state].confirmed
        confirmedCasesNumbers.push(map_data[state].confirmed);
    });
    confirmedCasesNumbers.sort(function(a, b) {
        return a - b})

    //create color scale for legend and map
    const colors = d3.scaleThreshold()
                        .domain([0, 500, 1000, 5000, 10000, 50000, 100000, 200000, 400000])
                        .range(d3v5.schemeReds[9])

    var casesAndColor = {};
     Object.keys(map_data).forEach(state => {
       if (map_data[state].fillKey == 'ZERO') {
         casesAndColor['ZERO'] = "#fff5f0"
       } else {
        casesAndColor[map_data[state].confirmed] = colors(map_data[state].confirmed);
       }
        
    });         

    // Create map UI
    datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        fills: casesAndColor,
        geographyConfig: {
            borderColor: '#a3a3a3',
            popupTemplate: function(geo, data) {
                //console.log(data);
                var popup = [`<div class="hoverinfo"><strong>${geo.properties.name}</strong><br>Confirmed cases: ${data.confirmed.toLocaleString()}` +
                            `<br>Deaths: ${data.deaths.toLocaleString()}` + `<br>Population(2018): ${data.population.toLocaleString()}</div>`];

                return popup;
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(state) {
              // Set model title
                $( "#visual" ).dialog( "option", "title", "Cases per County in " + state.properties.name);

                // Show model
                $("#visual").dialog("open");

                // Clear old chart
                $("#vis").html("");

                // Create popup box for each state
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
                    createBarChart(formatDateForCounty(new Date($('#date').val())), state.properties.name);
                });
            });
        }
    });


    legend({
        color: d3.scaleThreshold([100, 500, 1000, 5000, 10000, 50000, 100000, 200000, 400000], d3v5.schemeReds[9]),
        title: "Number of Confirmed COVID-19 Cases",
        tickFormat: ",.2r"
      })

}

//Bar graph displaying each county's case rate in selected state on selected day 
function createBarChart(date, state){
   // Get x-y data 
   var graph_data = county_data[date][state];
   graph_data.sort((a, b) => (a.cases > b.cases) ? -1 : 1);
    // set the dimensions
    var width = Object.keys(graph_data).length * 25;
    width = width > 900 ? width : 900;
    var height = document.getElementById("vis").getAttribute("height");

    var vis = d3v5.select("#vis").attr("width", width).attr("height", height);


    var margins = { top: 50, bottom: 70, left: 55, right: 10 };

    /**
     * Scales: xScale --> county name 
     *         yScale --> # of cases
     */

    var xScale = d3v5.scaleBand()
                .domain(graph_data.map(d => d.county))
                .range([margins.left, width - margins.right])
                .padding(0.5);
    
   var yScale = d3v5.scaleLinear()
                .domain([0, d3v5.max(graph_data.map(d => d.cases))])
                .range([height - margins.top - margins.bottom, 0]);

  // create the bars 
    vis.selectAll("rect")
        .data(graph_data)
        .enter()
        .append("rect")
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margins.top - margins.bottom - yScale(d.cases))
        .attr("x", d => xScale(d.county) + "px")
        .attr("y", d => margins.top + yScale(d.cases) + "px")
        .attr("fill", "darkred");
        
        
      vis.append("g")
        .attr("class", "bar-labels")
        .attr("fill", "black")
        .attr('text-anchor', 'start')
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("text")
        .data(graph_data)
        .join("text")
          .attr("transform", d => "translate(" +  (xScale(d.county) + xScale.bandwidth() / 2) + "," + (margins.top + yScale(d.cases) - 2) + ")rotate(-45)")
          .text(d => d.cases.toLocaleString());
    
    // add x-axis as a "g" element 
    vis.append("g")
      .attr("transform", `translate(0,${height - margins.bottom})`)
      .call(d3v5.axisBottom(xScale))
      .selectAll("text")
      .attr("x", -8)
      .attr("y", 8)
      .style("text-anchor", "end")
      .attr("dx", "-.08em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)");

    // Adds y-axis as a "g" element
    vis.append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`)
      .call(d3v5.axisLeft(yScale));

    // add appropriate labels    
    vis.append('text')
      .attr('text-anchor', 'middle')
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
      .attr("transform", "translate(" + (width / 2) + "," + (height) + ")")
      .text("Counties")
      .attr("fill", "darkred");

    vis.append('text')
      .attr('text-anchor', 'middle')
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
      // .attr("transform", "translate(" + 25 + "," + 10 + ")")
      .attr("transform", "translate(" + 10.3 + "," + (height / 2) + ")rotate(-90)")
      .text("Number of Cases")
      .attr("fill", "darkred");

    
}


/** Legend for the DataMap */
function legend({
    color,
    title,
    tickSize = 6,
    width = 400,
    height = 30 + tickSize,
    marginTop = 5,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {

    const svg = d3v5.select(".map-legend").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");

    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);

      x = color.copy().rangeRound(d3v5.quantize(d3v5.interpolate(marginLeft, width - marginRight), n));

      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.copy().domain(d3v5.quantize(d3v5.interpolate(0, 1), n))).toDataURL());
    }

    // Sequential
    else if (color.interpolator) {
      x = Object.assign(color.copy()
          .interpolator(d3v5.interpolateRound(marginLeft, width - marginRight)),
          {range() { return [marginLeft, width - marginRight]; }});

      svg.append("image")
          .attr("x", marginLeft)
          .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL());

      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3v5.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3v5.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }

    // Threshold
    else if (color.invertExtent) {
      const thresholds
          = color.thresholds ? color.thresholds() // scaleQuantize
          : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold

      const thresholdFormat
          = tickFormat === undefined ? d => d
          : typeof tickFormat === "string" ? d3.format(tickFormat)
          : tickFormat;

      x = d3v5.scaleLinear()
          .domain([-1, color.range().length - 1])
          .rangeRound([marginLeft, width - marginRight]);

      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
          .attr("x", (d, i) => x(i - 1))
          .attr("y", marginTop)
          .attr("width", (d, i) => x(i) - x(i - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", d => d)
          .attr("stroke-width", "1px")
          .attr("stroke", "black");

      tickValues = d3v5.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
      x = d3v5.scaleBand()
          .domain(color.domain())
          .rangeRound([marginLeft, width - marginRight]);

      svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
          .attr("x", x)
          .attr("y", marginTop)
          .attr("width", Math.max(0, x.bandwidth() - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", color);

      tickAdjust = () => {};
    }

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3v5.axisBottom(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("x", marginLeft)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(title));

  }

  function ramp(color, n = 256) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");
    d3.select(canvas).attr("width", n)
      .attr("height", 1);
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }






function createDeathMap(data) {

    $(".map-legend").html("");
    $("#map").html("");
    // Create map data
    var map_data = {};
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
    }

    for (var state in state_abbrevs) {
        map_data[state_abbrevs[state]] = {'confirmed': 0, 'deaths': 0, 'population': pop[state]};
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
            // console.log(1)
            map_data[stateAbbrev].confirmed += Number(state[CONFIRMED_INDEX]);
            map_data[stateAbbrev].deaths += Number(state[DEATHS_INDEX]);


            // Add pop data to map_data
            // if (Object.keys(pop).includes(state[STATE_INDEX]))
            //   map_data[stateAbbrev].population = pop[state[STATE_INDEX]];

            totalConfirmed += Number(state[CONFIRMED_INDEX]);
            totalDeaths += Number(state[DEATHS_INDEX]);
        }
    });

    Object.keys(map_data).forEach(state => {
      if ( map_data[state].deaths == 0) { 
        map_data[state].fillKey = 'ZERO'
      } else {
        map_data[state].fillKey = map_data[state].deaths;
      }
        
    });

    $('#total-confirmed').html(totalConfirmed.toLocaleString());
    $('#total-deaths').html(totalDeaths.toLocaleString());


    //find the maximum and minimum number of cases
    var confirmedCasesNumbers = [];
    Object.keys(map_data).forEach(state => {
        confirmedCasesNumbers.push(map_data[state].deaths);
    });
    confirmedCasesNumbers.sort(function(a, b) {
        return a - b})





    //create color scale for legend and map
    const colors = d3.scaleThreshold()
                        .domain([50,100,200,400,800,1600,3200,6400])
                        .range(d3v5.schemePurples[9])

    var casesAndColor = {};
     Object.keys(map_data).forEach(state => {
       if (map_data[state].fillKey == 'ZERO') {
         casesAndColor['ZERO'] = "#d9d9d9"
       } else {
        casesAndColor[map_data[state].deaths] = colors(map_data[state].deaths);
       }
        
    });         

    // Create map UI
    datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        fills: casesAndColor,
        geographyConfig: {
            borderColor: '#878787',
            popupTemplate: function(geo, data) {
                //console.log(data);
                var popup = [`<div class="hoverinfo"><strong>${geo.properties.name}</strong><br>Confirmed cases: ${data.confirmed.toLocaleString()}` +
                            `<br>Deaths: ${data.deaths.toLocaleString()}` + `<br>Population(2018): ${data.population.toLocaleString()}</div>`];

                return popup;
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(state) {
              // Set model title
                $( "#visual" ).dialog( "option", "title", "Cases per County in " + state.properties.name);

                // Show model
                $("#visual").dialog("open");

                // Clear old chart
                $("#vis").html("");

                // Create popup box for each state
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
                    createDeathsBarChart(formatDateForCounty(new Date($('#date').val())), state.properties.name);
                });
            });
        }
    });


    legend({
        color: d3.scaleThreshold([50,100,200,400,800,1600,3200,6400], d3v5.schemePurples[9]),
        title: "Number of Confirmed COVID-19 Cases",
        tickFormat: ",.2r"
      })

}


//Bar graph displaying each county's case rate in selected state on selected day 
function createDeathsBarChart(date, state){
  // Get x-y data 
  var graph_data = county_data[date][state];
  var yScale;
  graph_data.sort((a, b) => (a.deaths > b.deaths) ? -1 : 1);
   // set the dimensions
   var width = Object.keys(graph_data).length * 25;
   width = width > 900 ? width : 900;
   var height = document.getElementById("vis").getAttribute("height");

   var vis = d3v5.select("#vis").attr("width", width).attr("height", height);


   var margins = { top: 50, bottom: 70, left: 55, right: 10 };

   /**
    * Scales: xScale --> county name 
    *         yScale --> # of cases
    */

   var xScale = d3v5.scaleBand()
               .domain(graph_data.map(d => d.county))
               .range([margins.left, width - margins.right])
               .padding(0.5);
   

  if (d3v5.max(graph_data.map(d => d.deaths)) == 0) {
    console.log("0 as max")
    yScale = d3v5.scaleLinear()
      .domain([0, 10]).nice()
      .range([height - margins.top - margins.bottom, 0]);
  } else {
    yScale = d3v5.scaleLinear()
      .domain([0, d3v5.max(graph_data.map(d => d.deaths)) * 1.2]).nice()
      .range([height - margins.top - margins.bottom, 0]);
  }


 // create the bars 
   vis.selectAll("rect")
       .data(graph_data)
       .enter()
       .append("rect")
       .attr("width", xScale.bandwidth())
       .attr("height", d => height - margins.top - margins.bottom - yScale(d.deaths))
       .attr("x", d => xScale(d.county) + "px")
       .attr("y", d => margins.top + yScale(d.deaths) + "px")
       .attr("fill", "#54278f");
       
       
     vis.append("g")
       .attr("class", "bar-labels")
       .attr("fill", "black")
       .attr('text-anchor', 'start')
       .attr("font-family", "sans-serif")
       .attr("font-size", 10)
       .selectAll("text")
       .data(graph_data)
       .join("text")
         .attr("transform", d => "translate(" +  (xScale(d.county) + xScale.bandwidth() / 2) + "," + (margins.top + yScale(d.deaths) - 2) + ")rotate(-45)")
         .text(d => d.deaths.toLocaleString());
   
   // add x-axis as a "g" element 
   vis.append("g")
     .attr("transform", `translate(0,${height - margins.bottom})`)
     .call(d3v5.axisBottom(xScale))
     .selectAll("text")
     .attr("x", -8)
     .attr("y", 8)
     .style("text-anchor", "end")
     .attr("dx", "-.08em")
     .attr("dy", ".15em")
     .attr("transform", "rotate(-35)");

   // Adds y-axis as a "g" element
   vis.append("g")
     .attr("transform", `translate(${margins.left},${margins.top})`)
     .call(d3v5.axisLeft(yScale));

   // add appropriate labels    
   vis.append('text')
     .attr('text-anchor', 'middle')
     .attr("font-family", "sans-serif")
     .attr("font-size", 14)
     .attr("transform", "translate(" + (width / 2) + "," + (height) + ")")
     .text("Counties")
     .attr("fill", "#54278f");

   vis.append('text')
     .attr('text-anchor', 'middle')
     .attr("font-family", "sans-serif")
     .attr("font-size", 14)
     // .attr("transform", "translate(" + 25 + "," + 10 + ")")
     .attr("transform", "translate(" + 10.3 + "," + (height / 2) + ")rotate(-90)")
     .text("Number of Cases")
     .attr("fill", "#54278f");

   
}


function makePocMap() {
  d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv", function(d) {
    return {
      date: new Date(d["date"]),
      county: d["county"],
      state: d["state"],
      fips: +d["fips"],
      cases: +d["cases"],
      deaths: +d["deaths"],
    };
  }, function(error, rows) {
    

    //grab all the data from May 10th 2020 in New York
    let mayTenthNY = [];
    rows.forEach(r => 
      {
        if (r.state == "New York" && r.date.toLocaleDateString() == "5/10/2020") {
            mayTenthNY.push(r);
        }
      });

    //basic map config with custom fills, mercator projection
    var map = new Datamap({
      scope: 'subunits-ny',
      element: document.getElementById('container1'),
      projection: '',
      geographyConfig: {
        borderColor: '#a3a3a3',
        dataUrl: 'https://gist.githubusercontent.com/markmarkoh/8717334/raw/a226c312c4eb70de3ae3eed99e9337fb64edcee3/newyork-with-counties.json',
        popupTemplate: function(geo, data) {
            return ['<div class="hoverinfo"><strong>',
                    'Reported COVID-19 Cases in ' + geo.properties.name,
                    ': ' + data.cases.toLocaleString(),
                    '</strong></div>'].join('');
        }
      },
      setProjection: function(element) {
        var projection = d3.geo.equirectangular()
          .center([-72, 43])
          .rotate([4.4, 0])
          .scale(6000)
          .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        var path = d3.geo.path()
          .projection(projection);
        
        return {path: path, projection: projection};
      },
      fills: {
        Albany : '#006285',
        Allegany : '#53abd2',
        Broome : '#057da1',
        Cattaraugus : '#47a2c8',
        Cayuga : '#47a2c8',
        Chautauqua : '#51aad0',
        Chemung : '#3292b7',
        Chenango : '#3795bb',
        Clinton : '#419dc3',
        Columbia : '#1280a5',
        Cortland : '#59b1d8',
        Delaware : '#45a0c6',
        Dutchess : '#005375',
        Erie : '#004d6f',
        Essex : '#51aad1',
        Franklin : '#66bde4',
        Fulton : '#3796bb',
        Genesee : '#2a8cb1',
        Greene : '#2489ae',
        Hamilton : '#82d7ff',
        Herkimer : '#3f9cc1',
        Jefferson : '#449fc5',
        Lewis : '#70c6ed',
        Livingston : '#3997bd',
        Madison : '#1c85a9',
        Monroe : '#005e80',
        Montgomery : '#44a0c6',
        Nassau : '#002847',
        NewYorkCity : '#000e2b',
        Niagara : '#007296',
        Oneida : '#007195',
        Onondaga : '#006588',
        Ontario : '#3896bc',
        Orange : '#004060',
        Orleans : '#3292b7',
        Oswego : '#419dc3',
        Otsego : '#44a0c6',
        Putnam : '#00688b',
        Rensselaer : '#007b9f',
        Rockland : '#003b5b',
        Saratoga : '#007ba0',
        Schenectady : '#007498',
        Schoharie : '#4ea7ce',
        Schuyler : '#7ad0f7',
        Seneca : '#4ca6cc',
        StLawrence : '#278aaf',
        Steuben : '#2087ab',
        Suffolk : '#002947',
        Sullivan : '#00688b',
        Tioga : '#3896bc',
        Tompkins : '#3292b7',
        Ulster : '#006285',
        Warren : '#2288ad',
        Washington : '#2388ad',
        Wayne : '#3f9cc1',
        Westchester : '#002b4a',
        Wyoming : '#419dc3',
        Yates : '#61b8df',
        defaultFill: '#F5F5F5'},
      
      data: {
        '001': {fillKey: 'Albany', cases: `${mayTenthNY[0].cases}`},
        '003': {fillKey: 'Allegany', cases: `${mayTenthNY[1].cases}` },
        '005': {fillKey: 'NewYorkCity', cases: `${mayTenthNY[28].cases}`},
        '047': {fillKey: 'NewYorkCity', cases: `${mayTenthNY[28].cases}`},
        '081': {fillKey: 'NewYorkCity', cases: `${mayTenthNY[28].cases}`},
        '085': {fillKey: 'NewYorkCity', cases: `${mayTenthNY[28].cases}`},
        '007': {fillKey: 'Broome', cases: `${mayTenthNY[2].cases}` },
        '009': {fillKey: 'Cattaraugus', cases: `${mayTenthNY[3].cases}` },
        '011': {fillKey: 'Cayuga' , cases: `${mayTenthNY[4].cases}`},
        '013': {fillKey: 'Chautauqua' , cases: `${mayTenthNY[5].cases}`},
        '015': {fillKey: 'Chemung' , cases: `${mayTenthNY[6].cases}`},
        '017': {fillKey: 'Chenango' , cases: `${mayTenthNY[7].cases}`},
        '019': {fillKey: 'Clinton' , cases: `${mayTenthNY[8].cases}`},
        '021': {fillKey: 'Columbia' , cases: `${mayTenthNY[9].cases}`},
        '023': {fillKey: 'Cortland', cases: `${mayTenthNY[10].cases}` },
        '025': {fillKey: 'Delaware' , cases: `${mayTenthNY[11].cases}`},
        '027': {fillKey: 'Dutchess' , cases: `${mayTenthNY[12].cases}`},
        '029': {fillKey: 'Erie' , cases: `${mayTenthNY[13].cases}`},
        '031': {fillKey: 'Essex' , cases: `${mayTenthNY[14].cases}`},
        '033': {fillKey: 'Franklin' , cases: `${mayTenthNY[15].cases}`},
        '035': {fillKey: 'Fulton' , cases: `${mayTenthNY[16].cases}`},
        '037': {fillKey: 'Genesee' , cases: `${mayTenthNY[17].cases}`},
        '039': {fillKey: 'Greene' , cases: `${mayTenthNY[18].cases}`},
        '041': {fillKey: 'Hamilton' , cases: `${mayTenthNY[19].cases}`},
        '043': {fillKey: 'Herkimer' , cases: `${mayTenthNY[20].cases}`},
        '045': {fillKey: 'Jefferson' , cases: `${mayTenthNY[21].cases}`},
        '049': {fillKey: 'Lewis' , cases: `${mayTenthNY[22].cases}`},
        '051': {fillKey: 'Livingston' , cases: `${mayTenthNY[23].cases}`},
        '053': {fillKey: 'Madison' , cases: `${mayTenthNY[24].cases}`},
        '055': {fillKey: 'Monroe' , cases: `${mayTenthNY[25].cases}`},
        '057': {fillKey: 'Montgomery' , cases: `${mayTenthNY[26].cases}`},
        '059': {fillKey: 'Nassau' , cases: `${mayTenthNY[27].cases}`},
        '061': {fillKey: 'NewYorkCity' , cases: `${mayTenthNY[28].cases}`},
        '063': {fillKey: 'Niagara' , cases: `${mayTenthNY[29].cases}`},
        '065': {fillKey: 'Oneida' , cases: `${mayTenthNY[30].cases}`},
        '067': {fillKey: 'Onondaga' , cases: `${mayTenthNY[31].cases}`},
        '069': {fillKey: 'Ontario' , cases: `${mayTenthNY[32].cases}`},
        '071': {fillKey: 'Orange' , cases: `${mayTenthNY[33].cases}`},
        '073': {fillKey: 'Orleans' , cases: `${mayTenthNY[34].cases}`},
        '075': {fillKey: 'Oswego' , cases: `${mayTenthNY[35].cases}`},
        '077': {fillKey: 'Otsego' , cases: `${mayTenthNY[36].cases}`},
        '079': {fillKey: 'Putnam' , cases: `${mayTenthNY[37].cases}`},
        '083': {fillKey: 'Rensselaer' , cases: `${mayTenthNY[38].cases}`},
        '087': {fillKey: 'Rockland', cases: `${mayTenthNY[39].cases}` },
        '091': {fillKey: 'Saratoga' , cases: `${mayTenthNY[40].cases}`},
        '093': {fillKey: 'Schenectady', cases: `${mayTenthNY[41].cases}` },
        '095': {fillKey: 'Schoharie' , cases: `${mayTenthNY[42].cases}`},
        '097': {fillKey: 'Schuyler', cases: `${mayTenthNY[43].cases}` },
        '099': {fillKey: 'Seneca', cases: `${mayTenthNY[44].cases}` },
        '089': {fillKey: 'StLawrence', cases: `${mayTenthNY[45].cases}` },
        '101': {fillKey: 'Steuben', cases: `${mayTenthNY[46].cases}` },
        '103': {fillKey: 'Suffolk', cases: `${mayTenthNY[47].cases}` },
        '105': {fillKey: 'Sullivan', cases: `${mayTenthNY[48].cases}` },
        '107': {fillKey: 'Tioga', cases: `${mayTenthNY[49].cases}` },
        '109': {fillKey: 'Tompkins', cases: `${mayTenthNY[50].cases}` },
        '111': {fillKey: 'Ulster', cases: `${mayTenthNY[51].cases}` },
        '113': {fillKey: 'Warren', cases: `${mayTenthNY[52].cases}` },
        '115': {fillKey: 'Washington', cases: `${mayTenthNY[53].cases}` },
        '117': {fillKey: 'Wayne', cases: `${mayTenthNY[54].cases}` },
        '119': {fillKey: 'Westchester', cases: `${mayTenthNY[55].cases}` },
        '121': {fillKey: 'Wyoming', cases: `${mayTenthNY[56].cases}` },
        '123': {fillKey: 'Yates', cases: `${mayTenthNY[57].cases}` }
        }
    });
  }); 
}

makePocMap();