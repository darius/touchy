'use strict';

var ctx; // for debug
function interact(canvas, paths) {
    var width = 0+canvas.width;
    var height = 0+canvas.height;
    var ox = width/2;
    var oy = height/2;

    ctx = canvas.getContext('2d');
    ctx.lineWidth = 8;
    ctx.lineCap = 'butt';

    var endpoints = [];

    function show() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for (var i = 0; i < 6; ++i) {
            drawPaths();
            ctx.scale(-1, 1);
            drawPaths();
            ctx.rotate(Math.PI/6);
            ctx.scale(-1, 1);
            ctx.rotate(-Math.PI/6);
        }
        ctx.restore();
    }

    function drawPaths() {
        paths.forEach(function(path) {
            path.forEach(function(point, i) {
                if (i === 0) return;
                ctx.beginPath();
                ctx.moveTo(path[i-1].x, path[i-1].y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            });
        });
    }

    function add(xy) {
        xy = {x: xy.x-ox,
              y: xy.y-oy};
        paths[paths.length-1].push(xy);
        show();
        permalink.href = encodeState(document.URL, paths);
    }

    function onMousedown(xy) {
        endpoints[0] = true;
        paths.push([]);
        add(xy);
        event.preventDefault();
    }

    function onMousemove(xy) {
        if (endpoints[0] === void 0) return;
        add(xy);
    }

    function onMouseup() {
        delete endpoints[0];
        console.log(paths.reduce((sum, a) => sum + a.length, 0));
    }

    canvas.addEventListener('mousedown', pointing.leftButtonOnly(pointing.mouseHandler(canvas, onMousedown)));
    canvas.addEventListener('mousemove', pointing.mouseHandler(canvas, onMousemove));
    canvas.addEventListener('mouseup',   pointing.mouseHandler(canvas, onMouseup));

    show();
}

function encodeState(url, paths) {
    var qmark = url.indexOf('?');
    var base = qmark < 0 ? url : url.substring(0, qmark);
    return base + '?s=' + encodeURIComponent(encodeScene(paths));
}

function decodeParams(url) {
    var result = {};
    var qmark = url.indexOf('?');
    if (0 <= qmark) {
        var pairs = url.substring(qmark+1, url.length).split('&');
        for (var i = 0; i < pairs.length; ++i) {
	    var kv = pairs[i].split('=', 2);
	    result[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
        }
    }
    return result;
}

function encodeScene(paths) {
    return paths.map(path => deltas(path.map(xy => xy.x)) + '~' + deltas(path.map(xy => xy.y))).join('/');
}

function deltas(points) {
    var prev = 0.0;
    return points.map(p => {
        const delta = '' + (p - prev);
        prev = p;
        return delta;
    }).join('_');
}

function deltaDecode(string) {
    var acc = 0.0;
    return string.split('_').map(d => acc += parseFloat(d));
}

function decodeScene(scene) {
    try {
        return scene.split('/').map(s => makeXYs(s.split('~').map(deltaDecode)));
    } catch (e) {
        // Because my decoding code is sloppy about syntax errors, we fall back to this:
        console.log('Error decoding', e);
        return [];
    }
}

function makeXYs(coordArrays) {
    var result = [];
    var length = coordArrays[0].length;
    for (var i = 0; i < length; ++i) {
        result.push({x: coordArrays[0][i], y: coordArrays[1][i]});
    }
    return result;
}

var params = decodeParams(document.URL);
if (params.s) interact(canvas, decodeScene(params.s))
else          interact(canvas, []);
