// TODO
//  leapfrog or something, not forward euler

var x_sail = 3/5;   // (x_sail,y_sail) is a unit vector, the sail's attitude
var y_sail = 4/5;

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
    x_sail = mouseX - width/2;
    y_sail = height/2 - mouseY;
    var norm = Math.sqrt(x_sail*x_sail + y_sail*y_sail);
    x_sail /= norm, y_sail /= norm;     // XXX divide by 0
});

var x = 1, y = 0;
var vx = 0, vy = 1;
var x_planet = 1.5, y_planet = 0;
var vx_planet = 0, vy_planet = 0.75;
var G = 1;
var M = 1;
var pressureScale = 5e-2;
var dt = 0.01;
var tau = 2 * Math.PI;

function step() {
    var r2 = x*x + y*y;

    // Gravity: r'' = F/m = -GM r/r^3
    var Mgr3 = (-G*M) * Math.pow(r2, -1.5);
    var ax_g = Mgr3 * x;
    var ay_g = Mgr3 * y;

    // Light pressure
    var pressure = (x_sail * y - y_sail * x) * -pressureScale / r2;
    var ax_p = pressure * y_sail;   // directed along the normal
    var ay_p = pressure * -x_sail;

    // Motion: http://en.wikipedia.org/wiki/Symplectic_Euler_method
    // to get a stable orbit when pressure == 0.
    vx += (ax_g + ax_p) * dt;
    vy += (ay_g + ay_p) * dt;
    x += vx * dt;
    y += vy * dt;
    if (false) console.log('x ' + x + ', y ' + y);

    // Gravity and motion for the planet
    var r2_p = x_planet*x_planet + y_planet*y_planet;
    var Mgr3_p = (-G*M) * Math.pow(r2_p, -1.5);
    var ax_gp = Mgr3_p * x_planet;
    var ay_gp = Mgr3_p * y_planet;
    vx_planet += (ax_gp) * dt;
    vy_planet += (ay_gp) * dt;
    x_planet += vx_planet * dt;
    y_planet += vy_planet * dt;

    plotMe({x: ax_g, y: ay_g}, {x: ax_p, y: ay_p}, {x: ax_gp, y: ay_gp});
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
    var atx = 10 * x_sail;
    var aty = -10 * y_sail;
    drawLine({x: cx-atx, y: cy-aty},
             {x: cx+atx, y: cy+aty},
             'white');
    if (false) console.log(ag, ap);
    drawLine({x: cx, y: cy},
             {x: cx+ag.x*100, y: cy-ag.y*100},
             'red');
    drawLine({x: cx, y: cy},
             {x: cx+ap.x*100, y: cy-ap.y*100},
             'yellow');

    cx = width/2 * (1 + x_planet/xscale);  // canvas coords
    cy = height/2 * (1 - y_planet/yscale);
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, tau, false);
    ctx.fill();
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
