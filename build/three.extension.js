(function () {
	'use strict';

	THREE.computePixelSizeVector = function (width, height, pM, vM) {
	    // pre adjust P00,P20,P23,P33 by multiplying them by the viewport window matrix.
	    // here we do it in short hand with the knowledge of how the window matrix is formed
	    // note P23,P33 are multiplied by an implicit 1 which would come from the window matrix.
	    // Robert Osfield, June 2002.

	    // scaling for horizontal pixels
	    let p00 = pM.elements[0]*width*0.5;
	    let p20_00 = pM.elements[8]*width*0.5+pM.elements[11]*width*0.5;
	    let scale_00 = new THREE.Vector3(vM.elements[0]*p00 + vM.elements[2]*p20_00,
	        vM.elements[4]*p00+vM.elements[6]*p20_00,
	        vM.elements[8]*p00+vM.elements[10]*p20_00);

	    // scaling for vertical pixels
	    let p10 = pM.elements[5]*height*0.5;
	    let p20_10 = pM.elements[9]*height*0.5 + pM.elements[11].height*0.5;
	    let scale_10 = new THREE.Vector3(vM.elements[1]*p10 + vM.elements[2]*p20_10,
	        vM.elements[5]*p10 + vM.elements[6]*p20_10,
	        vM.elements[9]*p10 + vM.elements[10]*p20_10);

	    let p23 = pM.elements[11];
	    let p33 = pM.elements[15];

	    var pixelSizeVector = new THREE.Vector4(vM.elements[2]*p23,
	        vM.elements[6]*p23,
	        vM.elements[10]*p23,
	        vM.elements[14]*p23 + vM.elements[15]*p33);

	    let scaleRatio = 0.7071067811/Math.sqrt(scale_00.lengthSq() + scale_10.lengthSq());
	    pixelSizeVector.multiplyScalar(scaleRatio);

	    return pixelSizeVector;
	};

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
	};

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
	};
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
	};

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
	};

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
	};

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
	};

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
	};

	THREE.Material.prototype.stencilTest = false;

	/**
	 * 扩展 three.js 中的 Texture 类，基础信息请参考 three.js 官方文档
	 * @class Texture
	 * @memberOf THREE
	 */

	THREE.Texture.prototype.loadState = 0;
	/**
	 * 引用计数，在纹理被多个 material 使用时使用
	 * @type {number}
	 */
	THREE.Texture.prototype.nReference = 0;
	THREE.Texture.loadings = new Map();
	THREE.Texture.onTextureLoaded = function (texture) {
	    texture.image.loaded = true;
	    THREE.Texture.loadings.delete(texture.image.src);
	};
	THREE.Texture.onTextureLoadFailed = function (event) {
	    let tmp = THREE.Texture.loadings.get(event.target.src);
	    if(tmp) {
	        tmp.image = {failedLoad: true};
	        THREE.Texture.loadings.delete(event.target.src);
	    }
	};



	THREE.TextureLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {
	    var texture = new THREE.Texture();
	    THREE.Texture.loadings.set(url, texture);

	    var loader = new THREE.ImageLoader( this.manager );
	    loader.setCrossOrigin( this.crossOrigin );
	    loader.setPath( this.path );

	    loader.load( url, function ( image ) {

	        texture.image = image;

	        // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
	        var isJPEG = url.search( /\.(jpg|jpeg)$/ ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

	        texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
	        texture.needsUpdate = true;

	        if ( onLoad !== undefined ) {

	            onLoad( texture );

	        }

	    }, onProgress, onError );

	    return texture;
	};

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
	    };
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
	    };
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

	/**
	 * 释放函数
	 */
	THREE.Object3D.prototype.dispose = function (gpuRelease = true, memRelease = true) {
	    for(let n=0, length = this.children.length; n<length; n++) {
	        this.children[n].dispose(gpuRelease, memRelease);
	        if(memRelease)
	            this.children[n] = null;
	    }
	    if(memRelease)
	        this.children = [];
	};

	THREE.OrthographicCamera.prototype.pixelSizeVector = new THREE.Vector4();
	THREE.OrthographicCamera.prototype.atuoCalculateNearFar = false;

	THREE.PerspectiveCamera.prototype.pixelSizeVector = new THREE.Vector4();
	THREE.PerspectiveCamera.prototype.atuoCalculateNearFar = false;

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
	THREE.Group.prototype.update = function (context, visibleMesh) {
	    this.visible = true;
	    let updatingChildren = [];
	    let lookAt = context.lookAt ? context.lookAt : context.camera.matrixWorldInverse.getLookAt();
	    for(let n=0, length = this.children.length; n<length; n++) {
	        const bs = this.children[n].getBoundingSphereWorld();
	        if(!bs.valid() || context.frustum.intersectsSphere(bs)) {
	            this.children[n].visible = true;
	            this.children[n].frustumCulled = false;
	            //
	            if(visibleMesh && (this.children[n].isMesh || this.children[n].isLine || this.children[n].isPoints)) {
	                visibleMesh[visibleMesh.length] = this.children[n];
	            }
	        }
	        else {
	            this.children[n].visible = false;
	        }
	        //
	        if(this.children[n].update) {
	            if(!bs.valid() || !context.dataBasePager || !context.dataBasePager.cullGroup || context.frustum.intersectsSphere(bs)) {
	                updatingChildren[updatingChildren.length] = {child:this.children[n], disToEye:lookAt.eye.clone().sub(bs.center).lengthSq()};
	            }
	            //this.children[n].update(context, visibleMesh);
	        }
	    }
	    //
	    updatingChildren.sort((a,b)=> {return a.disToEye - b.disToEye});
	    for(let n=0, length = updatingChildren.length; n<length; ++n) {
	        updatingChildren[n].child.update(context, visibleMesh);
	    }
	};

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

	/**
	 * 扩展 three.js 中的 Mesh 类，基础信息请参考 three.js 官方文档
	 * @class Mesh
	 * @memberOf THREE
	 */

	/**
	 * 释放函数
	 */
	THREE.Mesh.prototype.dispose =  function(gpuRelease = true, memRelease = true) {
	    if(this.geometry) {
	        this.geometry.dispose();
	        if(memRelease)
	          this.geometry = null;
	    }
	    //
	    if(this.material.isMaterial) {
	        if(this.material && this.material.map instanceof  THREE.Texture){
	            this.material.map.nReference--;
	            if(this.material.map.nReference <= 0){
	                this.material.map.dispose();
	                if(memRelease)
	                    this.material.map = null;
	            }
	        }
	        //
	        if(this.material && !this.material.unDisposable) {
	            this.material.dispose();
	            if(memRelease)
	                this.material = null;
	        }
	    }
	    else if(this.material instanceof Array) {
	        for(let n=0, numMaterial = this.material.length; n<numMaterial; ++n) {
	            let material = this.material[n];
	            //
	            if(material && material.map instanceof  THREE.Texture){
	                material.map.nReference--;
	                if(material.map.nReference <= 0){
	                    material.map.dispose();
	                    if(memRelease)
	                        material.map = null;
	                }
	            }
	            //
	            if(material && !material.unDisposable) {
	                material.dispose();
	                if(memRelease)
	                    material = null;
	            }
	        }
	    }
	    //
	    for(let n=0, length = this.children.length; n<length; ++n) {
	        this.children[n].dispose(gpuRelease, memRelease);
	    }
	};


	THREE.Points.prototype.dispose = function(gpuRelease = true, memRelease = true) {
	    if(this.geometry) {
	        this.geometry.dispose();
	        if(memRelease)
	          this.geometry = null;
	    }
	    //
	    if(this.material && this.material.map instanceof  THREE.Texture){
	        this.material.map.nReference--;
	        if(this.material.map.nReference <= 0){
	            this.material.map.dispose();
	            if(memRelease)
	              this.material.map = null;
	        }
	    }
	    //
	    if(this.material && !this.material.unDisposable) {
	        this.material.dispose();
	        if(memRelease)
	           this.material = null;
	    }
	    //
	    for(let n=0, length = this.children.length; n<length; ++n) {
	        this.children[n].dispose(gpuRelease, memRelease);
	    }
	};

	THREE.Line.prototype.dispose = function (gpuRelease = true, memRelease = true) {
	    if(this.geometry) {
	        this.geometry.dispose();
	        if(memRelease)
	           this.geometry = null;
	    }
	    //
	    if(this.material && this.material.map instanceof  THREE.Texture){
	        this.material.map.nReference--;
	        if(this.material.map.nReference <= 0){
	            this.material.map.dispose();
	            if(memRelease)
	               this.material.map = null;
	        }
	    }
	    //
	    if(this.material && !this.material.unDisposable) {
	        this.material.dispose();
	        if(memRelease)
	          this.material = null;
	    }
	    //
	    for(let n=0, length = this.children.length; n<length; ++n) {
	        this.children[n].dispose(gpuRelease, memRelease);
	    }
	};

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.LineSegmentsGeometry = function () {

		THREE.InstancedBufferGeometry.call( this );

		this.type = 'LineSegmentsGeometry';

		var plane = new THREE.BufferGeometry();

		var positions = [ - 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0 ];
		var uvs = [ - 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2 ];
		var index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ];

		this.setIndex( index );
		this.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		this.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

	};

	THREE.LineSegmentsGeometry.prototype = Object.assign( Object.create( THREE.InstancedBufferGeometry.prototype ), {

		constructor: THREE.LineSegmentsGeometry,

		isLineSegmentsGeometry: true,

		applyMatrix: function ( matrix ) {

			var start = this.attributes.instanceStart;
			var end = this.attributes.instanceEnd;

			if ( start !== undefined ) {

				matrix.applyToBufferAttribute( start );

				matrix.applyToBufferAttribute( end );

				start.data.needsUpdate = true;

			}

			if ( this.boundingBox !== null ) {

				this.computeBoundingBox();

			}

			if ( this.boundingSphere !== null ) {

				this.computeBoundingSphere();

			}

			return this;

		},

		setPositions: function ( array ) {

			var lineSegments;

			if ( array instanceof Float32Array ) {

				lineSegments = array;

			} else if ( Array.isArray( array ) ) {

				lineSegments = new Float32Array( array );

			}

			var instanceBuffer = new THREE.InstancedInterleavedBuffer( lineSegments, 6, 1 ); // xyz, xyz

			this.addAttribute( 'instanceStart', new THREE.InterleavedBufferAttribute( instanceBuffer, 3, 0 ) ); // xyz
			this.addAttribute( 'instanceEnd', new THREE.InterleavedBufferAttribute( instanceBuffer, 3, 3 ) ); // xyz

			//

			this.computeBoundingBox();
			this.computeBoundingSphere();

			return this;

		},

		setColors: function ( array ) {

			var colors;

			if ( array instanceof Float32Array ) {

				colors = array;

			} else if ( Array.isArray( array ) ) {

				colors = new Float32Array( array );

			}

			var instanceColorBuffer = new THREE.InstancedInterleavedBuffer( colors, 6, 1 ); // rgb, rgb

			this.addAttribute( 'instanceColorStart', new THREE.InterleavedBufferAttribute( instanceColorBuffer, 3, 0 ) ); // rgb
			this.addAttribute( 'instanceColorEnd', new THREE.InterleavedBufferAttribute( instanceColorBuffer, 3, 3 ) ); // rgb

			return this;

		},

		fromWireframeGeometry: function ( geometry ) {

			this.setPositions( geometry.attributes.position.array );

			return this;

		},

		fromEdgesGeometry: function ( geometry ) {

			this.setPositions( geometry.attributes.position.array );

			return this;

		},

		fromMesh: function ( mesh ) {

			this.fromWireframeGeometry( new THREE.WireframeGeometry( mesh.geometry ) );

			// set colors, maybe

			return this;

		},

		fromLineSegements: function ( lineSegments ) {

			var geometry = lineSegments.geometry;

			if ( geometry.isGeometry ) {

				this.setPositions( geometry.vertices );

			} else if ( geometry.isBufferGeometry ) {

				this.setPositions( geometry.position.array ); // assumes non-indexed

			}

			// set colors, maybe

			return this;

		},

		computeBoundingBox: function () {

			var box = new THREE.Box3();

			return function computeBoundingBox() {

				if ( this.boundingBox === null ) {

					this.boundingBox = new THREE.Box3();

				}

				var start = this.attributes.instanceStart;
				var end = this.attributes.instanceEnd;

				if ( start !== undefined && end !== undefined ) {

					this.boundingBox.setFromBufferAttribute( start );

					box.setFromBufferAttribute( end );

					this.boundingBox.union( box );

				}

			};

		}(),

		computeBoundingSphere: function () {

			var vector = new THREE.Vector3();

			return function computeBoundingSphere() {

				if ( this.boundingSphere === null ) {

					this.boundingSphere = new THREE.Sphere();

				}

				if ( this.boundingBox === null ) {

					this.computeBoundingBox();

				}

				var start = this.attributes.instanceStart;
				var end = this.attributes.instanceEnd;

				if ( start !== undefined && end !== undefined ) {

					var center = this.boundingSphere.center;

					this.boundingBox.getCenter( center );

					var maxRadiusSq = 0;

					for ( var i = 0, il = start.count; i < il; i ++ ) {

						vector.fromBufferAttribute( start, i );
						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

						vector.fromBufferAttribute( end, i );
						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

					}

					this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

					if ( isNaN( this.boundingSphere.radius ) ) {

						console.error( 'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this );

					}

				}

			};

		}(),

		toJSON: function () {

			// todo

		},

		clone: function () {

			// todo

		},

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.LineGeometry = function () {

		THREE.LineSegmentsGeometry.call( this );

		this.type = 'LineGeometry';

	};

	THREE.LineGeometry.prototype = Object.assign( Object.create( THREE.LineSegmentsGeometry.prototype ), {

		constructor: THREE.LineGeometry,

		isLineGeometry: true,

		setPositions: function ( array ) {

			// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format

			var length = array.length - 3;
			var points = new Float32Array( 2 * length );

			for ( var i = 0; i < length; i += 3 ) {

				points[ 2 * i ] = array[ i ];
				points[ 2 * i + 1 ] = array[ i + 1 ];
				points[ 2 * i + 2 ] = array[ i + 2 ];

				points[ 2 * i + 3 ] = array[ i + 3 ];
				points[ 2 * i + 4 ] = array[ i + 4 ];
				points[ 2 * i + 5 ] = array[ i + 5 ];

			}

			THREE.LineSegmentsGeometry.prototype.setPositions.call( this, points );

			return this;

		},

		setColors: function ( array ) {

			// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

			var length = array.length - 3;
			var colors = new Float32Array( 2 * length );

			for ( var i = 0; i < length; i += 3 ) {

				colors[ 2 * i ] = array[ i ];
				colors[ 2 * i + 1 ] = array[ i + 1 ];
				colors[ 2 * i + 2 ] = array[ i + 2 ];

				colors[ 2 * i + 3 ] = array[ i + 3 ];
				colors[ 2 * i + 4 ] = array[ i + 4 ];
				colors[ 2 * i + 5 ] = array[ i + 5 ];

			}

			THREE.LineSegmentsGeometry.prototype.setColors.call( this, colors );

			return this;

		},

		fromLine: function ( line ) {

			var geometry = line.geometry;

			if ( geometry.isGeometry ) {

				this.setPositions( geometry.vertices );

			} else if ( geometry.isBufferGeometry ) {

				this.setPositions( geometry.position.array ); // assumes non-indexed

			}

			// set colors, maybe

			return this;

		},

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.WireframeGeometry2 = function ( geometry ) {

		THREE.LineSegmentsGeometry.call( this );

		this.type = 'WireframeGeometry2';

		this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) );

		// set colors, maybe

	};

	THREE.WireframeGeometry2.prototype = Object.assign( Object.create( THREE.LineSegmentsGeometry.prototype ), {

		constructor: THREE.WireframeGeometry2,

		isWireframeGeometry2: true,

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.LineSegments2 = function ( geometry, material ) {

		THREE.Mesh.call( this );

		this.type = 'LineSegments2';

		this.geometry = geometry !== undefined ? geometry : new THREE.LineSegmentsGeometry();
		this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

	};

	THREE.LineSegments2.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

		constructor: THREE.LineSegments2,

		isLineSegments2: true,

		computeLineDistances: ( function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

			var start = new THREE.Vector3();
			var end = new THREE.Vector3();

			return function computeLineDistances() {

				var geometry = this.geometry;

				var instanceStart = geometry.attributes.instanceStart;
				var instanceEnd = geometry.attributes.instanceEnd;
				var lineDistances = new Float32Array( 2 * instanceStart.data.count );

				for ( var i = 0, j = 0, l = instanceStart.data.count; i < l; i ++, j += 2 ) {

					start.fromBufferAttribute( instanceStart, i );
					end.fromBufferAttribute( instanceEnd, i );

					lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
					lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo( end );

				}

				var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

				geometry.addAttribute( 'instanceDistanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
				geometry.addAttribute( 'instanceDistanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

				return this;

			};

		}() ),

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.Line2 = function ( geometry, material ) {

		THREE.LineSegments2.call( this );

		this.type = 'Line2';

		this.geometry = geometry !== undefined ? geometry : new THREE.LineGeometry();
		this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

	};

	THREE.Line2.prototype = Object.assign( Object.create( THREE.LineSegments2.prototype ), {

		constructor: THREE.Line2,

		isLine2: true,

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 */

	THREE.Wireframe = function ( geometry, material ) {

		THREE.Mesh.call( this );

		this.type = 'Wireframe';

		this.geometry = geometry !== undefined ? geometry : new THREE.LineSegmentsGeometry();
		this.material = material !== undefined ? material : new THREE.LineMaterial( { color: Math.random() * 0xffffff } );

	};

	THREE.Wireframe.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

		constructor: THREE.Wireframe,

		isWireframe: true,

		computeLineDistances: ( function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

			var start = new THREE.Vector3();
			var end = new THREE.Vector3();

			return function computeLineDistances() {

				var geometry = this.geometry;

				var instanceStart = geometry.attributes.instanceStart;
				var instanceEnd = geometry.attributes.instanceEnd;
				var lineDistances = new Float32Array( 2 * instanceStart.data.count );

				for ( var i = 0, j = 0, l = instanceStart.data.count; i < l; i ++, j += 2 ) {

					start.fromBufferAttribute( instanceStart, i );
					end.fromBufferAttribute( instanceEnd, i );

					lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
					lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo( end );

				}

				var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

				geometry.addAttribute( 'instanceDistanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
				geometry.addAttribute( 'instanceDistanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

				return this;

			};

		}() ),

		copy: function ( source ) {

			// todo

			return this;

		}

	} );

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

	/**
	 * @class
	 * @classdesc 数据分页组件，用于请求、加载 PagedLod 、ProxyNode 中的数据
	 * @param {boolean} [createWorker=true] -是否创建一个独立的 worker 用于请求、解析数据
	 */
	THREE.DataBasePager = function (createWorker = true) {
	    /**
	     * 缓存已加载的数据（等待被转换为 THREE.Object3D 对象）
	     * @public
	     * @type {Map<String, Object>}
	     */
	    this.loadedNodeCache = new Map();
	    /**
	     * 缓存已被转换的 THREE.Object3D 对象（等待被合并入场景）
	     * @public
	     * @type {Map<String, THREE.Object3D>}
	     */
	    this.parsedNodeCache = new Map();
	    /**
	     * 缓存需要加载纹理的对象
	     * @public
	     * @type {Map<String, Array>}
	     */
	    this.loadingTextureCache = new Map();
	    /**
	     * 当前正在请求的个数
	     * @public
	     * @type {number}
	     */
	    this.loadingCount = 0;
	    /**
	     * 请求队列最大长度
	     * @public
	     * @type {number}
	     */
	    this.maxWaitingLoaded = 2;
	    /**
	     * 是否允许请求新的数据
	     * @public
	     * @type {boolean}
	     */
	    this.enableRequestData = true;
	    //
	    this._passedRequest_ = [];
	    this.maxSortRequests = 0;
	    this.cullGroup = false;
	    //
	    if(createWorker) {
	        let loader = this;
	        this.nodeLoadWorker = new Worker('../src/worker/nodeParserWorker.js');
	        this.nodeLoadWorker.onmessage = function (massage) {
	            --loader.loadingCount;
	            //
	            let node = massage.data;
	            if(node) {
	                let tmp = loader.loadedNodeCache.get(node.requestURL);
	                if(!tmp) {
	                    return;
	                }
	                //
	                if(node.children) {
	                    loader.loadedNodeCache.set(node.requestURL, node);
	                }
	                else {
	                    loader.loadedNodeCache.delete(node.requestURL);
	                }
	            }
	        };
	    }
	    else {
	        this.nodeLoadWorker = null;
	    }
	};

	THREE.DataBasePager.LOAD_STRATEGY = {

	};
	THREE.DataBasePager.prototype = Object.assign( Object.create( THREE.EventDispatcher.prototype ), {
	    constructor: THREE.DataBasePager
	});

	/**
	 * 请求数据
	 * @param {string} url -所要求数据的url
	 * @returns {boolean}
	 */
	THREE.DataBasePager.prototype.load = function(url, frameNumber, force = false, weight = -1) {
	    if(!this.enableRequestData) {
	        return false;
	    }
	    //
	    let tmp = this.loadedNodeCache.get(url);
	    if(tmp) {
	        return true;
	    }
	    //
	    let loadUrl = "";
	    //
	    if(!force) {
	        if(this.loadingCount > this.maxWaitingLoaded) {
	            //console.log("too many load");
	            if(this._passedRequest_.length > 0 && this._passedRequest_[0].frameNumber < frameNumber - 1) {
	                this._passedRequest_.splice(0,1);
	            }
	            //
	            for(let n=0, length = this._passedRequest_.length; n<length; ++n) {
	                if(frameNumber > this._passedRequest_[n].frameNumber) {
	                    continue;
	                }
	                else if(this._passedRequest_[n].weight < 0) {
	                    continue;
	                }
	                else if(weight <= this._passedRequest_[n].weight) {
	                    continue;
	                }
	                else {
	                    this._passedRequest_.splice(n, 0, {url:url, frameNumber:frameNumber, weight:weight});
	                    if(this._passedRequest_.length > this.maxSortRequests) {
	                        this._passedRequest_.splice(this.maxSortRequests, 1);
	                    }
	                    return false;
	                }
	            }
	            //
	            if(this._passedRequest_.length < this.maxSortRequests) {
	                this._passedRequest_[this._passedRequest_.length] = {url:url, frameNumber:frameNumber, weight:weight};
	            }
	            //
	            return false;
	        }
	        //
	        let numRemove = 0;
	        while(numRemove < this._passedRequest_.length && this._passedRequest_[numRemove].frameNumber < frameNumber - 1) {
	           ++numRemove;
	        }
	        this._passedRequest_.splice(0, numRemove);
	        //
	        if(this._passedRequest_.length > 0) {
	            loadUrl = this._passedRequest_[0].url;
	            this._passedRequest_.splice(0,1);
	        }
	        else {
	            loadUrl = url;
	        }
	        //
	        if(loadUrl !== url) {
	            let inserted = false;
	            for(let n=0, length = this._passedRequest_.length; n<length; ++n) {
	                if(frameNumber > this._passedRequest_[n].frameNumber) {
	                    continue;
	                }
	                else if(this._passedRequest_[n].weight < 0) {
	                    continue;
	                }
	                else if(weight <= this._passedRequest_[n].weight) {
	                    continue;
	                }
	                else {
	                    this._passedRequest_.splice(n, 0, {url:url, frameNumber:frameNumber, weight:weight});
	                    inserted = true;
	                }
	            }
	            //
	            if(!inserted) {
	                this._passedRequest_[this._passedRequest_.length] = {url:url, frameNumber:frameNumber, weight:weight};
	            }
	        }
	    }
	    else {
	        loadUrl = url;
	    }
	    //
	    this.loadedNodeCache.set(loadUrl, {isPlaceholder: true});
	    ++this.loadingCount;
	    this.nodeLoadWorker.postMessage(loadUrl);
	    return true;
	};

	/**
	 * 将请求后的数据转换为 THREE.Object3D 对象
	 * @param {Object} proxy -代表请求数据的中间数据
	 * （由于 worker 和主线程不能共享内存，所以由 worker 请求的数据会被解析为一种代理类型数据转给主线程，
	 * 代理类型请参考 nodeProxyType 文档)
	 * @param {THREE.Object3D} [node] -递归中间参数，不用指定
	 * @param {Array} [meshes] -递归中间参数，不用指定
	 * @param {Object} [textures] -递归中间参数，不用指定
	 * @returns {THREE.Object3D}
	 */
	THREE.DataBasePager.prototype.proxyParse = function (proxy, node, meshes, textures) {
	    if(meshes === undefined) {
	        meshes=[];
	    }
	    if(textures === undefined) {
	        textures = {};
	    }
	    //if(proxy instanceof GroupProxy) {
	    if(proxy.flag === 0) {
	        if(node === undefined) {
	            node = new THREE.Group();
	            if(proxy.name) {
	                node.name = proxy.name;
	            }
	            if(proxy.matrix) {
	                let m = new THREE.Matrix4();
	                m.elements = proxy.matrix;
	                node.applyMatrix(m);
	            }
	            for(let n=0, length = proxy.children.length; n<length; ++n) {
	                this.proxyParse(proxy.children[n], node, meshes, textures);
	            }
	        }
	        else {
	            let group = new THREE.Group();
	            if(proxy.name) {
	                group.name = proxy.name;
	            }
	            if(proxy.matrix) {
	                let m = new THREE.Matrix4();
	                m.elements = proxy.matrix;
	                group.applyMatrix(m);
	            }
	            node.add(group);
	            for(let n=0, length = proxy.children.length; n<length; ++n) {
	                this.proxyParse(proxy.children[n], group, meshes, textures);
	            }
	        }
	        //

	    }
	    //else if(proxy instanceof  PagedLodProxy) {
	    else if(proxy.flag === 1) {
	        if(node === undefined) {
	            node = new THREE.PagedLod(this);
	            if(proxy.name) {
	                node.name = proxy.name;
	            }
	            for(let n=0, length = proxy.levels.length; n<length; ++n) {
	                node.addLevel(proxy.levels[n].url.trim(), proxy.levels[n].min, proxy.levels[n].max);
	            }
	            if(proxy.boundingSphere.length === 4) {
	                node.boundingSphere = new THREE.Sphere(new THREE.Vector3(proxy.boundingSphere[0],proxy.boundingSphere[1],proxy.boundingSphere[2]),proxy.boundingSphere[3]);
	                node.boundingComputed = true;
	                node.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
	            }
	            else {
	                node.boundingComputed = false;
	                node.centerMode = THREE.Object3D.CenterMode.USE_BOUNDING_SPHERE_CENTER;
	            }
	            if(proxy.rangeMode === 0) {
	                node.setRangeMode(THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT);
	            }
	            else if(proxy.rangeMode === 1) {
	                node.setRangeMode(THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN);
	            }
	            //
	            for(let n=0, length = proxy.children.length; n<length; ++n) {
	                this.proxyParse(proxy.children[n], node, meshes, textures);
	            }
	            //
	            for(let n=0, length = node.levels.length; n<length; ++n) {
	                if(node.levels[n].url.trim().length === 0) {
	                    if(node.children.length <= n) {
	                        node.add(new THREE.Group());
	                    }
	                }
	                else
	                    break;
	            }
	        }
	        else {
	            let pg = new THREE.PagedLod(this);
	            if(proxy.name) {
	                pg.name = proxy.name;
	            }
	            for(let n=0; n<proxy.levels.length; ++n) {
	                pg.addLevel(proxy.levels[n].url.trim(), proxy.levels[n].min, proxy.levels[n].max);
	            }
	            if(proxy.boundingSphere.length === 4) {
	                pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(proxy.boundingSphere[0],proxy.boundingSphere[1],proxy.boundingSphere[2]),proxy.boundingSphere[3]);
	                pg.boundingComputed = true;
	                pg.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
	            }
	            else {
	                pg.boundingComputed = false;
	                pg.centerMode = THREE.Object3D.CenterMode.USE_BOUNDING_SPHERE_CENTER;
	            }
	            if(proxy.rangeMode === 0) {
	                pg.setRangeMode(THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT);
	            }
	            else if(proxy.rangeMode === 1) {
	                pg.setRangeMode(THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN);
	            }
	            node.add(pg);
	            //
	            for(let n=0, length = proxy.children.length; n<length; ++n) {
	                this.proxyParse(proxy.children[n], pg, meshes, textures);
	            }
	            //
	            for(let n=0, length = pg.levels.length; n<length; ++n) {
	                if(pg.levels[n].url.trim().length === 0) {
	                    if(pg.children.length <= n) {
	                        pg.add(new THREE.Group());
	                    }
	                }
	                else
	                    break;
	            }
	        }
	    }
	    //else if(proxy instanceof  MeshProxy) {
	    else if(proxy.flag === 2) {
	        let geometry = new THREE.BufferGeometry();
	        if(proxy.geometry.vertexes)
	          geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( proxy.geometry.vertexes, 3 ) );
	        if(proxy.geometry.uv)
	          geometry.addAttribute('uv', new THREE.Float32BufferAttribute( proxy.geometry.uv, 2 ));
	        if(proxy.geometry.indexes)
	          geometry.setIndex( proxy.geometry.indexes.length > 256 ? (proxy.geometry.indexes.length > 65536 ? new THREE.Uint32BufferAttribute( proxy.geometry.indexes, 1 ) : new THREE.Uint16BufferAttribute( proxy.geometry.indexes, 1 )) : new THREE.Uint8BufferAttribute( proxy.geometry.indexes, 1 ));
	        if(proxy.geometry.normal) {
	            geometry.addAttribute('normal', new THREE.Float32BufferAttribute(proxy.geometry.normal, 3));
	        }
	        if(proxy.geometry.group) {
	            for(let n=0, numGroup = proxy.geometry.group.length; n<numGroup; ++n) {
	                geometry.addGroup(proxy.geometry.group[n].start, proxy.geometry.group[n].count, proxy.geometry.group[n].materialIndex);
	            }
	        }
	        //
	        let meshMaterial = null;
	        //
	        if(proxy.material instanceof  Array) {
	            let materials = [];
	            for(let n=0, numMaterial = proxy.material.length; n<numMaterial; ++n) {
	                materials[n] = new THREE.MeshBasicMaterial();
	                if(proxy.geometry.normal) {
	                    materials[n] = new THREE.MeshPhongMaterial();
	                }
	                //
	                let material = materials[n];
	                //
	                if(material instanceof  THREE.MeshPhongMaterial) {
	                    material.color = new THREE.Color(proxy.material[n].diffuse[0], proxy.material[n].diffuse[1], proxy.material[n].diffuse[2]);
	                    material.specular = new THREE.Color(proxy.material[n].specular[0], proxy.material[n].specular[1], proxy.material[n].specular[2]);
	                    material.shininess = proxy.material[n].shininess;
	                    material.emissive = new THREE.Color(proxy.material[n].emission[0], proxy.material[n].emission[1], proxy.material[n].emission[2]);
	                }
	                //
	                if(proxy.material[n].texture && proxy.material[n].texture.url) {
	                    if(textures[proxy.material[n].texture.url]) {
	                        material.map = textures[proxy.material[n].texture.url];
	                        ++textures[proxy.material[n].texture.url].nReference;
	                    }
	                    else {
	                        let textureLoader = null;
	                        let texture = null;
	                        let netUrl = encodeURIComponent(proxy.material[n].texture.url);
	                        if(netUrl.substr(-4, 4) === '.dds') {
	                            textureLoader = new THREE.CompressedTextureLoader();
	                            texture = textureLoader.load(proxy.material[n].texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
	                        }
	                        else {
	                            textureLoader = new THREE.TextureLoader();
	                            texture = textureLoader.load(proxy.material[n].texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
	                        }
	                        texture.wrapS = proxy.material[n].texture.wrapS;
	                        texture.wrapT = proxy.material[n].texture.wrapT;
	                        texture.minFilter = proxy.material[n].texture.minFilter;
	                        texture.magFilter = proxy.material[n].texture.magFilter;
	                        texture.generateMipmaps = false;
	                        material.map = texture;
	                        //
	                        ++texture.nReference;
	                        textures[proxy.material[n].texture.url] = texture;
	                    }
	                }
	                else
	                    console.log("no texture");
	            }
	            //
	            meshMaterial = materials;
	        }
	        else {
	            let material = new THREE.MeshBasicMaterial();
	            material.lights = true;
	            if(proxy.geometry.normal) {
	                geometry.addAttribute('normal', new THREE.Float32BufferAttribute(proxy.geometry.normal, 3));
	                material = new THREE.MeshPhongMaterial();
	            }
	            if(proxy.material) {
	                if(material instanceof  THREE.MeshPhongMaterial) {
	                    material.color = new THREE.Color(proxy.material.diffuse[0], proxy.material.diffuse[1], proxy.material.diffuse[2]);
	                    material.specular = new THREE.Color(proxy.material.specular[0], proxy.material.specular[1], proxy.material.specular[2]);
	                    material.shininess = proxy.material.shininess;
	                    material.emissive = new THREE.Color(proxy.material.emission[0], proxy.material.emission[1], proxy.material.emission[2]);
	                }
	                //
	                if(proxy.material.texture && proxy.material.texture.url) {
	                    if(textures[proxy.material.texture.url]) {
	                        material.map = textures[proxy.material.texture.url];
	                        ++textures[proxy.material.texture.url].nReference;
	                    }
	                    else {
	                        let textureLoader = null;
	                        let netUrl = encodeURIComponent(proxy.material.texture.url);
	                        let texture = null;
	                        if(netUrl.substr(-4, 4) === '.dds') {
	                            textureLoader = new THREE.CompressedTextureLoader();
	                            texture = textureLoader.load(proxy.material.texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
	                        }
	                        else {
	                            textureLoader = new THREE.TextureLoader();
	                            texture = textureLoader.load(proxy.material.texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
	                        }
	                        texture.wrapS = proxy.material.texture.wrapS;
	                        texture.wrapT = proxy.material.texture.wrapT;
	                        texture.minFilter = proxy.material.texture.minFilter;
	                        texture.magFilter = proxy.material.texture.magFilter;
	                        texture.generateMipmaps = false;
	                        material.map = texture;
	                        //
	                        ++texture.nReference;
	                        textures[proxy.material.texture.url] = texture;
	                    }
	                }
	                else
	                    console.log("no texture");
	            }
	            //
	            meshMaterial = material;
	        }
	        //
	        let mesh = new THREE.Mesh(geometry, meshMaterial);
	        mesh.castShadow = true;
	        mesh.receiveShadow = true;
	        mesh.drawMode = proxy.drawMode;
	        //
	        if(proxy.name) {
	            mesh.name = proxy.name;
	        }
	        //
	        meshes[meshes.length] = mesh;

	        node.add(mesh);
	    }
	    // APPEND_YJZ:
	    else if(proxy.flag == 3)
	    {
	        if(node === undefined) {
	            node = new THREE.ProxyNode(this);
	            if(proxy.name) {
	                node.name = proxy.name;
	            }
	            for(let j = 0, length = proxy.fileList.length; j < length; ++j)
	            {
	                node.addFileName(proxy.fileList[j]);
	            }
	        }
	        else {
	            let pn = new THREE.ProxyNode(this);
	            if(proxy.name) {
	                pn.name = proxy.name;
	            }
	            for(let i = 0, length = proxy.fileList.length; i < length; ++i)
	            {
	                pn.addFileName(proxy.fileList[i].url);
	            }
	            node.add(pn);
	        }
	    }
	    //
	    if(proxy.requestURL !== undefined) {
	        node.requestURL = proxy.requestURL;
	        if(meshes.length > 0) {
	            this.loadingTextureCache.set(node.requestURL, meshes);
	        }
	        return node;
	    }
	};

	/**
	 * 纹理状态
	 * @readonly
	 * @enum {number}
	 */
	THREE.DataBasePager.TEX_STATE = {
	    /** @description 正在加载*/
	    TEX_STATE_LOADING : 0,
	    /** @description 加载完毕*/
	    TEX_STATE_READY : 1,
	    /** @description 加载失败*/
	    TEX_STATE_FAILED : 2
	};
	/**
	 * 检查已加载的数据是否可用于渲染(纹理是否已全部加载)
	 * @param {String} strID -对象ID
	 * @param {function} [onFailed] -纹理加载失败后的回掉函数
	 * @returns {number} -纹理状态
	 */
	THREE.DataBasePager.prototype.checkCacheReady = function (strID, onFailed) {
	    if(this.loadingTextureCache.has(strID)) {
	        let faileds = [];
	        let meshes = this.loadingTextureCache.get(strID);
	        for(let n=0, length = meshes.length; n<length; ++n) {
	            let material = meshes[n].material;
	            //
	            if(material.isMaterial) {
	                if(!material.map) {

	                }
	                else if(!material.map.image) {
	                    return {state:THREE.DataBasePager.TEX_STATE_LOADING};
	                }
	                else if(material.map.image.failedLoad) {
	                    if(onFailed) {
	                        if(!onFailed(material)) {
	                            faileds.push(material);
	                        }
	                    }
	                    else if(material instanceof  THREE.MeshBasicMaterial) {
	                        material.map = undefined;
	                    }
	                }
	                else if(material.map.image.loaded) {

	                }
	                else {
	                    return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING};
	                }
	            }
	            else if(material instanceof  Array) {
	                for(let i=0, numMaterial = material.length; i<numMaterial; ++i) {
	                    if(!material[i].map) {

	                    }
	                    else if(!material[i].map.image) {
	                        return {state:THREE.DataBasePager.TEX_STATE_LOADING};
	                    }
	                    else if(material[i].map.image.failedLoad) {
	                        if(onFailed) {
	                            if(!onFailed(material[i])) {
	                                faileds.push(material[i]);
	                            }
	                        }
	                        else if(material[i] instanceof  THREE.MeshBasicMaterial) {
	                            material[i].map = undefined;
	                        }
	                    }
	                    else if(material[i].map.image.loaded) {

	                    }
	                    else {
	                        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING};
	                    }
	                }
	            }
	        }
	        //
	        this.loadingTextureCache.set(strID, null);
	        this.loadingTextureCache.delete(strID);
	        //
	        if(faileds.length>0) {
	            return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_FAILED};
	        }
	        //
	        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_READY};
	    }
	    else {
	        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_READY};
	    }
	};


	THREE.DataBasePager.prototype.pageScaleFunc = function (contex, node) {
	    return 1.0;
	};

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
	};
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
	};
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
	};
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

	/**
	 * @class
	 * @memberOf THREE
	 * @readonly
	 * @type {{}}
	 */
	THREE.FontManager = {};
	/**
	 * 已加载字体对象缓存
	 * @memberOf THREE.FontManager
	 * @type {Map<string, THREE.Font>}
	 * @private
	 */
	THREE.FontManager._cache_ = new Map();
	THREE.FontManager._loading_ = new Map();
	/**
	 * 获取指定字体对象，如果已加载则返回该对象，否则请求加载该对象并返回 null
	 * @methodOf THREE.FontManager
	 * @param {string} fontName 字体名称
	 * @return {THREE.Font}
	 */
	THREE.FontManager.getFont = function(fontName) {
	    if(THREE.FontManager._cache_.has(fontName)) {
	        return THREE.FontManager._cache_.get(fontName);
	    }
	    else if(!THREE.FontManager._loading_.has(fontName)){
	        let loader = new THREE.FontLoader();
	        let fontURL = '../../resource/font/' + fontName + '.typeface.json';
	        loader.load( fontURL, function ( font ) {
	            THREE.FontManager._cache_.set(fontName, font);
	            THREE.FontManager._loading_.delete(fontName);
	        } );
	        //
	        THREE.FontManager._loading_.set(fontName, fontURL);
	    }
	    //
	    return null;
	};

	THREE.ShaderChunk.meshbasic_vert = [
	    '#include <common>',
	    '#include <uv_pars_vertex>',
	    '#include <uv2_pars_vertex>',
	    '#include <envmap_pars_vertex>',
	    '#include <lights_pars_begin>',
	    '#include <color_pars_vertex>',
	    '#include <fog_pars_vertex>',
	    '#include <morphtarget_pars_vertex>',
	    '#include <skinning_pars_vertex>',
	    '#include <shadowmap_pars_vertex>',
	    '#include <logdepthbuf_pars_vertex>',
	    '#include <clipping_planes_pars_vertex>',
	    'void main() {',
	        '#include <uv_vertex>',
	        '#include <uv2_vertex>',
	        '#include <color_vertex>',
	        '#include <skinbase_vertex>',

	        '#ifdef USE_ENVMAP',
	        '#include <beginnormal_vertex>',
	        '#include <morphnormal_vertex>',
	        '#include <skinnormal_vertex>',
	        '#include <defaultnormal_vertex>',
	        '#endif',
	        '#include <begin_vertex>',
	        '#include <morphtarget_vertex>',
	        '#include <skinning_vertex>',
	        '#include <project_vertex>',
	        '#include <logdepthbuf_vertex>',

	        '#include <worldpos_vertex>',
	        '#include <clipping_planes_vertex>',
	        '#include <envmap_vertex>',
	        '#include <shadowmap_vertex>',
	        '#include <fog_vertex>',
	    '}',
	].join('\n');

	THREE.ShaderChunk.meshbasic_frag = [
	    'uniform vec3 diffuse;',
	    'uniform float opacity;',
	    '#ifndef FLAT_SHADED',
	    'varying vec3 vNormal;',
	    '#endif',
	    '#include <common>',
	    '#include <packing>',
	    '#include <color_pars_fragment>',
	    '#include <uv_pars_fragment>',
	    '#include <uv2_pars_fragment>',
	    '#include <map_pars_fragment>',
	    '#include <alphamap_pars_fragment>',
	    '#include <aomap_pars_fragment>',
	    '#include <lightmap_pars_fragment>',
	    '#include <envmap_pars_fragment>',
	    '#include <lights_pars_begin>',
	    '#include <fog_pars_fragment>',
	    '#include <shadowmap_pars_fragment>',
	    '#include <shadowmask_pars_fragment>',
	    '#include <specularmap_pars_fragment>',
	    '#include <logdepthbuf_pars_fragment>',
	    '#include <clipping_planes_pars_fragment>',
	    'void main() {',
	        '#include <clipping_planes_fragment>',
	        'vec4 diffuseColor = vec4( diffuse, opacity );',
	        '#include <logdepthbuf_fragment>',
	        '#include <map_fragment>',
	        '#include <color_fragment>',
	        '#include <alphamap_fragment>',
	        '#include <alphatest_fragment>',
	        '#include <specularmap_fragment>',
	        'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );',
	        // accumulation (baked indirect lighting only)
	        '#ifdef USE_LIGHTMAP',
	        'reflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;',
	        '#else',
	        'reflectedLight.indirectDiffuse += vec3( 1.0 );',
	        '#endif',
	        // modulation
	        '#include <aomap_fragment>',
	        'reflectedLight.indirectDiffuse *= diffuseColor.rgb;',
	        'vec3 outgoingLight = reflectedLight.indirectDiffuse * min((0.5 + getShadowMask()), 1.0);',
	        '#include <envmap_fragment>',
	        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
	        '#include <premultiplied_alpha_fragment>',
	        '#include <tonemapping_fragment>',
	        '#include <encodings_fragment>',
	        '#include <fog_fragment>',
	    '}',
	].join('\n');

	THREE.ShaderLib.basic = {
	    uniforms: THREE.UniformsUtils.merge( [
	        THREE.UniformsLib.common,
	        THREE.UniformsLib.specularmap,
	        THREE.UniformsLib.envmap,
	        THREE.UniformsLib.aomap,
	        THREE.UniformsLib.lightmap,
	        THREE.UniformsLib.fog,
	        THREE.UniformsLib.lights
	    ] ),

	    vertexShader: THREE.ShaderChunk.meshbasic_vert,
	    fragmentShader: THREE.ShaderChunk.meshbasic_frag
	};

	/**
	 * @author WestLangley / http://github.com/WestLangley
	 *
	 * parameters = {
	 *  color: <hex>,
	 *  linewidth: <float>,
	 *  dashed: <boolean>,
	 *  dashScale: <float>,
	 *  dashSize: <float>,
	 *  gapSize: <float>,
	 *  resolution: <Vector2>, // to be set by renderer
	 * }
	 */

	THREE.UniformsLib.line = {
		linewidth: { value: 1 },
		resolution: { value: new THREE.Vector2( 1, 1 ) },
		dashScale: { value: 1 },
		dashSize: { value: 1 },
		gapSize: { value: 1 } // todo FIX - maybe change to totalSize
	};

	THREE.UniformsLib.depthTexture = {
	    depthTexture : {value:null},
	    textureSize : {value:new THREE.Vector2(0,0)},
	    textureRange : {value: new THREE.Vector4(0,0,0,0)},
	    textureMatrix : {value : new THREE.Matrix4()},
	    depthCameraNearFar : {value:new THREE.Vector2(0,0)}
	};



	THREE.ShaderLib[ 'line' ] = {

		uniforms: THREE.UniformsUtils.merge ( [
			THREE.UniformsLib.common,
			THREE.UniformsLib.fog,
			THREE.UniformsLib.line
		] ),

		vertexShader:
			`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	    vertexShaderWithDepthMapLow:
	        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform mat4 textureMatrix;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 > z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 > z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 > z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));
                z00 = z11 > z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 > z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 > z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 > z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 > z00 ? z22 : z00;
                z00 = z00 >0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 > z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 > z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 > z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));
                z00 = z11 > z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 > z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 > z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 > z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 > z00 ? z22 : z00;
                z00 = z00 >0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01, depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             //
			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	    vertexShaderWithDepthMapHigh:
	        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

            //
            mat4 textureMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
               vec4 texCoord = textureMatrix*ps;
               float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z01 < z00 ? z01 : z00;
               float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z02 < z00 ? z02 : z00;
               float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
               z00 = z10 < z00 ? z10 : z00;
               float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
               z00 = z11 < z00 ? z11 : z00;
               float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
               z00 = z12 < z00 ? z12 : z00;
               float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z20 < z00 ? z20 : z00;
               float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z21 < z00 ? z21 : z00;
               float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z22 < z00 ? z22 : z00;
               z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 < z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 < z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 < z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
                z00 = z11 < z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 < z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 < z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 < z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 < z00 ? z22 : z00;
                z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	    vertexShaderWithDepthMapNormal:
	        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

            //
            mat4 textureMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
               vec4 texCoord = textureMatrix*ps;
               float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

		fragmentShader:
			`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <premultiplied_alpha_fragment>
			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>

		}
		`
	};

	THREE.LineMaterial = function ( parameters ) {

		THREE.ShaderMaterial.call( this, {

			type: 'LineMaterial',

			uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ 'line' ].uniforms ),

			vertexShader: THREE.ShaderLib[ 'line' ].vertexShader,
			fragmentShader: THREE.ShaderLib[ 'line' ].fragmentShader

		} );

		this.dashed = false;

		Object.defineProperties( this, {

			color: {

				enumerable: true,

				get: function () {

					return this.uniforms.diffuse.value;

				},

				set: function ( value ) {

					this.uniforms.diffuse.value = value;

				}

			},

			linewidth: {

				enumerable: true,

				get: function () {

					return this.uniforms.linewidth.value;

				},

				set: function ( value ) {

					this.uniforms.linewidth.value = value;

				}

			},

			dashScale: {

				enumerable: true,

				get: function () {

					return this.uniforms.dashScale.value;

				},

				set: function ( value ) {

					this.uniforms.dashScale.value = value;

				}

			},

			dashSize: {

				enumerable: true,

				get: function () {

					return this.uniforms.dashSize.value;

				},

				set: function ( value ) {

					this.uniforms.dashSize.value = value;

				}

			},

			gapSize: {

				enumerable: true,

				get: function () {

					return this.uniforms.gapSize.value;

				},

				set: function ( value ) {

					this.uniforms.gapSize.value = value;

				}

			},

			resolution: {

				enumerable: true,

				get: function () {

					return this.uniforms.resolution.value;

				},

				set: function ( value ) {

					this.uniforms.resolution.value.copy( value );

				}

			}

		} );

		this.setValues( parameters );

	};

	THREE.LineMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
	THREE.LineMaterial.prototype.constructor = THREE.LineMaterial;

	THREE.LineMaterial.prototype.isLineMaterial = true;

	THREE.LineMaterial.prototype.copy = function ( source ) {

		THREE.ShaderMaterial.prototype.copy.call( this, source );

		this.color.copy( source.color );

		this.linewidth = source.linewidth;

		this.resolution = source.resolution;

		// todo

		return this;

	};




	THREE.LineMaterialWithDepthMap = function ( parameters ) {

	    THREE.ShaderMaterial.call( this, {

	        type: 'LineMaterial',

	        uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ 'line' ].uniforms ),


	        vertexShader: THREE.ShaderLib[ 'line' ].vertexShaderWithDepthMapLow,
	        fragmentShader: THREE.ShaderLib[ 'line' ].fragmentShader

	    } );
	    //
		let lineMaterialWithDepthMap = this;

	    this.uniforms = THREE.UniformsUtils.merge([
	        lineMaterialWithDepthMap.uniforms,
	        THREE.UniformsLib.depthTexture
	    ]);

	    this.dashed = false;

	    Object.defineProperties( this, {

	        color: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.diffuse.value;

	            },

	            set: function ( value ) {

	                this.uniforms.diffuse.value = value;

	            }

	        },

	        linewidth: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.linewidth.value;

	            },

	            set: function ( value ) {

	                this.uniforms.linewidth.value = value;

	            }

	        },

	        dashScale: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.dashScale.value;

	            },

	            set: function ( value ) {

	                this.uniforms.dashScale.value = value;

	            }

	        },

	        dashSize: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.dashSize.value;

	            },

	            set: function ( value ) {

	                this.uniforms.dashSize.value = value;

	            }

	        },

	        gapSize: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.gapSize.value;

	            },

	            set: function ( value ) {

	                this.uniforms.gapSize.value = value;

	            }

	        },

	        resolution: {

	            enumerable: true,

	            get: function () {

	                return this.uniforms.resolution.value;

	            },

	            set: function ( value ) {

	                this.uniforms.resolution.value.copy( value );

	            }

	        }

	    } );

	    this.setValues( parameters );

	};

	THREE.LineMaterialWithDepthMap.prototype = Object.create( THREE.ShaderMaterial.prototype );
	THREE.LineMaterialWithDepthMap.prototype.constructor = THREE.LineMaterial;

	THREE.LineMaterialWithDepthMap.prototype.isLineMaterial = true;
	THREE.LineMaterialWithDepthMap.prototype.isLineMaterialWithDepthMap = true;

	THREE.LineMaterialWithDepthMap.prototype.copy = function ( source ) {

	    THREE.ShaderMaterial.prototype.copy.call( this, source );

	    this.color.copy( source.color );

	    this.linewidth = source.linewidth;

	    this.resolution = source.resolution;

	    // todo

	    return this;

	};

	THREE.WebGLRenderer.prototype.supportMaterialStencil = function () {
	    let state = this.state;
	    let context = this.context;
	    this.state.setMaterial = function ( material, frontFaceCW ) {
	        material.side === THREE.DoubleSide
	            ? state.disable( context.CULL_FACE )
	            : state.enable( context.CULL_FACE );

	        var flipSided = ( material.side === THREE.BackSide );
	        if ( frontFaceCW ) flipSided = ! flipSided;

	        state.setFlipSided( flipSided );

	        material.transparent === true
	            ? this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha )
	            : this.setBlending( THREE.NoBlending );

	        state.buffers.depth.setFunc( material.depthFunc );
	        state.buffers.depth.setTest( material.depthTest );
	        state.buffers.depth.setMask( material.depthWrite );
	        state.buffers.color.setMask( material.colorWrite );
	        if(material.stencilTest !== undefined) {
	            //state.buffers.stencil.setTest(material.stencilTest);
	        }

	        this.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );
	    };
	};

}());
