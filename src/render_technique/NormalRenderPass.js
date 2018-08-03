import {RenderPass} from "./RenderPass";
import {MemDepthSampler} from "../memDepthSampler";
import {FeatureLayer} from "../featureLayer";

class NormalRenderPass extends RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        //
        let fitTerrainLayers = [];
        let visibleTerrainRange = new THREE.Box3();
        let textureMatrix = new THREE.Matrix4();
        //
        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        //
        let terrainDepthRT = new THREE.WebGLRenderTarget( this.renderTarget.width, this.renderTarget.height, pars );
        terrainDepthRT.texture.generateMipmaps = false;
        let terrainDepthCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        terrainDepthCamera.position.set(0,0,0);
        terrainDepthCamera.up.set(0,1,0);
        terrainDepthCamera.lookAt(0,0,-1);
        terrainDepthCamera.updateMatrixWorld();
        let terrainDepthCameraNearFar = new THREE.Vector2();
        let memDepthSapmler = new MemDepthSampler();
        memDepthSapmler.data = new Uint8Array(this.renderTarget.width * this.renderTarget.height * 4);
        memDepthSapmler.size[0] = this.renderTarget.width;
        memDepthSapmler.size[1] = this.renderTarget.height;
        let depthBufferUpdated = false;
        //
        let terrainDepthRenderPass = new RenderPass(scene);
        terrainDepthRenderPass.overrideMaterial = new THREE.MeshDepthMaterial();
        terrainDepthRenderPass.overrideMaterial.side = THREE.FrontSide;
        terrainDepthRenderPass.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
        terrainDepthRenderPass.overrideMaterial.blending = THREE.NoBlending;
        terrainDepthRenderPass.frequencyOfReadDepthBuffer = 5;
        terrainDepthRenderPass.numSkipReadDepthBuffer = 0;
        terrainDepthRenderPass.render = function (renderer) {
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
            //
            for(let i=0; i<this.scene.terrainLayers.length; ++i) {
                if(this.scene.terrainLayers[i].visible) {
                    visibleTerrainRange.expandByBox3(this.scene.terrainLayers[i].getCurrentBoundingBoxWorld());
                }
            }
            //
            let oldClearColor = renderer.getClearColor().clone();
            let oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
            //
            if(!visibleTerrainRange.valid()) {
                terrainDepthCamera.visible = false;
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
        };

        this.setRenderResource = (scene, camera, renderTarget)=> {
            this.scene = scene;
            this.camera = camera;
            this.renderTarget = renderTarget;
            //
            terrainDepthRenderPass.scene = scene;
        };

        this.render = (renderer)=> {
            let needTerrainDepthRenderPass = false;
            for(let i=0, numFtLayer = this.scene.featureLayers.length; i<numFtLayer; ++i) {
                if(this.scene.featureLayers[i].visible && this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH) {
                    needTerrainDepthRenderPass = true;
                    break;
                }
            }
            if(needTerrainDepthRenderPass) {
                terrainDepthRenderPass.render(renderer);
            }
            //
            for(let i=0, numFtLayer = this.scene.featureLayers.length; i<numFtLayer; ++i) {
                if(!this.scene.featureLayers[i].visible) {
                    continue;
                }
                if(this.scene.featureLayers[i].lineMaterial) {
                    this.scene.featureLayers[i].lineMaterial.uniforms["resolution"].value.set(this.renderTarget.width, this.renderTarget.height);
                    this.scene.featureLayers[i].lineMaterial.needUpdate = true;
                }
                //
                if(this.scene.featureLayers[i].visible && this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH) {
                    this.scene.featureLayers[i].memDepthSampler = depthBufferUpdated ? memDepthSapmler : null;
                    //
                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].pointMaterial) {
                        this.scene.featureLayers[i].pointMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                        this.scene.featureLayers[i].pointMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
                        this.scene.featureLayers[i].pointMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                        this.scene.featureLayers[i].pointMaterial.uniforms["textureMatrix"].value = textureMatrix;
                        this.scene.featureLayers[i].pointMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                        this.scene.featureLayers[i].pointMaterial.needUpdate = true;
                    }
                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].lineMaterial) {
                        this.scene.featureLayers[i].lineMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                        this.scene.featureLayers[i].lineMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
                        this.scene.featureLayers[i].lineMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                        this.scene.featureLayers[i].lineMaterial.uniforms["textureMatrix"].value = textureMatrix;
                        this.scene.featureLayers[i].lineMaterial.uniforms["textureRange"].value.set(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                    }
                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].polygonMaterial) {
                        this.scene.featureLayers[i].polygonMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
                        this.scene.featureLayers[i].polygonMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureMatrix"].value = textureMatrix;
                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                        this.scene.featureLayers[i].polygonMaterial.needUpdate = true;
                    }
                    if(this.scene.featureLayers[i].labelMaterial) {
                        this.scene.featureLayers[i].labelMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
                        this.scene.featureLayers[i].labelMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
                        this.scene.featureLayers[i].labelMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
                        this.scene.featureLayers[i].labelMaterial.uniforms["textureMatrix"].value = textureMatrix;
                        this.scene.featureLayers[i].labelMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
                        this.scene.featureLayers[i].labelMaterial.needUpdate = true;
                    }
                }
            }
            //
            renderer.render(this.scene, this.camera, this.renderTarget.renderToScreen ? null : this.renderTarget);
            //
            return true;
        }
        //
        this.setSize = function(width, height) {
            terrainDepthRT.setSize(width, height);
            memDepthSapmler.data = new Uint8Array(width * height * 4);
            memDepthSapmler.size[0] = width;
            memDepthSapmler.size[1] = height;
        }
        //
        this.release = function () {
            terrainDepthRT.texture.dispose();
            terrainDepthRT.dispose();
        }
    }
};

export {NormalRenderPass};
