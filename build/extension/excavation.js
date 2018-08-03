
class ExcavationLayer extends tjh.ar.PostLayer {
    constructor() {
        super();
        //
        this.name = 'ExcavationLayer';
        //
        let excavationNodes = [];
        let volumScene = new THREE.Group();
        let excavationScene = new THREE.Group();
        //
        this.addExcavationNode = function (polygonCoords, depth) {
            let cds = [];
            for(let i=0; i<polygonCoords.length; ++i) {
                cds.push(new jsts.geom.Coordinate(polygonCoords[i].x,polygonCoords[i].y, polygonCoords[i].z));
            }
            if(!jsts.algorithm.CGAlgorithms.isCCW(cds)) {
                for(let i=0, length = polygonCoords.length; i<length; ++i) {
                    polygonCoords[i].x = cds[length - 1 - i].x;
                    polygonCoords[i].y = cds[length - 1 - i].y;
                    polygonCoords[i].z = cds[length - 1 - i].z;
                }
            }
            //
            let pos = polygonCoords[0].clone();
            for(let n=0, length = polygonCoords.length; n<length; ++n) {
                polygonCoords[n].sub(pos);
            }
            //
            let phGroup = new THREE.Group();
            phGroup.position.copy(pos);
            // 底面
            let tmp = tjh.util.PolygonUtil.polygonTriangulate([polygonCoords]);
            let phlfaces = [];
            for(let n=0, numFace = tmp.length/3; n<numFace; n++) {
                phlfaces[n*3] = tmp[(numFace - 1 - n)*3];
                phlfaces[n*3 + 1] = tmp[(numFace - 1 - n)*3 + 1];
                phlfaces[n*3 + 2] = tmp[(numFace - 1 - n)*3 + 2];
            }
            let phlGeom = new THREE.BufferGeometry();
            phlGeom.addAttribute('position', new THREE.Float32BufferAttribute(phlfaces, 3));
            let phlMesh = new THREE.Mesh(phlGeom, new THREE.MeshBasicMaterial());
            phlMesh.position.z = -200 - depth;
            phGroup.add(phlMesh);
            // 顶面
            let phhfaces = tjh.util.PolygonUtil.polygonTriangulate([polygonCoords]);
            let phhGeom = new THREE.BufferGeometry();
            phhGeom.addAttribute('position', new THREE.Float32BufferAttribute(phhfaces, 3));
            let phhMesh = new THREE.Mesh(phhGeom, new THREE.MeshBasicMaterial());
            phhMesh.position.z = 200 + depth;
            phGroup.add(phhMesh);
            //
            let geom = new THREE.BufferGeometry();
            let vertexes = [];
            for(let n=0, length = polygonCoords.length; n<length; ++n) {
                vertexes[vertexes.length] = polygonCoords[n].x;
                vertexes[vertexes.length] = polygonCoords[n].y;
                vertexes[vertexes.length] = polygonCoords[n].z + 200 + depth;

                vertexes[vertexes.length] = polygonCoords[n].x;
                vertexes[vertexes.length] = polygonCoords[n].y;
                vertexes[vertexes.length] = polygonCoords[n].z - 200 - depth;
            }
            geom.addAttribute( 'position', new THREE.Float32BufferAttribute( vertexes, 3 ) );
            let phcMesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
            phcMesh.drawMode = THREE.TriangleStripDrawMode;
            phGroup.add(phcMesh);
            volumScene.add(phGroup);
            //
            let excGroup = new THREE.Group();
            excGroup.position.x = pos.x;
            excGroup.position.y = pos.y;
            excGroup.position.z = pos.z - depth;
            let polygonShape = new THREE.Shape(polygonCoords);
            geom = new THREE.ShapeBufferGeometry(polygonShape);
            let mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
            mesh.material.color.setRGB(0.6,0.6,0.6);
            mesh.material.depthTest = false;
            mesh.material.depthWrite = false;
            excGroup.add(mesh);
            mesh = phcMesh.clone();
            mesh.material.color.setRGB(0.3,0.3,0.3);
            mesh.material.depthTest = false;
            mesh.material.depthWrite = false;
            mesh.material.side = THREE.BackSide;
            excGroup.add(mesh);

            excavationScene.add(excGroup);
            //
            excavationNodes.push({id:excGroup.uuid, boundCoords:polygonCoords, depth:depth, offset:pos, sceneNode:[phGroup, excGroup], visible:true});
            //
            return excavationNodes[excavationNodes.length - 1];
        }

        this.getExcavationNode = function (id) {
            for(let n=0, length = excavationNodes.length; n<length; ++n) {
                if(excavationNodes[n].id === id) {
                    return excavationNodes[n];
                }
            }
            //
            return null;
        }

        this.removeExcavationNode = function (id) {
            for(let n=0, length = excavationNodes.length; n<length; ++n) {
                if(excavationNodes[n].id === id) {
                    excavationNodes[n].sceneNode[0].dispose();
                    volumScene.remove(excavationNodes[n].sceneNode[0]);
                    excavationNodes[n].sceneNode[1].dispose();
                    volumScene.remove(excavationNodes[n].sceneNode[1]);
                    excavationNodes.splice(n,1);
                    return;
                }
            }
        }

        this.getNumExcavationNode = function () {
            return excavationNodes.length;
        }

        this.getVolumScene = function () {
            return volumScene;
        }

        this.getExcavationScene = function () {
            return excavationScene;
        }

        this.isEmpty = function () {
            let empty = true;
            for(let n=0, length = excavationNodes.length; n<length; ++n) {
                if(excavationNodes[n].visible) {
                    empty = false;
                    break;
                }
            }
            //
            return empty;
        }
    }
};


class ExcavationRenderPass extends tjh.ar.RenderPass {
    constructor(scene, camera, renderTarget) {
        super(scene, camera, renderTarget);
        let rootRenderPass = this;
        //
        let volumRenderScene = new THREE.Scene();
        let excavationLayer = scene.getPostLayer('ExcavationLayer')[0];
        volumRenderScene.add(scene.getPostLayer('ExcavationLayer')[0].layer.getVolumScene());
        volumRenderScene.overrideMaterial = new THREE.MeshBasicMaterial();
        let stencilVolumRenderPass = new tjh.ar.RenderPass(volumRenderScene, camera, renderTarget);
        stencilVolumRenderPass.render = function (renderer) {
            if(!excavationLayer.enable || excavationLayer.layer.isEmpty())
                return false;
            //
            volumRenderScene.updateMatrixWorld();
            //
            volumRenderScene.overrideMaterial.side = THREE.BackSide;
            volumRenderScene.overrideMaterial.depthTest = true;
            volumRenderScene.overrideMaterial.depthWrite = false;
            volumRenderScene.overrideMaterial.colorWrite = false;
            //
            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setMask(0xff);
            renderer.state.buffers.stencil.setLocked(true);

            renderer.autoClear = false;
            renderer.clearTarget(renderTarget, false, false, true);
            //
            renderer.state.buffers.stencil.setFunc(renderer.context.ALWAYS, 0, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.INCR, renderer.context.KEEP);
            renderer.render(volumRenderScene, rootRenderPass.camera, renderTarget);
            //

            volumRenderScene.overrideMaterial.side = THREE.FrontSide;
            renderer.state.buffers.stencil.setFunc(renderer.context.ALWAYS, 0, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.DECR, renderer.context.KEEP);
            renderer.render(volumRenderScene, rootRenderPass.camera, renderTarget);
            //
            renderer.state.buffers.stencil.setLocked(false);
            //
            return true;
        };
        //
        let excavationRenderScene = new THREE.Scene();
        excavationRenderScene.add(scene.getPostLayer('ExcavationLayer')[0].layer.getExcavationScene());
        let excavationRenderPass = new tjh.ar.RenderPass(excavationRenderScene, camera, renderTarget);
        excavationRenderPass.render = function (renderer) {
            excavationRenderScene.updateMatrixWorld();
            //
            renderer.autoClear = false;
            //
            renderer.state.buffers.depth.setTest(false);
            renderer.state.buffers.depth.setMask(false);
            renderer.state.buffers.depth.setLocked(true);
            //
            renderer.state.buffers.stencil.setTest(true);
            renderer.state.buffers.stencil.setLocked(true);
            renderer.state.buffers.stencil.setFunc(renderer.context.EQUAL, 1, 0xff);
            renderer.state.buffers.stencil.setOp(renderer.context.KEEP, renderer.context.KEEP, renderer.context.KEEP);

            renderer.render(excavationRenderScene, rootRenderPass.camera, renderTarget);

            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
            //
            renderer.state.buffers.depth.setLocked(false);
            renderer.state.buffers.depth.setTest(true);
            renderer.state.buffers.depth.setMask(true);
            //
            renderer.autoClear = true;
            //
            return true;
        };
        //
        this.render = function (renderer) {
            if(stencilVolumRenderPass.render(renderer)) {
                excavationRenderPass.render(renderer);
                //
                return true;
            }
            //
            return false;
        }
        //
        this.setSize = function(width, height) {

        }
        //
        this.release = function () {

        }
    }
}
