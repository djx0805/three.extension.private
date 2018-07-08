/**
 * 扩展 three.js 中的 Mesh 类，基础信息请参考 three.js 官方文档
 * @class Mesh
 * @memberOf THREE
 */

/**
 * 释放函数
 */
THREE.Mesh.prototype.dispose =  function(gpuRelease = true, memRelease = true) {
    if(this.geometry) {
        this.geometry.dispose();
        if(memRelease)
          this.geometry = null;
    }
    //
    if(this.material.isMaterial) {
        if(this.material && this.material.map instanceof  THREE.Texture){
            this.material.map.nReference--;
            if(this.material.map.nReference <= 0){
                this.material.map.dispose();
                if(memRelease)
                    this.material.map = null;
            }
        }
        //
        if(this.material && !this.material.unDisposable) {
            this.material.dispose();
            if(memRelease)
                this.material = null;
        }
    }
    else if(this.material instanceof Array) {
        for(let n=0, numMaterial = this.material.length; n<numMaterial; ++n) {
            let material = this.material[n];
            //
            if(material && material.map instanceof  THREE.Texture){
                material.map.nReference--;
                if(material.map.nReference <= 0){
                    material.map.dispose();
                    if(memRelease)
                        material.map = null;
                }
            }
            //
            if(material && !material.unDisposable) {
                material.dispose();
                if(memRelease)
                    material = null;
            }
        }
    }
    //
    for(let n=0, length = this.children.length; n<length; ++n) {
        this.children[n].dispose(gpuRelease, memRelease);
    }
};


THREE.Points.prototype.dispose = function(gpuRelease = true, memRelease = true) {
    if(this.geometry) {
        this.geometry.dispose();
        if(memRelease)
          this.geometry = null;
    }
    //
    if(this.material && this.material.map instanceof  THREE.Texture){
        this.material.map.nReference--;
        if(this.material.map.nReference <= 0){
            this.material.map.dispose();
            if(memRelease)
              this.material.map = null;
        }
    }
    //
    if(this.material && !this.material.unDisposable) {
        this.material.dispose();
        if(memRelease)
           this.material = null;
    }
    //
    for(let n=0, length = this.children.length; n<length; ++n) {
        this.children[n].dispose(gpuRelease, memRelease);
    }
}

THREE.Line.prototype.dispose = function (gpuRelease = true, memRelease = true) {
    if(this.geometry) {
        this.geometry.dispose();
        if(memRelease)
           this.geometry = null;
    }
    //
    if(this.material && this.material.map instanceof  THREE.Texture){
        this.material.map.nReference--;
        if(this.material.map.nReference <= 0){
            this.material.map.dispose();
            if(memRelease)
               this.material.map = null;
        }
    }
    //
    if(this.material && !this.material.unDisposable) {
        this.material.dispose();
        if(memRelease)
          this.material = null;
    }
    //
    for(let n=0, length = this.children.length; n<length; ++n) {
        this.children[n].dispose(gpuRelease, memRelease);
    }
}
