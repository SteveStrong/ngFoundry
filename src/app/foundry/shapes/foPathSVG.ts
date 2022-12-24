

export class foPathSVG {

    arcToCurve = function arcToCurve(data) {
        let TAU = Math.PI * 2;
        let _slicedToArray = function () {
            function sliceIterator(arr, i) {
                var _arr = [];
                var _n = true;
                var _d = false;
                var _e = undefined;
                try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr;
            } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };
        }();

        let mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
            var x = _ref.x,
                y = _ref.y;

            x *= rx;
            y *= ry;

            var xp = cosphi * x - sinphi * y;
            var yp = sinphi * x + cosphi * y;

            return {
                x: xp + centerx,
                y: yp + centery
            };
        };

        let approxUnitArc = function approxUnitArc(ang1, ang2) {
            var a = 4 / 3 * Math.tan(ang2 / 4);

            var x1 = Math.cos(ang1);
            var y1 = Math.sin(ang1);
            var x2 = Math.cos(ang1 + ang2);
            var y2 = Math.sin(ang1 + ang2);

            return [{
                x: x1 - y1 * a,
                y: y1 + x1 * a
            }, {
                x: x2 + y2 * a,
                y: y2 - x2 * a
            }, {
                x: x2,
                y: y2
            }];
        };

        let vectorAngle = function vectorAngle(ux, uy, vx, vy) {
            var sign = ux * vy - uy * vx < 0 ? -1 : 1;
            var umag = Math.sqrt(ux * ux + uy * uy);
            var vmag = Math.sqrt(ux * ux + uy * uy);
            var dot = ux * vx + uy * vy;

            var div = dot / (umag * vmag);

            if (div > 1) {
                div = 1;
            }

            if (div < -1) {
                div = -1;
            }

            return sign * Math.acos(div);
        };

        let getArcCenter = function getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp) {
            var rxsq = Math.pow(rx, 2);
            var rysq = Math.pow(ry, 2);
            var pxpsq = Math.pow(pxp, 2);
            var pypsq = Math.pow(pyp, 2);

            var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;

            if (radicant < 0) {
                radicant = 0;
            }

            radicant /= rxsq * pypsq + rysq * pxpsq;
            radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);

            var centerxp = radicant * rx / ry * pyp;
            var centeryp = radicant * -ry / rx * pxp;

            var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
            var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;

            var vx1 = (pxp - centerxp) / rx;
            var vy1 = (pyp - centeryp) / ry;
            var vx2 = (-pxp - centerxp) / rx;
            var vy2 = (-pyp - centeryp) / ry;

            var ang1 = vectorAngle(1, 0, vx1, vy1);
            var ang2 = vectorAngle(vx1, vy1, vx2, vy2);

            if (sweepFlag === 0 && ang2 > 0) {
                ang2 -= TAU;
            }

            if (sweepFlag === 1 && ang2 < 0) {
                ang2 += TAU;
            }

            return [centerx, centery, ang1, ang2];
        };

        let arcToBezier = function arcToBezier(_ref2) {
            var px = _ref2.px,
                py = _ref2.py,
                cx = _ref2.cx,
                cy = _ref2.cy,
                rx = _ref2.rx,
                ry = _ref2.ry,
                _ref2$xAxisRotation = _ref2.xAxisRotation,
                xAxisRotation = _ref2$xAxisRotation === undefined ? 0 : _ref2$xAxisRotation,
                _ref2$largeArcFlag = _ref2.largeArcFlag,
                largeArcFlag = _ref2$largeArcFlag === undefined ? 0 : _ref2$largeArcFlag,
                _ref2$sweepFlag = _ref2.sweepFlag,
                sweepFlag = _ref2$sweepFlag === undefined ? 0 : _ref2$sweepFlag;

            var curves = [];

            if (rx === 0 || ry === 0) {
                return [];
            }

            var sinphi = Math.sin(xAxisRotation * TAU / 360);
            var cosphi = Math.cos(xAxisRotation * TAU / 360);

            var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
            var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;

            if (pxp === 0 && pyp === 0) {
                return [];
            }

            rx = Math.abs(rx);
            ry = Math.abs(ry);

            var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);

            if (lambda > 1) {
                rx *= Math.sqrt(lambda);
                ry *= Math.sqrt(lambda);
            }

            var _getArcCenter = getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp),
                _getArcCenter2 = _slicedToArray(_getArcCenter, 4),
                centerx = _getArcCenter2[0],
                centery = _getArcCenter2[1],
                ang1 = _getArcCenter2[2],
                ang2 = _getArcCenter2[3];

            var segments = Math.max(Math.ceil(Math.abs(ang2) / (TAU / 4)), 1);

            ang2 /= segments;

            for (var i = 0; i < segments; i++) {
                curves.push(approxUnitArc(ang1, ang2));
                ang1 += ang2;
            }

            return curves.map(function (curve) {
                var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery),
                    x1 = _mapToEllipse.x,
                    y1 = _mapToEllipse.y;

                var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery),
                    x2 = _mapToEllipse2.x,
                    y2 = _mapToEllipse2.y;

                var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery),
                    x = _mapToEllipse3.x,
                    y = _mapToEllipse3.y;

                return { x1: x1, y1: y1, x2: x2, y2: y2, x: x, y: y };
            });
        };

        return arcToBezier(data);

    }


    absolutize(path) {
        let startX = 0
        let startY = 0
        let x = 0
        let y = 0

        return path.map(function (seg) {
            seg = seg.slice()
            let type = seg[0]
            let command = type.toUpperCase()

            // is relative
            if (type != command) {
                seg[0] = command
                switch (type) {
                    case 'a':
                        seg[6] += x
                        seg[7] += y
                        break
                    case 'v':
                        seg[1] += y
                        break
                    case 'h':
                        seg[1] += x
                        break
                    default:
                        for (let i = 1; i < seg.length;) {
                            seg[i++] += x
                            seg[i++] += y
                        }
                }
            }

            // update cursor state
            switch (command) {
                case 'Z':
                    x = startX
                    y = startY
                    break
                case 'H':
                    x = seg[1]
                    break
                case 'V':
                    y = seg[1]
                    break
                case 'M':
                    x = startX = seg[1]
                    y = startY = seg[2]
                    break
                default:
                    x = seg[seg.length - 2]
                    y = seg[seg.length - 1]
            }

            return seg
        })
    }

    parse(path) {
        let data = [];
        let segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

        function parseValues(args) {
            let number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig
            let numbers = args.match(number)
            return numbers ? numbers.map(Number) : []
        }

        path.replace(segment, function (_, command, arg) {
            let type = command.toLowerCase();
            let args = parseValues(arg);
            let length = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 }

            // overloaded moveTo
            if (type == 'm' && args.length > 2) {
                data.push([command].concat(args.splice(0, 2)))
                type = 'l'
                command = command == 'm' ? 'l' : 'L'
            }

            while (true) {
                if (args.length == length[type]) {
                    args.unshift(command)
                    return data.push(args)
                }
                if (args.length < length[type]) throw new Error('malformed path data')
                data.push([command].concat(args.splice(0, length[type])))
            }
        });
        return data;
    }

    line(x1, y1, x2, y2) {
        return ['C', x1, y1, x2, y2, x2, y2]
    }

    quadratic(x1, y1, cx, cy, x2, y2) {
        return [
            'C',
            x1 / 3 + (2 / 3) * cx,
            y1 / 3 + (2 / 3) * cy,
            x2 / 3 + (2 / 3) * cx,
            y2 / 3 + (2 / 3) * cy,
            x2,
            y2
        ]
    }

    normalize(path) {
        // init state
        var prev
        var result = []
        var bezierX = 0
        var bezierY = 0
        var startX = 0
        var startY = 0
        var quadX = null
        var quadY = null
        var x = 0
        var y = 0

        for (var i = 0, len = path.length; i < len; i++) {
            var seg = path[i]
            var command = seg[0]

            switch (command) {
                case 'M':
                    startX = seg[1]
                    startY = seg[2]
                    break
                case 'A':
                    var curves = this.arcToCurve({
                        px: x,
                        py: y,
                        cx: seg[6],
                        cy: seg[7],
                        rx: seg[1],
                        ry: seg[2],
                        xAxisRotation: seg[3],
                        largeArcFlag: seg[4],
                        sweepFlag: seg[5]
                    })

                    // null-curves
                    if (!curves.length) continue

                    for (var j = 0, c; j < curves.length; j++) {
                        c = curves[j]
                        seg = ['C', c.x1, c.y1, c.x2, c.y2, c.x, c.y]
                        if (j < curves.length - 1) result.push(seg)
                    }

                    break
                case 'S':
                    // default control point
                    var cx = x
                    var cy = y
                    if (prev == 'C' || prev == 'S') {
                        cx += cx - bezierX // reflect the previous command's control
                        cy += cy - bezierY // point relative to the current point
                    }
                    seg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]]
                    break
                case 'T':
                    if (prev == 'Q' || prev == 'T') {
                        quadX = x * 2 - quadX // as with 'S' reflect previous control point
                        quadY = y * 2 - quadY
                    } else {
                        quadX = x
                        quadY = y
                    }
                    seg = this.quadratic(x, y, quadX, quadY, seg[1], seg[2])
                    break
                case 'Q':
                    quadX = seg[1]
                    quadY = seg[2]
                    seg = this.quadratic(x, y, seg[1], seg[2], seg[3], seg[4])
                    break
                case 'L':
                    seg = this.line(x, y, seg[1], seg[2])
                    break
                case 'H':
                    seg = this.line(x, y, seg[1], y)
                    break
                case 'V':
                    seg = this.line(x, y, x, seg[1])
                    break
                case 'Z':
                    seg = this.line(x, y, startX, startY)
                    break
            }

            // update state
            prev = command
            x = seg[seg.length - 2]
            y = seg[seg.length - 1]
            if (seg.length > 4) {
                bezierX = seg[seg.length - 4]
                bezierY = seg[seg.length - 3]
            } else {
                bezierX = x
                bezierY = y
            }
            result.push(seg)
        }

        return result
    }

    convert(path): string {
        let a = this.parse(path);
        let b = this.absolutize(a);
        let c = this.normalize(b)
        return c.map(seg => seg.join(' ')).join('');
    }

    pathBounds(path) {
        let a = this.parse(path);
        let b = this.absolutize(a);
        let c = this.normalize(b);
        let normal = c.map(seg => seg.join(' ')).join('');

        var bounds = [Infinity, Infinity, -Infinity, -Infinity]

        for (var i = 0, l = c.length; i < l; i++) {
            var points = c[i].slice(1)

            for (var j = 0; j < points.length; j += 2) {
                if (points[j + 0] < bounds[0]) bounds[0] = points[j + 0]
                if (points[j + 1] < bounds[1]) bounds[1] = points[j + 1]
                if (points[j + 0] > bounds[2]) bounds[2] = points[j + 0]
                if (points[j + 1] > bounds[3]) bounds[3] = points[j + 1]
            }
        }

        return {
            normal,
            bounds
        }
    }

}

export let PathSVG: foPathSVG = new foPathSVG();