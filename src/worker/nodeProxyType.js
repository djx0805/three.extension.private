function GroupProxy() {
    this.flag = 0;
    this.children = [];
    this.matrix = null;
    this.name = null;
}

function PagedLodProxy() {
    this.flag = 1;
    this.levels = [];
    this.children = [];
    this.boundingSphere = [];
    this.rangeMode = 0;
    this.name = null;
}

function GeometryProxy() {
    this.vertexes = null;
    this.uv = null;
    this.indexes = null;
    this.normal = null;
    this.name = null;
    this.group = null;
}

function TextureProxy() {
    this.url = null;
    this.blobContent = null;
    this.magFilter = "LINEAR";
    this.minFilter = "LINEAR_MIPMAP_LINEAR";
    this.wrapS = "REPEAT";
    this.wrapT = "REPEAT";
}

function MaterialProxy() {
    this.texture = null;
    this.ambient = [ 1.000000, 1.000000, 1.000000, 1.000000];
    this.diffuse = [ 1.000000, 1.000000, 1.000000, 1.000000];
    this.emission = [ 0.000000, 0.000000, 0.000000, 1.000000];
    this.shininess = 0.000000;
    this.specular = [ 0.000000, 0.000000, 0.000000, 1.000000];
}

function MeshProxy(geometry, material) {
    this.flag = 2;
    this.geometry = geometry;
    this.material = material;

    this.drawMode = 0;
    this.name = null;

    this.isMeshProxy = true;
}

function ProxyProxy() {
    this.flag = 3;
    this.fileList = [];
    this.name = null;
}

function Vector3( x, y, z ) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

}

Object.assign( Vector3.prototype, {

    isVector3: true,

    set: function ( x, y, z ) {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    },

    setScalar: function ( scalar ) {

        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;

    },

    setX: function ( x ) {

        this.x = x;

        return this;

    },

    setY: function ( y ) {

        this.y = y;

        return this;

    },

    setZ: function ( z ) {

        this.z = z;

        return this;

    },

    setComponent: function ( index, value ) {

        switch ( index ) {

            case 0: this.x = value; break;
            case 1: this.y = value; break;
            case 2: this.z = value; break;
            default: throw new Error( 'index is out of range: ' + index );

        }

        return this;

    },

    getComponent: function ( index ) {

        switch ( index ) {

            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            default: throw new Error( 'index is out of range: ' + index );

        }

    },

    clone: function () {

        return new this.constructor( this.x, this.y, this.z );

    },

    copy: function ( v ) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    },

    add: function ( v, w ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
            return this.addVectors( v, w );

        }

        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;

    },

    addScalar: function ( s ) {

        this.x += s;
        this.y += s;
        this.z += s;

        return this;

    },

    addVectors: function ( a, b ) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;

    },

    addScaledVector: function ( v, s ) {

        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;

        return this;

    },

    sub: function ( v, w ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
            return this.subVectors( v, w );

        }

        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;

    },

    subScalar: function ( s ) {

        this.x -= s;
        this.y -= s;
        this.z -= s;

        return this;

    },

    subVectors: function ( a, b ) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;

    },

    multiply: function ( v, w ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
            return this.multiplyVectors( v, w );

        }

        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;

    },

    multiplyScalar: function ( scalar ) {

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;

    },

    multiplyVectors: function ( a, b ) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;

    },


    divideScalar: function ( scalar ) {

        return this.multiplyScalar( 1 / scalar );

    },

    min: function ( v ) {

        this.x = Math.min( this.x, v.x );
        this.y = Math.min( this.y, v.y );
        this.z = Math.min( this.z, v.z );

        return this;

    },

    max: function ( v ) {

        this.x = Math.max( this.x, v.x );
        this.y = Math.max( this.y, v.y );
        this.z = Math.max( this.z, v.z );

        return this;

    },

    clamp: function ( min, max ) {

        // assumes min < max, componentwise

        this.x = Math.max( min.x, Math.min( max.x, this.x ) );
        this.y = Math.max( min.y, Math.min( max.y, this.y ) );
        this.z = Math.max( min.z, Math.min( max.z, this.z ) );

        return this;

    },

    clampScalar: function () {

        var min = new Vector3();
        var max = new Vector3();

        return function clampScalar( minVal, maxVal ) {

            min.set( minVal, minVal, minVal );
            max.set( maxVal, maxVal, maxVal );

            return this.clamp( min, max );

        };

    }(),

    clampLength: function ( min, max ) {

        var length = this.length();

        return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

    },

    floor: function () {

        this.x = Math.floor( this.x );
        this.y = Math.floor( this.y );
        this.z = Math.floor( this.z );

        return this;

    },

    ceil: function () {

        this.x = Math.ceil( this.x );
        this.y = Math.ceil( this.y );
        this.z = Math.ceil( this.z );

        return this;

    },

    round: function () {

        this.x = Math.round( this.x );
        this.y = Math.round( this.y );
        this.z = Math.round( this.z );

        return this;

    },

    roundToZero: function () {

        this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
        this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
        this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

        return this;

    },

    negate: function () {

        this.x = - this.x;
        this.y = - this.y;
        this.z = - this.z;

        return this;

    },

    dot: function ( v ) {

        return this.x * v.x + this.y * v.y + this.z * v.z;

    },

    // TODO lengthSquared?

    lengthSq: function () {

        return this.x * this.x + this.y * this.y + this.z * this.z;

    },

    length: function () {

        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    },

    normalize: function () {

        return this.divideScalar( this.length() || 1 );

    },

    setLength: function ( length ) {

        return this.normalize().multiplyScalar( length );

    },

    cross: function ( v, w ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
            return this.crossVectors( v, w );

        }

        return this.crossVectors( this, v );

    },

    crossVectors: function ( a, b ) {

        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;

    },

    projectOnVector: function ( vector ) {

        var scalar = vector.dot( this ) / vector.lengthSq();

        return this.copy( vector ).multiplyScalar( scalar );

    },

    distanceTo: function ( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    },

    distanceToSquared: function ( v ) {

        var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;

    },

    equals: function ( v ) {

        return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

    },
} );


