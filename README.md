# Visualization Tool for COVID-19
###### Final Project for CMSC498O at University of Maryland College Park. 
###### Group Members: Julia Caldiera, Leah Kelley, Samantha Levin, Jonathan Saewitz

## Context

Our project will be working with the COVID-19 dataset provided by Johns Hopkins CSSE: https://github.com/CSSEGISandData/COVID-19 as well as State Population Totals and Components of Change: 2010-2019, from the US Census Bureau: https://www.census.gov/data/tables/time-series/demo/popest/2010s-state-total.html. 

Since our country is being affected by the coronavirus pandemic, we aim to create an interactive visualization tool to display data related to COVID-19 in the United States, utilizing good visualization practices learned from class. We hope this visualization tool will inform people about the scale of this pandemic and encourage them to follow quarantine guidelines seriously in order to prevent the spread of the coronavirus. 


## Comparison with Current Offerings

Currently, there is an interactive visualization map created by Wikipedia that displays the world map highlighted in different hues of blue showcasing the number of cases per 1 million people. The visual also allows you to click on a specific region/country and see details of which areas are more affected by the coronavirus than others. There are also size encodings that display larger circles if a specific area has a higher number of cases whereas smaller circles indicate a lower number of cases. Additionally, the visualization includes a scrollbar table that lists out many attributes corresponding to its specific location, they include number of confirmed cases, cases per 1M people, number of people recovered, and number of deaths. Overall, this interactive visualization tool is great in displaying the spread of the coronavirus. Yet, it lacks a day-by-day or week-by-week time basis in displaying the overwhelming increase of the virus. Additionally, it does not emphasize the numbers of deaths vs the population of that specific region/country. 


## New Ideas

The first major aspect is an interactive map of the United States. Each state will be color-coded according to the percentage of its population that has tested positive for COVID-19. A darker color will mean a higher percentage of confirmed cases, while a lighter color means a lower percentage of confirmed cases. Users of this tool will be able to hover over a state on the map to see various statistics about the state, including the 2019 population of the state, the number of people who have recovered, the number of people who are infected, and the number of people who have died.

Another important aspect we aim to create with this tool is a chart where the user can see the age statistics of number infected, number recovered, or number of deaths, either in a chosen area or across the entire country. Our data relating to COVID-19 will come from a GitHub repository created by Johns Hopkins University Center for Systems Science and Engineering, which contains daily updates on COVID-19 confirmed cases, deaths, and recovery numbers. For state population numbers our data will come from the US Census Bureau’s state population totals from July 2019.   


## Underserved Audience Goals

This project addresses several issues identified with the John Hopkins COVID-19 Visualization that would keep Americans from effectively using the tool. The issues identified are that their graph only shows the number of cases with no information about how many people actually live in a given area, and that areas of their marks scaling with the number of cases leads to too many overlapping points which make it hard to see data for specific areas of the US. Our tool will address these issues and make it easier for somebody to see percentages of COVID-19 cases in their hometown or state. 


## Timeline

Since we have not set specific dates, we are doing the following in a sequential order:
1.   Brainstorm ideas to create a better visualization
2.   Collect additional datasets from reliable sources
3.   Discuss the work each member should contribute and split the work evenly
4.   Each member works while creating their own branches and merging progress on GitHub (simultaneously communicating with each other for any additional help or ideas)
5.   Run tests

