import {PostLayer} from "./postLayer";

/**
 * @classdesc 轮廓化图层
 * @class
 * @memberOf tjh.ar
 * @extends PostLayer
 */
class OutLineObjLayer extends PostLayer {
    constructor() {
        super();
        //
        this.name = 'OutLineObjLayer';
        //
        let outLineObjs = [];

        /**
         * 添加轮廓化对象（一个或多个）
         * @param {THREE.Object3D} obj -对象
         */
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
            }
        }

        /**
         * 移除轮廓化对象（一个或多个）
         * @param {THREE.Object3D} obj -对象
         */
        this.removeOutlineObj = (...objects)=> {
            for(let i=0; i<objects.length; ++i) {
                let index = outLineObjs.indexOf(objects[i]);
                if(index >= 0) {
                    outLineObjs.splice(index,1);
                }
            }
        }

        /**
         * 清除所有轮廓化对象
         */
        this.clear = ()=> {
            for(let i=0, length = outLineObjs.length; i<length; ++i) {
                this.removeOutlineObj(outLineObjs[i]);
            }
            //
            outLineObjs = [];
        }

        /**
         * 获取所有轮廓化对象
         * @param {array} outLineObjs -轮廓化对象
         */
        this.getOutLineObjs = ()=> {
            return outLineObjs;
        }

        this.isEmpty = function () {
            if(outLineObjs.length > 0)
                return false;
            //
            return true;
        }
    }
};

export {OutLineObjLayer};
