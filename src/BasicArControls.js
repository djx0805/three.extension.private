import {WindowEventListener} from "./viewer";
/**
 * 一个简单的航空影像浏览控制器
 * @class
 * @memberof tjh.ar
 * @extends tjh.ar.WindowEventListener
 */
class BasicArControls extends  WindowEventListener {
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

        this.lastArNode = null;

        this.oldMx = 0;
        this.oldMy = 0;
    }

    onLeftDown(mouseEvent) {
        this.leftBtnDown = true;
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
        mouse.y = - ( clientY / this.viewer.domElement.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, this.viewer.getCamera());
        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

        if(intersects.length <= 0) {
            return false;
        }
        //
        this.intersectionPos = intersects[0].point;

        this.geomRotateFlag.position.set(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
        this.tempObj.add(this.geomRotateFlag);
        //
        this.viewer.scene.arLayers[0].removeImgNode();
        //
        this.middleBtnDown = true;
        //

        let frustum = this.viewer.camera.projectionMatrix.getFrustum();
        if(Math.abs(frustum.left+frustum.right) > 0.000001 || Math.abs(frustum.bottom+frustum.top)>0.000001) {
            let oldLookAt = this.viewer.camera.matrixWorldInverse.getLookAt();
            let disEyeToInter = this.intersectionPos.clone().sub(oldLookAt.eye).length();
            //
            let projectionInter = this.intersectionPos.clone().applyMatrix4(this.viewer.camera.matrixWorldInverse).applyMatrix4(this.viewer.camera.projectionMatrix);
            //
            let frustumHWidth = (frustum.right - frustum.left)/2;
            let frustumHHeight = (frustum.top - frustum.bottom)/2;
            this.viewer.camera.projectionMatrix.makeFrustum(-frustumHWidth, frustumHWidth, frustumHHeight, -frustumHHeight, frustum.zNear, frustum.zFar);
            //
            let plane = new THREE.Plane();
            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.intersectionPos);
            //
            raycaster.setFromCamera( new THREE.Vector2(0, 0), this.viewer.getCamera());
            let lookCenter = raycaster.ray.intersectPlane(plane);
            let disCurrent = lookCenter.clone().sub(oldLookAt.eye).length();
            this.viewer.camera.position.sub(oldLookAt.lookDirection.clone().multiplyScalar(disEyeToInter - disCurrent));
            this.viewer.camera.updateMatrixWorld();
            //
            raycaster.setFromCamera( new THREE.Vector2(projectionInter.x, projectionInter.y), this.viewer.getCamera());

            let pt = raycaster.ray.intersectPlane(plane);
            this.viewer.camera.position.x+=this.intersectionPos.x - pt.x;
            this.viewer.camera.position.y+=this.intersectionPos.y - pt.y;
            //
            lookCenter.x += this.intersectionPos.x - pt.x;
            lookCenter.y += this.intersectionPos.y - pt.y;
            //
            this.viewer.camera.up.copy(oldLookAt.up);
            this.viewer.camera.lookAt(lookCenter);
            //
            this.viewer.camera.updateMatrixWorld(true);
        }
        return true;
    }

    onRightDown(mouseEvent) {
        return false;
    }

    onLeftUp(mouseEvent) {
         this.leftBtnDown = false;
         //
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

        if(intersects.length <= 0) {
            return true;
        }
        //
        this.intersectionPos = intersects[0].point;
        //
        let tmpCamera = this.viewer.camera.clone();
        //
        let frustum = tmpCamera.projectionMatrix.getFrustum();
        if(Math.abs(frustum.left+frustum.right) > 0.000001 || Math.abs(frustum.bottom+frustum.top)>0.000001) {
            let oldLookAt = tmpCamera.matrixWorldInverse.getLookAt();
            let disEyeToInter = this.intersectionPos.clone().sub(oldLookAt.eye).length();
            //
            let projectionInter = this.intersectionPos.clone().applyMatrix4(tmpCamera.matrixWorldInverse).applyMatrix4(tmpCamera.projectionMatrix);
            //
            let frustumHWidth = (frustum.right - frustum.left)/2;
            let frustumHHeight = (frustum.top - frustum.bottom)/2;
            tmpCamera.projectionMatrix.makeFrustum(-frustumHWidth, frustumHWidth, frustumHHeight, -frustumHHeight, frustum.zNear, frustum.zFar);
            //
            let plane = new THREE.Plane();
            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.intersectionPos);
            //
            raycaster.setFromCamera( new THREE.Vector2(0, 0), tmpCamera);
            let lookCenter = raycaster.ray.intersectPlane(plane);
            let disCurrent = lookCenter.clone().sub(oldLookAt.eye).length();
            tmpCamera.position.sub(oldLookAt.lookDirection.clone().multiplyScalar(disEyeToInter - disCurrent));
            tmpCamera.updateMatrixWorld();
            //
            raycaster.setFromCamera( new THREE.Vector2(projectionInter.x, projectionInter.y), tmpCamera);

            let pt = raycaster.ray.intersectPlane(plane);
            tmpCamera.position.x+=this.intersectionPos.x - pt.x;
            tmpCamera.position.y+=this.intersectionPos.y - pt.y;
            //
            lookCenter.x += this.intersectionPos.x - pt.x;
            lookCenter.y += this.intersectionPos.y - pt.y;
            //
            tmpCamera.up.copy(oldLookAt.up);
            tmpCamera.lookAt(lookCenter);
            //
            tmpCamera.updateMatrixWorld(true);
        }
        //
        let arNode = this.viewer.scene.arLayers[0].searchPhotoByNearest1(tmpCamera,this.intersectionPos);
        if((!this.lastArNode && arNode) ||(arNode && this.lastArNode && arNode.index !== this.lastArNode.index)) {
            this.viewer.scene.arLayers[0].removeImgNode();
            this.viewer.camera.copy(tmpCamera);
            this.lastArNode = arNode.clone();
            this.viewer.scene.arLayers[0].applyArNode(this.viewer.camera, arNode, this.intersectionPos);
        }
        //
        return true;
    }

    onMiddleUp(mouseEvent) {
        const clientX = mouseEvent.offsetX;
        const clientY = mouseEvent.offsetY;
        //
        this.tempObj.remove(this.geomRotateFlag);
        this.middleBtnDown = false;
        //
        let arNode = this.viewer.scene.arLayers[0].searchPhotoByNearest1(this.viewer.camera, this.intersectionPos);
        //
        //if((!this.lastArNode) || (arNode && this.lastArNode.index !== arNode.index)) {
        if (arNode){
            this.lastArNode = arNode.clone();
            this.viewer.scene.arLayers[0].applyArNode(this.viewer.camera, arNode, this.viewer.scene.terrainLayers[0].rayIntersectTerrain(new THREE.Vector2(0, 0), this.viewer.camera).intersectP);
        }
        //}

        //this.viewer.camera.projectionMatrix.copy(arNode.projectionMatrix);
        //
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
            let pers = this.viewer.camera.projectionMatrix.getPerspective();
            let frustum = this.viewer.camera.projectionMatrix.getFrustum();
            let translate0 = new THREE.Matrix4();
            translate0.makeTranslation(-(clientX - this.oldMx)*Math.sin(pers.fovy*pers.aspectRatio*3.1415926/180)/this.viewer.domElement.clientWidth, -(-clientY + this.oldMy)*Math.sin(pers.fovy*3.1415926/180)/this.viewer.domElement.clientHeight, 0);
            let tm = new THREE.Matrix4();
            tm.premultiply(translate0);
            //
            let np_lb = new THREE.Vector3(frustum.left, frustum.bottom, frustum.zNear);
            np_lb.applyMatrix4(tm);
            let np_rt = new THREE.Vector3(frustum.right, frustum.top, frustum.zNear);
            np_rt.applyMatrix4(tm);
            //
            frustum.left = np_lb.x;
            frustum.right = np_rt.x;
            frustum.bottom = np_lb.y;
            frustum.top = np_rt.y;
            //
            this.viewer.camera.projectionMatrix.makeFrustum(frustum.left, frustum.right, frustum.top, frustum.bottom, frustum.zNear, frustum.zFar);
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
        let frustum = this.viewer.camera.projectionMatrix.getFrustum();
        let frustumCenter = new THREE.Vector3((frustum.left+frustum.right)/2, (frustum.bottom+frustum.top)/2, frustum.zNear);
        let translate0 = new THREE.Matrix4();
        translate0.makeTranslation(-frustumCenter.x, -frustumCenter.y, -frustumCenter.z);
        let scale = new THREE.Matrix4();

        let ratio = 1 + delta/(this.viewer.domElement.clientWidth + this.viewer.domElement.clientHeight);
        scale.makeScale(ratio, ratio, ratio);
        let translate1 = new THREE.Matrix4();
        translate1.makeTranslation(frustumCenter.x, frustumCenter.y, frustumCenter.z);
        let tm = new THREE.Matrix4();
        tm.premultiply(translate0).premultiply(scale).premultiply(translate1);
        //
        let np_lb = new THREE.Vector3(frustum.left, frustum.bottom, frustum.zNear);
        np_lb.applyMatrix4(tm);
        let np_rt = new THREE.Vector3(frustum.right, frustum.top, frustum.zNear);
        np_rt.applyMatrix4(tm);
        //
        frustum.left = np_lb.x;
        frustum.right = np_rt.x;
        frustum.bottom = np_lb.y;
        frustum.top = np_rt.y;
        //
        this.viewer.camera.projectionMatrix.makeFrustum(frustum.left, frustum.right, frustum.top, frustum.bottom, frustum.zNear, frustum.zFar);
    }
}


export {BasicArControls};
