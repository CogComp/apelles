/* eslint no-console:0 */

const _ = require('lodash');
const randomcolor = require('randomcolor');

const RANDOM_COLOR_STEP = 7;

// Returns the same continuous colors every time
var getContinuousColorScheme = function (count) {
    return randomcolor({count: count, seed: "0", luminosity: "light"});
};

// Returns the same non-continuous colors every time
var getColorScheme = function (count) {
    return _.filter(getContinuousColorScheme(count * RANDOM_COLOR_STEP), function (color, index) {
       return index % RANDOM_COLOR_STEP == 0;
    });
};

module.exports = {
    getContinuousColorScheme: getContinuousColorScheme,
    getColorScheme: getColorScheme
};
