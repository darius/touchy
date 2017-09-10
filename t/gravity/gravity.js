'use strict';

function animLoop(render) {
    requestAnimFrame(function(then) {
        function loop(now) {
            if (!render(now - then, now))
                requestAnimFrame(loop);
            then = now;
        }
        if (!render(0, then))
            requestAnimFrame(loop)
    });
}

var x_sun = width/2;
var y_sun = height/2;
var sail_active = true;

// Generate background stars.
var stars = [];
for (var i = 0; i < 75; i++) {
    stars.push({
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        size: Math.floor(Math.random() * 4 + 1) / 2
    });
}

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
document.addEventListener('click', function(event) {
    sail_active = !sail_active;
});

var x = 1, y = 0;
var vx = 0, vy = 1;
var x_planet = 3, y_planet = 0;
var vx_planet = 0, vy_planet = 0.6;
var G = 1;
var M = 1;
var pressureScale = 30e-2;
var tau = 2 * Math.PI;
var forceScale = 300;

var x_trail = new Array(2000);
var y_trail = new Array(2000);
var trailAt = 0;
var nsteps = 0;

function calcGravity(x, y) {
    var r2 = x*x + y*y;
    // Gravity: r'' = F/m = -GM r/r^3
    var Mgr3 = (-G*M) * Math.pow(r2, -1.5);
    return {
        ax_g: Mgr3 * x,
        ay_g: Mgr3 * y
    };
}

// Compute the future location of the ship for an entire orbit
// and plot it in red.
function plotOrbit(x, y, vx, vy, dt) {
    var angle = Math.atan2(x, y);
    var angle_traveled = 0;
    var i = 0;
    var c = toCanvasCoords(x, y);
    var cx_last = c.x;
    var cy_last = c.y;
    // Stop when we've traversed an entire orbit, or hit the 5000
    // step cut-off.
    while (Math.abs(angle_traveled) < Math.PI * 2 && ++i < 5000) {
        var grav = calcGravity(x, y);
        vx += grav.ax_g * dt;
        vy += grav.ay_g * dt;
        x += vx * dt;
        y += vy * dt;
        c = toCanvasCoords(x, y);
        drawLine({x: cx_last, y: cy_last}, {x: c.x, y: c.y}, 'red');
        cx_last = c.x;
        cy_last = c.y;
        var new_angle = Math.atan2(x, y);
        // Ignore the transition between positive and negative PI.
        if (new_angle > 0 === angle > 0) {
            angle_traveled += angle - new_angle;
        }
        angle = new_angle;
    }
}

function step(timeInterval) {
    var dt = 0.01 * timeInterval / (1000/60);
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

    var grav = calcGravity(x, y);

    // Light pressure
    var along = x_sail * y - y_sail * x;
    var r2 = x*x + y*y;
    var pressure = (-pressureScale * along * Math.abs(along)
                    / (r2*r2));
    var ax_p = pressure * y_sail * sail_active;   // directed along the normal
    var ay_p = pressure * -x_sail * sail_active;

    // Motion: http://en.wikipedia.org/wiki/Symplectic_Euler_method
    // to get a stable orbit when pressure == 0.
    vx += (grav.ax_g + ax_p) * dt;
    vy += (grav.ay_g + ay_p) * dt;
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

    drawBackground();
    plotOrbit(x, y, vx, vy, dt);
    plotMe(x_sail, y_sail, {x: grav.ax_g, y: grav.ay_g}, {x: ax_p, y: ay_p}, {x: ax_gp, y: ay_gp});
}

var xscale = 4; // -xscale..xscale is visible, in world coords
var yscale = 4;

function toCanvasCoords(x, y) {
    return {
        x: width/2 * (1 + x/xscale),
        y: height/2 * (1 - y/yscale)
    };
}

function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        fillCircle(star.x, star.y, star.size, 'white');
    }
}

function plotMe(x_sail, y_sail, ag, ap) {
    // The sun
    fillCircle(width/2, height/2, 8, 'yellow');

    var c = toCanvasCoords(x, y);
    if (sail_active) {
        // The sail and the forces on it
        var atx = 10 * x_sail;
        var aty = -10 * y_sail;
        drawLine({x: c.x-atx, y: c.y-aty},
            {x: c.x+atx, y: c.y+aty},
            'white');
        drawLine({x: c.x, y: c.y},
            {x: c.x+ag.x*forceScale, y: c.y-ag.y*forceScale},
            'yellow');
        drawLine({x: c.x, y: c.y},
            {x: c.x+ap.x*forceScale, y: c.y-ap.y*forceScale},
            'yellow');
    } else {
        fillCircle(c.x, c.y, 2, 'white');
    }

    // The planet and its trail
    for (var i = 0; i < x_trail.length; ++i) {
        fillCircle(x_trail[i], y_trail[i], 0.5, 'blue');
    }
    var pc = {
        x: width/2 * (1 + x_planet/xscale),
        y: height/2 * (1 - y_planet/yscale)
    };
    if (nsteps % 1 === 0) {
        x_trail[trailAt] = pc.x;
        y_trail[trailAt] = pc.y;
        trailAt = (trailAt + 1) % x_trail.length;
    }
    fillCircle(pc.x, pc.y, 4, 'blue');
}

function fillCircle(cx, cy, radius, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
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
