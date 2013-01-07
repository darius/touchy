// We take the framerate to be the average #frames/sec over the last
// 10 frames. (Or over all frames, if fewer than 10.)
// frameTimes holds the time of each, at position (frame# modulo 10).

var nframes = 0;

var startTime = (new Date()).getTime(); // in msec
var frameTimes =  [startTime, startTime, startTime, startTime, startTime,
                   startTime, startTime, startTime, startTime, startTime];

function computeFrameRate() {
    ++nframes;
    var now = (new Date()).getTime();
    var f = nframes % frameTimes.length;
    var then = frameTimes[f]; frameTimes[f] = now;
    var frameInterval = Math.min(nframes, frameTimes.length);
    return frameInterval / (0.001 * (now - then));
}

function showFrameRate() {
    document.getElementById("framerate").innerHTML =
      Math.round(computeFrameRate());
}


function compassing(canvas, report) {
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    var backdrop = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var offset = {x: canvas.offsetLeft, y: canvas.offsetTop};
    var touchpoints = false;

    function touchstart(event) {
        report('touchstart' + show(event.touches));
        display(event.touches);
        showFrameRate();
        event.preventDefault();
    }

    function display(touches) {
        if (touches.length == 2) {
            var points = [touchPoint(touches[0]), touchPoint(touches[1])];
            defer(function() { rubberband(points); });
            // rubberband(points);
        }
    }

    function touchPoint(touch) {
        return {x: touch.pageX - offset.x,
                y: touch.pageY - offset.y};
    }

    function rubberband(points) {
        if (touchpoints) {
            ctx.putImageData(backdrop, 0, 0);
            //ctx.lineWidth = 3;
            //drawLine(touchpoints[0], touchpoints[1], 'white');
            //ctx.lineWidth = 1;
        }
        drawLine(points[0], points[1], 'red');
        touchpoints = points;
    }

    function touchmove(event) {
        report('touchmove' + show(event.touches));
        display(event.touches);
        showFrameRate();
        event.preventDefault();
    }

    function drawLine(start, end, color) {
        if (false)report(' ' + start.x + ',' + start.y
                         + ' -> ' + end.x + ',' + end.y + ' / ' + color);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    function touchend(event) {
        report('touchend' + show(event.touches));
        // TODO: delete touchpoints[] for the touches that ended. 
        // Not the same as event.touches.
        showFrameRate();
        event.preventDefault();
    }

    function show(touches) {
        var msg = '';
        forEach(touches, function (touch, i) {
            var point = {x: touch.pageX - offset.x,
                         y: touch.pageY - offset.y};
            msg += ' ' + touch.identifier + ': ' + point.x + ',' + point.y;
        });
        return msg;
    }

    canvas.addEventListener('touchstart', loudly(report, touchstart), false);
    canvas.addEventListener('touchmove', loudly(report, touchmove), false);    
    canvas.addEventListener('touchend', loudly(report, touchend), false);    
    report('Starting');
}

function forEach(xs, f) {
    for (var i = 0; i < xs.length; ++i)
        f(xs[i], i);
}

function loudly(report, f) {
    return function() {
        try {
            return f.apply(this, arguments);
        } catch (e) {
            report('Oops (' + functionName(f) + '): ' + e);
            throw e;
        }
    }
}

function functionName(f) {
    // XXX hack
    return ('' + f).substring('function '.length, 'function touchstart'.length);
}


// Queue of pending actions, keeping only the latest.

function defer(action) {
    deferred = action;
    if (timeoutID === null)
        timeoutID = setTimeout(work, 50);
}

function work() {
    timeoutID = null;
    if (deferred !== null) {
        var action = deferred;
        deferred = null;
        action();
    }
}

var deferred = null;
var timeoutID = null;


// Whee

var canvas = document.getElementById('canvas');
var debug = document.getElementById('debug');
function report(html) {
    if (true) debug.innerHTML = '<br>' + html;
}

compassing(canvas, report);
