importScripts( "nodeProxyType.js" );

let osgjsParseToProxy = (json, node, stateSets, textures, vertexes, baseServerUrl) => {
    if(node === undefined) {
        node = new GroupProxy();
    }
    if(stateSets === undefined) {
        stateSets = {};
    }
    if(textures === undefined) {
        textures = {};
    }
    if(vertexes === undefined) {
        vertexes = {};
    }
	// APPEND_YJZ:
    if(baseServerUrl === undefined)
    {
        if(json.requestURL !== "")
        {
            var firstPos = json.requestURL.indexOf("=");
            baseServerUrl = json.requestURL.substring(0, firstPos + 1);
        }
        else
            baseServerUrl = "";
    }


    //
    for(var key in json) {
        let strKey = key.toString();
        if(strKey === "osg.Node") {
            let group = new GroupProxy();
            if(json["osg.Node"].Name) {
                group.name = json["osg.Node"].Name;
            }
            osgjsParseToProxy(json["osg.Node"], group, stateSets, textures, vertexes, baseServerUrl);

            if(group.children.length === 1 && (!group.name || group.name.length===0)) {
                node.children.push(group.children[0]);
            }
            else if(group.children.length === 1 && group.name && !group.children[0].name) {
                group.children[0].name = group.name;
                node.children.push(group.children[0]);
            }
            else if(group.children.length === 0) {

            }
            else if(group.children.length > 1) {
                let mergeGeometry = true;
                for(let n=0, length = group.children.length; n<length; ++n) {
                    if(!group.children[n].isMeshProxy) {
                        mergeGeometry = false;
                        break;
                    }
                }
                //
                let drawMode = -1;
                let vertexes = [];
                let uvs = [];
                let indexes = [];
                let normals = [];
                if(mergeGeometry) {
                    let drawMode = group.children[0].drawMode;
                    if(group.children[0].geometry.vertexes) {
                        vertexes[0] = group.children[0].geometry.vertexes;
                    }
                    if(group.children[0].geometry.uv) {
                        uvs[0] = group.children[0].geometry.uv;
                    }
                    if(group.children[0].geometry.indexes) {
                        indexes[0] = group.children[0].geometry.indexes;
                    }
                    if(group.children[0].geometry.normal) {
                        normals[0] = group.children[0].geometry.normal;
                    }
                    for(let n=1, length = group.children.length; n<length; ++n) {
                        if(group.children[n].drawMode !== drawMode) {
                            drawMode = -1;
                        }
                        //
                        if(group.children[n].geometry.vertexes) {
                            vertexes[vertexes.length] = group.children[n].geometry.vertexes;
                        }
                        if(group.children[n].geometry.uv) {
                            uvs[uvs.length] = group.children[n].geometry.uv;
                        }
                        if(group.children[n].geometry.indexes) {
                            indexes[indexes.length] = group.children[n].geometry.indexes;
                        }
                        if(group.children[n].geometry.normal) {
                            normals[normals.length] = group.children[n].geometry.normal;
                        }
                    }
                }
                //
                if(mergeGeometry) {
                    if(uvs.length !== 0 && uvs.length !== vertexes.length) {
                        mergeGeometry = false;
                    }
                    if(normals.length !== 0 && normals.length !== vertexes.length) {
                        mergeGeometry = false;
                    }
                    if(indexes.length !== 0 && indexes.length !== vertexes.length) {
                        mergeGeometry = false;
                    }
                }
                //
                if(mergeGeometry) {
                    let materials = [];
                    let groupGeom = new GeometryProxy();
                    groupGeom.group = [];
                    for(let n=0, length = group.children.length; n<length; ++n) {
                        materials[materials.length] = group.children[n].material;
                    }
                    //
                    if(indexes.length > 0) {
                        let groupVertexes = [];
                        let groupNormals = [];
                        let groupUvs = [];
                        if(drawMode <= 0) {
                            for(let i=0, numIndexes = indexes.length; i<numIndexes; ++i) {
                                let start = groupVertexes.length/3;
                                let count = 0;
                                if (group.children[i].drawMode === 0) {
                                    for (let n = 0, numFace = indexes[i].length / 3; n < numFace; n++) {
                                        let i_0 = indexes[i][n * 3];
                                        let i_1 = indexes[i][n * 3 + 1];
                                        let i_2 = indexes[i][n * 3 + 2];
                                        //
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3 + 2];

                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3 + 2];

                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3 + 2];
                                        //
                                        if (uvs.length > 0) {
                                            groupUvs[groupUvs.length] = uvs[i][i_0*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_0*2 + 1];

                                            groupUvs[groupUvs.length] = uvs[i][i_1*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_1*2 + 1];

                                            groupUvs[groupUvs.length] = uvs[i][i_2*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_2*2 + 1];
                                        }
                                        //
                                        if (normals.length > 0) {
                                            groupNormals[groupNormals.length] = normals[i][i_0*3];
                                            groupNormals[groupNormals.length] = normals[i][i_0*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_0*3 + 2];

                                            groupNormals[groupNormals.length] = normals[i][i_1*3];
                                            groupNormals[groupNormals.length] = normals[i][i_1*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_1*3 + 2];

                                            groupNormals[groupNormals.length] = normals[i][i_2*3];
                                            groupNormals[groupNormals.length] = normals[i][i_2*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_2*3 + 2];
                                        }
                                        //
                                        count += 3;
                                    }
                                }
                                else if(group.children[i].drawMode === 1) {
                                    for(let n=2, numIndexes = indexes[i].length; n<numIndexes; ++n) {
                                        let i_0 = 0, i_1 = 0, i_2 = 0;
                                        //
                                        if((n%2) !== 0) {
                                            i_0 = indexes[i][n - 2];
                                            i_1 = indexes[i][n];
                                            i_2 = indexes[i][n - 1];
                                        }
                                        else {
                                            i_0 = indexes[i][n - 2];
                                            i_1 = indexes[i][n - 1];
                                            i_2 = indexes[i][n];
                                        }
                                        //
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_0*3 + 2];

                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_1*3 + 2];

                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3 + 1];
                                        groupVertexes[groupVertexes.length] = vertexes[i][i_2*3 + 2];
                                        //
                                        if (uvs.length > 0) {
                                            groupUvs[groupUvs.length] = uvs[i][i_0*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_0*2 + 1];

                                            groupUvs[groupUvs.length] = uvs[i][i_1*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_1*2 + 1];

                                            groupUvs[groupUvs.length] = uvs[i][i_2*2];
                                            groupUvs[groupUvs.length] = uvs[i][i_2*2 + 1];
                                        }
                                        //
                                        if (normals.length > 0) {
                                            groupNormals[groupNormals.length] = normals[i][i_0*3];
                                            groupNormals[groupNormals.length] = normals[i][i_0*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_0*3 + 2];

                                            groupNormals[groupNormals.length] = normals[i][i_1*3];
                                            groupNormals[groupNormals.length] = normals[i][i_1*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_1*3 + 2];

                                            groupNormals[groupNormals.length] = normals[i][i_2*3];
                                            groupNormals[groupNormals.length] = normals[i][i_2*3 + 1];
                                            groupNormals[groupNormals.length] = normals[i][i_2*3 + 2];
                                        }
                                        //
                                        count += 3;
                                    }
                                }
                                //
                                groupGeom.group[i] = {start: start, count: count, materialIndex: i};
                            }
                        }
                        else if(drawMode === 1) {
                            for(let i=0, numIndexes = indexes.length; i<numIndexes; ++i) {
                                let start = groupVertexes.length/3;
                                let count = 0;
                                for(let n=0, numIndexes = indexes[i].length; n<numIndexes; ++n) {
                                    groupVertexes[groupVertexes.length] = vertexes[i][n*3];
                                    groupVertexes[groupVertexes.length] = vertexes[i][n*3 + 1];
                                    groupVertexes[groupVertexes.length] = vertexes[i][n*3 + 2];

                                    if (uvs.length > 0) {
                                        groupUvs[groupUvs.length] = uvs[i][n*2];
                                        groupUvs[groupUvs.length] = uvs[i][n*2 + 1];
                                    }
                                    //
                                    if (normals.length > 0) {
                                        groupNormals[groupNormals.length] = normals[i][n*3];
                                        groupNormals[groupNormals.length] = normals[i][n*3 + 1];
                                        groupNormals[groupNormals.length] = normals[i][n*3 + 2];
                                    }
                                    //
                                    count++;
                                }
                                //
                                groupGeom.group[i] = {start: start, count: count, materialIndex: i};
                            }
                        }

                        //
                        groupGeom.vertexes = groupVertexes;
                        groupGeom.uv = groupUvs.length > 0 ? groupUvs : null;
                        groupGeom.normal = groupNormals.length > 0 ? groupNormals : null;
                        //
                        //
                        let mesh = new MeshProxy(groupGeom, materials);
                        mesh.drawMode = drawMode <= 0 ? 0 : drawMode;
                        mesh.name = group.name;
                        //
                        node.children.push(mesh);
                    }
                    else {
                        node.children.push(group);
                    }
                }
                else {
                    node.children.push(group);
                }
            }
            else {
                node.children.push(group);
            }
        }
        else if(strKey === "Children") {
            for(let i=0; i<json["Children"].length; i++) {
                osgjsParseToProxy(json["Children"][i], node, stateSets, textures, vertexes, baseServerUrl);
            }
        }
        else if(strKey === "osg.MatrixTransform") {
            if(json["osg.MatrixTransform"].Matrix.toString() === [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ].toString()&&
                (!node.name || !json["osg.MatrixTransform"].Name || node.name === json["osg.MatrixTransform"].Name)) {
                //
                if(json["osg.MatrixTransform"].Name)
                    node.name = json["osg.MatrixTransform"].Name;
                osgjsParseToProxy(json["osg.MatrixTransform"], node, stateSets, textures, vertexes, baseServerUrl);
            }
            else {
                let group = new GroupProxy();
                if(json["osg.MatrixTransform"].Name) {
                    group.name = json["osg.MatrixTransform"].Name;
                }
                group.matrix = json["osg.MatrixTransform"].Matrix;
                osgjsParseToProxy(json["osg.MatrixTransform"], group, stateSets, textures, vertexes, baseServerUrl);
                node.children.push(group);
            }
        }
        else if(strKey === "osg.ProxyNode") {
            // APPEND_YJZ : proxyNode's parse Entry
            var proxy = new ProxyProxy();
            if(json["osg.ProxyNode"].Name) {
                proxy.name = json["osg.ProxyNode"].Name;
            }

            var fileList = json["osg.ProxyNode"].RangeDataList;
            osgjsParseToProxy(json["osg.ProxyNode"], proxy, stateSets, textures, vertexes, baseServerUrl);
            var files = Object.keys(fileList);
            for(let n=0; n<files.length; n++) {
                if(fileList[files[n]].trim().length === 0)
                    continue;
                //
                let corUrl = baseServerUrl.length > 2 ? baseServerUrl + encodeURIComponent(fileList[files[n]]) : fileList[files[n]];// encodeURIComponent
                proxy.fileList.push({url:corUrl});
            }

            node.children.push(proxy);
        }
        else if(strKey === "osg.PagedLOD") {
            var pagedLod = new PagedLodProxy();
            if(json["osg.PagedLOD"].Name) {
                pagedLod.name = json["osg.PagedLOD"].Name;
            }
            osgjsParseToProxy(json["osg.PagedLOD"], pagedLod, stateSets, textures, vertexes, baseServerUrl);
            let rangeList = json["osg.PagedLOD"].RangeList;
            let fileList = json["osg.PagedLOD"].RangeDataList;
            //
            let validFiles = [];
            //
            for(let n=0; n<Object.getOwnPropertyNames(rangeList).length; n++) {
                if(fileList["File "+n].trim().length === 0) {
                    pagedLod.levels.push({url:"", min:rangeList["Range "+n][0], max:rangeList["Range "+n][1]})
                }
                else {
                    let corUrl = baseServerUrl.length > 2 ? baseServerUrl + encodeURIComponent(fileList["File "+n]) : fileList["File "+n]; // encodeURIComponent
                    if(pagedLod.name === "IndexNode" && validFiles.indexOf(corUrl) >= 0) {
                        console.log("repeat range : " + corUrl);
                    }
                    else {
                        pagedLod.levels.push({url:corUrl, min:rangeList["Range "+n][0], max:rangeList["Range "+n][1]});
                        if(pagedLod.name === "IndexNode") {
                            validFiles[validFiles.length] = corUrl;
                        }
                    }
                }
            }
            pagedLod.boundingSphere = [json["osg.PagedLOD"].UserCenter[0],
                json["osg.PagedLOD"].UserCenter[1],
                json["osg.PagedLOD"].UserCenter[2], json["osg.PagedLOD"].UserCenter[3]];
            if(pagedLod.boundingSphere && pagedLod.boundingSphere[3] < 0) {
                pagedLod.boundingSphere = [];
            }
            if(json["osg.PagedLOD"].RangeMode === "DISTANCE_FROM_EYE_POINT") {
                pagedLod.rangeMode = 0;
            }
            else if(json["osg.PagedLOD"].RangeMode === "PIXEL_SIZE_ON_SCREEN") {
                pagedLod.rangeMode = 1;
            }
            //
            node.children.push(pagedLod);
        }
        else if(strKey === "osg.Geometry") {
            let osgGeom = json["osg.Geometry"];
            //
            let material = new MaterialProxy();
            let geometry = new GeometryProxy();
            //
            if(osgGeom.StateSet !== undefined) {
                if(osgGeom.StateSet["osg.StateSet"]) {
                    let stateSet = osgGeom.StateSet["osg.StateSet"];
                    if(stateSet["UniqueID"]) {
                        let id = "id_"+stateSet["UniqueID"];
                        if(stateSets[id] !== undefined) {
                            stateSet = stateSets[id];
                        }
                        else {
                            stateSets[id] = stateSet;
                        }
                    }
                    if(stateSet.AttributeList !== undefined) {
                        for(let n=0, length =stateSet.AttributeList.length; n<length; ++n) {
                            if(stateSet.AttributeList[n]["osg.Material"]) {
                                let mat = stateSet.AttributeList[n]["osg.Material"];
                                if(mat["Ambient"]) {
                                    material.ambient = mat["Ambient"];
                                }
                                if(mat["Diffuse"]) {
                                    material.diffuse = mat["Diffuse"];
                                }
                                if(mat["Emission"]) {
                                    material.emission = mat["Emission"];
                                }
                                if(mat["Shininess"]) {
                                    material.shininess = mat["Shininess"];
                                }
                                if(mat["Specular"]) {
                                    material.specular = mat["Specular"];
                                }
                            }
                        }
                    }
                    //
                    if(stateSet.TextureAttributeList !== undefined) {
                        let osgTex = stateSet.TextureAttributeList[0][0]["osg.Texture"];
                        let textureProxy = new TextureProxy();
                        if(osgTex["MagFilter"]) {
                            textureProxy.magFilter = osgTex["MagFilter"]==="LINEAR" ? 1006 : (osgTex["MagFilter"]==="NEAREST" ? 1003 : 1006);
                        }
                        if(osgTex["MinFilter"]) {
                            textureProxy.minFilter = osgTex["MinFilter"]==="LINEAR" ? 1006 : (osgTex["MinFilter"]==="NEAREST" ? 1003 : 1006);
                        }
                        if(osgTex["WrapS"]) {
                            textureProxy.wrapS = osgTex["WrapS"]==="REPEAT" ? 1000 : (osgTex["WrapS"]==="CLAMP_TO_EDGE" ? 1001 : 1002);
                        }
                        if(osgTex["WrapT"]) {
                            textureProxy.wrapT = osgTex["WrapT"]==="REPEAT" ? 1000 : (osgTex["WrapT"]==="CLAMP_TO_EDGE" ? 1001 : 1002);
                        }
						let texUrl = baseServerUrl.replace("osgjs","texture");
                        textureProxy.url = texUrl.length > 2 ? texUrl + encodeURIComponent(osgTex["File"]) : osgTex["File"];// encodeURIComponent
                        material.texture = textureProxy;
                    }
                }
            }
            if(osgGeom.VertexAttributeList !== undefined) {
                if(osgGeom.VertexAttributeList.Vertex) {
                    let id = "id_"+osgGeom.VertexAttributeList.Vertex["UniqueID"];
                    if(vertexes[id] !== undefined) {
                        geometry.vertexes = osgGeom.VertexAttributeList.Vertex.Array.Float32Array.Elements;
                    }
                    else {
                        geometry.vertexes = osgGeom.VertexAttributeList.Vertex.Array.Float32Array.Elements;
                        vertexes[id] = osgGeom.VertexAttributeList.Vertex;
                    }
                }
                //
                if(osgGeom.VertexAttributeList.TexCoord0) {
                    geometry.uv = osgGeom.VertexAttributeList.TexCoord0.Array.Float32Array.Elements;
                }
                //
                if(osgGeom.VertexAttributeList.Normal) {
                    geometry.normal = osgGeom.VertexAttributeList.Normal.Array.Float32Array.Elements;
                }
            }
            let drawMode = 0;
            if(osgGeom.PrimitiveSetList !== undefined) {
                if(osgGeom.PrimitiveSetList[0].DrawElementsUShort !== undefined) {
                    let mode = osgGeom.PrimitiveSetList[0].DrawElementsUShort.Mode;
                    if(mode === "TRIANGLES") {
                        drawMode = 0;
                    }
                    else if(mode === "TRIANGLE_STRIP"){
                        drawMode = 1;
                    }
                    else if(mode === "TRIANGLE_FAN") {
                        drawMode = 2;
                    }
                    geometry.indexes = osgGeom.PrimitiveSetList[0].DrawElementsUShort.Indices.Array.Uint16Array.Elements;

                }
                else if(osgGeom.PrimitiveSetList[0].DrawElementsUByte !== undefined) {
                    let mode = osgGeom.PrimitiveSetList[0].DrawElementsUByte.Mode;
                    if(mode === "TRIANGLES") {
                        drawMode = 0;
                    }
                    else if(mode === "TRIANGLE_STRIP"){
                        drawMode = 1;
                    }
                    else if(mode === "TRIANGLE_FAN") {
                        drawMode = 2;
                    }
                    geometry.indexes = osgGeom.PrimitiveSetList[0].DrawElementsUByte.Indices.Array.Uint8Array.Elements;
                }
                else
                    geometry.indexes = null;
            }
            //
            let mesh = new MeshProxy(geometry, material);
            mesh.drawMode = drawMode;
            //
            node.children.push(mesh);
        }
    }
    //
    if(json.requestURL !== undefined) {
        node.requestURL = json.requestURL;
        return node;
    }
}

self.onmessage = function ( message ) {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open('GET', message.data);
    xhr.worker = self;
    xhr.requestURL = message.data;
    xhr.onload = function() {
        if ((this.status >= 200 && this.status < 300)) {
            let node = new GroupProxy();
            //
            let resp = this.response;
            let firstCode = resp.charCodeAt(0);
            if (firstCode < 0x20 || firstCode > 0x7f) {
                resp = resp.substring(1); // 去除第一个字符
            }
            try {
                let json = JSON.parse(resp);
                json.requestURL = this.requestURL;
                osgjsParseToProxy(json, node);
                //
                this.worker.postMessage(node);
                node = null;
            }
            catch(err) {
                let node = new GroupProxy();
                node.requestURL = this.requestURL;
                node.children = null;
                this.worker.postMessage(node);
                console.log("error data");
            }
        }
        else {
            let node = new GroupProxy();
            node.requestURL = this.requestURL;
            node.children = null;
            this.worker.postMessage(node);
            console.log("error status");
        }
    }
    xhr.onerror = function () {
        let node = new GroupProxy();
        node.requestURL = this.requestURL;
        node.children = null;
        this.worker.postMessage(node);
    };
    xhr.ontimeout = function () {
        let node = new GroupProxy();
        node.requestURL = this.requestURL;
        node.children = null;
        this.worker.postMessage(node);
        console.log("load : "+ message.data + " time out");
    }
    //
    xhr.send();
};
