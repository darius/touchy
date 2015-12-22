var ctx; // for debug
function interact(canvas, report) {
    var width = 0+canvas.width;
    var height = 0+canvas.height;
    var ox = width/2;
    var oy = height/2;

    ctx = canvas.getContext('2d');
    ctx.lineWidth = 8;
    ctx.lineCap = 'butt';

    var endpoints = [];
    var path = [];

    function show() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for (var i = 0; i < 6; ++i) {
            drawPath();
            ctx.scale(-1, 1);
            drawPath();
            ctx.rotate(Math.PI/6);
            ctx.scale(-1, 1);
            ctx.rotate(-Math.PI/6);
        }
        ctx.restore();
    }

    function drawPath() {
        path.forEach(function(point, i) {
            if (i === 0) return;
            ctx.beginPath();
            ctx.moveTo(path[i-1].x, path[i-1].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        });
    }

    function add(xy) {
        xy = {x: xy.x-ox,
              y: xy.y-oy};
        path.push(xy);
        show();
    }

    function onMousedown(xy) {
        endpoints[0] = true;
        add(xy);
        event.preventDefault();
    }

    function onMousemove(xy) {
        if (endpoints[0] === void 0) return;
        add(xy);
        event.preventDefault();
    }

    function onMouseup() {
        delete endpoints[0];
        event.preventDefault();
    }

    canvas.addEventListener('mousedown', pointing.leftButtonOnly(pointing.mouseHandler(canvas, onMousedown)));
    canvas.addEventListener('mousemove', pointing.mouseHandler(canvas, onMousemove));
    canvas.addEventListener('mouseup',   pointing.mouseHandler(canvas, onMouseup));

    report('Starting');
}

var canvas = document.getElementById('canvas');
var debug = document.getElementById('debug');
function report(html) {
    if (false) debug.innerHTML += '<br>' + html;
}

interact(canvas, report);
