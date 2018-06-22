import {FitTerrainMaterial} from "./material/FitTerrainMaterial";
import {MemDepthSampler} from "./memDepthSampler";

/**
 * @classdesc 矢量图层
 * @class
 * @memberOf tjh.ar
 * @extends THREE.Group
 * @param {string} url -矢量数据url
 * @param {string} modelUrl -模型URL
 * @param {bool}  isReplaceWithModel -是否使用模型符号化点矢量
 * @param {tjh.ar.TerrainLayer}  referenceTerrain -地形图层
 * @param {array} globalOffset -地形全局偏移值
 */

class FeatureLayer extends  THREE.Group{
    constructor(url,mlUrl, isReplaceWithModel,referenceTerrain=[], globalOffset = [0,0,0]) {
        super();

        let featureLayer = this;

        /**
         * 是否自动更新图层矩阵 matrixAutoUpdate
         * @type {bool}
         */
	    this.matrixAutoUpdate = false;
        /**
         * 适量贴合模式
         * @enum {number}
         */
        FeatureLayer.FIT_PATTERN = {
            /** @description 贴合地形周围低值*/
            FIT_TERRIAN_LOW: 0,
            /** @description 贴合地形周围低值*/
            FIT_TERRIAN_NORMAL: 1,
            /** @description 贴合地形周围低值*/
            FIT_TERRIAN_HIGH: 2,
            /** @description 贴合地形周围低值*/
            USE_SOURCED_DATA: 3,
            /** @description 贴合地形周围低值*/
            ASSIGN_MANUAL: 4,
            /** @description 贴合地形周围低值*/
            ASSIGN_PROP: 5,
        }

        /**
         * 是否使用模型对点矢量符号化 isReplaceWithModel
         * @type {bool}
         */
        this.isReplaceWithModel = isReplaceWithModel;

        /**
         * 是否对矢量添加标注 labelAvaliable
         * @type {bool}
         */
        this.labelAvaliable = false;

        /**
         * 所要显示矢量的 url
         * @type {string}
         */
        this.url = url;

        /**
         * 矢量所关联的地形的 referenceTerrain
         * @type {tjh.ar.TerrainLayer}
         */
        this.referenceTerrain = referenceTerrain;
        let minZ = 0;

        /**
         * 可视范围包围盒 boundBox
         * @type {THREE.Box2}
         */
        this.boundBox = new THREE.Box2();

        /**
         * 矢量数据服务是否是 WFS
         * @type {bool}
         */
        this.isWFS = false;

        /**
         * 矢量数据服务的 version
         * @type {string}
         */
        this.version = "1.0.0";

        /**
         * 矢量数据的类型名 typeName
         * @type {string}
         */
        this.typeName = "";

        /**
         * FeatureLayer是否已初始化 initialized
         * @type {bool}
         */
        this.initialized = false;

        /**
         * 矢量类型 featureType
         * @type {string}
         */
        this.featureType = "";

        this.memDepthSampler = new MemDepthSampler();


        // 解析url 参数信息
        let _url_param_ = url.split("&");
        if (_url_param_[0].substr(-3, 3).toLocaleLowerCase() === "wfs") {
            this.isWFS = true;
        }
        for (let i = 0; i < _url_param_.length; ++i) {
            let _param_ = _url_param_[i].split("=");
            if (_param_.length !== 2)
                continue;
            //
            if (_param_[0].toLocaleLowerCase() === "typename") {
                this.typeName = _param_[1];
            }

            if (_param_[0].toLocaleLowerCase() === "version") {
                this.version = _param_[1];
            }
        }
        //
        if (this.isWFS && this.version === "1.0.0") {
            let url_get_capabilities = _url_param_[0] + "&" + _url_param_[1] + "&request=GetCapabilities";
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url_get_capabilities);

            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    let xmlDoc = xhr.responseXML;
                    let root = xmlDoc.documentElement;
                    let ftTypes = root.getElementsByTagName("FeatureType");
                    for (let i = 0; i < ftTypes.length; ++i) {
                        let nameEle = ftTypes[i].getElementsByTagName("Name")[0];
                        if (nameEle.textContent === featureLayer.typeName) {
                            let boundEle = ftTypes[i].getElementsByTagName("LatLongBoundingBox")[0];
                            featureLayer.boundBox.min.x = parseFloat(boundEle.attributes.minx.value) - globalOffset[0];
                            featureLayer.boundBox.min.y = parseFloat(boundEle.attributes.miny.value) - globalOffset[1];
                            featureLayer.boundBox.max.x = parseFloat(boundEle.attributes.maxx.value) - globalOffset[0];
                            featureLayer.boundBox.max.y = parseFloat(boundEle.attributes.maxy.value) - globalOffset[1];

                            featureLayer.getGrid();
                            //
                            featureLayer.initialized = true;
                            break;
                        }
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

            // 同步请求矢量类型
            let url_get_featureType = _url_param_[0] + "&" + _url_param_[1] + "&" + _url_param_[2] + "&request=DescribeFeatureType" + "&outputFormat=application%2Fjson";
            var xhr2 = new XMLHttpRequest();
            xhr2.open('GET', url_get_featureType, false);

            xhr2.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    let strJson = JSON.parse(xhr2.response);
                    let geom = strJson["featureTypes"][0]
                    featureLayer.featureType = geom["properties"][0]["type"];
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr2.statusText
                    });
                }
            };
            xhr2.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr2.send();
        }

        /**
         * 场景相机 camera
         * @type {null}
         */
        this.camera = null;

        /**
         * 矢量实时版本 featureVersion
         * @type {number}
         */
        this.featureVersion = 0;

        let fitTerrainMaterialGen = new FitTerrainMaterial();

        /**
         * 矢量数据 features
         * @type {Map}
         */
        this.features = new Map();

        function MeshObjInfo() {
            this.meshObj = [];
            this.meshProp = null;
            // 控制可见帧数
            this.lastVisitedFrameNumber = 0;
        }

        let featureParseParas = {
            minBox: new THREE.Box2(),
            matrixWorld: new THREE.Matrix4(),
            cameraPos: new THREE.Vector3()
        }

        /**
         * 标注控制 labelControler
         * @enum
         */
        this.labelControler = {
            /**
             * 标注可用性设置 setAvaliability
             * @type {function}
             */
            setAvaliability : function(valid){
                featureLayer.avaliable = valid;
                featureLayer.isReplaceWithModel = !valid;
            },
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
            fontSize : 5,
            /**
             * 标注字距 fontDivisions
             * @type {number}
             */
            fontDivisions : 2,
        }


        /**
         * @class 特定矢量显示具体细节控制 -- 矢量调节器
         * @memberOf {tjh.ar.FeatureLayer}
         */
        function Regulator() {
            //
            /**
             * 每次矢量转换数量
             * @type {number}
             */
            this.requestNum = 25;
            //
            /**
             * 是否加载矢量
             */
            this.isLoadFeature = true;
            //
            /**
             * 颜色
             * @type {THREE.Color}
             */
            this.color = new THREE.Color(0x00ff00);
            //
            /**
             * 透明度
             * @type {number}
             */
            this.opacity = 1.0;
            //
            /**
             * 线宽
             * @type {number}
             */
            this.size = 1;

            /**
             * 贴合方式
             * @type {FeatureLayer.FIT_PATTERN}
             */
            this.fitPattern = FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH;

            //
            /**
             * 矢量高值 加载模式 --人工贴合方式ASSIGN_MANUAL
             * @type {number}
             */
            this.highValue = 0.0;

            /**
             * 矢量中存储高值的属性 加载模式 --人工贴合方式ASSIGN_PROP
             * @type {number}
             */
            this.highProp = "";
            //
            /**
             * @description 设置高值
             * @param {number} para 高值
             */
            this.setHighValue = (para) => {
                if ((typeof para) === "string") {
                    if (para[0] === '[' && para[para.length - 1] === ']') {
                        let tempProp = para.substr(1, para.length - 2);
                        if (tempProp !== NaN) {
                            this.fitPattern = FeatureLayer.FIT_PATTERN.ASSIGN_PROP;
                            this.highProp = tempProp;
                        }
                    }
                } else if ((typeof para) === "number") {
                    this.fitPattern = FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL;
                    this.highValue = para;
                }
            }

            if (featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon") {

            }
            else if (featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString") {
                //
                /**
                 * 矢量线加密
                 */
                this.denseRate = 1;
                //
                /**
                 * 矢量线虚实
                 */
                this.lineDotted = false;
                this.lineDashSize = 3;
                this.lineGapSize = 1;
                this.lineScale = 1;
            }
            else if (featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point") {
                this.model = null;
                this.modelUrl = mlUrl;
                this.setReplaceWithModel= (isReplace)=>
                {
                    featureLayer.isReplaceWithModel = isReplace;
                    featureLayer.avaliable = !isReplace;
                }

                /**
                 * 点的符号化
                 * @memberOf FeatureLayer
                 * @param {String} url 模型文件url
                 * @param {Array} pos [x,y,z]
                 */
                this.setModelUrl = (url)=>{
                    if(featureLayer.isReplaceWithModel)
                    {
                        var objLoader = new THREE.OBJLoader2();
                        let materialPath = url.substr(0, url.lastIndexOf('.'))+".mtl";

                        var callbackOnLoad = ( event )=> {
                            event.detail.loaderRootNode.isPlantModel = true;
                            this.model = event.detail.loaderRootNode;
                            this.model.scale.set(0.1,0.1,0.1);
                        };

                        var onLoadMtl = ( materials )=> {
                            objLoader.setMaterials( materials );
                            objLoader.load( url, callbackOnLoad, null, null, null, false );
                        };
                        objLoader.loadMtl( materialPath, null, onLoadMtl );
                    }
                }
                this.setModelUrl(this.modelUrl);
            }

        }

        /**
         * 矢量参数调节
         * @type {tjh.ar.FeatureLayer.Regulator}
         */
        this.regulator = new Regulator();

        /**
         * @description 初始化矢量的材质，同时每次改变矢量调节器的参数，也应该调用该函数
         */
        this.initMaterial = function () {
            if(this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_LOW
                || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_NORMAL){
                if(featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point")
                {
                    this.pointMaterial = fitTerrainMaterialGen.getPointsMaterial(this.regulator.fitPattern);
                    this.pointMaterial.uniforms["diffuse"].value =  this.regulator.color;
                    this.pointMaterial.uniforms["opacity"].value = this.regulator.opacity;
                    this.pointMaterial.uniforms["size"].value = this.regulator.size;
                    this.pointMaterial.transparent = true;
                }

                if(featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString")
                {
                    this.lineMaterial = fitTerrainMaterialGen.getLineMaterial(this.regulator.fitPattern);
                    this.lineMaterial.uniforms["diffuse"].value =  this.regulator.color;
                    this.lineMaterial.uniforms["opacity"].value = this.regulator.opacity;
                    this.lineMaterial.uniforms["size"].value = this.regulator.size;
                    this.lineMaterial.transparent = true;
                }


                if(featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon")
                {
                    this.polygonMaterial = fitTerrainMaterialGen.getMeshMaterial(this.regulator.fitPattern);
                    this.polygonMaterial.uniforms["diffuse"].value =  this.regulator.color;
                    this.polygonMaterial.uniforms["opacity"].value = this.regulator.opacity;
                    this.polygonMaterial.uniforms["size"].value = this.regulator.size;
                    this.polygonMaterial.transparent = true;
                }
            }
            else if(this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.USE_SOURCED_DATA||this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
            {
                if(featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point")
                {
                    this.pointMaterial = new THREE.PointsMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity});
                }
                if(featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString")
                {
                    this.lineMaterial = featureLayer.regulator.lineDotted?
                        new THREE.LineDashedMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity,
                            dashSize: this.regulator.lineDashSize, gapSize: this.regulator.lineGapSize, scale: this.regulator.lineScale})
                        : new THREE.LineBasicMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity});
                }
                if(featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon") {
                    this.polygonMaterial = new THREE.MeshBasicMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity});
                }
            }
            //
            if(this.pointMaterial) {
                this.pointMaterial.unDisposable = true;
            }
            if(this.lineMaterial) {
                this.lineMaterial.unDisposable = true;
            }
            if(this.polygonMaterial) {
                this.polygonMaterial.unDisposable = true;
            }
            //
            this.labelMaterial = fitTerrainMaterialGen.getLabelMaterial();
            this.labelMat = new THREE.MeshBasicMaterial({
                color: featureLayer.labelControler.color,
                transparent: true,
                opacity: featureLayer.labelControler.opacity,
                side: THREE.DoubleSide,
            });
            this.labelMat.unDisposable = true ;
            {
                this.labelMaterial.uniforms["diffuse"].value =  new THREE.Color(1.0,0.0,0.0);
                this.labelMaterial.uniforms["opacity"].value = this.regulator.opacity;
                this.labelMaterial.uniforms["size"].value = 4;
                this.labelMaterial.transparent = true;
            }

            // 清空所有的feature
            for(let [fkey, fvalue] of featureLayer.features)
            {
                for(let fv = 0, fvlen = fvalue.meshObj.length; fv < fvlen; ++fv)
                {
                    fvalue.meshObj[fv].dispose();
                    featureLayer.remove(fvalue.meshObj[fv]);
                    fvalue.meshObj = [];
                }
                featureLayer.features.delete(fkey);
            }
        }
        this.initMaterial();

        //
        let cameraPos = new THREE.Vector3();

        /**
         * 下载的根据可视范围裁剪后的矢量数据
         * @type {array}
         */
        this.downlaodFeatures = [];


        THREE.FontManager.getFont("msyh");

        /**
         * 创建矢量标注
         */
        let createLabel = (text, position)=>{
            let labelPos = new THREE.Vector3(position[0],position[1],position[2]);
            if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
                let z = featureLayer.memDepthSampler.getZ(labelPos.x, labelPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
                if(z !== featureLayer.memDepthSampler.noValue) {
                    labelPos.z = z;
                }
            }
            else if(featureLayer.regulator.fitPattern === 4 || featureLayer.regulator.fitPattern === 5)
            {
                labelPos.z = featureLayer.regulator.highValue;
            }
            else if(featureLayer.regulator.fitPattern === 3)
            {
                labelPos.z = position[2];
            }
            // 标注
            let tmpFont = THREE.FontManager.getFont("msyh");
            if(tmpFont !== null) {
                let textShape = new THREE.BufferGeometry();
                let shapes = tmpFont.generateShapes(text, featureLayer.labelControler.fontSize, featureLayer.labelControler.fontDivisions);
                let geom = new THREE.ShapeGeometry(shapes);
                geom.computeBoundingBox();
                let xMid = -0.5 * (geom.boundingBox.max.x - geom.boundingBox.min.x);

                geom.translate(xMid, 0, 0);
                textShape.fromGeometry(geom);
                //
                geom.dispose();
                geom = null;
                //
                let textMat = featureLayer.labelMat;

                let textMesh = new THREE.Mesh(textShape, textMat);

                textMesh.position.copy(labelPos);

                textMesh.frustumCulled = false;
                textMesh.visible = true;
                //featureLayer.add(textMesh);
                textMesh.updateMatrixWorld(true);
                textMesh.isLabel = true;

                return textMesh;

            }
            else
                return null;
        }
        /**
         * 创建点的替代模型
         */
        let createModel = (position)=>{
            let modelPos = new THREE.Vector3(position[0],position[1],position[2]);
            if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
                let z = featureLayer.memDepthSampler.getZ(modelPos.x, modelPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
                if(z !== featureLayer.memDepthSampler.noValue) {
                    modelPos.z = z;
                }
            }
            else if(featureLayer.regulator.fitPattern === 4 || featureLayer.regulator.fitPattern === 5)
            {
                modelPos.z = featureLayer.regulator.highValue;
            }
            else if(featureLayer.regulator.fitPattern === 3)
            {
                modelPos.z = position[2];
            }
            // 模型
            let modelClone = featureLayer.regulator.model.clone();
            modelClone.position.copy(modelPos);
            modelClone.isModel = true;
            return modelClone;
        }

        /**
         * 转化downlaodFeatures中的数据为矢量
         */
        let parseMethod = function meshParse() {
            for(let n=0, length = featureLayer.downlaodFeatures.length; n<length; ++n) {
                let dkey = featureLayer.downlaodFeatures[n].featureType;
                let dvalue = featureLayer.downlaodFeatures[n].data;
                //
                if ((dkey === "Point" || dkey === "MultiPoint") && dvalue.version === featureLayer.featureVersion) {
                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
                        let jsonFt = dvalue.features[i].ft;
                        let featureProp = jsonFt["properties"];
                        featureProp.id = jsonFt["id"];
                        if (featureLayer.features.has(featureProp.id)) {
                            continue;
                        }
                        //
                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
                        //
                        let geom = jsonFt["geometry"];
                        //
                        let pointObjInfo = new MeshObjInfo();

                        let pointGeom = new THREE.BufferGeometry();

                        let coord = geom["coordinates"];

                        pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(coord[0], 3));

                        //
                        let pointMesh = new THREE.Points(pointGeom, featureLayer.pointMaterial);

                        if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
                        {
                            pointMesh.position.z = featureLayer.regulator.highValue;
                        }
                        else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
                        {
                            pointMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
                        }
                        // 矢量符号
                        if(featureLayer.isReplaceWithModel)
                        {
                            let tmp = (new THREE.Vector3(coord[0][0], coord[0][1], coord[0][2])).applyMatrix4(pointMesh.matrixWorld);
                            let midPoint = [tmp.x,tmp.y,tmp.z];
                            let tempModel = createModel(midPoint);
                            if(tempModel) {
                                let tmp = new THREE.Group();
                                tmp.add(tempModel);
                                pointMesh = tmp;
                            }
                        }
                        // 矢量备注
                        else if(featureLayer.labelAvaliable)
                        {
                            let tmp = (new THREE.Vector3(coord[0][0], coord[0][1], coord[0][2])).applyMatrix4(pointMesh.matrixWorld);
                            let midPoint = [tmp.x,tmp.y,tmp.z];
                            let tempLabel = createLabel(featureProp.id, midPoint);
                            if(tempLabel) {
                                let tmp = new THREE.Group();
                                tmp.add(pointMesh);
                                tmp.add(tempLabel);
                                pointMesh = tmp;
                            }
                        }
                        //
                        pointMesh.frustumCulled = false;
                        pointMesh.visible = true;
                        pointMesh.isFeature = true;
                        featureLayer.add(pointMesh);
                        pointMesh.updateMatrixWorld();

                        pointObjInfo.meshProp = featureProp;
                        pointObjInfo.bb2d = bb2d;
                        pointObjInfo.meshObj[pointObjInfo.meshObj.length] = pointMesh;

                        featureLayer.features.set(featureProp.id, pointObjInfo);
                    }
                }
                else if (dkey === "MultiLineString" && dvalue.version === featureLayer.featureVersion) {
                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
                        let jsonFt = dvalue.features[i].ft;
                        let featureProp = jsonFt["properties"];
                        featureProp.id = jsonFt["id"];
                        if (featureLayer.features.has(featureProp.id)) {
                            continue;
                        }
                        //
                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
                        //
                        let geom = jsonFt["geometry"]

                        let lineGeom = new THREE.BufferGeometry();
                        let multiLineObj = new MeshObjInfo();

                        let coords = geom["coordinates"]

                        for (let j = 0, cslength = coords.length; j < cslength; ++j) {
                            let coord = coords[j];

                            lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(coord, 3));

                            let lineMesh = new THREE.Line(lineGeom, featureLayer.lineMaterial);

                            if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
                            {
                                lineMesh.position.z = featureLayer.regulator.highValue;
                            }
                            else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
                            {
                                lineMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
                            }

                            if(featureLayer.regulator.lineDotted)
                                lineMesh.computeLineDistances();


                            if(featureLayer.labelAvaliable)
                            {
                                let tmp = (new THREE.Vector3(coord[0], coord[1], coord[2])).applyMatrix4(lineMesh.matrixWorld);
                                let midPoint = [tmp.x,tmp.y,tmp.z];
                                let tempLabel = createLabel(featureProp.id, midPoint);
                                if(tempLabel) {
                                    let tmp = new THREE.Group();
                                    tmp.add(lineMesh);
                                    tmp.add(tempLabel);
                                    lineMesh = tmp;
                                }
                            }
                            //
                            lineMesh.polygonOffset = true;
                            lineMesh.polygonOffsetFactor = -2.0;
                            lineMesh.polygonOffsetUnits = -10.0;

                            //
                            lineMesh.frustumCulled = false;
                            lineMesh.visible = true;

                            multiLineObj.meshObj[multiLineObj.meshObj.length] = lineMesh;
                            lineMesh.isFeature = true;
                            featureLayer.add(lineMesh);
                            lineMesh.updateMatrixWorld();
                        }

                        multiLineObj.meshProp = featureProp;
                        multiLineObj.bb2d = bb2d;
                        if (multiLineObj.meshObj.length > 0)
                            featureLayer.features.set(featureProp.id, multiLineObj);
                    }
                }
                else if (dkey === "MultiPolygon" && dvalue.version === featureLayer.featureVersion) {
                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
                        let jsonFt = dvalue.features[i].ft;
                        let featureProp = jsonFt["properties"];
                        featureProp.id = jsonFt["id"];
                        // 检查缓存中是否存在
                        if (featureLayer.features.has(featureProp.id)) {
                            continue;
                        }
                        //
                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
                        //
                        let geom = jsonFt["geometry"]
                        let multiPolyObj = new MeshObjInfo();
                        let multiPolygonCoords = geom["coordinates"];

                        // ringCount
                        let multiPolygonCount = multiPolygonCoords.length;
                        for (let k = 0; k < multiPolygonCount; ++k) {
                            let polygonCoords = multiPolygonCoords[k];

                            let ringCount = polygonCoords.length
                            if(ringCount <= 0)
                                return;
                            // 获取外轮廓
                            let outlineCoors = polygonCoords[0];

                            let polygonShape = new THREE.Shape(outlineCoors);

                            // 获取内轮廓
                            for (let j = 1; j < ringCount; ++j) {
                                let holeShape = new THREE.Shape(polygonCoords[j]);
                                polygonShape.holes.push(holeShape);
                            }

                            let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);

                            holeGeom.computeBoundingSphere();
                            //
                            let holeMesh = new THREE.Mesh(holeGeom, featureLayer.polygonMaterial);
                            if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
                            {
                                holeMesh.position.z = featureLayer.regulator.highValue;
                            }
                            else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
                            {
                                holeMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
                            }

                            //
                            if(featureLayer.labelAvaliable)
                            {
                                let tmp = (new THREE.Vector3(outlineCoors[0].x, outlineCoors[0].y, outlineCoors[0].z)).applyMatrix4(holeMesh.matrixWorld);
                                let midPoint = [tmp.x,tmp.y,tmp.z];

                                let tempLabel = createLabel(featureProp.id,midPoint, holeMesh.matrix);

                                if(tempLabel) {
                                    let tmp = new THREE.Group();
                                    tmp.add(holeMesh);
                                    tmp.add(tempLabel);
                                    holeMesh = tmp;
                                }
                            }
                            //
                            holeMesh.polygonOffset = true;
                            holeMesh.polygonOffsetFactor = -2.0;
                            holeMesh.polygonOffsetUnits = -10.0;

                            //
                            holeMesh.frustumCulled = false;
                            holeMesh.visible = true;

                            //
                            multiPolyObj.meshObj[multiPolyObj.meshObj.length] = holeMesh;
                            holeMesh.isFeature = true;
                            featureLayer.add(holeMesh);
                            holeMesh.updateMatrixWorld();
                        }
                        multiPolyObj.meshProp = featureProp
                        multiPolyObj.lastVisitedFrameNumber = 0;
                        multiPolyObj.bb2d = bb2d;
                        if(multiPolyObj.meshObj.length > 0)
                            featureLayer.features.set(featureProp.id, multiPolyObj);
                    }
                }
                else if (dkey === "LineString" && dvalue.version === featureLayer.featureVersion) {
                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
                        let jsonFt = dvalue.features[i].ft;
                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
                        //
                        let geom = jsonFt["geometry"]

                        let lineGeom = new THREE.BufferGeometry();
                        let LineObj = new MeshObjInfo();

                        let featureProp = jsonFt["properties"];
                        featureProp.id = jsonFt["id"];

                        let coord = geom["coordinates"]

                        // 删除
                        if (featureLayer.features.has(featureProp.id)) {
                            continue;
                        }

                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(coord, 3));
                        //
                        let lineMesh = new THREE.Line(lineGeom, featureLayer.lineMaterial);

                        lineMesh.polygonOffset = true;
                        lineMesh.polygonOffsetFactor = -2.0;
                        lineMesh.polygonOffsetUnits = -10.0;

                        //
                        lineMesh.frustumCulled = false;
                        lineMesh.visible = true;

                        if(featureLayer.labelAvaliable)
                        {
                            let midIndex = parseInt((coord.length/3)/2);

                            let midPoint = [coord[midIndex*3],coord[midIndex*3+1],coord[midIndex*3+2]];

                            let tempLabel = createLabel(featureProp.id, midPoint);
                            if(tempLabel)
                                lineMesh.add(tempLabel);
                        }

                        LineObj.meshObj[LineObj.meshObj.length] = lineMesh;
                        lineMesh.isFeature = true;
                        featureLayer.add(lineMesh);
                        lineMesh.updateMatrixWorld();

                        LineObj.meshProp = featureProp;
                        LineObj.bb2d = bb2d;
                        if (LineObj.meshObj.length > 0)
                            featureLayer.features.set(featureProp.id, LineObj);
                    }
                }
                else if (dkey === "Polygon" && dvalue.version === featureLayer.featureVersion) {
                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
                        let jsonFt = dvalue.features[i].ft;
                        let featureProp = jsonFt["properties"];
                        featureProp.id = jsonFt["id"];
                        // 检查缓存中是否存在
                        if (featureLayer.features.has(featureProp.id)) {
                            continue;
                        }
                        //
                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
                        //
                        let geom = jsonFt["geometry"]

                        let PolyObj = new MeshObjInfo();

                        let polygonCoords = geom["coordinates"];

                        let ringCount = polygonCoords.length
                        if (ringCount <= 0)
                            return;
                        // 获取外轮廓
                        let outlineCoors = polygonCoords[0];

                        let polygonShape = new THREE.Shape(outlineCoors);

                        // 获取内轮廓
                        for (let j = 1; j < ringCount; ++j) {
                            let holeShape = new THREE.Shape(polygonCoords[j]);
                            polygonShape.holes.push(holeShape);
                        }

                        let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);
                        holeGeom.computeBoundingSphere();
                        //
                        let holeMesh = new THREE.Mesh(holeGeom, featureLayer.polygonMaterial);
                        holeMesh.polygonOffset = true;
                        holeMesh.polygonOffsetFactor = -2.0;
                        holeMesh.polygonOffsetUnits = -10.0;

                        //
                        holeMesh.frustumCulled = false;
                        holeMesh.visible = true;

                        if(featureLayer.labelAvaliable)
                        {
                            let midIndex = parseInt(outlineCoors.length/2);

                            let midPoint = [outlineCoors[midIndex].x,outlineCoors[midIndex].y,outlineCoors[midIndex].z];

                            let tempLabel = createLabel(featureProp.id, midPoint);
                            if(tempLabel)
                                holeMesh.add(tempLabel);
                        }
                        //
                        PolyObj.meshObj[PolyObj.meshObj.length] = meshPair;
                        holeMesh.isFeature = true;
                        featureLayer.add(holeMesh);
                        holeMesh.updateMatrixWorld();
                        PolyObj.meshProp = featureProp
                        PolyObj.lastVisitedFrameNumber = 0;
                        PolyObj.bb2d = bb2d;
                        if (PolyObj.meshObj.length > 0)
                            featureLayer.features.set(featureProp.id, PolyObj);
                    }
                }
            }
            //
            featureLayer.downlaodFeatures = [];
        }

        let grid = [];

        /**
         * @description 计算可视范围的包围盒
         */
        this.getGrid = ()=> {
            if(grid.length > 0)
                return grid;
            //
            let makeGrid = (minx, miny, maxx, maxy)=> {
                let params = [];
                if(maxx - minx > 200 && maxy - miny > 200) {
                    let hwidth = (maxx - minx)/2;
                    let hheight = (maxy - miny)/2;
                    params[params.length]= {minx:minx, miny:miny, maxx:minx+hwidth, maxy:miny+hheight};
                    params[params.length]= {minx:minx+hwidth, miny:miny, maxx:maxx, maxy:miny+hheight};
                    params[params.length]= {minx:minx+hwidth, miny:miny+hheight, maxx:maxx, maxy:maxy};
                    params[params.length]= {minx:minx, miny:miny+hheight, maxx:minx+hwidth, maxy:maxy};
                }
                else if(maxx - minx > 200) {
                    let hwidth = (maxx - minx)/2;
                    params[params.length]={minx:minx, miny:miny, maxx:minx+hwidth, maxy:maxy};
                    params[params.length]={minx:minx+hwidth, miny:miny, maxx:maxx, maxy:maxy};
                }
                else if(maxy - miny > 200) {
                    let hheight = (maxy - miny)/2;
                    params[params.length]={minx:minx, miny:miny, maxx:maxx, maxy:miny+hheight};
                    params[params.length]={minx:minx, miny:miny+hheight, maxx:maxx, maxy:maxy};
                }
                else {
                    let geom = new THREE.PlaneBufferGeometry(maxx - minx, maxy - miny, 1, 1);
                    let mesh = new THREE.Mesh(geom);
                    mesh.position.x = (minx + maxx)/2;
                    mesh.position.y = (miny + maxy)/2;
                    mesh.position.z = minZ;
                    mesh.updateMatrixWorld();
                    mesh.boundingBox = mesh.getBoundingBoxWorld();
                    mesh.getBoundingBox = ()=> {
                        return mesh.boundingBox;
                    }
                    grid[grid.length] = mesh;
                }
                //
                for(let i=0, paramsLen = params.length; i< paramsLen; ++i) {
                    makeGrid(params[i].minx, params[i].miny, params[i].maxx, params[i].maxy);
                }
            }
            //
            makeGrid(this.boundBox.min.x, this.boundBox.min.y, this.boundBox.max.x, this.boundBox.max.y);
        }

        let cacheRequestData = (message)=> {
            if(message.data.data !== null ) {
                if(message.data.data.version === featureLayer.featureVersion) {
                    featureLayer.downlaodFeatures[featureLayer.downlaodFeatures.length] = message.data;
                }
            }
        }

        let ftRequestWorker = null;
        //
        let lastVisibleRange = [];

        /**
         * @description 移除featureLayer中的过时数据
         */
        this.removeUnExpected = function () {
            // mesh筛选--lastvisibleFrameNumber, removeUne
            for(let [fkey, fvalue] of featureLayer.features)
            {
                if(fvalue.lastVisitedFrameNumber > 10)
                {
                    for(let fv = 0, fvlen = fvalue.meshObj.length; fv < fvlen; ++fv)
                    {
                            fvalue.meshObj[fv].dispose();
                            featureLayer.remove(fvalue.meshObj[fv]);

                    }
                    fvalue.meshObj = [];
                    featureLayer.features.delete(fkey);
                }
            }
        }

        /**
         * @description 更新
         * @param context 更新上下文（包括camera和frustum）
         */
        this.update = (context)=> {
            if(!this.initialized || !this.visible)
                return;
            //
            let camera = context.camera;
            featureLayer.camera = context.camera;
            let frustum = context.frustum;
            //
            cameraPos = camera.matrixWorldInverse.getLookAt().eye;

            let lookAt = camera.matrixWorldInverse.getLookAt();

            //
            let minZ_ = referenceTerrain.length === 0 ? 0 : 999999;
            for(let i=0; i<referenceTerrain.length; ++i) {
                let bs = referenceTerrain[i].getBoundingSphereWorld();
                if(bs.center.z < minZ_)
                    minZ_ = bs.center.z;
            }
            if(minZ !== minZ_) {
                minZ = minZ_;
                //
                for(let i=0, glength = grid.length; i<glength; ++i) {
                    grid[i].position.z = minZ;
                    grid[i].updateMatrixWorld();
                }
            }
            // 获取与视椎体相交的网格，并存储到visibleGrid中
            let visibleGrid = [];
            for(let i=0, glength = grid.length; i<glength; ++i) {
                if(frustum.intersectsObject(grid[i])) {
                    visibleGrid[visibleGrid.length] = grid[i];
                }
            }
            // 获取最大的包围盒
            let bx = new THREE.Box3();
            for(let i=0, vbLen = visibleGrid.length; i<vbLen; ++i) {
                bx.expandByBox3(visibleGrid[i].getBoundingBox());
            }

            // 只有在可视范围变化时更新
            let newVisibleRange = false;
            if(lastVisibleRange.length === 0) {
                lastVisibleRange[0] = bx.min.x;
                lastVisibleRange[1] = bx.min.y;
                lastVisibleRange[2] = bx.max.x;
                lastVisibleRange[3] = bx.max.y;
                //
                newVisibleRange = true;
            }
            else if(Math.abs(lastVisibleRange[0] - bx.min.x) > 0.001 || Math.abs(lastVisibleRange[1] - bx.min.y) > 0.001 ||
                Math.abs(lastVisibleRange[2] - bx.max.x) > 0.001 || Math.abs(lastVisibleRange[3] - bx.max.y) > 0.001) {
                newVisibleRange = true;
            }
            //
            let flMatrixWorldInv = new THREE.Matrix4();
            flMatrixWorldInv.getInverse(featureLayer.matrixWorld.clone());
            //
            this.features.forEach((value, key, ownerMap)=> {
                if(value.bb2d) {
                    // 只要包围盒相交则显示该矢量
                    if(!value.bb2d.intersectsBox(bx)) {
                        value.lastVisitedFrameNumber++;
                        for(let n=0, length = value.meshObj.length; n<length; ++n) {
                            value.meshObj[n].visible = false;
                        }
                    }
                    else {
                        for(let n=0, length = value.meshObj.length; n<length; ++n) {
                            let bs = value.meshObj[n].getBoundingSphereWorld();

                            let dis = cameraPos.clone().sub(bs.center).length();

                            if(dis <= 600 + bs.radius * 50)
                            {
                                value.meshObj[n].visible = true;
                                value.lastVisitedFrameNumber = 0;
                            }
                            else
                            {
                                // 只要有一个mesh距离过远，无效化整个feature
                                value.meshObj[n].visible = false;
                                value.lastVisitedFrameNumber++;
                                continue;
                            }
                            //
                            let obj = value.meshObj[n].children[value.meshObj[n].children.length - 1];
                            if(obj && (obj.isLabel || obj.isModel)) {
                                if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
                                    let worldPos = obj.position.clone().applyMatrix4(featureLayer.matrixWorld);
                                    let z = featureLayer.memDepthSampler.getZ(worldPos.x, worldPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
                                    if(z !== featureLayer.memDepthSampler.noValue) {
                                        worldPos.z =z;
                                        obj.position.copy(worldPos);
                                        obj.position.applyMatrix4(flMatrixWorldInv);
                                    }
                                }
                                obj.quaternion.copy(camera.quaternion.clone());
                                obj.updateMatrixWorld(true);
                            }
                        }
                    }
                }
            });
            //  获取包围盒的网格网格数据
            if(newVisibleRange)
            {
                // 更新时获取
                ++featureLayer.featureVersion;
                //
                let strBound = (globalOffset[0] + bx.min.x)+','+ (globalOffset[1] + bx.min.y)+' ';
                strBound += (globalOffset[0]+bx.max.x)+','+(globalOffset[1]+bx.min.y)+' ';
                strBound += (globalOffset[0]+bx.max.x)+','+(globalOffset[1]+bx.max.y)+' ';
                strBound += (globalOffset[0]+bx.min.x)+','+(globalOffset[1]+bx.max.y)+' ';
                strBound += (globalOffset[0]+bx.min.x)+','+(globalOffset[1]+bx.min.y)+' ';
                let filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'+
                    '<Intersects>'+
                    '<PropertyName>the_geom</PropertyName>'+
                    '<gml:Polygon>'+
                    '<gml:outerBoundaryIs>'+
                    '<gml:LinearRing>'+
                    '<gml:coordinates>' + strBound + '</gml:coordinates>'+
                    '</gml:LinearRing>'+
                    '</gml:outerBoundaryIs>'+
                    '</gml:Polygon>'+
                    '</Intersects>'+
                    '</Filter>';
                //

                let requestUrl = _url_param_[0] + "&" + _url_param_[1];
                requestUrl +="&request=GetFeature" + "&typeName="+this.typeName;
                requestUrl += "&maxFeatures=50000"+"&outputFormat=application%2Fjson";
                requestUrl += "&filter="+filter;

                if(ftRequestWorker) {
                    ftRequestWorker.terminate();
                }

                if(featureLayer.regulator.isLoadFeature)
                {
                    ftRequestWorker = new Worker('../src/worker/featureDownLoadWorker.js');
                    ftRequestWorker.onmessage = cacheRequestData;
                    let regulateParas = {denseRate: featureLayer.regulator.denseRate,fitPattern: featureLayer.regulator.fitPattern};
                    let necessaryParas = {minBox: bx, matrixWorld: featureLayer.matrixWorld, cameraPos: cameraPos, globalOffset:globalOffset};
                    ftRequestWorker.postMessage({type:"request",url:requestUrl, version:featureLayer.featureVersion, necessaryParas: necessaryParas, regulateParas: regulateParas});
                }
                //
                lastVisibleRange[0] = bx.min.x;
                lastVisibleRange[1] = bx.min.y;
                lastVisibleRange[2] = bx.max.x;
                lastVisibleRange[3] = bx.max.y;
            }
            else
            {
                if(ftRequestWorker !== null)
                {
                    ftRequestWorker.postMessage({type:"fetch", requestNum:featureLayer.regulator.requestNum, version:featureLayer.featureVersion});
                }
            }

            // 缓存中是否存在可用数据（取当前缓存数据创建矢量--转换和创建）,是否可以合并（可视范围）
            parseMethod();
        }
    }

}
export {FeatureLayer};
