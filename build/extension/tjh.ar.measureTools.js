/**
 * @classdesc 测量工具
 * @class
 * @memberOf tjh.ar
 * @param {Camera} camera -相机
 * @param {group} layer -图层（数组）
 * @param {object} scene -场景
 * @param {array} globalOffset -偏移量
 */

class MeasureTools extends tjh.ar.WindowEventListener {
    constructor(viewer,layers, globalOffset){
        super(viewer);

        let measureTool = this;

        measureTool.raycaster = new THREE.Raycaster();

        /**
         * 测量模式
         * @enum {number}
         */
        MeasureTools.MEASURE_MODE = {
            /** @description 水平距离*/
            MEASURE_HOR_DISTANCE: 0,
            /** @description 夹角*/
            MEASURE_ANGLE: 1,
            /** @description 垂直距离*/
            MEASURE_VER_DISTANCE: 2,
            /** @description 地表面积*/
            MEASURE_EARTH_SURFACE: 4,
            /** @description 空间面积*/
            MEASURE_SPACE_SURFACE: 5,
            /** @description 坐标查询*/
            MEASURE_COORDINATES: 6,
            /** @description 标注添加*/
            LABEL_ATTACH: 7,
            /** @description 垂直测高*/
            MEASURE_VER_Height: 8,

            MEASURE_DEFAULT:9,
        }

        measureTool.polygonVertices = [];

        measureTool.attachLabelText = "attch";

        /**
         * 高值附加偏移量 zOffset
         * @type {number}
         */
        measureTool.zOffset = 0.0;

        let isMeasureFinished = false;
        /**
         * 地形图层引用 refLayers
         * @type {Array}
         */
        measureTool.refLayers = null;
        if(layers instanceof Array)
            measureTool.refLayers = layers;
        else
            measureTool.refLayers = [layers];


        measureTool.viewer = viewer;
        let tempVertices = [];

        /**
         * 图像的显示设置 drawOptions
         * @type {object}
         */
        measureTool.drawOptions = {
            /** @description 颜色*/
            color: new THREE.Color(0xff0000),
            /** @description 透明*/
            transparent:true,
            /** @description 透明度*/
            opacity: 0.6,
            /** @description 显示面*/
            side: THREE.DoubleSide,
            polygonOffset:true,
            polygonOffsetUnits:-10,
            polygonOffsetFactor:-4
        }

        /**
         * 标注控制 labelControler
         * @enum
         */
        measureTool.labelControler = {
            /**
             * 标注透明度 opacity
             * @type {number}
             *
             */
            opacity : 1.0,
            /**
             * 标注颜色 color
             * @type {THREE.Color}
             */
            color : new THREE.Color(0xffff00),
            /**
             * 标注的面 side
             * @type {THREE.DoubleSize}
             */
            side : THREE.DoubleSize,
            /**
             * 标注字体大小 fontSize
             * @type {number}
             */
            fontSize : 1.0,
            /**
             * 标注字距 fontDivisions
             * @type {number}
             */
            fontDivisions : 2,

            fontName:"helvetiker_regular",
        }

        THREE.FontManager.getFont(this.labelControler.fontName);

        let pointMaterial = null;
        let lineMaterial = null;
        let polygonMaterial = null;
        let labelMaterial = null;

        let polyhedronMaterial = null;

        let measureHighPlane = null;

        /**
         * 重新初始化材质--每次更改测量工具相关设置，应随后调用该方法，以应用更改 initMaterial
         * @type {function}
         */
        this.initMaterial = function () {
            THREE.FontManager.getFont(measureTool.labelControler.fontName);
            pointMaterial = new THREE.PointsMaterial(measureTool.drawOptions);
            pointMaterial.depthTest = false;

            lineMaterial = new THREE.LineBasicMaterial(measureTool.drawOptions);
            lineMaterial.depthTest = false;

            polygonMaterial = new THREE.MeshBasicMaterial(measureTool.drawOptions);
            polygonMaterial.depthTest = false;

            polyhedronMaterial = new THREE.MeshBasicMaterial(measureTool.drawOptions);
            polyhedronMaterial.depthTest = false;

            labelMaterial = new THREE.MeshBasicMaterial({
                color: measureTool.labelControler.color,
                transparent: true,
                opacity: measureTool.labelControler.opacity,
                side: THREE.DoubleSide,
            });
            labelMaterial.depthTest = false;
        }

        measureTool.initMaterial();

        measureTool.measureMode = MeasureTools.MEASURE_MODE.MEASURE_SPACE_SURFACE;

        let clearTempObjs = function (strDrawType) {

            for(let i = 0, len = measureTool.tempObj.children.length; i < len; ++i)
            {
                if(measureTool.tempObj.children[i]=== undefined)
                    continue;
                if(measureTool.tempObj.children[i].drawType === strDrawType)
                {
                    measureTool.tempObj.children[i].dispose();
                    measureTool.tempObj.remove(measureTool.tempObj.children[i]);
                    i--;
                }
            }
        }

        measureTool.tempObj.update = (context)=>{
            for(let i = 0, ilen = measureTool.tempObj.children.length; i < ilen; ++i)
            {
                let object = measureTool.tempObj.children[i];
                for(let k = 0, len = object.children.length; k < len; ++k )
                {
                    if(object.children[k].drawType === "measureLabel")
                    {
                        object.children[k].quaternion.copy(context.camera.quaternion.clone());
                        object.updateMatrixWorld(true);
                    }
                }
            }

        }


        /**
         * 创建矢量标注
         */
        let createLabel = (text, position)=>{
            // 标注
            let tmpFont = THREE.FontManager.getFont(measureTool.labelControler.fontName);
            if(tmpFont !== null) {
                let textShape = new THREE.BufferGeometry();
                let shapes = tmpFont.generateShapes(text, measureTool.labelControler.fontSize, measureTool.labelControler.fontDivisions);
                let geom = new THREE.ShapeGeometry(shapes);
                geom.computeBoundingBox();
                let xMid = -0.5 * (geom.boundingBox.max.x - geom.boundingBox.min.x);

                geom.translate(xMid, 0, 0);
                textShape.fromGeometry(geom);
                //
                geom.dispose();
                geom = null;
                //
                let textMat = labelMaterial;

                let textMesh = new THREE.Mesh(textShape, textMat);
                textMesh.renderOrder = 100;

                textMesh.drawType = "measureLabel";

                textMesh.position.copy(position);

                textMesh.visible = true;
                textMesh.updateMatrixWorld(true);
                textMesh.isLabel = true;

                return textMesh;

            }
            else
                return null;
        }

        let getIntersectHeight = function (center, clientX, clientY) {
            measureHighPlane = new THREE.Plane();
            let lookAt = measureTool.viewer.getCamera().matrixWorldInverse.getLookAt();
            measureHighPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(lookAt.lookDirection.x, lookAt.lookDirection.y, lookAt.lookDirection.z), center);

            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, measureTool.viewer.getCamera());
            if(measureTool.viewer.getCamera().isOrthographicCamera) {
                let testOrigin = new THREE.Vector3(mouse.x, mouse.y, -1).unproject(measureTool.viewer.getCamera());
                raycaster.ray.origin.copy(testOrigin);
            }
            let intersect1 = new THREE.Vector3();
            intersect1 = raycaster.ray.intersectPlane(measureHighPlane, intersect1);

            let tempVer = [];
            if(intersect1 !== null)
            {
                tempVer[tempVer.length] = intersect1.x - globalOffset[0]
                tempVer[tempVer.length] = intersect1.y - globalOffset[1]
                tempVer[tempVer.length] = intersect1.z - globalOffset[2]
            }
            return tempVer;
        }
        /**
         * @description 点的坐标
         * @param mouseEvent
         */
        let measureCoordinate = function (mouseEvent) {
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
            //
            measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
            let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
            //
            if(intersects.length !== 0)
            {
                tempVertices[tempVertices.length] = intersects[0].point.x-globalOffset[0];
                tempVertices[tempVertices.length] = intersects[0].point.y-globalOffset[1];
                tempVertices[tempVertices.length] = intersects[0].point.z - globalOffset[2];
            }

            //
            let pointGeom = new THREE.BufferGeometry();
            pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));

            let pointMesh = new THREE.Points(pointGeom, pointMaterial);
            pointMesh.drawType = "point";
            pointMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

            pointMesh.visible = true;

            let coorText = "x: "+intersects[0].point.x.toFixed(2) + "; " + "y: "+intersects[0].point.y.toFixed(2) + "; " +
                "z: "+intersects[0].point.z.toFixed(2) + "; ";
            let pointLabel = createLabel(coorText, intersects[0].point);

            let tmp = new THREE.Group();
            tmp.add(pointLabel);
            tmp.add(pointMesh);
            tmp.drawType = "measureCoord";
            measureTool.tempObj.add(tmp);
            tempVertices = [];
        }

        this.attachLabel = function (labelVer) {
            if(measureTool.measureMode !== MeasureTools.MEASURE_MODE.LABEL_ATTACH)
                return;
            if(labelVer !== null && labelVer !== undefined)
            {
                tempVertices[0] = labelVer;
            }
            //
            let attachLabel = createLabel(measureTool.attachLabelText, tempVertices[0]);
            if(!attachLabel)
            {
                tempVertices = [];

                return null;
            }
            attachLabel.drawType = "attachLabel";
            measureTool.tempObj.add(attachLabel);
            tempVertices = [];
        }

        let measureAngle = function () {
            if(tempVertices.length < 6)
            {
                clearTempObjs("tempDraw");
                tempVertices = [];
                return false;
            }

            let lineGeom = new THREE.BufferGeometry();
            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));
            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

            lineMesh.drawType = "line";
            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);
            //measureTool.refLayers.add(lineMesh);
            let vec1 = new THREE.Vector3(tempVertices[0] - tempVertices[3], tempVertices[1] - tempVertices[4],
                tempVertices[2] - tempVertices[5]);

            let vec2 = new THREE.Vector3(tempVertices[6] - tempVertices[3], tempVertices[7] - tempVertices[4],
                tempVertices[8] - tempVertices[5]);

            let angle = vec2.angleTo(vec1);

            let coorText = THREE.Math.radToDeg(angle).toFixed(2) + "°";
            let temPos = new THREE.Vector3(tempVertices[3] + globalOffset[0],tempVertices[4] + globalOffset[1],tempVertices[5] + globalOffset[2]);

            let linetLabel = createLabel(coorText, temPos);

            let tmp = new THREE.Group();
            tmp.add(linetLabel);
            tmp.add(lineMesh);
            tmp.drawType = "measureAngle";
            measureTool.tempObj.add(tmp);

            tempVertices = [];

            clearTempObjs("tempDraw");
        }

        let measureHorDistance = function (tv) {
            // todo:生成临时线段
            let lineGeom = new THREE.BufferGeometry();
            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

            let fisV = new THREE.Vector3(tv[0], tv[1], 0.0);
            let secV = new THREE.Vector3(tv[3], tv[4], 0.0);

            lineMesh.drawType = "line";
            let coorText = fisV.distanceTo(secV).toFixed(2) ;

            fisV.z = tv[2];
            secV.z = tv[2];
            let temPos = new THREE.Vector3((fisV.x + secV.x)/2 + globalOffset[0],(fisV.y + secV.y)/2 + globalOffset[1],(fisV.z + secV.z)/2 + globalOffset[2]);

            let linetLabel = createLabel(coorText, temPos);

            let tmp = new THREE.Group();
            tmp.add(linetLabel);
            tmp.add(lineMesh);
            tmp.drawType = "measureHorDistance";
            measureTool.tempObj.add(tmp);
        }


        let measureVerDistance = function (tv) {
            let lineGeom = new THREE.BufferGeometry();
            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

            let fisV = new THREE.Vector3(tv[0], tv[1], tv[2]);
            let secV = new THREE.Vector3(tv[0], tv[1], tv[5]);

            lineMesh.drawType = "line";
            let coorText = Math.abs(secV.z - fisV.z).toFixed(2) ;
            secV.x+=globalOffset[0];
            secV.y+=globalOffset[1];
            secV.z+=globalOffset[2];

            let linetLabel = createLabel(coorText, secV);

            let tmp = new THREE.Group();
            tmp.add(linetLabel);
            tmp.add(lineMesh);
            tmp.drawType = "measureVerDistance";
            measureTool.tempObj.add(tmp);
            tempVertices = [];
        }

        let measureVerHeight = function (tv) {
            let tmp = new THREE.Group();
            let lineGeom1= new THREE.BufferGeometry();
            lineGeom1.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
            let lineMesh1 = new THREE.Line(lineGeom1, lineMaterial);

            lineMesh1.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);
            tmp.add(lineMesh1);

            let height = tv[5] - tv[2];

            let temPos = new THREE.Vector3(tv[3] + globalOffset[0], tv[4]+globalOffset[1], tv[5]+globalOffset[2]);

            let tempTv = tv.slice(0);
            tempTv[0] = tempTv[3];
            tempTv[1] = tempTv[4];

            let lineGeom3= new THREE.BufferGeometry();
            lineGeom3.addAttribute('position', new THREE.Float32BufferAttribute(tempTv, 3));
            let tempMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xff0000),
                side: THREE.DoubleSide});
            tempMat.depthTest = false;
            let lineMesh3 = new THREE.Line(lineGeom3, tempMat);

            lineMesh3.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);
            tmp.add(lineMesh3);

            tv[5] = tv[2];
            let lineGeom2= new THREE.BufferGeometry();
            lineGeom2.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
            let lineMesh2 = new THREE.Line(lineGeom2, lineMaterial);

            lineMesh2.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);
            tmp.add(lineMesh2);

            let coorText = Math.abs(height).toFixed(2) ;

            let linetLabel = createLabel(coorText, temPos);
            tmp.add(linetLabel);

            tmp.drawType = "measureVerHeight";
            measureTool.tempObj.add(tmp);
            tempVertices = [];
        }

        let computeSurface = function (geomVertices, isSpace) {
            let tmp = tjh.util.PolygonUtil.polygonTriangulate([geomVertices]);
            //
            let area = 0;

            for (let n = 0, numFace = tmp.length / 9; n < numFace; n++) {
                let cds = [new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9], tmp[(numFace - 1 - n) * 9 + 1], isSpace?tmp[(numFace - 1 - n) * 9 + 2]:0),
                    new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9 + 3], tmp[(numFace - 1 - n) * 9 + 4], isSpace?tmp[(numFace - 1 - n) * 9 + 5]:0),
                    new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9 + 6], tmp[(numFace - 1 - n) * 9 + 7], isSpace?tmp[(numFace - 1 - n) * 9 + 8]:0),
                    new jsts.geom.Coordinate(tmp[(numFace - 1 - n) * 9], tmp[(numFace - 1 - n) * 9 + 1], isSpace?tmp[(numFace - 1 - n) * 9 + 2]:0)];
                //
                area += Math.abs(jsts.geom.Triangle.area3D(cds[0], cds[1], cds[2]));
            }
            return area;
        }

        let measureEarthSurface = function () {
            // tempVertices 存放的是vector3
            if(tempVertices.length < 3)
            {
                clearTempObjs("tempDraw");
                clearTempObjs("tempDrawLine");
                tempVertices = [];
                measureTool.polygonVertices = [];
                return false;
            }
            tempVertices[tempVertices.length] = tempVertices[0];
            let pgShape = new THREE.Shape(tempVertices);
            let pgGeom = new THREE.ShapeBufferGeometry(pgShape);
            let pgMesh = new THREE.Mesh(pgGeom, polygonMaterial);

            pgMesh.drawType = "polygon";
            pgMesh.position.set(globalOffset[0], globalOffset[1], tempVertices[0].z +measureTool.zOffset);

            let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
            let tempVer = faces.slice(0, 9);
            let tempGeom = new THREE.BufferGeometry();
            tempGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVer, 3));

            tempGeom.computeBoundingSphere();
            let pgCenter = tempGeom.boundingSphere.center;

            pgCenter.x += globalOffset[0];
            pgCenter.y += globalOffset[1];
            pgCenter.z += globalOffset[2];

            let coorText = computeSurface(tempVertices,false).toFixed(2) ;

            let pgLabel = createLabel(coorText, pgCenter);

            let tmp = new THREE.Group();
            tmp.add(pgLabel);
            tmp.add(pgMesh);
            tmp.drawType = "measureEarth";
            measureTool.tempObj.add(tmp);

            tempVertices = [];

            clearTempObjs("tempDraw");
        }


        let measureSpaceSurface = function () {
            if(tempVertices.length < 3)
            {
                clearTempObjs("tempDraw");
                tempVertices = [];
                return false;
            }

            let tmp = new THREE.Group();

            let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);

            let pgGeom = new THREE.BufferGeometry();
            pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));

            let temver = faces.slice(0, 9);
            let tempGeom = new THREE.BufferGeometry();
            tempGeom.addAttribute('position', new THREE.Float32BufferAttribute(temver, 3));

            tempGeom.computeBoundingSphere();
            let pgCenter = tempGeom.boundingSphere.center;

            pgCenter.x += globalOffset[0];
            pgCenter.y += globalOffset[1];
            pgCenter.z += globalOffset[2];

            let pgMesh = new THREE.Mesh(pgGeom,  polyhedronMaterial);

            pgMesh.position.set(globalOffset[0], globalOffset[1],globalOffset[2]);
            pgMesh.drawType = "SpaceSurface";

            tempVertices[tempVertices.length] = tempVertices[0];
            let sumSurface = computeSurface(tempVertices,true).toFixed(2);
            let coorText = sumSurface;

            let pgLabel = createLabel(coorText, pgCenter);

            tmp.add(pgLabel);
            tmp.add(pgMesh);

            tmp.drawType = "measureSpace";
            measureTool.tempObj.add(tmp);

            tempVertices = [];

            clearTempObjs("tempDraw");
        }

        this.onLeftDown = (mouseEvent) =>{
            clearTempObjs("tempDraw");
            switch (measureTool.measureMode)
            {
                case MeasureTools.MEASURE_MODE.MEASURE_COORDINATES:
                {
                    measureCoordinate(mouseEvent);
                    return true;
                }break;
                case MeasureTools.MEASURE_MODE.MEASURE_ANGLE:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    let tv = [];
                    if (intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        tempVertices[tempVertices.length] = intersects[0].point.x - globalOffset[0];
                        tempVertices[tempVertices.length] = intersects[0].point.y - globalOffset[1];
                        tempVertices[tempVertices.length] = intersects[0].point.z - globalOffset[2];

                        if(tempVertices.length <= 3)
                            return true;

                        tv[tv.length] = tempVertices[tempVertices.length - 6];
                        tv[tv.length] = tempVertices[tempVertices.length - 5];
                        tv[tv.length] = tempVertices[tempVertices.length - 4];

                        tv[tv.length] = tempVertices[tempVertices.length - 3] ;
                        tv[tv.length] = tempVertices[tempVertices.length - 2];
                        tv[tv.length] = tempVertices[tempVertices.length - 1];
                    }

                    // todo:生成临时线段
                    let lineGeom = new THREE.BufferGeometry();
                    lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                    let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                    lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2] +measureTool.zOffset);

                    lineMesh.drawType = "tempDraw";
                    measureTool.tempObj.add(lineMesh);

                    if(tempVertices.length === 9)
                    {
                        measureAngle(mouseEvent);
                    }
                    return true;
                }break;
                case MeasureTools.MEASURE_MODE.MEASURE_HOR_DISTANCE:
                {
                    clearTempObjs("tempDraw");
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    let tv = [];
                    if (intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        tempVertices[tempVertices.length] = intersects[0].point.x - globalOffset[0];
                        tempVertices[tempVertices.length] = intersects[0].point.y - globalOffset[1];
                        if(tempVertices.length < 3)
                            tempVertices[tempVertices.length] = intersects[0].point.z - globalOffset[2];
                        else
                            tempVertices[tempVertices.length] = tempVertices[2];


                        if(tempVertices.length <= 3)
                            return false;

                        tv[tv.length] = tempVertices[tempVertices.length-6];
                        tv[tv.length] = tempVertices[tempVertices.length-5];
                        tv[tv.length] = tempVertices[2];

                        tv[tv.length] = tempVertices[tempVertices.length-3];
                        tv[tv.length] = tempVertices[tempVertices.length-2];
                        tv[tv.length] = tempVertices[2];
                    }

                    measureHorDistance(tv);
                    return true;
                }break;
                case MeasureTools.MEASURE_MODE.MEASURE_EARTH_SURFACE:
                {
                    if(isMeasureFinished)
                    {
                        measureTool.polygonVertices = [];
                        isMeasureFinished = false;
                    }
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        measureTool.polygonVertices[measureTool.polygonVertices.length] = intersects[0].point;
                        intersects[0].point.x = intersects[0].point.x - globalOffset[0];
                        intersects[0].point.y = intersects[0].point.y - globalOffset[1];
                        intersects[0].point.z = intersects[0].point.z - globalOffset[2] ;
                        tempVertices[tempVertices.length] = intersects[0].point;
                    }

                    if(tempVertices.length === 2)
                    {
                        let tv = [];
                        {
                            tv[tv.length] = tempVertices[tempVertices.length-1].x;
                            tv[tv.length] = tempVertices[tempVertices.length-1].y;
                            tv[tv.length] = tempVertices[tempVertices.length-1].z;

                            tv[tv.length] = tempVertices[tempVertices.length-2].x;
                            tv[tv.length] = tempVertices[tempVertices.length-2].y;
                            tv[tv.length] = tempVertices[tempVertices.length-2].z;
                        }
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                        let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                        lineMesh.position.set(globalOffset[0], globalOffset[1],globalOffset[2] +measureTool.zOffset);

                        lineMesh.drawType = "tempDraw";
                        measureTool.tempObj.add(lineMesh);
                    }

                    if(tempVertices.length >= 3)
                    {
                        let phShape = new THREE.Shape(tempVertices);
                        let phGeom = new THREE.ShapeBufferGeometry(phShape);
                        let phMesh = new THREE.Mesh(phGeom, polygonMaterial);

                        phMesh.position.set(globalOffset[0], globalOffset[1],tempVertices[0].z + globalOffset[2] +measureTool.zOffset);
                        phMesh.drawType = "tempDraw";
                        measureTool.tempObj.add(phMesh);
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_SPACE_SURFACE:
                {
                    if(isMeasureFinished)
                    {
                        measureTool.polygonVertices = [];
                        isMeasureFinished = false;
                    }
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    if(intersects.length === 0)
                        return true;
                    else(intersects.length !== 0)
                    {
                        intersects[0].point.x = intersects[0].point.x - globalOffset[0];
                        intersects[0].point.y = intersects[0].point.y - globalOffset[1];
                        intersects[0].point.z = intersects[0].point.z - globalOffset[2];
                        tempVertices[tempVertices.length] = intersects[0].point;
                    }

                    if(tempVertices.length === 2)
                    {
                        let tv = [];
                        {
                            tv[tv.length] = tempVertices[tempVertices.length-1].x;
                            tv[tv.length] = tempVertices[tempVertices.length-1].y;
                            tv[tv.length] = tempVertices[tempVertices.length-1].z;

                            tv[tv.length] = tempVertices[tempVertices.length-2].x;
                            tv[tv.length] = tempVertices[tempVertices.length-2].y;
                            tv[tv.length] = tempVertices[tempVertices.length-2].z;
                        }
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                        let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                        lineMesh.position.set(globalOffset[0], globalOffset[1],globalOffset[2]+measureTool.zOffset);

                        lineMesh.drawType = "tempDraw";
                        measureTool.tempObj.add(lineMesh);
                    }

                    if(tempVertices.length >= 3)
                    {
                        let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
                        let pgGeom = new THREE.BufferGeometry();
                        pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                        let pgMesh = new THREE.Mesh(pgGeom, polyhedronMaterial);

                        pgMesh.position.set(globalOffset[0], globalOffset[1],globalOffset[2]);
                        pgMesh.drawType = "tempDraw";
                        measureTool.tempObj.add(pgMesh);
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_DISTANCE:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //

                    if(intersects.length !== 0)
                    {
                        if (tempVertices.length === 0) {
                            tempVertices[tempVertices.length] = intersects[0].point.x - globalOffset[0];
                            tempVertices[tempVertices.length] = intersects[0].point.y - globalOffset[1];
                            tempVertices[tempVertices.length] = intersects[0].point.z - globalOffset[2];
                            return false;
                        }
                    }
                    let firstPoint = new THREE.Vector3(tempVertices[0] + globalOffset[0], tempVertices[1] + globalOffset[1],tempVertices[2] + globalOffset[2])

                    let tempVer = getIntersectHeight(firstPoint,clientX,clientY);

                    if(tempVer.length === 0)
                        return false;

                    tempVertices[tempVertices.length] = tempVertices[0];
                    tempVertices[tempVertices.length] = tempVertices[1];
                    tempVertices[tempVertices.length] = tempVer[2];

                    measureVerDistance(tempVertices);

                    return true;
                }
                case MeasureTools.MEASURE_MODE.LABEL_ATTACH:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    if(intersects.length !== 0)
                    {
                        tempVertices[tempVertices.length] = intersects[0].point;
                        measureTool.attachLabel();
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_Height:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    let tv = [];
                    if (intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        tempVertices[tempVertices.length] = intersects[0].point.x - globalOffset[0];
                        tempVertices[tempVertices.length] = intersects[0].point.y - globalOffset[1];
                        tempVertices[tempVertices.length] = intersects[0].point.z - globalOffset[2];

                        if(tempVertices.length <= 3)
                            return false;

                        measureVerHeight(tempVertices);
                    }

                    return true;
                }
                default:
                    return false;
            }
        }

        this.onMouseMove = (mouseEvent) =>{
            switch (measureTool.measureMode)
            {
                case MeasureTools.MEASURE_MODE.MEASURE_ANGLE:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //

                    let tv = [];
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if(tempVertices.length < 3)
                            return false;

                        tv = tempVertices.concat([intersects[0].point.x - globalOffset[0], intersects[0].point.y - globalOffset[1]],intersects[0].point.z - globalOffset[2]);

                        if(tv.length <= 9)
                        {
                            let lineGeom = new THREE.BufferGeometry();
                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

                            lineMesh.drawType = "tempDraw";
                           measureTool.tempObj.add(lineMesh);
                        }
                    }

                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_HOR_DISTANCE:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //

                    let tv = [];
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if(tempVertices.length < 3)
                            return false;

                        tv = tempVertices.concat([intersects[0].point.x - globalOffset[0], intersects[0].point.y - globalOffset[1]],tempVertices[2]);
                    }

                    let lineGeom = new THREE.BufferGeometry();
                    lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                    let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                    lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

                    lineMesh.drawType = "tempDraw";
                   measureTool.tempObj.add(lineMesh);
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_EARTH_SURFACE:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    let tv = [];
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if (tempVertices.length === 1) {
                            {
                                tv[tv.length] = tempVertices[tempVertices.length - 1].x;
                                tv[tv.length] = tempVertices[tempVertices.length - 1].y;
                                tv[tv.length] = tempVertices[tempVertices.length - 1].z;

                                tv[tv.length] = intersects[0].point.x - globalOffset[0];
                                tv[tv.length] = intersects[0].point.y - globalOffset[1];
                                tv[tv.length] = tempVertices[tempVertices.length - 1].z;
                            }
                            let lineGeom = new THREE.BufferGeometry();
                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

                            lineMesh.drawType = "tempDraw";

                           measureTool.tempObj.add(lineMesh);
                        }

                        if (tempVertices.length >= 2) {
                            intersects[0].point.x = intersects[0].point.x - globalOffset[0];
                            intersects[0].point.y = intersects[0].point.y - globalOffset[1];
                            intersects[0].point.z = intersects[0].point.z - globalOffset[2];
                            tv[tv.length] = intersects[0].point;
                            tv = tempVertices.concat([intersects[0].point]);

                            tv[tv.length-1].z = tv[0].z;

                            let pgShape = new THREE.Shape(tv);
                            let pgGeom = new THREE.ShapeBufferGeometry(pgShape);
                            let pgMesh = new THREE.Mesh(pgGeom, polygonMaterial);

                            pgMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2] + tv[0].z +measureTool.zOffset);
                            pgMesh.drawType = "tempDraw";
                           measureTool.tempObj.add(pgMesh);
                        }
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_SPACE_SURFACE:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObject( measureTool.refLayers,true);
                    //
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        intersects[0].point.x = intersects[0].point.x - globalOffset[0];
                        intersects[0].point.y = intersects[0].point.y - globalOffset[1];
                        intersects[0].point.z = intersects[0].point.z - globalOffset[2];

                        let tv = [];

                        if (tempVertices.length === 1) {
                            {
                                tv[tv.length] = tempVertices[tempVertices.length - 1].x;
                                tv[tv.length] = tempVertices[tempVertices.length - 1].y;
                                tv[tv.length] = tempVertices[tempVertices.length - 1].z;

                                tv[tv.length] = intersects[0].point.x;
                                tv[tv.length] = intersects[0].point.y;
                                // 统一z
                                tv[tv.length] = intersects[0].point.z;
                            }
                            let lineGeom = new THREE.BufferGeometry();
                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                            lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2] +measureTool.zOffset);

                            lineMesh.drawType = "tempDraw";
                            measureTool.tempObj.add(lineMesh);
                        }
                        if(tempVertices.length >= 2)
                        {
                            let tv = tempVertices.concat(intersects[0].point);
                            let faces = tjh.util.PolygonUtil.polygonTriangulate([tv]);
                            let pgGeom = new THREE.BufferGeometry();
                            pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                            let pgMesh = new THREE.Mesh(pgGeom, polyhedronMaterial);

                            pgMesh.position.set(globalOffset[0], globalOffset[1],globalOffset[2]);
                            pgMesh.drawType = "tempDraw";
                            measureTool.tempObj.add(pgMesh);
                        }
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_DISTANCE:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;


                    let tv = [];
                    if(tempVertices.length < 3)
                        return false;

                    let firstPoint = new THREE.Vector3(tempVertices[0] + globalOffset[0], tempVertices[1] + globalOffset[1],tempVertices[2] + globalOffset[2])

                    let tempVer = getIntersectHeight(firstPoint,clientX,clientY);

                    if(tempVer.length === 0)
                        return false;

                    tv = tempVertices.concat([tempVertices[0], tempVertices[1],tempVer[tempVer.length - 1]]);

                    if(tv.length === 6)
                    {
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                        let lineMesh = new THREE.Line(lineGeom, lineMaterial);

                        lineMesh.position.set(globalOffset[0], globalOffset[1], globalOffset[2]+measureTool.zOffset);

                        lineMesh.drawType = "tempDraw";
                        measureTool.tempObj.add(lineMesh);
                    }
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_Height:
                {
                    clearTempObjs("tempDraw");

                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / measureTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / measureTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    measureTool.raycaster.setFromCamera( mouse, measureTool.viewer.camera);
                    let intersects = measureTool.raycaster.intersectObjects( measureTool.refLayers,true);
                    //
                    let tv = [];
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        tv = tempVertices.concat([intersects[0].point.x - globalOffset[0], intersects[0].point.y - globalOffset[1],intersects[0].point.z - globalOffset[2]]);
                        if (tv.length === 6) {
                            let tmp = new THREE.Group();
                            let lineGeom1 = new THREE.BufferGeometry();
                            lineGeom1.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh1 = new THREE.Line(lineGeom1, lineMaterial);

                            lineMesh1.position.set(globalOffset[0], globalOffset[1], globalOffset[2] + measureTool.zOffset);
                            tmp.add(lineMesh1);

                            let height = tv[5] - tv[2];

                            let temPos = new THREE.Vector3(tv[3] + globalOffset[0], tv[4]+globalOffset[1], tv[5]+globalOffset[2]);

                            let tempTv = tv.slice(0);
                            tempTv[0] = tempTv[3];
                            tempTv[1] = tempTv[4];

                            let lineGeom3 = new THREE.BufferGeometry();
                            lineGeom3.addAttribute('position', new THREE.Float32BufferAttribute(tempTv, 3));
                            let tempMat = new THREE.MeshBasicMaterial({
                                color: new THREE.Color(0xff0000),
                                side: THREE.DoubleSide
                            });
                            tempMat.depthTest = false;
                            let lineMesh3 = new THREE.Line(lineGeom3, tempMat);

                            lineMesh3.position.set(globalOffset[0], globalOffset[1], globalOffset[2] + measureTool.zOffset);
                            tmp.add(lineMesh3);

                            tv[5] = tv[2];
                            let lineGeom2 = new THREE.BufferGeometry();
                            lineGeom2.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh2 = new THREE.Line(lineGeom2, lineMaterial);

                            lineMesh2.position.set(globalOffset[0], globalOffset[1], globalOffset[2] + measureTool.zOffset);
                            tmp.add(lineMesh2);

                            let coorText = Math.abs(height).toFixed(2);

                            let linetLabel = createLabel(coorText, temPos);
                            tmp.add(linetLabel);

                            tmp.drawType = "tempDraw";
                            measureTool.tempObj.add(tmp);
                        }
                    }
                    return true;
                }
                default:
                    return false;
            }
        }

        this.onRightDown= (mouseEvent) =>{
            switch (measureTool.measureMode)
            {
                case MeasureTools.MEASURE_MODE.MEASURE_ANGLE:
                {
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_HOR_DISTANCE:
                {
                    tempVertices = [];

                    clearTempObjs("tempDraw");

                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_EARTH_SURFACE:
                {
                    isMeasureFinished  = true;
                    measureEarthSurface();
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_SPACE_SURFACE:
                {
                    isMeasureFinished  = true;
                    measureSpaceSurface();
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_DISTANCE:
                {
                    tempVertices = [];

                    clearTempObjs("tempDraw");
                    return true;
                }
                case MeasureTools.MEASURE_MODE.MEASURE_VER_Height:
                {

                }
                default:
                    return false;
            }
        }

    }

    release()
    {
        for(let i=0; i<this.tempObj.children.length; ++i) {
            this.tempObj.remove(this.tempObj.children[i]);
        }
        super.release();
    }
}
