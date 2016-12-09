/* eslint no-console:0 */

var render = function (baseNode, options) {
    var testDiv = document.createElement("div");
    testDiv.innerHTML = "Hello, World!";

    baseNode.appendChild(testDiv);
};

module.exports = {
    render: render
};