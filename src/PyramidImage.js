class PyramidImage extends THREE.PagedLod {
    constructor(dataBasePager, url, imgID, viewMatrix, projectMatrix, depthTest = true, depthWrite = true) {
        super(dataBasePager ? dataBasePager : new THREE.DataBasePager(false));
        this.url = url;
        this.imgID = imgID;
        this.imgInfo = null;
        this.viewMatrix = viewMatrix;
        this.projectMatrix = projectMatrix;
        this.initialized = false;
        this.boundingSphere = new THREE.Sphere();

        this.rangeMode = THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;

        let createTileMesh = (loadingData)=> {
            let tileInfo = loadingData.tileInfo;
            let texture = loadingData.texture;
            //
            let tileUrl = this.imgID.toString()+"*"+tileInfo.level+"*"+tileInfo.row+"*"+tileInfo.col;
            console.log("load tile " + tileUrl);

            let vpMatrix = this.viewMatrix.clone().premultiply(this.projectMatrix);
            let invM = new THREE.Matrix4();


            invM.getInverse(vpMatrix);

            let lb = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*tileInfo.col,
                -1+2/Math.pow(2, tileInfo.level)*tileInfo.row, -0.9);
            lb.applyMatrix4(invM);
            let rb = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*(tileInfo.col+1),
                -1+2/Math.pow(2, tileInfo.level)*tileInfo.row, -0.9);
            rb.applyMatrix4(invM).sub(lb);
            let rt = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*(tileInfo.col+1),
                -1+2/Math.pow(2, tileInfo.level)*(tileInfo.row+1), -0.9);
            rt.applyMatrix4(invM).sub(lb);
            let lt = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*tileInfo.col,
                -1+2/Math.pow(2, tileInfo.level)*(tileInfo.row+1), -0.9);
            lt.applyMatrix4(invM).sub(lb);

            let geometry = new THREE.BufferGeometry();
            let vertexes = [0,0,0,rb.x,rb.y,rb.z,rt.x,rt.y,rt.z,lt.x,lt.y,lt.z];
            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertexes, 3 ) );
            let uv = [0,0,1,0,1,1,0,1];
            geometry.addAttribute('uv', new THREE.Float32BufferAttribute( uv, 2 ));

            let material = new THREE.MeshBasicMaterial();
            material.map = texture;
            material.depthTest = this.depthTest;
            material.depthWrite = this.depthWrite;
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(lb);
            mesh.drawMode = THREE.TriangleFanDrawMode;
            mesh.renderOrder = 1000;
            this.dataBasePager.loadingTextureCache.set(tileUrl, [mesh]);
            //
            let loadedData = {};
            loadedData.tileInfo = tileInfo;
            loadedData.mesh = mesh;
            this.dataBasePager.parsedNodeCache.set(tileUrl, loadedData);
        }

        this.loadChild = (imgTile)=> {
            let tileInfo = imgTile.split("*");
            //
            let url = this.url + "api/ARLayer/GetImgTile?";
            url += "imageId=" + encodeURIComponent(tileInfo[0]);
            url += "&";
            url += "level=" + tileInfo[1];
            url += "&";
            url += "row=" + tileInfo[2];
            url += "&";
            url += "col=" + tileInfo[3];
            let textureLoader = new THREE.TextureLoader();
            let texture = textureLoader.load(url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            ++texture.nReference;
            //
            let loadedData = {};
            loadedData.tileInfo = {level:parseInt(tileInfo[1]), row:parseInt(tileInfo[2]), col:parseInt(tileInfo[3])};
            loadedData.texture = texture;
            //
            createTileMesh(loadedData);
        }

        this.setLevelDataCallBack = (childIndex, loadedData)=>{
            if(childIndex === 0) {
                this.children[childIndex] = loadedData.mesh;
            }
            else {
                let tileInfo = loadedData.tileInfo;
                let mesh = loadedData.mesh;
                //
                let child = new PyramidImage(this.dataBasePager, this.url, this.imgID, this.viewMatrix, this.projectMatrix, this.depthTest, this.depthWrite);
                child.imgInfo = this.imgInfo;
                child.initialized = true;
                child.boundingSphereWorld = new THREE.Sphere();
                child.boundingSphereWorld.center.x = -1+(2*tileInfo.col+1)/Math.pow(2, tileInfo.level);
                child.boundingSphereWorld.center.y = -1+(2*tileInfo.row+1)/Math.pow(2, tileInfo.level);
                child.boundingSphereWorld.center.z = -0.9;
                child.boundingSphereWorld.radius = Math.sqrt(2)/Math.pow(2, tileInfo.level);
                let vpM = child.viewMatrix.clone().premultiply(child.projectMatrix);
                let invM = new THREE.Matrix4();
                invM.getInverse(vpM);
                child.boundingSphereWorld.applyMatrix4(invM);
                child.boundingWorldComputed = true;
                //
                child.addLevel("", 0, this.imgInfo.pyramid[tileInfo.level].tile_size);
                child.add(mesh, false);
                this.children[childIndex] = child;
                //
                if(tileInfo.level < this.imgInfo.pyramid.length - 1) {
                    let c00 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+tileInfo.row*2+"*"+tileInfo.col*2;
                    child.addLevel(c00,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
                    //
                    let c01 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+tileInfo.row*2+"*"+(tileInfo.col*2+1);
                    child.addLevel(c01,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
                    //
                    let c11 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+(tileInfo.row*2+1)+"*"+(tileInfo.col*2+1);
                    child.addLevel(c11,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
                    //
                    let c10 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+(tileInfo.row*2+1)+"*"+tileInfo.col*2;
                    child.addLevel(c10,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
                }
            }
            //
            return true;
        }
    }

    init() {
        if(this.initialized) {
            return;
        }
        //
        let url = this.url + "api/ARLayer/GetImgInfo/";
        url += encodeURIComponent(this.imgID);
        //
        let pyImg = this;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                pyImg.imgInfo = JSON.parse(xhr.response);
                pyImg.initialized = true;
                //
                let vpMatrix = pyImg.viewMatrix.clone().premultiply(pyImg.projectMatrix);
                let invM = new THREE.Matrix4();
                invM.getInverse(vpMatrix);

                //pyImg.matrix.copy(invM);
                //pyImg.matrixWorld.copy(invM);
                //pyImg.matrixAutoUpdate = false;
                //pyImg.updateMatrixWorld();

                pyImg.addLevel(pyImg.imgID+"*0*0*0", 0, pyImg.imgInfo.pyramid[0].tile_size);
                if(!pyImg.boundingSphereWorld) {
                    pyImg.boundingSphereWorld = new THREE.Sphere();
                }
                pyImg.boundingSphereWorld.center.x = 0;
                pyImg.boundingSphereWorld.center.y = 0;
                pyImg.boundingSphereWorld.center.z = -0.9;
                pyImg.boundingSphereWorld.radius = Math.sqrt(2);
                pyImg.boundingSphereWorld.applyMatrix4(invM);
                pyImg.boundingWorldComputed = true;
                //
                if(pyImg.imgInfo.pyramid.length > 1) {
                    let c00 =pyImg.imgID.toString()+"*"+1+"*"+0+"*"+0;
                    pyImg.addLevel(c00,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
                    //
                    let c01 =pyImg.imgID.toString()+"*"+1+"*"+0+"*"+1;
                    pyImg.addLevel(c01,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
                    //
                    let c11 =pyImg.imgID.toString()+"*"+1+"*"+1+"*"+1;
                    pyImg.addLevel(c11,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
                    //
                    let c10 =pyImg.imgID.toString()+"*"+1+"*"+1+"*"+0;
                    pyImg.addLevel(c10,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
                }
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    }
}

export {PyramidImage};
