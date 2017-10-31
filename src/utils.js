/* eslint no-console:0 */

const d3 = require('d3-scale');
const randomcolor = require('randomcolor');

var getColorScheme = function(count) {
    if (count <= 10) return d3.schemeCategory10;
    if (count <= 20) return d3.schemeCategory20;
    return randomcolor({ count: count })
};

module.exports = {
    getColorScheme: getColorScheme
};
