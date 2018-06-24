import {RenderPass} from "./RenderPass";
import {TerrainLayer} from "../terrainLayer";
import {ARLayer} from "../arLayer";

class OutLineRenderPass extends RenderPass {
    constructor(scene, camera, rt) {
        super(scene, camera, rt);
        //
        let outLineRenderPass = this;
        //
        this.outlineColor = new THREE.Color(0xffff00);
        let outLineObjs = [];
        let currentOutLineColor;
        //
        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        //
        let replaceMaterial = (material, update = false)=> {
            let tmp = material;
            if (!update)
                tmp = material.clone();
            //
            tmp.needUpdate = true;
            //
            if (material instanceof THREE.MeshBasicMaterial) {
                tmp.color = currentOutLineColor;
                tmp.map = null;
                tmp.lightMap = null;
                tmp.lightMapIntensity = 1.0;
                tmp.aoMap = null;
                tmp.aoMapIntensity = 1.0;
                tmp.specularMap = null;
                tmp.alphaMap = null;
            }
            else if (material instanceof THREE.MeshPhongMaterial) {
                tmp.color = currentOutLineColor;
                tmp.shininess = 0;
                tmp.specular = currentOutLineColor;
                tmp.map = null;
                tmp.lightMap = null;
                tmp.lightMapIntensity = 1.0;
                tmp.aoMap = null;
                tmp.aoMapIntensity = 1.0;
                tmp.emissive = currentOutLineColor;
                tmp.emissiveIntensity = 1.0;
                tmp.emissiveMap = null;
            }
            else if (material instanceof THREE.MeshStandardMaterial) {
                tmp.color = currentOutLineColor;
                tmp.map = null;
                tmp.lightMap = null;
                tmp.lightMapIntensity = 1.0;
                tmp.aoMap = null;
                tmp.aoMapIntensity = 1.0;
                tmp.emissive = currentOutLineColor;
                tmp.emissiveIntensity = 1.0;
                tmp.emissiveMap = null;
            }
            else if (material instanceof THREE.MeshLambertMaterial) {
                tmp.color = currentOutLineColor;
                tmp.map = null;
                tmp.lightMap = null;
                tmp.lightMapIntensity = 1.0;
                tmp.aoMap = null;
                tmp.aoMapIntensity = 1.0;
                tmp.emissive = currentOutLineColor;
                tmp.emissiveIntensity = 1.0;
                tmp.emissiveMap = null;
            }
            else if (material instanceof THREE.LineBasicMaterial) {
                tmp.color = currentOutLineColor;
            }
            else if (material instanceof THREE.PointsMaterial) {
                tmp.color = currentOutLineColor;
            }
            else if (material instanceof THREE.SpriteMaterial) {
                tmp.color = currentOutLineColor;
                tmp.map = null;
            }
            else if (material instanceof THREE.ShaderMaterial) {
                let frag = tmp.fragmentShader;
                let end = frag.lastIndexOf('}');
                tmp.fragmentShader =
                    frag.substr(0, end) + "gl_FragColor = vec4(" + currentOutLineColor.r + "," + currentOutLineColor.g + "," + currentOutLineColor.b + ",1);}";
            }
            //
            return tmp;
        };
        let materialReplace = (object)=>{
            currentOutLineColor = object.outlineColor ? object.outlineColor : this.outlineColor;
            //
            if(object.material) {
                if(object.maskMaterial) {
                    if(object.maskMaterial instanceof  Array) {
                        for(let i=0; i<object.maskMaterial.length; ++i) {
                            replaceMaterial(object.maskMaterial[i], true);
                        }
                    }
                    else
                        replaceMaterial(object.maskMaterial, true);
                    //
                    return;
                }
                object.originalMaterial = object.material;
                //
                if(object.material instanceof Array) {
                    object.maskMaterial = [];
                    for(let i=0; i<object.material.length; ++i) {
                        object.maskMaterial.push(replaceMaterial(object.material[i], false));
                    }
                }
                else {
                    object.maskMaterial = replaceMaterial(object.material, false);
                }
            }
            else if(object.children.length>0) {
                for (let i = 0; i < object.children.length; ++i) {
                    materialReplace(object.children[i]);
                }
            }
        };

        let recoverMaterial = (object)=> {
            if(object.maskMaterial) {
                object.material = object.originalMaterial;
                //
                if(object.maskMaterial instanceof  Array) {
                    for(let i=0; i<object.maskMaterial.length; ++i) {
                        object.maskMaterial[i].dispose();
                    }
                }
                else
                    object.maskMaterial.dispose();
                //
                delete object.maskMaterial;
                delete object.originalMaterial;
            }
            else if(object.children.length>0) {
                for (let i = 0; i < object.children.length; ++i) {
                    recoverMaterial(object.children[i]);
                }
            }
        }
        //
        let noSelectUnVisibleObjs = [];
        //
        let  outlineObjDepthRT = new THREE.WebGLRenderTarget(renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars);
        outlineObjDepthRT.texture.generateMipmaps = false;
        outlineObjDepthRT.depthTexture = new THREE.DepthTexture(renderer.domElement.clientWidth, renderer.domElement.clientHeight,
            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
        let outlineObjDepthRenderPass = new RenderPass(scene, camera);
        outlineObjDepthRenderPass.outLineObjs = outLineObjs;
        outlineObjDepthRenderPass.render = function (renderer) {
            this.scene = outLineRenderPass.scene;
            this.camera = outLineRenderPass.camera;
            //
            if(this.outLineObjs.length === 0)
                return false;
            //
            noSelectUnVisibleObjs = [];
            //
            let unvisibleNoSelectObjs = (object)=>{
                if(this.outLineObjs.indexOf(object) >= 0) {
                    object.visible = true;
                    return;
                }
                //
                if(!object.visible)
                    return;
                //
                if(object instanceof TerrainLayer || object instanceof ARLayer) {
                    object.visible = false;
                    noSelectUnVisibleObjs.push(object);
                }
                else if(object instanceof THREE.Mesh || object instanceof THREE.Line ||
                    object instanceof THREE.Points || object instanceof THREE.Sprite) {
                    object.visible = false;
                    noSelectUnVisibleObjs.push(object);
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        unvisibleNoSelectObjs(object.children[i]);
                    }
                }
            }
            unvisibleNoSelectObjs(this.scene);
            //
            let setMaskMaterial = (object)=> {
                if(object.maskMaterial) {
                    object.material = object.maskMaterial;
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        setMaskMaterial(object.children[i]);
                    }
                }
            }
            for(let i=0; i<this.outLineObjs.length; ++i) {
                materialReplace(this.outLineObjs[i]);
                setMaskMaterial(this.outLineObjs[i]);
            }
            //
            renderer.render(this.scene, this.camera, outlineObjDepthRT);
            //
            let unsetMaskMaterial = (object)=> {
                if(object.maskMaterial) {
                    object.material = object.originalMaterial;
                }
                else if(object.children.length>0) {
                    for(let i=0; i<object.children.length; ++i) {
                        unsetMaskMaterial(object.children[i]);
                    }
                }
            }
            for(let i=0; i<this.outLineObjs.length; ++i) {
                unsetMaskMaterial(this.outLineObjs[i]);
            }
            //
            return true;
        }
        //
        let getMaskMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "depthTexture0": { value: null },
                    "depthTexture1": { value: null },
                    "colorMask": {value: null},
                    "cameraNear": { value: 1.0 },
                    "cameraFar": { value: 100000.0 },
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "#include <packing>\
                    varying vec2 vUv;\
                    uniform float cameraNear;\
                    uniform float cameraFar;\
                    uniform sampler2D depthTexture0;\
                    uniform sampler2D depthTexture1;\
                    uniform sampler2D colorMask;\
                    \
                    void main() {\
                        vec4 color = texture2D( colorMask, vUv);\
                        float d0 = texture2D( depthTexture0, vUv.st).x;\
                        float viewZ = perspectiveDepthToViewZ( d0, cameraNear, cameraFar );\
                        d0 = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\
                        float d1 = texture2D( depthTexture1, vUv.st).x;\
                        viewZ = perspectiveDepthToViewZ( d1, cameraNear, cameraFar );\
                        d1 = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\
                        float delta = abs(d1 - d0);\
                        if(d1 > 0.99)\
                           gl_FragColor = vec4(0,0,0,0);\
                        else if(delta < 0.000001)\
                            gl_FragColor = vec4(color.r,color.g,color.b,0.02);\
                        else\
                            gl_FragColor = vec4(color.r,color.g,color.b,1.0);\
                    }"
            } );
        };
        //
        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        let tmpScene = new THREE.Scene();
        let geom = new THREE.BufferGeometry();
        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
        let quad = new THREE.Mesh( geom, getMaskMaterial() );
        quad.material.depthTest = false;
        quad.material.depthWrite = false;
        quad.drawMode = THREE.TriangleFanDrawMode;
        quad.frustumCulled = false;
        tmpScene.add( quad );
        //
        let outlineObjMaskRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars );
        outlineObjMaskRT.texture.generateMipmaps = false;

        let outlineObjMaskRenderPass = new RenderPass(tmpScene, orthoCamera);
        outlineObjMaskRenderPass.outLineObjs = outLineObjs;
        outlineObjMaskRenderPass.renderCamera = this.camera;
        outlineObjMaskRenderPass.render = function (renderer) {
            let frustum = this.renderCamera.isPerspectiveCamera ? this.renderCamera.projectionMatrix.getFrustum() : this.renderCamera.projectionMatrix.getOrtho();
            quad.material.uniforms[ "depthTexture0" ].value = offScreenRT.depthTexture;
            quad.material.uniforms[ "depthTexture1" ].value = outlineObjDepthRT.depthTexture;
            quad.material.uniforms[ "colorMask"].value = outlineObjDepthRT.texture;
            quad.material.uniforms[ "cameraNear" ].value = frustum.zNear;
            quad.material.uniforms[ "cameraFar" ].value = frustum.zFar;
            //
            renderer.render(this.scene, this.camera, outlineObjMaskRT);
            //
            return true;
        };
        //
        let getOutLineMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "maskTexture": { value: null },
                    "edgeColor": { value: new THREE.Vector3( 1.0, 1.0, 0.0 ) },
                    "resolution": { value: new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight)},
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "varying vec2 vUv;\
                    uniform sampler2D maskTexture;\
                    uniform vec2 resolution;\
                    uniform vec3 edgeColor;\
                    \
                    void main() {\n\
                        vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );\
                        vec4 outlineColor = vec4(1,1,1,1);\
                        \
                        vec4 c00 = texture2D( maskTexture, vUv + texel * vec2( -2, -2 ) );\
                        outlineColor = c00.a > 0.01 ? c00 : outlineColor;\
                        vec4 c01 = texture2D( maskTexture, vUv + texel * vec2( -1, -2 ) );\
                        outlineColor = c01.a > 0.01 ? c01 : outlineColor;\
                        vec4 c02 = texture2D( maskTexture, vUv + texel * vec2( 0, -2 ) );\
                        outlineColor = c02.a > 0.01 ? c02 : outlineColor;\
                        vec4 c03 = texture2D( maskTexture, vUv + texel * vec2( 1, -2 ) );\
                        outlineColor = c03.a > 0.01 ? c03 : outlineColor;\
                        vec4 c04 = texture2D( maskTexture, vUv + texel * vec2( 2, -2 ) );\
                        outlineColor = c04.a > 0.01 ? c04 : outlineColor;\
                        \
                        vec4 c10 = texture2D( maskTexture, vUv + texel * vec2( -2, -1 ) );\
                        outlineColor = c10.a > 0.01 ? c10 : outlineColor;\
                        vec4 c11 = texture2D( maskTexture, vUv + texel * vec2( -1, -1 ) );\
                        outlineColor = c11.a > 0.01 ? c11 : outlineColor;\
                        vec4 c12 = texture2D( maskTexture, vUv + texel * vec2( 0, -1 ) );\
                        outlineColor = c12.a > 0.01 ? c12 : outlineColor;\
                        vec4 c13 = texture2D( maskTexture, vUv + texel * vec2( 1, -1 ) );\
                        outlineColor = c13.a > 0.01 ? c13 : outlineColor;\
                        vec4 c14 = texture2D( maskTexture, vUv + texel * vec2( 2, -1 ) );\
                        outlineColor = c14.a > 0.01 ? c14 : outlineColor;\
                        vec4 c20 = texture2D( maskTexture, vUv + texel * vec2( -2, 0 ) );\
                        outlineColor = c20.a > 0.01 ? c20 : outlineColor;\
                        vec4 c21 = texture2D( maskTexture, vUv + texel * vec2( -1, 0 ) );\
                        outlineColor = c21.a > 0.01 ? c21 : outlineColor;\
                        vec4 c22 = texture2D( maskTexture, vUv + texel * vec2( 0, 0 ) );\
                        outlineColor = c22.a > 0.01 ? c22 : outlineColor;\
                        vec4 c23 = texture2D( maskTexture, vUv + texel * vec2( 1, 0 ) );\
                        outlineColor = c23.a > 0.01 ? c23 : outlineColor;\
                        vec4 c24 = texture2D( maskTexture, vUv + texel * vec2( 2, 0 ) );\
                        outlineColor = c24.a > 0.01 ? c24 : outlineColor;\
                        \
                        vec4 c30 = texture2D( maskTexture, vUv + texel * vec2( -2, 1 ) );\
                        outlineColor = c30.a > 0.01 ? c30 : outlineColor;\
                        vec4 c31 = texture2D( maskTexture, vUv + texel * vec2( -1, 1 ) );\
                        outlineColor = c31.a > 0.01 ? c31 : outlineColor;\
                        vec4 c32 = texture2D( maskTexture, vUv + texel * vec2( 0, 1 ) );\
                        outlineColor = c32.a > 0.01 ? c32 : outlineColor;\
                        vec4 c33 = texture2D( maskTexture, vUv + texel * vec2( 1, 1 ) );\
                        outlineColor = c33.a > 0.01 ? c33 : outlineColor;\
                        vec4 c34 = texture2D( maskTexture, vUv + texel * vec2( 2, 1 ) );\
                        outlineColor = c34.a > 0.01 ? c34 : outlineColor;\
                        \
                        vec4 c40 = texture2D( maskTexture, vUv + texel * vec2( -2, 2 ) );\
                        outlineColor = c40.a > 0.01 ? c40 : outlineColor;\
                        vec4 c41 = texture2D( maskTexture, vUv + texel * vec2( -1, 2 ) );\
                        outlineColor = c41.a > 0.01 ? c41 : outlineColor;\
                        vec4 c42 = texture2D( maskTexture, vUv + texel * vec2( 0, 2 ) );\
                        outlineColor = c42.a > 0.01 ? c42 : outlineColor;\
                        vec4 c43 = texture2D( maskTexture, vUv + texel * vec2( 1, 2 ) );\
                        outlineColor = c43.a > 0.01 ? c43 : outlineColor;\
                        vec4 c44 = texture2D( maskTexture, vUv + texel * vec2( 2, 2 ) );\
                        outlineColor = c44.a > 0.01 ? c44 : outlineColor;\
                        \
                        vec4 sum = c00+c01+c02+c03+c04+c10+c11+c12+c13+c14+c20+c21+c22+c23+c24+c30+c31+c32+c33+c34+c40+c41+c42+c43+c44;\
                        if(c22.a < 0.01)\
                            gl_FragColor = (sum.a > 0.01 && sum.a < 0.9) ? vec4(outlineColor.rgb, 1) : vec4(0,0,0,0);\
                        else\
                            gl_FragColor = vec4(0,0,0,0);\
                    }"
            } );
        };

        let quad1 = new THREE.Mesh( geom, getOutLineMaterial() );
        quad1.drawMode = THREE.TriangleFanDrawMode;
        quad1.frustumCulled = false;
        let tmpScene1 = new THREE.Scene();
        tmpScene1.add(quad1);

        let outLineRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars );
        outLineRT.texture.name = "outline";
        outLineRT.texture.generateMipmaps = false;

        let outlineGeneratePass = new RenderPass(tmpScene1, orthoCamera);
        outlineGeneratePass.render = function (renderer) {
            quad1.material.uniforms[ "maskTexture" ].value = outlineObjMaskRT.texture;
            quad1.material.uniforms[ "edgeColor" ].value = new THREE.Vector3( 1.0, 1.0, 0.0 );
            quad1.material.uniforms[ "resolution" ].value = new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
            //
            renderer.render(this.scene, this.camera, outLineRT);
            //
            return true;
        }
        //
        let screenImgRT = new THREE.WebGLRenderTarget( renderer.domElement.clientWidth, renderer.domElement.clientHeight, pars);
        screenImgRT.texture.name = "screenImg";
        screenImgRT.texture.generateMipmaps = false;
        let getOutPutMaterial = ()=> {
            return new THREE.ShaderMaterial( {
                uniforms: {
                    "color0": { value: null },
                    "color1": { value: null },
                },

                vertexShader:
                    "varying vec2 vUv;\n\
                    void main() {\n\
                        vUv = uv;\n\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                    }",

                fragmentShader:
                    "varying vec2 vUv;\
                    uniform sampler2D color0;\
                    uniform sampler2D color1;\
                    \
                    void main() {\n\
                        vec4 c0 = texture2D( color0, vUv);\
                        vec4 c1 = texture2D( color1, vUv);\
                        gl_FragColor = c1.a > 0.5 ? c1 : c0;\
                    }"
            } );
        };

        let quad2 = new THREE.Mesh( geom, getOutPutMaterial() );
        quad2.material.depthTest = false;
        quad2.material.depthWrite = false;
        quad2.drawMode = THREE.TriangleFanDrawMode;
        quad2.frustumCulled = false;
        let tmpScene2 = new THREE.Scene();
        tmpScene2.add(quad2);
        let outLineMergeRenderPass = new RenderPass(tmpScene2, orthoCamera);
        outLineMergeRenderPass.render = function (renderer) {
            let offScreenRT = outLineRenderPass.renderTarget;
            //
            quad2.material.uniforms[ "color0" ].value = offScreenRT.texture;
            quad2.material.uniforms[ "color1" ].value = outLineRT.texture;
            //
            renderer.render(this.scene, this.camera, screenImgRT);
            //
            renderer.setTexture2D( offScreenRT.texture, 0 );
            renderer.context.copyTexImage2D( renderer.context.TEXTURE_2D, 0, renderer.context.RGBA, 0, 0, offScreenRT.width, offScreenRT.height, 0 );
            //
            for(let i=0; i<noSelectUnVisibleObjs.length; ++i) {
                noSelectUnVisibleObjs[i].visible = true;
            }
            return true;
        };
        //
        this.render = (renderer)=> {
            if(!this.renderTarget)
                return false;
            //
            this.outLineObjs = [];
            let layers = this.scene.getPostLayer('OutLineObjLayer');
            for(let i=0; i<layers.length; ++i) {
                this.outLineObjs = this.outLineObjs.concat(layers[i].layer.getOutLineObjs());
            }
            //
            if(outlineObjDepthRenderPass.render(renderer)) {
                outlineObjMaskRenderPass.render(renderer);
                outlineGeneratePass.render(renderer);
                outLineMergeRenderPass.render(renderer);
            }
            //
            return true;
        };
        //
        this.setSize = function (width, height) {
            outlineObjDepthRT.setSize(width, height);
            outlineObjMaskRT.setSize(width, height);
            outLineRT.setSize(width, height);
            screenImgRT.setSize(width, height);
        }
        //
        this.release = function () {
            screenImgRT.texture.dispose();
            screenImgRT.dispose();

            outlineObjDepthRT.texture.dispose();
            outlineObjDepthRT.depthTexture.dispose();
            outlineObjDepthRT.dispose();

            outlineObjMaskRT.texture.dispose();
            outlineObjMaskRT.dispose();

            outLineRT.texture.dispose();
            outLineRT.dispose();
        }
    }
};

export {OutLineRenderPass};