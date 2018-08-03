/**
 * @classdesc 可分页的 LOD
 * @class
 * @extends THREE.LOD
 * @param {DataBasePager} [dataBasePager] -指定分页管理器
 */
THREE.PagedLod = function (dataBasePager) {
    THREE.LOD.call(this);

    this.type = 'PagedLod';
    this.isPagedLod = true;

    /**
     * 用于设置层次数据的回掉函数
     * @type {function}
     */
    this.setLevelDataCallBack = null;
    /**
     * 分页管理器
     * @type {THREE.DataBasePager}
     */
    this.dataBasePager = dataBasePager ? dataBasePager : new THREE.DataBasePager(true);
};
THREE.PagedLod.prototype = Object.assign( Object.create( THREE.LOD.prototype ), {
    constructor: THREE.PagedLod,
});


/**
 * 添加层次数据
 * @param {string} url
 * @param {number} min -最小 可视距离/屏幕像素大小
 * @param {number} max -最大 可视距离/屏幕像素大小
 */
THREE.PagedLod.prototype.addLevel = function ( url, min, max ) {
    this.levels.push({url: url, sps: [min, max], lastVisitFrame: 0});
};

/**
 * 请求数据
 * @param {string} url
 * @returns {boolean}
 */
THREE.PagedLod.prototype.loadChild = function (url, frameNumber, weight) {
    return this.dataBasePager.load(url, frameNumber, false, weight);
};

/**
 * 删除过期数据
 * @param {number} maxFrameCount -大于 maxFrameCount 帧未访问的数据为过期数据
 */
THREE.PagedLod.prototype.removeUnExpectedChild = function (maxFrameCount) {
    for(let n=0, length = this.levels.length; n<length; ++n) {
        if(this.levels[n].lastVisitFrame >= maxFrameCount) {
            for(let i=n; i<length; ++i) {
                this.dataBasePager.loadedNodeCache.delete(this.levels[i].url);
                this.dataBasePager.loadingTextureCache.delete(this.levels[i].url);
                this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
            }
            for(; n<this.children.length;) {
                this.children[n].dispose();
                this.children[n] = null;
                this.children.splice(n, 1);
            }
            //
            break;
        }
        else if(n < this.children.length){
            if(this.children[n].removeUnExpectedChild)
                this.children[n].removeUnExpectedChild(maxFrameCount);
        }
    }
};


/**
 * 分页数据更新函数，由渲染循环调用
 * @param {object} context -更新上下文参数
 */
THREE.PagedLod.prototype.update = function (context, visibleMesh) {
    let camera = context.camera;
    let frustum = context.frustum;
    //
    const bs = this.getBoundingSphereWorld().clone();
    if(!bs.valid() || frustum.intersectsSphere(bs)) {
        this.frustumCulled = false;
        this.visible = true;
    }
    else {
        this.visible = false;
        for(let n = 0, length = this.levels.length; n<length; ++n) {
            if(this.levels[n].url.length > 0) {
                this.levels[n].lastVisitFrame++;
            }
        }
        return;
    }
    //check need load child;
    for(let n=0, length = this.children.length; n<length; n++) {
        this.children[n].visible = false;
    }
    //
    let dis = 0;
    let rangeMode = this.getRangeMode();
    if(rangeMode === THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT) {
        const v1 = new THREE.Vector3();
        const v2 = bs.center.clone();
        v1.setFromMatrixPosition( camera.matrixWorld );
        dis = v1.distanceTo( v2 );
    }
    else if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN) {
        dis = Math.abs(bs.radius/(bs.center.dot(camera.pixelSizeVector) + camera.pixelSizeVector.w));
        //
        dis*=this.dataBasePager.pageScaleFunc(context, this);
    }
    //
    let visibleObj = [];
    let targetLevel = 0;
    let lastValidLevel = -1;
    let useLastValidLevel = false;
    for(let i=0, length = this.levels.length; i< length; targetLevel = i, i++) {
        if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN ? dis > this.levels[i].sps[1] : dis <= this.levels[i].sps[0]) {
            this.levels[i].lastVisitFrame = 0;
            //
            if(i<this.children.length) {
                lastValidLevel = i;
                continue;
            }
            //
            if(this.dataBasePager.loadedNodeCache.has(this.levels[i].url)) {
                let loadedNode = this.dataBasePager.loadedNodeCache.get(this.levels[i].url);
                if(loadedNode.isPlaceholder) {

                }
                else {
                    let parsedNode = this.dataBasePager.proxyParse(loadedNode);
                    this.dataBasePager.loadedNodeCache.delete(this.levels[i].url);
                    this.dataBasePager.parsedNodeCache.set(this.levels[i].url, parsedNode.children[0]);
                }
                //
                if (i > 0) {
                    visibleObj[visibleObj.length] = {obj: this.children[i - 1], level: i - 1, needUpdate: false};
                }
                //
                break;
            }
            else if(this.dataBasePager.parsedNodeCache.has(this.levels[i].url)) {
                let afterFailed = ()=> {
                    if(i>0) {
                        visibleObj[visibleObj.length] = {obj:this.children[i-1], level:i - 1, needUpdate:false};
                    }
                };
                let afterSucceed = ()=> {
                    this.children[i].parent = this;
                    this.children[i].updateMatrixWorld();
                    this.children[i].visible = false;
                    lastValidLevel = i;
                };
                let textureState = this.dataBasePager.checkCacheReady(this.levels[i].url, context.onTextureLoadFailed);
                if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_READY) {
                    let parsedNode = this.dataBasePager.parsedNodeCache.get(this.levels[i].url);
                    this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
                    //
                    if(this.setLevelDataCallBack) {
                        if(this.setLevelDataCallBack(i, parsedNode)) {
                            afterSucceed();
                            this.dataBasePager.dispatchEvent({type:'detachNodeToScene', url : this.levels[i].url, node : parsedNode});
                            continue;
                        }
                        else {
                            console.log("error paresed data");
                            afterFailed();
                            //
                            break;
                        }
                    } else {
                        if(parsedNode.isObject3D) {
                            this.children[i] = parsedNode;
                            if(this.children[i].parent)
                                this.children[i].parent.remove(this.children[i]);
                            //
                            afterSucceed();
                            //
                            this.dataBasePager.dispatchEvent({type:'detachNodeToScene', url : this.levels[i].url, node : parsedNode});
                            //
                            continue;
                        }
                        else {
                            console.log("error paresed data");
                            afterFailed();
                            //
                            break;
                        }
                    }
                }
                else if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_FAILED) {
                    this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
                    afterFailed();
                    break;
                }
                else {
                    afterFailed();
                    //
                    break;
                }
            }
            else {
                this.loadChild(this.levels[i].url, context.numFrame, dis);
                //
                if(i>0) {
                    if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN ? this.levels[i].sps[0] >= this.levels[i - 1].sps[1] : this.levels[i].sps[1] <= this.levels[i - 1].sps[0]) {
                        visibleObj[visibleObj.length] = {obj:this.children[i-1], level:i- 1, needUpdate:false};
                    }
                    else
                        useLastValidLevel = true;
                }
                //
                break;
            }
        }
        else if(dis>=this.levels[i].sps[0] && dis<=this.levels[i].sps[1]) {
            this.levels[i].lastVisitFrame = 0;
            //
            if(i>=this.children.length) {
                if(this.dataBasePager.loadedNodeCache.has(this.levels[i].url)) {
                    let loadedNode = this.dataBasePager.loadedNodeCache.get(this.levels[i].url);
                    if(loadedNode.isPlaceholder) {

                    }
                    else {
                        let parsedNode = this.dataBasePager.proxyParse(loadedNode);
                        this.dataBasePager.loadedNodeCache.delete(this.levels[i].url);
                        this.dataBasePager.parsedNodeCache.set(this.levels[i].url, parsedNode.children[0]);
                    }
                    //
                    if(i>0) {
                        if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN ? this.levels[i].sps[0] >= this.levels[i - 1].sps[1] : this.levels[i].sps[1] <= this.levels[i - 1].sps[0]) {
                            visibleObj[visibleObj.length] = {obj:this.children[i-1], level:i- 1, needUpdate:false};
                        }
                        else
                            useLastValidLevel = true;
                    }
                    break;
                }
                else if(this.dataBasePager.parsedNodeCache.has(this.levels[i].url)) {
                    let afterFailed = ()=> {
                        if(i>0) {
                            if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN ? this.levels[i].sps[0] >= this.levels[i - 1].sps[1] : this.levels[i].sps[1] <= this.levels[i - 1].sps[0]) {
                                visibleObj[visibleObj.length] = {obj:this.children[i-1], level:i- 1, needUpdate:false};
                            }
                            else
                                useLastValidLevel = true;
                        }
                    };
                    let afterSucceed = ()=> {
                        this.children[i].parent = this;
                        this.children[i].updateMatrixWorld();
                        this.children[i].visible = false;
                        //
                        visibleObj[visibleObj.length] = {obj:this.children[i], level:i, needUpdate:false};
                    };
                    let textureState = this.dataBasePager.checkCacheReady(this.levels[i].url, context.onTextureLoadFailed);
                    if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_READY) {
                        let parsedNode = this.dataBasePager.parsedNodeCache.get(this.levels[i].url);
                        this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
                        //
                        if(this.setLevelDataCallBack) {
                            if(this.setLevelDataCallBack(i, parsedNode)) {
                                afterSucceed();
                                this.dataBasePager.dispatchEvent({type:'detachNodeToScene', url : this.levels[i].url, node : parsedNode});
                            }
                            else {
                                afterFailed();
                                break;
                            }
                        }
                        else {
                            if(parsedNode.isObject3D) {
                                this.children[i] = parsedNode;
                                if(this.children[i].parent)
                                    this.children[i].parent.remove(this.children[i]);
                                //
                                afterSucceed();
                                //
                                this.dataBasePager.dispatchEvent({type:'detachNodeToScene', url : this.levels[i].url, node : parsedNode});
                            }
                            else {
                                console.log("error paresed data");
                                afterFailed();
                                break;
                            }
                        }
                    }
                    else if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_FAILED) {
                        this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
                        afterFailed();
                        break;
                    }
                    else {
                        afterFailed();
                        break;
                    }
                }
                else {
                    this.loadChild(this.levels[i].url, context.numFrame, dis);
                    //
                    if(i>0) {
                        if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN ? this.levels[i].sps[0] >= this.levels[i - 1].sps[1] : this.levels[i].sps[1] <= this.levels[i - 1].sps[0]) {
                            visibleObj[visibleObj.length] = {obj:this.children[i-1], level:i- 1, needUpdate:false};
                        }
                        else
                            useLastValidLevel = true;
                    }
                    //
                    break;
                }
            }
            else {
                visibleObj[visibleObj.length] = {obj:this.children[i], level:i, needUpdate:true};
                //lastValidLevel = -1;
            }
        }
        else {
            if(i === 0) {
                this.visible = false;
                return;
            }
            break;
        }
    }
    //
    if(targetLevel === lastValidLevel || (useLastValidLevel && lastValidLevel>=0)) {
        visibleObj=[{obj:this.children[lastValidLevel], level:lastValidLevel, needUpdate:false}];
    }
    //
    for(let n=targetLevel + 1, length = this.levels.length; n<length; ++n) {
        this.levels[n].lastVisitFrame++;
    }
    //
    let lookAt = context.lookAt ? context.lookAt : camera.matrixWorldInverse.getLookAt();
    let updatingChildren = [];
    //
    for(let n=0, length = visibleObj.length; n<length; ++n) {
        if(visibleObj[n].obj.visible)
            continue;
        //
        if(visibleObj[n].obj.isPagedLod){
            let bs = visibleObj[n].obj.getBoundingSphereWorld();
            if(frustum.intersectsSphere(bs)) {
                visibleObj[n].obj.visible = true;
                visibleObj[n].obj.frustumCulled = false;
                //
                if(visibleObj[n].needUpdate) {
                    updatingChildren[updatingChildren.length] = {child:visibleObj[n].obj, disToEye:lookAt.eye.clone().sub(bs.center).lengthSq()};
                    //visibleObj[n].obj.update(context, visibleMesh);
                }
                else {
                    if(visibleMesh) {
                        visibleMesh[visibleMesh.length] = visibleObj[n].obj;
                    }
                }
            }
            else {
                visibleObj[n].obj.visible = false;
            }
        }
        else if(visibleObj[n].obj.isGroup){
            let bs = visibleObj[n].obj.getBoundingSphereWorld();
            if(!bs.valid() || frustum.intersectsSphere(bs)) {
                visibleObj[n].obj.visible = true;
                visibleObj[n].obj.frustumCulled = false;
                //
                if(visibleObj[n].needUpdate) {
                    updatingChildren[updatingChildren.length] = {child:visibleObj[n].obj, disToEye:lookAt.eye.clone().sub(bs.center).lengthSq()};
                    //visibleObj[n].obj.update(context, visibleMesh);
                }
                else {
                    if(visibleMesh) {
                        visibleMesh[visibleMesh.length] = visibleObj[n].obj;
                    }
                }
            }
            else {
                visibleObj[n].obj.visible = false;
            }
        }
        else if(visibleObj[n].obj.isMesh){
            visibleObj[n].obj.visible = true;
            visibleObj[n].obj.frustumCulled = false;
            //
            if(visibleMesh) {
                visibleMesh[visibleMesh.length] = visibleObj[n].obj;
            }
        }
    }
    //
    updatingChildren.sort((a,b)=>{return a.disToEye - b.disToEye});
    for(let n=0, length = updatingChildren.length; n<length; ++n) {
        updatingChildren[n].child.update(context, visibleMesh);
    }
    //
    visibleObj = null;
};


/**
 * 清除函数
 */
THREE.PagedLod.prototype.dispose = function () {
    for(let n=0, length = this.levels.length; n<length; ++n) {
        this.dataBasePager.loadedNodeCache.delete(this.levels[n].url);
        this.dataBasePager.loadingTextureCache.delete(this.levels[n].url);
        this.dataBasePager.parsedNodeCache.delete(this.levels[n].url);
    }
    for(let n=0, length = this.children.length; n<length; n++) {
        this.children[n].dispose();
        this.children[n] = null;
    }
    this.children = [];
};
