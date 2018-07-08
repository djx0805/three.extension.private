/**
 * @classdesc 代理节点
 * @class
 * @extends THREE.Group
 * @param {DataBasePager} [dataBasePager] -指定分页管理器
 */
THREE.ProxyNode = function (dataBasePager) {
    THREE.Group.call(this);

    this.type = 'ProxyNode';
    this.isProxyNode = true;
    /**
     * 分页管理器
     * @type {THREE.DataBasePager}
     */
    this.dataBasePager = dataBasePager ? dataBasePager : new THREE.DataBasePager(true);
    this.forceRootLoad = false;

    Object.defineProperties( this, {
        fileNameList: {
            enumerable: true,
            value: []
        }
    } );
};

THREE.ProxyNode.prototype = Object.assign( Object.create( THREE.Group.prototype ), {
    constructor: THREE.ProxyNode,
});
/**
 * 添加代理数据
 * @param {number} childNo -索引编号
 * @param {string} fileName -代理文件 url
 */
THREE.ProxyNode.prototype.setFileName = function (childNo, fileName) {
    this.fileNameList[childNo] = {fileName:fileName, dataIndex:-1, visible:true};
};
/**
 * 添加代理数据至尾部
 * @param {string} fileName -代理文件 url
 */
THREE.ProxyNode.prototype.addFileName = function (fileName) {
    this.fileNameList.push({fileName:fileName, dataIndex:-1, visible:true});
};
/**
 * 移除代理数据
 * @param fileName
 */
THREE.ProxyNode.prototype.removeFileName = function (fileName) {
    for(let n=0, length = this.fileNameList.length; n<length; ++n) {
        if(this.fileNameList[n].fileName === fileName) {
            if(this.fileNameList[n].dataIndex >=0) {
                this.children[this.fileNameList[n].dataIndex].dispose();
                this.children[this.fileNameList[n].dataIndex] = new THREE.Group();
            }
            //
            this.fileNameList.splice(n, 1);
            break;
        }
    }
}
/**
 * 显示/隐藏 代理数据
 * @param fileName
 * @param visible
 */
THREE.ProxyNode.prototype.setVisible = function(fileName, visible) {
    if(!fileName) {
        this.visible = visible;
        return;
    }
    //
    for(let n=0, length = this.fileNameList.length; n<length; ++n) {
        if(this.fileNameList[n].fileName === fileName) {
            this.fileNameList[n].visible = visible;
            if(this.fileNameList[n].dataIndex >= 0) {
                this.children[this.fileNameList[n].dataIndex].visible = visible;
            }
            return;
        }
    }
}
/**
 * 判断代理数据是否可见
 * @param fileName
 * @return {*}
 */
THREE.ProxyNode.prototype.getVisible = function (fileName) {
    if(!this.fileName) {
        return this.visible;
    }
    for(let n=0, length = this.fileNameList.length; n<length; ++n) {
        if(this.fileNameList[n].fileName === fileName) {
            return this.fileNameList[n].visible;
        }
    }
    //
    return false;
}
/**
 * 获取指定位置的代理文件 url
 * @param {number} childNo -索引编号
 * @return {string}
 */
THREE.ProxyNode.prototype.getFileName = function (childNo) {
    if(this.fileNameList.length > childNo) {
        return this.fileNameList[childNo];
    }
    else
        return undefined;
};
/**
 * 获取代理文件个数
 * @return {number}
 */
THREE.ProxyNode.prototype.getNumFileNames = function () {
    return this.fileNameList.length;
};
/**
 * 请求加载代理文件
 * @param {string} url -代理文件 url
 * @return {boolean} -失败返回 false
 */
THREE.ProxyNode.prototype.loadChild = function (url, frameNumber) {
    return this.dataBasePager.load(url, frameNumber, this.forceRootLoad);
};

THREE.ProxyNode.prototype.update = function (context, visibleMesh) {
    for(let i=0, length = this.fileNameList.length; i<length; i++) {
        if(!this.fileNameList[i].visible || this.fileNameList[i].dataIndex >= 0)
            continue;
        //
        if(this.dataBasePager.loadedNodeCache.has(this.fileNameList[i].fileName)) {
            let loadedNode = this.dataBasePager.loadedNodeCache.get(this.fileNameList[i].fileName);
            if(loadedNode.isPlaceholder) {

            }
            else {
                let parsedNode = this.dataBasePager.proxyParse(loadedNode);
                this.dataBasePager.loadedNodeCache.delete(this.fileNameList[i].fileName);
                this.dataBasePager.parsedNodeCache.set(this.fileNameList[i].fileName, parsedNode.children[0]);
            }
            continue;
        }
        else if(this.dataBasePager.parsedNodeCache.has(this.fileNameList[i].fileName)) {
            let textureState = this.dataBasePager.checkCacheReady(this.fileNameList[i].fileName, context.onTextureLoadFailed);
            if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_READY) {
                let node = this.dataBasePager.parsedNodeCache.get(this.fileNameList[i].fileName);
                if(node) {
                    for(let n=0, numChildren = this.children.length; n<numChildren; ++n) {
                        if(!this.children[n].parent) {
                            if(node.parent)
                                node.parent.remove(node);
                            this.children[n] = node;
                            node.parent = this;
                            node.updateMatrixWorld();
                            this.fileNameList[i].dataIndex = n;
                            break;
                        }
                    }
                    //
                    if(this.fileNameList[i].dataIndex < 0) {
                        this.add(node);
                        node.updateMatrixWorld();
                        this.fileNameList[i].dataIndex = this.children.length - 1;
                        if(this.children.length > this.fileNameList.length) {
                            console.log("proxynode error");
                        }
                    }
                }
                //
                this.dataBasePager.parsedNodeCache.delete(this.fileNameList[i].fileName);
            }
            continue;
        }
        else if(this.fileNameList[i].dataIndex < 0){
            this.loadChild(this.fileNameList[i].fileName, context.numFrame);
        }
    }
    //
    let updatingChildren = [];
    let lookAt = context.lookAt ? context.lookAt : context.camera.matrixWorldInverse.getLookAt();
    for(let i=0, length = this.fileNameList.length; i<length; i++) {
        if (!this.fileNameList[i].visible || this.fileNameList[i].dataIndex < 0 || !this.children[this.fileNameList[i].dataIndex].parent)
            continue;
        //
        let child = this.children[this.fileNameList[i].dataIndex];
        let bs = child.getBoundingSphereWorld();
        updatingChildren[updatingChildren.length] = {child:child, disToEye:lookAt.eye.clone().sub(bs.center).lengthSq()};
        //this.children[i].update(context);
    }
    //
    updatingChildren.sort((a,b)=>{return a.disToEye - b.disToEye});
    for(let i=0, length = updatingChildren.length; i<length; ++i) {
        updatingChildren[i].child.update(context, visibleMesh);
    }
};

THREE.ProxyNode.prototype.removeUnExpected = function() {
    for(let i=0, length = this.children.length; i<length; ++i) {
        if(this.children[i].removeUnExpected) {
            this.children[i].removeUnExpected();
        }
        else if(this.children[i].removeUnExpectedChild) {
            this.children[i].removeUnExpectedChild(10);
        }
    }
};
