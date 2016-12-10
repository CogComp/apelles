/* eslint no-console:0 */

var _ = require('lodash');

var sampleData = require('./public/test.json');

var renderSpanLabelView = function(viewName, viewType, spanDataMap) {
    var entityTypesList = [];
    var entityList = [];

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

    var docDataOrig = {
        // Our text of choice
        text     : "This is the best Hello. \n This is the very best of the best of the ones.",
        // The entities entry holds all entity annotations
        entities : [
            /* Format: [${ID}, ${TYPE}, [[${START}, ${END}]]]
             note that range of the offsets are [${START},${END}) */
            ['T1', 'Person', [[0, 11]]],
            ['T2', 'Person', [[27, 29]]],
            ['T3', 'Person', [[37, 40]]],
            ['T4', 'Person', [[50, 61]]],
        ]
    };

    return {
        entity_types: entityTypesList,
        entities: entityList
    };
};

var parse = function (options) {
    var tokensList = sampleData.tokens;
    var sentenceList = sampleData.sentences.sentenceEndPositions;

    var availableViews = _.map(sampleData.views, function (view) {
        var requiredView = _.head(view.viewData);
        return { name: requiredView.viewName, type: requiredView.viewType };
    });

    console.log("Available Views: " + JSON.stringify(availableViews));

    var tokensViewOuter = _.filter(sampleData.views, function (view) {
        return view.viewName === "TOKENS";
    });

    var tokensView = _.head(_.head(tokensViewOuter).viewData);
    var tokenConstituents = tokensView.constituents;

    console.assert(tokenConstituents.length == tokensList.length);

    var sentenceEndIterator = _(sentenceList);
    var currentSentenceEnd = sentenceEndIterator.next();

    var sentenceResults = _.reduce(_.zip(tokenConstituents, tokensList), function (result, value, index) {
        var sentenceComponent = result.pop();

        var lastToken = _.last(sentenceComponent) || {};
        var lastTokenCharEnd = lastToken.charEnd || 0;

        var constituent = _.head(value);
        var token = _.tail(value);

        var currentToken = { charStart: lastTokenCharEnd, start: constituent.start, end: constituent.end };

        var separator = ' ';
        if (constituent.end === currentSentenceEnd.value) {
            separator = '\n';
        }

        currentToken.text = token + separator;
        currentToken.charEnd = currentToken.charStart + currentToken.text.length;

        sentenceComponent.push(currentToken);

        result.push(sentenceComponent);

        if (constituent.end === currentSentenceEnd.value) {
            currentSentenceEnd = sentenceEndIterator.next();
            result.push([]);
        }

        return result;
    }, [[]]);

    var rawText = _.join(_.map(_.flatten(sentenceResults), function (token) { return token.text; }), '');

    var spanOutput = renderSpanLabelView("NER_ACE_COARSE_HEAD",
        "edu.illinois.cs.cogcomp.core.datastructures.textannotation.SpanLabelView",
        sentenceResults) || {};

    var entityTypes = spanOutput.entity_types || [];
    var entities = spanOutput.entities || [];

    return {
        collectionData: {
            entity_types: entityTypes
        },
        documentData: {
            text: rawText,
            entities: entities
        }
    };
};

module.exports = {
    parse: parse,
    lodash: _,
    data: sampleData
};