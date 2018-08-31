
class MarkLayer extends THREE.Group{
    constructor(imgUrl){
        super();

        this.pickingScene = new THREE.Scene();
        this.pickingScene.autoUpdate = false;

        this.pickingData = [];

        this.imageUrl = imgUrl;

        this.range = [];

        let marKLayer = this;
        let selectId = 111;

        this.pixelRatio = 1.0;

        this.markObjs = [];

        this.markType = "";

        let markImg = new THREE.TextureLoader().load( this.imageUrl);


        this.markOptions = {
            /** @description 图片*/
            map: markImg,
            /** @description 透明*/
            transparent:true,
            /** @description 透明度*/
            opacity: 1,
            fog:false,
            /** @description 深度测试*/
            depthTest: false,
        };

        let markMaterial = new THREE.SpriteMaterial(marKLayer.markOptions);


        this.addMarkWithImg = (id, description, pos, imgUrl)=> {
          new THREE.TextureLoader().load(imgUrl, (texture)=> {
              texture.image.loaded = true;
              //
              marKLayer.addMark(id, description, pos, texture.image);
          });
        };
        //
        this.addMark = function (id, description, pos, img) {
            let colorId = selectId++;

            let spriteMat = markMaterial;
            if(img) {
                spriteMat = markMaterial.clone();
                spriteMat.map = img;
            }
            let sprite = new THREE.Sprite(spriteMat);
            sprite.center.set(0.5, 0.0);

            let spWidth = spriteMat.map.image.width;
            let spHeight = spriteMat.map.image.height;

            sprite.position.set(pos.x, pos.y, pos.z);
            sprite.scale.set(spWidth,spHeight,1);

            sprite.visible = true;
            sprite.markId = id;
            sprite.markDes = description;

            this.add(sprite);
            sprite.updateMatrixWorld(true);
            this.markObjs[this.markObjs.length] = sprite;

            let newColor = new THREE.Color();
            newColor.setHex(colorId);

            let spriteMat1 = new THREE.SpriteMaterial({color:newColor, map: markImg});
            if(img) {
                spriteMat1.map = img;
            }
            let sprite1 = new THREE.Sprite(spriteMat1);
            sprite1.center.set(0.5, 0.0);
            sprite1.usedForPick = true;
            sprite1.position.set(pos.x, pos.y, pos.z);
            sprite1.scale.set(spWidth,spHeight,1);

            sprite1.updateMatrixWorld(true);


            // this.pickingScene._visibleMeshes[this.pickingScene._visibleMeshes.length] = sprite1;
            this.pickingScene.add(sprite1);


            this.pickingData[colorId] = {
                selectedObj: sprite,
                mapObj: sprite1,
                pickedId: colorId,
                position: sprite1.position,
                rotation: sprite1.rotation,
                scale: sprite1.scale,
            };
        }

        this.removeMark = function (pickedData) {

            let index = marKLayer.markObjs.indexOf(pickedData.selectedObj);
            if(index === -1)
                return;
            else
            {
                marKLayer.markObjs[index].dispose();
                marKLayer.pickingScene.remove(pickedData.mapObj);
                this.remove(pickedData.selectedObj);
                marKLayer.markObjs.splice(index, 1);

            }
        }

    }
    update(context)
    {
        let lookAt = context.camera.matrixWorldInverse.getLookAt();
        //
        for(let n=0, length = this.children.length; n<length; ++n) {
            if(this.children[n].isSprite) {
                if(this.children[n].position.clone().distanceTo(lookAt.eye) > 1500) {
                    this.children[n].visible = false;
                    continue;
                }
                else {
                    this.children[n].visible = true;
                    this.children[n].frustumCulled = false;
                }
                //
                let bs = new THREE.Sphere();
                bs.center.copy(this.children[n].position);
                let map = this.children[n].material.map;
                let worldHWidth = map.image.width*this.pixelRatio / 2.0;
                let worldHHeight = map.image.height*this.pixelRatio / 2.0;
                bs.radius = Math.sqrt(worldHWidth*worldHWidth + worldHHeight*worldHHeight);
                //
                let currentScreenRadius = Math.abs(bs.radius*(bs.center.dot(context.camera.pixelSizeVector) + context.camera.pixelSizeVector.w))/2.0;
                //
                let targetScreenRadius =  Math.sqrt(map.image.width*map.image.width/4.0 + map.image.height*map.image.height/4.0);
                //
                let scale = currentScreenRadius/targetScreenRadius;
                //
                this.children[n].scale.set(map.image.width*scale, map.image.height*scale, 1.0);
                this.children[n].updateMatrixWorld(true);
                //
                this.pickingScene.children[n].scale.set(map.image.width*scale, map.image.height*scale, 1.0);
                this.pickingScene.children[n].updateMatrixWorld(true);
            }
        }
        //super.update(context);
    }
    removeUnExpected()
    {

    }
}
