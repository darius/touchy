'use strict';

function distance(p, q) {
    return Math.hypot(p.x - q.x,
                      p.y - q.y);
}

// Return a list of the points on both circle1 and circle2.
// Pre: circle1 and circle2 are distinct
function intersections(center1, r1, center2, r2) {
    return circle_circle_intersection(center1.x, center1.y, r1,
                                      center2.x, center2.y, r2);
}

// Ported from http://paulbourke.net/geometry/2circle/
function circle_circle_intersection(x0, y0, r0,
                                    x1, y1, r1) {
    // dx and dy are the vertical and horizontal distances between
    // the circle centers.
    const dx = x1 - x0;
    const dy = y1 - y0;

    // Determine the straight-line distance between the centers.
    const d = Math.hypot(dx, dy);

    // Check for solvability.
    if (r0 + r1 < d) {
        return []; // no solution. circles do not intersect.
    }
    if (d < Math.abs(r0 - r1)) {
        return []; // no solution. one circle is contained in the other
    }
    if (d === 0) return []; // XXX djb

    // 'point 2' is the point where the line through the circle
    // intersection points crosses the line between the circle
    // centers.  

    // Determine the distance from point 0 to point 2.
    const a = (r0*r0 - r1*r1 + d*d) / (2.0 * d);

    // Determine the coordinates of point 2.
    const x2 = x0 + (dx * a/d);
    const y2 = y0 + (dy * a/d);

    // Determine the distance from point 2 to either of the
    // intersection points.
    const h = Math.sqrt(r0*r0 - a*a);

    // Now determine the offsets of the intersection points from
    // point 2.
    const rx = -dy * (h/d);
    const ry =  dx * (h/d);

    // Determine the absolute intersection points.
    return [{x: x2 + rx, y: y2 + ry},
            {x: x2 - rx, y: y2 - ry}];
}

function run_test(x0, y0, r0,
                  x1, y1, r1) {
    const a = circle_circle_intersection(x0, y0, r0, x1, y1, r1);
    return show(a);
}

function show(a) {
    let rv = '';
    for (let i = 0; i < a.length; ++i)
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
