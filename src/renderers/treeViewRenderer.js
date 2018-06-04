/* eslint no-console:0 */

var _ = require('lodash');
var utils = require('../utils');

const supportedTypes = ["edu.illinois.cs.cogcomp.core.datastructures.textannotation.TreeView"];

var render = function(viewName, viewType, jsonData, domElement, options) {
    console.assert(options.hasOwnProperty('brat_util'));
    console.assert(options.hasOwnProperty('brat_webFontURLs'));
    console.assert(options.hasOwnProperty('rawText'));
    console.assert(options.hasOwnProperty('tokenMap'));

    var tokenMap = options['tokenMap'];
    var rawText = options['rawText'];

    var treeViewOuter = _.filter(jsonData.views, function (view) {
        return view.viewName === viewName;
    });

    var treeView = _.head(_.head(treeViewOuter).viewData);

    var constituents = _.map(treeView.constituents, function (constituent) {
        var type = _.has(constituent, "type") ? constituent.type : constituent.label;
        return _.assign({}, constituent, {type: type});
    });

    var relations = _.map(treeView.relations, function (relation) {
        var type = _.has(relation, "type") ? relation.type : relation.relationName;
        var label = relation.relationName;
        return _.assign({}, relation, {label: label, type: type});
    });

    var collectTypes = function (labelTypePairs) {
        return _.mapValues(_.groupBy(labelTypePairs, 'type'), function (pairs) {
            return _.uniq(_.map(pairs, 'label'));
        });
    };

    var constituentLabelsTypes = collectTypes(constituents);
    var constituentTypes = _.keys(constituentLabelsTypes);
    var constituentColors = _.zipObject(constituentTypes, utils.getColorSchemeByText(constituentTypes));

    var relationLabelsTypes = collectTypes(relations);
    var relationTypes = _.keys(relationLabelsTypes);
    var relationColors =_.zipObject(relationTypes, utils.getColorSchemeByText(relationTypes));

    var createTypesList = function (labelTypes, colors) {
        return _.flatMap(labelTypes, function (labels, type) {
            return _.map(labels, function (label) {
                return {
                    type: type + "::" + label,
                    labels: [label],
                    bgColor: colors[type],
                    borderColor: 'darken'
                };
            });
        });
    };

    var entityTypesList = createTypesList(constituentLabelsTypes, constituentColors);

    var relationTypesList = createTypesList(relationLabelsTypes, relationColors);

    var entityList = _.map(constituents, function (constituent) {
        var constituentLabel = constituent.type + "::" + constituent.label;
        var uniqueId = 'entity_' +  constituent.start + '_' + constituent.end + "_" + constituentLabel;

        var tokenStart = tokenMap[constituent.start];
        var tokenEnd = tokenMap[constituent.end - 1];

        if (_.isUndefined(tokenStart)) {
            return false;
        }

        return [uniqueId, constituentLabel, [[tokenStart.charStart, tokenEnd.charEnd - 1]]];
    });

    var relationList = _.map(relations, function (relation) {
        var relationLabel = relation.type + "::" + relation.label;
        var uniqueId = 'relation_' +  relation.srcConstituent + '_' + relation.targetConstituent + "_" + relationLabel;

        var srcConstituentId = entityList[relation.srcConstituent][0];
        var targetConstituentId = entityList[relation.targetConstituent][0];

        return [uniqueId, relationLabel, [["", srcConstituentId], ["", targetConstituentId]]];
    });

    var collectionData = {
        entity_types: entityTypesList || [],
        relation_types: relationTypesList || []
    };

    var documentData = {
        text: rawText,
        entities: _.compact(entityList) || [],
        relations: relationList || []
    };

    var bratUtil = options['brat_util'];

    return bratUtil.embed(domElement, collectionData, documentData, options['brat_webFontURLs'])
};


module.exports = {
	render: render,
	supportedTypes: supportedTypes
};