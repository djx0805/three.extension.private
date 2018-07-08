class TJHModelLayer extends THREE.Group {
    /**
     * TJH 单体模型图层
     * @class
     * @memberOf tjh.ar
     * @extends THREE.Group
     * @param {string} ip -数据服务 ip
     * @param {int} port -数据服务端口
     * @param {string} resourceID -资源 ID
     * @param {THREE.DataBasePager} [dataBasePager] -数据分页控制器
     * @param {THREE.Vector3} [offset] -偏移值
     */
   constructor(ip, port, resourceID, dataBasePager, offset) {
       super();
       this.isTJHModelLayer = true;
       //
        if(offset) {
            this.position.copy(offset);
            this.updateMatrixWorld();
        }
        //
       this.matrixAutoUpdate = false;
       //
        /**
         * @type {string}
         */
       this.ip = ip;
        /**
         * @type {Number}
         */
       this.port = port;
        /**
         * @type {string}
         */
       this.resourceID = resourceID;
        /**
         * @type {THREE.DataBasePager}
         */
       this.dataBasePager = dataBasePager ? dataBasePager : new THREE.DataBasePager(true);

       this._visibleMesh_ = [];
       //
       let proxyNode = new THREE.ProxyNode(this.dataBasePager);
       proxyNode.forceRootLoad = false;
       let url = "http://" + ip + ":" + port.toString() + "/api/data/osgjsData?urlInfo=" + resourceID;
       proxyNode.addFileName(url);
       this.add(proxyNode);

       this.update = function(context) {
           this._visibleMesh_ = [];
           //
           if(this.visible) {
               proxyNode.visible = true;
           }
           else {
               proxyNode.visible = false;
               return;
           }
           //
           if(!context.lookAt) {
               context.lookAt = context.camera.matrixWorldInverse.getLookAt();
           }
           //
           let bs = proxyNode.getBoundingSphereWorld();
           if(!bs.valid() || context.frustum.intersectsSphere(bs)) {
               context.dataBasePager = this.dataBasePager;
               context.dataBasePager.cullGroup = true;
               proxyNode.update(context, this._visibleMesh_);
           }
       }

       this.removeUnExpected = function () {
           this.removeUnExpectedChild(10);
       }


       this.getCurrentBoundingBoxWorld = function () {
            let bb = new THREE.Box3();
            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
                bb.expandByBox3(this._visibleMesh_[n].getBoundingBoxWorld());
            }
            //
            return bb;
       };

       this.getCurrentBoundingSphereWorld = function () {
            let bs = new THREE.Sphere();
            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
                bs.expandBySphere(this._visibleMesh_[n].getBoundingSphereWorld());
            }
            //
            return bs;
       };
   }
}

export {TJHModelLayer};
