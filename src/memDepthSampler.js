class MemDepthSampler {
    constructor() {
        MemDepthSampler.SAMPLE_MODE = {
          SAMPLE_MODE_NORMAL : 0,
          SAMPLE_MODE_LOW : 1,
          SAMPLE_MODE_HIGH : 2
        };
        //
        this.noValue = 0;
        this.size = [0,0];
        this.range = [0,0,0,0];
        this.data = null;
        this.cameraNearFar = [0,0];
        //
        let unpackDownscale = 255.0 / 256.0;
        this._unpackFactors = new THREE.Vector4( unpackDownscale/(256.0 * 256.0 * 256.0), unpackDownscale/(256.0 * 256.0),  unpackDownscale/256.0, unpackDownscale);
        //
        let getZNormal = (x, y)=> {
            if(x < this.range[0] || x > this.range[1] || y < this.range[2] || y > this.range[3]) {
                return this.noValue;
            }
            //
            let deltX = (this.range[1] - this.range[0]) / (this.size[0] - 1);
            let deltY = (this.range[3] - this.range[2]) / (this.size[1] - 1);
            //
            let row = Math.floor((y - this.range[2]) / deltY + 0.5);
            let col = Math.floor((x - this.range[0]) / deltX + 0.5);
            //
            let index = (row*this.size[0] + col)*4;
            let packedZ = new THREE.Vector4(this.data[index]/255.0, this.data[index + 1]/255.0, this.data[index + 2]/255.0, this.data[index + 3]/255.0);
            let linearClipZ = packedZ.dot(this._unpackFactors);
            if(linearClipZ > 0.96)
                return this.noValue;
            //
            let z = linearClipZ*(this.cameraNearFar[0] - this.cameraNearFar[1]) - this.cameraNearFar[0];
            return z;
        };

        let getZLow = (x, y)=> {
            if(x < this.range[0] || x > this.range[1] || y < this.range[2] || y > this.range[3]) {
                return this.noValue;
            }
            //
            let deltX = (this.range[1] - this.range[0]) / (this.size[0] - 1);
            let deltY = (this.range[3] - this.range[2]) / (this.size[1] - 1);
            //
            let row = Math.floor((y - this.range[2]) / deltY + 0.5);
            let col = Math.floor((x - this.range[0]) / deltX + 0.5);
            //
            let index = (row*this.size[0] + col)*4;
            let packedZ = new THREE.Vector4(this.data[index]/255.0, this.data[index + 1]/255.0, this.data[index + 2]/255.0, this.data[index + 3]/255.0);
            let linearClipZ = packedZ.dot(this._unpackFactors);
            if(linearClipZ > 0.96)
                return this.noValue;
            //
            let z = linearClipZ*(this.cameraNearFar[0] - this.cameraNearFar[1]) - this.cameraNearFar[0];
            return z;
        }

        this.getZ = (x,y, sample_mode)=> {
            if(sample_mode === MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL) {
                return getZNormal(x, y);
            }
        };
    }
};

export {MemDepthSampler}
