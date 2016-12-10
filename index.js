/* eslint no-console:0 */

var _ = require('lodash');

var sampleData = require('./public/test.json');

var parse = function (options) {
    var tokensList = sampleData.tokens;
    var sentenceList = sampleData.sentences;

    var tokensViewOuter = _.filter(sampleData.views, function (view) {
        return view.viewName === "TOKENS";
    });

    var tokensView = _.head(_.head(tokensViewOuter).viewData);
    var tokenConstituents = tokensView.constituents;

    console.assert(tokenConstituents.length == tokensList.length);

    var collData = {
        entity_types: [ {
            type   : 'Person',
            /* The labels are used when displaying the annotion, in this case
             we also provide a short-hand "Per" for cases where
             abbreviations are preferable */
            labels : ['Person', 'Per'],
            // Blue is a nice colour for a person?
            bgColor: '#7fa2ff',
            // Use a slightly darker version of the bgColor for the border
            borderColor: 'darken'
        } ]
    };

    var docData = {
        // Our text of choice
        text     : sampleData.text,
        // The entities entry holds all entity annotations
        entities : [
            /* Format: [${ID}, ${TYPE}, [[${START}, ${END}]]]
             note that range of the offsets are [${START},${END}) */
            ['T1', 'Person', [[0, 11]]],
            ['T2', 'Person', [[20, 23]]],
            ['T3', 'Person', [[37, 40]]],
            ['T4', 'Person', [[50, 61]]],
        ],
    };

    return { collectionData: collData, documentData: docData };
};

module.exports = {
    parse: parse,
    lodash: _,
    data: sampleData
};