// Translate touch and mouse events to canvas-relative coords
// etc.

;(function(exports) {

'use strict';

// XXX review the touch API, use clientX etc. instead?
function touchCoords(canvas, touch) {
    return canvasCoords(canvas, touch.pageX, touch.pageY);
}

function mouseCoords(canvas, event) {
    return canvasCoords(canvas, event.clientX, event.clientY);
}

function canvasCoords(canvas, pageX, pageY) {
    var canvasBounds = canvas.getBoundingClientRect();
    return {x: pageX - canvasBounds.left,
            y: pageY - canvasBounds.top};
}

function mouseHandler(canvas, handler) {
    return function(event) { return handler(mouseCoords(canvas, event)); };
}

function leftButtonOnly(handler) {
    return function(event) {
        if (event.button === 0) { // left mouse button
            handler(event);
        }
    };
}

exports.pointing = {
    touchCoords: touchCoords,
    mouseCoords: mouseCoords,
    //canvasCoords,
    mouseHandler: mouseHandler,
    leftButtonOnly: leftButtonOnly,
};
})(this);
