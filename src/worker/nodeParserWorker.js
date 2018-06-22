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
            node.children.push(group);
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
            for(let n=0; n<Object.getOwnPropertyNames(rangeList).length; n++) {
                if(fileList["File "+n].trim().length === 0) {
                    pagedLod.levels.push({url:"", min:rangeList["Range "+n][0], max:rangeList["Range "+n][1]})
                }
                else {
                    let corUrl = baseServerUrl.length > 2 ? baseServerUrl + encodeURIComponent(fileList["File "+n]) : fileList["File "+n]; // encodeURIComponent
                    pagedLod.levels.push({url:corUrl, min:rangeList["Range "+n][0], max:rangeList["Range "+n][1]})
                }
            }
            pagedLod.boundingSphere = [json["osg.PagedLOD"].UserCenter[0],
                json["osg.PagedLOD"].UserCenter[1],
                json["osg.PagedLOD"].UserCenter[2], json["osg.PagedLOD"].UserCenter[3]];
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
