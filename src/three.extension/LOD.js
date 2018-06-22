/**
 * 扩展 three.js 中的 LOD 类以支持屏幕像素模式，基础信息请参考 three.js 官方文档
 * @class LOD
 * @memberOf THREE
 */

/**
 * @enum
 * @memberOf LOD
 * @type {{DISTANCE_FROM_EYE_POINT: number, PIXEL_SIZE_ON_SCREEN: number}}
 */
THREE.LOD.RangeMode = {
    DISTANCE_FROM_EYE_POINT:0,
    PIXEL_SIZE_ON_SCREEN:1
};

/**
 * 获取范围模式
 * @returns {RangeMode}
 */
THREE.LOD.prototype.getRangeMode = function () {
    if(!this.rangeMode)
        this.rangeMode = THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT;
    return this.rangeMode;
};

/**
 * 设置范围模式
 * @param {RangeMode} rm
 */
THREE.LOD.prototype.setRangeMode = function (rm) {
    this.rangeMode = rm;
};

/**
 * 添加细节层次
 * @param {THREE.Object3D} object
 * @param {Array} [range] -不定参数，表示此对象所处的细节层次。为空表示 0~正无穷；一个参数表示 上一个细节的最大值~range; 两个参数则分别为此范围的最小值与最大值
 *
 */
THREE.LOD.prototype.addLevel = function (object, ...range) {
    let addLevelByOrder = (object, dis)=> {
        dis = Math.abs( dis );
        let levels = this.levels;
        let l = 0;
        for (let length = levels.length; l < length; l ++ ) {
            if ( dis < levels[ l ].distance[1] ) {
                break;
            }
        }
        let r_min = 0;
        if(levels.length > 0) {
            r_min = levels[levels.length-1].distance[1];
        }
        levels.splice( l, 0, { distance: [r_min, dis], object: object } );
        this.add( object );
        //
        ++l;
        if(l < levels.length) {
            levels[l].distance[0] = dis;
        }
    };
    //
    let addLevelByRange = (object, min, max) => {
        this.levels.push({distance: [min, max], object: object});
        this.add(object);
    };
    //
    if(range.length === 0) {
        addLevelByRange(object, 0, 100000);
    }
    if(range.length === 1) {
        addLevelByOrder(object, range[0]);
    }
    else if(range.length === 2) {
        addLevelByRange(object, range[0], range[1]);
    }
};

/**
 * 获取与 distance 匹配的细节层次所对应的对象
 * @param {number} distance
 * @return {THREE.Object3D}
 */
THREE.LOD.prototype.getObjectForDistance = function(distance) {
    var levels = this.levels;
    for ( var i = 0, length = levels.length, l = length; i < l; i ++ ) {
        if ( distance >= levels[ i ].distance[0] && distance < levels[i].distance[1]) {
            break;
        }
    }
    return levels[i].object;
};

/**
 * 参考 Group 对象
 * @param raycaster
 * @param intersects
 */
THREE.LOD.prototype.raycast = function (raycaster, intersects) {
    for(let i=0, length = this.children.length; i<length; ++i) {
        if(this.children[i].visible) {
            this.children[i].raycast( raycaster, intersects );
        }
    }
};

/**
 * 更新函数
 */
THREE.LOD.prototype.update = function () {
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();

    return function update( context) {

        var levels = this.levels;

        if(this.getRangeMode() === THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT) {
            if ( levels.length > 1 ) {

                v1.setFromMatrixPosition( context.camera.matrixWorld );
                v2.setFromMatrixPosition( this.matrixWorld );

                var distance = v1.distanceTo( v2 );

                for(let i=0, length = levels.length; i<length; ++i) {
                    levels[i].object.visible = false;
                    //
                    if(distance >= levels[ i ].distance[0] && distance < levels[i].distance[1]) {
                        levels[i].object.visible = true;
                        if (levels[i].object.update) {
                            levels[i].object.update(context);
                        }
                    }
                }
            }
        }
        else if(this.getRangeMode() === THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN){
            let bs = this.getBoundingSphere();
            let ss = Math.abs(bs.radius/(bs.center.dot(context.camera.pixelSizeVector) + context.camera.pixelSizeVector.w));
            for(let i=0, length = levels.length; i<length; ++i) {
                levels[i].object.visible = false;
                //
                if(ss >= levels[ i ].distance[0] && ss < levels[i].distance[1]) {
                    levels[i].object.visible = true;
                }
            }
        }
    };
}();
