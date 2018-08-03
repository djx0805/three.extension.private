let caculateEarthWork = function (boundCoords, depth) {
    let tmp = tjh.util.PolygonUtil.polygonTriangulate([boundCoords]);
    //
    let gf = new jsts.geom.GeometryFactory();
    let area = 0;
    for (let n = 0, numFace = tmp.length / 9; n < numFace; n++) {
        let cds = [new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9], tmp[(numFace - 1 - n) * 9 + 1], 0),
            new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9 + 3], tmp[(numFace - 1 - n) * 9 + 4], 0),
            new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9 + 6], tmp[(numFace - 1 - n) * 9 + 7], 0),
            new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9], tmp[(numFace - 1 - n) * 9 + 1], 0)];
        //
        let ply = gf.createPolygon(cds);
        area += Math.abs(ply.getArea());
    }
    //
    return area * depth;
};
