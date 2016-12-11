/* eslint no-console:0 */

var _ = require('lodash');
var randomColor = require('randomcolor');

var sampleData = require('./public/test.json');

var renderSpanLabelView = function(viewName, spanName, tokenMap) {
    var spanViewOuter = _.filter(sampleData.views, function (view) {
        return view.viewName === viewName;
    });

    var spanView = _.head(_.head(spanViewOuter).viewData);

    var labels = _.uniq(_.map(spanView.constituents, function (constituent) {
        return constituent.label;
    }));

    var colors = randomColor({ count: labels.length });

    var entityTypesList = _.zipWith(labels, colors, function (label, color) {
        return {
            type: label,
            labels: [label],
            bgColor: color,
            borderColor: 'darken'
        }
    });

    var entityList = _.map(spanView.constituents, function (constituent) {
        var unqiue_id = 'entity_' +  constituent.start + '_' + constituent.end;

        var tokenStart = tokenMap[constituent.start];
        // var tokenEnd = tokenMap[constituent.end - 1];

        console.log(tokenStart, constituent);

        if (_.isUndefined(tokenStart)) {
            return false;
        }

        return [unqiue_id, constituent.label, [[tokenStart.charStart, tokenStart.charEnd - 1]]];
    });

    return {
        entity_types: entityTypesList,
        entities: _.compact(entityList)
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

        var lastToken = _.last(sentenceComponent);

        if (_.isUndefined(lastToken)) {
            // Get the last token from the previous sentence.
            var prev = _.last(result) || [];
            lastToken = _.last(prev) || {};
        }

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

    var tokenMap = _.keyBy(_.flatten(sentenceResults), 'start');
    var rawText = _.join(_.map(_.flatten(sentenceResults), function (token) { return token.text; }), '');

    var spanOutput = renderSpanLabelView("NER_ACE_COARSE_HEAD",
        "edu.illinois.cs.cogcomp.core.datastructures.textannotation.SpanLabelView",
        tokenMap) || {};

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