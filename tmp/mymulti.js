function fingerpaint(canvas, report) {
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';

    var offset = {x: canvas.offsetLeft, y: canvas.offsetTop};
    var points = [];
    var colors  = ['red', 'green', 'yellow', 'blue', 'magenta', 'orangered'];

    function touchstart(event) {
        report('touchstart' + show(event.touches));
        forEach(event.touches, function (touch) {
            points[touch.identifier] = {x: touch.pageX - offset.x,
                                        y: touch.pageY - offset.y};
        });
        event.preventDefault();
    }

    function touchmove(event) {
        report('touchmove' + show(event.touches));
        forEach(event.touches, function (touch, i) {
            var point = {x: touch.pageX - offset.x,
                         y: touch.pageY - offset.y};
            drawLine(points[touch.identifier], point, colors[i]);
            points[touch.identifier] = point;
        });
        event.preventDefault();
    }

    function drawLine(start, end, color) {
        report(' ' + start.x + ',' + start.y + ' -> ' + end.x + ',' + end.y + ' / ' + color);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    function touchend(event) {
        report('touchend' + show(event.touches));
        if (false) {
            forEach(event.touches, function (touch) {
                delete points[touch.identifier];
            });
        }
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

var canvas = document.getElementById('canvas');
var debug = document.getElementById('debug');
function report(html) {
    if (false) debug.innerHTML += '<br>' + html;
}

fingerpaint(canvas, report);
