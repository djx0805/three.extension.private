
/**
 * 立面分析（正面观测）
 * @class
 * @memberof tjh.ar
 * @extends tjh.ar.WindowEventListener
 */
class FacadeAnalyzer extends  tjh.ar.WindowEventListener {
    constructor(viewer, terrianLayer) {
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

        this.terrianLayer = terrianLayer;

        this._floorPlane_ = null;

        this.centerCube = null;

        this.ortheCamera = null;

        viewer.getCamera().updateMatrixWorld(true);

        this.backUpCamera = viewer.getCamera().clone();

        // 构建正交相机
        let initialize = ()=>
        {
            this.ortheCamera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000,this.backUpCamera.near, this.backUpCamera.far);

            let terrianBs = terrianLayer.getBoundingSphereWorld();

            let terrianBx = terrianLayer.getBoundingBoxWorld();

            let center = terrianBx.getCenter();
            this.ortheCamera.position.set(center.x,center.y - terrianBs.radius*2,center.z);

            this.ortheCamera.lookAt(center.x,center.y + 10,center.z);
            this.ortheCamera.up.set(0,0,1);

            this.ortheCamera.updateMatrixWorld(true);

            let tmp = terrianBx.clone().applyMatrix4(this.ortheCamera.matrixWorldInverse);

            let ratio = this.viewer.domElement.clientWidth/this.viewer.domElement.clientHeight;

            this.ortheCamera.left = -this.viewer.domElement.clientWidth/2;
            this.ortheCamera.right = this.viewer.domElement.clientWidth/2;
            this.ortheCamera.top = this.viewer.domElement.clientHeight;
            this.ortheCamera.bottom = -this.viewer.domElement.clientHeight/2 ;
            this.ortheCamera.near = 1;
            this.ortheCamera.far = terrianBs.radius*4;
            this.ortheCamera.updateProjectionMatrix();

            this.viewer.setCamera(this.ortheCamera);


            let currentTechnique = viewer.getCurrentRenderTechnique();
            if(!currentTechnique)
                return;
            currentTechnique.camera = this.ortheCamera;
            for(let i = 0, ilen = currentTechnique.renderPasses.length; i < ilen; ++i)
            {
                currentTechnique.renderPasses.camera = this.ortheCamera;
            }

        }

        initialize();
        //
        this.onMouseMove = (mouseEvent)=> {
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let terrainBs = terrianLayer.getBoundingSphereWorld();
            //
            if(this.leftBtnDown && terrainBs.valid()) {
                let lookAt = this.ortheCamera.matrixWorldInverse.getLookAt();
                let plane = new THREE.Plane();
                plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(lookAt.lookDirection.x, lookAt.lookDirection.y, lookAt.lookDirection.z), terrainBs.center);
                //
                let raycaster0 = new THREE.Raycaster();
                let mouse0 = new THREE.Vector2();
                mouse0.x = ( this.oldMx / this.viewer.domElement.clientWidth ) * 2 - 1;
                mouse0.y = - ( this.oldMy / this.viewer.domElement.clientHeight ) * 2 + 1;
                raycaster0.setFromCamera( mouse0, this.viewer.getCamera());
                let intersect0 = new THREE.Vector3();
                intersect0 = raycaster0.ray.intersectPlane(plane, intersect0);
                //
                let raycaster = new THREE.Raycaster();
                let mouse = new THREE.Vector2();
                mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
                mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
                raycaster.setFromCamera( mouse, this.viewer.getCamera());
                let intersect1 = new THREE.Vector3();
                intersect1 = raycaster.ray.intersectPlane(plane, intersect1);
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
                    this.viewer.camera.updateProjectionMatrix();
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
    }

    onLeftDown(mouseEvent) {
        this.leftBtnDown = true;
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

        let testOrigin = new THREE.Vector3(mouse.x, mouse.y, -1).unproject(this.viewer.getCamera());

        raycaster.setFromCamera( mouse, this.viewer.getCamera());
        let lookAt = this.viewer.camera.matrixWorldInverse.getLookAt();
        raycaster.ray.direction.copy(lookAt.lookDirection);
        raycaster.ray.origin.copy(testOrigin);

        // attention
        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers,true);

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


    onMouseWheel(wheelEvent) {
        const delta = -wheelEvent.deltaY;
        //
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
        //
        return true;
    }
    release()
    {
        this.viewer.scene.removeTemporaryObj(this.geomRotateFlag);

        let currentTechnique = viewer.getCurrentRenderTechnique();
        if(!currentTechnique)
            return;
        currentTechnique.camera = this.backUpCamera;
        for(let i = 0, ilen = currentTechnique.renderPasses.length; i < ilen; ++i)
        {
            currentTechnique.renderPasses.camera = this.backUpCamera;
        }
        this.viewer.setCamera(this.backUpCamera);
    }
}

