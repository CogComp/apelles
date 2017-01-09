/* eslint no-console:0 */

const registery = {};

var can_render = function(viewType) {
	return false;
};

var register_renderer = function(viewType, renderer) {

};

var get_renderer = function(viewType) {
	return require('./renderers/spanLabelViewRenderer');
};

module.exports = {
	// can_render: can_register,
	get_renderer: get_renderer,
	// register_renderer: register_renderer
};