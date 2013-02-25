// Earlier stage of attempting this, quite broken, but the resulting
// image was kind of interesting.
function irrationalTriangle(ctx, width, height) {
    var size = Math.min(width, height);
    var sqrt3 = Math.sqrt(3);
    var h = (1 - sqrt3/2) / 2;
    construct([{x: .5, y: h+sqrt3/2},
               {x: 0,  y: h},
               {x: 1,  y: h}]);

    function construct(triangle) {
        var p = triangle;
        var smaller = distance(p[0], p[1]) / sqrt3;
        var crossing = [];
        for (var i = 0; i < 3; ++i) {
            var u = add(p[i], scale(smaller, sub(p[(i+1)%3], p[i])));
            var v = add(p[i], scale(smaller, sub(p[(i+2)%3], p[i])));
            drawTriangle(p[i], u, v, 'black');
            crossing.push([u, v]);
        }
        if (0.1 < smaller) {
            var central = [];
            for (var j = 0; j < 3; ++j) {
                central.push(intersect(crossing[j], crossing[(j+1)%3]));
            }
            construct(central);
        }
    }

    // Return the point where the lines s->u+s*p and t->v+t*q coincide.
    // Pre: u and v are linearly independent.
    function intersect(points1, points2) {
        var x1 = points1[0].x;
        var x2 = points1[1].x;
        var x3 = points2[0].x;
        var x4 = points2[1].x;
        var y1 = points1[0].y;
        var y2 = points1[1].y;
        var y3 = points2[0].y;
        var y4 = points2[1].y;
        var denom = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
        return {x: (((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))
                    / denom),
                y: (((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))
                    / denom)};
    }

    function distance(u, v) { return Math.sqrt(norm(sub(u, v))); }
    function norm(v)        { return dot(v, v); }
    function dot(u, v)      { return u.x*v.x + u.y*v.y; }
    function sub(u, v)      { return add(u, scale(-1, v)); }
    function scale(c, v)    { return {x: c*v.x, y: c*v.y}; }
    function add(u, v)      { return {x: u.x+v.x, y: u.y+v.y}; }

    function drawTriangle(u, v, w, color) {
        drawLine(u, v, color);
        drawLine(v, w, color);
        drawLine(w, u, color);
    }
    function drawLine(start, end, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(size * start.x, size * start.y);
        ctx.lineTo(size * end.x,   size * end.y);
        ctx.stroke();
        ctx.closePath();
    }
}
