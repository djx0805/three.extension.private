class RenderTechnique {
    constructor(renderer, scene, camera) {
        this.renderPasses = [];
        this.domElement = renderer.domElement;
        this.renderer = renderer ? renderer : new THREE.WebGLRenderer();
        this.scene = scene;
        this.camera = camera;
        //
        this.offScreenRT = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight, pars);
        this.offScreenRT.texture.generateMipmaps = false;
        this.offScreenRT.stencilBuffer = true;
        this.offScreenRT.depthBuffer = true;
        this.offScreenRT.depthTexture = new THREE.DepthTexture(this.domElement.clientWidth, this.domElement.clientHeight,
            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
    }

    setRenderResource(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
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
        let needPostProcess = false;
        for(let n=0, length = this.scene.postLayers.length; n<length; ++n) {
            if(this.scene.postLayers[n].enable && this.scene.postLayers[n].items.length>0) {
                needPostProcess = true;
                break;
            }
        }
        //
        let renderTarget = null;
        if(needPostProcess) {
            renderTarget = this.offScreenRT;
        }
        for(let i=0; i<this.renderPasses.length; ++i) {
            this.renderPasses[i].setRenderResource(this.scene, this.camera, renderTarget);
            this.renderPasses[i].render(this.renderer);
        }
    }

    setSize(width, height) {
        this.offScreenRT.setSize(width, height);
        for(let n=0, length = this.renderPasses.length; n<length; ++n) {
            this.renderPasses[n].setSize(width, height);
        }
        //
        this.renderer.setSize(width, height);
    }

    release() {
        this.offScreenRT.texture.dispose();
        this.offScreenRT.depthTexture.dispose();
        this.offScreenRT.dispose();
        //
        for(let n=0, length = this.renderPasses.length; n<length; ++n) {
            this.renderPasses[n].release();
        }
    }
}

RenderTechnique.postProcessor = new Map();
//
RenderTechnique.registPostProcessor = function (name, renderPass, order = 0) {
    if(!RenderTechnique.postProcessor.has(name)) {
        RenderTechnique.postProcessor.set(name, {name:name, renderPass:renderPass, order:order});
        return true;
    }
    //
    return false;
}
//
RenderTechnique.unregistPostProcessor = function (name) {
    if(RenderTechnique.postProcessor.has(name)) {
        RenderTechnique.postProcessor.get(name).renderPass.release();
        RenderTechnique.postProcessor.remove(name);
        return true;
    }
    //
    return false;
}

RenderTechnique.hasPostProcesser = function (name) {
    if(RenderTechnique.postProcessor.has(name))
        return true;
    //
    return false;
}

export {RenderTechnique}
