function rotate(angle) {
    return [[Math.cos(angle), Math.sin(angle)],
            [-Math.sin(angle), Math.cos(angle)]];
}

var reflectX = [[ 1, 0],
                [ 0,-1]];

function matMult(m1, m2) {
    var result = [[0, 0],
                  [0, 0]];
    for (var i = 0; i < 2; ++i)
        for (var j = 0; j < 2; ++j)
            for (var k = 0; k < 2; ++k)
                result[i][j] += m2[i][k] * m1[k][j];
    return result;
}

function reflect(angle) {
    return matMult(rotate(angle), matMult(reflectX, rotate(-angle)));
}

function matApply(m, v) {
    var result = [0, 0];
    for (var i = 0; i < 2; ++i)    
        for (var j = 0; j < 2; ++j)
            result[i] += m[i][j] * v[j];
    return result;
}

function interact(canvas, report) {
    var width = 0+canvas.width;
    var height = 0+canvas.height;
    var ox = width/2;
    var oy = height/2;

    // Unit vector of the 'other' mirror, the one at an angle:
    var mx = Math.cos(Math.PI/6);
    var my = Math.sin(Math.PI/6);

    var otherMirror = reflect(Math.PI/6);

    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 8;
    ctx.lineCap = 'butt';

    var offset = {x: canvas.offsetLeft, y: canvas.offsetTop};
    var points = [];
    var colors = ['rgba(255,255,255,0.2)'];

    function drawLine(start, end, color) {
        report(' ' + start.x + ',' + start.y + ' -> ' + end.x + ',' + end.y + ' / ' + color);
        ctx.strokeStyle = color;
        ctx.beginPath();
        segments(start.x - ox, start.y - oy,
                   end.x - ox,   end.y - oy);
        ctx.stroke();
    }

    function segments(sx, sy, ex, ey) {
        for (var i = 0; i < 6; ++i) {

            segment(sx, sy, ex, ey);

            // Reflect on the x-axis.
            if (true) {
                sy = -sy;
                ey = -ey; 
                segment(sx, sy, ex, ey);
            }

            // Reflect on the other mirror.
            var sv = matApply(otherMirror, [sx, sy]);
            sx = sv[0], sy = sv[1];
            var ev = matApply(otherMirror, [ex, ey]);
            ex = ev[0], ey = ev[1];            
        }
    }

    function segment(sx, sy, ex, ey) {
        ctx.moveTo(ox+sx, oy+sy);
        ctx.lineTo(ox+ex, oy+ey);
    }

    function onMousedown(xy) {
        points[0] = xy;
        event.preventDefault();
    }

    function onMousemove(xy) {
        if (points[0] === void 0) return;
        drawLine(points[0], xy, colors[0]);
        points[0] = xy;
        event.preventDefault();
    }

    function onMouseup() {
        delete points[0];
        event.preventDefault();
    }

    canvas.addEventListener('mousedown', pointing.leftButtonOnly(pointing.mouseHandler(canvas, onMousedown)));
    canvas.addEventListener('mousemove', pointing.mouseHandler(canvas, onMousemove));
    canvas.addEventListener('mouseup',   pointing.mouseHandler(canvas, onMouseup));

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

interact(canvas, report);
