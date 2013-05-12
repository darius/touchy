// TODO
//  leapfrog or something, not forward euler

var tx = 3/5;   // (tx,ty) is a unit vector, the sail's attitude
var ty = 4/5;

// Find the canvas top-left.
var canvasLeft = 0, canvasTop = 0;
(function() {
    for (var element = canvas; element !== null; element = element.offsetParent) {
        canvasLeft += element.offsetLeft;
        canvasTop  += element.offsetTop;
    }
})();

// Track the mouse coordinates relative to canvas top-left.
var mouseX = 0, mouseY = 0;
canvas.addEventListener('mousemove', function(event) {
    mouseX = event.clientX - canvasLeft;
    mouseY = event.clientY - canvasTop;
    tx = mouseX - width/2;
    ty = height/2 - mouseY;
    var norm = Math.sqrt(tx*tx + ty*ty);
    tx /= norm, ty /= norm;     // XXX divide by 0
});

var x = 1, y = 0;
var vx = 0, vy = 1;
var G = 1;
var M = 1;
var dt = 0.02;
var pressureScale = 5e-2;  // fill me in
var tau = 2 * Math.PI;

function step() {
    // F = GMmr/r^3
    // r'' = GM r/r^3
    var r2 = x*x + y*y;

    // Gravity
    var gr = G * Math.pow(r2, -1.5);
    var Mgr = -M * gr;
    var ax = Mgr * x;
    var ay = Mgr * y;

    // Light pressure
    var pressure = tx * -y - ty * -x;
//    pressure = Math.abs(pressure); // back side is also reflective
    pressure *= pressureScale / r2;
    ax += pressure * ty;   // directed along the normal
    ay -= pressure * tx;

    // Motion
    x += vx * dt, y += vy * dt;
    vx += ax * dt, vy += ay * dt;
    if (false) console.log('x ' + x + ', y ' + y);
    plotMe({x: Mgr*x, y: Mgr*y}, {x: pressure * ty, y: pressure * -tx});
}

var xscale = 4; // -xscale..xscale is visible, in world coords
var yscale = 4;

function plotMe(ag, ap) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(width/2, height/2, 8, tau, false);
    ctx.fill();
    var cx = width/2 * (1 + x/xscale);  // canvas coords
    var cy = height/2 * (1 - y/yscale);
    var atx = 10 * tx;
    var aty = -10 * ty;
    drawLine({x: cx-atx, y: cy-aty},
             {x: cx+atx, y: cy+aty},
             'white');
    if (false) console.log(ag, ap);
    drawLine({x: cx, y: cy},
             {x: cx+ag.x*100, y: cy-ag.y*100},
             'red');
    drawLine({x: cx, y: cy},
             {x: cx+ap.x*1000, y: cy-ap.y*1000},
             'yellow');
}

function drawLine(start, end, color) {
    if (false) report(' ' + start.x + ',' + start.y
                      + ' -> ' + end.x + ',' + end.y + ' / ' + color);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}
