/**
 * 扩展 three.js 中的 Texture 类，基础信息请参考 three.js 官方文档
 * @class Texture
 * @memberOf THREE
 */

THREE.Texture.prototype.loadState = 0;
/**
 * 引用计数，在纹理被多个 material 使用时使用
 * @type {number}
 */
THREE.Texture.prototype.nReference = 0;
THREE.Texture.loadings = new Map();
THREE.Texture.onTextureLoaded = function (texture) {
    texture.image.loaded = true;
    THREE.Texture.loadings.delete(texture.image.src);
};
THREE.Texture.onTextureLoadFailed = function (event) {
    let tmp = THREE.Texture.loadings.get(event.target.src);
    if(tmp) {
        tmp.image = {failedLoad: true};
        THREE.Texture.loadings.delete(event.target.src);
    }
};



THREE.TextureLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {
    var texture = new THREE.Texture();
    THREE.Texture.loadings.set(url, texture);

    var loader = new THREE.ImageLoader( this.manager );
    loader.setCrossOrigin( this.crossOrigin );
    loader.setPath( this.path );

    loader.load( url, function ( image ) {

        texture.image = image;

        // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
        var isJPEG = url.search( /\.(jpg|jpeg)$/ ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

        texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
        texture.needsUpdate = true;

        if ( onLoad !== undefined ) {

            onLoad( texture );

        }

    }, onProgress, onError );

    return texture;
};
