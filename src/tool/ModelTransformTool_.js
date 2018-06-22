import {ToolBase} from "./ToolBase";

class GizmoMaterial extends THREE.MeshBasicMaterial {
    constructor(parameters) {
        super(parameters);
        //
        this.depthTest = false;
        this.depthWrite = false;
        this.fog = false;
        this.side = THREE.FrontSide;
        this.transparent = true;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }
        };
    }
}

class GizmoLineMaterial extends  THREE.LineBasicMaterial {
    constructor(parameters) {
        super(parameters);
        //
        this.depthTest = false;
        this.depthWrite = false;
        this.fog = false;
        this.transparent = true;
        this.linewidth = 1;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }

        };
    }
}

class TransFormGizmo extends THREE.Object3D{
   constructor() {
       super();
       //
       this.init = ()=> {
           this.handles = new THREE.Object3D();
           this.pickers = new THREE.Object3D();
           this.planes = new THREE.Object3D();

           this.add( this.handles );
           this.add( this.pickers );
           this.add( this.planes );

           //// PLANES

           var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 2, 2 );
           var planeMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.DoubleSide } );

           var planes = {
               "XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
               "YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
               "XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
               "XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
           };

           this.activePlane = planes[ "XYZE" ];

           planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
           planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

           for ( var i in planes ) {

               planes[ i ].name = i;
               this.planes.add( planes[ i ] );
               this.planes[ i ] = planes[ i ];
           }

           //// HANDLES AND PICKERS

           var setupGizmos = function( gizmoMap, parent ) {

               for ( var name in gizmoMap ) {

                   for ( i = gizmoMap[ name ].length; i --; ) {

                       var object = gizmoMap[ name ][ i ][ 0 ];
                       var position = gizmoMap[ name ][ i ][ 1 ];
                       var rotation = gizmoMap[ name ][ i ][ 2 ];

                       object.name = name;

                       object.renderOrder = Infinity; // avoid being hidden by other transparent objects

                       if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                       if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

                       parent.add( object );
                   }
               }
           };

           setupGizmos( this.handleGizmos, this.handles );
           setupGizmos( this.pickerGizmos, this.pickers );

           // reset Transformations

           this.traverse( function ( child ) {

               if ( child instanceof THREE.Mesh ) {

                   child.updateMatrix();

                   var tempGeometry = child.geometry.clone();
                   tempGeometry.applyMatrix( child.matrix );
                   child.geometry = tempGeometry;

                   child.position.set( 0, 0, 0 );
                   child.rotation.set( 0, 0, 0 );
                   child.scale.set( 1, 1, 1 );
               }
           } );

       };

       this.highlight = function ( axis ) {

           this.traverse( function( child ) {

               if ( child.material && child.material.highlight ) {
                   if ( child.name === axis ) {
                       child.material.highlight( true );
                   } else {
                       child.material.highlight( false );
                   }
               }
           } );

       };
   }

    _update(rotation, eye){
        var vec1 = new THREE.Vector3( 0, 0, 0 );
        var vec2 = new THREE.Vector3( 0, 1, 0 );
        var lookAtMatrix = new THREE.Matrix4();

        this.traverse( function( child ) {

            if ( child.name.search( "E" ) !== - 1 ) {
                child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );
            } else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {
                child.quaternion.setFromEuler( rotation );
            }

        } );
    }
}
TransFormGizmo.pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );

class TransformGizmoTranslate extends TransFormGizmo {
    constructor() {
        super();
        //
        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {
            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.pickerGizmos = {
            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), TransFormGizmo.pickerMaterial ) ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), TransFormGizmo.pickerMaterial ), [ 0.2, 0.2, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), TransFormGizmo.pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), TransFormGizmo.pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {
            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {
                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];
            }

            if ( axis === "Y" ) {
                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];
            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];
            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

            if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];
        };

        this.init();
    }
}

class TransformGizmoRotate extends TransFormGizmo {
    constructor() {
        super();
        //
        var CircleGeometry = function ( radius, facing, arc ) {
            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            arc = arc ? arc : 1;

            for ( var i = 0; i <= 64 * arc; ++ i ) {
                if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );
            }

            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            return geometry;
        };

        this.handleGizmos = {
            X: [
                [ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            E: [
                [ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZE: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
            ]
        };

        this.pickerGizmos = {
            X: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), TransFormGizmo.pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), TransFormGizmo.pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), TransFormGizmo.pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            E: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1.25, 0.12, 2, 24 ), TransFormGizmo.pickerMaterial ) ]
            ],

            XYZE: [
                [ new THREE.Mesh() ]// TODO
            ]
        };

        this.init();
    }

    setActivePlane( axis ) {
        if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];
        if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];
        if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];
        if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];
    }

    _update( rotation, eye2 ) {
        super._update(rotation, eye2);

        var tempMatrix = new THREE.Matrix4();
        var worldRotation = new THREE.Euler( 0, 0, 1 );
        var tempQuaternion = new THREE.Quaternion();
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );
        var quaternionX = new THREE.Quaternion();
        var quaternionY = new THREE.Quaternion();
        var quaternionZ = new THREE.Quaternion();
        var eye = eye2.clone();

        worldRotation.copy( this.planes[ "XY" ].rotation );
        tempQuaternion.setFromEuler( worldRotation );

        tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
        eye.applyMatrix4( tempMatrix );

        this.traverse( function( child ) {

            tempQuaternion.setFromEuler( worldRotation );

            if ( child.name === "X" ) {
                quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                child.quaternion.copy( tempQuaternion );
            }

            if ( child.name === "Y" ) {
                quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                child.quaternion.copy( tempQuaternion );
            }

            if ( child.name === "Z" ) {
                quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                child.quaternion.copy( tempQuaternion );
            }

        } );

    }
}

class TransformGizmoScale extends TransFormGizmo {
    constructor() {
        super();
        //
        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), TransFormGizmo.pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.4, 0.4, 0.4 ), TransFormGizmo.pickerMaterial ) ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

        };

        this.init();
    }
}

class ModelTransformTool extends ToolBase{
    constructor(viewer, camera) {
        super(viewer);
        //
        this.tempObj.visible = false;
        this.camera = camera;
        this.object = undefined;
        this.translationSnap = null;
        this.rotationSnap = null;
        this.space = "world";
        this.size = 1;
        this.axis = null;

        let scpoe = this;

        let _mode = "translate";
        let _dragging = false;
        let _gizmo = {
            "translate": new TransformGizmoTranslate(),
            "rotate": new TransformGizmoRotate(),
            "scale": new TransformGizmoScale()
        };

        for(let type in _gizmo) {
            let gizmoObj = _gizmo[ type ];
            gizmoObj.visible = ( type === _mode );
            this.tempObj.add(gizmoObj);
        }

        let ray = new THREE.Raycaster();
        let pointerVector = new THREE.Vector2();

        let point = new THREE.Vector3();
        let offset = new THREE.Vector3();

        let rotation = new THREE.Vector3();
        let offsetRotation = new THREE.Vector3();
        let scale = 1;

        let lookAtMatrix = new THREE.Matrix4();
        let eye = new THREE.Vector3();

        let tempMatrix = new THREE.Matrix4();
        let tempVector = new THREE.Vector3();
        let tempQuaternion = new THREE.Quaternion();
        let unitX = new THREE.Vector3( 1, 0, 0 );
        let unitY = new THREE.Vector3( 0, 1, 0 );
        let unitZ = new THREE.Vector3( 0, 0, 1 );

        let quaternionXYZ = new THREE.Quaternion();
        let quaternionX = new THREE.Quaternion();
        let quaternionY = new THREE.Quaternion();
        let quaternionZ = new THREE.Quaternion();
        let quaternionE = new THREE.Quaternion();

        let oldPosition = new THREE.Vector3();
        let oldScale = new THREE.Vector3();
        let oldRotationMatrix = new THREE.Matrix4();

        let parentRotationMatrix  = new THREE.Matrix4();
        let parentScale = new THREE.Vector3();

        let worldPosition = new THREE.Vector3();
        let worldRotation = new THREE.Euler();
        let worldRotationMatrix  = new THREE.Matrix4();
        let camPosition = new THREE.Vector3();
        let camRotation = new THREE.Euler();


        this.attach = (object)=> {
            this.object = object;
            this.tempObj.visible = true;
            this.tempObj.updateTransform();
        };

        this.detach = ()=> {
            this.object = undefined;
            this.tempObj.visible = false;
            this.axis = null;
        };

        this.getMode = ()=> {
            return _mode;
        };

        this.setMode = (mode)=>{
            _mode = mode ? mode : _mode;
            //if(_mode === "scale") this.space = "local";
            for(let type in _gizmo) _gizmo[type].visible = (type === _mode);
            this.tempObj.updateTransform();
        };

        this.setRotationSnap = (rotationSnap)=> {
            this.rotationSnap = rotationSnap;
        };

        this.setSize = (size)=> {
            this.size = size;
            this.tempObj.updateTransform();
        };

        this.setSpace = (space)=> {
            this.space = space;
            this.tempObj.updateTransform();
        };


        this.tempObj.update = ()=> {
            /*scale = 150 *(worldPosition.dot(this.camera.pixelSizeVector)+ this.camera.pixelSizeVector.w);
            scale = scale > 0 ? scale : -scale;
            scale*=this.size;
            this.tempObj.position.copy(worldPosition);
            this.tempObj.scale.set(scale, scale, scale);*/
            this.tempObj.updateTransform();
        };

        this.tempObj.updateTransform = ()=> {
            if(!this.object) return;
            //
            this.object.updateMatrixWorld();
            worldPosition.setFromMatrixPosition(this.object.matrixWorld);
            worldRotation.setFromRotationMatrix(tempMatrix.extractRotation(this.object.matrixWorld));

            this.camera.updateMatrixWorld();
            camPosition.setFromMatrixPosition(this.camera.matrixWorld);
            camRotation.setFromRotationMatrix(tempMatrix.extractRotation(this.camera.matrixWorld));

            //scale = worldPosition.distanceTo(camPosition) / 10 * this.size;
            scale = 150 *(worldPosition.dot(this.camera.pixelSizeVector)+ this.camera.pixelSizeVector.w);
            scale = scale > 0 ? scale : -scale;
            scale*=this.size;
            this.tempObj.position.copy(worldPosition);
            this.tempObj.scale.set(scale, scale, scale);

            if(this.camera instanceof THREE.PerspectiveCamera) {
                eye.copy( camPosition ).sub( worldPosition ).normalize();
            }
            else if(this.camera instanceof  THREE.OrthographicCamera) {
                eye.copy( camPosition ).normalize();
            }
            //
            if(this.space === "local") {
                _gizmo[_mode]._update(worldRotation, eye);
            }
            else if(this.space === "world") {
                _gizmo[_mode]._update(new THREE.Euler(), eye);
            }
            //
            _gizmo[_mode].highlight(this.axis);
        };


        let intersectObjects = ( pos, objects )=> {

            let mouse = new THREE.Vector2();

            mouse.x = ( pos.x / window.innerWidth ) * 2 - 1;
            mouse.y = - ( pos.y / window.innerHeight ) * 2 + 1;

            ray.setFromCamera( mouse, camera );

            var intersections = ray.intersectObjects( objects, true );
            return intersections[ 0 ] ? intersections[ 0 ] : false;
        };

        this.onLeftDown = (mouseEvent)=> {
            const clientX = mouseEvent.clientX;
            const clientY = mouseEvent.clientY;
            //
            if(!this.object)
                return false;
            //
            if(_dragging)
                return false;
            //
            let intersect = intersectObjects(new THREE.Vector2(clientX, clientY), _gizmo[ _mode ].pickers.children);
            if(!intersect)
                return false;
            //
            this.axis = intersect.object.name;
            //this.tempObj.updateTransform();
            eye.copy(camPosition).sub(worldPosition).normalize();
            _gizmo[ _mode ].setActivePlane( this.axis, eye );
            let planeIntersect = intersectObjects(new THREE.Vector2(clientX, clientY), [ _gizmo[ _mode ].activePlane ]);
            if(planeIntersect) {
                oldPosition.copy(this.object.position);
                oldScale.copy( this.object.scale );

                oldRotationMatrix.extractRotation( this.object.matrix );
                worldRotationMatrix.extractRotation( this.object.matrixWorld );

                parentRotationMatrix.extractRotation( this.object.parent.matrixWorld );
                parentScale.setFromMatrixScale( tempMatrix.getInverse( this.object.parent.matrixWorld ) );

                offset.copy( planeIntersect.point );
            }
            //
            _dragging = true;
            //
            return true;
        };

        this.onMiddleDown = (mouseEvent)=> {
            return false;
        };

        this.onRightDown = (mouseEvent)=> {
            return false;
        };

        this.onLeftUp = (mouseEvent)=> {
            if(_dragging && (this.axis !== null)) {

            }
            //
            _dragging = false;
            //
            return false;
        };

        this.onMiddleUp = (mouseEvent)=> {
            return false;
        };

        this.onRightUp = (mouseEvent)=> {
            return false;
        };

        this.onMouseMove = (mouseEvent)=> {
            const clientX = mouseEvent.clientX;
            const clientY = mouseEvent.clientY;
            //
            if(!this.object) {
                return false;
            }
            //
            if(!_dragging) {
               let intersect = intersectObjects(new THREE.Vector2(clientX, clientY), _gizmo[ _mode ].pickers.children);
               let axis = null;
               if(intersect) {
                   axis = intersect.object.name;
               }
               //
                if(this.axis !== axis) {
                   this.axis = axis;
                   this.tempObj.updateTransform();
                }
                //
                return false;
            }
            else if(this.axis){
                let planeIntersect = intersectObjects(new THREE.Vector2(clientX, clientY), [ _gizmo[ _mode ].activePlane ]);
                if(!planeIntersect)
                    return false;
                //
                point.copy(planeIntersect.point);
                //
                if(_mode === "translate") {
                    point.sub(offset);
                    point.multiply(parentScale);
                    //
                    if(this.space === "local") {
                        point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));
                        if(this.axis.search("X") === -1) point.x = 0;
                        if(this.axis.search("Y") === -1) point.y = 0;
                        if(this.axis.search("Z") === -1) point.z = 0;
                        point.applyMatrix4(oldRotationMatrix);

                        this.object.position.copy(oldPosition);
                        this.object.position.add(point);
                    }
                    if(this.space === "world" || this.axis.search("XYZ") !== -1) {
                        if ( this.axis.search( "X" ) === - 1 ) point.x = 0;
                        if ( this.axis.search( "Y" ) === - 1 ) point.y = 0;
                        if ( this.axis.search( "Z" ) === - 1 ) point.z = 0;

                        point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

                        this.object.position.copy( oldPosition );
                        this.object.position.add( point );
                    }
                    if(this.translationSnap !== null) {
                        if ( this.space === "local" ) {
                            this.object.position.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );
                        }

                        if ( this.axis.search( "X" ) !== - 1 ) this.object.position.x = Math.round( this.object.position.x / this.translationSnap ) * this.translationSnap;
                        if ( this.axis.search( "Y" ) !== - 1 ) this.object.position.y = Math.round( this.object.position.y / this.translationSnap ) * this.translationSnap;
                        if ( this.axis.search( "Z" ) !== - 1 ) this.object.position.z = Math.round( this.object.position.z / this.translationSnap ) * this.translationSnap;
                        if ( this.space === "local" ) {
                            this.object.position.applyMatrix4( worldRotationMatrix );
                        }
                    }
                }
                else if( _mode === "scale") {
                    point.sub( offset );
                    point.multiply( parentScale );
                    if(point.length() < 0.000001)
                        return true;
                    //
                    if ( this.space === "local" ) {
                        if ( this.axis === "XYZ" ) {
                            scale = 1 + ( ( point.y ) / Math.max( oldScale.x, oldScale.y, oldScale.z ) );
                            this.object.scale.x = oldScale.x * scale;
                            this.object.scale.y = oldScale.y * scale;
                            this.object.scale.z = oldScale.z * scale;
                        } else {
                            point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );
                            if ( this.axis === "X" ) this.object.scale.x = oldScale.x * ( 1 + point.x);
                            if ( this.axis === "Y" ) this.object.scale.y = oldScale.y * ( 1 + point.y);
                            if ( this.axis === "Z" ) this.object.scale.z = oldScale.z * ( 1 + point.z);
                        }
                    }
                    else {
                        if ( this.axis === "XYZ" ) {
                            let sign = point.y > 0 ? 1 : -1;
                            scale = 1 + ( ( point.length()*sign ) / Math.max( oldScale.x, oldScale.y, oldScale.z ) )*0.05;
                            this.object.scale.x = oldScale.x * scale;
                            this.object.scale.y = oldScale.y * scale;
                            this.object.scale.z = oldScale.z * scale;
                        } else {
                            //point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );
                            if ( this.axis === "X" )  {
                                let axix_x = new THREE.Vector3(point.x,0,0);
                                axix_x.applyMatrix4(tempMatrix.getInverse( worldRotationMatrix ));
                                this.object.scale.x = oldScale.x * ( 1 + axix_x.x*0.05);
                                this.object.scale.y = oldScale.y * ( 1 + axix_x.y*0.05);
                                this.object.scale.z = oldScale.z * ( 1 + axix_x.z*0.05);
                            }
                            if ( this.axis === "Y" )  {
                                let axix_x = new THREE.Vector3(0,point.y,0);
                                axix_x.applyMatrix4(tempMatrix.getInverse( worldRotationMatrix ));
                                this.object.scale.x = oldScale.x * ( 1 + axix_x.x*0.05);
                                this.object.scale.y = oldScale.y * ( 1 + axix_x.y*0.05);
                                this.object.scale.z = oldScale.z * ( 1 + axix_x.z*0.05);
                            }
                            if ( this.axis === "Z" )  {
                                let axix_x = new THREE.Vector3(0,0,point.z);
                                axix_x.applyMatrix4(tempMatrix.getInverse( worldRotationMatrix ));
                                this.object.scale.x = oldScale.x * ( 1 + axix_x.x*0.05);
                                this.object.scale.y = oldScale.y * ( 1 + axix_x.y*0.05);
                                this.object.scale.z = oldScale.z * ( 1 + axix_x.z*0.05);
                            }
                        }
                    }
                }
                else if( _mode === "rotate") {
                    point.sub( worldPosition );
                    point.multiply( parentScale );
                    if(point.length() < 0.0001)
                        return true;
                    tempVector.copy( offset ).sub( worldPosition );
                    tempVector.multiply( parentScale );

                    if ( this.axis === "E" ) {

                        point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
                        tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

                        rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                        offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                        tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                        quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
                        quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                        this.object.quaternion.copy( tempQuaternion );

                    } else if ( this.axis === "XYZE" ) {

                        quaternionE.setFromEuler( point.clone().cross( tempVector ).normalize() ); // rotation axis

                        tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
                        quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo( tempVector ) );
                        quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                        this.object.quaternion.copy( tempQuaternion );

                    } else if ( this.space === "local" ) {

                        point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                        tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                        rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                        offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                        quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );

                        if ( this.rotationSnap !== null ) {

                            quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                            quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                            quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                        } else {

                            quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                            quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                            quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                        }

                        if ( this.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
                        if ( this.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
                        if ( this.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

                        this.object.quaternion.copy( quaternionXYZ );

                    } else if ( this.space === "world" ) {

                        rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                        offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                        tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                        if ( this.rotationSnap !== null ) {

                            quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                            quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                            quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                        } else {

                            quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                            quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                            quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                        }

                        quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                        if ( this.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                        if ( this.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                        if ( this.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                        this.object.quaternion.copy( tempQuaternion );
                    }
                }
                this.tempObj.updateTransform();
                //
                return true;
            }
            //
            return false;
        };

        this.onMouseWheel = (wheelEvent)=> {
            return false;
        };

        this.onKeyDown = (keyboardEvent)=> {
            switch ( keyboardEvent.keyCode ) {

                case 81: // Q
                    this.setSpace( this.space === "local" ? "world" : "local" );
                    return true;

                case 17: // Ctrl
                    this.setTranslationSnap( 100 );
                    this.setRotationSnap( THREE.Math.degToRad( 15 ) );
                    return true;

                case 87: // W
                    this.setMode( "translate" );
                    return true;

                case 69: // E
                    this.setMode( "rotate" );
                    return true;

                case 82: // R
                    this.setMode( "scale" );
                    return true;

                case 187:
                case 107: // +, =, num+
                    this.setSize( this.size + 0.1 );
                    return true;

                case 189:
                case 109: // -, _, num-
                    this.setSize( Math.max( this.size - 0.1, 0.1 ) );
                    return true;

            }
            return false;
        }

        this.onKeyUp = (keyboardEvent)=> {
            switch ( keyboardEvent.keyCode ) {

                case 17: // Ctrl
                    this.setTranslationSnap( null );
                    this.setRotationSnap( null );
                    return true;

            }
            return false;
        }
    }
}

export {ModelTransformTool};
