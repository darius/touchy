var points = [{x: -.25, y: 0},
              {x: .25, y: 0}];
/// show(points)
//.  (0.000,0.000) (1.000,0.000)
/// (step())
//. ReferenceError: console is not defined

function plots(ps, size) {
    for (var i = 0; i < ps.length; ++i)
        plot(ps[i].x, ps[i].y, size);
}

function plot(x, y, size) {
//    console.log('plot' + show([{x:x, y:y}]));
    var cx = width/2 + x * xscale;
    var cy = height/2 - y * yscale;
//    console.log('canvas' + show([{x:cx, y:cy}]));
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, 2*Math.PI, true);
    ctx.fill();
}

function step() {
    var newpoints = [];
    for (var i = 0; i < points.length; ++i) {
        var pi = points[i];
        for (var j = 0; j < points.length; ++j)
            if (i !== j) {
                var pj = points[j];
                for (var k = 0; k < points.length; ++k) {
                    var pk = points[k];
                    for (var m = 0; m < points.length; ++m)
                        if (k !== m && !(i === k && j === m)) {
                            var pm = points[m];
//                            console.log(show([pi, pj, pk, pm]));
                            addPoints(newpoints, pi, pj, pk, pm);
                        }
                }
            }
    }
    points = points.concat(newpoints);
    return newpoints;
}

function addPoints(newpoints, pi, pj, pk, pm) {
    var sects = intersections(pi, distance2(pi, pj),
                              pk, distance2(pk, pm));
    for (var i = 0; i < sects.length; ++i)
        if (!member(points, sects[i]) && !member(newpoints, sects[i]))
            newpoints.push(sects[i]);
}

function distance2(p, q) {
    var dx = p.x - q.x;
    var dy = p.y - q.y;
//    console.log('distance2 ' + show([p]) + ', ' + show([q])
//                + ' = ' + (dx*dx + dy*dy));
    return dx*dx + dy*dy;
}

var epsilon = 1e-9;

function member(ps, p) {
    for (var i = 0; i < ps.length; ++i)
        if (Math.abs(ps[i].x - p.x) <= epsilon
            && Math.abs(ps[i].y - p.y) <= epsilon)
            return true;
    return false;
}

// Return a list of the points on both circle1 and circle2.
// Pre: circle1 and circle2 are distinct
function intersections(center1, rsquared1, center2, rsquared2) {
    return circle_circle_intersection(
        center1.x, center1.y, Math.sqrt(rsquared1),
        center2.x, center2.y, Math.sqrt(rsquared2));
}

// Ported from http://paulbourke.net/geometry/2circle/
function circle_circle_intersection(x0, y0, r0,
                                    x1, y1, r1) {
    var a, dx, dy, d, h, rx, ry;
    var x2, y2;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return [];
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return [];
    }
    if (d === 0) return []; // XXX djb

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.  
     */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d);

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a/d);
    y2 = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    return [{x: x2 + rx, y: y2 + ry},
            {x: x2 - rx, y: y2 - ry}];
}

function run_test(x0, y0, r0,
                  x1, y1, r1) {
    var x3, y3, x3_prime, y3_prime;

    var a = circle_circle_intersection(x0, y0, r0, x1, y1, r1);
    return show(a);
}

function show(a) {
    var rv = '';
    for (var i = 0; i < a.length; ++i)
        rv += ' (' + a[i].x.toPrecision(4) + ',' + a[i].y.toPrecision(4) + ')';
    return rv;
}

/*
/// run_test(-1.0, -1.0, 1.5, 1.0, 1.0, 2.0)
//.  (-0.9361,0.4986) (0.4986,-0.9361)
  x3=-0.936140, y3=0.498640, x3_prime=0.498640, y3_prime=-0.936140
///  run_test(1.0, -1.0, 1.5, -1.0, 1.0, 2.0);
//.  (-0.4986,-0.9361) (0.9361,0.4986)
  x3=-0.498640, y3=-0.936140, x3_prime=0.936140, y3_prime=0.498640
///  run_test(-1.0, 1.0, 1.5, 1.0, -1.0, 2.0);
//.  (0.4986,0.9361) (-0.9361,-0.4986)
  x3=0.498640, y3=0.936140, x3_prime=-0.936140, y3_prime=-0.498640
///  run_test(1.0, 1.0, 1.5, -1.0, -1.0, 2.0);
//.  (0.9361,-0.4986) (-0.4986,0.9361)
  x3=0.936140, y3=-0.498640, x3_prime=-0.498640, y3_prime=0.936140
*/
