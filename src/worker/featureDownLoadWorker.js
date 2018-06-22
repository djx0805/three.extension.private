importScripts('../../node_modules/three/build/three.js')
/**
 *  存储所要转发数据
 */
function featureData() {
    data:null;
    featuresType: "";
    version:0;
};
function fetchData() {
    version:0;
    features:null;
}

let downLoadData = new featureData();
let currentVersion = 0;
/**
 * 根据可见范围筛选点矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parsePoint = function (features, necessaryParas,regulateParas) {
    let tempfeatures = [];
    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    for(let i = 0, plength = features.length; i < plength; ++i)
    {
        let geom = features[i]["geometry"];
        var pointGeom = new THREE.BufferGeometry();
        if(geom["type"] === "Point")
        {
            let coord = geom["coordinates"];
            let aabb = new THREE.Box2();

            let newPoints = [coord[0] - necessaryParas.globalOffset[0], coord[1]-necessaryParas.globalOffset[1], coord.length>2? coord[2] - necessaryParas.globalOffset[2]:0.0];

            pointGeom.addAttribute( 'position',  new THREE.Float32BufferAttribute( newPoints, 3 ) );

            pointGeom.computeBoundingBox();
            let bb = pointGeom.boundingBox.clone();
            bb.applyMatrix4(tmtxWorld);
            pointGeom.computeBoundingSphere();
            let bs = pointGeom.boundingSphere.clone();
            bs.applyMatrix4(tmtxWorld);
            //
            if(bb.min.x < necessaryParas.minBox.min.x || bb.min.y < necessaryParas.minBox.min.y ||
                bb.max.x > necessaryParas.minBox.max.x || bb.max.y > necessaryParas.minBox.max.y) {
                pointGeom.dispose();
                continue;
            }
            else {
                let dis = tCameraPos.clone().sub(bs.center).length();
                if (dis > 600 + bs.radius * 50) {
                    pointGeom.dispose();
                    continue;
                }
                //
                if(bb.min.x < aabb.min.x)
                    aabb.min.x = bb.min.x;
                if(bb.max.x > aabb.max.x)
                    aabb.max.x = bb.max.x;
                if(bb.min.y < aabb.min.y)
                    aabb.min.y = bb.min.y;
                if(bb.max.y > aabb.max.y)
                    aabb.max.y = bb.max.y;
                //
                geom["coordinates"][0] = newPoints;
                pointGeom.dispose();
            }
            if(geom["coordinates"].length > 0)
            {
                tempfeatures[tempfeatures.length] = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }
    }
    downLoadData.data = tempfeatures;
}
/**
 * 根据可见范围筛选线矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parseLine = function (features, necessaryParas,regulateParas) {
    let tempfeatures = [];
    // 传入相机和世界矩阵参数，根据所在范围截取数据
    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    // 遍历所有features 截取
    for(let i = 0, flength = features.length; i < flength; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "MultiLineString" || geom["type"] === "LineString")
        {
            let tempCoords = [];
            let coord = geom["coordinates"];
            let aabb = new THREE.Box2();
            let coord= coords[j];
            let newLine = new Array(coord.length * 3);
            for(let k = 0, clength = coord.length; k < clength; ++k)
            {
                let tempCoord = coord[k];

                newLine[k*3 + 0] = (tempCoord[0] - necessaryParas.globalOffset[0]);
                newLine[k*3 + 1] = (tempCoord[1]- necessaryParas.globalOffset[1]);
                newLine[k*3 + 2] = (tempCoord.length > 2? tempCoord[2] - necessaryParas.globalOffset[2]: 0.0);
            }

            let lineGeom = new THREE.BufferGeometry();

            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(newLine, 3));

            // 求取mesh所在最小包围盒
            lineGeom.computeBoundingBox();
            let bb = lineGeom.boundingBox.clone();
            bb.applyMatrix4(tmtxWorld);
            lineGeom.computeBoundingSphere();
            let bs = lineGeom.boundingSphere.clone();
            bs.applyMatrix4(tmtxWorld);

            if(bb.max.x < necessaryParas.minBox.min.x || bb.max.y < necessaryParas.minBox.min.y ||
                bb.min.x > necessaryParas.minBox.max.x || bb.min.y > necessaryParas.minBox.max.y) {
                lineGeom.dispose();
                continue;
            }
            else {
                let dis = tCameraPos.clone().sub(bs.center).length();
                if (dis > 600 + bs.radius * 50) {
                    lineGeom.dispose();
                    continue;
                }
                //
                if(bb.min.x < aabb.min.x)
                    aabb.min.x = bb.min.x;
                if(bb.max.x > aabb.max.x)
                    aabb.max.x = bb.max.x;
                if(bb.min.y < aabb.min.y)
                    aabb.min.y = bb.min.y;
                if(bb.max.y > aabb.max.y)
                    aabb.max.y = bb.max.y;
                //
                tempCoords[tempCoords.length] = newLine;
                lineGeom.dispose();
            }
            if(tempCoords.length > 0)
            {
                geom["coordinates"] = tempCoords;
                tempfeatures[tempfeatures.length] = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }
    }
    downLoadData.data = tempfeatures;
}
/**
 * 根据可见范围筛选多线矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parseMultiLine = function (features,necessaryParas,regulateParas) {
    let tempfeatures = [];
    // 传入相机和世界矩阵参数，根据所在范围截取数据
    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    // 遍历所有features 截取
    for(let i = 0, flength = features.length; i < flength; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "MultiLineString")
        {
            let tempCoords = [];
            let coords = geom["coordinates"];
            let aabb = new THREE.Box2();
            for(let j = 0, csLength = coords.length; j < csLength; ++j)
            {
                let coord= coords[j];

                let newLine = new Array((coord.length-1) * 3 * regulateParas.denseRate + 3);

                for(let k = 0, clength = coord.length-1; k < clength; ++k)
                {
                    let tempCoord = coord[k];

                    let nextCoord = coord[k+1];

                    newLine[k* 3 * regulateParas.denseRate + 0] = (tempCoord[0] - necessaryParas.globalOffset[0]);
                    newLine[k* 3 * regulateParas.denseRate + 1] = (tempCoord[1]- necessaryParas.globalOffset[1]);

                    newLine[k* 3 * regulateParas.denseRate + 2] = tempCoord.length > 2? tempCoord[2] - necessaryParas.globalOffset[2]: 0.0;

                    // TODO: 线的加密--根据矢量方向添加点

                    for(let dk = 1, dl = 3; dk< regulateParas.denseRate; ++dk)
                    {
                        let dn = 3*(dk-1) + dl;
                        newLine[k* 3 * regulateParas.denseRate + dn + 0] =newLine[k* 3 * regulateParas.denseRate + 0] + dk*((nextCoord[0] - tempCoord[0])/regulateParas.denseRate);
                        newLine[k* 3 * regulateParas.denseRate + dn + 1] =newLine[k* 3 * regulateParas.denseRate + 1] + dk*((nextCoord[1] - tempCoord[1])/regulateParas.denseRate);

                        newLine[k* 3 * regulateParas.denseRate + dn + 2] = newLine[k* 3 * regulateParas.denseRate + 2] + nextCoord.length > 2?dk*((nextCoord[2] - tempCoord[2])/regulateParas.denseRate): 0.0;
                    }

                }
                {
                    let tempCoord = coord[coord.length - 1];

                    newLine[(coord.length - 1) * 3 * regulateParas.denseRate + 0] = (tempCoord[0] - necessaryParas.globalOffset[0]);
                    newLine[(coord.length - 1) * 3 * regulateParas.denseRate + 1] = (tempCoord[1] - necessaryParas.globalOffset[1]);

                    newLine[(coord.length - 1) * 3 * regulateParas.denseRate + 2] = tempCoord.length > 2 ? tempCoord[2] - necessaryParas.globalOffset[2]: 0.0;
                }

                let lineGeom = new THREE.BufferGeometry();

                lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(newLine, 3));

                // 求取mesh所在最小包围盒
                lineGeom.computeBoundingBox();
                let bb = lineGeom.boundingBox.clone();
                bb.applyMatrix4(tmtxWorld);
                lineGeom.computeBoundingSphere();
                let bs = lineGeom.boundingSphere.clone();
                bs.applyMatrix4(tmtxWorld);

                if(bb.max.x < necessaryParas.minBox.min.x || bb.max.y < necessaryParas.minBox.min.y ||
                    bb.min.x > necessaryParas.minBox.max.x || bb.min.y > necessaryParas.minBox.max.y) {
                    lineGeom.dispose();
                    continue;
                }
                else {
                    let dis = tCameraPos.clone().sub(bs.center).length();
                    if (dis > 600 + bs.radius * 50) {
                        lineGeom.dispose();
                        continue;
                    }
                    //
                    if(bb.min.x < aabb.min.x)
                        aabb.min.x = bb.min.x;
                    if(bb.max.x > aabb.max.x)
                        aabb.max.x = bb.max.x;
                    if(bb.min.y < aabb.min.y)
                        aabb.min.y = bb.min.y;
                    if(bb.max.y > aabb.max.y)
                        aabb.max.y = bb.max.y;
                    //
                    tempCoords[tempCoords.length] = newLine;
                    lineGeom.dispose();
                }
            }
            if(tempCoords.length > 0)
            {
                geom["coordinates"] = tempCoords;
                tempfeatures[tempfeatures.length] = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }
    }
    downLoadData.data = tempfeatures;
}
/**
 * 根据可见范围筛选多多边形矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parseMultiPolygon = function (features,necessaryParas,regulateParas) {
    //
    let tempFeatures = [];


    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    for(let i = 0, flength = features.length; i < flength; ++i)
    {
        let geom = features[i]["geometry"]

        if(geom["type"] === "MultiPolygon" || geom["type"] === "Polygon")
        {
            let tempMultiPC = [];
            let multiPolygonCoords = geom["coordinates"];
            let aabb = new THREE.Box2();
            // ringCount
            let multiPolygonCount = multiPolygonCoords.length;
            for(let k  = 0; k< multiPolygonCount; ++k)
            {
                let polygonCoords = multiPolygonCoords[k];

                let ringCount = polygonCoords.length
                if(ringCount <= 0)
                    return;
                // 获取外轮廓
                let outlineCoors = polygonCoords[0];

                let newOutLineVertex = new Array(outlineCoors.length);

                for(let j1 = 0, ocslen = outlineCoors.length; j1 < ocslen; ++j1)
                {
                    let outlineVertex  = outlineCoors[j1];

                    newOutLineVertex[j1] = new THREE.Vector3(outlineVertex[0] - necessaryParas.globalOffset[0],outlineVertex[1] - necessaryParas.globalOffset[1], outlineVertex.length>2? outlineVertex[2] - necessaryParas.globalOffset[2]:0.0);
                }
                polygonCoords[0] = newOutLineVertex;
                let polygonShape = new THREE.Shape(newOutLineVertex);

                for(let j = 1; j < ringCount; ++j)
                {

                    let lineArray = [];
                    for(let k = 0, pclength = polygonCoords[j].length; k<pclength; k++)
                    {
                        let holeVectices = polygonCoords[j];

                        let vertices = new Array(holeVectices.length);

                        for(let n = 0, holevlen = holeVectices.length; n < holevlen; ++n)
                        {
                            let tempcoor = holeVectices[n] ;

                            vertices[n] = (tempcoor[0] - necessaryParas.globalOffset[0], tempcoor[1]- necessaryParas.globalOffset[1], tempcoor.length>2? tempcoor[2] - necessaryParas.globalOffset[1]:0.0);
                        }

                        lineArray.push(vertices);
                    }
                    polygonCoords[j] = lineArray;

                    let holeShape = new THREE.Shape(lineArray);

                    polygonShape.holes.push(holeShape);
                }
                let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);
                //
                holeGeom.computeBoundingBox();
                let bb = holeGeom.boundingBox.clone();
                bb.applyMatrix4(tmtxWorld);
                holeGeom.computeBoundingSphere();
                let bs = holeGeom.boundingSphere.clone();
                bs.applyMatrix4(tmtxWorld);

                if(bb.max.x < necessaryParas.minBox.min.x || bb.max.y < necessaryParas.minBox.min.y ||
                    bb.min.x > necessaryParas.minBox.max.x || bb.min.y > necessaryParas.minBox.max.y) {
                    holeGeom.dispose();
                    continue;
                }
                else {
                    let dis = tCameraPos.clone().sub(bs.center).length();
                    if (dis > 600 + bs.radius * 50) {
                        holeGeom.dispose();
                        continue;
                    }
                    //
                    if(bb.min.x < aabb.min.x)
                        aabb.min.x = bb.min.x;
                    if(bb.max.x > aabb.max.x)
                        aabb.max.x = bb.max.x;
                    if(bb.min.y < aabb.min.y)
                        aabb.min.y = bb.min.y;
                    if(bb.max.y > aabb.max.y)
                        aabb.max.y = bb.max.y;
                    //
                    holeGeom.dispose();
                    tempMultiPC[tempMultiPC.length] = polygonCoords;
                }
            }
            if(tempMultiPC.length > 0)
            {
                geom["coordinates"] = tempMultiPC;
                tempFeatures[tempFeatures.length]  = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }

    }
    downLoadData.data = tempFeatures;
}
/**
 * 根据可见范围筛选多边形矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parsePolygon = function (features, necessaryParas,regulateParas) {
    //
    let tempFeatures = [];

    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    for(let i = 0, flength = features.length; i < flength; ++i)
    {
        let geom = features[i]["geometry"]

        if(geom["type"] === "Polygon")
        {
            let tempMultiPC = [];
            let polygonCoords = geom["coordinates"];
            let aabb = new THREE.Box2();

            let ringCount = polygonCoords.length
            if(ringCount <= 0)
                return;
            // 获取外轮廓
            let outlineCoors = polygonCoords[0];

            let newOutLineVertex = new Array(outlineCoors.length);

            for(let j1 = 0, ocslen = outlineCoors.length; j1 < ocslen; ++j1)
            {
                let outlineVertex  = outlineCoors[j1];

                newOutLineVertex[j1] = new THREE.Vector2(outlineVertex[0] - necessaryParas.globalOffset[0],outlineVertex[1] - necessaryParas.globalOffset[1]);

            }
            polygonCoords[0] = newOutLineVertex;
            let polygonShape = new THREE.Shape(newOutLineVertex);

            for(let j = 1; j < ringCount; ++j)
            {

                let lineArray = [];
                for(let k = 0, pclength = polygonCoords[j].length; k<pclength; k++)
                {
                    let holeVectices = polygonCoords[j];

                    let vertices = new Array(holeVectices.length);

                    for(let n = 0, holevlen = holeVectices.length; n < holevlen; ++n)
                    {
                        let tempcoor = holeVectices[n] ;
                        vertices[n] = (tempcoor[0] - necessaryParas.globalOffset[0], tempcoor[1]- necessaryParas.globalOffset[1]);
                    }

                    lineArray.push(vertices);
                }
                polygonCoords[j] = lineArray;

                let holeShape = new THREE.Shape(lineArray);

                polygonShape.holes.push(holeShape);
            }
            let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);
            //
            holeGeom.computeBoundingBox();
            let bb = holeGeom.boundingBox.clone();
            bb.applyMatrix4(tmtxWorld);
            holeGeom.computeBoundingSphere();
            let bs = holeGeom.boundingSphere.clone();
            bs.applyMatrix4(tmtxWorld);
            //
            if(bb.max.x < necessaryParas.minBox.min.x || bb.max.y < necessaryParas.minBox.min.y ||
                bb.min.x > necessaryParas.minBox.max.x || bb.min.y > necessaryParas.minBox.max.y) {
                holeGeom.dispose();
                continue;
            }
            else {
                let dis = tCameraPos.clone().sub(bs.center).length();
                if (dis > 600 + bs.radius * 50) {
                    holeGeom.dispose();
                    continue;
                }
                //
                if(bb.min.x < aabb.min.x)
                    aabb.min.x = bb.min.x;
                if(bb.max.x > aabb.max.x)
                    aabb.max.x = bb.max.x;
                if(bb.min.y < aabb.min.y)
                    aabb.min.y = bb.min.y;
                if(bb.max.y > aabb.max.y)
                    aabb.max.y = bb.max.y;
                //
                holeGeom.dispose();
                tempMultiPC[tempMultiPC.length] = polygonCoords;
            }
            if(tempMultiPC.length > 0)
            {
                geom["coordinates"] = tempMultiPC;
                tempFeatures[tempFeatures.length]  = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }

    }
    downLoadData.data = tempFeatures;
}
/**
 * 根据可见范围筛选多点矢量数据，并存储
 * @memberOf FeatureDownloadWorker
 * @param  features 备注文字
 * @param  necessaryParas 范围筛选参数
 * @return regulateParas 矢量调节参数
 */
let parseMultiPoint = function (meshInfo,necessaryParas,regulateParas) {
    let tempfeatures = [];
    let tCameraPos = new THREE.Vector3(necessaryParas.cameraPos.x, necessaryParas.cameraPos.y, necessaryParas.cameraPos.z);
    let tmtxWorld = new THREE.Matrix4();
    tmtxWorld.elements = necessaryParas.matrixWorld.elements;

    for(let i = 0, plength = features.length; i < plength; ++i)
    {
        let geom = features[i]["geometry"];
        var pointGeom = new THREE.BufferGeometry();
        if(geom["type"] === "MultiPoint")
        {
            let coords = geom["coordinates"];
            let aabb = new THREE.Box2();

            let newPoints = new Array(coords.length*3)
            for(let j = 0, clen = coords.length; j < clen; ++j)
            {
                newPoints[newPoints.length*3+1] = coords[j][0] - necessaryParas.globalOffset[0];
                newPoints[newPoints.length*3+2] = coords[j][1] - necessaryParas.globalOffset[1];
                newPoints[newPoints.length*3+2] = coords[j].length>2? coords[j][2] -necessaryParas.globalOffset[2]:0;
            }

            pointGeom.addAttribute( 'position',  new THREE.Float32BufferAttribute( newPoints, 3 ) );

            pointGeom.computeBoundingBox();
            let bb = pointGeom.boundingBox.clone();
            bb.applyMatrix4(tmtxWorld);
            pointGeom.computeBoundingSphere();
            let bs = pointGeom.boundingSphere.clone();
            bs.applyMatrix4(tmtxWorld);
            //
            if(bb.min.x < necessaryParas.minBox.min.x || bb.min.y < necessaryParas.minBox.min.y ||
                bb.max.x > necessaryParas.minBox.max.x || bb.max.y > necessaryParas.minBox.max.y) {
                pointGeom.dispose();
                continue;
            }
            else {
                let dis = tCameraPos.clone().sub(bs.center).length();
                if (dis > 600 + bs.radius * 50) {
                    pointGeom.dispose();
                    continue;
                }
                //
                if(bb.min.x < aabb.min.x)
                    aabb.min.x = bb.min.x;
                if(bb.max.x > aabb.max.x)
                    aabb.max.x = bb.max.x;
                if(bb.min.y < aabb.min.y)
                    aabb.min.y = bb.min.y;
                if(bb.max.y > aabb.max.y)
                    aabb.max.y = bb.max.y;
                //
                geom["coordinates"][0] = newPoints;
                pointGeom.dispose();
            }
            if(geom["coordinates"].length > 0)
            {
                tempfeatures[tempfeatures.length] = {ft:features[i], minx:aabb.min.x, maxx:aabb.max.x, miny:aabb.min.y, maxy:aabb.max.y};
            }
        }
    }
    downLoadData.data = tempfeatures;
}


self.onmessage = function ( message ) {
    if(message.data.type === "request") {
        currentVersion = message.data.version;

        var xhr = new XMLHttpRequest();
        xhr.requestVersion = message.data.version;
        xhr.open('GET', message.data.url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                if(this.requestVersion === currentVersion) {
                    try
                    {
                        let JsonData = JSON.parse(this.response);
                        let JsonFeatures = JsonData["features"];

                        let necessaryParas = message.data.necessaryParas;
                        let regulateParas = message.data.regulateParas;

                        if(JsonFeatures.length > 1)
                        {
                            let featureType = JsonFeatures[0]["geometry"]["type"];

                            downLoadData.featureType = featureType;
                            downLoadData.version = currentVersion;

                            if(featureType === "Point" )
                            {
                                parsePoint(JsonFeatures, necessaryParas,regulateParas);
                            }else if(featureType === "LineString")
                            {
                                parseLine(JsonFeatures,necessaryParas,regulateParas);
                            }else if(featureType === "Polygon")
                            {
                                parsePolygon(JsonFeatures, necessaryParas,regulateParas);
                            }
                            else if(featureType === "MultiPoint")
                            {
                                parseMultiPoint(JsonFeatures, necessaryParas,regulateParas);
                            }else if(featureType === "MultiLineString")
                            {
                                parseMultiLine(JsonFeatures,necessaryParas,regulateParas);
                            }else if(featureType === "MultiPolygon")
                            {
                                parseMultiPolygon(JsonFeatures, necessaryParas,regulateParas);
                            }
                        }

                    }catch(error) {
                        // TODO:
                    }
                }
                else
                {
                    // TODO:
                }
            } else {
                // TODO:
            }
        };
        xhr.onerror = function () {

        };
        xhr.send();
    }
    else if(message.data.type === "fetch") {
        if(downLoadData.data == null)
            return;
        if(message.data.version === currentVersion && downLoadData.featureType !== "") {
            //
            if(downLoadData.data.length>1) {
                let minNum = message.data.requestNum > downLoadData.data.length ? downLoadData.data.length : message.data.requestNum;

                if (minNum > 1) {
                    let tempFeatures = new fetchData();
                    tempFeatures.features = downLoadData.data.splice(0, minNum);
                    tempFeatures.version = downLoadData.version;
                    self.postMessage({data: tempFeatures, featureType: downLoadData.featureType});
                    tempFeatures = null;
                }
                else
                    self.postMessage({data: null, featureType: downLoadData.featureType});
            }else {
                self.close();
            }
        }
    }
}

