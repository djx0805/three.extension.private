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
        this.matrixAutoUpdate = false;
        //
        this._visibleMesh_ = [];
        //
        this.rayIntersectTerrain = (()=> {
            let raycaster = new THREE.Raycaster();
            let terrainBoundingBox = this.getBoundingBoxWorld();
            let terrainBottomPlane = new THREE.Plane();
            terrainBottomPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), terrainBoundingBox.min);
            return (p, camera)=> {
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

        /**
         * 获取Layer当前的包围盒
         * @return {THREE.Box3} -包围盒
         */
        this.getCurrentBoundingBoxWorld = function () {
            let bb = new THREE.Box3();
            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
                bb.expandByBox3(this._visibleMesh_[n].getBoundingBoxWorld());
            }
            //
            return bb;
        };

        /**
         * 获取Layer当前的包围球
         * @return {THREE.Sphere} -包围球
         */
        this.getCurrentBoundingSphereWorld = function () {
            let bs = new THREE.Sphere();
            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
                bs.expandBySphere(this._visibleMesh_[n].getBoundingSphereWorld());
            }
            //
            return bs;
        };
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

    update(context) {
        this._visibleMesh_ = [];
        this.dataBasePager.loadRequest = [];
        //
        if(!this.visible)
            return;
        //
        context.onTextureLoadFailed = function (material) {
            if(material instanceof  THREE.MeshBasicMaterial) {
                material.map = undefined;
            }
            return false;
        }
        //
        if(!context.lookAt) {
            context.lookAt = context.camera.matrixWorldInverse.getLookAt();
        }
        super.update(context, this._visibleMesh_);
        //
        this.loadRequest = this.dataBasePager.loadRequest;
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
