// TODO
//  leapfrog or something, not forward euler

var x = 1, y = 0;
var vx = 0, vy = 1;
var G = 1;
var M = 1;
var dt = 0.02;

function step() {
    // F = GMmr/r^3
    // r'' = GM r/r^3
    var r2 = x*x + y*y;
    var gr = G * Math.pow(r2, -1.5);
    var Mgr = -M * gr;
    var ax = Mgr * x;
    var ay = Mgr * y;
    x += vx * dt, y += vy * dt;
    vx += ax * dt, vy += ay * dt;
    console.log('x ' + x + ', y ' + y);
    plotMe();
}

var xscale = 4; // -xscale..xscale is visible, in world coords
var yscale = 4;

function plotMe() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(width/2, height/2, 8, 2*Math.PI, false);
    ctx.fill();
    var cx = width/2 * (1 + x/xscale);  // canvas coords
    var cy = height/2 * (1 + y/yscale);
    drawLine({x: cx-10, y: cy-5}, {x: cx+5, y:cy+10}, 'white');
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
