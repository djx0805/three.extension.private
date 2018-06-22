/**
 * 扩展 three.js 中的 Sphere 类，基础信息请参考 three.js 官方文档
 * @class Sphere
 * @memberOf THREE
 */

/**
 * 判断此对象是否有效(center={0,0,0} && radius=0 或 radius<0 都被认为是无效对象)
 * @return {boolean}
 */
THREE.Sphere.prototype.valid = function () {
    if((this.center.x === 0 && this.center.y === 0 && this.center.z === 0 && this.radius === 0) || this.radius < 0)
        return false;
    //
    return true;
}

THREE.Sphere.prototype.applyMatrix4 = function (matrix) {
    if(!this.valid())
        return this;
    let pt = this.center.clone();
    pt.add(new THREE.Vector3(this.radius,0,0));
    this.center.applyMatrix4( matrix );
    pt.applyMatrix4(matrix);
    this.radius = pt.sub(this.center).length();

    return this;
};
/**
 * 扩展此对象半径包含另一个 sphere
 * @param {THREE.Sphere} sp
 */
THREE.Sphere.prototype.expandRadiusBySphere = function (sp) {
    if(this.valid()) {
        let r_ = (this.center.clone().sub(sp.center)).length() + sp.radius;
        if(r_ > this.radius)
            this.radius = r_;
    }
};
/**
 * 扩展此对象包含另一个 sphere
 * @param {THREE.Sphere} sp
 */
THREE.Sphere.prototype.expandBySphere = function (sp) {
    if(sp.valid()) {
        if(this.valid()) {
            // Calculate d == The distance between the sphere centers
            let d = this.center.clone().sub(sp.center).length();

            // New sphere is already inside this one
            if ( d + sp.radius <= this.radius )
            {
                return;
            }

            //  New sphere completely contains this one
            if ( d + this.radius <= sp.radius )
            {
                this.center = sp.center.clone();
                this.radius = sp.radius;
                return;
            }

            // Build a new sphere that completely contains the other two:
            //
            // The center point lies halfway along the line between the furthest
            // points on the edges of the two spheres.
            //
            // Computing those two points is ugly - so we'll use similar triangles
            let new_radius = (this.radius + d + sp.radius ) * 0.5;
            let ratio = ( new_radius - this.radius ) / d ;

            this.center.x += ( sp.center.x - this.center.x ) * ratio;
            this.center.y += ( sp.center.y - this.center.y ) * ratio;
            this.center.z += ( sp.center.z - this.center.z ) * ratio;

            this.radius = new_radius;
        }
        else {
            this.center = sp.center.clone();
            this.radius = sp.radius;
        }
    }
}
