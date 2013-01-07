function compassing(canvas, report) {
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'xor';

    var offset = {x: canvas.offsetLeft, y: canvas.offsetTop};

    function drawLine(start, end, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    function drawRect(x, y, w, h) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(x, y, w, h);
    }

    drawLine({x: 100, y: 100}, {x: 100, y:200}, 'red');

    drawLine({x: 200, y: 100}, {x: 200, y:200}, 'red');
    drawLine({x: 200, y: 100}, {x: 200, y:200}, 'red');

    drawRect(300, 100, 100, 100);

    drawRect(500, 100, 100, 100);
    drawRect(500, 100, 100, 100);
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


// Whee

var canvas = document.getElementById('canvas');
var debug = document.getElementById('debug');
function report(html) {
    if (true) debug.innerHTML = '<br>' + html;
}

compassing(canvas, report);
