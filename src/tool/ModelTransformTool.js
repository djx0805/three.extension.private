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

class TransformHandler extends THREE.Object3D {
    constructor(viewer, camera) {
        super();
        //
        this.viewer = viewer;
        this.camera = camera;
        this.object = null;
        this.axis = undefined;
        //
        this.space = "world";
        //
        this.scaleRatio = 1;
        //
        let ray = new THREE.Raycaster();
        this.intersectObjects = (pos, objects, linePrecision = 1)=> {
            let mouse = new THREE.Vector2();

            mouse.x = ( pos.x / this.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( pos.y / this.viewer.domElement.clientHeight ) * 2 + 1;

            this.camera.updateMatrixWorld();
            ray.setFromCamera( mouse, this.camera );
            ray.linePrecision = linePrecision;

            var intersections = ray.intersectObjects( objects, true );
            if(intersections.length > 0)
                return  intersections[ 0 ];
            //
            return false;
            return intersections[ 0 ] ? intersections[ 0 ] : false;
        }
    }
    //
    highlight( axis ) {
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
    //
    _update() {
        if(!this.object)
            return;
        //
        let worldPosition = new THREE.Vector3();
        let worldRotation = new THREE.Euler();
        let camPosition = new THREE.Vector3();
        let camRotation = new THREE.Euler();
        let eye = new THREE.Vector3();
        let tempMatrix = new THREE.Matrix4();
        //
        worldPosition.setFromMatrixPosition(this.object.matrixWorld);
        worldRotation.setFromRotationMatrix(tempMatrix.extractRotation(this.object.matrixWorld));

        this.camera.updateMatrixWorld();
        camPosition.setFromMatrixPosition(this.camera.matrixWorld);
        camRotation.setFromRotationMatrix(tempMatrix.extractRotation(this.camera.matrixWorld));

        if(this.camera instanceof THREE.PerspectiveCamera) {
            eye.copy( camPosition ).sub( worldPosition ).normalize();
        }
        else if(this.camera instanceof  THREE.OrthographicCamera) {
            eye.copy( camPosition ).normalize();
        }
        //
        var vec1 = new THREE.Vector3( 0, 0, 0 );
        var vec2 = new THREE.Vector3( 0, 1, 0 );
        var lookAtMatrix = new THREE.Matrix4();
        //
        if(this.space === "local") {
            this.traverse( function( child ) {
                if ( child.name.search( "E" ) !== - 1 ) {
                    child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );
                } else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {
                    child.quaternion.setFromEuler( worldRotation );
                }
            } );
            //
            return {worldRotation:worldRotation, eye:eye};
        }
        else if(this.space === "world") {
            this.traverse( function( child ) {
                if ( child.name.search( "E" ) !== - 1 ) {
                    child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );
                } else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {
                    child.quaternion.setFromEuler( new THREE.Euler() );
                }
            } );
            //
            return {worldRotation:new THREE.Euler(), eye:eye};
        }
    }
}

class TranslateHandler extends TransformHandler {
    constructor(viewer, camera) {
        super(viewer, camera);
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
                [ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
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

        let pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );
        this.pickerGizmos = {
            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
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
        //
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
        //
        this.dispose = ()=>{
            for(let obj in this.children) {
                if(obj.geometry)
                    obj.geometry.dispose();
                if(obj.material)
                    obj.material.dispose();
            }
        };
        //////
        let eye = new THREE.Vector3();
        let oldPosition = new THREE.Vector3();
        let oldScale = new THREE.Vector3();
        let oldRotationMatrix = new THREE.Matrix4();
        let parentRotationMatrix  = new THREE.Matrix4();
        let parentScale = new THREE.Vector3();

        let worldPosition = new THREE.Vector3();
        let worldRotationMatrix  = new THREE.Matrix4();
        let camPosition = new THREE.Vector3();
        let tempMatrix = new THREE.Matrix4();

        let point = new THREE.Vector3();
        let offset = new THREE.Vector3();
        //
        this.onLeftUp = ()=> {
            return false;
        }
        //
        this.onLeftDown = (mouseEvent)=> {
            if(!this.object || mouseEvent.button !== THREE.MOUSE.LEFT)
                return false;
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), this.pickers.children);
            if(!intersect) {
                this.axis = undefined;
                return false;
            }
            //
            worldPosition.setFromMatrixPosition(this.object.matrixWorld);
            eye.copy(camPosition).sub(worldPosition).normalize();
            this.axis = intersect.object.name;
            this.setActivePlane(this.axis, eye);
            let planeIntersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), [this.activePlane]);
            if(planeIntersect) {
                oldPosition.copy(this.object.position);
                oldScale.copy( this.object.scale );

                oldRotationMatrix.extractRotation( this.object.matrix );
                worldRotationMatrix.extractRotation( this.object.matrixWorld );

                parentRotationMatrix.extractRotation( this.object.parent.matrixWorld );
                parentScale.setFromMatrixScale( tempMatrix.getInverse( this.object.parent.matrixWorld ) );

                offset.copy( planeIntersect.point );
                //
                return true;
            }
            //
            return false;
        };

        this.onMouseMove = (mouseEvent)=> {
            if(!this.object)
                return false;
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let planeIntersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), [ this.activePlane ]);
            if(!planeIntersect)
                return false;
            //
            point.copy(planeIntersect.point);
            //
            if(!mouseEvent.buttons || mouseEvent.button !== THREE.MOUSE.LEFT) {
                let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), this.pickers.children);
                let axis = null;
                if(intersect) {
                    axis = intersect.object.name;
                }
                //
                if(this.axis !== axis) {
                    this.axis = axis;
                    this.highlight(this.axis);
                }
                //
                return false;
            }
            else if(this.axis && mouseEvent.buttons && mouseEvent.button === THREE.MOUSE.LEFT) {
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
                if(this.translationSnap) {
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
                //
                return true;
            }
            //
            return false;
        };
    }
}



class RotateHandler extends TransformHandler {
    constructor(viewer, camera) {
        super(viewer, camera);
        //
        var CircleGeometry = function ( radius, facing, arc ) {
            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            arc = arc ? arc : 1;

            for ( var i = 0; i <= 128 * arc; ++ i ) {
                if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 64 * Math.PI ) * radius, Math.sin( i / 64 * Math.PI ) * radius );
                if ( facing === 'y' ) vertices.push( Math.cos( i / 64 * Math.PI ) * radius, 0, Math.sin( i / 64 * Math.PI ) * radius );
                if ( facing === 'z' ) vertices.push( Math.sin( i / 64 * Math.PI ) * radius, Math.cos( i / 64 * Math.PI ) * radius, 0 );
            }

            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            return geometry;
        };
        //
        this.activeHandleGizmos = null;
        this.scaleRatio = 20;
        //
        let tangentGizmo = null;
        //
        this.handleGizmos = {
            X: new THREE.Line( new CircleGeometry( 20, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ),
            Y: new THREE.Line( new CircleGeometry( 20, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ),
            Z: new THREE.Line( new CircleGeometry( 20, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ),
            E: new THREE.Line( new CircleGeometry( 25, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ),
            XYZE: new THREE.Line( new CircleGeometry( 20, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) )
        };
        for(let name in this.handleGizmos) {
            this.handleGizmos[name].name = name;
            this.handleGizmos[name].renderOrder = Infinity;
            this.add(this.handleGizmos[name]);
        }
        //
        this.dispose = ()=>{
            for(let obj in this.children) {
                if(obj.geometry)
                    obj.geometry.dispose();
                if(obj.material)
                    obj.material.dispose();
            }
        };
        //
        let basePoint = null;
        let projBaseP = null;
        let toPoint = null;
        let projToP = null;
        let toPoint1 = null;
        let projToP1 = null;

        let rotateAxis = null;
        let rotateCenter = null;
        let invMW = null;
        let oldMX = 0;
        let oldMY = 0;

        let worldPosition = new THREE.Vector3();
        let cameraPosition = new THREE.Vector3();
        let worldScale = new THREE.Vector3();
        let oldRotationMatrix = new THREE.Matrix4();
        let worldRotationMatrix = new THREE.Matrix4();
        let parentRotationMatrix = new THREE.Matrix4();
        let tempMatrix = new THREE.Matrix4();
        let tempQuaternion = new THREE.Quaternion();
        let unitX = new THREE.Vector3( 1, 0, 0 );
        let unitY = new THREE.Vector3( 0, 1, 0 );
        let unitZ = new THREE.Vector3( 0, 0, 1 );

        let quaternionXYZ = new THREE.Quaternion();
        let quaternionX = new THREE.Quaternion();
        let quaternionY = new THREE.Quaternion();
        let quaternionZ = new THREE.Quaternion();
        let quaternionE = new THREE.Quaternion();

        let rayCaster = new THREE.Raycaster();
        //
        this.onLeftUp = (mouseEvent)=> {
            if(this.activeHandleGizmos) {
                this.activeHandleGizmos.remove(tangentGizmo);
                tangentGizmo.children[0].geometry.dispose();
                tangentGizmo.children[0].material.dispose();
                tangentGizmo.children[1].geometry.dispose();
                tangentGizmo.children[1].material.dispose();
                tangentGizmo = null;
                this.activeHandleGizmos = null;
                return true;
            }//
            return false;
        };
        this.onLeftDown = (mouseEvent) => {
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            if(this.activeHandleGizmos) {
                this.activeHandleGizmos.remove(tangentGizmo);
                tangentGizmo.children[0].geometry.dispose();
                tangentGizmo.children[0].material.dispose();
                tangentGizmo.children[1].geometry.dispose();
                tangentGizmo.children[1].material.dispose();
                tangentGizmo = null;
                this.activeHandleGizmos = null;
            }
            //
            let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), [this.handleGizmos.X, this.handleGizmos.Y, this.handleGizmos.Z, this.handleGizmos.E], 1);
            if(intersect) {
                this.axis = intersect.object.name;
                basePoint = intersect.point.clone();
                projBaseP = basePoint.clone().applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                if(this.axis === "X") {
                    rotateAxis = new THREE.Vector3(1,0,0);
                    let mm = new THREE.Matrix4();
                    mm.getInverse(this.handleGizmos.X.matrixWorld);
                    invMW = mm.clone();
                    mm.transpose();
                    rotateAxis.applyMatrix4(mm).normalize();
                    rotateCenter = (new THREE.Vector3(0,0,0)).applyMatrix4(this.handleGizmos.X.matrixWorld);
                    //
                    this.activeHandleGizmos = this.handleGizmos.X;
                }
                else  if(this.axis === "Y") {
                    rotateAxis = new THREE.Vector3(0,1,0);
                    let mm = new THREE.Matrix4();
                    mm.getInverse(this.handleGizmos.Y.matrixWorld);
                    invMW = mm.clone();
                    mm.transpose();
                    rotateAxis.applyMatrix4(mm).normalize();
                    rotateCenter = (new THREE.Vector3(0,0,0)).applyMatrix4(this.handleGizmos.Y.matrixWorld);
                    //
                    this.activeHandleGizmos = this.handleGizmos.Y;
                }
                else if(this.axis === "Z") {
                    rotateAxis = new THREE.Vector3(0,0,1);
                    let mm = new THREE.Matrix4();
                    mm.getInverse(this.handleGizmos.Z.matrixWorld);
                    invMW = mm.clone();
                    mm.transpose();
                    rotateAxis.applyMatrix4(mm).normalize();
                    rotateCenter = (new THREE.Vector3(0,0,0)).applyMatrix4(this.handleGizmos.Z.matrixWorld);
                    //
                    this.activeHandleGizmos = this.handleGizmos.Z;
                }
                else if(this.axis === "E") {
                    rotateAxis = new THREE.Vector3(0,0,1);
                    let mm = new THREE.Matrix4();
                    mm.getInverse(this.handleGizmos.E.matrixWorld);
                    invMW = mm.clone();
                    mm.transpose();
                    rotateAxis.applyMatrix4(mm).normalize();
                    rotateCenter = (new THREE.Vector3(0,0,0)).applyMatrix4(this.handleGizmos.E.matrixWorld);
                    //
                    this.activeHandleGizmos = this.handleGizmos.E;
                }
                //
                let tangent = basePoint.clone().sub(rotateCenter).cross(rotateAxis).normalize();
                let tmpP = basePoint.clone().add(tangent.clone().multiplyScalar(100));
                toPoint = tmpP.clone();
                projToP = toPoint.clone().applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                toPoint1 = basePoint.clone().add(tangent.clone().multiplyScalar(-100));
                projToP1 = toPoint1.clone().applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                let p0 = basePoint.clone().applyMatrix4(invMW);
                let p1 = tmpP.applyMatrix4(invMW);
                p1 = p0.clone().add(p1.sub(p0).normalize().multiplyScalar(25));
                let p2 = p0.clone().add(p1.clone().sub(p0).normalize().multiplyScalar(-25));
                //
                tangentGizmo = new THREE.Group();
                tangentGizmo.position.copy(p0);
                //
                let geometry = new THREE.BufferGeometry();
                let vertices = [0, 0, 0, p1.x - p0.x, p1.y - p0.y, p1.z - p0.z];
                geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
                let line0 = new THREE.Line( geometry, new GizmoLineMaterial( { color: 0x787878 } ) );
                line0.renderOrder = Infinity;
                tangentGizmo.add(line0);
                //
                let geometry1 = new THREE.BufferGeometry();
                let vertices1 = [0, 0, 0, p2.x - p0.x, p2.y - p0.y, p2.z - p0.z];
                geometry1.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
                let line1 = new THREE.Line( geometry1, new GizmoLineMaterial( { color: 0x787878 } ) );
                line1.renderOrder = Infinity;
                tangentGizmo.add(line1);
                //
                this.activeHandleGizmos.add(tangentGizmo);
                //
                return true;
            }
            //
        };

        this.onMouseMove = (mouseEvent)=> {
            if(!this.object) {
                oldMX = mouseEvent.offsetX;
                oldMY = mouseEvent.offsetY;
                return false;
            }
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            if(!mouseEvent.buttons || mouseEvent.button !== THREE.MOUSE.LEFT) {
                let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), [this.handleGizmos.X, this.handleGizmos.Y, this.handleGizmos.Z, this.handleGizmos.E], 1);
                let axis = null;
                if(intersect) {
                    axis = intersect.object.name;
                }
                //
                if(this.axis !== axis) {
                    this.axis = axis;
                    this.highlight(this.axis);
                }
                //
                oldMX = mouseEvent.offsetX;
                oldMY = mouseEvent.offsetY;
                return false;
            }
            else if(this.axis && mouseEvent.buttons && mouseEvent.button === THREE.MOUSE.LEFT) {
                let deltaX = mouseEvent.offsetX - oldMX;
                let deltaY = oldMY - mouseEvent.offsetY;
                //
                let p = new THREE.Vector2(projBaseP.x, projBaseP.y);
                let p0 = new THREE.Vector2(projToP.x, projToP.y);
                let p1 = new THREE.Vector2(projToP1.x, projToP1.y);
                let p0_p = p0.clone().sub(p).normalize();
                let p1_p = p1.clone().sub(p).normalize();
                let delta = new THREE.Vector2(deltaX, deltaY);
                let delta_p0 = delta.clone().dot(p0_p);
                let delta_p1 = delta.clone().dot(p1_p);
                if(delta_p0 > 0) {
                    tangentGizmo.children[0].material.highlight(true);
                    tangentGizmo.children[1].material.highlight(false);
                }
                else if(delta_p1 > 0) {
                    tangentGizmo.children[1].material.highlight(true);
                    tangentGizmo.children[0].material.highlight(false);
                }
                //
                if(this.space === "world") {
                    this.object.matrixWorld.decompose(worldPosition, quaternionXYZ, worldScale);
                    //worldPosition.setFromMatrixPosition(this.object.matrixWorld);
                    parentRotationMatrix.extractRotation( this.object.parent.matrixWorld );
                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
                    worldRotationMatrix.extractRotation(this.object.matrixWorld);
                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
                    //quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );
                    //
                    let angle = 0;
                    if(delta_p0 > 0)
                        angle = delta_p0*Math.PI/360;
                    if(delta_p1 > 0)
                        angle = -delta_p1*Math.PI/360;
                    //
                    if(this.axis === "X") {
                        quaternionX.setFromAxisAngle( unitX, angle );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    }
                    else if(this.axis === "Y") {
                        quaternionY.setFromAxisAngle( unitY, angle );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    }
                    else if(this.axis === "Z") {
                        quaternionZ.setFromAxisAngle( unitZ, angle );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                    }
                    else if(this.axis === "E") {
                        cameraPosition.setFromMatrixPosition(this.camera.matrixWorld);
                        let eye = worldPosition.clone().sub(cameraPosition).normalize();
                        quaternionE.setFromAxisAngle( eye, angle );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
                    }
                    //
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    this.object.quaternion.copy( tempQuaternion );
                }
                else if(this.space === "local") {

                }
                //
                oldMX = mouseEvent.offsetX;
                oldMY = mouseEvent.offsetY;
                return true;
            }
            //
            oldMX = mouseEvent.offsetX;
            oldMY = mouseEvent.offsetY;
        };
    }

    _update() {
        let info = super._update();
        var tempMatrix = new THREE.Matrix4();
        var worldRotation = info.worldRotation.clone();
        var tempQuaternion = new THREE.Quaternion();
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );
        var quaternionX = new THREE.Quaternion();
        var quaternionY = new THREE.Quaternion();
        var quaternionZ = new THREE.Quaternion();
        var eye = info.eye.clone();

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


class ScaleHandler extends TransformHandler {
    constructor(viewer, camera) {
        super(viewer, camera);
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

        let pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );
        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
            ]

        };

        this.handles = new THREE.Object3D();
        this.pickers = new THREE.Object3D();

        this.add( this.handles );
        this.add( this.pickers );

        //// HANDLES AND PICKERS

        var setupGizmos = function( gizmoMap, parent ) {

            for ( var name in gizmoMap ) {

                for ( let i = gizmoMap[ name ].length; i --; ) {

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
        //
        this.dispose = ()=>{
            for(let obj in this.children) {
                if(obj.geometry)
                    obj.geometry.dispose();
                if(obj.material)
                    obj.material.dispose();
            }
        };
        //
        let oldScale = new THREE.Vector3();

        let worldPosition = new THREE.Vector3();
        let worldRotationMatrix  = new THREE.Matrix4();
        let tempMatrix = new THREE.Matrix4();

        let point = new THREE.Vector3();

        let oldMx = 0;
        let oldMy = 0;
        //
        this.onLeftUp = ()=> {
            return false;
        }
        //
        this.onLeftDown = (mouseEvent)=> {
            if(!this.object || mouseEvent.button !== THREE.MOUSE.LEFT)
                return false;
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), this.pickers.children);
            if(!intersect) {
                this.axis = undefined;
                return false;
            }
            //
            worldRotationMatrix.extractRotation( this.object.matrixWorld );
            //
            return true;
        };

        this.onMouseMove = (mouseEvent)=> {
            if(!this.object) {
                oldMx = mouseEvent.offsetX;
                oldMy = mouseEvent.offsetY;
                return false;
            }
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            if(!mouseEvent.buttons || mouseEvent.button !== THREE.MOUSE.LEFT) {
                let intersect = this.intersectObjects(new THREE.Vector2(clientX, clientY), this.pickers.children);
                let axis = null;
                if(intersect) {
                    axis = intersect.object.name;
                }
                //
                if(this.axis !== axis) {
                    this.axis = axis;
                    this.highlight(this.axis);
                }
                //
                oldMx = mouseEvent.offsetX;
                oldMy = mouseEvent.offsetY;
                return false;
            }
            else if(this.axis && mouseEvent.buttons && mouseEvent.button === THREE.MOUSE.LEFT) {
                worldPosition = this.object.position.clone();
                oldScale = this.object.scale.clone();
                //
                let projCenter = worldPosition.clone().applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                //
                if ( this.space === "local" ) {
                    if ( this.axis === "XYZ" ) {
                        let scale = 1 + ( ( point.y ) / Math.max( oldScale.x, oldScale.y, oldScale.z ) );
                        this.object.scale.x = oldScale.x * scale;
                        this.object.scale.y = oldScale.y * scale;
                        this.object.scale.z = oldScale.z * scale;
                    } else {
                        point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );
                        if ( this.axis === "X" ) this.object.scale.x = oldScale.x * ( 1 + point.x);
                        if ( this.axis === "Y" ) this.object.scale.y = oldScale.y * ( 1 + point.y);
                        if ( this.axis === "Z" ) this.object.scale.z = oldScale.z * ( 1 + point.z);
                    }
                    //
                    oldMx = mouseEvent.offsetX;
                    oldMy = mouseEvent.offsetY;
                    return true;
                }
                else {
                    let proj_x = worldPosition.clone().add(new THREE.Vector3(10, 0, 0)).applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                    let dir_x = proj_x.sub(projCenter);
                    let dir_wx = (new THREE.Vector2(dir_x.x, dir_x.y)).normalize();
                    //
                    let proj_y = worldPosition.clone().add(new THREE.Vector3(0, 10, 0)).applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                    let dir_y = proj_y.sub(projCenter);
                    let dir_wy = (new THREE.Vector2(dir_y.x, dir_y.y)).normalize();
                    //
                    let proj_z = worldPosition.clone().add(new THREE.Vector3(0, 0, 10)).applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                    let dir_z = proj_z.sub(projCenter);
                    let dir_wz = (new THREE.Vector2(dir_z.x, dir_z.y)).normalize();
                    //
                    let proj_e = worldPosition.clone().add(new THREE.Vector3(10, 10, 10)).applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix);
                    let dir_e = proj_e.sub(projCenter);
                    let dir_we = (new THREE.Vector2(dir_e.x, dir_e.y)).normalize();
                    //
                    let dir_m = new THREE.Vector2(clientX - oldMx, oldMy - clientY);
                    //
                    if ( this.axis === "XYZ" ) {
                        let axix_x = new THREE.Vector3(1,0,0);
                        axix_x.applyMatrix4(worldRotationMatrix).normalize();
                        let axix_y = new THREE.Vector3(0,1,0);
                        axix_y.applyMatrix4(worldRotationMatrix).normalize();
                        let axix_z = new THREE.Vector3(0,0,1);
                        axix_z.applyMatrix4(worldRotationMatrix).normalize();

                        point.x = 0; point.y = 0; point.z = 0;
                        let sign = 1;
                        point.x = dir_m.clone().dot(dir_we)*0.01;
                        point.y = point.x;
                        point.z = point.x;
                        if(point.x < 0){
                            sign = -1;
                        }
                        this.object.scale.x = oldScale.x * ( 1 + Math.abs(axix_x.dot(point))*sign);
                        this.object.scale.y = oldScale.y * ( 1 + Math.abs(axix_y.dot(point))*sign);
                        this.object.scale.z = oldScale.z * ( 1 + Math.abs(axix_z.dot(point))*sign);
                    } else {
                        if ( this.axis === "X" )  {
                            let axix_x = new THREE.Vector3(1,0,0);
                            axix_x.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_y = new THREE.Vector3(0,1,0);
                            axix_y.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_z = new THREE.Vector3(0,0,1);
                            axix_z.applyMatrix4(worldRotationMatrix).normalize();

                            point.x = 0; point.y = 0; point.z = 0;
                            let sign = 1;
                            point.x = dir_m.clone().dot(dir_wx)*0.01;
                            if(point.x < 0){
                                sign = -1;
                            }
                            this.object.scale.x = oldScale.x * ( 1 + Math.abs(axix_x.dot(point))*sign);
                            this.object.scale.y = oldScale.y * ( 1 + Math.abs(axix_y.dot(point))*sign);
                            this.object.scale.z = oldScale.z * ( 1 + Math.abs(axix_z.dot(point))*sign);
                        }
                        if ( this.axis === "Y" )  {
                            let axix_x = new THREE.Vector3(1,0,0);
                            axix_x.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_y = new THREE.Vector3(0,1,0);
                            axix_y.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_z = new THREE.Vector3(0,0,1);
                            axix_z.applyMatrix4(worldRotationMatrix).normalize();

                            point.x = 0; point.y = 0; point.z = 0;
                            let sign = 1;
                            point.y = dir_m.clone().dot(dir_wy)*0.01;
                            if(point.y < 0){
                                sign = -1;
                            }
                            this.object.scale.x = oldScale.x * ( 1 + Math.abs(axix_x.dot(point))*sign);
                            this.object.scale.y = oldScale.y * ( 1 + Math.abs(axix_y.dot(point))*sign);
                            this.object.scale.z = oldScale.z * ( 1 + Math.abs(axix_z.dot(point))*sign);
                        }
                        if ( this.axis === "Z" )  {
                            let axix_x = new THREE.Vector3(1,0,0);
                            axix_x.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_y = new THREE.Vector3(0,1,0);
                            axix_y.applyMatrix4(worldRotationMatrix).normalize();
                            let axix_z = new THREE.Vector3(0,0,1);
                            axix_z.applyMatrix4(worldRotationMatrix).normalize();

                            point.x = 0; point.y = 0; point.z = 0;
                            let sign = 1;
                            point.z = dir_m.clone().dot(dir_wz)*0.01;
                            if(point.z < 0){
                                sign = -1;
                            }
                            this.object.scale.x = oldScale.x * ( 1 + Math.abs(axix_x.dot(point))*sign);
                            this.object.scale.y = oldScale.y * ( 1 + Math.abs(axix_y.dot(point))*sign);
                            this.object.scale.z = oldScale.z * ( 1 + Math.abs(axix_z.dot(point))*sign);
                        }
                    }
                    //
                    oldMx = mouseEvent.offsetX;
                    oldMy = mouseEvent.offsetY;
                    return true;
                }
            }
            //
            oldMx = mouseEvent.offsetX;
            oldMy = mouseEvent.offsetY;
            return false;
        };
    }
}

/**
 * @class
 * @memberOf tjh.ar.tools
 * @extends tjh.ar.tools.ToolBase
 * @param {THREE.Viewer} viewer
 * @param {THREE.Camera} camera -当前相机
 */
class ModelTransformTool extends ToolBase {
    constructor(viewer, camera) {
        super(viewer);

        this.camera = camera;
        this.object = null;
        this.size = 1;
        //
        let translateHandler = new TranslateHandler(viewer, camera);
        this.tempObj.add(translateHandler);
        //
        let rotateHandler = new RotateHandler(viewer, camera);
        this.tempObj.add(rotateHandler);
        //
        let scaleHandler = new ScaleHandler(viewer, camera);
        this.tempObj.add(scaleHandler);
        //
        let activeHandler = undefined;
        /**
         * 设置变换模式
         * @param {string} type -可选值包括 “translate" "rotate" "scale"
         */
        this.setActiveHandler = (type)=> {
            if(type === "translate") {
                activeHandler = translateHandler;
                rotateHandler.visible = false;
                scaleHandler.visible = false;
            }
            else if(type === "rotate") {
                activeHandler = rotateHandler;
                translateHandler.visible = false;
                scaleHandler.visible = false;
            }
            else if(type === "scale") {
                activeHandler = scaleHandler;
                translateHandler.visible = false;
                rotateHandler.visible = false;
            }
            //
            activeHandler.object = this.object;
            activeHandler.visible = true;
        }
        /**
         * 绑定变换对象
         * @param {THREE.Object3D} object
         */
        this.attach = (object)=> {
            this.object = object;
            translateHandler.object = object;
            rotateHandler.object = object;
            scaleHandler.object = object;
            this.tempObj.visible = true;
            this.tempObj.update();
        };
        /**
         * 取消对象绑定
         */
        this.detach = ()=> {
            this.object = undefined;
            this.tempObj.visible = false;
            this.axis = null;
        };
        /**
         * 释放函数
         */
        this.dispose = ()=>{
            translateHandler.dispose();
            rotateHandler.dispose();
            scaleHandler.dispose();
            this.tempObj.dispose();
            //
            translateHandler = null;
            rotateHandler = null;
            scaleHandler = null;
            this.tempObj = null;
        };

        this.onLeftUp= (mouseEvent)=> {
            return activeHandler.onLeftUp(mouseEvent);
        }
        this.onLeftDown = (mouseEvent)=> {
            return activeHandler.onLeftDown(mouseEvent);
        }

        this.onMouseMove = (mouseEvent)=> {
            return activeHandler.onMouseMove(mouseEvent);
        }

        this.tempObj.update = ()=> {
            if(!this.object) return;
            //
            let worldPosition = new THREE.Vector3();
            this.object.updateMatrixWorld();
            worldPosition.setFromMatrixPosition(this.object.matrixWorld);
            //
            let scale = 150 *(worldPosition.dot(this.camera.pixelSizeVector)+ this.camera.pixelSizeVector.w);
            scale = scale > 0 ? scale : -scale;
            scale*=this.size;
            scale/=activeHandler.scaleRatio;
            this.tempObj.position.copy(worldPosition);
            this.tempObj.scale.set(scale, scale, scale);
            //
            if(activeHandler)
              activeHandler._update();
        }

        /**
         * @description "W" 切换为平移工具； "E" 切换为旋转工具； "R" 切换为缩放工具； "+"/"-"  增加/减少 工具显示尺寸
         * @param keyboardEvent
         * @return {boolean}
         */
        this.onKeyDown = (keyboardEvent)=> {
            switch ( keyboardEvent.keyCode ) {

                case 81: // Q
                    this.setSpace( this.space === "local" ? "world" : "local" );
                    return true;

                case 87: // W
                    this.setActiveHandler( "translate" );
                    return true;

                case 69: // E
                    this.setActiveHandler( "rotate" );
                    return true;

                case 82: // R
                    this.setActiveHandler( "scale" );
                    return true;

                case 187:
                case 107: // +, =, num+
                    this.size += 0.1 ;
                    return true;

                case 189:
                case 109: // -, _, num-
                    this.size = Math.max( this.size - 0.1, 0.1 ) ;
                    return true;

            }
            return false;
        }
    }
}

export {ModelTransformTool};
