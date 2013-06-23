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

function fingerpaint(canvas, report) {
    var width = 0+canvas.width;
    var height = 0+canvas.height;
    var ox = width/2;
    var oy = height/2;

    // Unit vector of the 'other' mirror, the one at an angle:
    var mx = Math.cos(Math.PI/6);
    var my = Math.sin(Math.PI/6);

    var otherMirror = reflect(Math.PI/6);

    var ctx = canvas.getContext('2d');
    if (false) (function() {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        var mv = [mx*100, my*100];
        ctx.beginPath();
        segment(0, 0, mv[0], mv[1]);
        ctx.stroke();

        var transform = otherMirror; //matMult(reflectX, rotate(Math.PI/6));

        var xx = [100, 0];
        var mxx = matApply(transform, xx);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        segment(0, 0, xx[0], xx[1]);
        ctx.stroke();
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        segment(0, 0, mxx[0], mxx[1]);
        ctx.stroke();

        var yy = [0, 100];
        var myy = matApply(transform, yy);
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        segment(0, 0, yy[0], yy[1]);
        ctx.stroke();
        ctx.strokeStyle = 'lightblue';
        ctx.beginPath();
        segment(0, 0, myy[0], myy[1]);
        ctx.stroke();
    })();
    ctx.lineWidth = 8;
    ctx.lineCap = 'butt';

    var offset = {x: canvas.offsetLeft, y: canvas.offsetTop};
    var points = [];
    var colors  = ['rgba(0,255,0,0.2)', 'rgba(255,0,0,0.2)', 'rgba(0,0,255,0.2)', 'rgba(0,128,128,0.2)', 'rgba(128,0,128,0.2)', 'rgba(128,128,0,0.2)'];

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
        segments(start.x - ox, start.y - oy,
                 end.x - ox,   end.y - oy);
        ctx.stroke();
    }

    function segments(sx, sy, ex, ey) {
        for (var i = 0; i < 6; ++i) {

            segment( sx,  sy,  ex,  ey);

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
        ctx.moveTo(ox+sx, oy+sy); ctx.lineTo(ox+ex, oy+ey);
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
