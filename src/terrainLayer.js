/**
 * 地形图层
 * @class
 * @memberOf tjh.ar
 * @extends THREE.ProxyNode
 */
class TerrainLayer extends THREE.ProxyNode {
    /**
     * @param {THREE.DataBasePager} [dataBasePager] -指定分页管理器
     * @param {THREE.Vector3} [offset] -指定偏移值
     */
    constructor(dataBasePager = new THREE.DataBasePager(true), offset) {
        super(dataBasePager);
        //
        if(offset) {
            this.position.copy(offset);
            this.updateMatrixWorld();
        }
        //
        this.excavation = [];
        //
        this.matrixAutoUpdate = false;
        //
        this.rayIntersectTerrain = (()=>{
            let raycaster = new THREE.Raycaster();
            let terrainBoundingBox = this.getBoundingBoxWorld();
            let terrainBottomPlane = new THREE.Plane();
            terrainBottomPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), terrainBoundingBox.min);
            return (p, camera)=>{
                raycaster.setFromCamera( p, camera);
                let intersects = raycaster.intersectObject(this);
                if(intersects.length > 0) {
                    return {intersected:true, intersectP:intersects[0].point};
                }
                else {
                    let intersectP_ = raycaster.ray.intersectPlane(terrainBottomPlane);
                    return {intersected:false, intersectP:intersectP_};
                }
            }
        })();
    }

    /**
     * 添加地形资源 url
     * @param {string} url -地形数据的url
     */
    addTerrain(url) {
        this.addFileName(url);
    }

    /**
     * 移除地形资源
     * @param {string} url -地形数据的url
     */
    removeTerrain(url) {
        this.removeFileName(url);
    }


    addExcavation(boundary, offset, depth) {
        let polygonShape = new THREE.Shape(boundary);
        let geom = new THREE.ShapeBufferGeometry(polygonShape);
        let mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
        mesh.position.x = offset.x;
        mesh.position.y = offset.y;
        mesh.position.z = offset.z - depth;
        mesh.material.color.setRGB(0.6,0.6,0.6);
        mesh.material.depthTest = false;
        mesh.material.depthWrite = false;
        //
        this.excavation[this.excavation.length] = mesh;
    }

    update(context) {
        if(!this.visible)
            return;
        //
        let pgs = [];
        let pagedLodCollect = (node)=> {
            if(node instanceof  THREE.PagedLod) {
                node.isRoot = true;
                pgs.push(node);
            }
            else if(node.children.length > 0) {
                for(let i=0; i<node.children.length; ++i) {
                    pagedLodCollect(node.children[i]);
                }
            }
        }
        pagedLodCollect(this);
        //
        context.onTextureLoadFailed = function (material) {
            if(material instanceof  THREE.MeshBasicMaterial) {
                material.map = undefined;
            }
            //
            return true;
        }
        //
        super.update(context);
    }

    intersectWithRay(raycaster) {
        let intersects = raycaster.intersectObjects(this);
        if(intersects.length > 0) {
            return intersects[0].position;
        }
        //
    }
}

export {TerrainLayer};
