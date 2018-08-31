class PathCreateTool extends  tjh.ar.tools.ToolBase {
    constructor(viewer) {
        super(viewer);
        //
        let datumZ = 0;
        //
        this.pathVertexes = [];
        let tempVertices = [];
        let offset = null;
        //
        let terrainBB = new THREE.Box3();
        let terrainBS = new THREE.Sphere();
        for(let n=0, numTerrain = viewer.scene.terrainLayers.length; n<numTerrain; ++n) {
            let terrain = viewer.scene.terrainLayers[n];
            if(terrain.visible) {
                terrainBB.expandByBox3(terrain.getBoundingBoxWorld());
                terrainBS.expandBySphere(terrain.getBoundingSphereWorld());
            }
        }
        if(terrainBB.valid()) {
            datumZ = terrainBB.min.z + 50;
        }
        //
        let geometry = new THREE.PlaneBufferGeometry( terrainBS.radius*2, terrainBS.radius*2, 1, 1 );
        let material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
        material.transparent = true;
        material.opacity = 0.3;
        let plane = new THREE.Mesh( geometry, material );
        plane.position.set(terrainBS.center.x, terrainBS.center.y, datumZ);

        this.tempObj.add(plane);

        this.setDatumZ = function (z) {
            datumZ = z;
            plane.position.z = z;
            plane.updateMatrixWorld();
        }


        this.onKeyDown = function (keyboardEvent) {
            if(keyboardEvent.key === 'w' || keyboardEvent.key === 'ArrowUp') {
                this.setDatumZ(datumZ + 0.1);
                return true;
            }
            else if(keyboardEvent.key === 's' || keyboardEvent.key === 'ArrowDown') {
                this.setDatumZ(datumZ - 0.1);
                return true;
            }
            //
            return false;
        };

        this.onLeftDown = function (mouseEvent) {
            this.leftBtnDown = true;
            //
            if(mouseEvent.ctrlKey) {
                return false;
            }
            //
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, this.viewer.getCamera());
            //
            if(mouseEvent.shiftKey) {
                let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers.concat(this.viewer.scene.modelLayers));

                if(intersects.length <= 0) {
                    return false;
                }
                //
                this.setDatumZ(intersects[0].point.z);
                return true;
            }
            else {
                let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers.concat(this.viewer.scene.modelLayers).concat([plane]));
                if(intersects.length > 0) {
                    let intersect = intersects[0].point;
                    //
                    this.pathVertexes[this.pathVertexes.length] = intersect;
                    //
                    if(!offset) {
                        offset = intersect.clone();
                    }
                    //
                    tempVertices[tempVertices.length] = intersect.x - offset.x;
                    tempVertices[tempVertices.length] = intersect.y - offset.y;
                    tempVertices[tempVertices.length] = intersect.z - offset.z;
                    //
                    if(this.pathVertexes.length === 1) {
                        let pointGeom = new THREE.BufferGeometry();

                        pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));

                        let pointMesh = new THREE.Points(pointGeom, new THREE.PointsMaterial({color:0xffff00, size:3}));
                        pointMesh.position.copy(offset);

                        pointMesh.visible = true;
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[1]);
                        }
                        this.tempObj.add(pointMesh);
                    }
                    else {
                        let lineGeom = new THREE.BufferGeometry();
                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(tempVertices, 3));
                        let lineMesh = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color:0xffff00}));

                        lineMesh.position.copy(offset);
                        //
                        if(this.tempObj.children.length > 0) {
                            this.tempObj.remove(this.tempObj.children[1]);
                        }
                        this.tempObj.add(lineMesh);
                    }
                    return true;
                }
                //
                return false;
            }
            //
            return false;
        };
        //
        this.onLeftUp = function (mouseEvent) {
            this.leftBtnDown = false;
            //
            return false;
        }
        //
        this.onMouseMove = function (mouseEvent) {
            if(this.leftBtnDown) {
                return false;
            }
            //
            return false;
        }
    }
}
