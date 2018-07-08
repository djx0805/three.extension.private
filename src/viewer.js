//import {NormalRenderPass} from "./render_technique/NormalRenderPass";
import {RenderTechnique} from "./render_technique/RenderTechnique";
import {FeatureLayer} from "./featureLayer";
import {ModelLayer} from "./modelLayer";
import {TJHModelLayer} from "./TJHModelLayer";
import {TerrainLayer} from "./terrainLayer";
import {ARLayer} from "./arLayer";
import {PostLayer} from "./postLayer";
import {OutLineRenderPass} from "./render_technique/OutLineRenderPass";
import {OutLineObjLayer} from "./outLineObjLayer"

/**
 * ARScene 类
 * @class
 * @extends THREE.Scene
 * @memberOf tjh.ar
 */
class ARScene extends  THREE.Scene {
    constructor() {
        super();
        //
        /**
         * 地形图层
         * @public
         * @type {Array}
         */
        this.terrainLayers = [];
        /**
         * 矢量图层
         * @public
         * @type {Array}
         */
        this.featureLayers = [];
        /**
         * 模型图层
         * @public
         * @type {Array}
         */
        this.modelLayers = [];
        /**
         * 航空影像图层
         * @public
         * @type {Array}
         */
        this.arLayers = [];
        /**
         * 临时对象
         * @public
         * @type {Array}
         */
        this.temporaryObjs = [];
        /**
         * 屏幕特效图层
         * @type {Array}
         */
        this.postLayers = [];
        /**
         * 光源
         * @public
         * @type {Array}
         */
        this.lightSources = [];
        /**
         * 全局偏移
         * @type {number[]}
         */
        this.globalOffset = [0.0,0.0,0.0];
        //
        this.currentBoundingBox = new THREE.Box3();
        //
        this.addPostLayer('OutLineObjLayer', 100, new OutLineObjLayer());
        //
        this._visibleTerrianLayers = [];
        this._visibleModelLayers = [];
        this._visibleMeshes = [];
        this.onBeforeRender = function( renderer, scene, camera, renderTarget ) {
            this._visibleMeshes = [];
            //
            this._visibleTerrianLayers = [];
            for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
                if(this.terrainLayers[n].visible) {
                    this._visibleTerrianLayers[this._visibleTerrianLayers.length] = this.terrainLayers[n];
                    this._visibleMeshes = this._visibleMeshes.concat(this.terrainLayers[n]._visibleMesh_);
                }
            }
            //
            this._visibleModelLayers = [];
            for(let n=0, length = this.modelLayers.length; n<length; ++n) {
                if(this.modelLayers[n].visible) {
                    this._visibleModelLayers[this._visibleModelLayers.length] = this.modelLayers[n];
                    this._visibleMeshes = this._visibleMeshes.concat(this.modelLayers[n]._visibleMesh_);
                }
            }
        };

        this.onAfterRender = function( renderer, scene, camera ) {
            for(let n=0, length = this._visibleTerrianLayers.length; n<length; ++n) {
                this._visibleTerrianLayers[n].visible = true;
            }
            for(let n=0, length = this._visibleModelLayers.length; n<length; ++n) {
                this._visibleModelLayers[n].visible = true;
            }
        };
    }

    /**
     * 添加光源
     * @param {THREE.Light} lightSource -光源
     */
    addLightSource(lightSource) {
        this.lightSources.push(lightSource);
        this.add(lightSource);
    }

    /**
     * @param lightSource
     */
    removeLightSource(lightSource) {
        let index = this.lightSources.indexOf(lightSource);
        if(index >= 0) {
            this.lightSources.splice(index, 1);
            this.remove(lightSource);
        }
    }

    /**
     * 添加地形图层
     * @param {tjh.ar.TerrainLayer} terrainLayer -地形图层
     */
    addTerrainLayer(terrainLayer) {
        this.terrainLayers.push(terrainLayer);
        this.add(terrainLayer);
    }

    /**
     * @param terrainLayer
     */
    removeTerrainLayer(terrainLayer) {
        let index = this.terrainLayers.indexOf(terrainLayer);
        if(index >= 0) {
            terrainLayer.dispose();
            this.terrainLayers.splice(index, 1);
            this.remove(terrainLayer);
        }
    }
    /**
     * 添加航空影像图层
     * @param {tjh.ar.ARLayer} arLayer -AR图层
     */
    addARLayer(arLayer) {
        this.arLayers.push(arLayer);
        this.add(arLayer);
    }

    /**
     * @param arLayer
     */
    removeARLayer(arLayer) {
        let index = this.arLayers.indexOf(arLayer);
        if(index >= 0) {
            arLayer.dispose();
            this.arLayers.splice(index, 1);
            this.remove(arLayer);
        }
    }
    /**
     * 添加模型图层
     * @param {tjh.ar.ModelLayer} modelLayer -模型图层
     */
    addModelLayer(modelLayer) {
        this.modelLayers.push(modelLayer);
        this.add(modelLayer);
    }

    /**
     * @param modelLayer
     */
    removeModelLayer(modelLayer) {
        let index = this.modelLayers.indexOf(modelLayer);
        if(index >= 0) {
            modelLayer.dispose();
            this.modelLayers.splice(index, 1);
            this.remove(modelLayer);
        }
    }
    /**
     * 添加矢量图层
     * @param {tjh.ar.FeatureLayer} ftLayer -矢量图曾
     */
    addFeatureLayer(ftLayer) {
        this.featureLayers.push(ftLayer);
        this.add(ftLayer);
    }

    /**
     * @param ftLayer
     */
    removeFeatureLayer(ftLayer) {
        let index = this.featureLayers.indexOf(ftLayer);
        if(index >= 0) {
            ftLayer.dispose();
            this.featureLayers.splice(index, 1);
            this.remove(ftLayer);
        }
    }

    addPostLayer(name, order, postLayer) {
        for(let n=0, length = this.postLayers.length; n<length; ++n) {
            if(this.postLayers[n].order < order) {
                this.postLayers.splice(n,0, {name:name, order:order, enable:true, layer:postLayer});
                return;
            }
        }
        //
        this.postLayers[this.postLayers.length] = {name:name, order:order, enable:true, layer:postLayer};
    }

    removePostLayer(name) {
        for(let n=0, length = this.postLayers.length; n<length; ++n) {
            if(this.postLayers[n].name === name) {
                this.postLayers.splice(n,1);
                return;
            }
        }
    }

    getPostLayer(name) {
        let layers = [];
        for(let n=0, length = this.postLayers.length; n<length; ++n) {
            if(this.postLayers[n].name === name && this.postLayers[n].enable) {
                layers[layers.length] = this.postLayers[n];
            }
        }
        return layers;
    }
    /**
     * 添加临时渲染对象
     * @param {THREE.Object3D} obj -临时渲染对象
     */
    addTemporaryObj(obj) {
        this.temporaryObjs.push(obj);
        this.add(obj);
    }

    /**
     * 删除临时渲染对象
     * @param {THREE.Object3D} obj -临时渲染对象
     */
    removeTemporaryObj(obj) {
        let index = this.temporaryObjs.indexOf(obj);
        if(index >= 0) {
            obj.dispose();
            this.temporaryObjs.splice(index, 1);
            this.remove(obj);
        }
    }

    /**
     * 更新模型矩阵
     */
    updateMatrixWorld() {
        for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
            if(this.terrainLayers[n].matrixAutoUpdate)
                this.terrainLayers[n].updateMatrixWorld();
        }
        for(let n=0, length = this.featureLayers.length; n<length; ++n) {
            if(this.featureLayers[n].matrixAutoUpdate)
                this.featureLayers[n].updateMatrixWorld();
        }
        for(let n=0, length = this.arLayers.length; n<length; ++n) {
            if(this.arLayers[n].matrixAutoUpdate)
                this.arLayers[n].updateMatrixWorld();
        }
        for(let n=0, length = this.modelLayers.length; n<length; ++n) {
            if(this.modelLayers[n].matrixAutoUpdate)
                this.modelLayers[n].updateMatrixWorld();
        }
        for(let n=0, length = this.temporaryObjs.length; n<length; ++n) {
            this.temporaryObjs[n].updateMatrixWorld();
        }
        for(let n=0, length = this.lightSources.length; n<length; ++n) {
            this.lightSources[n].updateMatrixWorld();
        }
    }

    /**
     * 删除过期数据
     */
    removeUnExpected() {
        for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
            if(this.terrainLayers[n].removeUnExpected) {
                this.terrainLayers[n].removeUnExpected();
            }
        }
        for(let n=0, length = this.featureLayers.length; n<length; ++n) {
            if(this.featureLayers[n].removeUnExpected) {
                this.featureLayers[n].removeUnExpected();
            }
        }
        for(let n=0, length = this.arLayers.length; n<length; ++n) {
            if(this.arLayers[n].removeUnExpected) {
                this.arLayers[n].removeUnExpected();
            }
        }
        for(let n=0, length = this.modelLayers.length; n<length; ++n) {
            if(this.modelLayers[n].removeUnExpected) {
                this.modelLayers[n].removeUnExpected();
            }
        }
    }
}


/**
 * 渲染窗口事件处理基类，所有需要处理渲染窗口事件的对象都应从此类继承
 * 如果对象处理了某个窗口事件则反会 true
 * @class
 * @memberOf tjh.ar
 */
class WindowEventListener {
    constructor(viewer) {
        /**
         * 所属 viewer 对象
         * @type {Viewer}
         */
        this.viewer = viewer;
        /**
         * 用于存放临时渲染对象
         * @type {THREE.Group}
         */
        this.tempObj = new THREE.Group();

        /**
         * mouse down 处理函数
         * @param mouseEvent
         * @returns {boolean}
         */
        this.onMouseDown = (mouseEvent)=> {
            switch ( mouseEvent.button ) {
                case THREE.MOUSE.LEFT:
                    return this.onLeftDown(mouseEvent);
                case THREE.MOUSE.MIDDLE:
                    return this.onMiddleDown(mouseEvent);
                case THREE.MOUSE.RIGHT:
                    return this.onRightDown(mouseEvent);
            }
            return false;
        }
        /**
         * mouse up 处理函数
         * @param mouseEvent
         * @returns {boolean}
         */
        this.onMouseUp = (mouseEvent)=> {
            switch ( mouseEvent.button ) {
                case THREE.MOUSE.LEFT:
                    return this.onLeftUp(mouseEvent);
                case THREE.MOUSE.MIDDLE:
                    return this.onMiddleUp(mouseEvent);
                case THREE.MOUSE.RIGHT:
                    return this.onRightUp(mouseEvent);
            }
            //
            return false;
        }
    }

    /**
     * 释放函数
     */
    release() {
        this.viewer.scene.removeTemporaryObj(this.tempObj);
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onLeftDown(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onMiddleDown(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onRightDown(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onLeftUp(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onMiddleUp(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onRightUp(mouseEvent) {
        return false;
    }

    /**
     * @param mouseEvent
     * @returns {boolean}
     */
    onMouseMove(mouseEvent) {
        return false;
    }

    /**
     * @param wheelEvent
     * @returns {boolean}
     */
    onMouseWheel(wheelEvent) {
        return false;
    }

    /**
     * @param keyboardEvent
     * @returns {boolean}
     */
    onKeyDown(keyboardEvent) {
        return false;
    }

    /**
     * @param keyboardEvent
     * @returns {boolean}
     */
    onKeyUp(keyboardEvent) {
        return false;
    }
}

/**
 * Viewer 对象用于管理渲染循环、场景更新、窗口事件路由。
 * 窗口事件路由规则：
 * 遍历窗口事件监听者队列，如果当前对象处理了当前事件并返回 true 则此次事件处理结束，否则继续向下传递当前事件
 * @class
 * @memberOf tjh.ar
 */
class Viewer {
    constructor(domElement) {
        THREE.Cache.enabled = false;
        THREE.FontManager.getFont("msyh");
        //
        let viewer = this;
        //
        this.active = true;
        /**
         * 场景对象
         * @type {ARScene}
         */
        this.scene = new ARScene();
        this.scene.autoUpdate = false;
        /**
         * 渲染器对象
         * @type {THREE.Renderer}
         */
        this.renderer = new THREE.WebGLRenderer({canvas:domElement ? domElement : undefined});
        this.renderer.supportMaterialStencil();
        if(domElement) {
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(domElement.clientWidth, domElement.clientHeight);
        }
        else {

        }
        /**
         * 所属 dom 对象
         */
        this.domElement = ( domElement !== undefined ) ? domElement : this.renderer.domElement;
        /**
         * 相机对象
         * @type {THREE.Camera}
         */
        this.camera = new THREE.PerspectiveCamera( 45, this.domElement.clientWidth / this.domElement.clientHeight, 1, 100000 );
        /**
         * 窗口事件监听者队列
         * @type {Array}
         */
        this.eventListenerStack = [];

        this.EventState = { NONE: 0, LEFT_BTN_DOWN: 1, MIDDLE_BTN_DOWN: 2, RIGHT_BTN_DOWN: 4,
            SHIFT_L_DOWN: 8, SHIFT_R_DOWN: 16, CTRL_L_DOWN: 32, CTRL_R_DOWN: 64, KEY_DOWN: 128};
        this.eventState = this.EventState.NONE;
        /**
         * @callback
         * @type {function}
         */
        this.onBeginFrame = undefined;
        /**
         * @callback
         * @type {function}
         */
        this.onEndFrame = undefined;
        /**
         * 帧率
         * @type {number}
         */
        this.fps = 0;

        this.numFrame = 0;
        /**
         * RenderTechnique 栈
         * 场景将由栈顶 RenderTechnique 对象渲染
         * @type {Array}
         */
        let renderTechniqueStack = [];
        /**
         * @param {RenderTechnique} renderTechnique -渲染技侦
         */
        this.pushRenderTechnique = function (renderTechnique) {
            renderTechniqueStack.splice(0,0, renderTechnique);
        }
        /**
         * 移除栈顶 RenderTechnique 对象
         * @param {boolean} [release=true] -是否释放对象
         */
        this.popRenderTechnique = function (release = true) {
            if(renderTechniqueStack.length === 0)
                return;
            //
            if(release) {
                renderTechniqueStack[0].release();
            }
            //
            renderTechniqueStack.splice(0,1);
        }
        /**
         * 获取当前使用的 RenderTechnique 对象
         * @returns {RenderTechnique}
         */
        this.getCurrentRenderTechnique = function () {
            if(renderTechniqueStack.length === 0)
                return null;
            //
            return renderTechniqueStack[0];
        }

        //let defaultRenderTechnique = new RenderTechnique(this.renderer, this.scene, this.camera);
        //let defaultRenderPass = new NormalRenderPass(this.scene, this.camera, defaultRenderTechnique.screenRT);
        //defaultRenderTechnique.addRenderPass(defaultRenderPass);
        //this.pushRenderTechnique(defaultRenderTechnique);
        //
        let clock = new THREE.Clock();

        let onProjectObject = function(scene, camera, projectObject) {
            if(!scene._visibleMeshes) {
                return;
            }
            //
            for(let n=0, length = scene._visibleMeshes.length; n<length; ++n) {
                let object = scene._visibleMeshes[n];
                //
                projectObject(object, camera, this.sortObjects);
            }
            //
            for(let n=0, length = scene._visibleTerrianLayers.length; n<length; ++n) {
                scene._visibleTerrianLayers[n].visible = false;
            }
            for(let n=0, length = scene._visibleModelLayers.length; n<length; ++n) {
                scene._visibleModelLayers[n].visible = false;
            }
        }

        let onRenderShadowMap = function(shadowsArray, scene, camera) {
            if(!scene._visibleTerrianLayers) {
                return;
            }
            //
            for(let n=0, length = scene._visibleTerrianLayers.length; n<length; ++n) {
                scene._visibleTerrianLayers[n].visible = true;
            }
            for(let n=0, length = scene._visibleModelLayers.length; n<length; ++n) {
                scene._visibleModelLayers[n].visible = true;
            }
        }
        /**
         * 渲染场景
         */
        this.renderOneFrame =  (()=> {
            let pagedLodSet = new Set();
            //
            let updateScene = (object, frustum, numFrame) => {
                for(let n=0, length = this.scene.terrainLayers.length; n<length; ++n) {
                    if(this.scene.terrainLayers[n].visible) {
                        this.scene.terrainLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
                    }
                }
                //
                for(let n=0, length = this.scene.modelLayers.length; n<length; ++n) {
                    if(this.scene.modelLayers[n].visible) {
                        this.scene.modelLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
                    }
                }
                //
                for(let n=0, length = this.scene.featureLayers.length; n<length; ++n) {
                    if(this.scene.featureLayers[n].visible) {
                        this.scene.featureLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
                    }
                }
                //
                for(let n=0, length = this.scene.arLayers.length; n<length; ++n) {
                    if(this.scene.arLayers[n].visible) {
                        this.scene.arLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
                    }
                }
                //
                for(let n=0, length = this.scene.temporaryObjs.length; n<length; ++n) {
                    let object = this.scene.temporaryObjs[n];
                    //
                    if(!object.visible) {
                        continue;
                    }
                    //
                    if(object.isPagedLod) {
                        object.resetVisible(true, true);
                        object.isRoot = true;
                        object.update({camera:this.camera, frustum:frustum});
                        pagedLodSet.add(object);
                    }
                    else if(object.isProxyNode){
                        object.update({camera:this.camera, frustum:frustum});
                    }
                    else if(object.update !== undefined){
                        object.update({camera:this.camera, frustum:frustum});
                    }
                }
                //
                this.scene.currentBoundingBox.makeEmpty();
                //
                if(this.renderer.shadowMap.enabled || this.camera.atuoCalculateNearFar) {
                    for(let i=0, numTerrain = this.scene.terrainLayers.length; i<numTerrain; ++i) {
                        this.scene.currentBoundingBox.expandByBox3(this.scene.terrainLayers[i].getCurrentBoundingBoxWorld());
                    }
                    //
                    for(let i=0, numModelLayer = this.scene.modelLayers.length; i<numModelLayer; ++i) {
                        this.scene.currentBoundingBox.expandByBox3(this.scene.modelLayers[i].getCurrentBoundingBoxWorld());
                    }
                }
                //
                for(let n=0, length = this.scene.lightSources.length; n<length; ++n) {
                    if(this.renderer.shadowMap.enabled && this.scene.lightSources[n].castShadow) {
                        if(!this.scene.currentBoundingBox.valid())
                            break;
                        //
                        let bb = this.scene.currentBoundingBox.clone().applyMatrix4(this.scene.lightSources[n].shadow.camera.matrixWorldInverse);
                        //
                        let tmp = new THREE.Box3();
                        tmp.expandByPoint(bb.min);
                        tmp.expandByPoint(bb.max);
                        //
                        this.scene.lightSources[n].shadow.camera.left = tmp.min.x;
                        this.scene.lightSources[n].shadow.camera.right = tmp.max.x;
                        this.scene.lightSources[n].shadow.camera.top = tmp.max.y;
                        this.scene.lightSources[n].shadow.camera.bottom = tmp.min.y;
                        this.scene.lightSources[n].shadow.camera.near = -tmp.max.z;
                        this.scene.lightSources[n].shadow.camera.far = -tmp.min.z;
                        //
                        this.scene.lightSources[n].shadow.camera.updateMatrixWorld();
                        this.scene.lightSources[n].shadow.camera.updateProjectionMatrix();
                    }
                }
            }
            //

            let frustum = new THREE.Frustum();
            let projScreenMatrix = new THREE.Matrix4();
            return function () {
                if(this.onBeginFrame !== undefined)
                    this.onBeginFrame();
                //
                let oldCamera = null;
                //
                if(this.active) {
                    this.camera.updateMatrixWorld(true);
                    this.camera.pixelSizeVector = THREE.computePixelSizeVector(this.domElement.clientWidth,this.domElement.clientHeight,
                        this.camera.projectionMatrix, this.camera.matrixWorldInverse);
                    //
                    projScreenMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
                    frustum.setFromMatrix( projScreenMatrix );
                    //
                    pagedLodSet.clear();
                    this.scene.updateMatrixWorld();
                    updateScene(this.scene, frustum, this.numFrame);
                    //
                    if(this.camera.atuoCalculateNearFar && this.scene.currentBoundingBox.valid()) {
                        oldCamera = this.camera.clone();
                        let bb = this.scene.currentBoundingBox.clone().applyMatrix4(this.camera.matrixWorldInverse);
                        let tmp = new THREE.Box3();
                        tmp.expandByPoint(bb.min);
                        tmp.expandByPoint(bb.max);
                        //
                        if(this.camera.isPerspectiveCamera) {
                            this.camera.near = -tmp.max.z >= 1.0 ? -tmp.max.z : 1.0;
                            this.camera.far = -tmp.min.z > this.camera.near ? -tmp.min.z : this.camera.near + 1000;
                            this.camera.updateProjectionMatrix();
                        }
                        else if(this.camera.isOrthographicCamera) {
                            this.camera.near = -tmp.max.z ;
                            this.camera.far = -tmp.min.z ;
                            this.camera.updateProjectionMatrix();
                        }
                    }
                }
                //
                this.getCurrentRenderTechnique().renderer.onProjectObject = onProjectObject;
                this.getCurrentRenderTechnique().renderer.onRenderShadowMap = onRenderShadowMap;
                //
                this.getCurrentRenderTechnique().render();
                //
                if(this.active) {
                    if(oldCamera) {
                        this.camera.copy(oldCamera);
                        oldCamera = null;
                    }
                    pagedLodSet.forEach(function(value, key, ownerSet) {
                        key.removeUnExpectedChild(10);
                    });
                    //
                    this.scene.removeUnExpected();
                }
                //
                this.fps = 1/ clock.getDelta();
                //
                if(this.onEndFrame !== undefined)
                    this.onEndFrame();
                //
                this.numFrame++;
            }
        })();

        /**
         * 路由 mouse down 事件
         * @param event
         * @returns {boolean}
         */
        this.onMouseDown = ( event )=> {
            if(!this.active) {
                this.active = true;
                if(this.onActivate) {
                    this.onActivate(viewer);
                }
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            viewer.eventState |= viewer.EventState.LEFT_BTN_DOWN;
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if (viewer.eventListenerStack[i].onMouseDown !== undefined &&
                    viewer.eventListenerStack[i].onMouseDown(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 mouse up 事件
         * @param event
         * @returns {boolean}
         */
        this.onMouseUp = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if (viewer.eventListenerStack[i].onMouseUp !== undefined &&
                    viewer.eventListenerStack[i].onMouseUp(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 mouse move 事件
         * @param event
         * @returns {boolean}
         */
        this.onMouseMove = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onMouseMove !== undefined &&
                    viewer.eventListenerStack[i].onMouseMove(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 mouse wheel 事件
         * @param event
         * @returns {boolean}
         */
        this.onMouseWheel = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onMouseWheel !== undefined &&
                    viewer.eventListenerStack[i].onMouseWheel(event)) {
                    return true;
                }
            }
        }

        this.onContextMenu = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
        }

        /**
         * 路由 key down 事件
         * @param event
         * @returns {boolean}
         */
        this.onKeyDown = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onKeyDown !== undefined &&
                    viewer.eventListenerStack[i].onKeyDown(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 key up 事件
         * @param event
         * @returns {boolean}
         */
        this.onKeyUp = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onKeyUp !== undefined &&
                    viewer.eventListenerStack[i].onKeyUp(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 touch start 事件
         * @param event
         * @returns {boolean}
         */
        this.onTouchStart = ( event )=> {
            if(!this.active) {
                this.active = true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onTouchStart !== undefined &&
                    viewer.eventListenerStack[i].onTouchStart(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 touch move 事件
         * @param event
         * @returns {boolean}
         */
        this.onTouchMove = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onTouchMove !== undefined &&
                    viewer.eventListenerStack[i].onTouchMove(event)) {
                    return true;
                }
            }
        }

        /**
         * 路由 touch end 事件
         * @param event
         * @returns {boolean}
         */
        this.onTouchEnd = ( event )=> {
            if(!this.active) {
                return true;
            }
            //
            event.preventDefault();
            event.stopPropagation();
            //
            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
                if(viewer.eventListenerStack[i].onTouchEnd !== undefined &&
                    viewer.eventListenerStack[i].onTouchEnd(event)) {
                    return true;
                }
            }
        }
        /**
         * 处理窗口变化事件
         */
        this.onWindowResize =()=> {
            viewer.domElement.width = viewer.domElement.clientWidth;
            viewer.domElement.height = viewer.domElement.clientHeight;
            //
            viewer.camera.aspect = viewer.domElement.clientWidth / viewer.domElement.clientHeight;
            viewer.camera.updateProjectionMatrix();

            viewer.getCurrentRenderTechnique().setSize(viewer.domElement.clientWidth, viewer.domElement.clientHeight);
        }
        //
        this.registWindowEvent();
        //

        /**
         * 开始渲染循环
         */
        this.run = ()=> {
            requestAnimationFrame( viewer.run );
            viewer.renderOneFrame();
        }
    }

    /**
     * 注册可处理的 window 事件
     */
    registWindowEvent() {
        this.domElement.viewer = this;
        //
        this.domElement.addEventListener( 'contextmenu', this.onContextMenu, false );

        this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
        this.domElement.addEventListener( 'mouseup', this.onMouseUp, false );
        this.domElement.addEventListener( 'mousemove', this.onMouseMove, false );
        this.domElement.addEventListener( 'wheel', this.onMouseWheel, false );

        this.domElement.addEventListener( 'touchstart', this.onTouchStart, false );
        this.domElement.addEventListener( 'touchend', this.onTouchEnd, false );
        this.domElement.addEventListener( 'touchmove', this.onTouchMove, false );


        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );

        window.addEventListener( 'resize', this.onWindowResize, false );
    }

    /**
     *
     */
    unregistWindowEvent() {
        this.domElement.removeEventListener( 'contextmenu', this.onContextMenu, false );

        this.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
        this.domElement.removeEventListener( 'mouseup', this.onMouseUp, false );
        this.domElement.removeEventListener( 'mousemove', this.onMouseMove, false );
        this.domElement.removeEventListener( 'wheel', this.onMouseWheel, false );

        this.domElement.removeEventListener( 'touchstart', this.onTouchStart, false );
        this.domElement.removeEventListener( 'touchend', this.onTouchEnd, false );
        this.domElement.removeEventListener( 'touchmove', this.onTouchMove, false );

        window.removeEventListener( 'keydown', this.onKeyDown, false );
        window.removeEventListener( 'keyup', this.onKeyUp, false );

        //window.removeEventListener( 'resize', this.onWindowResize, false );
    }

    /**
     * 设置场景对象
     * @param {ARScene} scene
     */
    setScene(scene) {
        this.scene = scene;
        this.scene.autoUpdate = false;
    }

    /**
     * 获取场景对象
     * @returns {ARScene}
     */
    getScene() {
        return this.scene;
    }

    /**
     * 设置相机对象
     * @param {THREE.Camera} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * 获取相机对象
     * @returns {THREE.Camera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * 设置渲染器
     * @param {THREE.Renderer} renderer -渲染器
     */
    setRenderer(renderer) {
        this.unregistWindowEvent();
        //
        this.renderer = renderer;
        this.renderer.supportMaterialStencil();
        this.domElement = this.renderer.domElement;
        //
        this.registWindowEvent();
    }

    /**
     * 获取渲染器
     * @returns {THREE.Renderer}
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * 设置帧开始事件回掉函数
     * @param {function} callBack
     */
    setBeginFrameCallBack(callBack) {
        this.onBeginFrame = callBack;
    }

    /**
     * 获取帧开始事件回掉函数
     * @returns {function}
     */
    getBeginFrameCallBack() {
        return this.onBeginFrame;
    }

    /**
     * 将窗口事件处理对象放入队列顶部
     * @param {WindowEventListener} eventListener
     */
    pushEventListenerFront(eventListener) {
        this.eventListenerStack.splice(0,0, eventListener);
        this.scene.addTemporaryObj(eventListener.tempObj);
    }

    /**
     * 将窗口事件处理对象放入队列底部
     * @param {WindowEventListener} eventListener
     */
    pushEventListenerBack(eventListener) {
        this.eventListenerStack.push(eventListener);
        this.scene.addTemporaryObj(eventListener.tempObj);
    }

    /**
     * 移除队列顶部窗口事件处理对象
     * @param {boolean} [release] -是否释放对象
     */
    removeEventListenerFront(release = true) {
        if(release) {
            this.eventListenerStack[0].release();
        }
        this.scene.removeTemporaryObj(this.eventListenerStack[0].tempObj);
        this.eventListenerStack.splice(0,1);
    }

    /**
     * 移除队列底部窗口事件处理对象
     * @param {boolean} [release] -是否释放对象
     */
    removeEventListenerBack(release = true) {
        if(release) {
            this.eventListenerStack[this.eventListenerStack.length-1].release();
        }
        this.scene.removeTemporaryObj(this.eventListenerStack[0].tempObj);
        this.eventListenerStack.remove(this.eventListenerStack.length-1);
    }

    /**
     * 获取队列顶部窗口事件处理对象
     * @return {WindowEventListener}
     */
    getFrontEventListener() {
        return this.eventListenerStack[0];
    }
}

export {ARScene};
export {WindowEventListener};
export {Viewer};
