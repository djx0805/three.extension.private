importScripts( "nodeProxyType.js" );

let osgjsParseToProxy = (json, node, stateSets, textures, vertexes, baseServerUrl, containTexture) => {
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
    if(containTexture === undefined && json.containTexture) {
        containTexture = true;
    }
    //
    for(var key in json) {
        let strKey = key.toString();
        if(strKey === "osg.Node") {
            let group = new GroupProxy();
            if(json["osg.Node"].Name) {
                group.name = json["osg.Node"].Name;
            }
            osgjsParseToProxy(json["osg.Node"], group, stateSets, textures, vertexes, baseServerUrl, containTexture);

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
                                    for(let n=2, length = indexes[i].length; n<length; ++n) {
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
                                for(let n=0, length = indexes[i].length; n<length; ++n) {
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
                osgjsParseToProxy(json["Children"][i], node, stateSets, textures, vertexes, baseServerUrl, containTexture);
            }
        }
        else if(strKey === "osg.MatrixTransform") {
            if(json["osg.MatrixTransform"].Matrix.toString() === [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ].toString()&&
                (!node.name || !json["osg.MatrixTransform"].Name || node.name === json["osg.MatrixTransform"].Name)) {
                //
                if(json["osg.MatrixTransform"].Name)
                    node.name = json["osg.MatrixTransform"].Name;
                osgjsParseToProxy(json["osg.MatrixTransform"], node, stateSets, textures, vertexes, baseServerUrl, containTexture);
            }
            else {
                let group = new GroupProxy();
                if(json["osg.MatrixTransform"].Name) {
                    group.name = json["osg.MatrixTransform"].Name;
                }
                group.matrix = json["osg.MatrixTransform"].Matrix;
                osgjsParseToProxy(json["osg.MatrixTransform"], group, stateSets, textures, vertexes, baseServerUrl, containTexture);
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
            osgjsParseToProxy(json["osg.ProxyNode"], proxy, stateSets, textures, vertexes, baseServerUrl, containTexture);
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
            osgjsParseToProxy(json["osg.PagedLOD"], pagedLod, stateSets, textures, vertexes, baseServerUrl, containTexture);
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
                        let texUrl = containTexture ? "" : baseServerUrl.replace("osgjs","texture");
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
        stateSets  =null;
        textures = null;
        vertexes = null;
        return node;
    }
}

let LoaderUtils = {

    decodeText: function ( array ) {

        if ( typeof TextDecoder !== 'undefined' ) {

            return new TextDecoder().decode( array );

        }

        // Avoid the String.fromCharCode.apply(null, array) shortcut, which
        // throws a "maximum call stack size exceeded" error for large arrays.

        var s = '';

        for ( var i = 0, il = array.length; i < il; i ++ ) {

            // Implicitly assumes little-endian.
            s += String.fromCharCode( array[ i ] );

        }

        // Merges multi-byte utf-8 characters.
        return decodeURIComponent( escape( s ) );

    },

    extractUrlBase: function ( url ) {

        var parts = url.split( '/' );

        if ( parts.length === 1 ) return './';

        parts.pop();

        return parts.join( '/' ) + '/';

    }

};

let parseSingle = function ( data) {
    let content;
    if(data.length === 0)
        return ""
    else
    {
        content = LoaderUtils.decodeText( new Uint8Array( data, 0) );
    }
    return {osgjsContent:content};
}



let parseStream = function ( data ) {

    let tileInfo = {
        osgjsContent: "",
        osgjsName: "",
        texture : new Map(),
    };
    let magic = LoaderUtils.decodeText( new Uint8Array( data, 0, 5 ) );

    if ( magic !== 'osgjs' ) {
        return null;
    }

    let chunkView = new DataView( data, 5 );
    let chunkIndex = 0;

    // this.texture = new Map();
    while ( chunkIndex < chunkView.byteLength ) {
        let chunkType = chunkView.getUint32( chunkIndex, true );
        chunkIndex += 4;

        if ( chunkType === 11111 ) {
            // name
            let nameLength = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;
            tileInfo.osgjsName = LoaderUtils.decodeText( new Uint8Array( data, 5+chunkIndex, nameLength ) );

            chunkIndex += nameLength;

            // osgjs content
            let osgjsContentLength = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;
            tileInfo.osgjsContent = LoaderUtils.decodeText( new Uint8Array( data, 5+chunkIndex, osgjsContentLength ) );

            chunkIndex += osgjsContentLength;
        } else if ( chunkType === 11011 ) {
            // name
            let nameLength = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;
            let textureName = LoaderUtils.decodeText( new Uint8Array( data, 5+chunkIndex, nameLength ) );

            chunkIndex += nameLength;

            // mime

            // texture content
            let textureContentLength = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;
            let textureData = new Uint8Array( data, chunkIndex + 5, textureContentLength );
            let blob = new Blob( [textureData], { type: "image/jpeg" } );
            tileInfo.texture.set(textureName, blob);

            chunkIndex += textureContentLength;
        }
    }

    chunkView = null;

    return tileInfo;

}

let replaceTexture = (node, textures)=> {
    if(node.flag === 2 ) {
        if(node.material instanceof Array)
        {
            for(let j = 0, numChild = node.material.length; j < numChild; ++j)
            {
                let mat = node.material[j];
                if(mat && mat.texture) {
                    let blob = textures.get(mat.texture.url);
                    if (blob) {
                        mat.texture.blobContent = blob;
                    }
                }
            }
        }
        else if(node.material && node.material.texture) {
            let blob = textures.get(node.material.texture.url);
            if(blob) {
                node.material.texture.blobContent = blob;
            }
        }
    }
    //
    if(node.children) {
        for(let i=0, numChild = node.children.length; i<numChild; ++i) {
            replaceTexture(node.children[i], textures);
        }
    }
}

self.onmessage = ( message )=> {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.open('GET', message.data);
    xhr.worker = self;
    xhr.requestURL = message.data;
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        if ((this.status >= 200 && this.status < 300)) {
            let tileInfo = null;
            try {
                tileInfo = parseStream(this.response);
                if(!tileInfo) {
                    tileInfo = parseSingle(this.response);
                }
                else {
                    tileInfo.containTexture = true;
                }
                //
                this.response = null;
            }
            catch(err) {
                let node = new GroupProxy();
                node.requestURL = this.requestURL;
                node.children = null;
                this.worker.postMessage(node);
                console.log("receive wrong data");
                //
                return;
            }
            //
            let firstCode = tileInfo.osgjsContent.charCodeAt(0);
            if (firstCode < 0x20 || firstCode > 0x7f) {
                tileInfo.osgjsContent = tileInfo.osgjsContent.substring(1); // 去除第一个字符
            }
            //
            try {
                let node = new GroupProxy();
                let json = JSON.parse(tileInfo.osgjsContent);
                json.containTexture = tileInfo.containTexture ? true : undefined;
                json.requestURL = this.requestURL;
                osgjsParseToProxy(json, node);
                json = null;
                //
                if(tileInfo.texture)
                {
                    if(tileInfo.texture.size > 0) {
                        replaceTexture(node, tileInfo.texture);
                    }
                }
                //
                this.worker.postMessage(node);
            }
            catch(err) {
                let node = new GroupProxy();
                node.requestURL = this.requestURL;
                node.children = null;
                this.worker.postMessage(node);
                console.log("json parse error");
                //
                return ;
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
