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
THREE.PagedLod.prototype.loadChild = function (url, frameNumber, level, disToEye, weight) {
    if(this.dataBasePager.loadRequest.length > 1000 && this._level_ > 6) {
        return;
    }
    this.dataBasePager.loadRequest[this.dataBasePager.loadRequest.length] = {url:url, frameNumber:frameNumber, level:level, disToEye:disToEye, weight};
    //return this.dataBasePager.load(url, frameNumber, false, weight);
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
                //
                this.levels[i].lastVisitFrame = 0;
            }

            for(; n<this.children.length;) {
                let canDispose = this.levels[n].url.length > 0 ? true : false;
                this.children[n].dispose(canDispose);
                if(canDispose) {
                    this.children[n] = null;
                    this.children.splice(n, 1);
                }
                else {
                    n++;
                }
            }
            //
            break;
        }
        else if(n < this.children.length && this.children[n].removeUnExpectedChild){
            this.children[n].removeUnExpectedChild(maxFrameCount);
        }
    }
};


/**
 * 分页数据更新函数，由渲染循环调用
 * @param {object} context -更新上下文参数
 */
THREE.PagedLod.prototype.update = function (context, visibleMesh) {
    if(this._level_) {
        context.currentLevel = this._level_;
    } else if(context.currentLevel !== undefined) {
        this._level_ = context.currentLevel++;
    }
    else {
        this._level_ = 0;
        context.currentLevel = 0;
    }
    //
    let camera = context.camera;
    let frustum = context.frustum;
    //
    const bs = this.getBoundingSphereWorld().clone();
    const disToEye = bs.valid() ? bs.center.clone().distanceTo(context.camera.position) : -1;
    //
    if(!bs.valid() || frustum.intersectsSphere(bs)) {
        this.frustumCulled = false;
        this.visible = true;
    }
    else {
        this.visible = false;
        for(let n = 0, length = this.levels.length; n<length; ++n) {
            this.levels[n].lastVisitFrame++;
        }
        return;
    }
    //check need load child;
    for(let n=0, length = this.children.length; n<length; n++) {
        this.children[n].visible = false;
    }
    //
    let dis = 0;
    let screenPixelSize = 0;
    let rangeMode = this.getRangeMode();
    if(rangeMode === THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT) {
        const v1 = new THREE.Vector3();
        const v2 = bs.center.clone();
        v1.setFromMatrixPosition( camera.matrixWorld );
        dis = v1.distanceTo( v2 );
        //
        screenPixelSize = Math.abs(bs.radius/(bs.center.dot(camera.pixelSizeVector) + camera.pixelSizeVector.w));
    }
    else if(rangeMode === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN) {
        dis = Math.abs(bs.radius/(bs.center.dot(camera.pixelSizeVector) + camera.pixelSizeVector.w));
        //
        dis*=this.dataBasePager.pageScaleFunc(context, this);
        screenPixelSize = dis;
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
                else if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING) {
                    afterFailed();
                    //
                    break;
                }
                else {
                    console.log("texture state error");
                    //
                    this.dataBasePager.parsedNodeCache.delete(this.levels[i].url);
                    afterFailed();
                    //
                    break;
                }
            }
            else {
                this.loadChild(this.levels[i].url, context.numFrame, this._level_, disToEye, screenPixelSize);
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
                    else if(textureState.state === THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING) {
                        afterFailed();
                        //
                        break;
                    }
                    else {
                        afterFailed();
                        break;
                    }
                }
                else {
                    this.loadChild(this.levels[i].url, context.numFrame, this._level_, disToEye, screenPixelSize);
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
            }
            //
            for(;i<this.levels.length; ++i) {
                this.levels[i].lastVisitFrame++;
            }
            //
            break;
        }
    }
    //
    if(targetLevel === lastValidLevel || (useLastValidLevel && lastValidLevel>=0)) {
        visibleObj=[{obj:this.children[lastValidLevel], level:lastValidLevel, needUpdate:false}];
    }
    //
    let checkChild = (visibleObj)=> {
        if(visibleObj.obj.visible)
            return;
        //
        const bs = visibleObj.obj.getBoundingSphereWorld().clone();
        //
        if(visibleObj.obj.update && visibleObj.needUpdate) {
            visibleObj.obj.visible = true;
            visibleObj.obj.frustumCulled = false;
            //
            child:visibleObj.obj.update(context, visibleMesh);
        }
        else {
            if(!bs.valid() || context.frustum.intersectsSphere(bs)) {
                visibleObj.obj.visible = true;
                visibleObj.obj.frustumCulled = false;
                //
                if(visibleMesh) {
                    visibleMesh[visibleMesh.length] = visibleObj.obj;
                }
            }
            else {
                visibleObj.obj.visible = false;
            }
        }
    }
    for(let n=0, length = visibleObj.length; ;) {
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
        if(n<length) {checkChild(visibleObj[n++])} else break;
    }
    //
    visibleObj = null;
};


/**
 * 清除函数
 */
THREE.PagedLod.prototype.dispose = function (canDispose) {
    for(let n=0, length = this.levels.length; n<length; ++n) {
        this.dataBasePager.loadedNodeCache.delete(this.levels[n].url);
        this.dataBasePager.loadingTextureCache.delete(this.levels[n].url);
        this.dataBasePager.parsedNodeCache.delete(this.levels[n].url);
    }
    //
    if(canDispose) {
        for(let n=0, length = this.children.length; n<length; n++) {
            this.children[n].dispose(true);
            this.children[n] = null;
        }
        //
        this.children = [];
    }
    else {
        let removable = [];
        for(let n=0, length = this.children.length; n<length; n++) {
            let canDispose = this.levels[n].url.length > 0 ? true : false;
            this.children[n].dispose(canDispose);
            if(canDispose) {
                removable[removable.length] = this.children[n];
            }
        }
        //
        for(let n=0, length = removable.length; n<length; ++n) {
            this.remove(removable[n]);
        }
        removable = null;
    }
};
