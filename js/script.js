
// global variables
let allData = []
let currentCity = 'Atlanta'
const t = 600 

//map city names to Metropolitan Statistical Areas labels
const msaNames = {
  'Atlanta':      'Atlanta-Sandy Springs-Alpharetta, GA',
  'Baltimore':    'Baltimore-Columbia-Towson, MD',
  'New York City':'New York-Newark-Jersey City, NY-NJ-PA',
  'Oakland':      'San Francisco-Oakland-Berkeley, CA',
  'Washington':   'Washington-Arlington-Alexandria, DC-VA-MD-WV'
}

const margin = { 
    top: 50, 
    right: 20, 
    bottom: 60, 
    left: 70 
}
const width  = 380 - margin.left - margin.right
const height = 380 - margin.top  - margin.bottom 
 
// scales, for both charts
const xScale = d3.scaleBand()
    .domain(['Black', 'White', 'Hispanic', 'Asian', 'Native'])
    .range([0, width])
    .padding(0.35)
 
const yScale = d3.scaleLinear()
    .domain([-32, 25])
    .range([height, 0])

const svgLeft  = buildChart('#vis-left')
const svgRight = buildChart('#vis-right')
 
//build an empty svg with axes
//used to build both left and right graphs
function buildChart(containerId) {
    const svg = d3.select(containerId)
        .append('svg')
        .attr('width',  width  + margin.left + margin.right)
        .attr('height', height + margin.top  + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
 
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .call(g => g.select('.domain').remove())
        .selectAll('text')
            .attr('dy', '1.2em')
            .style('font-size', '12px')
            .style('fill', '#888')
 
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale)
            .ticks(6)
            .tickFormat(d => (d > 0 ? '+' : '') + d + '%'))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
            .attr('stroke', '#e5e5e5')
            .attr('x2', width))
        .selectAll('text')
            .style('font-size', '11px')
            .style('fill', '#888')
 
    svg.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', yScale(0)).attr('y2', yScale(0))
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1.5)
 
    return svg
}
 
 
// updates MSA label, filters data for selected city, draws and animates bars for both graphs
function updateVis() {
    document.getElementById('msa-label').textContent =
        'Census data from: ' + msaNames[currentCity]

    const gentrified = allData.filter(d =>
        d.city === currentCity && d.status === 'Gentrified'
    );

    const eligible = allData.filter(d =>
        d.city === currentCity && d.status === 'Eligible, not gentrified'
    );

    //draws left graph, gentrified tracts
    svgLeft.selectAll('.bar')
        .data(gentrified, d => d.race_group)
        .join(
            function(enter) {
                return enter
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', d => xScale(d.race_group))
                    .attr('width', xScale.bandwidth())
                    .attr('rx', 4)
                    .attr('y', yScale(0))
                    .attr('height', 0)
                    .attr('fill', d => d.avg_pct_change < 0 ? '#E24B4A' : '#378ADD')
                    .on('mouseover', function(event, d) { // tooltip shows race group, percent change, and tract count
                        d3.select('#tooltip')
                            .style('display', 'block')
                            .html(`<strong>${d.race_group}</strong><br>
                                   ${d.avg_pct_change > 0 ? '+' : ''}${d.avg_pct_change.toFixed(1)} pp<br>
                                   <span style="color:#999">${d.tract_count} tracts</span>`)
                            .style('left', (event.pageX + 12) + 'px')
                            .style('top', (event.pageY - 28) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.select('#tooltip').style('display', 'none');
                    })
                    .transition()
                    .duration(t)
                    .attr('y', d => d.avg_pct_change >= 0 ? yScale(d.avg_pct_change) : yScale(0))
                    .attr('height', d => Math.abs(yScale(d.avg_pct_change) - yScale(0)));
            },
            function(update) {
                return update
                    .transition()
                    .duration(t)
                    .attr('x', d => xScale(d.race_group))
                    .attr('width', xScale.bandwidth())
                    .attr('y', d => d.avg_pct_change >= 0 ? yScale(d.avg_pct_change) : yScale(0))
                    .attr('height', d => Math.abs(yScale(d.avg_pct_change) - yScale(0)))
                    .attr('fill', d => d.avg_pct_change < 0 ? '#E24B4A' : '#378ADD');
            },
            function(exit) {
                return exit
                    .transition()
                    .duration(t)
                    .attr('y', yScale(0))
                    .attr('height', 0)
                    .remove();
            }
        );

    //same code as above but for the right graph, eligible but not gentrified tracts
    svgRight.selectAll('.bar')
        .data(eligible, d => d.race_group)
        .join(
            function(enter) {
                return enter
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', d => xScale(d.race_group))
                    .attr('width', xScale.bandwidth())
                    .attr('rx', 4)
                    .attr('y', yScale(0))
                    .attr('height', 0)
                    .attr('fill', d => d.avg_pct_change < 0 ? '#E24B4A' : '#378ADD')
                    .on('mouseover', function(event, d) {
                        d3.select('#tooltip')
                            .style('display', 'block')
                            .html(`<strong>${d.race_group}</strong><br>
                                   ${d.avg_pct_change > 0 ? '+' : ''}${d.avg_pct_change.toFixed(1)} pp<br>
                                   <span style="color:#999">${d.tract_count} tracts</span>`)
                            .style('left', (event.pageX + 12) + 'px')
                            .style('top', (event.pageY - 28) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.select('#tooltip').style('display', 'none');
                    })
                    .transition()
                    .duration(t)
                    .attr('y', d => d.avg_pct_change >= 0 ? yScale(d.avg_pct_change) : yScale(0))
                    .attr('height', d => Math.abs(yScale(d.avg_pct_change) - yScale(0)));
            },
            function(update) {
                return update
                    .transition()
                    .duration(t)
                    .attr('x', d => xScale(d.race_group))
                    .attr('width', xScale.bandwidth())
                    .attr('y', d => d.avg_pct_change >= 0 ? yScale(d.avg_pct_change) : yScale(0))
                    .attr('height', d => Math.abs(yScale(d.avg_pct_change) - yScale(0)))
                    .attr('fill', d => d.avg_pct_change < 0 ? '#E24B4A' : '#378ADD');
            },
            function(exit) {
                return exit
                    .transition()
                    .duration(t)
                    .attr('y', yScale(0))
                    .attr('height', 0)
                    .remove();
            }
        );
}  

//dropdown to update selected city
function setupSelector() {
    d3.select('#citySelect')
        .on('change', function() {
            currentCity = this.value
            updateVis()
        })
} 

//definitions used for tooltips on titles
const definitions = {
  'gentrified': 'A gentrified tract started as a lower-income neighborhood in 2000 (bottom 40% for both income and home value in its metro area) and by 2017 had home values and college-educated resident rates rise into the top third of the metro area.',
  'eligible': 'An eligible tract met the same low-income criteria in 2000 but did not see the same rises in home value or education by 2017. By the criteria, it could have gentrified but did not.'
}

//tooltips for titles
d3.selectAll('.extra-info')
    .on('mouseover', function(event) {
        const key = d3.select(this).attr('data-key')
        d3.select('#tooltip')
            .style('display', 'block')
            .html(definitions[key])
            .style('left', (event.pageX + 12) + 'px')
            .style('top',  (event.pageY - 28) + 'px')
    })
    .on('mouseout', function() {
        d3.select('#tooltip').style('display', 'none')
}) 

function init() {
    d3.csv('data/gentrification_transformed_final.csv')
        .then(data => {
            data.forEach(d => {
                d.avg_pct_change = +d.avg_pct_change
                d.tract_count    = +d.tract_count
            })
            allData = data
            setupSelector()
            updateVis()
        })
        .catch(error => console.error('Error loading data:', error))
}

 
window.addEventListener('load', init)