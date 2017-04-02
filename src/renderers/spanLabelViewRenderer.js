/* eslint no-console:0 */

var _ = require('lodash');
var randomColor = require('randomcolor');

const supportedTypes = ["edu.illinois.cs.cogcomp.core.datastructures.textannotation.SpanLabelView"];

var render = function(viewName, viewType, jsonData, tokenMap) {
    var spanViewOuter = _.filter(jsonData.views, function (view) {
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
        var uniqueId = 'entity_' +  constituent.start + '_' + constituent.end;

        var tokenStart = tokenMap[constituent.start];
        var tokenEnd = tokenMap[constituent.end - 1];

        if (_.isUndefined(tokenStart)) {
            return false;
        }

        return [uniqueId, constituent.label, [[tokenStart.charStart, tokenEnd.charEnd - 1]]];
    });

    return {
        entity_types: entityTypesList,
        entities: _.compact(entityList)
    };
};


module.exports = {
	render: render,
	supportedTypes: supportedTypes
};