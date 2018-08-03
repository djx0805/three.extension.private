
/**
 * 环绕漫游
 * @class
 * @memberof tjh.ar
 * @extends tjh.ar.WindowEventListener
 */
class SpinAnimationTool extends  tjh.ar.WindowEventListener {
    constructor(viewer, terrianLayer, globalOffset) {
        super(viewer, terrianLayer, globalOffset);
        //
        this.ortheCamera = null;

        this.globalOffset = globalOffset;

        let spinTool = this;
        this.spinRadius = 120;

        this.spinHeight = 0;

        this.roamTool = new SmartRoam(viewer);
        this.roamTool.setSpeed(25);

        this.datumLine = new THREE.Group();

        let perRadian = 180/Math.PI;

        let crossLineOffset = 5;

        let construstCrossLine = (linePos)=>
        {
            // 清除上一次
            this.tempObj.remove(spinTool.datumLine);

            spinTool.datumLine = new THREE.Group();
            // 画个十字
            let crossMaterial1 = new THREE.LineBasicMaterial({color: 0x00ff00,side:THREE.DoubleSide})
            crossMaterial1.depthTest = false;

            let lineVertices1 = [];
            lineVertices1[0] = linePos.x;
            lineVertices1[1] = linePos.y;
            lineVertices1[2] = linePos.z + crossLineOffset;

            lineVertices1[3] = linePos.x;
            lineVertices1[4] = linePos.y;
            lineVertices1[5] = linePos.z - crossLineOffset;

            let lineVertices2 = [];
            lineVertices2[0] = linePos.x+crossLineOffset;
            lineVertices2[1] = linePos.y;
            lineVertices2[2] = linePos.z;

            lineVertices2[3] = linePos.x-crossLineOffset;
            lineVertices2[4] = linePos.y;
            lineVertices2[5] = linePos.z;

            let crossGeom1= new THREE.BufferGeometry();
            crossGeom1.addAttribute("position", new THREE.Float32BufferAttribute(lineVertices1,3));

            let crossLine1 = new THREE.Line(crossGeom1, crossMaterial1);

            //
            let crossMaterial2 = new THREE.LineBasicMaterial({color: 0xff0000,side:THREE.DoubleSide})
            crossMaterial2.depthTest = false;

            let crossGeom2= new THREE.BufferGeometry();
            crossGeom2.addAttribute("position", new THREE.Float32BufferAttribute(lineVertices2,3));

            let crossLine2 = new THREE.Line(crossGeom2, crossMaterial2);

            spinTool.datumLine.add(crossLine1);
            spinTool.datumLine.add(crossLine2);
            spinTool.datumLine.drawType = "datumLine";

            this.tempObj.add(spinTool.datumLine);
        }

        let divideRadians = function(centerPos){
            //
            var currentPosition = viewer.getCamera().position.clone();

            let vec2Len = new THREE.Vector2(centerPos.x - currentPosition.x, centerPos.y - currentPosition.y);

            spinTool.spinRadius = vec2Len.length();

            let perTheta = perRadian/spinTool.spinRadius;

            currentPosition.z += spinTool.spinHeight;

            let cc = currentPosition.clone(). sub(centerPos);

            let positionArray = [];


            for(let i = 0; i <= 360; i+=perTheta)
            {
                let rotate = new THREE.Matrix4();
                rotate.makeRotationAxis(new THREE.Vector3(0,0,1), THREE.Math.degToRad(i));
                let middlePoint = cc.clone().applyMatrix4(rotate);

                middlePoint.x += centerPos.x;
                middlePoint.y += centerPos.y;
                middlePoint.z = currentPosition.z;

                positionArray[positionArray.length] = middlePoint;

            }
            spinTool.roamTool.setPath(positionArray, centerPos);
        };
        this.onLeftDown = (mouseEvent)=>{
            if(!mouseEvent.ctrlKey)
                return false;

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
                return true;
            }
            //
            let intersectionPos = new THREE.Vector3(intersects[0].point.x,intersects[0].point.y ,intersects[0].point.z);

            construstCrossLine(intersectionPos.clone());

            divideRadians(intersectionPos.clone());

            return true;
        }

        this.onKeyDown = (keyboardEvent)=>
        {
            if(keyboardEvent.keyCode === 83)
            {
                if(!this.roamTool)
                    return true;
                viewer.pushEventListenerFront(this.roamTool);
                this.roamTool.start();
                return true;
            }
        }

    }
    release()
    {
        if(!this.roamTool)
            this.viewer.removeEventListenerFront(this.roamTool);
        if(this.tempObj.children.length > 0)
        {
            this.tempObj.remove(this.datumLine)
        }
    }

}

