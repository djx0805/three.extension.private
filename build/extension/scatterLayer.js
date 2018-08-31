class ScatterLayer extends  THREE.Group {
    constructor() {
        super();
        //
        let points = [];
        //
        this.setPoints = (coords) => {
            points = [];
            //
            let numPoint = coords.length/3;
            for(let i=0; i<numPoint; ++i) {
                let p = new THREE.Vector3(coords[i*3], coords[i*3 + 1], coords[i*3 + 2]);
                points[points.length] = p;
            }
        };

        let buildLOD = (pointIndexes)=> {
            let bb = new THREE.Box3();
            for(let i=0, numPoint = pointIndexes.length; i<numPoint; ++i) {
                bb.expandByPoint(points[pointIndexes[i]]);
            }
            //
            if(pointIndexes.length > 50) {
                let node = new THREE.LOD();
                node.position.copy(bb.getCenter());
                node.updateMatrixWorld(true);
                //
                node.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
                node.boundingSphereWorld = bb.getBoundingSphere();
                //
                let farChild = new THREE.Mesh(null, null);
                farChild.isGroup = true;
                farChild.info = {numPoints:pointIndexes.length};
                farChild.position.copy(bb.getCenter());
                node.addLevel(farChild, bb.getRadius()*4, 10000000);
                //
                let nearChild = new THREE.Group();
                //
                let rangeLT = {min:{x:bb.min.x, y:(bb.min.y + bb.max.y)/2}, max:{x:(bb.min.x + bb.max.x)/2, y:bb.max.y}};
                let rangeRT = {min:{x:(bb.min.x + bb.max.x)/2, y:(bb.min.y + bb.max.y)/2}, max:{x:bb.max.x, y:bb.max.y}};
                let rangeRB = {min:{x:(bb.min.x + bb.max.x)/2, y:bb.min.y}, max:{x:bb.max.x, y:(bb.min.y + bb.max.y)/2}};
                let rangeLB = {min:{x:bb.min.x, y:bb.min.y}, max:{x:(bb.min.x + bb.max.x)/2, y:(bb.min.y + bb.max.y)/2}};

                let indexesLT = [];
                let indexesRT = [];
                let indexesRB = [];
                let indexesLB = [];

                for(let i=0, numPoint = pointIndexes.length; i<numPoint; ++i) {
                    let index = pointIndexes[i];
                    //
                    let point = points[index];
                    //
                    if(point.x >= rangeLT.min.x && point.x < rangeLT.max.x && point.y > rangeLT.min.y && point.y <= rangeLT.max.y) {
                        indexesLT[indexesLT.length] = index;
                        continue;
                    }
                    //
                    if(point.x >= rangeRT.min.x && point.x <= rangeRT.max.x && point.y > rangeRT.min.y && point.y <= rangeRT.max.y) {
                        indexesRT[indexesRT.length] = index;
                        continue;
                    }
                    //
                    if(point.x > rangeRB.min.x && point.x <= rangeRB.max.x && point.y >= rangeRB.min.y && point.y <= rangeRB.max.y) {
                        indexesRB[indexesRB.length] = index;
                        continue;
                    }
                    //
                    if(point.x >= rangeLB.min.x && point.x < rangeLB.max.x && point.y >= rangeLB.min.y && point.y <= rangeLB.max.y) {
                        indexesLB[indexesLB.length] = index;
                        continue;
                    }
                }
                //
                nearChild.add(buildLOD(indexesLT));
                nearChild.add(buildLOD(indexesRT));
                nearChild.add(buildLOD(indexesRB));
                nearChild.add(buildLOD(indexesLB));
                //
                node.addLevel(nearChild, 0, bb.getRadius()*4);
                //
                return node;
            }
            else {
                let node = new THREE.Mesh(null, null);
                node.position.copy(bb.getCenter());
                node.updateMatrixWorld(true);
                //
                node.isLeaf = true;
                node.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
                node.boundingSphereWorld = bb.getBoundingSphere();
                node.indexes = pointIndexes;
                //
                return node;
            }
        };

        this.createLodScene = ()=> {
            let pointIndexes = [];
            for(let i=0, length = points.length; i<length; ++i) {
                pointIndexes[i] = i;
            }
            //
            this.scene = buildLOD(pointIndexes);
        };

        this.update = (context)=> {
            let visibleMesh = [];
            //
            this.scene.update(context, visibleMesh);
            //

        };
    }
}
