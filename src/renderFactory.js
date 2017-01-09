/* eslint no-console:0 */

const registery = {};

const PREFIX = "edu.illinois.cs.cogcomp.core.datastructures.textannotation.";

var can_render = function(viewType) {
	return registery.hasOwnProperty(viewType);
};

var register_renderer = function(viewType, renderer) {
	registery[viewType] = renderer;
};

var get_renderer = function(viewType) {
	return registery[viewType];
};

// Initialization - Register all renderers
const spanLabelViewRenderer = require('./renderers/spanLabelViewRenderer');

register_renderer(PREFIX + "SpanLabelView", spanLabelViewRenderer);
register_renderer(PREFIX + "TokenLabelView", spanLabelViewRenderer);

module.exports = {
	can_render: can_render,
	get_renderer: get_renderer
};