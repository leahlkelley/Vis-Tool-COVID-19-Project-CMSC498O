
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
    $(".map-legend").html("");

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

// console.log(map_data)
    Object.keys(map_data).forEach(state => {
        map_data[state].fillKey = map_data[state].confirmed;
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
                        .domain([0, 500, 1000, 5000, 10000, 50000, 100000, 200000, 300000])
                        .range(d3v5.schemeReds[9])

    var casesAndColor = {};
     Object.keys(map_data).forEach(state => {
        casesAndColor[map_data[state].confirmed] = colors(map_data[state].confirmed)
    });

                    

    // Create map UI
    var datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        fills: casesAndColor,
        geographyConfig: {
            borderColor: '#FFFFFF',
            popupTemplate: function(geo, data) {
                //console.log(data);
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


    legend({
        color: d3.scaleThreshold([100, 500, 1000, 5000, 10000, 50000, 100000, 200000, 300000], d3v5.schemeReds[9]),
        title: "Number of Confirmed COVID-19 Cases",
        tickFormat: ",.2r"
      })

}

// Line chart for selected state
function createLineChart(map_data, state) {
    // set the dimensions 
    var width = document.getElementById("vis").getAttribute("width");
    var height = document.getElementById("vis").getAttribute("height");

    var vis = d3.select("#vis").attr("width", width).attr("height", height);
    var margins = { top: 20, bottom: 50, left: 50, right: 10 };

    /* x -> date/time
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

/** Legend for the DataMap */
function legend({
    color,
    title,
    tickSize = 6,
    width = 400, 
    height = 50 + tickSize,
    marginTop = 18,
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
          .attr("fill", d => d);
  
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
          .attr("")
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
