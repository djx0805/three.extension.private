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
       //
       let proxyNode = new THREE.ProxyNode(this.dataBasePager);
       let url = "http://" + ip + ":" + port.toString() + "/api/data/osgjsLocalData?urlInfo=" + resourceID;
       proxyNode.addFileName(url);
       this.add(proxyNode);

       this.update = function(context) {
           if(this.visible) {
               proxyNode.visible = true;
           }
           else {
               proxyNode.visible = false;
               return;
           }
           proxyNode.update(context);
           //
           if(proxyNode.children.length === 1) {
               proxyNode.children[0].children[0].children[0].isTJHModelLayer = true;
           }
       }

       this.removeUnExpected = function () {
           this.removeUnExpectedChild(10);
       }
   }
}

export {TJHModelLayer};
