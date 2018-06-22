import {PyramidImage} from "./PyramidImage";

document.write('<script type="text/javascript" src="../src/thrift/thrift.js"> <\/script>')
document.write('<script  type="text/javascript" src="../src/thrift/gen-js/PhotoMatcher.js"> <\/script>')
document.write('<script  type="text/javascript" src="../src/thrift/gen-js/photo_search_types.js"> <\/script>')

class ArCameraAnimation {
    constructor(sourceCamera, selectedArNode, keepPos) {
        this.selectedArNode = selectedArNode;
        this.sourceCamera = sourceCamera;
        this.targetPose = new THREE.Matrix4();
        this.targetPose.getInverse(selectedArNode.viewMatrix);
        this.finished = false;
        this.keepPos = keepPos;
        this.sourceFrustum = sourceCamera.projectionMatrix.getFrustum();
        this.keepProjPos = keepPos.clone().applyMatrix4(sourceCamera.matrixWorldInverse).applyMatrix4(sourceCamera.projectionMatrix);
        this.finishCallBack = null;

        this.update = function(){
            var clock = new THREE.Clock();
            //
            var currentPosition = new THREE.Vector3();
            var currentQuaternion = new THREE.Quaternion();
            var currentScale = new THREE.Vector3();
            this.sourceCamera.matrixWorld.decompose(currentPosition, currentQuaternion, currentScale);
            //
            let targetLookAt = this.selectedArNode.viewMatrix.getLookAt();
            let ray = new THREE.Ray(targetLookAt.eye, targetLookAt.lookDirection);
            let plane = new THREE.Plane();
            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.keepPos);
            let inter = ray.intersectPlane(plane);
            targetLookAt.eye.add(this.keepPos.clone().sub(inter));
            let targetVM = new THREE.Matrix4();
            targetVM.makeLookAt(targetLookAt.eye, this.keepPos, targetLookAt.up);
            let targetPose = new THREE.Matrix4();
            targetPose.getInverse(targetVM);
            var targetPosition = new THREE.Vector3();
            var targetQuaternion = new THREE.Quaternion();
            var targetScale = new THREE.Vector3();
            targetPose.decompose(targetPosition, targetQuaternion, targetScale);
            //
            var positionKF = new THREE.VectorKeyframeTrack( '.position', [0, 1],
                [ currentPosition.x, currentPosition.y, currentPosition.z, targetPosition.x, targetPosition.y, targetPosition.z]);
            var quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, 1],
                [currentQuaternion.x, currentQuaternion.y, currentQuaternion.z, currentQuaternion.w,
                    targetQuaternion.x, targetQuaternion.y, targetQuaternion.z, targetQuaternion.w]);
            //
            var clip = new THREE.AnimationClip( 'Action', -1, [positionKF, quaternionKF]);
            var mixer = new THREE.AnimationMixer( this.sourceCamera );
            // create a ClipAction and set it to play
            var clipAction = mixer.clipAction( clip );
            let action = clipAction.play();
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            mixer.addEventListener("finished", ()=> {
                this.finished = true;
            })
            //
            return function() {
                mixer.update(clock.getDelta());
            }
        }.call(this);

        this.translateToKeepPos = ()=> {
            var targetPosition = new THREE.Vector3();
            var targetQuaternion = new THREE.Quaternion();
            var targetScale = new THREE.Vector3();
            this.targetPose.decompose(targetPosition, targetQuaternion, targetScale);
            this.sourceCamera.position.copy(targetPosition);
            this.sourceCamera.quaternion.copy(targetQuaternion);
            this.sourceCamera.scale.copy(targetScale);
            this.sourceCamera.updateMatrixWorld();
            //
            let keepViewPos = this.keepPos.clone().applyMatrix4(this.sourceCamera.matrixWorldInverse);
            let frustum = this.sourceFrustum;
            let tmp = this.keepProjPos.x + 2*frustum.zNear*keepViewPos.x/(keepViewPos.z*(frustum.right - frustum.left));
            tmp = -tmp*(frustum.right - frustum.left)-frustum.right-frustum.left;
            let dx = tmp/2;
            tmp = this.keepProjPos.y+2*frustum.zNear*keepViewPos.y/(keepViewPos.z*(frustum.top-frustum.bottom));
            tmp = -tmp*(frustum.top - frustum.bottom) - frustum.top - frustum.bottom;
            let dy = tmp/2;
            //let zNear = keepViewPos.z*frustum.zFar*(this.keepProjPos.z-1);
            //zNear/=(keepViewPos.z+2*frustum.zFar+keepViewPos.z*this.keepProjPos.z);
            this.sourceCamera.projectionMatrix.makeFrustum(frustum.left+dx, frustum.right+dx, frustum.top+dy, frustum.bottom+dy, frustum.zNear, frustum.zFar);
        }
    }
}


class ARLayer extends  THREE.Group {
    constructor(url, resourceID, terrainLayer, photoSeachEntry) {
        super();
        //
        this.url = url;
        this.resourceID = resourceID;
        this.arNodes = null;
        this.terrainLayer = terrainLayer;

        this.cameraAnimation = null;
        this.imgNode = null;

        let transport = new Thrift.Transport(photoSeachEntry);
        let protocol = new Thrift.Protocol(transport);
        this.client = new PhotoMatcherClient(protocol);

        this.betterArNode = {};
        this.betterArNode.clone = function () {
            let tmp = {};
            tmp.index = this.index;
            tmp.imgPower = this.imgPower;
            tmp.deltaCenter = this.deltaCenter;
            tmp.angle = this.angle;
            tmp.imgUrl = this.imgUrl;
            tmp.viewMatrix = this.viewMatrix.clone();
            tmp.projectionMatrix = this.projectionMatrix.clone();
            tmp.clone = this.clone;
            return tmp;
        }
    }


    removeImgNode() {
        if(this.imgNode) {
            this.remove(this.imgNode);
            this.imgNode.dispose();
            this.imgNode = null;
        }
    }

    update(context) {
        if(!this.visible)
            return;
        //
        if(this.cameraAnimation !== null) {
            if(!this.cameraAnimation.finished)
                this.cameraAnimation.update();
            else {
                this.cameraAnimation.translateToKeepPos();
                //
                let selectedArNode = this.cameraAnimation.selectedArNode;
                //
                this.cameraAnimation = null;
                //
                this.imgNode = new PyramidImage(this.dataBasePager, this.url, selectedArNode.imgUrl, camera.matrixWorldInverse.clone(), selectedArNode.projectionMatrix.clone(), true, false);
                this.imgNode.init();
                this.imgNode.renderOrder = 1000;
                //
                this.terrainLayer.dataBasePager.enableRequestData = true;
            }
        }
        else if(this.imgNode !== null) {
            if(this.imgNode.initialized) {
                if(this.imgNode.addedAsChild) {
                    context.onTextureLoadFailed = function () {
                        return false;
                    }
                    //
                    this.imgNode.update(context);
                    return;
                }
                //
                this.imgNode.addedAsChild = true;
                this.add(this.imgNode);
            }
        }
    }

    searchPhotoByNearest1(camera, constraintPoint=null) {
        // 设置相机的姿态
        let cameraPose = camera.matrixWorldInverse.getLookAt();
        cameraPose.right = cameraPose.lookDirection.clone().cross(cameraPose.up);
        let projectCenter = new THREE.Vector2(0,0);
        let lookTerrainCenter = this.terrainLayer.rayIntersectTerrain(projectCenter, camera);

        // 计算基准信息，以求得地形看见平面（）
        while(!lookTerrainCenter.intersected && projectCenter.y > -0.9) {
            projectCenter.y -=0.2;
            //projectCenter.y /=2;
            lookTerrainCenter = this.terrainLayer.rayIntersectTerrain(projectCenter, camera);
        }
        //
        let datumPointOnTerrain = [];
        datumPointOnTerrain.push(this.terrainLayer.rayIntersectTerrain(new THREE.Vector2(0,projectCenter.y-0.25), camera));
        datumPointOnTerrain.push(lookTerrainCenter);
        datumPointOnTerrain.push(this.terrainLayer.rayIntersectTerrain(new THREE.Vector2(0,projectCenter.y+0.15), camera));
        let datumCenter = [];
        for(let i=0; i<datumPointOnTerrain.length; ++i) {
            if(datumPointOnTerrain[i].intersected) {
                datumCenter.push(datumPointOnTerrain[i].intersectP);
            }
        }
        if(datumCenter.length === 0) {
            datumCenter.push(lookTerrainCenter.intersectP);
        }
        //
        let datumPlanes = [];
        for(let i=0; i<datumCenter.length; ++i) {
            let datumPlane_ = new THREE.Plane();
            datumPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(-cameraPose.lookDirection.x, -cameraPose.lookDirection.y, -cameraPose.lookDirection.z), datumCenter[i]);
            datumPlanes.push({datumPlane:datumPlane_});
        }
        // 三角面
        for(let i=0; i<datumPlanes.length; ++i) {
            let datumPlane = datumPlanes[i].datumPlane;
            let datumPoint = [];
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(-0.2,projectCenter.y), camera);
            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
            raycaster.setFromCamera(new THREE.Vector2(0,projectCenter.y-0.25), camera);
            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
            raycaster.setFromCamera(new THREE.Vector2(0.2,projectCenter.y), camera);
            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
            raycaster.setFromCamera(new THREE.Vector2(0,projectCenter.y+0.15), camera);
            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
            datumPlanes[i].datumPoint = datumPoint;
        }

        // 填充

        let thriftDPs = new ThriftDatumPlanes();
        // thriftDPs.datumPlanes = new Array(datumPlanes.length);
        thriftDPs.constraintPoint = new ThriftVector3();
        thriftDPs.constraintPoint.x = constraintPoint.x;
        thriftDPs.constraintPoint.y = constraintPoint.y;
        thriftDPs.constraintPoint.z = constraintPoint.z;

        thriftDPs.intersectPoint = new ThriftVector3();
        thriftDPs.intersectPoint.x = lookTerrainCenter.intersectP.x;
        thriftDPs.intersectPoint.y = lookTerrainCenter.intersectP.y
        thriftDPs.intersectPoint.z = lookTerrainCenter.intersectP.z;
        let ttPlanes = new Array(datumPlanes.length);

        for(let k = 0;  k < datumPlanes.length; ++k)
        {
            let thriftDP = new ThriftDatumPlane();
            thriftDP.datumPoints = new Array(datumPlanes[k].datumPoint.length);

            for(let g = 0; g < datumPlanes[k].datumPoint.length; ++g)
            {
                let v2 = new ThriftVector3();

                v2.x = datumPlanes[k].datumPoint[g].x;
                v2.y = datumPlanes[k].datumPoint[g].y;
                v2.z = datumPlanes[k].datumPoint[g].z;

                thriftDP.datumPoints[g] = v2;
            }
            ttPlanes[k] = thriftDP;
            // thriftDPs.datumPlanes[k]=thriftDP;
        }

        thriftDPs.datumPlanes=ttPlanes;

        let ttCamera = new ThriftCamera();

        ttCamera.matrixWorldInverse = new ThriftMatrix4();
        ttCamera.projectionMatrix = new ThriftMatrix4();

        let ttmwi = camera.matrixWorldInverse;

        ttCamera.matrixWorldInverse.n11 = ttmwi.elements[0];
        ttCamera.matrixWorldInverse.n12 = ttmwi.elements[1];
        ttCamera.matrixWorldInverse.n13 = ttmwi.elements[2];
        ttCamera.matrixWorldInverse.n14 = ttmwi.elements[3];

        ttCamera.matrixWorldInverse.n21 = ttmwi.elements[4];
        ttCamera.matrixWorldInverse.n22 = ttmwi.elements[5];
        ttCamera.matrixWorldInverse.n23 = ttmwi.elements[6];
        ttCamera.matrixWorldInverse.n24 = ttmwi.elements[7];

        ttCamera.matrixWorldInverse.n31 = ttmwi.elements[8];
        ttCamera.matrixWorldInverse.n32 = ttmwi.elements[9];
        ttCamera.matrixWorldInverse.n33 = ttmwi.elements[10];
        ttCamera.matrixWorldInverse.n34 = ttmwi.elements[11];

        ttCamera.matrixWorldInverse.n41 = ttmwi.elements[12];
        ttCamera.matrixWorldInverse.n42 = ttmwi.elements[13];
        ttCamera.matrixWorldInverse.n43 = ttmwi.elements[14];
        ttCamera.matrixWorldInverse.n44 = ttmwi.elements[15];

        let ttpm = camera.projectionMatrix;
        ttCamera.projectionMatrix.n11 = ttpm.elements[0];
        ttCamera.projectionMatrix.n12 = ttpm.elements[1];
        ttCamera.projectionMatrix.n13 = ttpm.elements[2];
        ttCamera.projectionMatrix.n14 = ttpm.elements[3];

        ttCamera.projectionMatrix.n21 = ttpm.elements[4];
        ttCamera.projectionMatrix.n22 = ttpm.elements[5];
        ttCamera.projectionMatrix.n23 = ttpm.elements[6];
        ttCamera.projectionMatrix.n24 = ttpm.elements[7];

        ttCamera.projectionMatrix.n31 = ttpm.elements[8];
        ttCamera.projectionMatrix.n32 = ttpm.elements[9];
        ttCamera.projectionMatrix.n33 = ttpm.elements[10];
        ttCamera.projectionMatrix.n34 = ttpm.elements[11];

        ttCamera.projectionMatrix.n41 = ttpm.elements[12];
        ttCamera.projectionMatrix.n42 = ttpm.elements[13];
        ttCamera.projectionMatrix.n43 = ttpm.elements[14];
        ttCamera.projectionMatrix.n44 = ttpm.elements[15];

        let ress = null;
        var exc = false;
        // DIVISION
        try {
            ress = this.client.searchPhotoByNearest(this.resourceID, ttCamera, thriftDPs);
            console.log(ress);
        } catch(excp){
            console.log(excp.errorType);
            console.log(excp.errorDes);

            exc = true;

            return null;
        }

        let projM = new THREE.Matrix4();
        let viewM = new THREE.Matrix4();

        if(!exc) {
            this.betterArNode.index = ress.index;
            this.betterArNode.imgPower = ress.imgPower;
            this.betterArNode.deltaCenter = ress.deltaToCenter;
            this.betterArNode.angle = ress.angle;
            this.betterArNode.imgUrl = ress.imgUrl;

            viewM.set(ress.viewMatrix.n11, ress.viewMatrix.n12, ress.viewMatrix.n13, ress.viewMatrix.n14,
                ress.viewMatrix.n21, ress.viewMatrix.n22, ress.viewMatrix.n23, ress.viewMatrix.n24,
                ress.viewMatrix.n31, ress.viewMatrix.n32, ress.viewMatrix.n33, ress.viewMatrix.n34,
                ress.viewMatrix.n41, ress.viewMatrix.n42, ress.viewMatrix.n43, ress.viewMatrix.n44);

            projM.set(ress.projectionMatrix.n11,ress.projectionMatrix.n12,ress.projectionMatrix.n13,ress.projectionMatrix.n14,
                ress.projectionMatrix.n21,ress.projectionMatrix.n22,ress.projectionMatrix.n23,ress.projectionMatrix.n24,
                ress.projectionMatrix.n31,ress.projectionMatrix.n32,ress.projectionMatrix.n33,ress.projectionMatrix.n34,
                ress.projectionMatrix.n41,ress.projectionMatrix.n42,ress.projectionMatrix.n43,ress.projectionMatrix.n44);

            this.betterArNode.viewMatrix = viewM;
            this.betterArNode.projectionMatrix = projM;
            return this.betterArNode;
        }
        //
        return null;
    }
    //
    applyArNode(camera, arNode, keepPos) {
        this.terrainLayer.dataBasePager.enableRequestData = false;
        this.cameraAnimation = new ArCameraAnimation(camera, arNode, keepPos);
    }


}

export {ARLayer};
