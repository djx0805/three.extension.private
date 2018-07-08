import {WindowEventListener} from "./viewer";

/**
 * 一个简单的地形浏览控制器
 * @class
 * @memberof tjh.ar
 * @extends tjh.ar.WindowEventListener
 */
class BasicTerrainControls extends  WindowEventListener {
    constructor(viewer) {
        super(viewer);
        //
        this.geomRotateFlag = new THREE.Group();
        let geometry = new THREE.ConeGeometry( 5, 20, 32 );
        let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        let cone = new THREE.Mesh( geometry, material );
        cone.setRotationFromAxisAngle(new  THREE.Vector3(-1,0,0), 3.1415926/2);
        this.geomRotateFlag.add(cone);

        this.leftBtnDown = false;
        this.middleBtnDown = false;
        this.rightBtnDown = false;

        this.intersectionPos = null;

        this.oldMx = 0;
        this.oldMy = 0;

        this._floorPlane_ = null;
    }

    onLeftDown(mouseEvent) {
        this.leftBtnDown = true;
        //
        let terrainBox = new THREE.Box3();
        for(let n=0; n < this.viewer.scene.terrainLayers.length; ++n) {
            terrainBox.expandByBox3(this.viewer.scene.terrainLayers[n].getBoundingBoxWorld());
        }
        if(terrainBox.valid()) {
            this._floorPlane_ = new THREE.Plane();
            this._floorPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), terrainBox.min);
        }
        else {
            this._floorPlane_ = new THREE.Plane();
            this._floorPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0));
        }
        //
        return true;
    }

    onMiddleDown(mouseEvent) {
        const clientX = mouseEvent.offsetX;
        const clientY = mouseEvent.offsetY;
        //
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();

        mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, this.viewer.getCamera());
        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

        if(intersects.length <= 0) {
            return false;
        }
        //
        this.intersectionPos = intersects[0].point;

        // 相交视椎体添加到temporaryObj图层中
        this.geomRotateFlag.position.set(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
        this.geomRotateFlag.updateMatrix();
        this.tempObj.add(this.geomRotateFlag);
        //
        this.middleBtnDown = true;
        //
        return true;
    }

    onRightDown(mouseEvent) {
        return false;
    }

    onLeftUp(mouseEvent) {
        this.leftBtnDown = false;
        return true;
    }

    onMiddleUp(mouseEvent) {
        this.tempObj.remove(this.geomRotateFlag);
        this.middleBtnDown = false;
        return true;
    }

    onRightUp(mouseEvent) {
        return false;
    }

    onMouseMove(mouseEvent) {
        const clientX = mouseEvent.offsetX;
        const clientY = mouseEvent.offsetY;
        //
        if(this.leftBtnDown) {
            let raycaster0 = new THREE.Raycaster();
            let mouse0 = new THREE.Vector2();
            mouse0.x = ( this.oldMx / this.viewer.domElement.clientWidth ) * 2 - 1;
            mouse0.y = - ( this.oldMy / this.viewer.domElement.clientHeight ) * 2 + 1;
            raycaster0.setFromCamera( mouse0, this.viewer.getCamera());
            let intersect0 = new THREE.Vector3();
            intersect0 = raycaster0.ray.intersectPlane(this._floorPlane_, intersect0);
            //
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, this.viewer.getCamera());
            let intersect1 = new THREE.Vector3();
            intersect1 = raycaster.ray.intersectPlane(this._floorPlane_, intersect1);
            //
            let translate = intersect0.sub(intersect1);
            //
            let tranMatrix = new THREE.Matrix4();
            tranMatrix.makeTranslation(translate.x, translate.y, translate.z);
            this.viewer.camera.position.applyMatrix4(tranMatrix);
        }
        else if(this.middleBtnDown) {
            var pos = new THREE.Vector3();
            var q = new THREE.Quaternion();
            var s = new THREE.Vector3();
            //delta y;
            {
                let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
                look_at.right = look_at.up.clone();
                look_at.right.cross(look_at.lookDirection);
                look_at.right.normalize();
                //
                let raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
                //
                let tranMatrix0 = new THREE.Matrix4();
                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
                let rotateMatrix0 = new THREE.Matrix4();
                let ax = new THREE.Vector3(look_at.right.x, look_at.right.y, 0);
                ax.normalize();
                rotateMatrix0.makeRotationAxis(ax, (-clientY + this.oldMy)*3.1415926/180);
                let tranMatrix1 = new THREE.Matrix4();
                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
                //
                let transform = tranMatrix0.premultiply(rotateMatrix0).premultiply(tranMatrix1);
                transform.premultiply(this.viewer.camera.matrixWorldInverse);
                let camMatrix = new THREE.Matrix4();
                camMatrix.getInverse(transform);
                camMatrix.decompose(pos, q, s);
                this.viewer.camera.position.copy(pos);
                this.viewer.camera.quaternion.copy(q);
                this.viewer.camera.scale.copy(s);
                this.viewer.camera.updateMatrixWorld(true);
            }
            //delta x
            {
                let raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
                //
                let tranMatrix0 = new THREE.Matrix4();
                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
                let rotateMatrix1 = new THREE.Matrix4();
                let ax = new THREE.Vector3(0,0,1);
                let mm = new THREE.Matrix4();
                mm.getInverse(this.viewer.scene.terrainLayers[0].matrixWorld).transpose();
                ax.applyMatrix4(mm);
                ax.normalize();
                rotateMatrix1.makeRotationAxis(ax, (-clientX + this.oldMx)*3.1415926/180);
                let tranMatrix1 = new THREE.Matrix4();
                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
                //
                let transform = tranMatrix0.premultiply(rotateMatrix1).premultiply(tranMatrix1);
                transform.premultiply(this.viewer.camera.matrixWorldInverse);
                let camMatrix = new THREE.Matrix4();
                camMatrix.getInverse(transform);
                camMatrix.decompose(pos, q, s);
                this.viewer.camera.position.copy(pos);
                this.viewer.camera.quaternion.copy(q);
                this.viewer.camera.scale.copy(s);
                this.viewer.camera.updateMatrixWorld(true);
            }
        }
        else if(this.rightBtnDown) {

        }
        //
        this.oldMx = clientX;
        this.oldMy = clientY;
        //
        return true;
    }


    onMouseWheel(wheelEvent) {
        const delta = -wheelEvent.deltaY;
        //
        if(this.viewer.getCamera().isPerspectiveCamera) {
            let minz = 0;
            /*for(let n=0; n<this.viewer.scene.terrainLayers.length; ++n) {
                let terrain = this.viewer.scene.terrainLayers[n];
                if(!terrain.visible)
                    continue;
                //
                let bx = terrain.getBoundingBox(false);
                if(bx.min.z < minz)
                    minz = bx.min.z;
            }*/
            //
            let terrainBottomPlane = new THREE.Plane();
            terrainBottomPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,minz));
            //
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();

            mouse.x = ( wheelEvent.clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( wheelEvent.clientY / this.viewer.domElement.clientHeight ) * 2 + 1;

            raycaster.setFromCamera( mouse, this.viewer.getCamera());
            let intersectP = new THREE.Vector3();
            intersectP = raycaster.ray.intersectPlane(terrainBottomPlane, intersectP);

            if(intersectP) {
                let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
                this.viewer.camera.position.add(look_at.lookDirection.multiplyScalar((intersectP.sub(look_at.eye).length()/20)*(delta > 0? 1 : -1)));
                return true;
            }
            //
            let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
            this.viewer.camera.position.add(look_at.lookDirection.multiplyScalar(15*(delta > 0? 1 : -1)));
            return true;
        }
        else if(this.viewer.getCamera().isOrthographicCamera) {
            if(delta < 0) {
                let scaleMt = new THREE.Matrix4();
                scaleMt.makeScale(1.1,1.1,1.1);
                this.viewer.camera.left = (new THREE.Vector3(this.viewer.camera.left, 0, 0)).applyMatrix4(scaleMt).x;
                this.viewer.camera.right = (new THREE.Vector3(this.viewer.camera.right, 0, 0)).applyMatrix4(scaleMt).x;
                this.viewer.camera.bottom = (new THREE.Vector3(0, this.viewer.camera.bottom, 0)).applyMatrix4(scaleMt).y;
                this.viewer.camera.top = (new THREE.Vector3(0, this.viewer.camera.top, 0)).applyMatrix4(scaleMt).y;
                //
                this.viewer.camera.updateProjectionMatrix();
            }
            else if(delta > 0) {
                let scaleMt = new THREE.Matrix4();
                scaleMt.makeScale(0.9,0.9,0.9);
                this.viewer.camera.left = (new THREE.Vector3(this.viewer.camera.left, 0, 0)).applyMatrix4(scaleMt).x;
                this.viewer.camera.right = (new THREE.Vector3(this.viewer.camera.right, 0, 0)).applyMatrix4(scaleMt).x;
                this.viewer.camera.bottom = (new THREE.Vector3(0, this.viewer.camera.bottom, 0)).applyMatrix4(scaleMt).y;
                this.viewer.camera.top = (new THREE.Vector3(0, this.viewer.camera.top, 0)).applyMatrix4(scaleMt).y;
                //
                this.viewer.camera.updateProjectionMatrix();
            }
            return true;
        }
    }
}


export {BasicTerrainControls};
