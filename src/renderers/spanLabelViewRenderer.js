/* eslint no-console:0 */

var _ = require('lodash');
var utils = require('../utils');

const supportedTypes = ["edu.illinois.cs.cogcomp.core.datastructures.textannotation.SpanLabelView"];

var render = function(viewName, viewType, jsonData, domElement, options) {
    console.assert(options.hasOwnProperty('brat_util'))
    console.assert(options.hasOwnProperty('brat_webFontURLs'))
    console.assert(options.hasOwnProperty('rawText'))
    console.assert(options.hasOwnProperty('tokenMap'))

    var tokenMap = options['tokenMap']
    var rawText = options['rawText']

    var spanViewOuter = _.filter(jsonData.views, function (view) {
        return view.viewName === viewName;
    });

    var spanView = _.head(_.head(spanViewOuter).viewData);

    var labels = _.uniq(_.map(spanView.constituents, function (constituent) {
        return constituent.label;
    }));

    var relationLabels = _.uniq(_.map(spanView.relations, function (relation) {
        return relation.relationName;
    }));

    var colors = utils.getColorScheme(labels.length);
    var relationColors = utils.getColorScheme(relationLabels.length);

    var entityTypesList = _.zipWith(labels, colors, function (label, color) {
        return {
            type: label,
            labels: [label],
            bgColor: color,
            borderColor: 'darken'
        }
    });

    var entityList = _.map(spanView.constituents, function (constituent) {
        var uniqueId = 'entity_' +  constituent.start + '_' + constituent.end;

        var tokenStart = tokenMap[constituent.start];
        var tokenEnd = tokenMap[constituent.end - 1];

        if (_.isUndefined(tokenStart)) {
            return false;
        }

        return [uniqueId, constituent.label, [[tokenStart.charStart, tokenEnd.charEnd - 1]]];
    });

    var relations = _.map(spanView.relations, function (relation) {
        var uniqueId = 'relation_' +  relation.srcConstituent + '_' + relation.targetConstituent;
        var srcConstituentId = entityList[relation.srcConstituent][0];
        var targetConstituentId = entityList[relation.targetConstituent][0];
        var relationName = relation.relationName;

        return [uniqueId, relationName, [["", srcConstituentId], ["", targetConstituentId]]];
    });

    var relationTypesList = _.zipWith(relationLabels, relationColors, function (label, color) {
        return {
            type: label,
            labels: [label],
            bgColor: color,
            borderColor: 'darken'
        }
    });

    var collectionData = {
        entity_types: entityTypesList || [],
        relation_types: relationTypesList || []
    };

    var documentData = {
        text: rawText,
        entities: _.compact(entityList) || [],
        relations: relations || []
    }

    var bratUtil = options['brat_util']

    return bratUtil.embed(domElement, collectionData, documentData, options['brat_webFontURLs'])
};


module.exports = {
	render: render,
	supportedTypes: supportedTypes
};