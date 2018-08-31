import {RenderTechnique} from "./RenderTechnique";
import {NormalRenderPass} from "./RenderPass";
import {TerrainLayer} from "../terrainLayer";
import {ARLayer} from "../arLayer";
import {FeatureLayer} from "../featureLayer";
import {MemDepthSampler} from "../memDepthSampler";

class OutLineTechnique extends RenderTechnique {
    constructor(renderer, scene, camera) {
        super(renderer);
        //
        this.domElement = renderer.domElement;
        this.renderScene = scene;
        this.camera = camera;
        //
        this.outlineColor = new THREE.Color(0xffff00);
        let outLineObjs = [];
        let currentOutLineColor = this.outlineColor;

        let materialReplace = (object)=> {
            let replaceMaterial = (material, update = false)=> {
                let tmp = material;
                if(!update)
                  tmp = material.clone();
                //
                tmp.needUpdate = true;
                //
                if(material instanceof  THREE.MeshBasicMaterial) {
                    tmp.color = currentOutLineColor;
                    tmp.map = null;
                    tmp.lightMap = null;
                    tmp.lightMapIntensity = 1.0;
                    tmp.aoMap = null;
                    tmp.aoMapIntensity = 1.0;
                    tmp.specularMap = null;
                    tmp.alphaMap = null;
                }
                else if(material instanceof  THREE.MeshPhongMaterial) {
                    tmp.color = currentOutLineColor;
                    tmp.shininess = 0;
                    tmp.specular = currentOutLineColor;
                    tmp.map = null;
                    tmp.lightMap = null;
                    tmp.lightMapIntensity = 1.0;
                    tmp.aoMap = null;
                    tmp.aoMapIntensity = 1.0;
                    tmp.emissive = currentOutLineColor;
                    tmp.emissiveIntensity = 1.0;
                    tmp.emissiveMap = null;
                }
                else if(material instanceof  THREE.MeshStandardMaterial) {
                    tmp.color = currentOutLineColor;
                    tmp.map = null;
                    tmp.lightMap = null;
                    tmp.lightMapIntensity = 1.0;
                    tmp.aoMap = null;
                    tmp.aoMapIntensity = 1.0;
                    tmp.emissive = currentOutLineColor;
                    tmp.emissiveIntensity = 1.0;
                    tmp.emissiveMap = null;
                }
                else if(material instanceof  THREE.MeshLambertMaterial) {
                    tmp.color = currentOutLineColor;
                    tmp.map = null;
                    tmp.lightMap = null;
                    tmp.lightMapIntensity = 1.0;
                    tmp.aoMap = null;
                    tmp.aoMapIntensity = 1.0;
                    tmp.emissive = currentOutLineColor;
                    tmp.emissiveIntensity = 1.0;
                    tmp.emissiveMap = null;
                }
                else if(material instanceof  THREE.LineBasicMaterial) {
                    tmp.color = currentOutLineColor;
                }
                else if(material instanceof  THREE.PointsMaterial) {
                    tmp.color = currentOutLineColor;
                }
                else if(material instanceof  THREE.SpriteMaterial) {
                    tmp.color = currentOutLineColor;
                    tmp.map = null;
                }
                else if(material instanceof  THREE.ShaderMaterial) {
                    let frag = tmp.fragmentShader;
                    let end = frag.lastIndexOf('}');
                    tmp.fragmentShader =
                        frag.substr(0, end) + "gl_FragColor = vec4(" + currentOutLineColor.r + "," +currentOutLineColor.g + "," + currentOutLineColor.b + ",1);}";
                }
                //
                return tmp;
            }
            //
            if(object.outlineColor) {
                currentOutLineColor = object.outlineColor;
            }
            //
            if(object.material) {
                if(object.maskMaterial) {
                    if(object.maskMaterial instanceof  Array) {
                        for(let i=0; i<object.maskMaterial.length; ++i) {
                            replaceMaterial(object.maskMaterial[i], true);
                        }
                    }
                    else
                        replaceMaterial(object.maskMaterial, true);
                    //
                    return;
                }
                object.originalMaterial = object.material;
                //
                if(object.material instanceof Array) {
                    object.maskMaterial = [];
                    for(let i=0; i<object.material.length; ++i) {
                        object.maskMaterial.push(replaceMaterial(object.material[i], false));
                    }
                }
                else {
                    object.maskMaterial = replaceMaterial(object.material, false);
                }
            }
            else if(object.children.length>0) {
                for (let i = 0; i < object.children.length; ++i) {
                    materialReplace(object.children[i]);
                }
            }
        }

        let recoverMaterial = (object)=> {
            if(object.maskMaterial) {
                object.material = object.originalMaterial;
                //
                if(object.maskMaterial instanceof  Array) {
                    for(let i=0; i<object.maskMaterial.length; ++i) {
                        object.maskMaterial[i].dispose();
                    }
                }
                else
                    object.maskMaterial.dispose();
                //
                delete object.maskMaterial;
                delete object.originalMaterial;
            }
            else if(object.children.length>0) {
                for (let i = 0; i < object.children.length; ++i) {
                    recoverMaterial(object.children[i]);
                }
            }
        }

        this.addOutlineObj = (...objects)=> {
            for(let i=0; i<objects.length; ++i) {
               if(outLineObjs.indexOf(objects[i]) >= 0) {
               }
               else {
                   if(!objects[i].outlineColor)
                       objects[i].outlineColor = this.outlineColor;
                   //
                   outLineObjs.push(objects[i]);
               }
               //
                //materialReplace(objects[i]);
            }
        }

        this.removeOutlineObj = (...objects)=> {
            for(let i=0; i<objects.length; ++i) {
                let index = outLineObjs.indexOf(objects[i]);
                if(index >= 0) {
                    recoverMaterial(objects[i]);
                    outLineObjs.splice(index,1);
                }
            }
        }

        this.updateOutlineObj = (...objects)=> {
            for(let i=0; i<objects.length; ++i) {
                if(outLineObjs.indexOf(objects[i]) >= 0) {
                    materialReplace(objects[i]);
                }
            }
        }

        this.clear = ()=> {
            for(let i=0; i<outLineObjs.length; ++i) {
                this.removeOutlineObj(outLineObjs[i]);
            }
            //
            outLineObjs = [];
        }
        //
        let fitTerrainLayers = [];
        let visibleTerrainRange = new THREE.Box3();
        let textureMatrix = new THREE.Matrix4();
        //
        let hasTerrainDecorator = scene.stencilVolums.length > 0 ? true : false;
        //
        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        //
        let terrainDepthRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars );
        terrainDepthRT.texture.generateMipmaps = false;
        let terrainDepthCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        terrainDepthCamera.position.set(0,0,0);
        terrainDepthCamera.up.set(0,1,0);
        terrainDepthCamera.lookAt(0,0,-1);
        terrainDepthCamera.updateMatrixWorld();
        terrainDepthCamera.visible = false;
        let terrainDepthCameraNearFar = new THREE.Vector2();
        let memDepthSapmler = new MemDepthSampler();
        memDepthSapmler.data = new Uint8Array(this.domElement.clientWidth * this.domElement.clientHeight * 4);
        memDepthSapmler.size[0] = this.domElement.clientWidth;
        memDepthSapmler.size[1] = this.domElement.clientHeight;
        let depthBufferUpdated = false;
        //
        let offScreenRT = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight, pars);
        offScreenRT.texture.generateMipmaps = false;
        offScreenRT.stencilBuffer = true;
        offScreenRT.depthBuffer = true;
        offScreenRT.depthTexture = new THREE.DepthTexture(this.domElement.clientWidth, this.domElement.clientHeight,
            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
        //
        let offScreenRendering = false;
        //
        let offScreenRenderPass = new NormalRenderPass(this.renderScene, this.camera);
        offScreenRenderPass.outLineObjs = outLineObjs;
        offScreenRenderPass.render = function (renderer) {
            offScreenRendering = false;
            //
            fitTerrainLayers = [];
            for(let i=0; i<this.scene.featureLayers.length; ++i) {
                if(this.scene.featureLayers[i].visible && this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH) {
                    if(!terrainDepthCamera.visible) {
                        this.scene.featureLayers[i].visible = false;
                        fitTerrainLayers.push(this.scene.featureLayers[i]);
                    }
                    else {
                        this.scene.featureLayers[i].memDepthSampler = depthBufferUpdated ? memDepthSapmler : null;
                        //
			            if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].pointMaterial) {
                            this.scene.featureLayers[i].pointMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                            this.scene.featureLayers[i].pointMaterial.uniforms["textureSize"].value.set(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
                            this.scene.featureLayers[i].pointMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                            this.scene.featureLayers[i].pointMaterial.uniforms["textureMatrix"].value = textureMatrix;
                            this.scene.featureLayers[i].pointMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                            this.scene.featureLayers[i].pointMaterial.needUpdate = true;
                        }
                        if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].lineMaterial) {
                            this.scene.featureLayers[i].lineMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                            this.scene.featureLayers[i].lineMaterial.uniforms["textureSize"].value.set(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
                            this.scene.featureLayers[i].lineMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                            this.scene.featureLayers[i].lineMaterial.uniforms["textureMatrix"].value = textureMatrix;
                            this.scene.featureLayers[i].lineMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                            this.scene.featureLayers[i].lineMaterial.needUpdate = true;
                        }
                        if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].polygonMaterial) {
                            this.scene.featureLayers[i].polygonMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                            this.scene.featureLayers[i].polygonMaterial.uniforms["textureSize"].value.set(renderer.domElement.clientWidth, renderer.domElement.clientWidth);
                            this.scene.featureLayers[i].polygonMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                            this.scene.featureLayers[i].polygonMaterial.uniforms["textureMatrix"].value = textureMatrix;
                            this.scene.featureLayers[i].polygonMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                            this.scene.featureLayers[i].polygonMaterial.needUpdate = true;
                        }
                        if(this.scene.featureLayers[i].labelMaterial) {
                            this.scene.featureLayers[i].labelMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                            this.scene.featureLayers[i].labelMaterial.uniforms["textureSize"].value.set(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
                            this.scene.featureLayers[i].labelMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                            this.scene.featureLayers[i].labelMaterial.uniforms["textureMatrix"].value = textureMatrix;
                            this.scene.featureLayers[i].labelMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                            this.scene.featureLayers[i].labelMaterial.needUpdate = true;
                        }
                    }
                }
            }
            //
            if(this.outLineObjs.length === 0) {
                renderer.render(this.scene, this.camera, hasTerrainDecorator ? offScreenRT : undefined);
                //
                renderer.state.buffers.stencil.setLocked(false);
                renderer.state.buffers.stencil.setTest(false);
                //
                if(fitTerrainLayers.length > 0) {
                    for(let i=0; i<fitTerrainLayers.length; ++i) {
                        fitTerrainLayers[i].visible = true;
                    }
                    return true;
                }
                else if(terrainDepthCamera.visible) {
                    return true;
                }
                else if(hasTerrainDecorator) {
                    offScreenRendering = true;
                    return true;
                }
                //
                return false;
            }
            //
            renderer.render(this.scene, this.camera, offScreenRT);
            offScreenRendering = true;
            //
            for(let i=0; i<fitTerrainLayers.length; ++i) {
                fitTerrainLayers[i].visible = true;
            }
            return true;
        }
        this.addRenderPass(offScreenRenderPass);
        //
        let terrainDepthRenderPass = new NormalRenderPass(this.renderScene, this.camera);
        terrainDepthRenderPass.overrideMaterial = new THREE.MeshDepthMaterial();
        terrainDepthRenderPass.overrideMaterial.side = THREE.FrontSide;
        terrainDepthRenderPass.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
        terrainDepthRenderPass.overrideMaterial.blending = THREE.NoBlending;
        terrainDepthRenderPass.frequencyOfReadDepthBuffer = 5;
        terrainDepthRenderPass.numSkipReadDepthBuffer = 0;
        terrainDepthRenderPass.render = function (renderer) {
            if(fitTerrainLayers.length === 0 && !terrainDepthCamera.visible) {
                return true;
            }
            //
            let visibleObjs = [];
            for(let i=0; i<this.scene.featureLayers.length; ++i) {
                if(this.scene.featureLayers[i].visible) {
                    this.scene.featureLayers[i].visible = false;
                    visibleObjs.push(this.scene.featureLayers[i]);
                }
            }
            for(let i=0; i<this.scene.modelLayers.length; ++i) {
                if(this.scene.modelLayers[i].visible) {
                    this.scene.modelLayers[i].visible = false;
                    visibleObjs.push(this.scene.modelLayers[i]);
                }
            }
            for(let i=0; i<this.scene.arLayers.length; ++i) {
                if(this.scene.arLayers[i].visible) {
                    this.scene.arLayers[i].visible = false;
                    visibleObjs.push(this.scene.arLayers[i]);
                }
            }
            for(let i=0; i<this.scene.temporaryObjs.length; ++i) {
                if(this.scene.temporaryObjs[i].visible) {
                    this.scene.temporaryObjs[i].visible = false;
                    visibleObjs.push(this.scene.temporaryObjs[i]);
                }
            }
            //
            visibleTerrainRange.makeEmpty();
            let hasVisibleTerrain = false;
            let getTerrainRange = (terrain)=> {
                if(!terrain.visible)
                    return;
                //
                if(terrain instanceof  THREE.Mesh) {
                    let bx = terrain.getBoundingBoxWorld();
                    if(bx.valid()) {
                        visibleTerrainRange.expandByBox3(bx);
                        hasVisibleTerrain = true;
                    }
                }
                else if(terrain.children.length > 0) {
                    for(let i=0; i<terrain.children.length; ++i) {
                        getTerrainRange(terrain.children[i]);
                    }
                }
            }
            //
            for(let i=0; i<this.scene.terrainLayers.length; ++i) {
                if(this.scene.terrainLayers[i].visible) {
                    getTerrainRange(this.scene.terrainLayers[i]);
                    //visibleTerrainRange.expandByBox3(this.scene.terrainLayers[i].getBoundingBox());
                }
            }
            //
            let oldClearColor = renderer.getClearColor().clone();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
            //
            if(!hasVisibleTerrain) {
                terrainDepthCamera.visible = true;
                renderer.clearTarget(terrainDepthRT, true, false, false);
                renderer.setClearColor(oldClearColor, oldClearAlpha);
                for(let i=0; i<visibleObjs.length; ++i) {
                    visibleObjs[i].visible = true;
                    visibleObjs[i] = null;
                }
                return true;
            }
            //
            if(this.numSkipReadDepthBuffer%this.frequencyOfReadDepthBuffer === 0) {
                this.numSkipReadDepthBuffer = 0;
                depthBufferUpdated = true;
            }
            else {
                depthBufferUpdated = false;
            }
            //
            terrainDepthCameraNearFar.x = -visibleTerrainRange.max.z - 10;
            terrainDepthCameraNearFar.y = -visibleTerrainRange.min.z + 10;
            terrainDepthCamera.visible = true;
            terrainDepthCamera.left = visibleTerrainRange.min.x;
            terrainDepthCamera.right = visibleTerrainRange.max.x;
            terrainDepthCamera.top = visibleTerrainRange.max.y;
            terrainDepthCamera.bottom = visibleTerrainRange.min.y;
            terrainDepthCamera.near = terrainDepthCameraNearFar.x;
            terrainDepthCamera.far = terrainDepthCameraNearFar.y;
            terrainDepthCamera.updateProjectionMatrix();
            //
            if(depthBufferUpdated) {
                memDepthSapmler.noValue = visibleTerrainRange.max.z;
                memDepthSapmler.range[0] = terrainDepthCamera.left;
                memDepthSapmler.range[1] = terrainDepthCamera.right;
                memDepthSapmler.range[2] = terrainDepthCamera.bottom;
                memDepthSapmler.range[3] = terrainDepthCamera.top;
                memDepthSapmler.cameraNearFar[0] = terrainDepthCamera.near;
                memDepthSapmler.cameraNearFar[1] = terrainDepthCamera.far;
            }
            //
            this.scene.overrideMaterial = this.overrideMaterial;
            //
            renderer.render(this.scene, terrainDepthCamera, terrainDepthRT);
            this.scene.overrideMaterial = undefined;
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            //
            for(let i=0; i<visibleObjs.length; ++i) {
                visibleObjs[i].visible = true;
                visibleObjs[i] = null;
            }
            visibleObjs = null;
            //
            textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
                0.0, 0.5, 0.0, 0.5,
                0.0, 0.0, 0.5, 0.5,
                0.0, 0.0, 0.0, 1.0 );
            textureMatrix.multiply( terrainDepthCamera.projectionMatrix );
            textureMatrix.multiply( terrainDepthCamera.matrixWorldInverse );
            //
            if(depthBufferUpdated) {
                renderer.readRenderTargetPixels(terrainDepthRT, 0, 0, terrainDepthRT.width, terrainDepthRT.height, memDepthSapmler.data);
            }
            //
            this.numSkipReadDepthBuffer++;
            //
            return true;
        }
        this.addRenderPass(terrainDepthRenderPass);
        //
        let noSelectUnVisibleObjs = [];
        //
        let  outlineObjDepthRT = new THREE.WebGLRenderTarget(renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars);
        outlineObjDepthRT.texture.generateMipmaps = false;
        outlineObjDepthRT.depthTexture = new THREE.DepthTexture(renderer.domElement.clientWidth, renderer.domElement.clientHeight,
            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
        let outlineObjDepthRenderPass = new NormalRenderPass(this.renderScene, this.camera);
        outlineObjDepthRenderPass.outLineObjs = outLineObjs;
        outlineObjDepthRenderPass.render = function (renderer) {
            if(this.outLineObjs.length === 0)
                return true;
            //
            noSelectUnVisibleObjs = [];
            //
            let unvisibleNoSelectObjs = (object)=>{
                if(this.outLineObjs.indexOf(object) >= 0) {
                    object.visible = true;
                    return;
                }
                //
                if(!object.visible)
                    return;
                //
                if(object instanceof TerrainLayer || object instanceof ARLayer) {
                    object.visible = false;
                    noSelectUnVisibleObjs.push(object);
                }
                else if(object instanceof THREE.Mesh || object instanceof THREE.Line ||
                    object instanceof THREE.Points || object instanceof THREE.Sprite) {
                    object.visible = false;
                    noSelectUnVisibleObjs.push(object);
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        unvisibleNoSelectObjs(object.children[i]);
                    }
                }
            }
            unvisibleNoSelectObjs(this.scene);
            //
            let setMaskMaterial = (object)=> {
                if(object.maskMaterial) {
                    object.material = object.maskMaterial;
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        setMaskMaterial(object.children[i]);
                    }
                }
            }
            for(let i=0; i<this.outLineObjs.length; ++i) {
                materialReplace(this.outLineObjs[i]);
                setMaskMaterial(this.outLineObjs[i]);
            }
            //
            renderer.render(this.scene, this.camera, outlineObjDepthRT);
            //
            let unsetMaskMaterial = (object)=> {
                if(object.maskMaterial) {
                    object.material = object.originalMaterial;
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        unsetMaskMaterial(object.children[i]);
                    }
                }
            }
            for(let i=0; i<this.outLineObjs.length; ++i) {
                unsetMaskMaterial(this.outLineObjs[i]);
            }
            //
            return true;
        }
        this.addRenderPass(outlineObjDepthRenderPass);
        //
        let getMaskMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "depthTexture0": { value: null },
                    "depthTexture1": { value: null },
                    "colorMask": {value: null},
                    "cameraNear": { value: 1.0 },
                    "cameraFar": { value: 100000.0 },
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
                    uniform float cameraNear;\
                    uniform float cameraFar;\
                    uniform sampler2D depthTexture0;\
                    uniform sampler2D depthTexture1;\
                    uniform sampler2D colorMask;\
                    \
                    void main() {\
                        vec4 color = texture2D( colorMask, vUv);\
                        float d0 = texture2D( depthTexture0, vUv.st).x;\
                        float viewZ = perspectiveDepthToViewZ( d0, cameraNear, cameraFar );\
                        d0 = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\
                        float d1 = texture2D( depthTexture1, vUv.st).x;\
                        viewZ = perspectiveDepthToViewZ( d1, cameraNear, cameraFar );\
                        d1 = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\
                        float delta = abs(d1 - d0);\
                        if(d1 > 0.99)\
                           gl_FragColor = vec4(0,0,0,0);\
                        else if(delta < 0.000001)\
                            gl_FragColor = vec4(color.r,color.g,color.b,0.02);\
                        else\
                            gl_FragColor = vec4(color.r,color.g,color.b,1.0);\
                    }"
            } );
        };
        //
        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        let tmpScene = new THREE.Scene();
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        let quad = new THREE.Mesh( geom, getMaskMaterial() );
        quad.material.depthTest = false;
        quad.material.depthWrite = false;
        quad.drawMode = THREE.TriangleFanDrawMode;
        quad.frustumCulled = false;
        tmpScene.add( quad );
        //
        let outlineObjMaskRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars );
        outlineObjMaskRT.texture.generateMipmaps = false;

        let outlineObjMaskRenderPass = new NormalRenderPass(tmpScene, orthoCamera);
        outlineObjMaskRenderPass.outLineObjs = outLineObjs;
        outlineObjMaskRenderPass.renderCamera = this.camera;
        outlineObjMaskRenderPass.render = function (renderer) {
            if(outlineObjMaskRenderPass.outLineObjs.length === 0)
                return true;
            //
            let frustum = this.renderCamera.isPerspectiveCamera ? this.renderCamera.projectionMatrix.getFrustum() : this.renderCamera.projectionMatrix.getOrtho();
            quad.material.uniforms[ "depthTexture0" ].value = offScreenRT.depthTexture;
            quad.material.uniforms[ "depthTexture1" ].value = outlineObjDepthRT.depthTexture;
            quad.material.uniforms[ "colorMask"].value = outlineObjDepthRT.texture;
            quad.material.uniforms[ "cameraNear" ].value = frustum.zNear;
            quad.material.uniforms[ "cameraFar" ].value = frustum.zFar;
            //
            renderer.render(this.scene, this.camera, outlineObjMaskRT);
            //
            return true;
        }
        this.addRenderPass(outlineObjMaskRenderPass);
        //
        let getOutLineMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "maskTexture": { value: null },
                    "edgeColor": { value: new THREE.Vector3( 1.0, 1.0, 0.0 ) },
                    "resolution": { value: new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight)},
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "varying vec2 vUv;\
                    uniform sampler2D maskTexture;\
                    uniform vec2 resolution;\
                    uniform vec3 edgeColor;\
                    \
                    void main() {\n\
                        vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );\
                        vec4 outlineColor = vec4(1,1,1,1);\
                        \
                        vec4 c00 = texture2D( maskTexture, vUv + texel * vec2( -2, -2 ) );\
                        outlineColor = c00.a > 0.01 ? c00 : outlineColor;\
                        vec4 c01 = texture2D( maskTexture, vUv + texel * vec2( -1, -2 ) );\
                        outlineColor = c01.a > 0.01 ? c01 : outlineColor;\
                        vec4 c02 = texture2D( maskTexture, vUv + texel * vec2( 0, -2 ) );\
                        outlineColor = c02.a > 0.01 ? c02 : outlineColor;\
                        vec4 c03 = texture2D( maskTexture, vUv + texel * vec2( 1, -2 ) );\
                        outlineColor = c03.a > 0.01 ? c03 : outlineColor;\
                        vec4 c04 = texture2D( maskTexture, vUv + texel * vec2( 2, -2 ) );\
                        outlineColor = c04.a > 0.01 ? c04 : outlineColor;\
                        \
                        vec4 c10 = texture2D( maskTexture, vUv + texel * vec2( -2, -1 ) );\
                        outlineColor = c10.a > 0.01 ? c10 : outlineColor;\
                        vec4 c11 = texture2D( maskTexture, vUv + texel * vec2( -1, -1 ) );\
                        outlineColor = c11.a > 0.01 ? c11 : outlineColor;\
                        vec4 c12 = texture2D( maskTexture, vUv + texel * vec2( 0, -1 ) );\
                        outlineColor = c12.a > 0.01 ? c12 : outlineColor;\
                        vec4 c13 = texture2D( maskTexture, vUv + texel * vec2( 1, -1 ) );\
                        outlineColor = c13.a > 0.01 ? c13 : outlineColor;\
                        vec4 c14 = texture2D( maskTexture, vUv + texel * vec2( 2, -1 ) );\
                        outlineColor = c14.a > 0.01 ? c14 : outlineColor;\
                        vec4 c20 = texture2D( maskTexture, vUv + texel * vec2( -2, 0 ) );\
                        outlineColor = c20.a > 0.01 ? c20 : outlineColor;\
                        vec4 c21 = texture2D( maskTexture, vUv + texel * vec2( -1, 0 ) );\
                        outlineColor = c21.a > 0.01 ? c21 : outlineColor;\
                        vec4 c22 = texture2D( maskTexture, vUv + texel * vec2( 0, 0 ) );\
                        outlineColor = c22.a > 0.01 ? c22 : outlineColor;\
                        vec4 c23 = texture2D( maskTexture, vUv + texel * vec2( 1, 0 ) );\
                        outlineColor = c23.a > 0.01 ? c23 : outlineColor;\
                        vec4 c24 = texture2D( maskTexture, vUv + texel * vec2( 2, 0 ) );\
                        outlineColor = c24.a > 0.01 ? c24 : outlineColor;\
                        \
                        vec4 c30 = texture2D( maskTexture, vUv + texel * vec2( -2, 1 ) );\
                        outlineColor = c30.a > 0.01 ? c30 : outlineColor;\
                        vec4 c31 = texture2D( maskTexture, vUv + texel * vec2( -1, 1 ) );\
                        outlineColor = c31.a > 0.01 ? c31 : outlineColor;\
                        vec4 c32 = texture2D( maskTexture, vUv + texel * vec2( 0, 1 ) );\
                        outlineColor = c32.a > 0.01 ? c32 : outlineColor;\
                        vec4 c33 = texture2D( maskTexture, vUv + texel * vec2( 1, 1 ) );\
                        outlineColor = c33.a > 0.01 ? c33 : outlineColor;\
                        vec4 c34 = texture2D( maskTexture, vUv + texel * vec2( 2, 1 ) );\
                        outlineColor = c34.a > 0.01 ? c34 : outlineColor;\
                        \
                        vec4 c40 = texture2D( maskTexture, vUv + texel * vec2( -2, 2 ) );\
                        outlineColor = c40.a > 0.01 ? c40 : outlineColor;\
                        vec4 c41 = texture2D( maskTexture, vUv + texel * vec2( -1, 2 ) );\
                        outlineColor = c41.a > 0.01 ? c41 : outlineColor;\
                        vec4 c42 = texture2D( maskTexture, vUv + texel * vec2( 0, 2 ) );\
                        outlineColor = c42.a > 0.01 ? c42 : outlineColor;\
                        vec4 c43 = texture2D( maskTexture, vUv + texel * vec2( 1, 2 ) );\
                        outlineColor = c43.a > 0.01 ? c43 : outlineColor;\
                        vec4 c44 = texture2D( maskTexture, vUv + texel * vec2( 2, 2 ) );\
                        outlineColor = c44.a > 0.01 ? c44 : outlineColor;\
                        \
                        vec4 sum = c00+c01+c02+c03+c04+c10+c11+c12+c13+c14+c20+c21+c22+c23+c24+c30+c31+c32+c33+c34+c40+c41+c42+c43+c44;\
                        if(c22.a < 0.01)\
                            gl_FragColor = (sum.a > 0.01 && sum.a < 0.9) ? vec4(outlineColor.rgb, 1) : vec4(0,0,0,0);\
                        else\
                            gl_FragColor = vec4(0,0,0,0);\
                    }"
            } );
        };

        let quad1 = new THREE.Mesh( geom, getOutLineMaterial() );
        quad1.drawMode = THREE.TriangleFanDrawMode;
        quad1.frustumCulled = false;
        let tmpScene1 = new THREE.Scene();
        tmpScene1.add(quad1);

        let outLineRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars );
        outLineRT.texture.name = "outline";
        outLineRT.texture.generateMipmaps = false;

        let outlineGeneratePass = new NormalRenderPass(tmpScene1, orthoCamera);
        outlineGeneratePass.outLineObjs = outLineObjs;
        outlineGeneratePass.render = function (renderer) {
            if(this.outLineObjs.length === 0)
                return true;
            //
            quad1.material.uniforms[ "maskTexture" ].value = outlineObjMaskRT.texture;
            quad1.material.uniforms[ "edgeColor" ].value = new THREE.Vector3( 1.0, 1.0, 0.0 );
            quad1.material.uniforms[ "resolution" ].value = new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
            //
            renderer.render(this.scene, this.camera, outLineRT);
            //
            return true;
        }
        this.addRenderPass(outlineGeneratePass);
        //
        let screenImgRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars);
        screenImgRT.texture.name = "screenImg";
        screenImgRT.texture.generateMipmaps = false;
        let getOutPutMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "color0": { value: null },
                    "color1": { value: null },
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "varying vec2 vUv;\
                    uniform sampler2D color0;\
                    uniform sampler2D color1;\
                    \
                    void main() {\n\
                        vec4 c0 = texture2D( color0, vUv);\
                        vec4 c1 = texture2D( color1, vUv);\
                        gl_FragColor = c1.a > 0.5 ? c1 : c0;\
                    }"
            } );
        };

        let quad2 = new THREE.Mesh( geom, getOutPutMaterial() );
        quad2.material.depthTest = false;
        quad2.material.depthWrite = false;
        quad2.drawMode = THREE.TriangleFanDrawMode;
        quad2.frustumCulled = false;
        let tmpScene2 = new THREE.Scene();
        tmpScene2.add(quad2);
        let outLineMergeRenderPass = new NormalRenderPass(tmpScene2, orthoCamera);
        outLineMergeRenderPass.render = function (renderer) {
            if(!offScreenRendering)
                return true;
            //
            quad2.material.uniforms[ "color0" ].value = offScreenRT.texture;
            quad2.material.uniforms[ "color1" ].value = outLineRT.texture;
            //
            renderer.render(this.scene, this.camera, screenImgRT);
            //
            renderer.setTexture2D( offScreenRT.texture, 0 );
            renderer.context.copyTexImage2D( renderer.context.TEXTURE_2D, 0, renderer.context.RGBA, 0, 0, offScreenRT.width, offScreenRT.height, 0 );
            //
            for(let i=0; i<noSelectUnVisibleObjs.length; ++i) {
                noSelectUnVisibleObjs[i].visible = true;
            }
            return true;
        };
        this.addRenderPass(outLineMergeRenderPass);
        ///
        let stencilVolumRenderPass = new NormalRenderPass(this.renderScene, this.camera);
        stencilVolumRenderPass.render = function (renderer) {
            let tempScene = new THREE.Scene();
            tempScene.add(new THREE.Group());
            for(let n=0, length = this.scene.stencilVolums.length; n<length; ++n) {
                tempScene.children[0].add(this.scene.stencilVolums[n]);
            }
            //
            tempScene.updateMatrixWorld();
            //
            tempScene.overrideMaterial = new THREE.MeshBasicMaterial();
            tempScene.overrideMaterial.stencilTest = true;
            tempScene.overrideMaterial.side = THREE.BackSide;
            tempScene.overrideMaterial.depthTest = true;
            tempScene.overrideMaterial.depthWrite = false;
            tempScene.overrideMaterial.colorWrite = false;

            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setMask(0xff);
            renderer.state.buffers.stencil.setLocked(true);

            renderer.autoClear = false;
            renderer.clearTarget(offScreenRT, false, false, true);
            //
            renderer.state.buffers.stencil.setFunc(renderer.context.ALWAYS, 0, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.INCR, renderer.context.KEEP);
            renderer.render(tempScene, this.camera, offScreenRT);
            //

            tempScene.overrideMaterial.side = THREE.FrontSide;
            renderer.state.buffers.stencil.setFunc(renderer.context.ALWAYS, 0, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.DECR, renderer.context.KEEP);
            renderer.render(tempScene, this.camera, offScreenRT);
            //
            renderer.state.buffers.stencil.setLocked(false);
            //
            tempScene.children[0].dispose(true, false);
            tempScene.remove(tempScene.children[0]);
            tempScene = null;
            //
            return true;
        };
        if(hasTerrainDecorator)
            this.addRenderPass(stencilVolumRenderPass);
        //
        let excavationRenderPass = new NormalRenderPass(this.renderScene, this.camera);
        excavationRenderPass.render = function (renderer) {
            let tempScene0 = new THREE.Scene();
            tempScene0.add(new THREE.Group());
            for(let n=0, length = this.scene.stencilVolums.length; n<length; ++n) {
                tempScene0.children[0].add(this.scene.stencilVolums[n]);
            }
            //
            tempScene0.updateMatrixWorld();
            //
            tempScene0.overrideMaterial = new THREE.MeshBasicMaterial();
            tempScene0.overrideMaterial.color.setRGB(0.3,0.3,0.3);
            tempScene0.overrideMaterial.stencilTest = true;
            tempScene0.overrideMaterial.depthTest = false;
            tempScene0.overrideMaterial.depthWrite = false;

            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setMask(0xff);
            renderer.state.buffers.stencil.setLocked(true);

            renderer.autoClear = false;
            //
            renderer.state.buffers.stencil.setFunc(renderer.context.EQUAL, 1, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.KEEP, renderer.context.KEEP);
            renderer.render(tempScene0, this.camera, offScreenRT);


            renderer.state.buffers.stencil.setLocked(false);
            //
            let excavation = [];
            for(let n=0, length = this.scene.terrainLayers.length; n<length; ++n) {
                if(this.scene.terrainLayers[n].visible) {
                    excavation = excavation.concat(this.scene.terrainLayers[n].excavation);
                }
            }
            //
            if(excavation.length === 0) {
                return true;
            }
            //
            let tmpScene = new THREE.Scene();
            tmpScene.add(new THREE.Group());
            for(let n=0, length = excavation.length; n<length; ++n) {
                tmpScene.children[0].add(excavation[n]);
            }
            tmpScene.updateMatrixWorld();
            //
            renderer.autoClear = false;
            //
            renderer.state.buffers.depth.setTest(false);
            renderer.state.buffers.depth.setMask(false);
            renderer.state.buffers.depth.setLocked(true);
            //
            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setLocked(true);
            renderer.state.buffers.stencil.setFunc(renderer.context.EQUAL, 1, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.KEEP, renderer.context.KEEP);

            renderer.render(tmpScene, this.camera, offScreenRT);

            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
            //
            renderer.state.buffers.depth.setLocked(false);
            renderer.state.buffers.depth.setTest(true);
            renderer.state.buffers.depth.setMask(true);
            //
            renderer.autoClear = true;
            //
            tempScene0.children[0].dispose(true, false);
            tempScene0.remove(tempScene0.children[0]);
            tempScene0 = null;
            //
            tmpScene.children[0].dispose(true, false);
            tmpScene.remove(tmpScene.children[0]);
            tmpScene = null;
            //
            return true;
        };
        if(hasTerrainDecorator) {
            this.addRenderPass(excavationRenderPass);
        }
        //
        let quad3 = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({map:offScreenRT.texture}) );
        quad3.drawMode = THREE.TriangleFanDrawMode;
        quad3.frustumCulled = false;
        let tmpScene3 = new THREE.Scene();
        tmpScene3.add(quad3);

        let outPutRenderPass = new NormalRenderPass(tmpScene3, orthoCamera);
        outPutRenderPass.render = function (renderer) {
            if(!offScreenRendering)
                return true;
            //
            renderer.render(this.scene, this.camera);
        }
        this.addRenderPass(outPutRenderPass);
        //
        this.render = ()=> {
            for (let i = 0; i < this.renderPasses.length; ++i) {
                if(!this.renderPasses[i].render(this.renderer))
                    break;
            }
        }
        //
        this.setSize = (width, height)=> {
            offScreenRT.setSize(width, height);
            terrainDepthRT.setSize(width, height);
            outlineObjDepthRT.setSize(width, height);
            outlineObjMaskRT.setSize(width, height);
            outLineRT.setSize(width, height);
            screenImgRT.setSize(width, height);
           // if(memDepthSapmler.data)
              // memDepthSapmler.data.clear();
            memDepthSapmler.data = new Uint8Array(width * height * 4);
            memDepthSapmler.size[0] = width;
            memDepthSapmler.size[1] = height;
            //
            renderer.setSize(width, height);
        }

        this.release = ()=> {
            this.clear();
            //
            offScreenRT.texture.dispose();
            offScreenRT.depthTexture.dispose();
            offScreenRT.dispose();

            screenImgRT.texture.dispose();
            screenImgRT.dispose();

            terrainDepthRT.texture.dispose();
            terrainDepthRT.dispose();

            outlineObjDepthRT.texture.dispose();
            outlineObjDepthRT.depthTexture.dispose();
            outlineObjDepthRT.dispose();

            outlineObjMaskRT.texture.dispose();
            outlineObjMaskRT.dispose();

            outLineRT.texture.dispose();
            outLineRT.dispose();
        }
    }
}


export {OutLineTechnique};
