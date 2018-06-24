import {PostLayer} from "./postLayer";

class OutLineObjLayer extends PostLayer {
    constructor() {
        super();
        //
        this.name = 'OutLineObjLayer';
        //
        let outLineObjs = [];
        //
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

        this.removeOutlineObj = (...objects)=> {
            for(let i=0; i<objects.length; ++i) {
                let index = outLineObjs.indexOf(objects[i]);
                if(index >= 0) {
                    outLineObjs.splice(index,1);
                }
            }
        }

        this.clear = ()=> {
            for(let i=0, length = outLineObjs.length; i<length; ++i) {
                this.removeOutlineObj(outLineObjs[i]);
            }
            //
            outLineObjs = [];
        }

        this.getOutLineObjs = ()=> {
            return outLineObjs;
        }
    }
}