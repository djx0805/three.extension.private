/**
 * 扩展 three.js 中的 Object3D 类，基础信息请参考 three.js 官方文档
 * @class Object3D
 * @memberOf THREE
 */

/**
 * 重置 visible 和 frustumCulled 属性
 * @param {boolean} v
 * @param {boolean} cull
 */
THREE.Object3D.prototype.resetVisible = function (v, cull) {
    this.visible = v;
    if(cull !== undefined) {
        this.frustumCulled = cull ? true : false;
    }
    for(let n=0, length = this.children.length; n<length; ++n) {
        this.children[n].resetVisible(v, cull);
    }
};

/**
 * bounding sphere 模式，
 * SE_BOUNDING_SPHERE_CENTER 表示从此对象几何信息计算包围球，
 * USER_DEFINED_CENTER 表示直接指定包围球
 * @enum
 * @readonly
 * @type {{SE_BOUNDING_SPHERE_CENTER: number, USER_DEFINED_CENTER: number}}
 */
THREE.Object3D.CenterMode = {
    SE_BOUNDING_SPHERE_CENTER : 0,
    USER_DEFINED_CENTER : 1
};
/**
 * @type {number}
 */
THREE.Object3D.prototype.centerMode = THREE.Object3D.CenterMode.USE_BOUNDING_SPHERE_CENTER;
/**
 * @type {boolean}
 */
THREE.Object3D.prototype.boundingComputed = false;
/**
 * @type {boolean}
 */
THREE.Object3D.prototype.boundingWorldComputed = false;
/**
 * 模型坐标系下的 bounding sphere
 * @type {THREE.Sphere}
 */
THREE.Object3D.prototype.boundingSphere = null;
/**
 * 世界坐标系下的 bounding sphere
 * @type {THREE.Sphere}
 */
THREE.Object3D.prototype.boundingSphereWorld = null;
/**
 * 标记此对象包围球过期，下次获取包围球时需重新计算
 * @param {boolean} noticeParent -是否向父节点传递
 */
THREE.Object3D.prototype.dirtyBound = function(noticeParent = true) {
    if(!this.boundingComputed && !this.boundingWorldComputed)
        return;
    if(this.centerMode === THREE.Object3D.CenterMode.USER_DEFINED_CENTER) {
        this.boundingWorldComputed = false;
        if(noticeParent && this.parent)
            this.parent.dirtyBound(noticeParent);
        //
        return;
    }
    //
    this.boundingComputed = false;
    if(this.boundingSphere)
        this.boundingSphere.radius = -1;
    this.boundingWorldComputed = false;
    if(this.boundingSphereWorld)
        this.boundingSphereWorld.radius = -1;
    //
    if(noticeParent && this.parent)
        this.parent.dirtyBound(noticeParent);
};
/**
 * 添加子节点
 * @override
 * @param {THREE.Object3D} object
 * @param {boolean} [makeBoundingDirty=true]
 * @return {THREE.Object3D}
 */
THREE.Object3D.prototype.add = function ( object, makeBoundingDirty=true ) {
    if ( arguments.length > 2 ) {
        for ( var i = 0; i < arguments.length - 1; i ++ ) {
            this.add( arguments[ i ] );
        }
        if(makeBoundingDirty)
            this.dirtyBound();
        return this;
    }
    if ( object === this ) {
        console.error( "THREE.Object3D.add: object can't be added as a child of itself.", object );
        return this;
    }
    if ( ( object && object.isObject3D ) ) {
        if ( object.parent !== null ) {

            object.parent.remove( object );
        }
        object.parent = this;
        object.dispatchEvent( { type: 'added' } );
        this.children.push( object );
        if(makeBoundingDirty)
            this.dirtyBound();
    } else {
        console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );
    }
    return this;
};
/**
 * 删除子节点
 * @override
 * @param {THREE.Object3D} object
 * @param {boolean} [makeBoundingDirty=true]
 * @return {THREE.Object3D}
 */
THREE.Object3D.prototype.remove = function ( object, makeBoundingDirty = true ) {
    if ( arguments.length > 2 ) {
        for ( var i = 0; i < arguments.length-1; i ++ ) {
            this.remove( arguments[ i ] );
        }
        if(makeBoundingDirty)
            this.dirtyBound();
        return this;
    }
    var index = this.children.indexOf( object );
    if ( index !== - 1 ) {
        object.parent = null;
        object.dispatchEvent( { type: 'removed' } );
        this.children.splice( index, 1 );
        if(makeBoundingDirty)
            this.dirtyBound();
    }
    return this;
};
/**
 * 获取模型坐标系下的包围球
 * @return {THREE.Sphere}
 */
THREE.Object3D.prototype.getBoundingSphere = function () {
    if(this.centerMode === THREE.Object3D.CenterMode.USER_DEFINED_CENTER)
        return this.boundingSphere;
    //
    if(this.boundingComputed)
        return this.boundingSphere;
    //
    if(this.boundingSphere===null)
        this.boundingSphere = new THREE.Sphere();
    //
    for(let n=0, length = this.children.length; n<length; ++n) {
        let bs = this.children[n].getBoundingSphere().clone();
        //
        this.boundingSphere.expandBySphere(bs.applyMatrix4(this.matrix));
    }
    //
    if(this.geometry) {
        if(!this.geometry.boundingSphere) {
            this.geometry.computeBoundingSphere();
        }
        //
        if(this.geometry.boundingSphere)
            this.boundingSphereWorld.expandBySphere(this.geometry.boundingSphere.clone().applyMatrix4(this.matrix));
    }
    //
    this.boundingComputed = true;
    //
    return this.boundingSphere;
};
/**
 * 获取世界坐标系下的包围球
 * @return {THREE.Sphere}
 */
THREE.Object3D.prototype.getBoundingSphereWorld = function () {
    if(this.boundingWorldComputed) {
        return this.boundingSphereWorld;
    }
    //
    if(this.centerMode === THREE.Object3D.CenterMode.USER_DEFINED_CENTER) {
        this.boundingSphereWorld = this.boundingSphere.clone().applyMatrix4(this.matrixWorld);
        this.boundingWorldComputed = true;
        return this.boundingSphereWorld;
    }
    //
    if(!this.boundingSphereWorld)
        this.boundingSphereWorld = new THREE.Sphere();
    //
    for(let n=0, length = this.children.length; n<length; ++n) {
        let bsw = this.children[n].getBoundingSphereWorld();
        //
        this.boundingSphereWorld.expandBySphere(bsw);
    }
    //
    if(this.geometry) {
        if(!this.geometry.boundingSphere) {
            this.geometry.computeBoundingSphere();
        }
        //
        if(this.geometry.boundingSphere)
            this.boundingSphereWorld.expandBySphere(this.geometry.boundingSphere.clone().applyMatrix4(this.matrixWorld));
        else
            console.log("wrong geom");
    }
    //
    this.boundingWorldComputed = true;
    //
    return this.boundingSphereWorld;
};
/**
 * 获取模型坐标系下的包围盒
 * @return {THREE.Box3}
 */
THREE.Object3D.prototype.getBoundingBox = function () {
    let computeAABB = function (obj) {
        let aabb = new THREE.Box3();
        if(obj.children.length > 0) {
            for(let n=0, length = obj.children.length; n<length; ++n) {
                let aabb_ = computeAABB(obj.children[n]);
                //
                aabb.expandByBox3(aabb_);
            }
            //
            aabb.applyMatrix4(obj.matrix);
        }
        //
        if(obj.geometry !== undefined) {
            if(obj.boundingComputed && obj.geometry.boundingBox !== null) {
                aabb.expandByBox3(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrix));
            }
            else {
                obj.geometry.computeBoundingBox();
                aabb.expandByBox3(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrix));
            }
        }
        //
        return aabb;
    }
    //
    return computeAABB(this);
};
/**
 * 获取世界坐标系下的包围盒
 * @return {THREE.Box3}
 */
THREE.Object3D.prototype.getBoundingBoxWorld = function () {
    let computeAABB = function (obj) {
        let aabb = new THREE.Box3();
        //
        if(obj.children.length > 0) {
            for(let n=0, length = obj.children.length; n<length; ++n) {
                let aabb_ = computeAABB(obj.children[n]);
                //
                aabb.expandByBox3(aabb_);
            }
        }
        //
        if(obj.geometry !== undefined) {
            if(obj.boundingWorldComputed && obj.geometry.boundingBox !== null) {
                aabb.expandByBox3(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
            }
            else {
                obj.geometry.computeBoundingBox();
                aabb.expandByBox3(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
            }
        }
        //
        return aabb;
    }
    //
    return computeAABB(this);
};

THREE.Object3D.prototype.updateMatrixWorld = function (force) {
    if ( this.matrixAutoUpdate ) this.updateMatrix();

    if ( this.matrixWorldNeedsUpdate || force ) {
        if ( this.parent === null ) {

            this.matrixWorld.copy( this.matrix );

        } else {

            if(!THREE.Matrix4.multiplyMatricesCompare(this.parent.matrixWorld, this.matrix, this.matrixWorld)) {
                this.dirtyBound();
            }

        }
        this.matrixWorldNeedsUpdate = false;

        force = true;
    }

    // update children

    var children = this.children;

    for ( var i = 0, l = children.length; i < l; i ++ ) {

        children[ i ].updateMatrixWorld( force );

    }
};



