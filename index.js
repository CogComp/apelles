/* eslint no-console:0 */

var _ = require('lodash');
var renderFactory = require('./src/renderFactory');

var pipelineClient = require('./src/pipeline/pipelineClient');

var sampleData = require('./public/sample.json');

var getAvailableViews = function(jsonData) {
    return _.map(jsonData.views, function (view) {
        var requiredView = _.head(view.viewData);
        return { name: requiredView.viewName, type: requiredView.viewType };
    });
};

var render = function (jsonData, spanInfo, options) {
    var tokensList = jsonData.tokens;
    var sentenceList = jsonData.sentences.sentenceEndPositions;

    var tokensViewOuter = _.filter(jsonData.views, function (view) {
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

    var renderer = renderFactory.getRenderer(spanInfo.type);
    var spanOutput = renderer.render(spanInfo.name, spanInfo.type, jsonData, tokenMap) || {};

    var entityTypes = spanOutput.entity_types || [];
    var entities = spanOutput.entities || [];
    var relationTypes = spanOutput.relation_types || [];
    var relations = spanOutput.relations || [];

    return {
        collectionData: {
            entity_types: entityTypes,
            relation_types: relationTypes
        },
        documentData: {
            text: rawText,
            entities: entities,
            relations: relations
        }
    };
};

var annotateAndRender = function (text, viewName, options) {
    const pipelineConfiguration = {};

    return pipelineClient.annotateText(pipelineConfiguration, text, [viewName])
        .then(function (jsonData) {
            return render(jsonData, {}, options);
        });
};

module.exports = {
    getAvailableViews: getAvailableViews,
    annotateAndRender: annotateAndRender,
    lodash: _,
    pipelineClient: pipelineClient,
    render: render,
    sampleData: sampleData,
    supportedTypes: renderFactory.supportedTypes
};
