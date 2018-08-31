class DrawTools extends tjh.ar.tools.ToolBase {
    constructor(viewer, fitLayer, modelLayer){
        super(viewer);

        let drawTool = this;

        drawTool.raycaster = new THREE.Raycaster();

        DrawTools.DRAW_MODE = {
            /** @description 点*/
            DRAW_POINT: 0,
            /** @description 线*/
            DRAW_LINE: 1,
            /** @description 面*/
            DRAW_POLYGON: 2,
            /** @description 体*/
            DRAW_POLYTOPE: 3,

            DRAW_DEFAULT:4,
        }

        drawTool.drawObjects = [];

        drawTool.polygonVertices = [];

        drawTool.step = 0;

        let isMeasureFinished = false;

        drawTool.drawMode = DrawTools.DRAW_MODE.DRAW_POLYTOPE;

        drawTool.viewer = viewer;

        let tempVertices = [];

        /**
         * 图像的显示设置 drawOptions
         * @type {object}
         */
        drawTool.drawOptions = {
            /** @description 颜色*/
            color: new THREE.Color(0xff0000),
            /** @description 透明*/
            transparent:true,
            /** @description 透明度*/
            opacity: 1.0,
            /** @description 显示面*/
            side: THREE.DoubleSide,
            polygonOffset:true,
            polygonOffsetUnits:-10,
            polygonOffsetFactor:-4
        }
        /**
         * 多面体的高度 polyherdronHeight
         * @type {number}
         */
        drawTool.polyherdronHeight = 25;

        /**
         * @description 画点
         * @param mouseEvent
         */
        let drawPoint = function (mouseEvent) {
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
            //
            drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
            let intersects = drawTool.raycaster.intersectObject( fitLayer,true);
            //
            if(intersects.length !== 0)
            {
                tempVertices[tempVertices.length] = 0;
                tempVertices[tempVertices.length] = 0;
                tempVertices[tempVertices.length] = 0;
            }
            //
            let pointGeom = new THREE.BufferGeometry();
            pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));

            let pointMesh = new THREE.Points(pointGeom, new THREE.PointsMaterial(drawTool.drawOptions));
            if(!drawTool.drawOptions.size) {
                pointMesh.material.size = 3;
            }
            pointMesh.position.copy(intersects[0].point);

            pointMesh.visible = true;

            if(modelLayer) {
                modelLayer.addThreeObj(pointMesh);
            }
            else {
                drawTool.tempObj.add(pointMesh);
            }
            //
            drawTool.drawObjects[drawTool.drawObjects.length] = pointMesh;
            tempVertices = [];
        }
        /**
         * @description 画线
         */
        let drawLine = function () {
            if(tempVertices.length === 0)
                return false;
            //
            if (tempVertices.length < 6) {
                if(drawTool.tempObj.children.length > 0) {
                    drawTool.tempObj.remove(drawTool.tempObj.children[0]);
                }
                //
                tempVertices = [];
            }
            else {
                drawTool.drawObjects[drawTool.drawObjects.length] = drawTool.tempObj.children[0];
                //
                if(modelLayer) {
                    modelLayer.addThreeObj(drawTool.tempObj.children[0]);
                }
                //
                tempVertices = [];
            }
            //
            return true;
        };
        /**
         * @description 画多边形
         */
        let drawPolygon = function () {
            if(tempVertices.length === 0)
                return false;
            //
            if(tempVertices.length < 3) {
                if(drawTool.tempObj.children.length > 0) {
                    drawTool.tempObj.remove(drawTool.tempObj.children[0]);
                }
                //
                tempVertices = [];
            }
            else {
                let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
                let pgGeom = new THREE.BufferGeometry();
                pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                let pgMesh = new THREE.Mesh(pgGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));

                pgMesh.position.copy(offset);
                //
                if(drawTool.tempObj.children.length > 0) {
                    drawTool.tempObj.remove(drawTool.tempObj.children[0]);
                    drawTool.tempObj.add(pgMesh);
                }
                if(modelLayer) {
                    modelLayer.addThreeObj(pgMesh);
                }
                drawTool.drawObjects[drawTool.drawObjects.length] = pgMesh;
                tempVertices = [];
            }
            //
            return true;
        }
        /**
         * @description 画多面体
         */
        let drawPolyhedron = function () {
            if(tempVertices.length === 0)
                return false;
            //
            if(tempVertices.length < 3) {
                if(drawTool.tempObj.children.length > 0) {
                    drawTool.remove(drawTool.tempObj.children[0]);
                }
                //
                tempVertices = [];
            }
            else {
                tempVertices.push(tempVertices[0].clone());
                let cds = [];
                for(let i=0; i<tempVertices.length; ++i) {
                    cds.push(new jsts.geom.Coordinate(tempVertices[i].x,tempVertices[i].y, tempVertices[i].z));
                }
                if(!jsts.algorithm.CGAlgorithms.isCCW(cds)) {
                    for(let i=0, length = cds.length; i < length; i++) {
                        tempVertices[i].x = cds[length - 1 - i].x;
                        tempVertices[i].y = cds[length - 1 - i].y;
                        tempVertices[i].z = cds[length - 1 - i].z;
                    }
                }
                //
                let phGroup = new THREE.Group();
                // 底面
                let tmp = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
                let phlfaces = [];
                for(let n=0, numFace = tmp.length/3; n<numFace; n++) {
                    phlfaces[n*3] = tmp[(numFace - 1 - n)*3];
                    phlfaces[n*3 + 1] = tmp[(numFace - 1 - n)*3 + 1];
                    phlfaces[n*3 + 2] = tmp[(numFace - 1 - n)*3 + 2];
                }
                let phlGeom = new THREE.BufferGeometry();
                phlGeom.addAttribute('position', new THREE.Float32BufferAttribute(phlfaces, 3));
                let phlMesh = new THREE.Mesh(phlGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));
                //
                phGroup.add(phlMesh);

                // 顶面
                let tmpVer = [];
                for(let i = 0, len = tempVertices.length; i < len; ++i)
                {
                    tmpVer[i] = tempVertices[i].clone();
                    tmpVer[i].z += drawTool.polyherdronHeight;
                }
                let phhfaces = tjh.util.PolygonUtil.polygonTriangulate([tmpVer]);
                let phhGeom = new THREE.BufferGeometry();
                phhGeom.addAttribute('position', new THREE.Float32BufferAttribute(phhfaces, 3));
                let phhMesh = new THREE.Mesh(phhGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));

                phGroup.add(phhMesh);
                //
                let phcGeom = new THREE.BufferGeometry();
                tempVertices[tempVertices.length] = tempVertices[0];
                let vertexes = [];
                for(let n=0, length = tempVertices.length; n<length; ++n) {
                    vertexes[vertexes.length] = tempVertices[n].x;
                    vertexes[vertexes.length] = tempVertices[n].y;
                    vertexes[vertexes.length] = tempVertices[n].z + drawTool.polyherdronHeight;

                    vertexes[vertexes.length] = tempVertices[n].x;
                    vertexes[vertexes.length] = tempVertices[n].y;
                    vertexes[vertexes.length] = tempVertices[n].z;
                }
                phcGeom.addAttribute( 'position', new THREE.Float32BufferAttribute( vertexes, 3 ) );
                let phcMesh = new THREE.Mesh(phcGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));
                phcMesh.drawMode = THREE.TriangleStripDrawMode;
                phGroup.add(phcMesh);
                //
                phGroup.position.copy(offset);
                //
                if(drawTool.tempObj.children.length > 0) {
                    drawTool.tempObj.remove(drawTool.tempObj.children[0]);
                    drawTool.tempObj.add(phGroup);
                }
                if(modelLayer) {
                    modelLayer.addThreeObj(drawTool.tempObj.children[0]);
                }
                //
                drawTool.drawObjects[drawTool.drawObjects.length] = phGroup;
                //
                tempVertices = [];
            }
            //
            return true;
        }

        //
        let offset = null;
        this.onLeftDown = (mouseEvent) =>{
            if(drawTool.step > 10) {
                drawTool.step = 0;
                drawTool.polygonVertices = [];
                offset = null;
            }
            //
            switch (drawTool.drawMode)
            {
                case DrawTools.DRAW_MODE.DRAW_POINT:
                {
                    drawTool.step = 100;
                    drawPoint(mouseEvent);
                }break;
                case DrawTools.DRAW_MODE.DRAW_LINE:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                    let intersects = drawTool.raycaster.intersectObject( fitLayer, true);
                    //
                    if (intersects.length === 0)
                        return false;
                    //
                    else(intersects.length !== 0)
                    {
                        if(!offset) {
                            offset = intersects[0].point.clone();
                        }
                        //
                        tempVertices[tempVertices.length] = intersects[0].point.x - offset.x;
                        tempVertices[tempVertices.length] = intersects[0].point.y - offset.y;
                        tempVertices[tempVertices.length] = intersects[0].point.z - offset.z;
                    }
                    //
                    if(tempVertices.length === 3) {
                        let pointGeom = new THREE.BufferGeometry();
                        pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));

                        let pointMesh = new THREE.Points(pointGeom, new THREE.PointsMaterial(drawTool.drawOptions));
                        pointMesh.position.copy(offset);

                        pointMesh.visible = true;
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[0]);
                        }
                        this.tempObj.add(pointMesh);
                    }
                    else {
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));
                        let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                        lineMesh.position.copy(offset);
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[0]);
                        }
                        this.tempObj.add(lineMesh);
                    }
                    //
                    return true;
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYGON:
                {
                    if(isMeasureFinished)
                    {
                        drawTool.polygonVertices = [];
                        isMeasureFinished = false;
                    }
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                    let intersects = drawTool.raycaster.intersectObject(fitLayer,true);
                    //
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if(!offset) {
                            offset = intersects[0].point.clone();
                        }
                        //
                        drawTool.polygonVertices[drawTool.polygonVertices.length] = intersects[0].point.clone();
                        //
                        intersects[0].point.x = intersects[0].point.x - offset.x;
                        intersects[0].point.y = intersects[0].point.y - offset.y;
                        intersects[0].point.z = intersects[0].point.z - offset.z;
                        //
                        tempVertices[tempVertices.length] = intersects[0].point;
                    }

                    if(tempVertices.length === 1) {
                        let pointGeom = new THREE.BufferGeometry();
                        pointGeom.addAttribute('position', new THREE.Float32BufferAttribute([tempVertices[0].x, tempVertices[0].y, tempVertices[0].z], 3));

                        let pointMesh = new THREE.Points(pointGeom, new THREE.PointsMaterial(drawTool.drawOptions));
                        pointMesh.position.copy(offset);

                        pointMesh.visible = true;
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[0]);
                        }
                        this.tempObj.add(pointMesh);
                    }
                    else if(tempVertices.length === 2)
                    {
                        let tv = [];
                        {
                            tv[tv.length] = tempVertices[0].x;
                            tv[tv.length] = tempVertices[0].y;
                            tv[tv.length] = tempVertices[0].z;

                            tv[tv.length] = tempVertices[1].x;
                            tv[tv.length] = tempVertices[1].y;
                            tv[tv.length] = tempVertices[1].z;
                        }
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                        let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                        lineMesh.position.copy(offset);
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[0]);
                        }
                        this.tempObj.add(lineMesh);
                    }
                    else if(tempVertices.length >= 3)
                    {
                        let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
                        let pgGeom = new THREE.BufferGeometry();
                        pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                        let pgMesh = new THREE.Mesh(pgGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));
                        //
                        pgMesh.position.copy(offset);
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[0]);
                        }
                        this.tempObj.add(pgMesh);
                    }
                    //
                    return true;
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYTOPE:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                    let intersects = drawTool.raycaster.intersectObject(fitLayer, true);
                    //
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if(!offset) {
                            offset = intersects[0].point.clone();
                        }
                        //
                        intersects[0].point.x = intersects[0].point.x - offset.x;
                        intersects[0].point.y = intersects[0].point.y - offset.y;
                        intersects[0].point.z = intersects[0].point.z - offset.z;
                        //
                        tempVertices[tempVertices.length] = intersects[0].point;
                    }

                    if(drawTool.step === 0) {
                        if(tempVertices.length === 1) {
                            let pointGeom = new THREE.BufferGeometry();
                            pointGeom.addAttribute('position', new THREE.Float32BufferAttribute([tempVertices[0].x, tempVertices[0].y, tempVertices[0].z], 3));

                            let pointMesh = new THREE.Points(pointGeom, new THREE.PointsMaterial(drawTool.drawOptions));
                            pointMesh.position.copy(offset);

                            pointMesh.visible = true;
                            //
                            if(this.tempObj.children.length > 0) {
                                this.tempObj.remove(this.tempObj.children[0]);
                            }
                            this.tempObj.add(pointMesh);
                        }
                        else if(tempVertices.length === 2)
                        {
                            let tv = [];
                            {
                                tv[tv.length] = tempVertices[0].x;
                                tv[tv.length] = tempVertices[0].y;
                                tv[tv.length] = tempVertices[0].z;

                                tv[tv.length] = tempVertices[1].x;
                                tv[tv.length] = tempVertices[1].y;
                                tv[tv.length] = tempVertices[1].z;
                            }
                            let lineGeom = new THREE.BufferGeometry();
                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                            lineMesh.position.copy(offset);
                            //
                            if(this.tempObj.children.length > 0) {
                                this.tempObj.remove(this.tempObj.children[0]);
                            }
                            this.tempObj.add(lineMesh);
                        }
                        else if(tempVertices.length >= 3)
                        {
                            let faces = tjh.util.PolygonUtil.polygonTriangulate([tempVertices]);
                            let pgGeom = new THREE.BufferGeometry();
                            pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                            let pgMesh = new THREE.Mesh(pgGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));

                            pgMesh.position.copy(offset);
                            //
                            if(this.tempObj.children.length > 0) {
                                this.tempObj.remove(this.tempObj.children[0]);
                            }
                            this.tempObj.add(pgMesh);
                        }
                        //
                        return true;
                    }
                    else {
                        return false;
                    }

                }break;
                default:
                   return false;
            }

        }
        this.onMouseMove = (mouseEvent) =>{
            if(drawTool.step > 10 || drawTool.isMiddleDown) {
                return false;
            }
            //
            switch (drawTool.drawMode)
            {
                case DrawTools.DRAW_MODE.DRAW_LINE:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                    let intersects = drawTool.raycaster.intersectObject( fitLayer,true);
                    //
                    let tv = [];
                    if(intersects.length === 0)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if(tempVertices.length < 3 || !offset)
                            return false;

                        tv = tempVertices.concat([intersects[0].point.x - offset.x, intersects[0].point.y - offset.y],intersects[0].point.z - offset.z);
                    }
                    //
                    let lineGeom = new THREE.BufferGeometry();
                    lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                    let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                    lineMesh.position.copy(offset);
                    //
                    if(this.tempObj.children.length > 0) {
                        this.tempObj.remove(this.tempObj.children[0]);
                    }
                    this.tempObj.add(lineMesh);
                    //
                    return true;
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYGON:
                {
                    const clientX = mouseEvent.offsetX;
                    const clientY = mouseEvent.offsetY;
                    //
                    let mouse = new THREE.Vector2();
                    mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                    mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                    //
                    drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                    let intersects = drawTool.raycaster.intersectObject(fitLayer, true);
                    //
                    let tv = [];
                    if(intersects.length === 0 || !offset)
                        return false;
                    else(intersects.length !== 0)
                    {
                        if (tempVertices.length === 1) {
                            tv[tv.length] = tempVertices[tempVertices.length - 1].x;
                            tv[tv.length] = tempVertices[tempVertices.length - 1].y;
                            tv[tv.length] = tempVertices[tempVertices.length - 1].z;

                            tv[tv.length] = intersects[0].point.x - offset.x;
                            tv[tv.length] = intersects[0].point.y - offset.y;
                            tv[tv.length] = intersects[0].point.z - offset.z;
                            //
                            let lineGeom = new THREE.BufferGeometry();
                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                            let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                            lineMesh.position.copy(offset);
                            //
                            if(this.tempObj.children.length > 0) {
                                this.tempObj.remove(this.tempObj.children[0]);
                            }
                            this.tempObj.add(lineMesh);
                        }
                        else if (tempVertices.length >= 2) {
                            intersects[0].point.x = intersects[0].point.x - offset.x;
                            intersects[0].point.y = intersects[0].point.y - offset.y;
                            intersects[0].point.z = intersects[0].point.z - offset.z;
                            tv = tempVertices.concat([intersects[0].point]);


                            let faces = tjh.util.PolygonUtil.polygonTriangulate([tv]);
                            let pgGeom = new THREE.BufferGeometry();
                            pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                            let pgMesh = new THREE.Mesh(pgGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));

                            pgMesh.position.copy(offset);
                            //
                            if(this.tempObj.children.length > 0) {
                                this.tempObj.remove(this.tempObj.children[0]);
                            }
                            this.tempObj.add(pgMesh);
                        }
                    }
                    //
                    return true;
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYTOPE:
                {
                    if(drawTool.step === 0) {
                        const clientX = mouseEvent.offsetX;
                        const clientY = mouseEvent.offsetY;
                        //
                        let mouse = new THREE.Vector2();
                        mouse.x = ( clientX / drawTool.viewer.domElement.clientWidth ) * 2 - 1;
                        mouse.y = - ( clientY / drawTool.viewer.domElement.clientHeight ) * 2 + 1;
                        //
                        drawTool.raycaster.setFromCamera( mouse, drawTool.viewer.camera);
                        let intersects = drawTool.raycaster.intersectObject(fitLayer, true);
                        //
                        let tv = [];
                        if(intersects.length === 0 || !offset)
                            return false;
                        else(intersects.length !== 0)
                        {
                            if (tempVertices.length === 1) {
                                {
                                    tv[tv.length] = tempVertices[tempVertices.length - 1].x;
                                    tv[tv.length] = tempVertices[tempVertices.length - 1].y;
                                    tv[tv.length] = tempVertices[tempVertices.length - 1].z;

                                    tv[tv.length] = intersects[0].point.x - offset.x;
                                    tv[tv.length] = intersects[0].point.y - offset.y;
                                    tv[tv.length] = intersects[0].point.z - offset.z;
                                }
                                let lineGeom = new THREE.BufferGeometry();
                                lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tv, 3));
                                let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial(drawTool.drawOptions));

                                lineMesh.position.copy(offset);
                                //
                                if(this.tempObj.children.length > 0) {
                                    this.tempObj.remove(this.tempObj.children[0]);
                                }
                                this.tempObj.add(lineMesh);
                            }
                            else if (tempVertices.length >= 2) {
                                intersects[0].point.x = intersects[0].point.x - offset.x;
                                intersects[0].point.y = intersects[0].point.y - offset.y;
                                intersects[0].point.z = intersects[0].point.z - offset.z;
                                tv = tempVertices.concat([intersects[0].point]);

                                let faces = tjh.util.PolygonUtil.polygonTriangulate([tv]);
                                let pgGeom = new THREE.BufferGeometry();
                                pgGeom.addAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
                                let pgMesh = new THREE.Mesh(pgGeom, new THREE.MeshBasicMaterial(drawTool.drawOptions));

                                pgMesh.position.copy(offset);
                                //
                                if(this.tempObj.children.length > 0) {
                                    this.tempObj.remove(this.tempObj.children[0]);
                                }
                                this.tempObj.add(pgMesh);
                            }
                        }
                        //
                        return true;
                    }
                    else {

                    }
                    //
                    return false;
                }break;
                default:
                    return false;
            }
        }

        this.onKeyDown = (mouseEvent) => {
            // s键删除最新的一个图像
            if((mouseEvent.key === 'Backspace' || mouseEvent.key === 'Delete')) {
                if(drawTool.step === 0) {

                }
                else if(drawTool.step > 10 && drawTool.drawObjects.length > 0) {
                    if(modelLayer) {
                        modelLayer.remove(drawTool.drawObjects[drawTool.drawObjects.length-1]);
                    }
                    else {
                        drawTool.tempObj.remove(drawTool.drawObjects[drawTool.drawObjects.length-1]);
                    }
                    //
                    drawTool.drawObjects.splice(drawTool.drawObjects.length-1, 1);
                }

            }
        }

        this.onRightDown= (mouseEvent) =>{

            switch (drawTool.drawMode)
            {
                case DrawTools.DRAW_MODE.DRAW_LINE:
                {
                    drawTool.step = 100;
                    return drawLine();
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYGON:
                {
                    drawTool.step = 100;
                    return drawPolygon();
                }break;
                case DrawTools.DRAW_MODE.DRAW_POLYTOPE:
                {
                    drawTool.step = 100;
                    return drawPolyhedron();
                }break;
                default:
                    return false;
            }
        }

        this.onMiddleDown = (mouseEvent)=> {
            drawTool.isMiddleDown = true;
        }

        this.onMiddleUp = (mouseEvent)=> {
            drawTool.isMiddleDown = false;
        }
        //
        this.release = function ()
        {
            if(this.tempObj.children.length > 0) {
                this.tempObj.remove(this.tempObj.children[0]);
            }
            //
            if(!modelLayer) {
                for(let i=0; i<this.drawObjects.length; ++i) {
                    this.drawObjects[i].dispose();
                }
            }
        }
    }
}
