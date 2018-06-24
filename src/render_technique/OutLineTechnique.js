import {RenderTechnique} from "./RenderTechnique";
import {NormalRenderPass} from "./NormalRenderPass";
import {OutLineRenderPass} from "./OutLineRenderPass";
import {OutPutRenderPass} from "./OutPutRenderPass";

class OutLineTechnique extends RenderTechnique {
    constructor(renderer, scene, camera) {
        super(renderer, scene, camera);
        //
        let normalRenderPass = new NormalRenderPass();
        let outLineRenderPass = new OutLineRenderPass();
        let outPutRenderPass = new OutPutRenderPass();
        //
        this.addRenderPass(normalRenderPass);
        this.addRenderPass(outLineRenderPass);
        this.addRenderPass(outPutRenderPass);
    }
}


export {OutLineTechnique};
