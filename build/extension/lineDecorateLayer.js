class LineDecorateLayer extends tjh.ar.PostLayer {
    constructor(url) {
        super();
        //
        this.url = url;
        this.lineWidth = 1.5;
        this.color = new THREE.Color(0x00ff00);
        this.isLineDecorateLayer = true;
        //
        this.lines = [];
        this.scene = new THREE.Scene();
        //
        this.ready = false;
        //
        this.isEmpty = function () {
            if(this.lines.length > 0)
                return false;
            //
            return true;
        }
        //
        let layer = this;
        //
        let parseLine = (features)=> {
            for(let i = 0, flength = features.length; i < flength; ++i)
            {
                let geom = features[i]["geometry"]
                if(geom["type"] === "LineString")
                {
                    let coord = geom["coordinates"];
                    let offset = new THREE.Vector3(coord[0], coord[1], coord[2]);
                    let numVertex = coord.length/3;
                    for(let n=0; n<numVertex; ++n) {
                        coord[n*3] -= offset.x;
                        coord[n*3 + 1] -= offset.y;
                        coord[n*3 + 2] -= offset.z;
                    }
                    //
                    var geometry = new THREE.LineGeometry();
                    geometry.setPositions( coord );
                    line = new THREE.Line2( geometry, {visible:true, dispose: function () {}} );
                    line.position.copy(offset);
                    line.computeLineDistances();
                    //
                    this.lines[this.lines.length] = line;
                    this.scene.add(line);
                }
            }
        }

        let parseMultiLine = (features)=> {
            for(let i = 0, flength = features.length; i < flength; ++i)
            {
                let geom = features[i]["geometry"]
                if(geom["type"] === "MultiLineString")
                {
                    let lines = geom["coordinates"];
                    for(let j = 0, numLine = lines.length; j < numLine; ++j)
                    {
                        let line= lines[j];
                        let offset = new THREE.Vector3(line[0][0] - 636775, line[0][1] - 5371100, 0);
                        let numVertex = line.length;
                        let coords = [];
                        for(let n=0; n<numVertex; ++n) {
                            coords[n*3] = line[n][0] - offset.x - 636775;
                            coords[n*3 + 1] = line[n][1] - offset.y - 5371100;
                            coords[n*3 + 2] = 0;
                        }
                        //
                        /*
                        var geometry = new THREE.LineGeometry();
                        geometry.setPositions( coords );
                        line = new THREE.Line2( geometry, {visible:true, dispose: function () {}} );
                        line.position.copy(offset);
                        line.computeLineDistances();
                        */
                        var geo = new THREE.BufferGeometry();
                        geo.addAttribute( 'position', new THREE.Float32BufferAttribute( coords, 3 ) );
                        line = new THREE.Line( geo, {visible:true, dispose: function () {}} );
                        line.position.copy(offset);
                        //
                        this.lines[this.lines.length] = line;
                        this.scene.add(line);
                    }
                }
            }
        }

        let parseMultiPolygon = (features)=> {
            for(let i = 0, flength = features.length; i < flength; ++i)
            {
                let geom = features[i]["geometry"]

                if(geom["type"] === "MultiPolygon")
                {
                    let tempMultiPC = [];
                    let multiPolygonCoords = geom["coordinates"];
                    let multiPolygonCount = multiPolygonCoords.length;
                    for(let k  = 0; k< multiPolygonCount; ++k) {
                        let polygonCoords = multiPolygonCoords[k];
                        //
                        for (let n = 0; n < polygonCoords.length; ++n) {
                            let coord = polygonCoords[n];
                            let offset = new THREE.Vector3(coordn[0], coord[1], coord[2]);
                            let numVertex = coord.length / 3;
                            for (let n = 0; n < numVertex; ++n) {
                                coord[n * 3] -= offset.x;
                                coord[n * 3 + 1] -= offset.y;
                                coord[n * 3 + 2] -= offset.z;
                            }
                            //
                            var geometry = new THREE.LineGeometry();
                            geometry.setPositions(coord);
                            line = new THREE.Line2(geometry, {
                                visible: true, dispose: function () {
                                }
                            });
                            line.position.copy(offset);
                            line.computeLineDistances();
                            //
                            this.lines[this.lines.length] = line;
                            this.scene.add(line);
                        }
                    }
                }

            }
        }

        let parsePolygon = (features)=> {
            for(let i = 0, flength = features.length; i < flength; ++i)
            {
                let geom = features[i]["geometry"]

                if(geom["type"] === "Polygon")
                {
                    let polygonCoords = geom["coordinates"];
                    for (let n = 0; n < polygonCoords.length; ++n) {
                        let coord = polygonCoords[n];
                        let offset = new THREE.Vector3(coordn[0], coord[1], coord[2]);
                        let numVertex = coord.length / 3;
                        for (let n = 0; n < numVertex; ++n) {
                            coord[n * 3] -= offset.x;
                            coord[n * 3 + 1] -= offset.y;
                            coord[n * 3 + 2] -= offset.z;
                        }
                        //
                        var geometry = new THREE.LineGeometry();
                        geometry.setPositions(coord);
                        line = new THREE.Line2(geometry, {
                            visible: true, dispose: function () {
                            }
                        });
                        line.position.copy(offset);
                        line.computeLineDistances();
                        //
                        this.lines[this.lines.length] = line;
                    }
                }
            }
        }
        // 解析url 参数信息
        let _url_param_ = url.split("&");
        if (_url_param_[0].substr(-3, 3).toLocaleLowerCase() === "wfs") {
            this.isWFS = true;
        }
        for (let i = 0; i < _url_param_.length; ++i) {
            let _param_ = _url_param_[i].split("=");
            if (_param_.length !== 2)
                continue;
            //
            if (_param_[0].toLocaleLowerCase() === "typename") {
                this.typeName = _param_[1];
            }

            if (_param_[0].toLocaleLowerCase() === "version") {
                this.version = _param_[1];
            }
        }
        //
        let requestUrl = _url_param_[0] + "&" + _url_param_[1];
        requestUrl +="&request=GetFeature" + "&typeName="+this.typeName;
        requestUrl +="&outputFormat=application%2Fjson";
        //
        var xhr = new XMLHttpRequest();
        xhr.open('GET',requestUrl);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                try
                {
                    let JsonData = JSON.parse(this.response);
                    let JsonFeatures = JsonData["features"];
                    if(JsonFeatures.length > 1)
                    {
                        let featureType = JsonFeatures[0]["geometry"]["type"];
                        if(featureType === "LineString") {
                            parseLine(JsonFeatures);
                        }else if(featureType === "Polygon") {
                            parsePolygon(JsonFeatures);
                        }
                        if(featureType === "MultiLineString") {
                            parseMultiLine(JsonFeatures);
                        }else if(featureType === "MultiPolygon") {
                            parseMultiPolygon(JsonFeatures);
                        }
                    }
                    //
                    layer.ready = true;

                }catch(error) {
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
};


class LineDecorateRenderPass extends tjh.ar.RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        let LineDecorateRenderPass = this;
        //
        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        //
        let lineRT = new THREE.WebGLRenderTarget(1024, 1024, pars);
        lineRT.texture.generateMipmaps = false;
        let lineRTTCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        let lineRTTRenderPass = new tjh.ar.RenderPass(LineDecorateRenderPass.scene, lineRTTCamera, lineRT);
        let lineRTFinished = false;
        lineRTTRenderPass.render = function (renderer) {
            //if(lineRTFinished )
             //   return true;
            //
            let LDLayers = [];
            //let bb = new THREE.Box3();
            for(let n=0, numPostLayer = this.scene.postLayers.length; n<numPostLayer; ++n) {
                let postLayer = this.scene.postLayers[n];
                if(postLayer.layer.isLineDecorateLayer && postLayer.enable && postLayer.layer.ready && !postLayer.layer.isEmpty()) {
                    LDLayers[LDLayers.length] = postLayer.layer;
                    postLayer.layer.scene.updateMatrixWorld(true);
                    //bb.expandByBox3(postLayer.layer.scene.getBoundingBoxWorld());
                }
            }
            //
            if(LDLayers.length === 0) {
                return false;
            }
            //
            let bb = new THREE.Box3();
            for(let i=0, numTerrain = this.scene.terrainLayers.length; i<numTerrain; ++i) {
                bb.expandByBox3(this.scene.terrainLayers[i].getCurrentBoundingBoxWorld());
            }
            //
            if(!bb.valid()) {
                return false;
            }
            //
            let center = new THREE.Vector3();
            bb.getCenter(center);
            lineRTTCamera.position.set(center.x, center.y, 10);
            lineRTTCamera.lookAt(center.x, center.y, 0);
            lineRTTCamera.updateMatrixWorld(true);
            //
            bb.applyMatrix4(lineRTTCamera.matrixWorldInverse);
            let width = bb.max.x - bb.min.x;
            let height = bb.max.y - bb.min.y;
            let size = width > height ? width : height;
            lineRTTCamera.left = -size/2;
            lineRTTCamera.right = size/2;
            lineRTTCamera.top = size/2;
            lineRTTCamera.bottom = -size/2;
            lineRTTCamera.near = 1;
            lineRTTCamera.far = 100;
            lineRTTCamera.updateProjectionMatrix();
            //
            renderer.autoClear = false;
            let oldClearColor = renderer.getClearColor();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(0x000000), 0.0);
            renderer.clearTarget(lineRT, true, false, false);
            //
            let oldSize = renderer.getSize();
            renderer.setSize(1024, 1024);
            //
            for(let n=0, numLayer = LDLayers.length; n<numLayer; ++n) {
                /*LDLayers[n].scene.overrideMaterial = new THREE.LineMaterial( {
                    color: LDLayers[n].color,
                    linewidth: LDLayers[n].lineWidth, // in pixels
                    resolution:  new THREE.Vector2(lineRT.width, lineRT.height),
                    depthTest : false,
                    depthWrite : false,
                    dashed: false
                } );*/
                //
                LDLayers[n].scene.overrideMaterial = new THREE.LineBasicMaterial( { color: LDLayers[n].color,  blending:THREE.NoBlending} );
                //
                renderer.render(LDLayers[n].scene, lineRTTCamera, lineRT);
                //
                LDLayers[n].scene.overrideMaterial.dispose();
                LDLayers[n].scene.overrideMaterial = null;
            }
            //
            renderer.autoClear = true;
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            //
            renderer.setSize(oldSize.width, oldSize.height);
            //
            lineRTFinished = true;
            //
            return true;
        }
        //
        let terrainDepthRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
        terrainDepthRT.texture.generateMipmaps = false;
        let terrainDepthScene = new THREE.Scene();
        terrainDepthScene.overrideMaterial = new THREE.MeshDepthMaterial();
        terrainDepthScene.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
        terrainDepthScene.overrideMaterial.blending = THREE.NoBlending;
        let terrainDepthRenderPass = new tjh.ar.RenderPass(LineDecorateRenderPass.scene, LineDecorateRenderPass.camera, terrainDepthRT);
        terrainDepthRenderPass.render = function (renderer) {
            this.camera = LineDecorateRenderPass.camera;
            //
            for(let n=0, length = LineDecorateRenderPass.scene.terrainLayers.length; n<length; ++n) {
                LineDecorateRenderPass.scene.terrainLayers[n].parent = null;
                terrainDepthScene.add(LineDecorateRenderPass.scene.terrainLayers[n]);
            }
            //
            let oldClearColor = renderer.getClearColor().clone();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
            renderer.render(terrainDepthScene, this.camera, terrainDepthRT);
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            //
            for(let n=0, length = LineDecorateRenderPass.scene.terrainLayers.length; n<length; ++n) {
                terrainDepthScene.remove(LineDecorateRenderPass.scene.terrainLayers[n]);
                LineDecorateRenderPass.scene.terrainLayers[n].parent = LineDecorateRenderPass.scene;
            }
            //
            return true;
        }
        //
        let getDecorateMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "sourceColor": { value: null },
                    "sourceDepth": { value: null },
                    "decorateColor": {value: null},
                    "terrainDepth": { value: null },
                    "decorateVM": {value: new THREE.Matrix4()},
                    "decoratePM": {value: new THREE.Matrix4()},
                    "decorateCameraNearFar": {value: new THREE.Vector2(0.0, 0.0)},
                    "cameraNearFar": {value: new THREE.Vector2(0.0, 0.0)},
                    "invVM": {value: new THREE.Matrix4()},
                    "invPM": {value: new THREE.Matrix4()},
                },

                vertexShader:
                    "varying vec2 vUv0;\n\
                     varying vec2 vUv1;\n\
                     uniform mat4 decorateVM;\
                     uniform mat4 decoratePM;\
                    void main() {\n\
                        vec4 world_Position = modelMatrix*vec4( position, 1.0 );\
                        vec4 tmp = decoratePM*decorateVM*world_Position;\
                        vUv1 = vec2((tmp.x + 1.0)/2.0, (tmp.y + 1.0)/2.0);\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                        vUv0 = vec2((gl_Position.x + 1.0)/2.0, (gl_Position.y + 1.0)/2.0);\
                    }",

                fragmentShader:
                    "#include <packing>\
                    varying vec2 vUv0;\
                    varying vec2 vUv1;\
                    uniform sampler2D sourceColor;\
                    uniform sampler2D sourceDepth;\
                    uniform sampler2D decorateColor;\
                    uniform sampler2D terrainDepth;\
                    uniform mat4 decorateVM;\
                    uniform mat4 decoratePM;\
                    uniform vec2 decorateCameraNearFar;\
                    uniform vec2 cameraNearFar;\
                    uniform mat4 invVM;\
                    uniform mat4 invPM;\
                    \
                    void main() {\
                       vec4 color = texture2D( decorateColor, vUv1);\
                       if(color.a > 0.01 && vUv1.x >= -1.0 && vUv1.x <= 1.0 && vUv1.y >= -1.0 && vUv1.y <= 1.0)\
                       gl_FragColor = vec4(color.rgb, 1.0);\
                    }"
            } );
        };
        //
        let decorateRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
        decorateRT.texture.generateMipmaps = false;
        //
        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        //
        let decorateScene = new THREE.Scene();
        let quad = new THREE.Mesh( geom, {visible:true});

        quad.drawMode = THREE.TriangleFanDrawMode;
        quad.frustumCulled = false;
        //decorateScene.add(quad);
        //
        let decorateRenderPass = new tjh.ar.RenderPass(decorateScene, orthoCamera, decorateRT);
        decorateRenderPass.render = function (renderer) {
            let proxylineRTTCamera = lineRTTCamera.clone();
            //proxylineRTTCamera.position.set(0,0,0);
            //proxylineRTTCamera.updateMatrixWorld(true);
            //
            let proxyCamera = LineDecorateRenderPass.camera.clone();
            //proxyCamera.position.sub(lineRTTCamera.position);
            //proxyCamera.updateMatrixWorld(true);
            //
            let inverseVM = new THREE.Matrix4();
            let inversePM = new THREE.Matrix4();
            inverseVM.getInverse(proxyCamera.matrixWorldInverse.clone());
            inversePM.getInverse(proxyCamera.projectionMatrix.clone());

            let frustum = proxyCamera.isPerspectiveCamera ? proxyCamera.projectionMatrix.getFrustum() : proxyCamera.projectionMatrix.getOrtho();

            quad.material = getDecorateMaterial();
            quad.material.blending = THREE.NoBlending;
            quad.material.uniforms["decorateColor"].value = lineRT.texture;
            quad.material.uniforms["decorateCameraNearFar"].value.set(1, 100);
            quad.material.uniforms["cameraNearFar"].value.set(frustum.zNear, frustum.zFar);
            quad.material.uniforms["invVM"].value.copy(inverseVM);
            quad.material.uniforms["invPM"].value.copy(inversePM);
            quad.material.uniforms["decorateVM"].value.copy(lineRTTCamera.matrixWorldInverse);
            quad.material.uniforms["decoratePM"].value.copy(lineRTTCamera.projectionMatrix);
            quad.material.uniforms["terrainDepth"].value = terrainDepthRT.texture;
            quad.material.uniforms["sourceDepth"].value = renderTarget.depthTexture;
            quad.material.uniforms["sourceColor"].value = renderTarget.texture;
            quad.material.needUpdate = true;
            //
            for(let n=0, length = LineDecorateRenderPass.scene.terrainLayers.length; n<length; ++n) {
                LineDecorateRenderPass.scene.terrainLayers[n].parent = null;
                decorateScene.add(LineDecorateRenderPass.scene.terrainLayers[n]);
            }
            //
            decorateScene.overrideMaterial = quad.material;
            //
            renderer.render(decorateScene, LineDecorateRenderPass.camera, decorateRT);
            //
            for(let n=0, length = LineDecorateRenderPass.scene.terrainLayers.length; n<length; ++n) {
                decorateScene.remove(LineDecorateRenderPass.scene.terrainLayers[n]);
                LineDecorateRenderPass.scene.terrainLayers[n].parent = LineDecorateRenderPass.scene;
            }
            //
            decorateScene.overrideMaterial = null;
            quad.material.dispose();

            return true;
        };
        //
        this.render = function (renderer) {
            if(lineRTTRenderPass.render(renderer)) {
                //terrainDepthRenderPass.render(renderer);
                decorateRenderPass.render(renderer);
                //
                renderer.setTexture2D( renderTarget.texture, 0 );
                renderer.context.copyTexImage2D( renderer.context.TEXTURE_2D, 0, renderer.context.RGBA, 0, 0, renderTarget.width, renderTarget.height, 0 );
            }
            //
            return true;
        };

        this.setSize = function(width, height) {
            //lineRT.setSize(width, height);
            terrainDepthRT.setSize(width, height);
            decorateRT.setSize(width, height);
        };
        //
        this.release = function () {
            terrainDepthScene.overrideMaterial.dispose();
            terrainDepthScene.overrideMaterial.dispose();
            quad.dispose();
            //
            lineRT.texture.dispose();
            lineRT.dispose();

            terrainDepthRT.texture.dispose();
            terrainDepthRT.dispose();

            decorateRT.texture.dispose();
            decorateRT.dispose();
        };
    }
}
