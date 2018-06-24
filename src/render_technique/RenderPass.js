class RenderPass {
    constructor(scene, camera, renderTarget) {
        this.scene = scene ;
        this.camera = camera;
        this.renderTarget = renderTarget;
    }

    setRenderResource(scene, camera, renderTarget) {
        this.scene = scene ;
        this.camera = camera;
        this.renderTarget = renderTarget;
    }

    render(renderer) {

    }

    release() {

    }

    setSize(width, height) {

    }
}




export {RenderPass};

