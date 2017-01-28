'use strict';

let points = [{x: -.25, y: 0},
              {x: .25, y: 0}];
/// show(points)
//.  (0.000,0.000) (1.000,0.000)
/// (step())
//. ReferenceError: console is not defined

function plots(ps, size) {
    for (let i = 0; i < ps.length; ++i)
        plot(ps[i].x, ps[i].y, size);
}

const tau = 2*Math.PI;

function plot(x, y, size) {
//    console.log('plot' + show([{x:x, y:y}]));
    const cx = width/2  + x * xscale;
    const cy = height/2 - y * yscale;
//    console.log('canvas' + show([{x:cx, y:cy}]));
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, tau, true);
    ctx.fill();
}

function step() {
    const newpoints = [];
    for (let i = 0; i < points.length; ++i) {
        const pi = points[i];
        for (let j = 0; j < points.length; ++j)
            if (i !== j) {
                const pj = points[j];
                for (let k = 0; k < points.length; ++k) {
                    const pk = points[k];
                    for (let m = 0; m < points.length; ++m)
                        if (k !== m && !(i === k && j === m)) {
                            const pm = points[m];
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
    const sects = intersections(pi, distance(pi, pj),
                                pk, distance(pk, pm));
    for (let i = 0; i < sects.length; ++i)
        if (!member(points, sects[i]) && !member(newpoints, sects[i]))
            newpoints.push(sects[i]);
}

const epsilon = 1e-9;

function member(ps, p) {
    for (let i = 0; i < ps.length; ++i)
        if (Math.abs(ps[i].x - p.x) <= epsilon
            && Math.abs(ps[i].y - p.y) <= epsilon)
            return true;
    return false;
}
