var _ = require('lodash');

// O(n) intersection based on map keys instead of equality
var intersection = function (mapA, mapB) {
    return _.pickBy(mapA, function (value, key) { return key in mapB; });
};

var intersectionAll = function (maps) {
    return _.reduce(maps, intersection);
};

var mapKeysValues = function (array, keyValue) {
    return _.fromPairs(_.map(array, keyValue));
};

// Find the starting position of tokens in the text
var findTokenOffsets = function (text, tokens) {
    var currentOffset = 0;
    return _.map(tokens, function (token) {
        var offset = text.indexOf(token, currentOffset);
        if (offset >= 0) {
            currentOffset = offset + token.length;
        }
        return { token: token, offset: offset };
    });
};

// Destructive
// Modify a set of views, removing common elements
var compareViews = function (viewsWithContext) {
    // Assumes that the text is the same across views
    var baselineText = _.head(viewsWithContext).text;

    // Generate token key strings for fast equivalence comparison
    // Two tokens are equivalent if they have the same length and offset in the text
    var tokenKey = function (tokenWithOffset) {
        return tokenWithOffset.offset + "+" + tokenWithOffset.token.length;
    };

    // Generate constituent key strings for fast equivalence comparison
    // Two constituents are equivalent if they have the same label and their covered tokens are equivalent
    var constituentKey = function (constituent, tokenKeys) {
        return _.escape(constituent.label) + "<" + _.join(_.slice(tokenKeys, constituent.start, constituent.end), ",");
    };

    // Generate relation key strings for fast equivalence comparison
    // Two relations are equivalent if they have the same relationName and their src and target constituents are equivalent
    var relationKey = function (relation) {
        return relation.srcConstituentKey + ">" + _.escape(relation.value.relationName) + ">" + relation.targetConstituentKey;
    };

    // Convert the views into objects of view, a dictionary of constituents with keys, and a dictionary of relations with keys
    var viewConstituentRelationsArray = _.map(viewsWithContext, function (viewWithContext) {
        // Convert constituents into their keys
        var tokenKeys = _.map(findTokenOffsets(baselineText, viewWithContext.tokens || []), tokenKey);

        // Convert constituents into objects of constituent and its key
        var constituentArray = _.map(viewWithContext.view.constituents || [], function (constituent, index) {
            return { key: constituentKey(constituent, tokenKeys), value: constituent };
        });

        // Convert relations into objects of relation and its constituent keys
        var relationArray = _.map(viewWithContext.view.relations || [], function (relation) {
            return {
                srcConstituentKey: constituentArray[relation.srcConstituent].key,
                targetConstituentKey: constituentArray[relation.targetConstituent].key,
                value: relation
            };
        });

        // Convert objects into a dictionary based on keys
        var constituentSet = _.mapKeys(constituentArray, _.property('key'));
        var relationSet = _.mapKeys(relationArray, relationKey);

        return { view: viewWithContext.view, constituents: constituentSet, relations: relationSet };
    });

    // Find common constituents and relations across all views based on equivalence of their keys
    var duplicateConstituents = intersectionAll(_.map(viewConstituentRelationsArray, _.property('constituents')));
    var duplicateRelations = intersectionAll(_.map(viewConstituentRelationsArray, _.property('relations')));

    _.forEach(viewConstituentRelationsArray, function (viewConstituentRelations) {
        var view = viewConstituentRelations.view, constituents = viewConstituentRelations.constituents, relations = viewConstituentRelations.relations;

        // A relation is selected if it is not in all versions
        var selectedRelations = _.filter(relations, function (relation, key) {
            return !(key in duplicateRelations);
        });

        // Find all constituents referenced by a selected relation
        var referencedConstituents = new Set(_.flatMap(selectedRelations, function (relation) {
            return [relation.srcConstituentKey, relation.targetConstituentKey];
        }));

        // A constituent is selected if it is not in all versions or it is referenced by a selected relation
        var selectedConstituents = _.filter(constituents, function (constituent) {
            return !(constituent.key in duplicateConstituents) || referencedConstituents.has(constituent.key);
        });

        // Update constituent ids in relations as some constituents are removed
        var constituentMapping = mapKeysValues(selectedConstituents, function (constituent, newIndex) {
            return [constituent.key, newIndex];
        });
        _.forEach(selectedRelations, function (relation) {
            relation.value.srcConstituent = constituentMapping[relation.srcConstituentKey];
            relation.value.targetConstituent = constituentMapping[relation.targetConstituentKey];
        });

        view.relations = _.map(selectedRelations, _.property('value'));
        view.constituents = _.map(selectedConstituents, _.property('value'));
    });
};

// Destructive
// Modify an array of fetchedData, removing common elements from the views specified in viewInfos
// Returns objects of viewInfo, its matching views, and their containing fetchedData
var compareJsonData = function (fetchedDataArray, viewInfos) {
    return _.map(viewInfos, function (viewInfo) {
        // Find all views that matches viewInfo
        var viewsWithContext = _.flatMap(fetchedDataArray, function (fetchedData) {
            // Make sure fetchedData matches viewInfo.file
            return fetchedData.file !== viewInfo.file ? [] :
                _.flatMap(fetchedData.jsonData.views, function (viewEntry) {
                    // Make sure view matches viewInfo.name and viewInfo.type
                    return viewEntry.viewName !== viewInfo.name ? [] :
                        _.map(_.filter(viewEntry.viewData, function (viewDatum) {
                            return viewDatum.viewType === viewInfo.type;
                        }), function (view) {
                            return {
                                data: fetchedData,
                                view: view,
                                text: fetchedData.jsonData.text,
                                tokens: fetchedData.jsonData.tokens
                            };
                        });
                });
        });

        // Perform comparison
        if (viewsWithContext.length >= 2) {
            compareViews(viewsWithContext);
        }

        return { viewInfo: viewInfo, views: _.map(viewsWithContext, 'view'), data: _.map(viewsWithContext, 'data') };
    });
};

function createView(viewName, viewType, constituents, relations) {
    return {
        viewName: viewName,
        viewData: [{
            viewType: viewType,
            viewName: viewName,
            score: 1,
            generator: "Apelles",
            constituents: constituents,
            relations: relations
        }]
    };
}

function createMultiViews(jsonData, multiViews) {
    if (_.isEmpty(multiViews)) {
        return [];
    }

    var stackedViewName = multiViews.join(" / ");
    var stackingConfig = {};
    var basisView = _.find(jsonData.views, function (view) {
        return _.includes(multiViews, view.viewName);
    });
    stackingConfig[stackedViewName] = {
        views: multiViews,
        viewType: _.head(basisView.viewData).viewType
    };

    var mapConstituentsRelations = _.fromPairs(_.map(jsonData.views, function (view) {
        var assignLabelType = function (obj) {
            return _.assign({}, obj, {type: view.viewName});
        };
        return [view.viewName, _.map(view.viewData, function (viewData) {
            var constituents = _.map(viewData.constituents || [], assignLabelType);
            var relations = _.map(viewData.relations || [], assignLabelType);
            return {constituents: constituents, relations: relations};
        })];
    }));

    _.forEach(stackingConfig, function (oldViews, newViewName) {
        if (_.some(oldViews.views, function (viewName) {
                return _.has(mapConstituentsRelations, viewName);
            })) {
            var constituents = [], relations = [];
            _.forEach(oldViews.views, function (viewName) {
                _.forEach(mapConstituentsRelations[viewName], function (view) {
                    var constituentOffset = constituents.length;
                    Array.prototype.push.apply(constituents, view.constituents);
                    Array.prototype.push.apply(relations, _.map(view.relations, function (relation) {
                        var copy = _.assign({}, relation);
                        copy.srcConstituent += constituentOffset;
                        copy.targetConstituent += constituentOffset;
                        return copy;
                    }));
                });
            });
            var combinedView = createView(newViewName, oldViews.viewType, constituents, relations);
            jsonData.views.push(combinedView);
        }
    });

    return [stackedViewName];
}

function splitBySentence(fetchedData) {
    var sentenceEndPositions = [0].concat(fetchedData.jsonData.sentences.sentenceEndPositions);
    var sentencePositions = [];
    for (var i = 1; i < sentenceEndPositions.length; ++i) {
        sentencePositions.push({start: sentenceEndPositions[i - 1], end: sentenceEndPositions[i]});
    }

    return _.map(sentencePositions, function (sentencePosition) {
        var includeConstituent = function (constituent) {
            return sentencePosition.start <= constituent.start && constituent.end <= sentencePosition.end;
        };

        var newViews = _.map(fetchedData.jsonData.views, function (view) {
            var newViewData = _.map(view.viewData, function (data) {
                var oldConstituents = data.constituents;

                var newConstituents = _.filter(oldConstituents, includeConstituent);
                newConstituents = _.map(newConstituents, function (constituent, index) {
                    constituent.newIndex = index;

                    return _.assign({}, constituent, {
                        start: constituent.start - sentencePosition.start,
                        end: constituent.end - sentencePosition.start,
                        original: constituent
                    });
                });

                var newRelations = _.map(_.filter(data.relations, function (relation) {
                    return includeConstituent(oldConstituents[relation.srcConstituent]) && includeConstituent(oldConstituents[relation.targetConstituent]);
                }), function (relation) {
                    return _.assign({}, relation, {
                        srcConstituent: oldConstituents[relation.srcConstituent].newIndex,
                        targetConstituent: oldConstituents[relation.targetConstituent].newIndex
                    });
                });
                return _.assign({}, data, {constituents: newConstituents, relations: newRelations});
            });
            return _.assign({}, view, {viewData: newViewData});
        });

        var newJsonData = _.assign({}, fetchedData.jsonData, {
            sentences: _.assign({}, fetchedData.jsonData.sentences, {sentenceEndPositions: [sentencePosition.end - sentencePosition.start]}),
            // TODO text:
            // TODO tokenOffsets:
            tokens: _.slice(fetchedData.jsonData.tokens, sentencePosition.start, sentencePosition.end),
            views: newViews
        });

        return _.assign({}, fetchedData, {
            jsonData: newJsonData
        });
    });
}

module.exports = {
    compareJsonData: compareJsonData,
    createMultiViews: createMultiViews,
    splitBySentence: splitBySentence
};
