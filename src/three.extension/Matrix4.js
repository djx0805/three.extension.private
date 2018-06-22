/**
 * 扩展 three.js 中的 Matrix4 类，基础信息请参考 three.js 官方文档
 * @class Matrix4
 * @memberOf THREE
 */

/**
 * 旋转、缩放 给定向量v
 * @param {Matrix4} m
 * @param {THREE.Vector3} v
 * @return {THREE.Vector3}
 */
THREE.Matrix4.transform3x3 = function(m, v) {
    let ele = m.elements;
    return new THREE.Vector3( (ele[0]*v.x + ele[1]*v.y + ele[2]*v.z),
        (ele[4]*v.x + ele[5]*v.y + ele[6]*v.z),
        (ele[8]*v.x + ele[9]*v.y + ele[10]*v.z) ) ;
};
/**
 * a 乘 b 的结果赋值给 res，并将结果与原 res 比较，相等返回 true，否则返回 false
 * @param {Matrix4} a
 * @param {Matrix4} b
 * @param {Matrix4} res
 * @return {boolean}
 */
THREE.Matrix4.multiplyMatricesCompare = function (a, b, res) {
    let ae = a.elements;
    let be = b.elements;

    let te = res.elements;
    let oldTe = [te[0], te[1], te[2], te[3],
        te[4], te[5], te[6], te[7],
        te[8], te[9], te[10], te[11],
        te[12], te[13], te[14], te[15]];

    let a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
    let a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
    let a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
    let a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

    let b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
    let b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
    let b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
    let b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

    te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    //
    if(te[0] !== oldTe[0] || te[1] !== oldTe[1] || te[2] !== oldTe[2] || te[3] !== oldTe[3] ||
        te[4] !== oldTe[4] || te[5] !== oldTe[5] || te[6] !== oldTe[6] || te[7] !== oldTe[7] ||
        te[8] !== oldTe[8] || te[9] !== oldTe[9] || te[10] !== oldTe[10] || te[11] !== oldTe[11] ||
        te[12] !== oldTe[12] || te[13] !== oldTe[13] || te[14] !== oldTe[14] || te[15] !== oldTe[15]) {
        return false;
    }
    //
    return true;
}

THREE.Matrix4.prototype.preMultTranslate = function(t)
{
    let v = [t.x, t.y, t.z];
    for (let i = 0; i < 3; ++i)
    {
        let tmp = v[i];
        if (tmp == 0)
            continue;
        this.elements[12] += tmp*this.elements[i*4];
        this.elements[13] += tmp*this.elements[i*4+1];
        this.elements[14] += tmp*this.elements[i*4+2];
        this.elements[15] += tmp*this.elements[i*4+3];
    }
    return this;
};
/**
 * @param {THREE.Vector3} eye
 * @param {THREE.Vector3} center
 * @param {THREE.Vector3} up
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.makeLookAt = function(eye,center,up)
{
    let f = center.clone().sub(eye);
    f.normalize();
    let s = f.clone().cross(up);
    s.normalize();
    let u = s.clone().cross(f);
    u.normalize();

    //
    var te = this.elements;
    te[0] = s.x;   te[1] = u.x;    te[2] = -f.x;    te[3] = 0.0;
    te[4] = s.y;     te[5] = u.y;     te[6] = -f.y;    te[7] = 0.0;
    te[8] = s.z;     te[9] = u.z;    te[10] = -f.z;  te[11] = 0.0;
    te[12] = 0;    te[13] = 0;    te[14] = 0;      te[15] = 1.0;
    //
    this.preMultTranslate(new THREE.Vector3(-eye.x,-eye.y,-eye.z));
    //
    return this;
};
/**
 * @return {{eye: THREE.Vector3, lookDirection: THREE.Vector3, up: THREE.Vector3}}
 */
THREE.Matrix4.prototype.getLookAt = function() {
    let inv = new THREE.Matrix4();
    inv.getInverse(this);

    let e = new THREE.Vector3(0,0,0);
    e.applyMatrix4(inv);
    let u = THREE.Matrix4.transform3x3(this,new THREE.Vector3(0.0,1.0,0.0));
    u.normalize();
    let c = THREE.Matrix4.transform3x3(this,new THREE.Vector3(0.0,0.0,-1));
    c.normalize();

    return {eye: e, lookDirection: c, up: u};
};
/**
 * @return {{left:number, right:number, top:number, bottom:number, zNear:number, zFar:number}}
 */
THREE.Matrix4.prototype.getOrtho = function () {
    if (this.elements[3]!=0.0 || this.elements[7]!=0.0 || this.elements[11]!=0.0 || this.elements[15]!=1.0)
        return null;

    let zNear = (this.elements[14]+1.0) / this.elements[10];
    let zFar = (this.elements[14]-1.0) / this.elements[10];

    let left = -(1.0+this.elements[12]) / this.elements[0];
    let right = (1.0-this.elements[12]) / this.elements[0];

    let bottom = -(1.0+this.elements[13]) / this.elements[5];
    let top = (1.0-this.elements[13]) / this.elements[5];
    //
    return {left:left, right:right, top:top, bottom:bottom, zNear:zNear, zFar:zFar};
}
/**
 * @return {{left:number, right:number, top:number, bottom:number, zNear:number, zFar:number}}
 */
THREE.Matrix4.prototype.getFrustum = function () {
    if (this.elements[3]!==0.0 || this.elements[7]!==0.0 || this.elements[11]!==-1.0 || this.elements[15]!==0.0)
        return null;

    // note: near and far must be used inside this method instead of zNear and zFar
    // because zNear and zFar are references and they may point to the same variable.
    let temp_near = this.elements[14] / (this.elements[10]-1.0);
    let temp_far = this.elements[14] / (1.0+this.elements[10]);

    let left = temp_near * (this.elements[8]-1.0) / this.elements[0];
    let right = temp_near * (1.0+this.elements[8]) / this.elements[0];

    let top = temp_near * (1.0+this.elements[9]) / this.elements[5];
    let bottom = temp_near * (this.elements[9]-1.0) / this.elements[5];

    let zNear = temp_near;
    let zFar = temp_far;

    return {left:left, right:right, top:top, bottom:bottom, zNear:zNear, zFar:zFar};
};
/**
 * @param {number} left
 * @param {number} right
 * @param {number} top
 * @param {number} bottom
 * @param {number} near
 * @param {number} far
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.makeFrustum = function( left, right, top, bottom, near, far ) {
    if ( far === undefined ) {
        console.warn( 'THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.' );
    }

    var te = this.elements;
    var x = 2 * near / ( right - left );
    var y = 2 * near / ( top - bottom );

    var a = ( right + left ) / ( right - left );
    var b = ( top + bottom ) / ( top - bottom );
    var c = - ( far + near ) / ( far - near );
    var d = - 2 * far * near / ( far - near );

    te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
    te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

    return this;
};
/**
 * 参数为（left, right, top, bottom, near, far） 或 （fovy, aspectRatio, zNear, zFar）
 * @return {THREE.Matrix4}
 */
THREE.Matrix4.prototype.makePerspective = function () {
    if(arguments.length === 6) {
        return this.makeFrustum(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);
    }
    else if(arguments.length === 4) {
        let fovy = arguments[0],aspectRatio = arguments[1],
            zNear = arguments[2], zFar = arguments[3];
        let tan_fovy = Math.tan(THREE.Math.degToRad(fovy*0.5));
        let right  =  tan_fovy * aspectRatio * zNear;
        let left   = -right;
        let top    =  tan_fovy * zNear;
        let bottom =  -top;
        this.makeFrustum(left,right,top,bottom,zNear,zFar);
    }
};
/**
 * @return {{fovy:number, aspectRatio:number, zNear:number, zFar:number}}
 */
THREE.Matrix4.prototype.getPerspective = function () {
    let frustum = this.getFrustum();
    if (frustum)
    {
        let fovy = THREE.Math.radToDeg(Math.atan(frustum.top/frustum.zNear)-Math.atan(frustum.bottom/frustum.zNear));
        let aspectRatio = (frustum.right-frustum.left)/(frustum.top-frustum.bottom);
        return {fovy:fovy, aspectRatio:aspectRatio, zNear:frustum.zNear, zFar:frustum.zFar};
    }
    return null;
}

