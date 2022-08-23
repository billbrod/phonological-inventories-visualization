// Based originally on Calendar,
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
function IPAChart(data, {
    x = ([x]) => x, // given d in data, returns the x-value
    y = ([, y]) => y, // given d in data, returns the y-value
    title, // given d in data, returns the title text
    cellSize = 17, // width and height of an individual day, in pixels
    cellPadding = 1,
    yFormat, // format specifier string for values (in the title)
    marginTop = 80,
    marginLeft = 140,
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Voiced = d3.map(data, d => d.Voicing);
    const Y = d3.map(data, y);
    const I = d3.range(X.length);
    X_unique = ['bilabial', 'labio-dental', 'linguo-labial', 'dental', 'alveolar', 'post-aveolar',
                'retroflex', 'palatal', 'velar', 'uvular', 'pharyngeal', 'glottal']
    Y_unique = Array(... new Set(Y))

    // double it for voiced and voiceless
    const width = 2 * (cellSize + cellPadding) * X_unique.length - cellPadding;
    const height = (cellSize + cellPadding) * Y_unique.length - cellPadding;
    const color = d3.schemeCategory10.slice(2, 4);

    xScale = d3.scaleBand(X_unique, [0, width]).padding(cellPadding)
    voicedScale = d3.scaleBand(['voiceless', 'voiced'], [0, 2*cellSize])
    yScale = d3.scaleBand(Y_unique, [-cellSize, height]).padding(cellPadding)

    var xAxis = d3.axisTop(xScale)
    var yAxis = d3.axisLeft(yScale)

    console.log(d3.map(I, i => Y[i]))
    console.log(d3.map(I, i => yScale(Y[i])))

    // Compute titles.
    if (title !== undefined) {
        const T = d3.map(data, title);
        title = i => T[i];
    }

    const svg = d3.select("#consonants")
                  .attr("width", width + marginLeft)
                  .attr("height", height + marginTop)
                  .attr("viewBox", [-marginLeft, -marginTop, width, height])
                  .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 10);

    const cell = svg.append("g")
                     .selectAll("rect")
                     .data(I)
                     .join("rect")
                     .attr("width", cellSize - 1)
                     .attr("height", cellSize - 1)
                     .attr("x", i => xScale(X[i]) + voicedScale(Voiced[i]))
                     .attr("y", i => yScale(Y[i]))
                     .attr("fill", i => color[0]);

    svg.append("g")
       .attr("transform", `translate(0, ${cellSize})`)
       .call(yAxis)
       .selectAll('text')
       .attr('y', 0)
       .attr('dy', '-.5em')
       .attr('x', -9)
       .attr('dx', '0em')
       .style('text-anchor', 'end')
    svg.append("g")
       .attr("transform", `translate(0, 0)`)
       .call(xAxis)
       .selectAll('text')
       .attr('y', 0)
       .attr('dy', '2em')
       .attr('x', 9)
       .attr('dx', '0em')
       .style('text-anchor', 'start')
       .attr('transform', 'rotate(-90)')

    if (title) cell.append("title")
                   .text(title);

    return Object.assign(svg.node(), {scales: {color}});
}
