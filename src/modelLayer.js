/**
 * @classdesc 模型图层
 * @class
 * @memberOf tjh.ar
 * @extends THREE.Group
 */
class ModelLayer extends THREE.Group {
    constructor() {
        super();
        //
        this._mixers_ = [];
        this._clock_ = new THREE.Clock();
        //
        this._modelCache_ = new Map();
    }

    /**
     * 在给定位置添加一个 THREE.Object3D 对象
     * @param {THREE.Object3D} obj -对象
     * @param {THREE.Vector3} pos  -位置
     */
    addThreeObj(obj, pos) {
        obj.isPlantModel = true;
        obj.position.copy(pos);
        this.add(obj);
        //
        this.dispatchEvent({type:"addnode", object:obj});
    }

    /**
     * 加载模型资源（目前支持 .obj 和 .fbx 文件）并放在给定位置
     * 此方法会自动缓存已加载的对象
     * @param {string} url        -模型资源的url
     * @param {THREE.Vector3} pos -所放置的位置
     */
    addModelByURL(url, pos) {
       if(url.substr(-4, 4) === ".fbx") {
           if(this._modelCache_.has(url)) {
               let object = this._modelCache_.get(url).clone();
               object.isPlantModel = true;
               object.position.copy(pos);
               object.mixer = new THREE.AnimationMixer( object );
               this.__mixers__.push( object.mixer );

               var action = object.mixer.clipAction( object.animations[ 0 ] );
               action.play();
               this.add( object );
               //
               this.dispatchEvent({type:"addnode", url:url, object:object});
           }
           else {
               var loader = new THREE.FBXLoader();
               loader.load( url,( model )=> {
                   this._modelCache_.set(url, model);
                   //
                   let object = model.clone();
                   object.isPlantModel = true;
                   object.position.copy(pos);
                   object.mixer = new THREE.AnimationMixer( object );
                   this._mixers_.push( object.mixer );

                   var action = object.mixer.clipAction( object.animations[ 0 ] );
                   action.play();
                   this.add( object );
                   //
                   this.dispatchEvent({type:"addnode", url:url, object:object});
                   //

               } );
           }
       }
       else if(url.substr(-4, 4) === ".obj") {
           if(this._modelCache_.has(url)) {
               let object = this._modelCache_.get(url).clone();
               //
               object.isPlantModel = true;
               object.position.copy(pos);
               this.add( object );
               this.dispatchEvent({type:"addnode", url: url, object:object});
           }
           else {
               var objLoader = new THREE.OBJLoader2();
               let materialPath = url.substr(0, url.lastIndexOf('.'))+".mtl";
               var callbackOnLoad = ( event )=> {
                   this._modelCache_.set(url, event.detail.loaderRootNode);
                   let object = event.detail.loaderRootNode.clone();
                   //
                   object.isPlantModel = true;
                   object.position.copy(pos);
                   this.add( object );
                   this.dispatchEvent({type:"addnode", url:url, object:object});
               };

               var onLoadMtl = ( materials )=> {
                   //objLoader.setModelName( modelName );
                   objLoader.setMaterials( materials );
                   //objLoader.setLogging( true, true );
                   objLoader.load( url, callbackOnLoad, null, null, null, false );
               };
               objLoader.loadMtl( materialPath, null, onLoadMtl );
           }
       }
    }

    remove(obj) {
        if(obj.mixer) {
            let index = this._mixers_.indexOf(obj.mixer);
            if(index >= 0) {
                this._mixers_.splice(index, 1);
            }
        }
        //
        super.remove(obj);
    }

    update(context) {
        if(!this.visible)
            return;
        //
        let delta = this._clock_.getDelta();
        for(let i=0; i<this._mixers_.length; ++i) {
            this._mixers_[ i ].update(delta);
        }
        //
        super.update(context);
    }
}


export {ModelLayer};
