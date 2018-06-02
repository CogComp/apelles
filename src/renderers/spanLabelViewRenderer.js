/* eslint no-console:0 */

var _ = require('lodash');
var treeViewRenderer = require('./treeViewRenderer');

const supportedTypes = ["edu.illinois.cs.cogcomp.core.datastructures.textannotation.SpanLabelView"];

var render = treeViewRenderer.render;  // treeViewRenderer handles constituents without relations

module.exports = {
	render: render,
	supportedTypes: supportedTypes
};