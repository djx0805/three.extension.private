class VisualFieldAnalyzer extends tjh.ar.PostLayer{
    constructor(scene){
        super();

        this.name = "VisualFieldLayer";

        this.enable = true;

        let lineMatrial = new THREE.LineBasicMaterial({color:new THREE.Color(0xffffff),transparent:false,side:THREE.DoubleSide});
        let stripMaterial = new THREE.MeshPhongMaterial({color:new THREE.Color(0xffffff),transparent:true, opacity:0.5,side:THREE.DoubleSide});
        this.viewCameras = [];

        this.addVisualField = function (cameraOptions,tempCamera) {
            let visualCamara = new THREE.PerspectiveCamera(cameraOptions.horizonfov, cameraOptions.aspect, 1, cameraOptions.visibleRadius);
            visualCamara.position.copy(cameraOptions.position);
            visualCamara.lookAt(cameraOptions.target);

            visualCamara.cameraOptions = cameraOptions;
            this.viewCameras[this.viewCameras.length] = visualCamara;

        }

        this.constructFrustumLine = function (cameraOptions,visualCamara,tempFrustumScene,veiwVm, viewPm) {
            if(visualCamara.frameLine)
            {
                tempFrustumScene.remove(visualCamara.frameLine);
                visualCamara.frameLine.dispose(true,true)
            }

            // 视椎体
            let frustum = new THREE.Frustum();
            let projScreenMatrix = new THREE.Matrix4();

            projScreenMatrix.multiplyMatrices(viewPm, veiwVm);
            frustum.setFromMatrix( projScreenMatrix );

            let visibleFrustumLine = new THREE.Group();
            let corners = [];
            corners[0] = new THREE.Vector3(-1.0,-1.0,-1.0);
            corners[1] = new THREE.Vector3(1.0,-1.0,-1.0);
            corners[2] = new THREE.Vector3(1.0,-1.0,1.0);
            corners[3] = new THREE.Vector3(-1.0,-1.0,1.0);

            let lineddd00 = new THREE.BufferGeometry();
            {
                let tmpdp = [0,0,0];

                let dir = visualCamara.matrixWorldInverse.getLookAt().lookDirection;
                dir.normalize();
                dir.multiplyScalar(cameraOptions.visibleRadius);

                tmpdp[tmpdp.length] = dir.x;
                tmpdp[tmpdp.length] = dir.y;
                tmpdp[tmpdp.length] = dir.z;
                corners[0] = dir;

                lineddd00.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineddd00, lineMatrial);
                visibleFrustumLine.add(line);
            }

            // 视域边线
            let lineGeo00 = new THREE.BufferGeometry();
            {
                let tmpdp = [0,0,0];

                let dir = frustum.planes[0].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[5].normal);
                dir.normalize();
                dir.multiplyScalar(cameraOptions.visibleRadius);

                tmpdp[tmpdp.length] = dir.x;
                tmpdp[tmpdp.length] = dir.y;
                tmpdp[tmpdp.length] = dir.z;
                corners[0] = dir;

                lineGeo00.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineGeo00, lineMatrial);
                visibleFrustumLine.add(line);
            }

            let lineGeo01 = new THREE.BufferGeometry();
            {
                let tmpdp = [0,0,0];

                let dir = frustum.planes[1].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[5].normal);
                dir.normalize();
                dir.multiplyScalar(cameraOptions.visibleRadius);


                corners[1] = dir;

                tmpdp[tmpdp.length] = dir.x;
                tmpdp[tmpdp.length] = dir.y;
                tmpdp[tmpdp.length] = dir.z;

                lineGeo01.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineGeo01, lineMatrial);
                visibleFrustumLine.add(line);
            }

            let lineGeo11 = new THREE.BufferGeometry();
            {
                let tmpdp = [0,0,0];

                let dir = frustum.planes[1].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[5].normal);
                dir.normalize();
                dir.multiplyScalar(cameraOptions.visibleRadius);

                corners[2] = dir;

                tmpdp[tmpdp.length] = dir.x;
                tmpdp[tmpdp.length] = dir.y;
                tmpdp[tmpdp.length] = dir.z;

                lineGeo11.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineGeo11, lineMatrial);
                visibleFrustumLine.add(line);

            }

            let lineGeo10 = new THREE.BufferGeometry();
            {
                let tmpdp = [0,0,0];

                let dir = frustum.planes[0].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[5].normal);
                dir.normalize();
                dir.multiplyScalar(cameraOptions.visibleRadius);


                corners[3] = dir;

                tmpdp[tmpdp.length] = dir.x;
                tmpdp[tmpdp.length] = dir.y;
                tmpdp[tmpdp.length] = dir.z;

                lineGeo10.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineGeo10, lineMatrial);
                visibleFrustumLine.add(line);
            }

            let lineArc00 = new THREE.BufferGeometry();
            {
                let tmpdp = []
                let corner1 = frustum.planes[5].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[0].normal);
                corner1.normalize();
                let corner2 = frustum.planes[5].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[0].normal);
                corner2.normalize();
                let normal = corner1.clone().cross(corner2);
                normal.normalize();

                let angle = THREE.Math.radToDeg(corner1.clone().angleTo(corner2));

                tmpdp[tmpdp.length] = corners[0].x;
                tmpdp[tmpdp.length] = corners[0].y;
                tmpdp[tmpdp.length] = corners[0].z;

                let rotate = new THREE.Matrix4();
                rotate.makeRotationAxis(normal, THREE.Math.degToRad(1.0));

                for(let i = 2, len = angle; i<len; ++i)
                {
                    let middlePoint = corners[0].clone().applyMatrix4(rotate);
                    rotate.makeRotationAxis(normal, THREE.Math.degToRad(i));

                    tmpdp[tmpdp.length] = middlePoint.x;
                    tmpdp[tmpdp.length] = middlePoint.y;
                    tmpdp[tmpdp.length] = middlePoint.z;
                }

                tmpdp[tmpdp.length] = corners[3].x;
                tmpdp[tmpdp.length] = corners[3].y;
                tmpdp[tmpdp.length] = corners[3].z;

                lineArc00.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));
                let line = new THREE.Line(lineArc00, lineMatrial);
                visibleFrustumLine.add(line);
            }
            let lineArc01 = new THREE.BufferGeometry();
            {
                let tmpdp = [];
                let corner1 = frustum.planes[5].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[1].normal);
                corner1.normalize();
                let corner2 = frustum.planes[5].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[1].normal);
                corner2.normalize();
                let normal = corner1.clone().cross(corner2);
                normal.normalize();

                let angle = THREE.Math.radToDeg(corner1.clone().angleTo(corner2));

                tmpdp[tmpdp.length] = corners[1].x;
                tmpdp[tmpdp.length] = corners[1].y;
                tmpdp[tmpdp.length] = corners[1].z;

                let rotate = new THREE.Matrix4();
                rotate.makeRotationAxis(normal, THREE.Math.degToRad(1.0));

                for(let i = 2, len = angle; i<len; ++i)
                {
                    let middlePoint = corners[1].clone().applyMatrix4(rotate);
                    rotate.makeRotationAxis(normal, THREE.Math.degToRad(i));

                    tmpdp[tmpdp.length] = middlePoint.x;
                    tmpdp[tmpdp.length] = middlePoint.y;
                    tmpdp[tmpdp.length] = middlePoint.z;
                }

                tmpdp[tmpdp.length] = corners[2].x;
                tmpdp[tmpdp.length] = corners[2].y;
                tmpdp[tmpdp.length] = corners[2].z;

                lineArc01.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineArc01, lineMatrial);
                visibleFrustumLine.add(line);
            }
            let lineArc11 = new THREE.BufferGeometry();
            {
                let tmpdp= [];
                let corner1 = frustum.planes[1].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[5].normal);
                corner1.normalize();
                let corner2 = frustum.planes[0].normal.clone().add(frustum.planes[3].normal).add(frustum.planes[5].normal);
                corner2.normalize();
                let normal = corner1.clone().cross(corner2);
                normal.normalize();

                let angle = THREE.Math.radToDeg(corner1.clone().angleTo(corner2));

                tmpdp[tmpdp.length] = corners[1].x;
                tmpdp[tmpdp.length] = corners[1].y;
                tmpdp[tmpdp.length] = corners[1].z;
                1
                let rotate = new THREE.Matrix4();
                rotate.makeRotationAxis(normal, THREE.Math.degToRad(1.0));

                for(let i = 2, len = angle; i<len; ++i)
                {
                    let middlePoint = corners[1].clone().applyMatrix4(rotate);
                    rotate.makeRotationAxis(normal, THREE.Math.degToRad(i));

                    tmpdp[tmpdp.length] = middlePoint.x;
                    tmpdp[tmpdp.length] = middlePoint.y;
                    tmpdp[tmpdp.length] = middlePoint.z;
                }

                tmpdp[tmpdp.length] = corners[0].x;
                tmpdp[tmpdp.length] = corners[0].y;
                tmpdp[tmpdp.length] = corners[0].z;

                lineArc11.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineArc11, lineMatrial);
                visibleFrustumLine.add(line);
            }

            let lineArc10 = new THREE.BufferGeometry();
            {
                let tmpdp = [];

                let corner1 = frustum.planes[1].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[5].normal);
                corner1.normalize();
                let corner2 = frustum.planes[0].normal.clone().add(frustum.planes[2].normal).add(frustum.planes[5].normal);
                corner2.normalize();
                let normal = corner1.clone().cross(corner2);
                normal.normalize();

                let angle = THREE.Math.radToDeg(corner1.clone().angleTo(corner2));

                tmpdp[tmpdp.length] = corners[2].x;
                tmpdp[tmpdp.length] = corners[2].y;
                tmpdp[tmpdp.length] = corners[2].z;

                let rotate = new THREE.Matrix4();
                rotate.makeRotationAxis(normal, THREE.Math.degToRad(1.0));

                for(let i = 2, len = angle; i<len; ++i)
                {
                    let middlePoint = corners[2].clone().applyMatrix4(rotate);
                    rotate.makeRotationAxis(normal, THREE.Math.degToRad(i));

                    tmpdp[tmpdp.length] = middlePoint.x;
                    tmpdp[tmpdp.length] = middlePoint.y;
                    tmpdp[tmpdp.length] = middlePoint.z;
                }

                tmpdp[tmpdp.length] = corners[3].x;
                tmpdp[tmpdp.length] = corners[3].y;
                tmpdp[tmpdp.length] = corners[3].z;

                lineArc10.addAttribute("position", new THREE.Float32BufferAttribute(tmpdp, 3));

                let line = new THREE.Line(lineArc10, lineMatrial);
                visibleFrustumLine.add(line);
            }

            visibleFrustumLine.position.copy(cameraOptions.position);

            visualCamara.frameLine = visibleFrustumLine;

        }

        this.removeVisualField = function (camera) {
            let cameraIndex = this.viewCameras.indexOf(camera);

            camera.frameLine.dispose(true,true);
            if(cameraIndex >= 0) {
                this.viewCameras.splice(camera, 1);
            }
        }
        this.isEmpty = ()=>{
            return false;
        }
    }
}

class VisualFieldRenderPass extends tjh.ar.RenderPass{
    constructor(scene,camera, renderTarget)
    {
        super(scene, camera, renderTarget);
        //
        let visualFieldRenderPass = this;
        // 获取视域图层和视域相机
        let visualFieldLayer = scene.getPostLayer('VisualFieldLayer')[0].layer;
        let viewCameras = null;

        // 全局相机的逆矩阵
        let inverseVM = new THREE.Matrix4();
        let inversePM = new THREE.Matrix4();

        let tmpViewScene = new THREE.Scene();

        let tmpFrustumScene = new THREE.Scene();

        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        let viewOffScreenRT = new THREE.WebGLRenderTarget(renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars);
        viewOffScreenRT.depthBuffer = true;
        viewOffScreenRT.depthTexture = new THREE.DepthTexture(renderer.domElement.clientWidth, renderer.domElement.clientHeight,
            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);


        let offScreenRT = new THREE.WebGLRenderTarget(renderTarget.width, renderTarget.height, pars);
        offScreenRT.depthBuffer = false;

        let getViewFieldMaterial = () => {
            return new THREE.ShaderMaterial({
                uniforms:{
                    "baseTexture":{value:null},
                    "depthTexture":{value:null},
                    "viewDepthTexture":{value:null},
                    "viewCenter":{value:  null },
                    "radius":{value: null},
                    "inverVM":{value: null},
                    "inverPM":{value:null},
                    "viewVM":{value: null},
                    "viewPM":{value:null},
                    "color0":{value: new THREE.Vector4(0,1,0,1)},
                    "color1":{value: new THREE.Vector4(1,0,0,1)},
                },
                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",
                fragmentShader:
                    "#include <packing>   \
                    varying vec2 vUv;                                              \
                    uniform sampler2D baseTexture;                                      \
                    uniform sampler2D depthTexture;                                   \
                    uniform sampler2D viewDepthTexture;                                   \
                    uniform vec3  viewCenter;                                               \
                    uniform float  radius;                                                       \
                    uniform mat4 inverVM;                                                      \
                    uniform mat4 inverPM;                                                      \
                    uniform mat4 viewVM;                                                    \
                    uniform mat4 viewPM;                                                     \
                    uniform vec4   color0;                                                       \
                    uniform vec4   color1;                                                        \
                                                                                           \
                    void main(void)                                                        \
                    {                                                                       \
                        vec4 color = texture2D( baseTexture, vUv );                     \
                        float depth = texture2D( depthTexture, vUv.st).x;      \
                        vec4 nds = vec4(vUv.s*2.0 - 1.0, vUv.t*2.0 - 1.0, depth*2.0 - 1.0, 1.0);      \
                        vec4 vp = inverVM*inverPM*nds;    \
                        vp = vp / vp.w;                                    \
                        float length = length(vp.xyz - viewCenter.xyz);      \
                        if(length > radius) { gl_FragColor = color; }   \
                        else   \
                        { \
                             vec4 vnds = viewPM*viewVM*vp;      \
                             vnds = vnds/vnds.w;                                  \
                             if(vnds.x < 1.0 && vnds.x > -1.0 && vnds.y < 1.0 && vnds.y > -1.0 && vnds.z < 1.0 && vnds.z > -1.0) \
                             { \
                                float vz = (vnds.z + 1.0) / 2.0; \
                                float viewZ0 = perspectiveDepthToViewZ( vz, 1.0, radius );\
                                float d0 = viewZToOrthographicDepth( viewZ0, 1.0, radius );\
                                vec4 vvp = vec4((vnds.x+1.0)/2.0, (vnds.y+1.0)/2.0, (vnds.z+1.0)/2.0, 1.0);         \
                                float v_depth = texture2D( viewDepthTexture, vec2(vvp.x, vvp.y)).x;    \
                                float viewZ1 = perspectiveDepthToViewZ( v_depth, 1.0, radius );              \
                                float d1 = viewZToOrthographicDepth( viewZ1, 1.0, radius );\
                                float foreBack = d0-0.0006 > d1 ? 1.0: 0.0;   \
                                vec4 color_0 = vec4(foreBack*color0.rgb, foreBack);  \
                                vec4 color_1 = vec4((1.0 - foreBack)*color1.rgb, 1.0 - foreBack); \
                                gl_FragColor = color*0.5 + (color_0 + color_1)*0.5; \
                             } \
                             else { gl_FragColor = color; } \
                        } \
                    } "
            });
        }

        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        let quad = new THREE.Mesh( geom, getViewFieldMaterial());
        tmpViewScene.add( quad );

        this.render = function (renderer) {
            if(this.renderTarget.renderToScreen)
                return false;

            //
            viewCameras = visualFieldLayer.viewCameras
            if (!viewCameras) {
                return true;
            }
            //
            let proxyCamera = visualFieldRenderPass.camera.clone();
            proxyCamera.position.x = 0;
            proxyCamera.position.y = 0;
            proxyCamera.updateMatrixWorld();
            //
            inverseVM.getInverse(proxyCamera.matrixWorldInverse.clone());
            inversePM.getInverse(proxyCamera.projectionMatrix.clone());
            //
            if(visualFieldLayer.enable && viewCameras.length > 0)
            {
                for(let i = 0, len = viewCameras.length; i < len; ++i)
                {
                    renderer.autoClear = false;

                    renderer.state.buffers.color.setMask(false);
                    renderer.state.buffers.color.setLocked(true);

                    // 得到视域相机深度缓存
                    renderer.clearTarget(viewOffScreenRT, true,true,true);
                    renderer.render(this.scene, viewCameras[i],viewOffScreenRT);

                    //
                    renderer.state.buffers.color.setLocked(false);
                    renderer.state.buffers.color.setMask(true);

                    renderer.state.buffers.depth.setTest(false);
                    renderer.state.buffers.depth.setMask(false);
                    renderer.state.buffers.depth.setLocked(true);


                    let proxyVCamera = viewCameras[i].clone();
                    proxyVCamera.position.x -= visualFieldRenderPass.camera.position.x;
                    proxyVCamera.position.y -= visualFieldRenderPass.camera.position.y;
                    proxyVCamera.updateMatrixWorld();
                    //
                    let viewVm = proxyVCamera.matrixWorldInverse;
                    let viewPm = proxyVCamera.projectionMatrix;

                    let radius = viewCameras[i].cameraOptions.visibleRadius;
                    let visibleColor = viewCameras[i].cameraOptions.visibleColor;
                    let unVisibleColor = viewCameras[i].cameraOptions.unVisibleColor;

                    quad.material.uniforms["depthTexture"].value = renderTarget.depthTexture;
                    quad.material.uniforms["baseTexture"].value = renderTarget.texture;
                    quad.material.uniforms["viewDepthTexture"].value = viewOffScreenRT.depthTexture;
                    quad.material.uniforms["viewCenter"].value = proxyVCamera.position;
                    quad.material.uniforms["radius"].value = radius;
                    quad.material.uniforms["inverVM"].value = inverseVM;
                    quad.material.uniforms["inverPM"].value = inversePM;
                    quad.material.uniforms["viewVM"].value = viewVm;
                    quad.material.uniforms["viewPM"].value = viewPm;
                    quad.material.uniforms["color1"].value = new THREE.Vector4(visibleColor.r,visibleColor.g,visibleColor.b,1);
                    quad.material.uniforms["color0"].value = new THREE.Vector4(unVisibleColor.r,unVisibleColor.g,unVisibleColor.b,1);

                    quad.material.needUpdate = true;
                    quad.material.depthTest = false;
                    quad.material.depthWrite = false;
                    quad.drawMode = THREE.TriangleFanDrawMode;
                    quad.frustumCulled = false;

                    //viewFieldGroup.add(quad);
                    renderer.clearTarget(offScreenRT, true,false,false);
                    renderer.render(tmpViewScene, orthoCamera, offScreenRT);

                    renderer.setTexture2D( renderTarget.texture, 0 );
                    renderer.context.copyTexImage2D( renderer.context.TEXTURE_2D, 0, renderer.context.RGBA, 0, 0, offScreenRT.width, offScreenRT.height, 0 );

                    visualFieldLayer.constructFrustumLine( viewCameras[i].cameraOptions,viewCameras[i],tmpFrustumScene, viewVm, viewPm);
                    tmpFrustumScene.add(viewCameras[i].frameLine);
                }

                renderer.autoClear = false;
                renderer.state.buffers.depth.setTest(true);

                renderer.state.buffers.color.setLocked(false);
                renderer.state.buffers.color.setMask(true);
                renderer.render(tmpFrustumScene, visualFieldRenderPass.camera, renderTarget);
                //
                while (tmpFrustumScene.children.length > 0) {
                    tmpFrustumScene.remove(tmpFrustumScene.children[0]);
                }
            }
            renderer.autoClear = true;
            renderer.state.buffers.depth.reset();
            renderer.state.buffers.color.reset();
            return true;
        }

        this.setSize = function(width, height) {
            viewOffScreenRT.setSize(width, height);
            offScreenRT.setSize(width, height);
        }
        //
        this.release = function () {
            viewOffScreenRT.texture.dispose();
            viewOffScreenRT.depthTexture.dispose();
            viewOffScreenRT.dispose();

            offScreenRT.texture.dispose();
            offScreenRT.dispose();
        }

    }
}
function CameraOptions() {
    this.id = 0;
    this.position = new THREE.Vector3(0.0,0.0,0.0);
    this.target = new THREE.Vector3(0.0,0.0,0.0);
    this.horizonfov = 45;
    this.aspect = 0.8;
    this.visibleRadius = 200;
    this.visibleColor = new THREE.Color(0x00ff00);
    this.unVisibleColor = new THREE.Color(0xff0000);
    this.targetHeightOffset = 0.0;
    this.positionHeightOffset = 0.0;
}
class PlantViewFieldTool extends tjh.ar.WindowEventListener {
    constructor(viewer, layer, postlayer) {
        super(viewer);

        let cameraOptions = new CameraOptions();

        let plantBegin = true;

        let currentViewCamera = null;

        let clearTempObjs = function (strDrawType) {
            for(let i = 0, len =  viewer.getScene().temporaryObjs.length; i < len; ++i)
            {
                if(viewer.getScene().temporaryObjs[i]=== undefined)
                    continue;
                if( viewer.getScene().temporaryObjs[i].drawType === strDrawType)
                {
                    viewer.getScene().temporaryObjs[i].dispose();
                    viewer.getScene().removeTemporaryObj(viewer.getScene().temporaryObjs[i]);
                    i--;
                }
            }

        }

        //
        this.onLeftDown =(mouseEvent)=>{
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / viewer.domElement.clientHeight ) * 2 + 1;
            //
            raycaster.setFromCamera( mouse, viewer.camera);
            let intersects = raycaster.intersectObject( layer,true);
            //
            if(intersects.length === 0)
                return false;
            else(intersects.length !== 0)
            {
                if(mouseEvent.ctrlKey === false)
                    return;
                if(plantBegin === true)
                {
                    cameraOptions = new CameraOptions();
                    cameraOptions.position = intersects[0].point;
                    cameraOptions.position.z += cameraOptions.positionHeightOffset + 2;

                    plantBegin = false;
                }
                else
                {
                    clearTempObjs("viewFieldTemp");

                    cameraOptions.target = intersects[0].point;
                    cameraOptions.target.z += cameraOptions.targetHeightOffset;

                    currentViewCamera = null;

                    plantBegin = true;
                }

            }
        }
        this.onMouseMove = (mouseEvent)=>{
            const clientX = mouseEvent.offsetX;
            const clientY = mouseEvent.offsetY;
            //
            let mouse = new THREE.Vector2();
            mouse.x = ( clientX / viewer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( clientY / viewer.domElement.clientHeight ) * 2 + 1;
            //
            raycaster.setFromCamera( mouse, viewer.camera);
            let intersects = raycaster.intersectObject( layer,true);
            //
            if(intersects.length === 0)
                return false;
            else(intersects.length !== 0)
            {
                if(plantBegin === true)
                    return false;
                clearTempObjs("viewFieldTemp");

                cameraOptions.target = intersects[0].point;

                if(currentViewCamera === null)
                {
                    if(postlayer.viewCameras.length > 0)
                    {
                        for(let i = 0, len = postlayer.viewCameras.length; i < len; ++i)
                        {
                            postlayer.removeVisualField(postlayer.viewCameras[i]);
                        }

                    }
                    postlayer.addVisualField(cameraOptions,null);
                    currentViewCamera = postlayer.viewCameras[postlayer.viewCameras.length-1];
                }
                else {
                    currentViewCamera.lookAt(cameraOptions.target);
                    currentViewCamera.updateMatrixWorld(true);
                }

            }
        }

        this.onKeyDown = (keyboardEvent)=> {
            if((keyboardEvent.keyCode === 68)) {
                if(postlayer.viewCameras.length > 0)
                {
                    postlayer.removeVisualField(postlayer.viewCameras[0]);
                }
            }
        }

        this.release = function () {
            if (postlayer.viewCameras.length > 0) {
                postlayer.removeVisualField(postlayer.viewCameras[0]);
            }
        }

    }
}
