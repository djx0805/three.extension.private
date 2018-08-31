class PrintTool extends tjh.ar.tools.ToolBase{
    constructor(viewer, layers){
        super(viewer);

        this.viewer = viewer;

        this.refLayers = layers;

        this.cameraHeight = 0;
        this.sphereCenter = null;
        this.rectangle = null

        let leftBtnDown = false;

        this.oldMx = 0;
        this.oldMy = 0;

        let floorPlane = null;
        /**
         * 中心点 centerOptions
         * @type {object}
         */
        this.sphereOptions = {
            /** @description 颜色*/
            color: new THREE.Color(0xff0000),
            /** @description 透明*/
            transparent:true,
            /** @description 透明度*/
            opacity: 0.6,
            /** @description 显示面*/
            side: THREE.DoubleSide,
        }

        this.drawRectOptions = {
            /** @description 颜色*/
            color: new THREE.Color(0x00ff00),
            /** @description 透明*/
            transparent:true,
            /** @description 透明度*/
            opacity: 0.2,
            /** @description 显示面*/
            side: THREE.DoubleSide,
        }

        this.rectangleOptions = {
            width: 100,
            height: 100,
            sphereRadis: 15,
        }


        let sphereMaterial = null;

        let rectMaterial = null;

        let centerPos = new THREE.Vector3(0,0,0);

        this.rectangleVertices = [];

        PrintTool.PRINT_MODE = {
            COMFIRM_CENTER : 0,
            MOVE_CENTER : 1,
            NO_OPERATION : 3,
        }


        this.initMaterial = function () {
            if(sphereMaterial)
            {
                sphereMaterial.dispose();
            }
            sphereMaterial = new THREE.MeshBasicMaterial(this.sphereOptions);

            sphereMaterial.depthTest = false;

            if(rectMaterial)
            {
                rectMaterial.dispose();
            }
            rectMaterial = new THREE.MeshBasicMaterial(this.drawRectOptions);

            rectMaterial.depthTest = false;
        }

        this.initMaterial();
        this.operateMode = PrintTool.PRINT_MODE.COMFIRM_CENTER;

        this.createRectangle = function () {
            if(!this.sphereCenter)
                return ;
            if (this.rectangleOptions.height > 0 && this.rectangleOptions.width > 0)
            {
                if (this.rectangle) {
                    this.rectangle.dispose();
                    this.tempObj.remove(this.rectangle);
                }
                this.rectangleVertices[0] = centerPos.clone().add(new THREE.Vector3(-this.rectangleOptions.width/2, -this.rectangleOptions.height/2, 0));
                this.rectangleVertices[1] = centerPos.clone().add(new THREE.Vector3(this.rectangleOptions.width/2, -this.rectangleOptions.height/2, 0))
                this.rectangleVertices[2] = centerPos.clone().add(new THREE.Vector3(this.rectangleOptions.width/2, this.rectangleOptions.height/2, 0))
                this.rectangleVertices[3] = centerPos.clone().add(new THREE.Vector3(-this.rectangleOptions.width/2, this.rectangleOptions.height/2, 0))

                let faces = tjh.util.PolygonUtil.polygonTriangulate([this.rectangleVertices]);

                let pgGeom = new THREE.BufferGeometry();
                pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                this.rectangle = new THREE.Mesh(pgGeom, rectMaterial);

                this.tempObj.add(this.rectangle);
                this.cameraHeight = this.viewer.getCamera().position.z;
            }
        }

        this.onLeftDown = function (mouseEvent) {
            if(this.operateMode === PrintTool.PRINT_MODE.COMFIRM_CENTER)
            {
                const clientX = mouseEvent.offsetX;
                const clientY = mouseEvent.offsetY;
                //
                let mouse = new THREE.Vector2();
                mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
                mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
                //
                let raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( mouse, this.viewer.camera);
                let intersects = raycaster.intersectObjects( this.refLayers,true);
                //
                if (intersects.length === 0)
                    return false;

                floorPlane = new THREE.Plane();
                floorPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), centerPos);

                centerPos = intersects[0].point.clone();
                if(this.sphereCenter)
                {
                    this.sphereCenter.position.copy(intersects[0].point);
                    return false;
                }

                let sphereGeo = new THREE.SphereGeometry(this.rectangleOptions.sphereRadis, 32, 32);
                this.sphereCenter = new THREE.Mesh(sphereGeo, sphereMaterial);

                this.sphereCenter.position.copy(intersects[0].point);

                this.tempObj.add(this.sphereCenter);
                this.createRectangle();
                this.operateMode = PrintTool.PRINT_MODE.MOVE_CENTER;
                return false;
            }
            else if(this.operateMode === PrintTool.PRINT_MODE.MOVE_CENTER)
            {
                if(!this.rectangle)
                    return;
                const clientX = mouseEvent.offsetX;
                const clientY = mouseEvent.offsetY;
                //
                let mouse = new THREE.Vector2();
                mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
                mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
                //
                let raycaster = new THREE.Raycaster();
                raycaster.setFromCamera( mouse, this.viewer.camera);
                let intersects = raycaster.intersectObject( this.sphereCenter,true);
                //
                if (intersects.length === 0)
                    return false;

                leftBtnDown = true;
                this.oldMx = clientX;
                this.oldMy = clientY;
            }
            else if(this.operateMode === PrintTool.PRINT_MODE.NO_OPERATION)
            {

            }

            return false;
        }

        this.onLeftUp = function (mouseEvent) {
            leftBtnDown = false;
            return false;
        }

        this.onMouseMove = function(mouseEvent){
            if(this.operateMode === PrintTool.PRINT_MODE.COMFIRM_CENTER)
            {

            }
            else if(this.operateMode === PrintTool.PRINT_MODE.MOVE_CENTER)
            {
                const clientX = mouseEvent.offsetX;
                const clientY = mouseEvent.offsetY;

                if(leftBtnDown) {

                    let raycaster0 = new THREE.Raycaster();
                    let mouse0 = new THREE.Vector2();
                    mouse0.x = ( this.oldMx / this.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse0.y = - ( this.oldMy / this.viewer.domElement.clientHeight ) * 2 + 1;
                    raycaster0.setFromCamera( mouse0, this.viewer.getCamera());

                    let intersect0 = new THREE.Vector3();
                    intersect0 = raycaster0.ray.intersectPlane(floorPlane, intersect0);

                    if(!intersect0)
                        return;
                    //
                    let raycaster = new THREE.Raycaster();
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
                    raycaster.setFromCamera( mouse, this.viewer.getCamera());

                    let intersect1 = new THREE.Vector3();
                    intersect1 = raycaster.ray.intersectPlane(floorPlane, intersect1);
                    if(!intersect1)
                        return;
                    //
                    let translate = intersect1.sub(intersect0);

                    //
                    let tranMatrix = new THREE.Matrix4();
                    tranMatrix.makeTranslation(translate.x, translate.y, 0);
                    this.sphereCenter.position.applyMatrix4(tranMatrix);
                    this.sphereCenter.updateMatrixWorld(true);

                    this.rectangle.position.applyMatrix4(tranMatrix);
                    this.rectangle.updateMatrixWorld(true);

                    centerPos.applyMatrix4(tranMatrix);

                    this.oldMx = clientX;
                    this.oldMy = clientY;
                    return true
                }
            }
            else if(this.operateMode === PrintTool.PRINT_MODE.NO_OPERATION)
            {
            }
            return false;
        }

        this.onRightDown = function (mouseEvent) {
            if(this.operateMode === PrintTool.PRINT_MODE.COMFIRM_CENTER)
            {
                this.operateMode = PrintTool.PRINT_MODE.NO_OPERATION;
            }
            else if(this.operateMode === PrintTool.PRINT_MODE.MOVE_CENTER)
            {
                this.operateMode = PrintTool.PRINT_MODE.NO_OPERATION;
            }
            else if(this.operateMode === PrintTool.PRINT_MODE.NO_OPERATION)
            {

            }
            return false;
        }
        this.tempObj.update = (context)=>{
            if(this.sphereCenter)
            {
                this.sphereCenter.quaternion.copy(context.camera.quaternion.clone());
                this.sphereCenter.updateMatrixWorld(true);
            }

        }
    }
    release()
    {
        if(this.rectangle) {
            this.rectangle.dispose();
            this.rectangle = null;
        }
        if(this.sphereCenter)
        {
            this.sphereCenter.dispose();
            this.sphereCenter = null;
        }

    }
}
