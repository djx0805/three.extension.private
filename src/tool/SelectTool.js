import {ToolBase} from "./ToolBase";

/**
 * 选择工具基类
 * @class
 * @memberOf tjh.ar.tools
 * @extends tjh.ar.tools.ToolBase
 * @param {Viewer} viewer
 * @param {THREE.Camera} camera
 * @param {boolean} highLight -是否高亮选中目标
 * @param {Array} layers   -参与选择的图层集合（模型图层或矢量图层）
 */
class SelectTool extends ToolBase {
    constructor(viewer, camera, highLight = true, layers=viewer.scene.modelLayers, outLineObjLayer = null) {
        super(viewer);
        //
        /**
         * @public
         * @type {THREE.Camera}
         */
        this.camera = camera;
        /**
         * 参与选择的图层集合
         * @public
         * @type {Array}
         */
        this.sourceLayers = layers;
        /**
         * 被选择的对象
         * @public
         * @type {Array}
         */
        this.selectedObjs = [];
        /**
         * 被选择对象的高亮颜色
         * @public
         * @type {THREE.Color}
         */
        this.selectColor = new THREE.Color(0xffff00);
        /**
         * 鼠标经过时的高亮颜色
         * @public
         * @type {THREE.Color}
         */
        this.mouseOverColor = new THREE.Color(0x00ff00);
        this._highLight_ = highLight;
        //
        this.outLineObjLayer = outLineObjLayer ? outLineObjLayer : viewer.scene.getPostLayer('OutLineObjLayer')[0];
        //
        /**
         * 设置是否高亮选中对象
         * @public
         * @param {bool} highLight -是否高亮
         */
        this.highLightSelected = (highLight)=> {
            if(this._highLight_ === highLight)
                return ;
            //
            if(highLight) {

            }
            else if(this.outLineObjLayer) {
                //
                this.outLineObjLayer.removeOutlineObj(this.selectedObjs);
            }
            //
            this._highLight_ = highLight;
        }
        /**
         * 释放函数
         */
        this.release = ()=>{
            for(let i=0; i<this.selectedObjs.length; ++i) {
                delete this.selectedObjs[i].outlineColor;
            }
            if(this.outLineObjLayer)
              this.outLineObjLayer.removeOutlineObj(this.selectedObjs);
        }
    }
}

/**
 * 点选工具，一次只能选择一个对象
 * @class
 * @memberOf  tjh.ar.tools
 * @extends tjh.ar.tools.SelectTool
 */
class PointSelectTool extends SelectTool {
    constructor(viewer, camera=viewer.getCamera(), highLight = true, layers=viewer.scene.modelLayers, renderTechnique = null) {
        super(viewer, camera, highLight, layers, renderTechnique);
        //
        let oldVPMatrix = new THREE.Matrix4();
        //
        let raycaster = new THREE.Raycaster();
        //
        let currentSelectedObj = null;
        //
        let select = (mouseEvent)=> {
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / this.viewer.domElement.width ) * 2 - 1;
            mouse.y = - ( clientY / this.viewer.domElement.height ) * 2 + 1;
            //
            raycaster.setFromCamera( mouse, this.camera);
            raycaster.linePrecision = 3;
            let intersects = raycaster.intersectObjects( this.sourceLayers);
            //
            if(intersects.length === 0)
                return false;
            //
            let selectObj = intersects[0].object;
            while (selectObj && !selectObj.isPlantModel && !selectObj.isFeature) {
                if(selectObj.parent && selectObj.parent.name === "IndexNode")
                    break;
                //
                selectObj = selectObj.parent;
            }
            return selectObj;
        };

        this.onLeftDown = (mouseEvent)=> {
            if(!currentSelectedObj) {
                currentSelectedObj = select(mouseEvent);
                if(!currentSelectedObj)
                  return false;
            }
            //
            if(this.selectedObjs.length > 0 && this.selectedObjs.indexOf(currentSelectedObj) >= 0) {
                currentSelectedObj = undefined;
                return true;
            }
            //
            if(this.selectedObjs.indexOf(currentSelectedObj) < 0) {
                if(this.selectedObjs.length > 0) {
                    if(this._highLight_ && this.outLineObjLayer) {
                        this.outLineObjLayer.removeOutlineObj(this.selectedObjs[0]);
                    }
                    this.selectedObjs = [];
                }
                currentSelectedObj.outlineColor = this.selectColor.clone();
                this.selectedObjs.push(currentSelectedObj);
                currentSelectedObj = undefined;
                return true;
            }
            //
            return false;
        }

        this.onMouseMove = (mouseEvent)=> {
            if(mouseEvent.buttons !== 0) {
                return false;
            }
            //
            let selectObj = select(mouseEvent);
            if(!selectObj) {
                if(currentSelectedObj) {
                    if(this._highLight_ && this.outLineObjLayer) {
                        this.outLineObjLayer.removeOutlineObj(currentSelectedObj);
                    }
                    delete currentSelectedObj.outlineColor;
                    currentSelectedObj = undefined;
                }
                return false;
            }
            //
            if(this.selectedObjs.indexOf(selectObj) >= 0) {
                return true;
            }
            //
            selectObj.outlineColor = this.mouseOverColor.clone();
            //
            if(!currentSelectedObj) {
                if(this._highLight_ && this.outLineObjLayer) {
                    this.outLineObjLayer.addOutlineObj(selectObj);
                }
                currentSelectedObj = selectObj;
            }
            else if(currentSelectedObj === selectObj) {
                return true;
            }
            else {
                if(this._highLight_ && this.outLineObjLayer) {
                    this.outLineObjLayer.removeOutlineObj(currentSelectedObj);
                }
                delete currentSelectedObj.outlineColor;
                currentSelectedObj = selectObj;
                if(this._highLight_ && this.outLineObjLayer) {
                    this.outLineObjLayer.addOutlineObj(currentSelectedObj);
                }
                return true;
            }
            //
            return false;
        }
    }

    release() {
        super.release();
    }
}

export {SelectTool};
export {PointSelectTool};
