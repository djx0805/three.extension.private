/**
 * 标注选择工具，一次只能选择一个对象
 * @class
 * @extends tjh.ar.tools.SelectTool
 */
class MarkSelectTool extends tjh.ar.tools.ToolBase {
    constructor(viewer, camera=viewer.getCamera(), selColor = 0xff0000, layers=viewer.scene.customLayers) {
        super(viewer);
        //
        let renderer = viewer.getRenderer();

        let pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
        pickingTexture.texture.minFilter = THREE.LinearFilter;

        this.pickedData = null;


        this.onMouseMove = (mouseEvent)=> {

            //
            return false;
        };

        this.onLeftDown = (mouseEvent)=> {
            //
            let mouse = new THREE.Vector2();
            mouse.x = mouseEvent.clientX;
            mouse.y = mouseEvent.clientY;

            renderer.render(layers.pickingScene, camera, pickingTexture);

            let pixelBuffer = new Uint8Array(4);

            renderer.readRenderTargetPixels( pickingTexture, mouse.x, pickingTexture.height - mouse.y, 1, 1, pixelBuffer );

            let pickingId = ( pixelBuffer[ 0 ] << 16 ) | ( pixelBuffer[ 1 ] << 8 ) | ( pixelBuffer[ 2 ] );

            let data = layers.pickingData[ pickingId ];

            if ( data) {
                this.pickedData = data;
            }
            else
                this.pickedData = null;

            return true;
        };
    }

    release() {
        super.release();
    }
}
