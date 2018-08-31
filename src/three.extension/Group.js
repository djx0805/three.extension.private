/**
 * 扩展 three.js 中的 Group 类，基础信息请参考 three.js 官方文档
 * @class Group
 * @memberOf THREE
 */

/**
 * 删除过期数据
 * @param {number} maxFrameCount -大于 maxFrameCount 帧未访问的数据为过期数据
 */
THREE.Group.prototype.removeUnExpectedChild = function (maxFrameCount) {
    for(let n=0, length = this.children.length; n<length; ++n) {
        if(this.children[n].removeUnExpectedChild) {
            this.children[n].removeUnExpectedChild(maxFrameCount);
        }
    }
};

/**
 * 更新函数，由渲染循环调用
 * @param {object} context -更新上下文参数
 */

THREE.Group.prototype.update = function () {
    let updateChild = (child, context, updatingChildren, visibleMesh) => {
        const bs = child.getBoundingSphereWorld().clone();
        //
        if(child.update) {
            child.visible = true;
            child.frustumCulled = false;
            //
            child.update(context, visibleMesh);
        }
        else {
            if(!bs.valid() || context.frustum.intersectsSphere(bs)) {
                child.visible = true;
                child.frustumCulled = false;
                //
                if(visibleMesh && (child.isMesh || child.isLine || child.isPoints)) {
                    visibleMesh[visibleMesh.length] = child;
                }
            }
            else {
                child.visible = false;
            }
        }
    };
    return function (context, visibleMesh) {
        this.visible = true;
        this.frustumCulled = false;
        //
        let updatingChildren = [];
        for(let n=0, length = this.children.length;;) {
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
            if(n<length) {updateChild(this.children[n++], context, updatingChildren, visibleMesh)} else  break;
        }
    };
}();

/**
 * 射线相交测试
 * @param {THREE.Raycaster} raycaster
 * @param {Array} intersects -输出参数，与射线相交的对象，按到射线起点的距离排序
 */
THREE.Group.prototype.raycast = function (raycaster, intersects) {
    for(let i=0, length = this.children.length; i<length; ++i) {
        if(this.children[i].visible) {
            this.children[i].raycast( raycaster, intersects );
        }
    }
};

