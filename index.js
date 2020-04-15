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
    
    // Create map UI
    var datamap = new Datamap({
        scope: "usa",
        element: document.getElementById("map"),
        responsive: true,
        data: map_data,
        
    });
}