/* eslint no-console:0 */

const _ = require('lodash');
const randomcolor = require('randomcolor');

const RANDOM_COLOR_STEP = 7;
const TEXT_HASH_CAPACITY = 87;

var hashString = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var character = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

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

// Returns the same color every time for the same text
var getColorSchemeByText = function (texts) {
    var colors = getContinuousColorScheme(TEXT_HASH_CAPACITY);

    return _.map(texts, function (text) {
        return colors[Math.abs(hashString(text)) % TEXT_HASH_CAPACITY];
    });
};

module.exports = {
    hashString: hashString,
    getContinuousColorScheme: getContinuousColorScheme,
    getColorScheme: getColorScheme,
    getColorSchemeByText: getColorSchemeByText
};
