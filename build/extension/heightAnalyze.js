class HeightAnalyzeLayer extends tjh.ar.PostLayer {
    constructor() {
        super();
        //
        this.name = 'HeightAnalyzeLayer';
        //
        let sourceLayer = [];
        let colorMap = [];
        //
        this.addSourceLayer = function (layer) {
            sourceLayer[sourceLayer.length] = layer;
        }

        this.removeSourceLayer = function (layer) {
            let index = sourceLayer.indexOf(layer);
            if(index >= 0) {
                sourceLayer.splice(index, 1);
            }
        }

        this.getSourceLayer = function () {
            return sourceLayer;
        }

        this.setColorMap = function (map) {
            colorMap = map;
        }

        this.getColorMap = function () {
            return colorMap;
        }

        let findModel = (node)=> {
            if(node.isPlantModel || node.parent.name === "IndexNode") {
                return
            }
        }

        this.getDatumPlaneScene = function () {
            if(colorMap.length < 2)
                return null;
            //
            let models = [];
            //
            for(let i=0, numLayer = sourceLayer.length; i<numLayer; ++i) {
                let meshes = sourceLayer[i]._visibleMesh_;
                for(let n=0, numMesh = meshes.length; n<numMesh; ++n) {
                    let model = meshes[n];
                    while (model && !model.isPlantModel) {
                        if(model.parent && model.parent.name === "IndexNode")
                            break;
                        //
                        model = model.parent;
                    }
                    if(model) {
                        models[models.length] = model;
                    }
                }
            }
            //
            let datumNodes = new THREE.Group();
            //
            let geomBottom = new THREE.BufferGeometry();
            let bottomCoords = [];
            for(let n=0, numModel = models.length; n<numModel; ++n) {
                let bb = models[n].getBoundingBoxWorld();
                //
                let minxy = new THREE.Vector2(bb.min.x, bb.min.y);
                let maxxy = new THREE.Vector2(bb.max.x, bb.max.y);
                let center = new THREE.Vector2((bb.min.x + bb.max.x)/2.0, (bb.min.y + bb.max.y)/2.0);
                minxy.add(minxy.clone().sub(center).normalize().multiplyScalar(3.5));
                maxxy.add(maxxy.clone().sub(center).normalize().multiplyScalar(3.5));
                bb.min.x = minxy.x; bb.min.y = minxy.y;
                bb.max.x = maxxy.x; bb.max.y = maxxy.y;
                //
                bottomCoords[bottomCoords.length] = bb.min.x;
                bottomCoords[bottomCoords.length] = bb.min.y;
                bottomCoords[bottomCoords.length] = bb.min.z;

                bottomCoords[bottomCoords.length] = bb.max.x;
                bottomCoords[bottomCoords.length] = bb.min.y;
                bottomCoords[bottomCoords.length] = bb.min.z;

                bottomCoords[bottomCoords.length] = bb.max.x;
                bottomCoords[bottomCoords.length] = bb.max.y;
                bottomCoords[bottomCoords.length] = bb.min.z;

                bottomCoords[bottomCoords.length] = bb.min.x;
                bottomCoords[bottomCoords.length] = bb.max.y;
                bottomCoords[bottomCoords.length] = bb.min.z;

                geomBottom.addGroup(n*4, 4, 0);
            }
            //
            let offset = new THREE.Vector3(bottomCoords[0], bottomCoords[1], bottomCoords[2]);
            for(let n=0, length = bottomCoords.length/3; n<length; ++n) {
                bottomCoords[n*3] -= offset.x;
                bottomCoords[n*3 + 1] -= offset.y;
                bottomCoords[n*3 + 2] -= offset.z;
            }
            geomBottom.addAttribute('position', new THREE.Float32BufferAttribute(bottomCoords, 3));
            let meshBottom = new THREE.Mesh(geomBottom, [{visible:true, dispose:()=>{}}]);
            meshBottom.position.copy(offset);
            meshBottom.drawMode = THREE.TriangleFanDrawMode;
            meshBottom.frustumCulled = false;
            datumNodes.add(meshBottom);
            //
            datumNodes.updateMatrixWorld(true);
            //
            bottomCoords= null;
            //
            return datumNodes;
        };

        this.getAnalyzeScene = function () {
            if(colorMap.length < 2)
                return null;
            //
            let models = [];
            //
            for(let i=0, numLayer = sourceLayer.length; i<numLayer; ++i) {
                let meshes = sourceLayer[i]._visibleMesh_;
                for(let n=0, numMesh = meshes.length; n<numMesh; ++n) {
                    let model = meshes[n];
                    while (model && !model.isPlantModel) {
                        if(model.parent && model.parent.name === "IndexNode")
                            break;
                        //
                        model = model.parent;
                    }
                    if(model) {
                        models[models.length] = model;
                    }
                }
            }
            //
            let analyzeNodes = new THREE.Group();
            //
            for(let n=0, numModel = models.length; n<numModel; ++n) {
                let bb = models[n].getBoundingBoxWorld();
                //
                let startMap = 0;
                let endMap = 0;
                for(let i=0, numMap = colorMap.length; i<numMap; ++i) {
                    if(0 > colorMap[i].range[0] && 0 <= colorMap[i].range[1]) {
                        startMap = i;
                    }
                    //
                    if(bb.max.z - bb.min.z > colorMap[i].range[0] && bb.max.z - bb.min.z <= colorMap[i].range[1]) {
                        endMap = i;
                    }
                }
                //
                if(endMap <= startMap)
                    continue;
                //
                let group = new THREE.Group();
                //
                let bottomCoords = [bb.min.x, bb.min.y, bb.min.z, bb.min.x, bb.max.y, bb.min.z, bb.max.x, bb.max.y, bb.min.z, bb.max.x, bb.min.y, bb.min.z];
                let geomBottom = new THREE.BufferGeometry();
                geomBottom.addAttribute('position', new THREE.Float32BufferAttribute(bottomCoords, 3));
                let meshBottom = new THREE.Mesh(geomBottom, new THREE.MeshBasicMaterial({color:colorMap[startMap].color, transparent:true,opacity: 0.6}));
                meshBottom.drawMode = THREE.TriangleFanDrawMode;
                meshBottom.frustumCulled = false;
                group.add(meshBottom);
                //
                for(let i=startMap; i<= endMap; ++i) {
                    let low = colorMap[i].range[0] < 0 ? 0 : colorMap[i].range[0];
                    let heigh = colorMap[i].range[1] > bb.max.z - bb.min.z ? bb.max.z - bb.min.z : colorMap[i].range[1];
                    //
                    low += bb.min.z;
                    heigh += bb.min.z;
                    let coords = [bb.min.x, bb.min.y, heigh, bb.min.x, bb.min.y, low,
                        bb.max.x, bb.min.y, heigh, bb.max.x, bb.min.y, low,
                        bb.max.x, bb.max.y, heigh, bb.max.x, bb.max.y, low,
                        bb.min.x, bb.max.y, heigh, bb.min.x, bb.max.y, low,
                        bb.min.x, bb.min.y, heigh, bb.min.x, bb.min.y, low];
                    let geom = new THREE.BufferGeometry();
                    geom.addAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
                    let mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color:colorMap[i].color, transparent:true,opacity: 0.6}));
                    mesh.drawMode = THREE.TriangleStripDrawMode;
                    mesh.frustumCulled = false;
                    group.add(mesh);
                }
                //
                let topCoords = [bb.min.x, bb.min.y, bb.max.z, bb.max.x, bb.min.y, bb.max.z, bb.max.x, bb.max.y, bb.max.z, bb.min.x, bb.max.y, bb.max.z];
                let geomTop = new THREE.BufferGeometry();
                geomTop.addAttribute('position', new THREE.Float32BufferAttribute(topCoords, 3));
                let meshTop = new THREE.Mesh(geomTop, new THREE.MeshBasicMaterial({color:colorMap[endMap].color, transparent:true,opacity: 0.6}));
                meshTop.drawMode = THREE.TriangleFanDrawMode;
                meshTop.frustumCulled = false;
                group.add(meshTop);
                //
                analyzeNodes.add(group);
            }
            //
            return analyzeNodes;
        };

        this.isEmpty = function () {
            let empty = true;
            for(let n=0, length = sourceLayer.length; n<length; ++n) {
                if(sourceLayer[n].visible) {
                    empty = false;
                    break;
                }
            }
            //
            return empty;
        };
    }
};

class HeightAnalyzeRenderPass extends tjh.ar.RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        let heightAnalyzeRenderPass = this;
        //
        let heightAnalyzeLayer = scene.getPostLayer('HeightAnalyzeLayer')[0].layer;
        let sourceLayers = heightAnalyzeLayer.getSourceLayer();
        //
        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        //
        let offset = new THREE.Vector3(0,0,0);
        let proxyCamera = this.camera.clone();
        //
        let datumDepthRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
        datumDepthRT.texture.generateMipmaps = false;
        let datumDepthScene = new THREE.Scene();
        datumDepthScene.overrideMaterial = new THREE.MeshDepthMaterial();
        datumDepthScene.overrideMaterial.side = THREE.DoubleSide;
        datumDepthScene.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
        datumDepthScene.overrideMaterial.blending = THREE.NoBlending;
        let datumDepthCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        datumDepthCamera.position.set(0,0,0);
        datumDepthCamera.updateMatrixWorld();
        let datumDepthCameraNearFar = new THREE.Vector2();
        let datumRange = new THREE.Vector4();
        let datumDepthRenderPass = new tjh.ar.RenderPass(datumDepthScene, datumDepthCamera, datumDepthRT);
        datumDepthRenderPass.render = function (renderer) {
            let tmp = heightAnalyzeLayer.getDatumPlaneScene();
            if(!tmp || tmp.children.length === 0) {
                return false;
            }
            //
            let bb = tmp.getBoundingBoxWorld();
            offset.x = -(bb.min.x + bb.max.x)/2.0;
            offset.y = -(bb.min.y + bb.max.y)/2.0;
            offset.z = -(bb.min.z + bb.max.z)/2.0;
            bb.translate(offset);
            tmp.position.copy(offset);
            tmp.updateMatrixWorld(true);
            //
            proxyCamera = heightAnalyzeRenderPass.camera.clone();
            proxyCamera.position.add(offset);
            proxyCamera.updateMatrixWorld(true);
            //
            datumDepthCameraNearFar.x = -bb.max.z -10;
            datumDepthCameraNearFar.y = -bb.min.z +10;
            datumRange.set(bb.min.x, bb.max.x, bb.min.y, bb.max.y);
            //
            datumDepthCamera.left = bb.min.x;
            datumDepthCamera.right = bb.max.x;
            datumDepthCamera.top = bb.max.y;
            datumDepthCamera.bottom = bb.min.y;
            datumDepthCamera.near = datumDepthCameraNearFar.x;
            datumDepthCamera.far = datumDepthCameraNearFar.y;
            datumDepthCamera.updateProjectionMatrix();
            //
            datumDepthScene.add(tmp);
            //
            let oldClearColor = renderer.getClearColor().clone();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
            renderer.render(datumDepthScene, datumDepthCamera, datumDepthRT);
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            //
            datumDepthScene.remove(tmp);
            tmp.dispose();
            tmp = null;
            return true;
        };
        //
        let  analyzeLayerDepthRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
        analyzeLayerDepthRT.texture.generateMipmaps = false;
        let analyzeLayerScene = new THREE.Scene();
        analyzeLayerScene.overrideMaterial = new THREE.MeshDepthMaterial();
        analyzeLayerScene.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
        analyzeLayerScene.overrideMaterial.blending = THREE.NoBlending;
        let analyzeLayerRenderPass = new tjh.ar.RenderPass(scene,camera, analyzeLayerDepthRT);
        analyzeLayerRenderPass.render = function (renderer) {
            this.camera = heightAnalyzeRenderPass.camera;
            //
            for(let n=0, length = sourceLayers.length; n<length; ++n) {
                sourceLayers[n].parent = null;
                analyzeLayerScene.add(sourceLayers[n]);
            }
            //
            let oldClearColor = renderer.getClearColor().clone();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
            renderer.render(analyzeLayerScene, this.camera, analyzeLayerDepthRT);
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            //
            for(let n=0, length = sourceLayers.length; n<length; ++n) {
                analyzeLayerScene.remove(sourceLayers[n]);
                sourceLayers[n].parent = scene;
            }
            //
            return true;
        };
        //
        let getAnalyzeMaterial = (color_map)=> {
            let m = new THREE.ShaderMaterial( {
                uniforms: {
                    "datumDepth": { value: null },
                    "datumVM": {value: new THREE.Matrix4()},
                    "datumPM": {value: new THREE.Matrix4()},
                    "datumCameraNearFar": {value: new THREE.Vector2(0.0, 0.0)},
                    "cameraNearFar": {value: new THREE.Vector2(0.0, 0.0)},
                    "invVM": {value: new THREE.Matrix4()},
                    "invPM": {value: new THREE.Matrix4()},
                    "analyzeLayerDepth": { value: null },
                    "sourceDepth": {value: null},
                    "sourceColor": {value: null}
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "#include <packing>\
                    varying vec2 vUv;\
                    uniform vec2 datumCameraNearFar;\
                    uniform vec2 cameraNearFar;\
                    uniform mat4 invVM;\
                    uniform mat4 invPM;\
                    uniform mat4 datumVM;\
                    uniform mat4 datumPM;\
                    uniform sampler2D datumDepth;\
                    uniform sampler2D analyzeLayerDepth;\
                    uniform sampler2D sourceDepth;\
                    uniform sampler2D sourceColor;\
                    \
                    void main() {\
                        colorMap\
                        vec4 color = texture2D(sourceColor, vUv);\
                        float s_d = texture2D(sourceDepth, vUv.st).x;\
                        float t_d = unpackRGBAToDepth(texture2D(analyzeLayerDepth, vUv.st));\
                        float s_vz = perspectiveDepthToViewZ( s_d, cameraNearFar.x, cameraNearFar.y );\
                        float t_vz = perspectiveDepthToViewZ( t_d, cameraNearFar.x, cameraNearFar.y );\
                        float s_d_o = viewZToOrthographicDepth( s_vz, cameraNearFar.x, cameraNearFar.y );\
                        float t_d_o = viewZToOrthographicDepth( t_vz, cameraNearFar.x, cameraNearFar.y );\
                        float delta = abs(t_d_o - s_d_o);\
                        gl_FragColor = color;\
                        if(t_d_o > 0.9 || delta > 0.0001)\
                        {\
                        } else {\
                          vec4 nds = vec4(vUv.s*2.0 - 1.0, vUv.t*2.0 - 1.0, t_d*2.0 - 1.0, 1.0);\
                          mat4 bias = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);\
                          vec4 vp = invVM*invPM*nds;\
                          vp = vp / vp.w;\
                          vec4 texCoord = bias*datumPM*datumVM*vp; \
                          float d_d = unpackRGBAToDepth(texture2DProj( datumDepth, texCoord));\
                          float d_z = orthographicDepthToViewZ(d_d, datumCameraNearFar.x, datumCameraNearFar.y);\
                          float h = vp.z - d_z;\
                          for(int i=0; i < numColorMap; i++) {\
                             if(h >= mapRange[i].x && h < mapRange[i].y) {\
                               gl_FragColor = color*0.5 + mapColor[i]*0.5;\
                               break;\
                             }\
                          }\
                        }\
                    }"
            } );
            //
            let colorMap = "const int numColorMap = " + color_map.length + ";\n";
            colorMap += "vec2 mapRange[numColorMap];\n";
            colorMap += "vec4 mapColor[numColorMap];\n";
            for(let n=0, length = color_map.length; n<length;++n) {
                colorMap += "mapRange[" + n + "] = vec2(" + color_map[n].range[0] + ',' + color_map[n].range[1] + ');\n';
                colorMap += "mapColor[" + n + "] = vec4(" + color_map[n].color.r + ',' + color_map[n].color.g + ',' + color_map[n].color.b + ', 1.0);\n';
            }
            m.fragmentShader = m.fragmentShader.replace(/colorMap/, colorMap);
            //
            return m;
        };
        //
        let  analyzeResRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
        analyzeResRT.texture.generateMipmaps = false;

        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        //
        let analyzeScene = new THREE.Scene();
        let quad = new THREE.Mesh( geom, {visible:true, dispose:()=>{}});
        let analyzeRenderPass = new tjh.ar.RenderPass(analyzeScene, orthoCamera, analyzeResRT);
        analyzeRenderPass.render = function (renderer) {
            let inverseVM = new THREE.Matrix4();
            let inversePM = new THREE.Matrix4();
            inverseVM.getInverse(proxyCamera.matrixWorldInverse.clone());
            inversePM.getInverse(proxyCamera.projectionMatrix.clone());

            let frustum = proxyCamera.isPerspectiveCamera ? proxyCamera.projectionMatrix.getFrustum() : proxyCamera.projectionMatrix.getOrtho();

            quad.material = getAnalyzeMaterial(heightAnalyzeLayer.getColorMap());
            quad.material.uniforms["datumDepth"].value = datumDepthRT.texture;
            quad.material.uniforms["datumCameraNearFar"].value.copy(datumDepthCameraNearFar);
            quad.material.uniforms["cameraNearFar"].value.set(frustum.zNear, frustum.zFar);
            quad.material.uniforms["invVM"].value.copy(inverseVM);
            quad.material.uniforms["invPM"].value.copy(inversePM);
            quad.material.uniforms["datumVM"].value.copy(datumDepthCamera.matrixWorldInverse);
            quad.material.uniforms["datumPM"].value.copy(datumDepthCamera.projectionMatrix);
            quad.material.uniforms["analyzeLayerDepth"].value = analyzeLayerDepthRT.texture;
            quad.material.uniforms["sourceDepth"].value = renderTarget.depthTexture;
            quad.material.uniforms["sourceColor"].value = renderTarget.texture;
            quad.drawMode = THREE.TriangleFanDrawMode;
            quad.frustumCulled = false;
            analyzeScene.add(quad);
            //
            renderer.render(analyzeScene, orthoCamera, analyzeResRT);
            //
            analyzeScene.remove(quad);
            quad.material.dispose();
            quad.material = {visible:true, dispose:()=>{}};
            //
            return true;
        };

        //
        this.render = function (renderer) {
            if(datumDepthRenderPass.render(renderer)) {
                analyzeLayerRenderPass.render(renderer);
                analyzeRenderPass.render(renderer);
                //
                renderer.setTexture2D( renderTarget.texture, 0 );
                renderer.context.copyTexImage2D( renderer.context.TEXTURE_2D, 0, renderer.context.RGBA, 0, 0, renderTarget.width, renderTarget.height, 0 );
            }
            //
            return true;
        }

        this.setSize = function(width, height) {
            datumDepthRT.setSize(width, height);
            analyzeLayerDepthRT.setSize(width, height);
            analyzeResRT.setSize(width, height);
        }
        //
        this.release = function () {
            datumDepthScene.overrideMaterial.dispose();
            analyzeLayerScene.overrideMaterial.dispose();
            quad.dispose();
            //
            datumDepthRT.texture.dispose();
            datumDepthRT.dispose();

            analyzeLayerDepthRT.texture.dispose();
            analyzeLayerDepthRT.dispose();

            analyzeResRT.texture.dispose();
            analyzeResRT.dispose();
        }
    }
};

/*class HeightAnalyzeRenderPass extends tjh.ar.RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        //
        let heightAnalyzeLayer = scene.getPostLayer('HeightAnalyzeLayer')[0].layer;
        let sourceLayers = heightAnalyzeLayer.getSourceLayer();
        //
        let stencilRenderPass = new tjh.ar.RenderPass(scene, camera, renderTarget);
        let stencilScene = new THREE.Scene();
        stencilScene.overrideMaterial = new THREE.MeshBasicMaterial();
        stencilScene.overrideMaterial.depthWrite = false;
        stencilScene.overrideMaterial.depthTest = true;
        stencilScene.overrideMaterial.colorWrite = false;
        //stencilScene.polygonOffset = true;
        stencilScene.polygonOffsetFactor = -10.0;
        stencilScene.polygonOffsetUnits = -10.0;
        stencilRenderPass.render = function (renderer) {
            for(let n=0, length = sourceLayers.length; n<length; ++n) {
                sourceLayers[n].parent = null;
                stencilScene.add(sourceLayers[n]);
            }
            //
            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setMask(0xff);
            renderer.state.buffers.stencil.setLocked(true);

            renderer.autoClear = false;
            renderer.clearTarget(renderTarget, false, false, true);
            //
            renderer.state.buffers.stencil.setFunc(renderer.context.ALWAYS, 1, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.REPLACE, renderer.context.REPLACE);
            renderer.render(stencilScene, this.camera, renderTarget);
            //
            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
            //
            renderer.autoClear = true;
            //
            for(let n=0, length = sourceLayers.length; n<length; ++n) {
                stencilScene.remove(sourceLayers[n]);
                sourceLayers[n].parent = scene;
            }
            //
            return true;
        }
        //
        let analyzeScene = new THREE.Scene();
        this.render = function (renderer) {
            let tmp = heightAnalyzeLayer.getDatumPlaneScene();
            if(!tmp) {
                return true;
            }
            //
            stencilRenderPass.render(renderer);
            //
            analyzeScene.add(tmp);
            //
            renderer.autoClear = false;
            //
            renderer.state.buffers.depth.setTest(false);
            renderer.state.buffers.depth.setMask(false);
            renderer.state.buffers.depth.setLocked(true);
            //
            renderer.state.buffers.stencil.setTest(false);
            renderer.state.buffers.stencil.setMask(0xff);
            renderer.state.buffers.stencil.setLocked(true);
            renderer.state.buffers.stencil.setFunc(renderer.context.EQUAL, 1, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.KEEP, renderer.context.KEEP);
            //
            renderer.render(analyzeScene, this.camera, renderTarget);

            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
            //
            renderer.state.buffers.depth.setLocked(false);
            renderer.state.buffers.depth.setTest(true);
            renderer.state.buffers.depth.setMask(true);
            //
            renderer.autoClear = true;
            //
            analyzeScene.remove(tmp);
            tmp.dispose();
            //
            return true;
        }
    }
};*/
