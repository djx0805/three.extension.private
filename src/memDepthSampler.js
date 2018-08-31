/**
 * @classdesc 内存深度取样器
 * @class
 * @memberOf tjh.ar
 */
class MemDepthSampler {
    constructor() {
        /**
         * 取样模式
         * @enum
         */
        MemDepthSampler.SAMPLE_MODE = {
            /** @description 普通高度*/
          SAMPLE_MODE_NORMAL : 0,
            /** @description 低值*/
          SAMPLE_MODE_LOW : 1,
            /** @description 高值*/
          SAMPLE_MODE_HIGH : 2
        };

        this.noValue = 0;
        this.size = [0,0];
        this.range = [0,0,0,0];
        this.data = null;
        this.cameraNearFar = [0,0];
        //
        let unpackDownscale = 255.0 / 256.0;
        this._unpackFactors = new THREE.Vector4( unpackDownscale/(256.0 * 256.0 * 256.0), unpackDownscale/(256.0 * 256.0),  unpackDownscale/256.0, unpackDownscale);

        /**
         * 根据x, y 获取该点的普通深度
         * @param {number} x -x
         * @param {number} y -y
         * @return {number} -深度
         */
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

        /**
         * 根据x, y 获取该点的低值
         * @param {number} x -x
         * @param {number} y -y
         * @return {number} -深度
         */
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

        /**
         * 根据x, y 获取该点的高值
         * @param {number} x -x
         * @param {number} y -y
         * @param {number} sample_mode -取样模式
         * @return {number} -深度
         */
        this.getZ = (x,y, sample_mode)=> {
            if(sample_mode === MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL) {
                return getZNormal(x, y);
            }
        };
    }
};

export {MemDepthSampler}
