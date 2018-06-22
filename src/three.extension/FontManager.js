/**
 * @class
 * @memberOf THREE
 * @readonly
 * @type {{}}
 */
THREE.FontManager = {};
/**
 * 已加载字体对象缓存
 * @memberOf THREE.FontManager
 * @type {Map<string, THREE.Font>}
 * @private
 */
THREE.FontManager._cache_ = new Map();
THREE.FontManager._loading_ = new Map();
/**
 * 获取指定字体对象，如果已加载则返回该对象，否则请求加载该对象并返回 null
 * @methodOf THREE.FontManager
 * @param {string} fontName 字体名称
 * @return {THREE.Font}
 */
THREE.FontManager.getFont = function(fontName) {
    if(THREE.FontManager._cache_.has(fontName)) {
        return THREE.FontManager._cache_.get(fontName);
    }
    else if(!THREE.FontManager._loading_.has(fontName)){
        let loader = new THREE.FontLoader();
        let fontURL = '../../resource/font/' + fontName + '.typeface.json';
        loader.load( fontURL, function ( font ) {
            THREE.FontManager._cache_.set(fontName, font);
            THREE.FontManager._loading_.delete(fontName);
        } );
        //
        THREE.FontManager._loading_.set(fontName, fontURL);
    }
    //
    return null;
}
