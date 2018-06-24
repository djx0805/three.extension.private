import {NormalRenderPass, RenderPass} from "./RenderPass";

class OutPutRenderPass extends RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        //
        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        //
        let quad = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ map:this.renderTarget.texture }) );
        quad.drawMode = THREE.TriangleFanDrawMode;
        quad.frustumCulled = false;
        let tmpScene = new THREE.Scene();
        tmpScene.add(quad);
        //
        this.render = function (renderer) {
            if(!this.renderTarget)
                return false;
            //
            renderer.render(tmpScene, orthoCamera);
            return true;
        }
        //
        this.release = function () {
            geom.dispose();
        }
    }
};

export {OutPutRenderPass};