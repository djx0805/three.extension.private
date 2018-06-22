class RenderPass {
    constructor(scene, camera) {
        this.scene = scene ? scene : new THREE.Scene();
        this.camera = camera;
    }

    render(renderer) {

    }
}

class NormalRenderPass extends RenderPass {
    constructor(scene, camera) {
        super(scene, camera);
        //
        this.render = (renderer)=> {
            renderer.render(scene, camera);
        }
    }
}


export {RenderPass};
export {NormalRenderPass};
