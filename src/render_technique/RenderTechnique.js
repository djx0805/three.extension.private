class RenderTechnique {
    constructor(renderer) {
        this.renderPasses = [];
        this.renderer = renderer ? renderer : new THREE.WebGLRenderer();
    }

    addRenderPass(renderPass) {
       this.renderPasses.push(renderPass);
    }

    removeRenderPass(renderPass) {
        let index = this.renderPasses.indexOf(renderPass);
        if(index >= 0)
           this.renderPasses.splice(index, 1);
    }
    render() {
        for(let i=0; i<this.renderPasses.length; ++i) {
            this.renderPasses[i].render(this.renderer);
        }
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    release() {

    }
}

export {RenderTechnique}
