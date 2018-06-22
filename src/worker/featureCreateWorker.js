

let parse = function (ft) {
   console.log(ft);
}
let parseMultiLine = function (meshInfo,features, globalOffset) {

    let newArrayLength = meshInfo.needParseNum > features.length - meshInfo.needParseNum? features.length - meshInfo.parsedNum: meshInfo.needParseNum;

    let meshLen = meshInfo.meshFts.length;
    //for(let i = meshLen; i < meshLen + newArrayLength; ++i)
    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "MultiLineString")
        {
            let coords = geom["coordinates"]
            for(let j = 0; j < coords.length; ++j)
            {
                let newLine = [];

                let coord= coords[j];
                for(k = 0; k < coord.length; ++k)
                {
                    let tempCoord = coord[k];

                    newLine.push(tempCoord[0] - globalOffset[0]);
                    newLine.push(tempCoord[1]- globalOffset[1]);
                    newLine.push(tempCoord.length > 2? tempCoord[2]: 0.0);
                }

                coords[j] = newLine;
            }
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            meshInfo.meshProps.push(pointProp);

            meshInfo.meshFts.push(coords);
        }
    }
}

let parseLine = function (meshInfo,features, globalOffset) {

    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "LineString")
        {
            let coords = geom["coordinates"]
            for(let j = 0; j < coords.length; ++j)
            {
                let vertices = [0.0,0.0,0.0];

                let coord = coords[j];

                vertices[0] = coord[0] - globalOffset[0];
                vertices[1] = coord[1]- globalOffset[1];
                vertices[2] = coord.length > 2? coord[2]: 0.0;

                // TODO: NEW ARRAY
                coords[j] = vertices;

            }
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            meshInfo.meshProps.push(pointProp);

            meshInfo.meshFts.push(coords);
        }
    }
}

let parsePoint = function (meshInfo,features, globalOffset) {

    /*
    let newArrayLength = meshInfo.needParseNum > features.length - meshInfo.needParseNum? features.length - meshInfo.parsedNum: meshInfo.needParseNum;

    let meshLen = meshInfo.meshFts.length;
    */
    // for(let i = meshLen; i < meshLen + newArrayLength; ++i)
    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "Point")
        {
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            let coord = geom["coordinates"];

            let newPoints = [coord[0] - globalOffset[0], coord[1]-globalOffset[1], coord.length>2? coord[2] -globalOffset[2]:0];

            meshInfo.meshFts.push(newPoints);
            meshInfo.meshProps.push(pointProp);

        }
    }
}

let parsePoints = function (meshInfo,features, globalOffset) {
    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]
        if(geom["type"] === "Point" || geom["type"] === "Points")
        {
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            let coords = geom["coordinates"];

            let newcCoords = [];
            for(let j = 0; j<coords.length; ++j)
            {
                let newPoints = [coords[j][0] - globalOffset[0], coords[j][1] - globalOffset[1], coords[j].length>2? coords[j][2]-globalOffset[2]:0];

                newcCoords.push(newPoints);
            }

            meshInfo.meshFts.push(newcCoords);
            meshInfo.meshProps.push(pointProp);

        }
    }
}

let parseMultiPolygon = function (meshInfo,features, globalOffset) {

    /*
    let newArrayLength = meshInfo.needParseNum > features.length - meshInfo.meshFts.length? features.length - meshInfo.meshFts.length: meshInfo.needParseNum;
    // polygonCount
    let meshLen = meshInfo.meshFts.length;
    //for(let i = meshLen; i < meshLen + newArrayLength; ++i)
    */
    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]

        if(geom["type"] === "MultiPolygon")
        {
            let multiPolygon = []

            let multiPolygonCoords = geom["coordinates"];
            // ringCount
            let multiPolygonCount = multiPolygonCoords.length;
            for(let k  = 0; k< multiPolygonCount; ++k)
            {
                let polygon = {};

                let polygonCoords = multiPolygonCoords[k];

                let ringCount = polygonCoords.length
                if(ringCount <= 0)
                    return;
                // 获取外轮廓
                let outlineCoors = polygonCoords[0];

                let newOutLineVertex = [];

                for(let j1 = 0; j1 < outlineCoors.length; ++j1)
                {
                    let outlineVertex  = outlineCoors[j1];

                    newOutLineVertex.push(outlineVertex[0] - globalOffset[0]);
                    newOutLineVertex.push(outlineVertex[1] - globalOffset[1]);
                    newOutLineVertex.push(outlineVertex.length>2?outlineVertex[2] - globalOffset[2] : 0.0);

                    outlineCoors[j1] = newOutLineVertex;
                }
                polygon.outLine = newOutLineVertex;

                // 获取内轮廓
                polygon.innerHole = [];

                for(let j = 1; j < ringCount; ++j)
                {

                    let lineArray = polygonCoords[j];
                    for(let k = 0; k<lineArray.length; k++)
                    {
                        let holeVectices = lineArray[k];

                        let vertices = [];

                        for(let n = 0; n < holeVectices.length; ++n)
                        {
                            let tempcoor = holeVectices[n] ;
                            vertices.push(tempcoor[0] - globalOffset[0]);
                            vertices.push(tempcoor[1]- globalOffset[1]);
                            vertices.push(tempcoor.length > 2? tempcoor[2]: 0.0);
                        }

                        lineArray[k] = vertices;
                    }


                    polygon.innerHole.push(polygonCoords[j]);
                }

                multiPolygon.push(polygon);
            }

            meshInfo.meshFts.push(multiPolygon);

            // 点的属性和Id
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            meshInfo.meshProps.push(pointProp);

        }

    }
}

let parsePolygon = function (meshInfo,features, globalOffset) {

    // featuresCount
    for(let i = 0; i < features.length; ++i)
    {
        let geom = features[i]["geometry"]

        if(geom["type"] === "Polygon")
        {
            let polygon = {};

            let polygonCoords = geom["coordinates"];
            // ringCount
            let ringCount = polygonCoords.length;
            if(ringCount <= 0)
                return;
            // 获取外轮廓
            let outlineCoors = polygonCoords[0];
            let newOutLineVertex = [];
            for(let j1 = 0; j1 < outlineCoors.length; ++j1)
            {
                let outlineVertex  = outlineCoors[j1];

                newOutLineVertex.push(outlineVertex[0] - globalOffset[0]);
                newOutLineVertex.push(outlineVertex[1] - globalOffset[1]);
                newOutLineVertex.push(outlineVertex.length>2?outlineVertex[2] - globalOffset[2] : 0.0);

                outlineCoors[j1] = newOutLineVertex;
            }
            polygon.outLine = polygonCoords[0];

            // 获取内轮廓
            polygon.innerHole = [];

            for(let j = 1; j < ringCount; ++j)
            {

                let lineArray = polygonCoords[j];
                for(let k = 0; k<lineArray.length; k++)
                {
                    let holeVectices = lineArray[k];

                    let vertices = [];

                    for(let n = 0; n < holeVectices.length; ++n)
                    {
                        let tempcoor = holeVectices[n] ;
                        vertices.push(tempcoor[0] - globalOffset[0]);
                        vertices.push(tempcoor[1]- globalOffset[1]);
                    }

                    lineArray[k] = vertices;
                }


                polygon.innerHole.push(polygonCoords[j]);
            }

            meshInfo.meshFts.push(polygon);

            // 点的属性和Id
            let pointProp = features[i]["properties"];
            pointProp.id = features[i]["id"];

            meshInfo.meshProps.push(pointProp);
        }
    }
}

function meshInfoObj() {
    this.meshFts = [];
    this.meshProps = [];
    this.meshType = "";
    this.featureVersion = 0;
    this.requestNum = 0;

    this.isFinished = false;
}

// 全局存储转换的数据
var meshInfo = new meshInfoObj();

self.onmessage = function ( message ) {

    meshInfo.featureVersion = message.data.version;
    meshInfo.requestNum = message.data.requestNum;
    // 请求矢量数据
    if(message.data.requestType === "data")
    {
        if(meshInfo.meshType === "")
            return;

        let requestMesh = new meshInfoObj();

        requestMesh.featureVersion = meshInfo.featureVersion;
        requestMesh.requestNum = meshInfo.requestNum > meshInfo.meshFts.length ? meshInfo.meshFts.length : meshInfo.requestNum;

        requestMesh.meshType = meshInfo.meshType;
        requestMesh.meshFts = meshInfo.meshFts.splice(0, requestMesh.requestNum);
        requestMesh.meshProps = meshInfo.meshProps.splice(0, requestMesh.requestNum);

        self.postMessage(requestMesh);
    }
    // 转换矢量数据
    else
    {
        if(message.data.strData === null || message.data.strData === undefined)
            return;

        if(meshInfo.isFinished)
            return;

        let json = JSON.parse(message.data.strData);

        let features = json["features"];
        if(features.length < 1)
            return;

        meshInfo.meshType = features[0]["geometry"]["type"];

        if(meshInfo.meshType === "Point")
        {
            parsePoint(meshInfo,json["features"], message.data.globalOffset);

        }else if(meshInfo.meshType === "MultiPoint")
        {
            parsePoints(meshInfo,json["features"], message.data.globalOffset);

        }else if(meshInfo.meshType === "Polygon")
        {
            parsePolygon(meshInfo,json["features"],message.data.globalOffset);
        }
        else if(meshInfo.meshType === "MultiLineString")
        {
            parseMultiLine(meshInfo, json["features"],message.data.globalOffset);
        }
        else if(meshInfo.meshType === "MultiPolygon")
        {
            parseMultiPolygon(meshInfo, json["features"],message.data.globalOffset);
        }
        else if(meshInfo.meshType === "LineString")
        {
            parseLine(meshInfo, json["features"],message.data.globalOffset);
        }
    }
};
