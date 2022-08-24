function map_place(d) {
    // custom mapping to get place.
    if (['pharyngeal', 'epiglottal'].includes(d.Place_of_Articulation)) {
        return 'pharyngeal'
    } else if (['dental;alveolar'].includes(d.Place_of_Articulation)) {
        return 'alveolar'
    } else if (['alveolo-palatal'].includes(d.Place_of_Articulation)) {
        return 'palatal'
    } else {
        return d.Place_of_Articulation
    }
}

function map_manner(d) {
    // custom mapping to get manner.
    if (['tap', 'flap'].includes(d.Manner_of_Articulation)) {
        return 'tap or flap'
    } else if (['lateral tap', 'lateral flap'].includes(d.Manner_of_Articulation)) {
        return 'lateral tap or flap'
    } else if (['fricative;approximant'].includes(d.Manner_of_Articulation)) {
        return 'fricative'
    } else if (['trill;approximant'].includes(d.Manner_of_Articulation)) {
        return 'trill'
    } else {
        return d.Manner_of_Articulation
    }
}
function get_consonant_class(d) {
    if (d.name.includes('click')) {
        return 'non-pulmonic'
    } else if (['ejective', 'implosive'].includes(d.Manner_of_Articulation)) {
        return 'non-pulmonic'
    } else if (['ɥ', 'w', 'ʍ'].includes(d.Symbol)) {
        return 'co-articulated'
    // these are pulmonic, but overlap the corresponding non-sibilant fricative
    // (which is the version in the official IPA chart),
    // so we ignore them
    } else if (['ɕ', "ʑ"].includes(d.Symbol)) {
        return 'sibilant fricative'
    } else if (d.Description == 'velarized') {
        return 'velarized'
    } else {
        return 'pulmonic'
    }
}

// Based originally on Calendar,
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
function IPAChart(data, {
    x = map_place, // given d in data, returns the x-value
    y = map_manner, // given d in data, returns the y-value
    title, // given d in data, returns the title text
    cellSize = 25, // width and height of an individual day, in pixels
    cellPadding = 1,
    yFormat, // format specifier string for values (in the title)
    marginTop = 80,
    marginLeft = 140,
} = {}) {
    // consonants all of place of articulation info, and that's what we make first
    consonants = data.filter(d => d.Place_of_Articulation !== '')
    // for now, just the pulmonic consonants
    consonants = consonants.filter(d => get_consonant_class(d) == 'pulmonic')
    // Compute values.
    const X = d3.map(consonants, x);
    const Voiced = d3.map(consonants, d => new Object({'': 'voiceless', 'voiceless': 'voiceless', 'voiced': 'voiced'})[d.Voicing]);
    const Y = d3.map(consonants, y);
    const I = d3.range(X.length);
    X_unique = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar',
                'retroflex', 'palatal', 'velar', 'uvular', 'pharyngeal', 'glottal']
    Y_unique = ['plosive', 'nasal', 'trill', 'tap or flap', 'lateral tap or flap',
                'fricative', 'lateral fricative', 'approximant', 'lateral approximant']

    // double cell width because each cell contains voiced and voiceless
    const width = 2 * (cellSize + cellPadding) * X_unique.length - cellPadding;
    // const width = 2 * (cellSize + cellPadding) * 1 - cellPadding;
    const height = (cellSize + cellPadding) * Y_unique.length - cellPadding;
    const color = d3.schemeCategory10.slice(2, 4);
    console.log(width, height)

    xScale = d3.scaleBand(X_unique, [0, width]).paddingInner(cellPadding).paddingOuter(0)
    voicedScale = d3.scaleBand(['voiceless', 'voiced'], [cellPadding, 2*cellSize + cellPadding]).padding(0)
    yScale = d3.scaleBand(Y_unique, [0, height]).paddingInner(cellPadding).paddingOuter(0)

    var xAxis = d3.axisTop(xScale)
    var yAxis = d3.axisLeft(yScale)

    // Compute titles.
    const T = d3.map(consonants, title);
    title = i => T[i];

    const svg = d3.select("#consonants")
                  // the extra cellsize + padding through here are necessary
                  // because of how scaleBand works: the final value of domain
                  // maps to the max of the output range (height). for our squares,
                  // that means they'll be off the edge of the chart, so we need
                  // to add extra space
                  .attr("width", width + marginLeft + 2*(cellSize + cellPadding))
                  .attr("height", height + marginTop + cellSize + cellPadding)
                  .attr("viewBox", [-marginLeft, -marginTop, width+marginLeft + 2*(cellSize + cellPadding),
                                    height + marginTop + 2*cellSize + cellPadding])
                  .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 10);

    font_size = 10
    const cell = svg.append('g')
                    .attr('id', 'consonant-container')
                       .selectAll("g")
                       .data(I)
                       .join('g')
                         .attr('id', i => T[i].replaceAll(' ', '-'))
                         .attr('font-family', 'sans-serif')
                         .attr('font-size', font_size)
                         .attr('our_x', i => X[i])
                         .attr('our_y', i => Y[i])
                         .attr('our_voiced', i => Voiced[i])
                         .attr("transform", i => `translate(${xScale(X[i]) + voicedScale(Voiced[i])}, ${yScale(Y[i])})`)

    cell.append("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("fill", i => 'red')
        .attr("fill-opacity", i => .2)
        .style('stroke', 'black')

    cell.append('text')
        .text(i => consonants[i].Symbol)
        .attr('x', cellSize/2)
        .attr('y', cellSize/2 + font_size/3)
        .attr('text-anchor', 'middle')

    svg.append("g")
       .attr('id', 'yaxis')
       .call(yAxis)
       .selectAll('text')
          .attr('y', 0)
          .attr('dy', cellSize/2 + font_size/2)
          .attr('x', -9)
          .style('text-anchor', 'end')

    // create a copy of the axis line and shift it forward by one tick
    second_tick = d3.select('#yaxis').selectAll('.tick').nodes()[1]
    translate_regex = /translate\(([\d.]+), ?([\d.]+)\)/
    second_tick_translate = translate_regex.exec(second_tick.attributes.transform.textContent)[2]
    d3.select('#yaxis').select('path').clone().attr('transform', `translate(0, ${second_tick_translate})`)

    svg.append("g")
       .attr('id', 'xaxis')
       .call(xAxis)
       .selectAll('text')
          .attr('y', 0)
          .attr('dy', cellSize + font_size / 2)
          .attr('x', 9)
          .style('text-anchor', 'start')
          .attr('transform', 'rotate(-90)')

    // create a copy of the axis line and shift it forward by one tick
    second_tick = d3.select('#xaxis').selectAll('.tick').nodes()[1]
    translate_regex = /translate\(([\d.]+), ?([\d.]+)\)/
    second_tick_translate = translate_regex.exec(second_tick.attributes.transform.textContent)[1]
    d3.select('#xaxis').select('path').clone().attr('transform', `translate(${second_tick_translate}, 0)`)


    if (title) cell.append("title")
                   .text(title);

    return Object.assign(svg.node(), {scales: {color}});
}
