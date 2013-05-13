var x_sun = width/2;
var y_sun = height/2;

// Find the canvas top-left.  XXX simpler way?
var canvasLeft = 0, canvasTop = 0;
(function() {
    for (var element = canvas; element !== null; element = element.offsetParent) {
        canvasLeft += element.offsetLeft;
        canvasTop  += element.offsetTop;
    }
})();

// Track the mouse.
var x_rel = 0;
var y_rel = 1;
document.addEventListener('mousemove', function(event) {
    // Mouse coords relative to the canvas center (in a right-handed
    // coordinate system). We're only going to use the direction; we
    // don't care about the magnitude.
    x_rel = event.clientX - (canvasLeft + x_sun);
    y_rel = (canvasTop + y_sun) - event.clientY;
});

var x = 1, y = 0;
var vx = 0, vy = 1;
var x_planet = 3, y_planet = 0;
var vx_planet = 0, vy_planet = 0.6;
var G = 1;
var M = 1;
var pressureScale = 20e-2;
var dt = 0.01;
var tau = 2 * Math.PI;
var forceScale = 300;

var x_trail = new Array(2000);
var y_trail = new Array(2000);
var trailAt = 0;
var nsteps = 0;

function step() {
    ++nsteps;

    // Compute the sail's tilt.
    var x_sail = 1;
    var y_sail = 0;
    // Rotate (x_rel,y_rel) relative to the sail's offset from the sun.
    // We're going to normalize the magnitude, so to rotate we can just
    // multiply complex numbers; no need to extract and add angles.
    // (x+yi)*(u+vi)*i = -(xv+yu) + (xu-yv)i
    var x_tilt = -(x*y_rel + y*x_rel);
    var y_tilt = x*x_rel - y*y_rel;
    var norm = Math.sqrt(x_tilt*x_tilt + y_tilt*y_tilt);
    if (norm !== 0) { // Make it a unit vector.
        x_sail = x_tilt / norm;
        y_sail = y_tilt / norm;
    }

    var r2 = x*x + y*y;

    // Gravity: r'' = F/m = -GM r/r^3
    var Mgr3 = (-G*M) * Math.pow(r2, -1.5);
    var ax_g = Mgr3 * x;
    var ay_g = Mgr3 * y;

    // Light pressure
    var along = x_sail * y - y_sail * x;
    var pressure = (-pressureScale * along * Math.abs(along)
                    / (r2*r2));
    var ax_p = pressure * y_sail;   // directed along the normal
    var ay_p = pressure * -x_sail;

    // Motion: http://en.wikipedia.org/wiki/Symplectic_Euler_method
    // to get a stable orbit when pressure == 0.
    vx += (ax_g + ax_p) * dt;
    vy += (ay_g + ay_p) * dt;
    x += vx * dt;
    y += vy * dt;

    // Gravity and motion for the planet
    var r2_p = x_planet*x_planet + y_planet*y_planet;
    var Mgr3_p = (-G*M) * Math.pow(r2_p, -1.5);
    var ax_gp = Mgr3_p * x_planet;
    var ay_gp = Mgr3_p * y_planet;
    vx_planet += (ax_gp) * dt;
    vy_planet += (ay_gp) * dt;
    x_planet += vx_planet * dt;
    y_planet += vy_planet * dt;

    plotMe(x_sail, y_sail, {x: ax_g, y: ay_g}, {x: ax_p, y: ay_p}, {x: ax_gp, y: ay_gp});
}

var xscale = 4; // -xscale..xscale is visible, in world coords
var yscale = 4;

function plotMe(x_sail, y_sail, ag, ap) {
    // Outer space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // The sun
    ctx.fillStyle = 'yellow';
    fillCircle(width/2, height/2, 8);

    // The sail and the forces on it
    var cx = width/2 * (1 + x/xscale);  // canvas coords
    var cy = height/2 * (1 - y/yscale);
    var atx = 10 * x_sail;
    var aty = -10 * y_sail;
    drawLine({x: cx-atx, y: cy-aty},
             {x: cx+atx, y: cy+aty},
             'white');
    drawLine({x: cx, y: cy},
             {x: cx+ag.x*forceScale, y: cy-ag.y*forceScale},
             'yellow');
    drawLine({x: cx, y: cy},
             {x: cx+ap.x*forceScale, y: cy-ap.y*forceScale},
             'yellow');

    // The planet and its trail
    ctx.fillStyle = 'blue';
    for (var i = 0; i < x_trail.length; ++i)
        fillCircle(x_trail[i], y_trail[i], 0.5);
    cx = width/2 * (1 + x_planet/xscale);  // canvas coords
    cy = height/2 * (1 - y_planet/yscale);
    if (nsteps % 1 === 0) {
        x_trail[trailAt] = cx;
        y_trail[trailAt] = cy;
        trailAt = (trailAt + 1) % x_trail.length;
    }
    fillCircle(cx, cy, 4);
}

function fillCircle(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, tau, false);
    ctx.fill();
}

function drawLine(start, end, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}
