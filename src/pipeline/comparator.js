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

// Destructive
// Modify a set of views, removing common elements
var compareViews = function (views) {
    // Generate Key strings for fast equivalence comparison
    // Two constituents are equivalent if they have the same start, end, and label
    var constituentKey = function (constituent) {
        return constituent.start + "<" + _.escape(constituent.label) + "<" + constituent.end;
    };

    // Generate Key strings for fast equivalence comparison
    // Two relations are equivalent if they have the same relationName and their src and target are equivalent
    var relationKey = function (relation) {
        return relation.srcConstituentKey + ">" + _.escape(relation.relationName) + ">" + relation.targetConstituentKey;
    };

    var viewConstituentRelationsArray = _.map(views, function (view) {
        var constituentArray = _.map(view.constituents || [], function (constituent, index) {
            return { key: constituentKey(constituent), value: constituent };
        });

        var relationSet = mapKeysValues(view.relations || [], function (relation) {
            relation.srcConstituentKey = constituentArray[relation.srcConstituent].key;
            relation.targetConstituentKey = constituentArray[relation.targetConstituent].key;
            return [relationKey(relation), relation];
        });

        var constituentSet = _.mapKeys(constituentArray, _.property('key'));

        return { view: view, constituents: constituentSet, relations: relationSet };
    });

    var duplicateConstituents = intersectionAll(_.map(viewConstituentRelationsArray, _.property('constituents')));
    var duplicateRelations = intersectionAll(_.map(viewConstituentRelationsArray, _.property('relations')));

    _.forEach(viewConstituentRelationsArray, function (viewConstituentRelations) {
        var view = viewConstituentRelations.view, constituents = viewConstituentRelations.constituents, relations = viewConstituentRelations.relations;

        // A relation is selected if it is not in all versions
        var selectedRelations = _.values(_.pickBy(relations, function (relation, key) {
            return !(key in duplicateRelations);
        }));
        var referencedConstituents = new Set(_.flatMap(selectedRelations, function (relation) {
            return [relation.srcConstituentKey, relation.targetConstituentKey];
        }));

        // A constituent is selected if it is not in all versions or it is referenced by a selected relation
        var selectedConstituents = _.values(_.pickBy(constituents, function (constituent) {
            return !(constituent.key in duplicateConstituents) || referencedConstituents.has(constituent.key);
        }));
        var constituentMapping = mapKeysValues(selectedConstituents, function (constituent, newIndex) {
            return [constituent.key, newIndex];
        });

        _.forEach(selectedRelations, function (relation) {
            relation.srcConstituent = constituentMapping[relation.srcConstituentKey];
            relation.targetConstituent = constituentMapping[relation.targetConstituentKey];
        });

        view.relations = selectedRelations;
        view.constituents = _.map(selectedConstituents, _.property('value'));
    });
};

// Destructive
// Modify a set of jsonData, removing common elements from the views in viewInfosArray
// Returns an array of viewInfo to jsonData indices
var compareJsonData = function (jsonDataArray, viewInfosArray) {
    var viewInfos = _.uniqWith(_.flatten(viewInfosArray), _.isEqual);
    var viewInfoWithIndicesArray = _.map(viewInfos, function (viewInfo) {
        var indices = [];
        _.forEach(viewInfosArray, function (viewInfos, index) {
            if (_.some(viewInfos, _.partial(_.isEqual, viewInfo))) {
                indices.push(index);
            }
        });
        return { viewInfo: viewInfo, indices: indices };
    });
    _.forEach(viewInfoWithIndicesArray, function (viewInfoWithIndices) {
        var views = _.map(viewInfoWithIndices.indices, function (index) {
            var jsonData = jsonDataArray[index];
            var viewData = _.find(jsonData.views, function (view) {
                return view.viewName === viewInfoWithIndices.viewInfo.name;
            }).viewData;
            return _.find(viewData, function (view) {
                return view.viewType === viewInfoWithIndices.viewInfo.type &&
                    view.viewName === viewInfoWithIndices.viewInfo.name;
            });
        });
        if (views.length >= 2) {
            compareViews(views);
        }
    });
    return viewInfoWithIndicesArray;
};

module.exports = {
    compareViews: compareViews,
    compareJsonData: compareJsonData
};
