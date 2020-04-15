const state_abbreviations = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"};


var minYear = -1;
var maxYear = -1;
var data = [];
var state_data = {};

function onload() {
    d3.json("http://localhost:8080/LeadingCausesofDeath.json", function(receivedData) {
        data = receivedData;

        years = [];
        data.forEach(d => years.push(d.Year));

        minYear = d3.min(years);
        maxYear = d3.max(years);

        createDropdownMenu();
        createMap(maxYear);
    });
}

function createDropdownMenu() {
    var select = document.getElementById("year");

    for (var i = minYear; i <= maxYear; i++){
        select.innerHTML += `<option value="${i}">${i}</option>`;
    }

    select.selectedIndex = select.options.length - 1;
}

function updateMapToYear() {
    var select = document.getElementById("year");
    var year = select.options[select.selectedIndex].text;

    // Delete old map
    document.getElementById("map").innerHTML = "";
    
    createMap(year);
}

function createMap(year) {
    // (Re)initialize state_data
    state_data = {};

    // Get data for selected year and sort by state
    var year_data = [];
    data.forEach(e => {
        if (e.Year == year && e.State in state_abbreviations) {
            if (!(e.State in state_data))
                state_data[e.State] = [];

            state_data[e.State].push(e);
        }
    });
    
    // Create map data
    var map_data = {};

    // Calculate total deaths for each state
    Object.keys(state_data).forEach(s => {
        var deaths = 0;
        var death_rate = 0.0;

        state_data[s].forEach(d => {
            deaths += d.Deaths;
            death_rate += d["Age-adjusted Death Rate"];
        });

        map_data[state_abbreviations[s]] = {};
        map_data[state_abbreviations[s]].totalDeaths = deaths;
        map_data[state_abbreviations[s]].averageDeathRate = death_rate / state_data[s].length;
    });

    // Create map UI
    var datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        geographyConfig: {
            popupTemplate: function(geo, data) {
                var popup = [`<div class="hoverinfo"><strong>${geo.properties.name}</strong><br>Total # of deaths: ${data.totalDeaths}` + 
                            `<br>Average age-adjusted death rate: ${data.averageDeathRate.toFixed(2)}</div>`];

                return popup;
            }
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geo) {
                
                alert(geo.properties.name);
            });
        }
    });
}