'use strict';

const d3 = window.d3;

// Inspired by Lee Byron's test data generator.
function bumpLayer(n) {

    function bump(a) {
        var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
        for (var i = 0; i < n; i++) {
            var w = (i / n - y) * z;
            a[i] += x * Math.exp(-w * w);
        }
    }

    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < 5; ++i) bump(a);
    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}


const width = 960;
const height = 500;

// number of layers
const n = 20;
// number of samples per layer
const m = 200;
const stack = d3.layout.stack().offset('wiggle');
let layers0 = stack(d3.range(n).map(() => bumpLayer(m)));
let layers1 = stack(d3.range(n).map(() => bumpLayer(m)));

const scales = {
    x: d3.scale.linear()
        .domain([0, m - 1])
        .range([0, width]),

    y: d3.scale.linear()
        .domain([0, d3.max(layers0.concat(layers1), (layer)  => {
            return d3.max(layer, d => d.y0 + d.y);
        })])
        .range([height, 0]),

    color: d3.scale.linear()
        .range(['#aad', '#556']),
};

const area = d3.svg.area()
    .x(d => scales.x(d.x))
    .y0(d => scales.y(d.y0))
    .y1(d => scales.y(d.y0 + d.y));

const svg = d3.select('#viz').append('svg')
    .attr('width', width)
    .attr('height', height);

svg.selectAll('path')
    .data(layers0)
    .enter().append('path')
    .attr('d', area)
    .style('fill', () => scales.color(Math.random()));

window.transition = () => {
    svg.selectAll('path')
        .data(() => {
            const d = layers1;
            layers1 = layers0;
            layers0 = d;

            return d;
        })
        .transition()
        .duration(2500)
        .attr('d', area);
};
