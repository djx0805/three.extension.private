/**
 * @class
 * @classdesc 数据分页组件，用于请求、加载 PagedLod 、ProxyNode 中的数据
 * @param {boolean} [createWorker=true] -是否创建一个独立的 worker 用于请求、解析数据
 */
THREE.DataBasePager = function (createWorker = true) {
    /**
     * 缓存已加载的数据（等待被转换为 THREE.Object3D 对象）
     * @public
     * @type {Map<String, Object>}
     */
    this.loadedNodeCache = new Map();
    /**
     * 缓存已被转换的 THREE.Object3D 对象（等待被合并入场景）
     * @public
     * @type {Map<String, THREE.Object3D>}
     */
    this.parsedNodeCache = new Map();
    /**
     * 缓存需要加载纹理的对象
     * @public
     * @type {Map<String, Array>}
     */
    this.loadingTextureCache = new Map();
    /**
     * 当前正在请求的个数
     * @public
     * @type {number}
     */
    this.loadingCount = 0;
    /**
     * 请求队列最大长度
     * @public
     * @type {number}
     */
    this.maxWaitingLoaded = 2;
    /**
     * 是否允许请求新的数据
     * @public
     * @type {boolean}
     */
    this.enableRequestData = true;
    //
    this._passedRequest_ = [];
    this.maxSortRequests = 0;
    this.cullGroup = false;
    //
    if(createWorker) {
        let loader = this;
        this.nodeLoadWorker = new Worker('../src/worker/nodeParserWorker.js');
        this.nodeLoadWorker.onmessage = function (massage) {
            --loader.loadingCount;
            //
            let node = massage.data;
            if(node) {
                let tmp = loader.loadedNodeCache.get(node.requestURL);
                if(!tmp) {
                    return;
                }
                //
                if(node.children) {
                    loader.loadedNodeCache.set(node.requestURL, node);
                }
                else {
                    loader.loadedNodeCache.delete(node.requestURL);
                }
            }
        };
    }
    else {
        this.nodeLoadWorker = null;
    }
};

THREE.DataBasePager.LOAD_STRATEGY = {

};
THREE.DataBasePager.prototype = Object.assign( Object.create( THREE.EventDispatcher.prototype ), {
    constructor: THREE.DataBasePager
});

/**
 * 请求数据
 * @param {string} url -所要求数据的url
 * @returns {boolean}
 */
THREE.DataBasePager.prototype.load = function(url, frameNumber, force = false, weight = -1) {
    if(!this.enableRequestData) {
        return false;
    }
    //
    let tmp = this.loadedNodeCache.get(url);
    if(tmp) {
        return true;
    }
    //
    let loadUrl = "";
    let loadWeight = -1;
    //
    if(!force) {
        if(this.loadingCount > this.maxWaitingLoaded) {
            //console.log("too many load");
            if(this._passedRequest_.length > 0 && this._passedRequest_[0].frameNumber < frameNumber - 1) {
                this._passedRequest_.splice(0,1);
            }
            //
            for(let n=0, length = this._passedRequest_.length; n<length; ++n) {
                if(frameNumber > this._passedRequest_[n].frameNumber) {
                    continue;
                }
                else if(this._passedRequest_[n].weight < 0) {
                    continue;
                }
                else if(weight <= this._passedRequest_[n].weight) {
                    continue;
                }
                else {
                    this._passedRequest_.splice(n, 0, {url:url, frameNumber:frameNumber, weight:weight});
                    if(this._passedRequest_.length > this.maxSortRequests) {
                        this._passedRequest_.splice(this.maxSortRequests, 1);
                    }
                    return false;
                }
            }
            //
            if(this._passedRequest_.length < this.maxSortRequests) {
                this._passedRequest_[this._passedRequest_.length] = {url:url, frameNumber:frameNumber, weight:weight};
            }
            //
            return false;
        }
        //
        let numRemove = 0;
        while(numRemove < this._passedRequest_.length && this._passedRequest_[numRemove].frameNumber < frameNumber - 1) {
           ++numRemove;
        }
        this._passedRequest_.splice(0, numRemove);
        //
        if(this._passedRequest_.length > 0) {
            loadUrl = this._passedRequest_[0].url;
            this._passedRequest_.splice(0,1);
        }
        else {
            loadUrl = url;
        }
        //
        if(loadUrl !== url) {
            let inserted = false;
            for(let n=0, length = this._passedRequest_.length; n<length; ++n) {
                if(frameNumber > this._passedRequest_[n].frameNumber) {
                    continue;
                }
                else if(this._passedRequest_[n].weight < 0) {
                    continue;
                }
                else if(weight <= this._passedRequest_[n].weight) {
                    continue;
                }
                else {
                    this._passedRequest_.splice(n, 0, {url:url, frameNumber:frameNumber, weight:weight});
                    inserted = true;
                }
            }
            //
            if(!inserted) {
                this._passedRequest_[this._passedRequest_.length] = {url:url, frameNumber:frameNumber, weight:weight};
            }
        }
    }
    else {
        loadUrl = url;
    }
    //
    this.loadedNodeCache.set(loadUrl, {isPlaceholder: true});
    ++this.loadingCount;
    this.nodeLoadWorker.postMessage(loadUrl);
    return true;
};

/**
 * 将请求后的数据转换为 THREE.Object3D 对象
 * @param {Object} proxy -代表请求数据的中间数据
 * （由于 worker 和主线程不能共享内存，所以由 worker 请求的数据会被解析为一种代理类型数据转给主线程，
 * 代理类型请参考 nodeProxyType 文档)
 * @param {THREE.Object3D} [node] -递归中间参数，不用指定
 * @param {Array} [meshes] -递归中间参数，不用指定
 * @param {Object} [textures] -递归中间参数，不用指定
 * @returns {THREE.Object3D}
 */
THREE.DataBasePager.prototype.proxyParse = function (proxy, node, meshes, textures) {
    if(meshes === undefined) {
        meshes=[];
    }
    if(textures === undefined) {
        textures = {};
    }
    //if(proxy instanceof GroupProxy) {
    if(proxy.flag === 0) {
        if(node === undefined) {
            node = new THREE.Group();
            if(proxy.name) {
                node.name = proxy.name;
            }
            if(proxy.matrix) {
                let m = new THREE.Matrix4();
                m.elements = proxy.matrix;
                node.applyMatrix(m);
            }
            for(let n=0, length = proxy.children.length; n<length; ++n) {
                this.proxyParse(proxy.children[n], node, meshes, textures);
            }
        }
        else {
            let group = new THREE.Group();
            if(proxy.name) {
                group.name = proxy.name;
            }
            if(proxy.matrix) {
                let m = new THREE.Matrix4();
                m.elements = proxy.matrix;
                group.applyMatrix(m);
            }
            node.add(group);
            for(let n=0, length = proxy.children.length; n<length; ++n) {
                this.proxyParse(proxy.children[n], group, meshes, textures);
            }
        }
        //

    }
    //else if(proxy instanceof  PagedLodProxy) {
    else if(proxy.flag === 1) {
        if(node === undefined) {
            node = new THREE.PagedLod(this);
            if(proxy.name) {
                node.name = proxy.name;
            }
            for(let n=0, length = proxy.levels.length; n<length; ++n) {
                node.addLevel(proxy.levels[n].url.trim(), proxy.levels[n].min, proxy.levels[n].max);
            }
            if(proxy.boundingSphere.length === 4) {
                node.boundingSphere = new THREE.Sphere(new THREE.Vector3(proxy.boundingSphere[0],proxy.boundingSphere[1],proxy.boundingSphere[2]),proxy.boundingSphere[3]);
                node.boundingComputed = true;
                node.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
            }
            else {
                node.boundingComputed = false;
                node.centerMode = THREE.Object3D.CenterMode.USE_BOUNDING_SPHERE_CENTER;
            }
            if(proxy.rangeMode === 0) {
                node.setRangeMode(THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT);
            }
            else if(proxy.rangeMode === 1) {
                node.setRangeMode(THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN);
            }
            //
            for(let n=0, length = proxy.children.length; n<length; ++n) {
                this.proxyParse(proxy.children[n], node, meshes, textures);
            }
            //
            for(let n=0, length = node.levels.length; n<length; ++n) {
                if(node.levels[n].url.trim().length === 0) {
                    if(node.children.length <= n) {
                        node.add(new THREE.Group());
                    }
                }
                else
                    break;
            }
        }
        else {
            let pg = new THREE.PagedLod(this);
            if(proxy.name) {
                pg.name = proxy.name;
            }
            for(let n=0; n<proxy.levels.length; ++n) {
                pg.addLevel(proxy.levels[n].url.trim(), proxy.levels[n].min, proxy.levels[n].max);
            }
            if(proxy.boundingSphere.length === 4) {
                pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(proxy.boundingSphere[0],proxy.boundingSphere[1],proxy.boundingSphere[2]),proxy.boundingSphere[3]);
                pg.boundingComputed = true;
                pg.centerMode = THREE.Object3D.CenterMode.USER_DEFINED_CENTER;
            }
            else {
                pg.boundingComputed = false;
                pg.centerMode = THREE.Object3D.CenterMode.USE_BOUNDING_SPHERE_CENTER;
            }
            if(proxy.rangeMode === 0) {
                pg.setRangeMode(THREE.LOD.RangeMode.DISTANCE_FROM_EYE_POINT);
            }
            else if(proxy.rangeMode === 1) {
                pg.setRangeMode(THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN);
            }
            node.add(pg);
            //
            for(let n=0, length = proxy.children.length; n<length; ++n) {
                this.proxyParse(proxy.children[n], pg, meshes, textures);
            }
            //
            for(let n=0, length = pg.levels.length; n<length; ++n) {
                if(pg.levels[n].url.trim().length === 0) {
                    if(pg.children.length <= n) {
                        pg.add(new THREE.Group());
                    }
                }
                else
                    break;
            }
        }
    }
    //else if(proxy instanceof  MeshProxy) {
    else if(proxy.flag === 2) {
        let geometry = new THREE.BufferGeometry();
        if(proxy.geometry.vertexes)
          geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( proxy.geometry.vertexes, 3 ) );
        if(proxy.geometry.uv)
          geometry.addAttribute('uv', new THREE.Float32BufferAttribute( proxy.geometry.uv, 2 ))
        if(proxy.geometry.indexes)
          geometry.setIndex( proxy.geometry.indexes.length > 256 ? (proxy.geometry.indexes.length > 65536 ? new THREE.Uint32BufferAttribute( proxy.geometry.indexes, 1 ) : new THREE.Uint16BufferAttribute( proxy.geometry.indexes, 1 )) : new THREE.Uint8BufferAttribute( proxy.geometry.indexes, 1 ));
        if(proxy.geometry.normal) {
            geometry.addAttribute('normal', new THREE.Float32BufferAttribute(proxy.geometry.normal, 3));
        }
        if(proxy.geometry.group) {
            for(let n=0, numGroup = proxy.geometry.group.length; n<numGroup; ++n) {
                geometry.addGroup(proxy.geometry.group[n].start, proxy.geometry.group[n].count, proxy.geometry.group[n].materialIndex);
            }
        }
        //
        let meshMaterial = null;
        //
        if(proxy.material instanceof  Array) {
            let materials = [];
            for(let n=0, numMaterial = proxy.material.length; n<numMaterial; ++n) {
                materials[n] = new THREE.MeshBasicMaterial();
                if(proxy.geometry.normal) {
                    materials[n] = new THREE.MeshPhongMaterial();
                }
                //
                let material = materials[n];
                //
                if(material instanceof  THREE.MeshPhongMaterial) {
                    material.color = new THREE.Color(proxy.material[n].diffuse[0], proxy.material[n].diffuse[1], proxy.material[n].diffuse[2]);
                    material.specular = new THREE.Color(proxy.material[n].specular[0], proxy.material[n].specular[1], proxy.material[n].specular[2]);
                    material.shininess = proxy.material[n].shininess;
                    material.emissive = new THREE.Color(proxy.material[n].emission[0], proxy.material[n].emission[1], proxy.material[n].emission[2]);
                }
                //
                if(proxy.material[n].texture && proxy.material[n].texture.url) {
                    if(textures[proxy.material[n].texture.url]) {
                        material.map = textures[proxy.material[n].texture.url];
                        ++textures[proxy.material[n].texture.url].nReference;
                    }
                    else {
                        let textureLoader = null;
                        let texture = null;
                        let netUrl = encodeURIComponent(proxy.material[n].texture.url);
                        if(netUrl.substr(-4, 4) === '.dds') {
                            textureLoader = new THREE.CompressedTextureLoader();
                            texture = textureLoader.load(proxy.material[n].texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
                        }
                        else {
                            textureLoader = new THREE.TextureLoader();
                            texture = textureLoader.load(proxy.material[n].texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
                        }
                        texture.wrapS = proxy.material[n].texture.wrapS;
                        texture.wrapT = proxy.material[n].texture.wrapT;
                        texture.minFilter = proxy.material[n].texture.minFilter;
                        texture.magFilter = proxy.material[n].texture.magFilter;
                        texture.generateMipmaps = false;
                        material.map = texture;
                        //
                        ++texture.nReference;
                        textures[proxy.material[n].texture.url] = texture;
                    }
                }
                else
                    console.log("no texture");
            }
            //
            meshMaterial = materials;
        }
        else {
            let material = new THREE.MeshBasicMaterial();
            material.lights = true;
            if(proxy.geometry.normal) {
                geometry.addAttribute('normal', new THREE.Float32BufferAttribute(proxy.geometry.normal, 3));
                material = new THREE.MeshPhongMaterial();
            }
            if(proxy.material) {
                if(material instanceof  THREE.MeshPhongMaterial) {
                    material.color = new THREE.Color(proxy.material.diffuse[0], proxy.material.diffuse[1], proxy.material.diffuse[2]);
                    material.specular = new THREE.Color(proxy.material.specular[0], proxy.material.specular[1], proxy.material.specular[2]);
                    material.shininess = proxy.material.shininess;
                    material.emissive = new THREE.Color(proxy.material.emission[0], proxy.material.emission[1], proxy.material.emission[2]);
                }
                //
                if(proxy.material.texture && proxy.material.texture.url) {
                    if(textures[proxy.material.texture.url]) {
                        material.map = textures[proxy.material.texture.url];
                        ++textures[proxy.material.texture.url].nReference;
                    }
                    else {
                        let textureLoader = null;
                        let netUrl = encodeURIComponent(proxy.material.texture.url);
                        let texture = null;
                        if(netUrl.substr(-4, 4) === '.dds') {
                            textureLoader = new THREE.CompressedTextureLoader();
                            texture = textureLoader.load(proxy.material.texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
                        }
                        else {
                            textureLoader = new THREE.TextureLoader();
                            texture = textureLoader.load(proxy.material.texture.url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
                        }
                        texture.wrapS = proxy.material.texture.wrapS;
                        texture.wrapT = proxy.material.texture.wrapT;
                        texture.minFilter = proxy.material.texture.minFilter;
                        texture.magFilter = proxy.material.texture.magFilter;
                        texture.generateMipmaps = false;
                        material.map = texture;
                        //
                        ++texture.nReference;
                        textures[proxy.material.texture.url] = texture;
                    }
                }
                else
                    console.log("no texture");
            }
            //
            meshMaterial = material;
        }
        //
        let mesh = new THREE.Mesh(geometry, meshMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.drawMode = proxy.drawMode;
        //
        if(proxy.name) {
            mesh.name = proxy.name;
        }
        //
        meshes[meshes.length] = mesh;

        node.add(mesh);
    }
    // APPEND_YJZ:
    else if(proxy.flag == 3)
    {
        if(node === undefined) {
            node = new THREE.ProxyNode(this);
            if(proxy.name) {
                node.name = proxy.name;
            }
            for(let j = 0, length = proxy.fileList.length; j < length; ++j)
            {
                node.addFileName(proxy.fileList[j]);
            }
        }
        else {
            let pn = new THREE.ProxyNode(this);
            if(proxy.name) {
                pn.name = proxy.name;
            }
            for(let i = 0, length = proxy.fileList.length; i < length; ++i)
            {
                pn.addFileName(proxy.fileList[i].url);
            }
            node.add(pn);
        }
    }
    //
    if(proxy.requestURL !== undefined) {
        node.requestURL = proxy.requestURL;
        if(meshes.length > 0) {
            this.loadingTextureCache.set(node.requestURL, meshes);
        }
        return node;
    }
};

/**
 * 纹理状态
 * @readonly
 * @enum {number}
 */
THREE.DataBasePager.TEX_STATE = {
    /** @description 正在加载*/
    TEX_STATE_LOADING : 0,
    /** @description 加载完毕*/
    TEX_STATE_READY : 1,
    /** @description 加载失败*/
    TEX_STATE_FAILED : 2
}
/**
 * 检查已加载的数据是否可用于渲染(纹理是否已全部加载)
 * @param {String} strID -对象ID
 * @param {function} [onFailed] -纹理加载失败后的回掉函数
 * @returns {number} -纹理状态
 */
THREE.DataBasePager.prototype.checkCacheReady = function (strID, onFailed) {
    if(this.loadingTextureCache.has(strID)) {
        let faileds = [];
        let meshes = this.loadingTextureCache.get(strID);
        for(let n=0, length = meshes.length; n<length; ++n) {
            let material = meshes[n].material;
            //
            if(material.isMaterial) {
                if(!material.map) {

                }
                else if(!material.map.image) {
                    return {state:THREE.DataBasePager.TEX_STATE_LOADING};
                }
                else if(material.map.image.failedLoad) {
                    if(onFailed) {
                        if(!onFailed(material)) {
                            faileds.push(material);
                        }
                    }
                    else if(material instanceof  THREE.MeshBasicMaterial) {
                        material.map = undefined;
                    }
                }
                else if(material.map.image.loaded) {

                }
                else {
                    return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING};
                }
            }
            else if(material instanceof  Array) {
                for(let i=0, numMaterial = material.length; i<numMaterial; ++i) {
                    if(!material[i].map) {

                    }
                    else if(!material[i].map.image) {
                        return {state:THREE.DataBasePager.TEX_STATE_LOADING};
                    }
                    else if(material[i].map.image.failedLoad) {
                        if(onFailed) {
                            if(!onFailed(material[i])) {
                                faileds.push(material[i]);
                            }
                        }
                        else if(material[i] instanceof  THREE.MeshBasicMaterial) {
                            material[i].map = undefined;
                        }
                    }
                    else if(material[i].map.image.loaded) {

                    }
                    else {
                        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_LOADING};
                    }
                }
            }
        }
        //
        this.loadingTextureCache.set(strID, null);
        this.loadingTextureCache.delete(strID);
        //
        if(faileds.length>0) {
            return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_FAILED};
        }
        //
        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_READY};
    }
    else {
        return {state:THREE.DataBasePager.TEX_STATE.TEX_STATE_READY};
    }
};


THREE.DataBasePager.prototype.pageScaleFunc = function (contex, node) {
    return 1.0;
};
