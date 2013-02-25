function irrationalTriangle(ctx, width, height) {
    var size = Math.min(width, height);
    var sqrt3 = Math.sqrt(3);
    var h = (1 - sqrt3/2) / 2;
    var colors = ['rgba(0,128,192,0.25)', 'rgba(0,128,192,0.5)', 'rgba(0,128,192,0.9)', 'rgba(0,64,96,0.99)',];

    construct([{x: .5, y: h+sqrt3/2},
               {x: 0,  y: h},
               {x: 1,  y: h}],
              0);

    function construct(triangle, color) {
        var crossing = [];
        for (var i = 0; i < 3; ++i) {
            var u = add(triangle[i], scale(1/sqrt3, sub(triangle[(i+1)%3], triangle[i])));
            var v = add(triangle[i], scale(1/sqrt3, sub(triangle[(i+2)%3], triangle[i])));
            drawTriangle([triangle[i], u, v], colors[color % colors.length]);
            crossing.push([u, v]);
        }
        if (0.32 < norm(triangle[0], triangle[1])) {
            var central = [];
            for (var j = 0; j < 3; ++j) {
                central.push(intersect(crossing[j], crossing[(j+1)%3]));
            }
            construct(central, color+1);
        }
    }

    // Return the point where the lines through points1 and points2 coincide.
    // Pre: the lines are linearly independent.
    function intersect(points1, points2) {
        // http://en.wikipedia.org/wiki/Line-line_intersection
        var x1 = points1[0].x, y1 = points1[0].y;
        var x2 = points1[1].x, y2 = points1[1].y;
        var x3 = points2[0].x, y3 = points2[0].y;
        var x4 = points2[1].x, y4 = points2[1].y;
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

    function drawTriangle(triangle, color) {
//        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(size * triangle[0].x, size * triangle[0].y);
        ctx.lineTo(size * triangle[1].x, size * triangle[1].y);
        ctx.lineTo(size * triangle[2].x, size * triangle[2].y);
        ctx.fill();

//        ctx.closePath();
//        ctx.stroke();
    }
}
