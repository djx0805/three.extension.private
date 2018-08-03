import {ToolBase} from "./ToolBase";
import {ModelTransformTool} from "./ModelTransformTool";
import {PointSelectTool} from "./SelectTool";

/**
 * @class
 * @memberOf tjh.ar.tools
 * @extends tjh.ar.tools.ToolBase
 * @param {THREE.Viewer} viewer
 * @param {tjh.ar.ModelLayer} modelLayer -模型放置图层
 */
class ModelPlantTool extends ToolBase {
    constructor(viewer, modelLayer) {
        super(viewer);
        let mpTool = this;
        /**
         * 种植模式
         * @enum
         * @type {{PLANT_BY_URL: number, PLANT_BY_MODEL: number}}
         */
        ModelPlantTool.PLANT_MODE = {
            /** @description 通过url种植*/
            PLANT_BY_URL : 0,
            /** @description 通过模型种植*/
            PLANT_BY_MODEL : 1
        };
        /**
         * 模型种植触发条件
         * @enum
         * @type {{PLANT_CONTROL_KEY: number, PLANT_CONTROL_DIRECT: number}}
         */
        ModelPlantTool.PLANT_CONTROL_MODE = {
            /** @description 需按住某个键*/
            PLANT_CONTROL_KEY : 0,
            /** @description 鼠标点击后直接种植*/
            PLANT_CONTROL_DIRECT : 1
        };
        /**
         * 刚体变换工具激活条件
         * @enum
         * @type {{TRANSFORM_CONTROL_NONE: number, TRANSFORM_CONTROL_KEY: number, TRANSFORM_CONTROL_AFTER_PLANT: number}}
         */
        ModelPlantTool.TRANSFORM_CONTROL_MODE = {
            /** @description 不激活*/
            TRANSFORM_CONTROL_NONE : 0,
            /** @description 按下某键后激活*/
            TRANSFORM_CONTROL_KEY : 1,
            /** @description 种植模型后直接激活*/
            TRANSFORM_CONTROL_AFTER_PLANT : 2
        };
        /**
         * 所要种植模型的 url
         * @type {null}
         */
        this.modelUrl = null;
        /**
         * 所要种植的模型对象
         * @type {THREE.Object3D}
         */
        this.model = null;
        /**
         * 模型种植模式
         * @type {number}
         */
        this.plantMode = ModelPlantTool.PLANT_MODE.PLANT_BY_URL;
        /**
         * @type {tjh.ar.ModelLayer}
         */
        this.modelLayer = modelLayer ? modelLayer : (this.viewer.scene.modelLayers.length > 0 ? this.viewer.scene.modelLayers[0] : null);
        /**
         * @type {ModelPlantTool.PLANT_CONTROL_MODE|number}
         */
        this.plantControlMode = ModelPlantTool.PLANT_CONTROL_MODE.PLANT_CONTROL_KEY;
        /**
         * @type {string}
         */
        this.plantControlKey = "Alt";
        /**
         * @type {ModelPlantTool.TRANSFORM_CONTROL_MODE|number}
         */
        this.tranformToolActivateMode = ModelPlantTool.TRANSFORM_CONTROL_MODE.TRANSFORM_CONTROL_KEY;
        /**
         * @type {string}
         */
        this.tranformToolControlKey = "Control";
        /**
         * @type {ModelTransformTool}
         */
        this.modelTransformTool = new ModelTransformTool(this.viewer, this.viewer.getCamera());

        this.modelTransformTool.setActiveHandler("rotate");
        this.selectTool = new PointSelectTool(this.viewer, this.viewer.getCamera(), false, [this.modelLayer]);
        //
        this._current_key_ = null;
        //
        this._onNodeAdd_ = function (addedNode) {
            if(addedNode.url && addedNode.url === mpTool.modelUrl) {
                mpTool.modelTransformTool.attach(addedNode.object);
                //
                if(mpTool.viewer.getFrontEventListener() !== mpTool.modelTransformTool) {
                    mpTool.viewer.pushEventListenerFront(mpTool.modelTransformTool);
                }
            }
            else if(!addedNode.url && addedNode.object === mpTool.model) {
                if(mpTool.viewer.getFrontEventListener() !== mpTool.modelTransformTool) {
                    mpTool.modelTransformTool.attach(addedNode.object);
                    mpTool.viewer.pushEventListenerFront(mpTool.modelTransformTool);
                }
            }
        }
        //
        let tools = ["translate", "rotate", "scale"];
        let toolIndex = 0;
        //
        let raycaster = new THREE.Raycaster();
        /**
         * @description 在变换工具已激活的情况下，按住 ctrl 键，鼠标滚轮可控制变换工具模式
         * @param wheelEvent
         * @return {boolean}
         */
        this.onMouseWheel = (wheelEvent)=> {
            if(wheelEvent.ctrlKey && this.modelTransformTool) {
                if(wheelEvent.deltaY > 0) {
                    toolIndex = (toolIndex + 1)%3;
                    this.modelTransformTool.setActiveHandler(tools[toolIndex]);
                }
                else if(wheelEvent.deltaY < 0) {
                    toolIndex = (toolIndex + 2)%3;
                    this.modelTransformTool.setActiveHandler(tools[toolIndex]);
                }
                //
                return true;
            }
            //
            return false;
        }

        this.onKeyDown = (keyboardEvent)=> {
            this._current_key_ = keyboardEvent.key;
            if(this._current_key_ === this.tranformToolControlKey) {
                if(this.viewer.getFrontEventListener() !== this.modelTransformTool) {
                    this.viewer.pushEventListenerFront(this.modelTransformTool);
                }
                return true;
            }
            return false;
        }

        this.onKeyUp = (keyboardEvent)=> {
            if(keyboardEvent.key === this._current_key_) {
                this._current_key_ = null;
                return true;
            }
            //
            this._current_key_ = null;
            return false;
        }

        /**
         * @description 在鼠标点击的位置种植模型
         * @param mouseEvent
         * @return {boolean}
         */
        this.onLeftDown = function(mouseEvent){
            if(this.tranformToolActivateMode === ModelPlantTool.TRANSFORM_CONTROL_MODE.TRANSFORM_CONTROL_KEY &&
               this._current_key_ === this.tranformToolControlKey) {
                //
                this.selectTool.onLeftDown(mouseEvent);
                if(this.selectTool.selectedObjs.length > 0) {
                    this.modelTransformTool.attach(this.selectTool.selectedObjs[0]);
                }
                return true;
            }
            //
            if(this.plantControlMode === ModelPlantTool.PLANT_CONTROL_MODE.PLANT_CONTROL_DIRECT ||
                (this.plantControlMode === ModelPlantTool.PLANT_CONTROL_MODE.PLANT_CONTROL_KEY && this._current_key_ === this.plantControlKey)) {
                if(!this.modelUrl || !this.modelLayer)
                    return false;
                //
                if(this.tranformToolActivateMode === ModelPlantTool.TRANSFORM_CONTROL_MODE.TRANSFORM_CONTROL_AFTER_PLANT) {
                    if(!this.modelLayer.hasEventListener("addnode", this._onNodeAdd_)) {
                        this.modelLayer.addEventListener("addnode", this._onNodeAdd_);
                    }
                }
                else {
                    this.modelLayer.removeEventListener("addnode", this._onNodeAdd_);
                }
                //
                const clientX = mouseEvent.offsetX;
                const clientY = mouseEvent.offsetY;
                //
                let mouse = new THREE.Vector2();
                mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
                mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
                //
                raycaster.setFromCamera( mouse, this.viewer.getCamera());
                let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

                if(intersects.length <= 0) {
                    return false;
                }
                //
                let intersectionPos = intersects[0].point;
                if(this.plantMode === ModelPlantTool.PLANT_MODE.PLANT_BY_URL) {
                    this.modelLayer.addModelByURL(this.modelUrl, intersectionPos);
                }
                else if(this.plantMode === ModelPlantTool.PLANT_MODE.PLANT_BY_MODEL) {
                    this.modelLayer.addThreeObj(this.model, intersectionPos);
                }
                //
                return true;
            }
            //
            return false;
        }
        //
        this.release = function () {
            if(this.viewer.getFrontEventListener() === this.modelTransformTool) {
                this.viewer.removeEventListenerFront();
                this.modelTransformTool.detach();
            }
        }
    }

    /**
     * @description 如果刚体变换工具已激活，按下鼠标右键可取消激活
     * @param mouseEvent
     * @return {boolean}
     */
    onRightUp(mouseEvent) {
        if(this.viewer.getFrontEventListener() === this.modelTransformTool) {
            this.viewer.removeEventListenerFront(false);
            this.modelTransformTool.detach();
            //
            return true;
        }
        //
        return false;
    }
}

export {ModelPlantTool};
