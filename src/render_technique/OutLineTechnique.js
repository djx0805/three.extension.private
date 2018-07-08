import {RenderTechnique} from "./RenderTechnique";
import {NormalRenderPass} from "./NormalRenderPass";
import {OutLineRenderPass} from "./OutLineRenderPass";
import {OutPutRenderPass} from "./OutPutRenderPass";

class OutLineTechnique extends RenderTechnique {
    constructor(renderer, scene, camera) {
        super(renderer, scene, camera);
        //
        let normalRenderPass = new NormalRenderPass(scene, camera, this.screenRT);
        let outLineRenderPass = new OutLineRenderPass(scene, camera, this.offScreenRT);
        let outPutRenderPass = new OutPutRenderPass(scene, camera, this.offScreenRT);
        //
        this.addRenderPass(normalRenderPass);
        this.addRenderPass(outLineRenderPass);
        this.addRenderPass(outPutRenderPass);
    }
}


export {OutLineTechnique};
