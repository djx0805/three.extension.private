/**
 * 扩展 three.js 中的 Box3 类，基础信息请参考 three.js 官方文档
 * @class Box3
 * @memberOf THREE
 */

/**
 * @methodOf THREE.Box3
 * @description 扩展此 Box3 对象包含另一个 Box3 对象
 * @param {THREE.Box3} box3 -用于扩展的 Box3 对象
 */
THREE.Box3.prototype.expandByBox3 = function(box3) {
    if(box3.valid()) {
        this.min.min( box3.min );
        this.max.max( box3.max );
    }
};


/**
 * @methodOf THREE.Box3
 * @description 扩展此 Box3 对象包含另一个 Sphere 对象
 * @param {THREE.Sphere} sh -用于扩展的 Sphere 对象
 */
THREE.Box3.prototype.expandBySphere = function(sh) {
    if(sh.center.x-sh.radius<this.min.x) this.min.x = sh.center.x-sh.radius;
    if(sh.center.x+sh.radius>this.max.x) this.max.x = sh.center.x+sh.radius;

    if(sh.center.y-sh.radius<this.min.y) this.min.y = sh.center.y-sh.radius;
    if(sh.center.y+sh.radius>this.max.y) this.max.y = sh.center.y+sh.radius;

    if(sh.center.z-sh.radius<this.min.z) this.min.z = sh.center.z-sh.radius;
    if(sh.center.z+sh.radius>this.max.z) this.max.z = sh.center.z+sh.radius;
};

/**
 * @methodOf THREE.Box3
 * 获取 Box3 对象某个角的坐标
 * @param {short} pos -索引，取值范围0~7
 * @returns {THREE.Vector3}
 */
THREE.Box3.prototype.corner = function(pos) {
    return THREE.Vector3(pos&1?this.max.x:this.min.x,pos&2?this.max.y:_min.y,pos&4?this.max.z:this.min.z);
}

/**
 * @methodOf THREE.Box3
 * @description 判断此 Box3 对象是否合法
 * @returns {boolean}
 */
THREE.Box3.prototype.valid = function () {
    if(this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z)
        return false;
    //
    return true;
}
