(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.tjh = global.tjh || {}, global.tjh.ar = {})));
}(this, (function (exports) { 'use strict';

	class FitTerrainMaterial
	{
	    constructor() {

	    }

	    getMeshMaterial(mode) {
	        if(mode === 1)
	        {
	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z01 > z00 ? z01 : z00;',
	                    '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z02 > z00 ? z02 : z00;',
	                    '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z10 > z00 ? z10 : z00;',
	                    '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z00 = z11 > z00 ? z11 : z00;',
	                    '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z12 > z00 ? z12 : z00;',
	                    '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z20 > z00 ? z20 : z00;',
	                    '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z21 > z00 ? z21 : z00;',
	                    '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z22 > z00 ? z22 : z00;',
	                    '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }else if(mode === 3)
	        {

	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z01 < z00 ? z01 : z00;',
	                    '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z02 < z00 ? z02 : z00;',
	                    '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z10 < z00 ? z10 : z00;',
	                    '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z00 = z11 < z00 ? z11 : z00;',
	                    '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z12 < z00 ? z12 : z00;',
	                    '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z20 < z00 ? z20 : z00;',
	                    '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z21 < z00 ? z21 : z00;',
	                    '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z22 < z00 ? z22 : z00;',
	                    '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }
	        else if(mode === 2)
	        {

	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z = orthographicDepthToViewZ(z , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }
	        return new THREE.ShaderMaterial( {
	            uniforms: {
	                "size" : {value : 1},
	                "scale": {value: 1},
	                "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                "opacity" : {value: 1},
	                "depthTexture": { value: null },
	                "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                "textureMatrix": {value: null},
	                "depthCameraNearFar": {value: null},
	                "textureSize": {value: new THREE.Vector2(1,1)},
	            },

	            vertexShader:[
	                'uniform float size;' ,
	                'uniform float scale;' ,
	                'uniform sampler2D depthTexture;',
	                'uniform vec2 textureSize;',
	                'uniform vec4 textureRange;',
	                'uniform mat4 textureMatrix;',
	                'uniform vec2 depthCameraNearFar;',
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_vertex>' ,
	                '#include <fog_pars_vertex>' ,
	                '#include <shadowmap_pars_vertex>' ,
	                '#include <logdepthbuf_pars_vertex>' ,
	                '#include <clipping_planes_pars_vertex>' ,
	                'void main() {' ,
	                '  #include <color_vertex>' ,
	                '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                '     vec4 texCoord = textureMatrix*ps;',
	                '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z01 < z00 ? z01 : z00;',
	                '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z02 < z00 ? z02 : z00;',
	                '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                '     z00 = z10 < z00 ? z10 : z00;',
	                '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                '     z00 = z11 < z00 ? z11 : z00;',
	                '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                '     z00 = z12 < z00 ? z12 : z00;',
	                '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z20 < z00 ? z20 : z00;',
	                '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z21 < z00 ? z21 : z00;',
	                '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z22 < z00 ? z22 : z00;',
	                '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                '  }',
	                '  else {',
	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                '  }',
	                '  #ifdef USE_SIZEATTENUATION' ,
	                '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                '  #else' ,
	                '    gl_PointSize = size;' ,
	                '  #endif' ,
	                '  #include <logdepthbuf_vertex>' ,
	                '  #include <clipping_planes_vertex>' ,
	                '  #include <worldpos_vertex>' ,
	                '  #include <shadowmap_vertex>' ,
	                '  #include <fog_vertex>' ,
	                '  ',
	                '}'
	            ].join('\n'),

	            fragmentShader: [
	                'uniform vec3 diffuse;' ,
	                'uniform float opacity;' ,
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_fragment>' ,
	                '#include <map_particle_pars_fragment>' ,
	                '#include <fog_pars_fragment>' ,
	                '#include <shadowmap_pars_fragment>' ,
	                '#include <logdepthbuf_pars_fragment>' ,
	                '#include <clipping_planes_pars_fragment>' ,
	                'void main() {' ,
	                '  #include <clipping_planes_fragment>' ,
	                '  vec3 outgoingLight = vec3( 0.0 );' ,
	                '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                '  #include <logdepthbuf_fragment>' ,
	                '  #include <map_particle_fragment>' ,
	                '  #include <color_fragment>' ,
	                '  #include <alphatest_fragment>' ,
	                '  outgoingLight = diffuseColor.rgb;' ,
	                '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                '  #include <premultiplied_alpha_fragment>' ,
	                '  #include <tonemapping_fragment>' ,
	                '  #include <encodings_fragment>' ,
	                '  #include <fog_fragment>' ,
	                '}'
	            ].join('\n')
	        } );
	    }

	    getLineMaterial(mode) {

	        if(mode == 0) {
	            // 贴合地面
	            return new THREE.LineMaterialWithDepthMap({
	                dashed: false
	            });
	        }
	        else if(mode === 1)
	        {
	            // 贴合地面
	            return new THREE.LineMaterialWithDepthMap({
	                dashed: false
	            });
	        }else if(mode === 2)
	        {
	            // 贴合地形高层
	            return new THREE.LineMaterialWithDepthMap({
	                dashed: false
	            });
	        }
	        // 贴合地面
	        return new THREE.LineMaterial({
	            dashed: false
	        });
	    }

	    getPointsMaterial(mode) {
	        if(mode === 1)
	        {
	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z01 > z00 ? z01 : z00;',
	                    '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z02 > z00 ? z02 : z00;',
	                    '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z10 > z00 ? z10 : z00;',
	                    '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z00 = z11 > z00 ? z11 : z00;',
	                    '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z12 > z00 ? z12 : z00;',
	                    '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z20 > z00 ? z20 : z00;',
	                    '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z21 > z00 ? z21 : z00;',
	                    '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z22 > z00 ? z22 : z00;',
	                    '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  float dist = distance(gl_PointCoord, vec2(0.5,0.5));',
	                    '  if(dist > 0.5){',
	                    '  discard;}',
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }else if(mode === 3)
	        {

	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z01 < z00 ? z01 : z00;',
	                    '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z02 < z00 ? z02 : z00;',
	                    '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z10 < z00 ? z10 : z00;',
	                    '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z00 = z11 < z00 ? z11 : z00;',
	                    '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                    '     z00 = z12 < z00 ? z12 : z00;',
	                    '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z20 < z00 ? z20 : z00;',
	                    '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z21 < z00 ? z21 : z00;',
	                    '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                    '     z00 = z22 < z00 ? z22 : z00;',
	                    '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  float dist = distance(gl_PointCoord, vec2(0.5,0.5));',
	                    '  if(dist > 0.5){',
	                    '  discard;}',
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }
	        else if(mode === 2)
	        {

	            return new THREE.ShaderMaterial( {
	                uniforms: {
	                    "size" : {value : 1},
	                    "scale": {value: 1},
	                    "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                    "opacity" : {value: 1},
	                    "depthTexture": { value: null },
	                    "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                    "textureMatrix": {value: null},
	                    "depthCameraNearFar": {value: null},
	                    "textureSize": {value: new THREE.Vector2(1,1)},
	                },

	                vertexShader:[
	                    'uniform float size;' ,
	                    'uniform float scale;' ,
	                    'uniform sampler2D depthTexture;',
	                    'uniform vec2 textureSize;',
	                    'uniform vec4 textureRange;',
	                    'uniform mat4 textureMatrix;',
	                    'uniform vec2 depthCameraNearFar;',
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_vertex>' ,
	                    '#include <fog_pars_vertex>' ,
	                    '#include <shadowmap_pars_vertex>' ,
	                    '#include <logdepthbuf_pars_vertex>' ,
	                    '#include <clipping_planes_pars_vertex>' ,
	                    'void main() {' ,
	                    '  #include <color_vertex>' ,
	                    '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                    '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                    '     vec4 texCoord = textureMatrix*ps;',
	                    '     float z = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                    '     z = orthographicDepthToViewZ(z , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                    '  }',
	                    '  else {',
	                    '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                    '  }',
	                    '  #ifdef USE_SIZEATTENUATION' ,
	                    '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                    '  #else' ,
	                    '    gl_PointSize = size;' ,
	                    '  #endif' ,
	                    '  #include <logdepthbuf_vertex>' ,
	                    '  #include <clipping_planes_vertex>' ,
	                    '  #include <worldpos_vertex>' ,
	                    '  #include <shadowmap_vertex>' ,
	                    '  #include <fog_vertex>' ,
	                    '  ',
	                    '}'
	                ].join('\n'),

	                fragmentShader: [
	                    'uniform vec3 diffuse;' ,
	                    'uniform float opacity;' ,
	                    '#include <common>' ,
	                    '#include <packing>' ,
	                    '#include <color_pars_fragment>' ,
	                    '#include <map_particle_pars_fragment>' ,
	                    '#include <fog_pars_fragment>' ,
	                    '#include <shadowmap_pars_fragment>' ,
	                    '#include <logdepthbuf_pars_fragment>' ,
	                    '#include <clipping_planes_pars_fragment>' ,
	                    'void main() {' ,
	                    '  float dist = distance(gl_PointCoord, vec2(0.5,0.5));',
	                    '  if(dist > 0.5){',
	                    '  discard;}',
	                    '  #include <clipping_planes_fragment>' ,
	                    '  vec3 outgoingLight = vec3( 0.0 );' ,
	                    '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                    '  #include <logdepthbuf_fragment>' ,
	                    '  #include <map_particle_fragment>' ,
	                    '  #include <color_fragment>' ,
	                    '  #include <alphatest_fragment>' ,
	                    '  outgoingLight = diffuseColor.rgb;' ,
	                    '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                    '  #include <premultiplied_alpha_fragment>' ,
	                    '  #include <tonemapping_fragment>' ,
	                    '  #include <encodings_fragment>' ,
	                    '  #include <fog_fragment>' ,
	                    '}'
	                ].join('\n')
	            } );
	        }
	        return new THREE.ShaderMaterial( {
	            uniforms: {
	                "size" : {value : 1},
	                "scale": {value: 1},
	                "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                "opacity" : {value: 1},
	                "depthTexture": { value: null },
	                "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                "textureMatrix": {value: null},
	                "depthCameraNearFar": {value: null},
	                "textureSize": {value: new THREE.Vector2(1,1)},
	            },

	            vertexShader:[
	                'uniform float size;' ,
	                'uniform float scale;' ,
	                'uniform sampler2D depthTexture;',
	                'uniform vec2 textureSize;',
	                'uniform vec4 textureRange;',
	                'uniform mat4 textureMatrix;',
	                'uniform vec2 depthCameraNearFar;',
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_vertex>' ,
	                '#include <fog_pars_vertex>' ,
	                '#include <shadowmap_pars_vertex>' ,
	                '#include <logdepthbuf_pars_vertex>' ,
	                '#include <clipping_planes_pars_vertex>' ,
	                'void main() {' ,
	                '  #include <color_vertex>' ,
	                '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                '  if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {',
	                '     vec4 texCoord = textureMatrix*ps;',
	                '     float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z01 < z00 ? z01 : z00;',
	                '     float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z02 < z00 ? z02 : z00;',
	                '     float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                '     z00 = z10 < z00 ? z10 : z00;',
	                '     float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
	                '     z00 = z11 < z00 ? z11 : z00;',
	                '     float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));',
	                '     z00 = z12 < z00 ? z12 : z00;',
	                '     float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z20 < z00 ? z20 : z00;',
	                '     float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z21 < z00 ? z21 : z00;',
	                '     float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));',
	                '     z00 = z22 < z00 ? z22 : z00;',
	                '     z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 , depthCameraNearFar[0], depthCameraNearFar[1]);',

	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z00, 1.0 ) + vec4(0.0,0.0,-0.05,0.0);',
	                '  }',
	                '  else {',
	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                '  }',
	                '  #ifdef USE_SIZEATTENUATION' ,
	                '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                '  #else' ,
	                '    gl_PointSize = size;' ,
	                '  #endif' ,
	                '  #include <logdepthbuf_vertex>' ,
	                '  #include <clipping_planes_vertex>' ,
	                '  #include <worldpos_vertex>' ,
	                '  #include <shadowmap_vertex>' ,
	                '  #include <fog_vertex>' ,
	                '  ',
	                '}'
	            ].join('\n'),

	            fragmentShader: [
	                'uniform vec3 diffuse;' ,
	                'uniform float opacity;' ,
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_fragment>' ,
	                '#include <map_particle_pars_fragment>' ,
	                '#include <fog_pars_fragment>' ,
	                '#include <shadowmap_pars_fragment>' ,
	                '#include <logdepthbuf_pars_fragment>' ,
	                '#include <clipping_planes_pars_fragment>' ,
	                'void main() {' ,
	                '  float dist = distance(gl_PointCoord, vec2(0.5,0.5));',
	                '  if(dist > 0.5){',
	                '  discard;}',
	                '  #include <clipping_planes_fragment>' ,
	                '  vec3 outgoingLight = vec3( 0.0 );' ,
	                '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                '  #include <logdepthbuf_fragment>' ,
	                '  #include <map_particle_fragment>' ,
	                '  #include <color_fragment>' ,
	                '  #include <alphatest_fragment>' ,
	                '  outgoingLight = diffuseColor.rgb;' ,
	                '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                '  #include <premultiplied_alpha_fragment>' ,
	                '  #include <tonemapping_fragment>' ,
	                '  #include <encodings_fragment>' ,
	                '  #include <fog_fragment>' ,
	                '}'
	            ].join('\n')
	        } );
	    }


	    getLabelMaterial() {
	        return new THREE.ShaderMaterial( {
	            uniforms: {
	                "size" : {value : 1},
	                "scale": {value: 1},
	                "diffuse" : {value: new THREE.Vector3(0,1,0)},
	                "opacity" : {value: 1},
	                "depthTexture": { value: null },
	                "textureRange": {value: new THREE.Vector4(0,0,0,0)},
	                "textureMatrix": {value: null},
	                "depthCameraNearFar": {value: null},
	                "textureSize": {value: new THREE.Vector2(1,1)},
	            },

	            vertexShader:[
	                'uniform float size;' ,
	                'uniform float scale;' ,
	                'uniform sampler2D depthTexture;',
	                'uniform vec2 textureSize;',
	                'uniform vec4 textureRange;',
	                'uniform mat4 textureMatrix;',
	                'uniform vec2 depthCameraNearFar;',
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_vertex>' ,
	                '#include <fog_pars_vertex>' ,
	                '#include <shadowmap_pars_vertex>' ,
	                '#include <logdepthbuf_pars_vertex>' ,
	                '#include <clipping_planes_pars_vertex>' ,
	                'void main() {' ,
	                '  #include <color_vertex>' ,
	                '  vec4 ps = modelMatrix * vec4( position, 1.0 );',
	                '  if(ps.x>=textureRange[0] && ps.x<=textureRange[2] && ps.y>=textureRange[1] && ps.y<=textureRange[3]) {',
	                '     vec4 texCoord = textureMatrix*ps;',
	                '     float z = orthographicDepthToViewZ(unpackRGBAToDepth(texture2DProj( depthTexture, texCoord)), depthCameraNearFar[0], depthCameraNearFar[1]);',
	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xy, z+0.05, 1.0 );',
	                '  }',
	                '  else {',
	                '     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );',
	                '  }',
	                '  #ifdef USE_SIZEATTENUATION' ,
	                '    gl_PointSize = size * ( scale / - mvPosition.z );' ,
	                '  #else' ,
	                '    gl_PointSize = size;' ,
	                '  #endif' ,
	                '  #include <logdepthbuf_vertex>' ,
	                '  #include <clipping_planes_vertex>' ,
	                '  #include <worldpos_vertex>' ,
	                '  #include <shadowmap_vertex>' ,
	                '  #include <fog_vertex>' ,
	                '  ',
	                '}'
	            ].join('\n'),

	            fragmentShader: [
	                'uniform vec3 diffuse;' ,
	                'uniform float opacity;' ,
	                '#include <common>' ,
	                '#include <packing>' ,
	                '#include <color_pars_fragment>' ,
	                '#include <map_particle_pars_fragment>' ,
	                '#include <fog_pars_fragment>' ,
	                '#include <shadowmap_pars_fragment>' ,
	                '#include <logdepthbuf_pars_fragment>' ,
	                '#include <clipping_planes_pars_fragment>' ,
	                'void main() {' ,
	                '  #include <clipping_planes_fragment>' ,
	                '  vec3 outgoingLight = vec3( 0.0 );' ,
	                '  vec4 diffuseColor = vec4( diffuse, opacity );' ,
	                '  #include <logdepthbuf_fragment>' ,
	                '  #include <map_particle_fragment>' ,
	                '  #include <color_fragment>' ,
	                '  #include <alphatest_fragment>' ,
	                '  outgoingLight = diffuseColor.rgb;' ,
	                '  gl_FragColor = vec4( outgoingLight, diffuseColor.a );' ,
	                '  #include <premultiplied_alpha_fragment>' ,
	                '  #include <tonemapping_fragment>' ,
	                '  #include <encodings_fragment>' ,
	                '  #include <fog_fragment>' ,
	                '}'
	            ].join('\n')
	        } );
	    }

	}

	class RenderTechnique {
	    constructor(renderer, scene, camera) {
	        this.renderPasses = [];
	        this.domElement = renderer.domElement;
	        this.renderer = renderer ? renderer : new THREE.WebGLRenderer();
	        this.scene = scene;
	        this.camera = camera;
	        //
	        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
	        this.offScreenRT = new THREE.WebGLRenderTarget(this.domElement.clientWidth, this.domElement.clientHeight, pars);
	        this.offScreenRT.texture.generateMipmaps = false;
	        this.offScreenRT.stencilBuffer = true;
	        this.offScreenRT.depthBuffer = true;
	        this.offScreenRT.depthTexture = new THREE.DepthTexture(this.domElement.clientWidth, this.domElement.clientHeight,
	            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
	        //
	        this.screenRT = {width:this.domElement.clientWidth, height:this.domElement.clientHeight, renderToScreen:true};
	    }

	    setRenderResource(renderer, scene, camera) {
	        this.renderer = renderer;
	        this.scene = scene;
	        this.camera = camera;
	    }

	    addRenderPass(renderPass) {
	       this.renderPasses.push(renderPass);
	    }

	    removeRenderPass(renderPass) {
	        let index = this.renderPasses.indexOf(renderPass);
	        if(index >= 0)
	           this.renderPasses.splice(index, 1);
	    }

	    render() {
	        let needPostProcess = false;
	        for(let n=0, length = this.scene.postLayers.length; n<length; ++n) {
	            if(this.scene.postLayers[n].enable && !this.scene.postLayers[n].layer.isEmpty()) {
	                needPostProcess = true;
	                break;
	            }
	        }
	        //
	        let renderTarget = this.screenRT;
	        if(needPostProcess) {
	            renderTarget = this.offScreenRT;
	        }
	        for(let i=0; i<this.renderPasses.length; ++i) {
	            this.renderPasses[i].setRenderResource(this.scene, this.camera, renderTarget);
	            this.renderPasses[i].render(this.renderer);
	        }
	    }

	    setSize(width, height) {
	        this.offScreenRT.setSize(width, height);
	        this.screenRT.width = width;
	        this.screenRT.height = height;
	        //
	        for(let n=0, length = this.renderPasses.length; n<length; ++n) {
	            this.renderPasses[n].setSize(width, height);
	        }
	        //
	        this.renderer.setSize(width, height);
	    }

	    release() {
	        this.offScreenRT.texture.dispose();
	        this.offScreenRT.depthTexture.dispose();
	        this.offScreenRT.dispose();
	        //
	        for(let n=0, length = this.renderPasses.length; n<length; ++n) {
	            this.renderPasses[n].release();
	        }
	    }
	}

	RenderTechnique.postProcessor = new Map();
	//
	RenderTechnique.registPostProcessor = function (name, renderPass, order = 0) {
	    if(!RenderTechnique.postProcessor.has(name)) {
	        RenderTechnique.postProcessor.set(name, {name:name, renderPass:renderPass, order:order});
	        return true;
	    }
	    //
	    return false;
	};
	//
	RenderTechnique.unregistPostProcessor = function (name) {
	    if(RenderTechnique.postProcessor.has(name)) {
	        RenderTechnique.postProcessor.get(name).renderPass.release();
	        RenderTechnique.postProcessor.remove(name);
	        return true;
	    }
	    //
	    return false;
	};

	RenderTechnique.hasPostProcesser = function (name) {
	    if(RenderTechnique.postProcessor.has(name))
	        return true;
	    //
	    return false;
	};

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
	}

	/**
	 * @classdesc 矢量图层
	 * @class
	 * @memberOf tjh.ar
	 * @extends THREE.Group
	 * @param {string} url -矢量数据url
	 * @param {string} modelUrl -模型URL
	 * @param {bool}  isReplaceWithModel -是否使用模型符号化点矢量
	 * @param {tjh.ar.TerrainLayer}  referenceTerrain -地形图层
	 * @param {array} globalOffset -地形全局偏移值
	 */

	class FeatureLayer extends  THREE.Group{
	    constructor(url,mlUrl, isReplaceWithModel,referenceTerrain=[], globalOffset = [0,0,0]) {
	        super();

	        let featureLayer = this;

	        /**
	         * 是否自动更新图层矩阵 matrixAutoUpdate
	         * @type {bool}
	         */
		    this.matrixAutoUpdate = false;

	        /**
	         * 是否一次全部加载 loadAllOnce
	         * @type {bool}
	         */
	        this.loadAllOnce = false;
	        /**
	         * 适量贴合模式
	         * @enum {number}
	         */
	        FeatureLayer.FIT_PATTERN = {
	            /** @description 贴合地形周围低值*/
	            FIT_TERRIAN_LOW: 0,
	            /** @description 贴合地形周围低值*/
	            FIT_TERRIAN_NORMAL: 1,
	            /** @description 贴合地形周围低值*/
	            FIT_TERRIAN_HIGH: 2,
	            /** @description 贴合地形周围低值*/
	            USE_SOURCED_DATA: 3,
	            /** @description 贴合地形周围低值*/
	            ASSIGN_MANUAL: 4,
	            /** @description 贴合地形周围低值*/
	            ASSIGN_PROP: 5,
	        };

	        /**
	         * 是否使用模型对点矢量符号化 isReplaceWithModel
	         * @type {bool}
	         */
	        this.isReplaceWithModel = isReplaceWithModel;

	        /**
	         * 是否对矢量添加标注 labelAvaliable
	         * @type {bool}
	         */
	        this.labelAvaliable = false;

	        /**
	         * 所要显示矢量的 url
	         * @type {string}
	         */
	        this.url = url;

	        /**
	         * 矢量所关联的地形的 referenceTerrain
	         * @type {tjh.ar.TerrainLayer}
	         */
	        this.referenceTerrain = referenceTerrain;
	        let minZ = 0;

	        /**
	         * 可视范围包围盒 boundBox
	         * @type {THREE.Box2}
	         */
	        this.boundBox = new THREE.Box2();

	        /**
	         * 矢量数据服务是否是 WFS
	         * @type {bool}
	         */
	        this.isWFS = false;

	        /**
	         * 矢量数据服务的 version
	         * @type {string}
	         */
	        this.version = "1.0.0";

	        /**
	         * 矢量数据的类型名 typeName
	         * @type {string}
	         */
	        this.typeName = "";

	        /**
	         * FeatureLayer是否已初始化 initialized
	         * @type {bool}
	         */
	        this.initialized = false;

	        /**
	         * 矢量类型 featureType
	         * @type {string}
	         */
	        this.featureType = "";

	        this.memDepthSampler = new MemDepthSampler();


	        // 解析url 参数信息
	        let _url_param_ = url.split("&");
	        if (_url_param_[0].substr(-3, 3).toLocaleLowerCase() === "wfs") {
	            this.isWFS = true;
	        }
	        for (let i = 0; i < _url_param_.length; ++i) {
	            let _param_ = _url_param_[i].split("=");
	            if (_param_.length !== 2)
	                continue;
	            //
	            if (_param_[0].toLocaleLowerCase() === "typename") {
	                this.typeName = _param_[1];
	            }

	            if (_param_[0].toLocaleLowerCase() === "version") {
	                this.version = _param_[1];
	            }
	        }
	        //
	        if (this.isWFS && this.version === "1.0.0") {
	            let url_get_capabilities = _url_param_[0] + "&" + _url_param_[1] + "&request=GetCapabilities";
	            var xhr = new XMLHttpRequest();
	            xhr.open('GET', url_get_capabilities);

	            xhr.onload = function () {
	                if (this.status >= 200 && this.status < 300) {
	                    let xmlDoc = xhr.responseXML;
	                    let root = xmlDoc.documentElement;
	                    let ftTypes = root.getElementsByTagName("FeatureType");
	                    for (let i = 0; i < ftTypes.length; ++i) {
	                        let nameEle = ftTypes[i].getElementsByTagName("Name")[0];
	                        if (nameEle.textContent === featureLayer.typeName) {
	                            let boundEle = ftTypes[i].getElementsByTagName("LatLongBoundingBox")[0];
	                            featureLayer.boundBox.min.x = parseFloat(boundEle.attributes.minx.value) - globalOffset[0];
	                            featureLayer.boundBox.min.y = parseFloat(boundEle.attributes.miny.value) - globalOffset[1];
	                            featureLayer.boundBox.max.x = parseFloat(boundEle.attributes.maxx.value) - globalOffset[0];
	                            featureLayer.boundBox.max.y = parseFloat(boundEle.attributes.maxy.value) - globalOffset[1];

	                            featureLayer.getGrid();
	                            //
	                            featureLayer.initialized = true;
	                            break;
	                        }
	                    }
	                } else {
	                    reject({
	                        status: this.status,
	                        statusText: xhr.statusText
	                    });
	                }
	            };
	            xhr.onerror = function () {
	                reject({
	                    status: this.status,
	                    statusText: xhr.statusText
	                });
	            };
	            xhr.send();

	            // 同步请求矢量类型
	            let url_get_featureType = _url_param_[0] + "&" + _url_param_[1] + "&" + _url_param_[2] + "&request=DescribeFeatureType" + "&outputFormat=application%2Fjson";
	            var xhr2 = new XMLHttpRequest();
	            xhr2.open('GET', url_get_featureType, false);

	            xhr2.onload = function () {
	                if (this.status >= 200 && this.status < 300) {
	                    let strJson = JSON.parse(xhr2.response);
	                    let geom = strJson["featureTypes"][0];
	                    featureLayer.featureType = geom["properties"][0]["type"];
	                } else {
	                    reject({
	                        status: this.status,
	                        statusText: xhr2.statusText
	                    });
	                }
	            };
	            xhr2.onerror = function () {
	                reject({
	                    status: this.status,
	                    statusText: xhr.statusText
	                });
	            };
	            xhr2.send();
	        }

	        /**
	         * 场景相机 camera
	         * @type {null}
	         */
	        this.camera = null;

	        /**
	         * 矢量实时版本 featureVersion
	         * @type {number}
	         */
	        this.featureVersion = 0;

	        let fitTerrainMaterialGen = new FitTerrainMaterial();

	        /**
	         * 矢量数据 features
	         * @type {Map}
	         */
	        this.features = new Map();

	        function MeshObjInfo() {
	            this.meshObj = [];
	            this.meshProp = null;
	            // 控制可见帧数
	            this.lastVisitedFrameNumber = 0;
	        }

	        let featureParseParas = {
	            minBox: new THREE.Box2(),
	            matrixWorld: new THREE.Matrix4(),
	            cameraPos: new THREE.Vector3()
	        };

	        /**
	         * 标注控制 labelControler
	         * @enum
	         */
	        this.labelControler = {
	            /**
	             * 标注可用性设置
	             * @type {function}
	             */
	            setAvaliability : function(valid){
	                featureLayer.avaliable = valid;
	                featureLayer.isReplaceWithModel = !valid;
	            },
	            /**
	             * 标注透明度
	             * @type {number}
	             *
	             */
	            opacity : 1.0,
	            /**
	             * 标注颜色
	             * @type {THREE.Color}
	             */
	            color : new THREE.Color(0xffff00),
	            /**
	             * 标注的面
	             * @type {THREE.DoubleSize}
	             */
	            side : THREE.DoubleSize,
	            /**
	             * 标注字体大小
	             * @type {number}
	             */
	            fontSize : 5,
	            /**
	             * 标注字距
	             * @type {number}
	             */
	            fontDivisions : 2,
	            /**
	             * 标注字体
	             * @type {number}
	             */
	            fontName : "msyh",
	        };


	        /**
	         * @class 特定矢量显示具体细节控制 -- 矢量调节器
	         * @memberOf {tjh.ar.FeatureLayer}
	         */
	        function Regulator() {
	            //
	            /**
	             * 每次矢量转换数量
	             * @type {number}
	             */
	            this.requestNum = 25;
	            //
	            /**
	             * 是否加载矢量
	             */
	            this.isLoadFeature = true;
	            //
	            /**
	             * 颜色
	             * @type {THREE.Color}
	             */
	            this.color = new THREE.Color(0x00ff00);
	            //
	            /**
	             * 透明度
	             * @type {number}
	             */
	            this.opacity = 1.0;
	            //
	            /**
	             * 线宽
	             * @type {number}
	             */
	            this.size = 1;

	            /**
	             * 贴合方式
	             * @type {FeatureLayer.FIT_PATTERN}
	             */
	            this.fitPattern = FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH;

	            //
	            /**
	             * 矢量高值 加载模式 --人工贴合方式ASSIGN_MANUAL
	             * @type {number}
	             */
	            this.highValue = 0.0;

	            /**
	             * 矢量中存储高值的属性 加载模式 --人工贴合方式ASSIGN_PROP
	             * @type {number}
	             */
	            this.highProp = "";
	            //
	            /**
	             * @description 设置高值
	             * @param {number} para 高值
	             */
	            this.setHighValue = (para) => {
	                if ((typeof para) === "string") {
	                    if (para[0] === '[' && para[para.length - 1] === ']') {
	                        let tempProp = para.substr(1, para.length - 2);
	                        if (tempProp !== NaN) {
	                            this.fitPattern = FeatureLayer.FIT_PATTERN.ASSIGN_PROP;
	                            this.highProp = tempProp;
	                        }
	                    }
	                } else if ((typeof para) === "number") {
	                    this.fitPattern = FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL;
	                    this.highValue = para;
	                }
	            };

	            if (featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon") {

	            }
	            else if (featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString") {
	                //
	                /**
	                 * 矢量线加密
	                 */
	                this.denseRate = 1;
	                //
	                /**
	                 * 矢量线虚实
	                 */
	                this.lineDotted = false;
	                this.lineDashSize = 3;
	                this.lineGapSize = 1;
	                this.lineScale = 1;
	            }
	            else if (featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point") {
	                this.model = null;
	                this.modelUrl = mlUrl;
	                this.setReplaceWithModel= (isReplace)=>
	                {
	                    featureLayer.isReplaceWithModel = isReplace;
	                    featureLayer.avaliable = !isReplace;
	                };

	                /**
	                 * 点的符号化
	                 * @memberOf FeatureLayer
	                 * @param {String} url 模型文件url
	                 * @param {Array} pos [x,y,z]
	                 */
	                this.setModelUrl = (url)=>{
	                    if(featureLayer.isReplaceWithModel)
	                    {
	                        var objLoader = new THREE.OBJLoader2();
	                        let materialPath = url.substr(0, url.lastIndexOf('.'))+".mtl";

	                        var callbackOnLoad = ( event )=> {
	                            event.detail.loaderRootNode.isPlantModel = true;
	                            this.model = event.detail.loaderRootNode;
	                            this.model.scale.set(0.1,0.1,0.1);
	                        };

	                        var onLoadMtl = ( materials )=> {
	                            objLoader.setMaterials( materials );
	                            objLoader.load( url, callbackOnLoad, null, null, null, false );
	                        };
	                        objLoader.loadMtl( materialPath, null, onLoadMtl );
	                    }
	                };
	                this.setModelUrl(this.modelUrl);
	            }

	        }

	        /**
	         * 矢量参数调节
	         * @type {tjh.ar.FeatureLayer.Regulator}
	         */
	        this.regulator = new Regulator();

	        /**
	         * @description 初始化矢量的材质，同时每次改变矢量调节器的参数，也应该调用该函数
	         */
	        this.initMaterial = function () {
	            THREE.FontManager.getFont(this.labelControler.fontName);
	            if(this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_LOW
	                || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.FIT_TERRIAN_NORMAL){
	                if(featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point")
	                {
	                    this.pointMaterial = fitTerrainMaterialGen.getPointsMaterial(this.regulator.fitPattern);
	                    this.pointMaterial.uniforms["diffuse"].value =  this.regulator.color;
	                    this.pointMaterial.uniforms["opacity"].value = this.regulator.opacity;
	                    this.pointMaterial.uniforms["size"].value = this.regulator.size;
	                    this.pointMaterial.polygonOffset = true;
	                    this.pointMaterial.polygonOffsetFactor = -10;
	                    this.pointMaterial.polygonOffsetUnits = -10;
	                    this.pointMaterial.transparent = true;
	                }

	                if(featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString")
	                {
	                    this.lineMaterial = fitTerrainMaterialGen.getLineMaterial(this.regulator.fitPattern);
	                    this.lineMaterial.color =  this.regulator.color;
	                    this.lineMaterial.uniforms["opacity"].value = this.regulator.opacity;
	                    this.lineMaterial.uniforms["linewidth"].value = this.regulator.size;
	                    this.lineMaterial.polygonOffset = true;
	                    this.lineMaterial.polygonOffsetFactor = -10;
	                    this.lineMaterial.polygonOffsetUnits = -10;
	                    this.lineMaterial.transparent = true;
	                }


	                if(featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon")
	                {
	                    this.polygonMaterial = fitTerrainMaterialGen.getMeshMaterial(this.regulator.fitPattern);
	                    this.polygonMaterial.uniforms["diffuse"].value =  this.regulator.color;
	                    this.polygonMaterial.uniforms["opacity"].value = this.regulator.opacity;
	                    this.polygonMaterial.uniforms["size"].value = this.regulator.size;
	                    this.polygonMaterial.polygonOffset = true;
	                    this.polygonMaterial.polygonOffsetFactor = -10;
	                    this.polygonMaterial.polygonOffsetUnits = -10;
	                    this.polygonMaterial.transparent = true;
	                }
	            }
	            else if(this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.USE_SOURCED_DATA||this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL || this.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
	            {
	                if(featureLayer.featureType === "gml:MultiPoint" || featureLayer.featureType === "gml:Point")
	                {
	                    this.pointMaterial = new THREE.PointsMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity});
	                    this.pointMaterial.polygonOffset = true;
	                    this.pointMaterial.polygonOffsetFactor = -10;
	                    this.pointMaterial.polygonOffsetUnits = -10;
	                }
	                if(featureLayer.featureType === "gml:MultiLineString" || featureLayer.featureType === "gml:LineString")
	                {
	                    this.lineMaterial = fitTerrainMaterialGen.getLineMaterial(this.regulator.fitPattern);
	                    this.lineMaterial.color =  this.regulator.color;
	                    this.lineMaterial.uniforms["opacity"].value = this.regulator.opacity;
	                    this.lineMaterial.uniforms["linewidth"].value = this.regulator.size;
	                    this.lineMaterial.polygonOffset = true;
	                    this.lineMaterial.polygonOffsetFactor = -10;
	                    this.lineMaterial.polygonOffsetUnits = -10;
	                    this.lineMaterial.transparent = true;
	                }
	                if(featureLayer.featureType === "gml:MultiPolygon" || featureLayer.featureType === "gml:Polygon") {
	                    this.polygonMaterial = new THREE.MeshBasicMaterial({color: this.regulator.color, transparent:true, opacity: this.regulator.opacity});
	                    this.polygonMaterial.polygonOffset = true;
	                    this.polygonMaterial.polygonOffsetFactor = -10;
	                    this.polygonMaterial.polygonOffsetUnits = -10;
	                }
	            }
	            //
	            if(this.pointMaterial) {
	                this.pointMaterial.unDisposable = true;
	            }
	            if(this.lineMaterial) {
	                this.lineMaterial.unDisposable = true;
	            }
	            if(this.polygonMaterial) {
	                this.polygonMaterial.unDisposable = true;
	            }
	            //
	            this.labelMaterial = fitTerrainMaterialGen.getLabelMaterial();
	            this.labelMat = new THREE.MeshBasicMaterial({
	                color: featureLayer.labelControler.color,
	                transparent: true,
	                opacity: featureLayer.labelControler.opacity,
	                side: THREE.DoubleSide,
	            });
	            this.labelMat.unDisposable = true ;
	            {
	                this.labelMaterial.uniforms["diffuse"].value =  new THREE.Color(1.0,0.0,0.0);
	                this.labelMaterial.uniforms["opacity"].value = this.regulator.opacity;
	                this.labelMaterial.uniforms["size"].value = 4;
	                this.labelMaterial.transparent = true;
	            }

	            // 清空所有的feature
	            for(let [fkey, fvalue] of featureLayer.features)
	            {
	                for(let fv = 0, fvlen = fvalue.meshObj.length; fv < fvlen; ++fv)
	                {
	                    fvalue.meshObj[fv].dispose();
	                    featureLayer.remove(fvalue.meshObj[fv]);
	                    fvalue.meshObj = [];
	                }
	                featureLayer.features.delete(fkey);
	            }
	        };
	        this.initMaterial();

	        //
	        let cameraPos = new THREE.Vector3();

	        /**
	         * 下载的根据可视范围裁剪后的矢量数据
	         * @type {array}
	         */
	        this.downlaodFeatures = [];


	        THREE.FontManager.getFont(this.labelControler.fontName);

	        /**
	         * 创建矢量标注
	         */
	        let createLabel = (text, position)=>{
	            let labelPos = new THREE.Vector3(position[0],position[1],position[2]);
	            if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
	                let z = featureLayer.memDepthSampler.getZ(labelPos.x, labelPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
	                if(z !== featureLayer.memDepthSampler.noValue) {
	                    labelPos.z = z;
	                }
	            }
	            else if(featureLayer.regulator.fitPattern === 4 || featureLayer.regulator.fitPattern === 5)
	            {
	                labelPos.z = featureLayer.regulator.highValue;
	            }
	            else if(featureLayer.regulator.fitPattern === 3)
	            {
	                labelPos.z = position[2];
	            }
	            // 标注
	            let tmpFont = THREE.FontManager.getFont(this.labelControler.fontName);
	            if(tmpFont !== null) {
	                let textShape = new THREE.BufferGeometry();
	                let shapes = tmpFont.generateShapes(text, featureLayer.labelControler.fontSize, featureLayer.labelControler.fontDivisions);
	                let geom = new THREE.ShapeGeometry(shapes);
	                geom.computeBoundingBox();
	                let xMid = -0.5 * (geom.boundingBox.max.x - geom.boundingBox.min.x);

	                geom.translate(xMid, 0, 0);
	                textShape.fromGeometry(geom);
	                //
	                geom.dispose();
	                geom = null;
	                //
	                let textMat = featureLayer.labelMat;

	                let textMesh = new THREE.Mesh(textShape, textMat);

	                textMesh.position.copy(labelPos);

	                textMesh.frustumCulled = false;
	                textMesh.visible = true;
	                //featureLayer.add(textMesh);
	                textMesh.updateMatrixWorld(true);
	                textMesh.isLabel = true;

	                return textMesh;

	            }
	            else
	                return null;
	        };
	        /**
	         * 创建点的替代模型
	         */
	        let createModel = (position)=>{
	            let modelPos = new THREE.Vector3(position[0],position[1],position[2]);
	            if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
	                let z = featureLayer.memDepthSampler.getZ(modelPos.x, modelPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
	                if(z !== featureLayer.memDepthSampler.noValue) {
	                    modelPos.z = z;
	                }
	            }
	            else if(featureLayer.regulator.fitPattern === 4 || featureLayer.regulator.fitPattern === 5)
	            {
	                modelPos.z = featureLayer.regulator.highValue;
	            }
	            else if(featureLayer.regulator.fitPattern === 3)
	            {
	                modelPos.z = position[2];
	            }
	            // 模型
	            let modelClone = featureLayer.regulator.model.clone();
	            modelClone.position.copy(modelPos);
	            modelClone.isModel = true;
	            return modelClone;
	        };

	        /**
	         * 转化downlaodFeatures中的数据为矢量
	         */
	        let parseMethod = function meshParse() {
	            for(let n=0, length = featureLayer.downlaodFeatures.length; n<length; ++n) {
	                let dkey = featureLayer.downlaodFeatures[n].featureType;
	                let dvalue = featureLayer.downlaodFeatures[n].data;
	                //
	                if ((dkey === "Point" || dkey === "MultiPoint") && dvalue.version === featureLayer.featureVersion) {
	                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
	                        let jsonFt = dvalue.features[i].ft;
	                        let featureProp = jsonFt["properties"];
	                        featureProp.id = jsonFt["id"];
	                        if (featureLayer.features.has(featureProp.id)) {
	                            continue;
	                        }
	                        //
	                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
	                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
	                        //
	                        let geom = jsonFt["geometry"];
	                        //
	                        let pointObjInfo = new MeshObjInfo();

	                        let pointGeom = new THREE.BufferGeometry();

	                        let coord = geom["coordinates"];

	                        pointGeom.addAttribute('position', new THREE.Float32BufferAttribute(coord[0], 3));

	                        //
	                        let pointMesh = new THREE.Points(pointGeom, featureLayer.pointMaterial);

	                        if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
	                        {
	                            pointMesh.position.z = featureLayer.regulator.highValue;
	                        }
	                        else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
	                        {
	                            pointMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
	                        }
	                        // 矢量符号
	                        if(featureLayer.isReplaceWithModel)
	                        {
	                            let tmp = (new THREE.Vector3(coord[0][0], coord[0][1], coord[0][2])).applyMatrix4(pointMesh.matrixWorld);
	                            let midPoint = [tmp.x,tmp.y,tmp.z];
	                            let tempModel = createModel(midPoint);
	                            if(tempModel) {
	                                let tmp = new THREE.Group();
	                                tmp.add(tempModel);
	                                pointMesh = tmp;
	                            }
	                        }
	                        // 矢量备注
	                        else if(featureLayer.labelAvaliable)
	                        {
	                            let tmp = (new THREE.Vector3(coord[0][0], coord[0][1], coord[0][2])).applyMatrix4(pointMesh.matrixWorld);
	                            let midPoint = [tmp.x,tmp.y,tmp.z];
	                            let tempLabel = createLabel(featureProp.id, midPoint);
	                            if(tempLabel) {
	                                let tmp = new THREE.Group();
	                                tmp.add(pointMesh);
	                                tmp.add(tempLabel);
	                                pointMesh = tmp;
	                            }
	                        }
	                        //
	                        pointMesh.frustumCulled = false;
	                        pointMesh.visible = true;
	                        pointMesh.propId = featureProp.id;
	                        pointMesh.isFeature = true;
	                        featureLayer.add(pointMesh);
	                        pointMesh.updateMatrixWorld();

	                        pointObjInfo.meshProp = featureProp;
	                        pointObjInfo.bb2d = bb2d;
	                        pointObjInfo.meshObj[pointObjInfo.meshObj.length] = pointMesh;

	                        featureLayer.features.set(featureProp.id, pointObjInfo);
	                    }
	                }
	                else if (dkey === "MultiLineString" && dvalue.version === featureLayer.featureVersion) {
	                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
	                        let jsonFt = dvalue.features[i].ft;
	                        let featureProp = jsonFt["properties"];
	                        featureProp.id = jsonFt["id"];
	                        if (featureLayer.features.has(featureProp.id)) {
	                            continue;
	                        }
	                        //
	                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
	                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
	                        //
	                        let geom = jsonFt["geometry"];



	                        let multiLineObj = new MeshObjInfo();

	                        let coords = geom["coordinates"];

	                        for (let j = 0, cslength = coords.length; j < cslength; ++j) {
	                            let coord = coords[j];

	                            let lineGeom =new THREE.LineGeometry();
	                            lineGeom.setPositions( coord );

	                            let lineMesh =  new THREE.Line2(lineGeom, featureLayer.lineMaterial);

	                            if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
	                            {
	                                lineMesh.position.z = featureLayer.regulator.highValue;
	                            }
	                            else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
	                            {
	                                lineMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
	                            }

	                            if(featureLayer.regulator.lineDotted)
	                                lineMesh.computeLineDistances();


	                            if(featureLayer.labelAvaliable)
	                            {
	                                let tmp = (new THREE.Vector3(coord[0], coord[1], coord[2])).applyMatrix4(lineMesh.matrixWorld);
	                                let midPoint = [tmp.x,tmp.y,tmp.z];
	                                let tempLabel = createLabel(featureProp.id, midPoint);
	                                if(tempLabel) {
	                                    let tmp = new THREE.Group();
	                                    tmp.add(lineMesh);
	                                    tmp.add(tempLabel);
	                                    lineMesh = tmp;
	                                }
	                            }
	                            //
	                            lineMesh.polygonOffset = true;
	                            lineMesh.polygonOffsetFactor = -10.0;
	                            lineMesh.polygonOffsetUnits = -10.0;

	                            //
	                            lineMesh.frustumCulled = false;
	                            lineMesh.visible = true;
	                            lineMesh.propId = featureProp.id;

	                            multiLineObj.meshObj[multiLineObj.meshObj.length] = lineMesh;
	                            lineMesh.isFeature = true;
	                            featureLayer.add(lineMesh);
	                            lineMesh.updateMatrixWorld();
	                        }

	                        multiLineObj.meshProp = featureProp;
	                        multiLineObj.bb2d = bb2d;
	                        if (multiLineObj.meshObj.length > 0)
	                            featureLayer.features.set(featureProp.id, multiLineObj);
	                    }
	                }
	                else if (dkey === "MultiPolygon" && dvalue.version === featureLayer.featureVersion) {
	                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
	                        let jsonFt = dvalue.features[i].ft;
	                        let featureProp = jsonFt["properties"];
	                        featureProp.id = jsonFt["id"];
	                        // 检查缓存中是否存在
	                        if (featureLayer.features.has(featureProp.id)) {
	                            continue;
	                        }
	                        //
	                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
	                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
	                        //
	                        let geom = jsonFt["geometry"];
	                        let multiPolyObj = new MeshObjInfo();
	                        let multiPolygonCoords = geom["coordinates"];

	                        // ringCount
	                        let multiPolygonCount = multiPolygonCoords.length;
	                        for (let k = 0; k < multiPolygonCount; ++k) {
	                            let polygonCoords = multiPolygonCoords[k];

	                            let ringCount = polygonCoords.length;
	                            if(ringCount <= 0)
	                                return;
	                            // 获取外轮廓
	                            let outlineCoors = polygonCoords[0];

	                            let polygonShape = new THREE.Shape(outlineCoors);

	                            // 获取内轮廓
	                            for (let j = 1; j < ringCount; ++j) {
	                                let holeShape = new THREE.Shape(polygonCoords[j]);
	                                polygonShape.holes.push(holeShape);
	                            }

	                            let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);

	                            holeGeom.computeBoundingSphere();
	                            //
	                            let holeMesh = new THREE.Mesh(holeGeom, featureLayer.polygonMaterial);
	                            if(featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_MANUAL )
	                            {
	                                holeMesh.position.z = featureLayer.regulator.highValue;
	                            }
	                            else if (featureLayer.regulator.fitPattern === FeatureLayer.FIT_PATTERN.ASSIGN_PROP)
	                            {
	                                holeMesh.position.z = parseFloat(featureProp[featureLayer.regulator.highProp]);
	                            }

	                            //
	                            if(featureLayer.labelAvaliable)
	                            {
	                                let tmp = (new THREE.Vector3(outlineCoors[0].x, outlineCoors[0].y, outlineCoors[0].z)).applyMatrix4(holeMesh.matrixWorld);
	                                let midPoint = [tmp.x,tmp.y,tmp.z];

	                                let tempLabel = createLabel(featureProp.id,midPoint, holeMesh.matrix);

	                                if(tempLabel) {
	                                    let tmp = new THREE.Group();
	                                    tmp.add(holeMesh);
	                                    tmp.add(tempLabel);
	                                    holeMesh = tmp;
	                                }
	                            }
	                            //
	                            holeMesh.polygonOffset = true;
	                            holeMesh.polygonOffsetFactor = -10.0;
	                            holeMesh.polygonOffsetUnits = -10.0;

	                            //
	                            holeMesh.frustumCulled = false;
	                            holeMesh.visible = true;
	                            holeMesh.propId = featureProp.id;

	                            //
	                            multiPolyObj.meshObj[multiPolyObj.meshObj.length] = holeMesh;
	                            holeMesh.isFeature = true;
	                            featureLayer.add(holeMesh);
	                            holeMesh.updateMatrixWorld();
	                        }
	                        multiPolyObj.meshProp = featureProp;
	                        multiPolyObj.lastVisitedFrameNumber = 0;
	                        multiPolyObj.bb2d = bb2d;
	                        if(multiPolyObj.meshObj.length > 0)
	                            featureLayer.features.set(featureProp.id, multiPolyObj);
	                    }
	                }
	                else if (dkey === "LineString" && dvalue.version === featureLayer.featureVersion) {
	                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
	                        let jsonFt = dvalue.features[i].ft;
	                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
	                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
	                        //
	                        let geom = jsonFt["geometry"];

	                        let lineGeom = new THREE.BufferGeometry();
	                        let LineObj = new MeshObjInfo();

	                        let featureProp = jsonFt["properties"];
	                        featureProp.id = jsonFt["id"];

	                        let coord = geom["coordinates"];

	                        // 删除
	                        if (featureLayer.features.has(featureProp.id)) {
	                            continue;
	                        }

	                        lineGeom.addAttribute('position', new THREE.Float32BufferAttribute(coord, 3));
	                        //
	                        let lineMesh = new THREE.Line(lineGeom, featureLayer.lineMaterial);

	                        lineMesh.polygonOffset = true;
	                        lineMesh.polygonOffsetFactor = -10.0;
	                        lineMesh.polygonOffsetUnits = -10.0;

	                        //
	                        lineMesh.frustumCulled = false;
	                        lineMesh.visible = true;
	                        lineMesh.propId = featureProp.id;

	                        if(featureLayer.labelAvaliable)
	                        {
	                            let midIndex = parseInt((coord.length/3)/2);

	                            let midPoint = [coord[midIndex*3],coord[midIndex*3+1],coord[midIndex*3+2]];

	                            let tempLabel = createLabel(featureProp.id, midPoint);
	                            if(tempLabel)
	                                lineMesh.add(tempLabel);
	                        }

	                        LineObj.meshObj[LineObj.meshObj.length] = lineMesh;
	                        lineMesh.isFeature = true;
	                        featureLayer.add(lineMesh);
	                        lineMesh.updateMatrixWorld();

	                        LineObj.meshProp = featureProp;
	                        LineObj.bb2d = bb2d;
	                        if (LineObj.meshObj.length > 0)
	                            featureLayer.features.set(featureProp.id, LineObj);
	                    }
	                }
	                else if (dkey === "Polygon" && dvalue.version === featureLayer.featureVersion) {
	                    for (let i = 0, length = dvalue.features.length; i < length; ++i) {
	                        let jsonFt = dvalue.features[i].ft;
	                        let featureProp = jsonFt["properties"];
	                        featureProp.id = jsonFt["id"];
	                        // 检查缓存中是否存在
	                        if (featureLayer.features.has(featureProp.id)) {
	                            continue;
	                        }
	                        //
	                        let bb2d = new THREE.Box2(new THREE.Vector2(dvalue.features[i].minx, dvalue.features[i].miny),
	                            new THREE.Vector2(dvalue.features[i].maxx, dvalue.features[i].maxy));
	                        //
	                        let geom = jsonFt["geometry"];

	                        let PolyObj = new MeshObjInfo();

	                        let polygonCoords = geom["coordinates"];

	                        let ringCount = polygonCoords.length;
	                        if (ringCount <= 0)
	                            return;
	                        // 获取外轮廓
	                        let outlineCoors = polygonCoords[0];

	                        let polygonShape = new THREE.Shape(outlineCoors);

	                        // 获取内轮廓
	                        for (let j = 1; j < ringCount; ++j) {
	                            let holeShape = new THREE.Shape(polygonCoords[j]);
	                            polygonShape.holes.push(holeShape);
	                        }

	                        let holeGeom = new THREE.ShapeBufferGeometry(polygonShape);
	                        holeGeom.computeBoundingSphere();
	                        //
	                        let holeMesh = new THREE.Mesh(holeGeom, featureLayer.polygonMaterial);
	                        holeMesh.polygonOffset = true;
	                        holeMesh.polygonOffsetFactor = -10.0;
	                        holeMesh.polygonOffsetUnits = -10.0;

	                        //
	                        holeMesh.frustumCulled = false;
	                        holeMesh.visible = true;
	                        holeMesh.propId = featureProp.id;

	                        if(featureLayer.labelAvaliable)
	                        {
	                            let midIndex = parseInt(outlineCoors.length/2);

	                            let midPoint = [outlineCoors[midIndex].x,outlineCoors[midIndex].y,outlineCoors[midIndex].z];

	                            let tempLabel = createLabel(featureProp.id, midPoint);
	                            if(tempLabel)
	                                holeMesh.add(tempLabel);
	                        }
	                        //
	                        PolyObj.meshObj[PolyObj.meshObj.length] = meshPair;
	                        holeMesh.isFeature = true;
	                        featureLayer.add(holeMesh);
	                        holeMesh.updateMatrixWorld();
	                        PolyObj.meshProp = featureProp;
	                        PolyObj.lastVisitedFrameNumber = 0;
	                        PolyObj.bb2d = bb2d;
	                        if (PolyObj.meshObj.length > 0)
	                            featureLayer.features.set(featureProp.id, PolyObj);
	                    }
	                }
	            }
	            //
	            featureLayer.downlaodFeatures = [];
	        };

	        let grid = [];

	        /**
	         * @description 计算可视范围的包围盒
	         */
	        this.getGrid = ()=> {
	            if(grid.length > 0)
	                return grid;
	            //
	            let makeGrid = (minx, miny, maxx, maxy)=> {
	                let params = [];
	                if(maxx - minx > 200 && maxy - miny > 200) {
	                    let hwidth = (maxx - minx)/2;
	                    let hheight = (maxy - miny)/2;
	                    params[params.length]= {minx:minx, miny:miny, maxx:minx+hwidth, maxy:miny+hheight};
	                    params[params.length]= {minx:minx+hwidth, miny:miny, maxx:maxx, maxy:miny+hheight};
	                    params[params.length]= {minx:minx+hwidth, miny:miny+hheight, maxx:maxx, maxy:maxy};
	                    params[params.length]= {minx:minx, miny:miny+hheight, maxx:minx+hwidth, maxy:maxy};
	                }
	                else if(maxx - minx > 200) {
	                    let hwidth = (maxx - minx)/2;
	                    params[params.length]={minx:minx, miny:miny, maxx:minx+hwidth, maxy:maxy};
	                    params[params.length]={minx:minx+hwidth, miny:miny, maxx:maxx, maxy:maxy};
	                }
	                else if(maxy - miny > 200) {
	                    let hheight = (maxy - miny)/2;
	                    params[params.length]={minx:minx, miny:miny, maxx:maxx, maxy:miny+hheight};
	                    params[params.length]={minx:minx, miny:miny+hheight, maxx:maxx, maxy:maxy};
	                }
	                else {
	                    let geom = new THREE.PlaneBufferGeometry(maxx - minx, maxy - miny, 1, 1);
	                    let mesh = new THREE.Mesh(geom);
	                    mesh.position.x = (minx + maxx)/2;
	                    mesh.position.y = (miny + maxy)/2;
	                    mesh.position.z = minZ;
	                    mesh.updateMatrixWorld();
	                    mesh.boundingBox = mesh.getBoundingBoxWorld();
	                    mesh.getBoundingBox = ()=> {
	                        return mesh.boundingBox;
	                    };
	                    grid[grid.length] = mesh;
	                }
	                //
	                for(let i=0, paramsLen = params.length; i< paramsLen; ++i) {
	                    makeGrid(params[i].minx, params[i].miny, params[i].maxx, params[i].maxy);
	                }
	            };
	            //
	            makeGrid(this.boundBox.min.x, this.boundBox.min.y, this.boundBox.max.x, this.boundBox.max.y);
	        };

	        let cacheRequestData = (message)=> {
	            if(message.data.data !== null ) {
	                if(message.data.data.version === featureLayer.featureVersion) {
	                    featureLayer.downlaodFeatures[featureLayer.downlaodFeatures.length] = message.data;
	                }
	            }
	        };

	        let ftRequestWorker = null;
	        //
	        let lastVisibleRange = [];

	        /**
	         * @description 移除featureLayer中的过时数据
	         */
	        this.removeUnExpected = function () {
	            if(this.loadAllOnce) {
	                return;
	            }
	            // mesh筛选--lastvisibleFrameNumber, removeUne
	            for(let [fkey, fvalue] of featureLayer.features)
	            {
	                if(fvalue.lastVisitedFrameNumber > 10)
	                {
	                    for(let fv = 0, fvlen = fvalue.meshObj.length; fv < fvlen; ++fv)
	                    {
	                            fvalue.meshObj[fv].dispose();
	                            featureLayer.remove(fvalue.meshObj[fv]);

	                    }
	                    fvalue.meshObj = [];
	                    featureLayer.features.delete(fkey);
	                }
	            }
	        };

	        /**
	         * @description 更新
	         * @param context 更新上下文（包括camera和frustum）
	         */
	        this.update = (context)=> {
	            if(!this.initialized || !this.visible)
	                return;
	            //
	            let camera = context.camera;
	            featureLayer.camera = context.camera;
	            let frustum = context.frustum;
	            //
	            cameraPos = camera.matrixWorldInverse.getLookAt().eye;

	            //
	            // 获取最大的包围盒
	            let bx = new THREE.Box3();
	            // 只有在可视范围变化时更新
	            let newVisibleRange = false;
	            //
	            if(!this.loadAllOnce) {
	                let minZ_ = referenceTerrain.length === 0 ? 0 : 999999;
	                for(let i=0; i<referenceTerrain.length; ++i) {
	                    let bs = referenceTerrain[i].getBoundingSphereWorld();
	                    if(bs.center.z < minZ_)
	                        minZ_ = bs.center.z;
	                }
	                if(minZ !== minZ_) {
	                    minZ = minZ_;
	                    //
	                    for(let i=0, glength = grid.length; i<glength; ++i) {
	                        grid[i].position.z = minZ;
	                        grid[i].updateMatrixWorld();
	                    }
	                }
	                // 获取与视椎体相交的网格，并存储到visibleGrid中
	                let visibleGrid = [];
	                for(let i=0, glength = grid.length; i<glength; ++i) {
	                    if(frustum.intersectsObject(grid[i])) {
	                        visibleGrid[visibleGrid.length] = grid[i];
	                    }
	                }


	                for(let i=0, vbLen = visibleGrid.length; i<vbLen; ++i) {
	                    bx.expandByBox3(visibleGrid[i].getBoundingBox());
	                }

	                if(lastVisibleRange.length === 0) {
	                    lastVisibleRange[0] = bx.min.x;
	                    lastVisibleRange[1] = bx.min.y;
	                    lastVisibleRange[2] = bx.max.x;
	                    lastVisibleRange[3] = bx.max.y;
	                    //
	                    newVisibleRange = true;
	                }
	                else if(Math.abs(lastVisibleRange[0] - bx.min.x) > 0.001 || Math.abs(lastVisibleRange[1] - bx.min.y) > 0.001 ||
	                    Math.abs(lastVisibleRange[2] - bx.max.x) > 0.001 || Math.abs(lastVisibleRange[3] - bx.max.y) > 0.001) {
	                    newVisibleRange = true;
	                }
	            }
	            else {
	                bx.max.set(this.boundBox.max.x, this.boundBox.max.y, 0.0);
	                bx.min.set(this.boundBox.min.x, this.boundBox.min.y, 0.0);
	                //
	                if(lastVisibleRange.length === 0) {
	                    lastVisibleRange[0] = this.boundBox.min.x;
	                    lastVisibleRange[1] = this.boundBox.min.y;
	                    lastVisibleRange[2] = this.boundBox.max.x;
	                    lastVisibleRange[3] = this.boundBox.max.y;
	                    //
	                    newVisibleRange = true;
	                }
	            }
	            //
	            let flMatrixWorldInv = new THREE.Matrix4();
	            flMatrixWorldInv.getInverse(featureLayer.matrixWorld.clone());
	            //
	            this.features.forEach((value, key, ownerMap)=> {
	                if(value.bb2d) {
	                    // 只要包围盒相交则显示该矢量
	                    if(!value.bb2d.intersectsBox(bx)) {
	                        value.lastVisitedFrameNumber++;
	                        for(let n=0, length = value.meshObj.length; n<length; ++n) {
	                            value.meshObj[n].visible = false;
	                        }
	                    }
	                    else {
	                        for(let n=0, length = value.meshObj.length; n<length; ++n) {
	                            let bs = value.meshObj[n].getBoundingSphereWorld();

	                            let dis = cameraPos.clone().sub(bs.center).length();

	                            if(dis <= 600 + bs.radius * 50)
	                            {
	                                value.meshObj[n].visible = true;
	                                value.lastVisitedFrameNumber = 0;
	                            }
	                            else
	                            {
	                                // 只要有一个mesh距离过远，无效化整个feature
	                                value.meshObj[n].visible = false;
	                                value.lastVisitedFrameNumber++;
	                                continue;
	                            }
	                            //
	                            let obj = value.meshObj[n].children[value.meshObj[n].children.length - 1];
	                            if(obj && (obj.isLabel || obj.isModel)) {
	                                if(featureLayer.regulator.fitPattern <= 2 && featureLayer.memDepthSampler) {
	                                    let worldPos = obj.position.clone().applyMatrix4(featureLayer.matrixWorld);
	                                    let z = featureLayer.memDepthSampler.getZ(worldPos.x, worldPos.y, MemDepthSampler.SAMPLE_MODE.SAMPLE_MODE_NORMAL);
	                                    if(z !== featureLayer.memDepthSampler.noValue) {
	                                        worldPos.z =z;
	                                        obj.position.copy(worldPos);
	                                        obj.position.applyMatrix4(flMatrixWorldInv);
	                                    }
	                                }
	                                obj.quaternion.copy(camera.quaternion.clone());
	                                obj.updateMatrixWorld(true);
	                            }
	                        }
	                    }
	                }
	            });
	            //  获取包围盒的网格网格数据
	            if(newVisibleRange)
	            {
	                // 更新时获取
	                ++featureLayer.featureVersion;
	                //
	                let strBound = (globalOffset[0] + bx.min.x)+','+ (globalOffset[1] + bx.min.y)+' ';
	                strBound += (globalOffset[0]+bx.max.x)+','+(globalOffset[1]+bx.min.y)+' ';
	                strBound += (globalOffset[0]+bx.max.x)+','+(globalOffset[1]+bx.max.y)+' ';
	                strBound += (globalOffset[0]+bx.min.x)+','+(globalOffset[1]+bx.max.y)+' ';
	                strBound += (globalOffset[0]+bx.min.x)+','+(globalOffset[1]+bx.min.y)+' ';
	                let filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'+
	                    '<Intersects>'+
	                    '<PropertyName>the_geom</PropertyName>'+
	                    '<gml:Polygon>'+
	                    '<gml:outerBoundaryIs>'+
	                    '<gml:LinearRing>'+
	                    '<gml:coordinates>' + strBound + '</gml:coordinates>'+
	                    '</gml:LinearRing>'+
	                    '</gml:outerBoundaryIs>'+
	                    '</gml:Polygon>'+
	                    '</Intersects>'+
	                    '</Filter>';
	                //

	                let requestUrl = _url_param_[0] + "&" + _url_param_[1];
	                requestUrl +="&request=GetFeature" + "&typeName="+this.typeName;
	                requestUrl += "&maxFeatures=50000"+"&outputFormat=application%2Fjson";
	                requestUrl += "&filter="+filter;

	                if(ftRequestWorker) {
	                    ftRequestWorker.terminate();
	                }

	                if(featureLayer.regulator.isLoadFeature)
	                {
	                    ftRequestWorker = new Worker('../src/worker/featureDownLoadWorker.js');
	                    ftRequestWorker.onmessage = cacheRequestData;
	                    let regulateParas = {denseRate: featureLayer.regulator.denseRate,fitPattern: featureLayer.regulator.fitPattern};
	                    let necessaryParas = {minBox: bx, matrixWorld: featureLayer.matrixWorld, cameraPos: cameraPos, globalOffset:globalOffset};
	                    ftRequestWorker.postMessage({type:"request",url:requestUrl, version:featureLayer.featureVersion, necessaryParas: necessaryParas, regulateParas: regulateParas});
	                }
	                //
	                lastVisibleRange[0] = bx.min.x;
	                lastVisibleRange[1] = bx.min.y;
	                lastVisibleRange[2] = bx.max.x;
	                lastVisibleRange[3] = bx.max.y;
	            }
	            else
	            {
	                if(ftRequestWorker !== null)
	                {
	                    ftRequestWorker.postMessage({type:"fetch", requestNum:featureLayer.regulator.requestNum, version:featureLayer.featureVersion});
	                }
	            }

	            // 缓存中是否存在可用数据（取当前缓存数据创建矢量--转换和创建）,是否可以合并（可视范围）
	            parseMethod();
	        };
	    }

	}

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
	        //
	        this._visibleMesh_ = [];
	        //
	        this.getCurrentBoundingBoxWorld = function () {
	            let bb = new THREE.Box3();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bb.expandByBox3(this._visibleMesh_[n].getBoundingBoxWorld());
	            }
	            //
	            return bb;
	        };
	        //
	        this.getCurrentBoundingSphereWorld = function () {
	            let bs = new THREE.Sphere();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bs.expandBySphere(this._visibleMesh_[n].getBoundingSphereWorld());
	            }
	            //
	            return bs;
	        };
	    }

	    /**
	     * 在给定位置添加一个 THREE.Object3D 对象
	     * @param {THREE.Object3D} obj -对象
	     * @param {THREE.Vector3} pos  -位置
	     */
	    addThreeObj(obj, pos) {
	        obj.isPlantModel = true;
	        if(pos) {
	            obj.position.copy(pos);
	        }
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
	           var loader = new THREE.FBXLoader();
	           loader.load( url,( model )=> {
	               this._modelCache_.set(url, model);
	               //
	               let object = model;
	               object.isPlantModel = true;
	               if(pos) {
	                   object.position.copy(pos);
	               }
	               object.mixer = new THREE.AnimationMixer( object );
	               this._mixers_.push( object.mixer );

	               var action = object.mixer.clipAction( object.animations[ 0 ] );
	               action.play();
	               this.add( object );
	               //
	               this.dispatchEvent({type:"addnode", url:url, object:object});
	           } );
	       }
	       else if(url.substr(-4, 4) === ".obj") {
	           if(this._modelCache_.has(url)) {
	               let object = this._modelCache_.get(url).clone();
	               //
	               object.isPlantModel = true;
	               if(pos) {
	                   object.position.copy(pos);
	               }
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
	                   if(pos) {
	                       object.position.copy(pos);
	                   }
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
	    /**
	     * 移除物体
	     * @param {Object} obj -所要移除的物体
	     */
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
	        this._visibleMesh_ = [];
	        //
	        if(!this.visible)
	            return;
	        //
	        let delta = this._clock_.getDelta();
	        for(let i=0; i<this._mixers_.length; ++i) {
	            this._mixers_[ i ].update(delta);
	        }
	        //
	        if(!context.lookAt) {
	            context.lookAt = context.camera.matrixWorldInverse.getLookAt();
	        }
	        //
	        super.update(context, this._visibleMesh_);
	    }
	}

	class TJHModelLayer extends THREE.Group {
	    /**
	     * TJH 单体模型图层
	     * @class
	     * @memberOf tjh.ar
	     * @extends THREE.Group
	     * @param {string} ip -数据服务 ip
	     * @param {int} port -数据服务端口
	     * @param {string} resourceID -资源 ID
	     * @param {THREE.DataBasePager} [dataBasePager] -数据分页控制器
	     * @param {THREE.Vector3} [offset] -偏移值
	     */
	   constructor(ip, port, resourceID, dataBasePager, offset) {
	       super();
	       this.isTJHModelLayer = true;
	       //
	        if(offset) {
	            this.position.copy(offset);
	            this.updateMatrixWorld();
	        }
	        //
	       this.matrixAutoUpdate = false;
	       //
	        /**
	         * @type {string}
	         */
	       this.ip = ip;
	        /**
	         * @type {Number}
	         */
	       this.port = port;
	        /**
	         * @type {string}
	         */
	       this.resourceID = resourceID;
	        /**
	         * @type {THREE.DataBasePager}
	         */
	       this.dataBasePager = dataBasePager ? dataBasePager : new THREE.DataBasePager(true);

	       this._visibleMesh_ = [];
	       //
	       let proxyNode = new THREE.ProxyNode(this.dataBasePager);
	       proxyNode.forceRootLoad = false;
	       let url = "http://" + ip + ":" + port.toString() + "/api/data/osgjsData?urlInfo=" + resourceID;
	       proxyNode.addFileName(url);
	       this.add(proxyNode);

	       this.update = function(context) {
	           this._visibleMesh_ = [];
	           this.dataBasePager.loadRequest = [];
	           //
	           context.onTextureLoadFailed = function () {
	               return false;
	           };
	           //
	           if(this.visible) {
	               proxyNode.visible = true;
	           }
	           else {
	               proxyNode.visible = false;
	               return;
	           }
	           //
	           if(!context.lookAt) {
	               context.lookAt = context.camera.matrixWorldInverse.getLookAt();
	           }
	           //
	           //let bs = proxyNode.getBoundingSphereWorld();
	           //if(!bs.valid() || context.frustum.intersectsSphere(bs)) {
	               context.dataBasePager = this.dataBasePager;
	               context.dataBasePager.cullGroup = true;
	               context.updateTJHModel = true;
	               proxyNode.update(context, this._visibleMesh_);
	               delete context.updateTJHModel;
	           //}
	           //
	           this.loadRequest = this.dataBasePager.loadRequest;
	           //
	           if(this.loadRequest.length > 0) {
	               this.loadRequest.sort((a,b)=> {
	                   if(a.level !== b.level) {
	                       return a.level - b.level;
	                   }
	                   //
	                   if(a.disToEye > 0 && b.disToEye > 0) {
	                       return a.disToEye - b.disToEye;
	                   }
	                   //
	                   return 0;
	               });
	               //
	               this.loadRequest[this.loadRequest.length] = {sorted : true};
	           }
	       };

	       this.removeUnExpected = function () {
	           this.removeUnExpectedChild(10);
	       };

	        /**
	         * 获取Layer当前的包围盒
	         * @return {THREE.Box3} -包围盒
	         */
	       this.getCurrentBoundingBoxWorld = function () {
	            let bb = new THREE.Box3();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bb.expandByBox3(this._visibleMesh_[n].getBoundingBoxWorld());
	            }
	            //
	            return bb;
	       };
	        /**
	         * 获取Layer当前的包围球
	         * @return {THREE.Sphere} -包围球
	         */
	       this.getCurrentBoundingSphereWorld = function () {
	            let bs = new THREE.Sphere();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bs.expandBySphere(this._visibleMesh_[n].getBoundingSphereWorld());
	            }
	            //
	            return bs;
	       };
	   }
	}

	/**
	 * 地形图层
	 * @class
	 * @memberOf tjh.ar
	 * @extends THREE.ProxyNode
	 */
	class TerrainLayer extends THREE.ProxyNode {
	    /**
	     * @param {THREE.DataBasePager} [dataBasePager] -指定分页管理器
	     * @param {THREE.Vector3} [offset] -指定偏移值
	     */
	    constructor(dataBasePager = new THREE.DataBasePager(true), offset) {
	        super(dataBasePager);
	        //
	        if(offset) {
	            this.position.copy(offset);
	            this.updateMatrixWorld();
	        }
	        //
	        this.matrixAutoUpdate = false;
	        //
	        this._visibleMesh_ = [];
	        //
	        this.rayIntersectTerrain = (()=> {
	            let raycaster = new THREE.Raycaster();
	            let terrainBoundingBox = this.getBoundingBoxWorld();
	            let terrainBottomPlane = new THREE.Plane();
	            terrainBottomPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), terrainBoundingBox.min);
	            return (p, camera)=> {
	                raycaster.setFromCamera( p, camera);
	                let intersects = raycaster.intersectObject(this);
	                if(intersects.length > 0) {
	                    return {intersected:true, intersectP:intersects[0].point};
	                }
	                else {
	                    let intersectP_ = raycaster.ray.intersectPlane(terrainBottomPlane);
	                    return {intersected:false, intersectP:intersectP_};
	                }
	            }
	        })();

	        /**
	         * 获取Layer当前的包围盒
	         * @return {THREE.Box3} -包围盒
	         */
	        this.getCurrentBoundingBoxWorld = function () {
	            let bb = new THREE.Box3();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bb.expandByBox3(this._visibleMesh_[n].getBoundingBoxWorld());
	            }
	            //
	            return bb;
	        };

	        /**
	         * 获取Layer当前的包围球
	         * @return {THREE.Sphere} -包围球
	         */
	        this.getCurrentBoundingSphereWorld = function () {
	            let bs = new THREE.Sphere();
	            for(let n=0, length = this._visibleMesh_.length; n<length; ++n) {
	                bs.expandBySphere(this._visibleMesh_[n].getBoundingSphereWorld());
	            }
	            //
	            return bs;
	        };
	    }

	    /**
	     * 添加地形资源 url
	     * @param {string} url -地形数据的url
	     */
	    addTerrain(url) {
	        this.addFileName(url);
	    }

	    /**
	     * 移除地形资源
	     * @param {string} url -地形数据的url
	     */
	    removeTerrain(url) {
	        this.removeFileName(url);
	    }

	    update(context) {
	        this._visibleMesh_ = [];
	        this.dataBasePager.loadRequest = [];
	        //
	        if(!this.visible)
	            return;
	        //
	        context.onTextureLoadFailed = function (material) {
	            if(material instanceof  THREE.MeshBasicMaterial) {
	                material.map = undefined;
	            }
	            return false;
	        };
	        //
	        if(!context.lookAt) {
	            context.lookAt = context.camera.matrixWorldInverse.getLookAt();
	        }
	        super.update(context, this._visibleMesh_);
	        //
	        this.loadRequest = this.dataBasePager.loadRequest;
	    }

	    intersectWithRay(raycaster) {
	        let intersects = raycaster.intersectObjects(this);
	        if(intersects.length > 0) {
	            return intersects[0].position;
	        }
	        //
	    }
	}

	class PyramidImage extends THREE.PagedLod {
	    constructor(dataBasePager, url, imgID, viewMatrix, projectMatrix, depthTest = true, depthWrite = true) {
	        super(dataBasePager ? dataBasePager : new THREE.DataBasePager(false));
	        this.url = url;
	        this.imgID = imgID;
	        this.imgInfo = null;
	        this.viewMatrix = viewMatrix;
	        this.projectMatrix = projectMatrix;
	        this.initialized = false;
	        this.boundingSphere = new THREE.Sphere();

	        this.rangeMode = THREE.LOD.RangeMode.PIXEL_SIZE_ON_SCREEN;
	        this.depthTest = depthTest;
	        this.depthWrite = depthWrite;

	        let createTileMesh = (loadingData)=> {
	            let tileInfo = loadingData.tileInfo;
	            let texture = loadingData.texture;
	            //
	            let tileUrl = this.imgID.toString()+"*"+tileInfo.level+"*"+tileInfo.row+"*"+tileInfo.col;
	            // console.log("load tile " + tileUrl);

	            let vpMatrix = this.viewMatrix.clone().premultiply(this.projectMatrix);
	            let invM = new THREE.Matrix4();


	            invM.getInverse(vpMatrix);

	            let lb = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*tileInfo.col,
	                -1+2/Math.pow(2, tileInfo.level)*tileInfo.row, -0.9);
	            lb.applyMatrix4(invM);
	            let rb = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*(tileInfo.col+1),
	                -1+2/Math.pow(2, tileInfo.level)*tileInfo.row, -0.9);
	            rb.applyMatrix4(invM).sub(lb);
	            let rt = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*(tileInfo.col+1),
	                -1+2/Math.pow(2, tileInfo.level)*(tileInfo.row+1), -0.9);
	            rt.applyMatrix4(invM).sub(lb);
	            let lt = new THREE.Vector3(-1+2/Math.pow(2, tileInfo.level)*tileInfo.col,
	                -1+2/Math.pow(2, tileInfo.level)*(tileInfo.row+1), -0.9);
	            lt.applyMatrix4(invM).sub(lb);

	            let geometry = new THREE.BufferGeometry();
	            let vertexes = [0,0,0,rb.x,rb.y,rb.z,rt.x,rt.y,rt.z,lt.x,lt.y,lt.z];
	            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertexes, 3 ) );
	            let uv = [0,0,1,0,1,1,0,1];
	            geometry.addAttribute('uv', new THREE.Float32BufferAttribute( uv, 2 ));

	            let material = new THREE.MeshBasicMaterial();
	            material.map = texture;
	            material.depthTest = this.depthTest;
	            material.depthWrite = this.depthWrite;
	            let mesh = new THREE.Mesh(geometry, material);
	            mesh.position.copy(lb);
	            mesh.drawMode = THREE.TriangleFanDrawMode;
	            mesh.renderOrder = 1000;
	            this.dataBasePager.loadingTextureCache.set(tileUrl, [mesh]);
	            //
	            let loadedData = {};
	            loadedData.tileInfo = tileInfo;
	            loadedData.mesh = mesh;
	            this.dataBasePager.parsedNodeCache.set(tileUrl, loadedData);
	        };

	        this.loadChild = (imgTile)=> {
	            let tileInfo = imgTile.split("*");
	            //
	            let url = this.url + "api/ARLayer/GetImgTile?";
	            url += "imageId=" + encodeURIComponent(tileInfo[0]);
	            url += "&";
	            url += "level=" + tileInfo[1];
	            url += "&";
	            url += "row=" + tileInfo[2];
	            url += "&";
	            url += "col=" + tileInfo[3];
	            let textureLoader = new THREE.TextureLoader();
	            let texture = textureLoader.load(url, THREE.Texture.onTextureLoaded, undefined, THREE.Texture.onTextureLoadFailed);
	            texture.wrapS = THREE.ClampToEdgeWrapping;
	            texture.wrapT = THREE.ClampToEdgeWrapping;
	            texture.minFilter = THREE.NearestFilter;
	            texture.minFilter = THREE.LinearFilter;
	            texture.generateMipmaps = false;
	            ++texture.nReference;
	            //
	            let loadedData = {};
	            loadedData.tileInfo = {level:parseInt(tileInfo[1]), row:parseInt(tileInfo[2]), col:parseInt(tileInfo[3])};
	            loadedData.texture = texture;
	            //
	            createTileMesh(loadedData);
	        };

	        this.setLevelDataCallBack = (childIndex, loadedData)=>{
	            if(childIndex === 0) {
	                this.children[childIndex] = loadedData.mesh;
	            }
	            else {
	                let tileInfo = loadedData.tileInfo;
	                let mesh = loadedData.mesh;
	                //
	                let child = new PyramidImage(this.dataBasePager, this.url, this.imgID, this.viewMatrix, this.projectMatrix, this.depthTest, this.depthWrite);
	                child.imgInfo = this.imgInfo;
	                child.initialized = true;
	                child.boundingSphereWorld = new THREE.Sphere();
	                child.boundingSphereWorld.center.x = -1+(2*tileInfo.col+1)/Math.pow(2, tileInfo.level);
	                child.boundingSphereWorld.center.y = -1+(2*tileInfo.row+1)/Math.pow(2, tileInfo.level);
	                child.boundingSphereWorld.center.z = -0.9;
	                child.boundingSphereWorld.radius = Math.sqrt(2)/Math.pow(2, tileInfo.level);
	                let vpM = child.viewMatrix.clone().premultiply(child.projectMatrix);
	                let invM = new THREE.Matrix4();
	                invM.getInverse(vpM);
	                child.boundingSphereWorld.applyMatrix4(invM);
	                child.boundingWorldComputed = true;
	                //
	                child.addLevel("", 0, this.imgInfo.pyramid[tileInfo.level].tile_size);
	                child.add(mesh, false);
	                this.children[childIndex] = child;
	                //
	                if(tileInfo.level < this.imgInfo.pyramid.length - 1) {
	                    let c00 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+tileInfo.row*2+"*"+tileInfo.col*2;
	                    child.addLevel(c00,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
	                    //
	                    let c01 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+tileInfo.row*2+"*"+(tileInfo.col*2+1);
	                    child.addLevel(c01,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
	                    //
	                    let c11 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+(tileInfo.row*2+1)+"*"+(tileInfo.col*2+1);
	                    child.addLevel(c11,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
	                    //
	                    let c10 =this.imgID.toString()+"*"+(tileInfo.level+1)+"*"+(tileInfo.row*2+1)+"*"+tileInfo.col*2;
	                    child.addLevel(c10,this.imgInfo.pyramid[tileInfo.level].tile_size, 100000000);
	                }
	            }
	            //
	            return true;
	        };
	    }

	    init() {
	        if(this.initialized) {
	            return;
	        }
	        //
	        let url = this.url + "api/ARLayer/GetImgInfo/";
	        url += encodeURIComponent(this.imgID);
	        //
	        let pyImg = this;
	        let xhr = new XMLHttpRequest();
	        xhr.open('GET', url);
	        xhr.onload = function() {
	            if (this.status >= 200 && this.status < 300) {
	                pyImg.imgInfo = JSON.parse(xhr.response);
	                pyImg.initialized = true;
	                //
	                let vpMatrix = pyImg.viewMatrix.clone().premultiply(pyImg.projectMatrix);
	                let invM = new THREE.Matrix4();
	                invM.getInverse(vpMatrix);

	                //pyImg.matrix.copy(invM);
	                //pyImg.matrixWorld.copy(invM);
	                //pyImg.matrixAutoUpdate = false;
	                //pyImg.updateMatrixWorld();

	                pyImg.addLevel(pyImg.imgID+"*0*0*0", 0, pyImg.imgInfo.pyramid[0].tile_size);
	                if(!pyImg.boundingSphereWorld) {
	                    pyImg.boundingSphereWorld = new THREE.Sphere();
	                }
	                pyImg.boundingSphereWorld.center.x = 0;
	                pyImg.boundingSphereWorld.center.y = 0;
	                pyImg.boundingSphereWorld.center.z = -0.9;
	                pyImg.boundingSphereWorld.radius = Math.sqrt(2);
	                pyImg.boundingSphereWorld.applyMatrix4(invM);
	                pyImg.boundingWorldComputed = true;
	                //
	                if(pyImg.imgInfo.pyramid.length > 1) {
	                    let c00 =pyImg.imgID.toString()+"*"+1+"*"+0+"*"+0;
	                    pyImg.addLevel(c00,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
	                    //
	                    let c01 =pyImg.imgID.toString()+"*"+1+"*"+0+"*"+1;
	                    pyImg.addLevel(c01,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
	                    //
	                    let c11 =pyImg.imgID.toString()+"*"+1+"*"+1+"*"+1;
	                    pyImg.addLevel(c11,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
	                    //
	                    let c10 =pyImg.imgID.toString()+"*"+1+"*"+1+"*"+0;
	                    pyImg.addLevel(c10,pyImg.imgInfo.pyramid[0].tile_size, 100000000);
	                }
	            } else {
	                reject({
	                    status: this.status,
	                    statusText: xhr.statusText
	                });
	            }
	        };
	        xhr.onerror = function () {
	            reject({
	                status: this.status,
	                statusText: xhr.statusText
	            });
	        };
	        xhr.send();
	    }
	}

	document.write('<script type="text/javascript" src="../src/thrift/thrift.js"> <\/script>');
	document.write('<script  type="text/javascript" src="../src/thrift/gen-js/PhotoMatcher.js"> <\/script>');
	document.write('<script  type="text/javascript" src="../src/thrift/gen-js/photo_search_types.js"> <\/script>');

	class ArCameraAnimation {
	    constructor(sourceCamera, selectedArNode, keepPos) {
	        this.selectedArNode = selectedArNode;
	        this.sourceCamera = sourceCamera;
	        this.targetPose = new THREE.Matrix4();
	        this.targetPose.getInverse(selectedArNode.viewMatrix);
	        this.finished = false;
	        this.keepPos = keepPos;
	        this.sourceFrustum = sourceCamera.projectionMatrix.getFrustum();
	        this.keepProjPos = keepPos.clone().applyMatrix4(sourceCamera.matrixWorldInverse).applyMatrix4(sourceCamera.projectionMatrix);
	        this.finishCallBack = null;

	        this.update = function(){
	            var clock = new THREE.Clock();
	            //
	            var currentPosition = new THREE.Vector3();
	            var currentQuaternion = new THREE.Quaternion();
	            var currentScale = new THREE.Vector3();
	            this.sourceCamera.matrixWorld.decompose(currentPosition, currentQuaternion, currentScale);
	            //
	            let targetLookAt = this.selectedArNode.viewMatrix.getLookAt();
	            let ray = new THREE.Ray(targetLookAt.eye, targetLookAt.lookDirection);
	            let plane = new THREE.Plane();
	            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.keepPos);
	            let inter = ray.intersectPlane(plane);
	            targetLookAt.eye.add(this.keepPos.clone().sub(inter));
	            let targetVM = new THREE.Matrix4();
	            targetVM.makeLookAt(targetLookAt.eye, this.keepPos, targetLookAt.up);
	            let targetPose = new THREE.Matrix4();
	            targetPose.getInverse(targetVM);
	            var targetPosition = new THREE.Vector3();
	            var targetQuaternion = new THREE.Quaternion();
	            var targetScale = new THREE.Vector3();
	            targetPose.decompose(targetPosition, targetQuaternion, targetScale);
	            //
	            var positionKF = new THREE.VectorKeyframeTrack( '.position', [0, 1],
	                [ currentPosition.x, currentPosition.y, currentPosition.z, targetPosition.x, targetPosition.y, targetPosition.z]);
	            var quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, 1],
	                [currentQuaternion.x, currentQuaternion.y, currentQuaternion.z, currentQuaternion.w,
	                    targetQuaternion.x, targetQuaternion.y, targetQuaternion.z, targetQuaternion.w]);
	            //
	            var clip = new THREE.AnimationClip( 'Action', -1, [positionKF, quaternionKF]);
	            var mixer = new THREE.AnimationMixer( this.sourceCamera );
	            // create a ClipAction and set it to play
	            var clipAction = mixer.clipAction( clip );
	            let action = clipAction.play();
	            action.setLoop(THREE.LoopOnce);
	            action.clampWhenFinished = true;
	            mixer.addEventListener("finished", ()=> {
	                this.finished = true;
	            });
	            //
	            return function() {
	                mixer.update(clock.getDelta());
	            }
	        }.call(this);

	        this.translateToKeepPos = ()=> {
	            var targetPosition = new THREE.Vector3();
	            var targetQuaternion = new THREE.Quaternion();
	            var targetScale = new THREE.Vector3();
	            this.targetPose.decompose(targetPosition, targetQuaternion, targetScale);
	            this.sourceCamera.position.copy(targetPosition);
	            this.sourceCamera.quaternion.copy(targetQuaternion);
	            this.sourceCamera.scale.copy(targetScale);
	            this.sourceCamera.updateMatrixWorld();
	            //
	            let keepViewPos = this.keepPos.clone().applyMatrix4(this.sourceCamera.matrixWorldInverse);
	            let frustum = this.sourceFrustum;
	            let tmp = this.keepProjPos.x + 2*frustum.zNear*keepViewPos.x/(keepViewPos.z*(frustum.right - frustum.left));
	            tmp = -tmp*(frustum.right - frustum.left)-frustum.right-frustum.left;
	            let dx = tmp/2;
	            tmp = this.keepProjPos.y+2*frustum.zNear*keepViewPos.y/(keepViewPos.z*(frustum.top-frustum.bottom));
	            tmp = -tmp*(frustum.top - frustum.bottom) - frustum.top - frustum.bottom;
	            let dy = tmp/2;
	            //let zNear = keepViewPos.z*frustum.zFar*(this.keepProjPos.z-1);
	            //zNear/=(keepViewPos.z+2*frustum.zFar+keepViewPos.z*this.keepProjPos.z);
	            this.sourceCamera.projectionMatrix.makeFrustum(frustum.left+dx, frustum.right+dx, frustum.top+dy, frustum.bottom+dy, frustum.zNear, frustum.zFar);
	        };
	    }
	}


	class ARLayer extends  THREE.Group {
	    constructor(url, resourceID, terrainLayer, photoSeachEntry) {
	        super();
	        //
	        this.url = url;
	        this.resourceID = resourceID;
	        this.arNodes = null;
	        this.terrainLayer = terrainLayer;

	        this.cameraAnimation = null;
	        this.imgNode = null;

	        let transport = new Thrift.Transport(photoSeachEntry);
	        let protocol = new Thrift.Protocol(transport);
	        this.client = new PhotoMatcherClient(protocol);

	        this.betterArNode = {};
	        this.betterArNode.clone = function () {
	            let tmp = {};
	            tmp.index = this.index;
	            tmp.imgPower = this.imgPower;
	            tmp.deltaCenter = this.deltaCenter;
	            tmp.angle = this.angle;
	            tmp.imgUrl = this.imgUrl;
	            tmp.viewMatrix = this.viewMatrix.clone();
	            tmp.projectionMatrix = this.projectionMatrix.clone();
	            tmp.clone = this.clone;
	            return tmp;
	        };
	    }


	    removeImgNode() {
	        if(this.imgNode) {
	            this.remove(this.imgNode);
	            this.imgNode.dispose();
	            this.imgNode = null;
	        }
	    }

	    update(context) {
	        if(!this.visible)
	            return;
	        //
	        if(this.cameraAnimation !== null) {
	            if(!this.cameraAnimation.finished)
	                this.cameraAnimation.update();
	            else {
	                this.cameraAnimation.translateToKeepPos();
	                //
	                let selectedArNode = this.cameraAnimation.selectedArNode;
	                //
	                this.cameraAnimation = null;
	                //
	                this.imgNode = new PyramidImage(this.dataBasePager, this.url, selectedArNode.imgUrl, camera.matrixWorldInverse.clone(), selectedArNode.projectionMatrix.clone(), true, false);
	                this.imgNode.init();
	                this.imgNode.renderOrder = 1000;
	                //
	                this.terrainLayer.dataBasePager.enableRequestData = true;
	            }
	        }
	        else if(this.imgNode !== null) {
	            if(this.imgNode.initialized) {
	                if(this.imgNode.addedAsChild) {
	                    context.onTextureLoadFailed = function () {
	                        return false;
	                    };
	                    //
	                    this.imgNode.update(context);
	                    return;
	                }
	                //
	                this.imgNode.addedAsChild = true;
	                this.add(this.imgNode);
	            }
	        }
	    }

	    searchPhotoByNearest1(camera, constraintPoint=null) {
	        // �����������̬
	        let cameraPose = camera.matrixWorldInverse.getLookAt();
	        cameraPose.right = cameraPose.lookDirection.clone().cross(cameraPose.up);
	        let projectCenter = new THREE.Vector2(0,0);
	        let lookTerrainCenter = this.terrainLayer.rayIntersectTerrain(projectCenter, camera);

	        // �����׼��Ϣ������õ��ο���ƽ�棨��
	        while(!lookTerrainCenter.intersected && projectCenter.y > -0.9) {
	            projectCenter.y -=0.2;
	            //projectCenter.y /=2;
	            lookTerrainCenter = this.terrainLayer.rayIntersectTerrain(projectCenter, camera);
	        }
	        //
	        let datumPointOnTerrain = [];
	        datumPointOnTerrain.push(this.terrainLayer.rayIntersectTerrain(new THREE.Vector2(0,projectCenter.y-0.25), camera));
	        datumPointOnTerrain.push(lookTerrainCenter);
	        datumPointOnTerrain.push(this.terrainLayer.rayIntersectTerrain(new THREE.Vector2(0,projectCenter.y+0.15), camera));
	        let datumCenter = [];
	        for(let i=0; i<datumPointOnTerrain.length; ++i) {
	            if(datumPointOnTerrain[i].intersected) {
	                datumCenter.push(datumPointOnTerrain[i].intersectP);
	            }
	        }
	        if(datumCenter.length === 0) {
	            datumCenter.push(lookTerrainCenter.intersectP);
	        }
	        //
	        let datumPlanes = [];
	        for(let i=0; i<datumCenter.length; ++i) {
	            let datumPlane_ = new THREE.Plane();
	            datumPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(-cameraPose.lookDirection.x, -cameraPose.lookDirection.y, -cameraPose.lookDirection.z), datumCenter[i]);
	            datumPlanes.push({datumPlane:datumPlane_});
	        }
	        // ������
	        for(let i=0; i<datumPlanes.length; ++i) {
	            let datumPlane = datumPlanes[i].datumPlane;
	            let datumPoint = [];
	            let raycaster = new THREE.Raycaster();
	            raycaster.setFromCamera(new THREE.Vector2(-0.2,projectCenter.y), camera);
	            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
	            raycaster.setFromCamera(new THREE.Vector2(0,projectCenter.y-0.25), camera);
	            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
	            raycaster.setFromCamera(new THREE.Vector2(0.2,projectCenter.y), camera);
	            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
	            raycaster.setFromCamera(new THREE.Vector2(0,projectCenter.y+0.15), camera);
	            datumPoint.push(raycaster.ray.intersectPlane(datumPlane));
	            datumPlanes[i].datumPoint = datumPoint;
	        }

	        // ���

	        let thriftDPs = new ThriftDatumPlanes();
	        // thriftDPs.datumPlanes = new Array(datumPlanes.length);
	        thriftDPs.constraintPoint = new ThriftVector3();
	        thriftDPs.constraintPoint.x = constraintPoint.x;
	        thriftDPs.constraintPoint.y = constraintPoint.y;
	        thriftDPs.constraintPoint.z = constraintPoint.z;

	        thriftDPs.intersectPoint = new ThriftVector3();
	        thriftDPs.intersectPoint.x = lookTerrainCenter.intersectP.x;
	        thriftDPs.intersectPoint.y = lookTerrainCenter.intersectP.y;
	        thriftDPs.intersectPoint.z = lookTerrainCenter.intersectP.z;
	        let ttPlanes = new Array(datumPlanes.length);

	        for(let k = 0;  k < datumPlanes.length; ++k)
	        {
	            let thriftDP = new ThriftDatumPlane();
	            thriftDP.datumPoints = new Array(datumPlanes[k].datumPoint.length);

	            for(let g = 0; g < datumPlanes[k].datumPoint.length; ++g)
	            {
	                let v2 = new ThriftVector3();

	                v2.x = datumPlanes[k].datumPoint[g].x;
	                v2.y = datumPlanes[k].datumPoint[g].y;
	                v2.z = datumPlanes[k].datumPoint[g].z;

	                thriftDP.datumPoints[g] = v2;
	            }
	            ttPlanes[k] = thriftDP;
	            // thriftDPs.datumPlanes[k]=thriftDP;
	        }

	        thriftDPs.datumPlanes=ttPlanes;

	        let ttCamera = new ThriftCamera();

	        ttCamera.matrixWorldInverse = new ThriftMatrix4();
	        ttCamera.projectionMatrix = new ThriftMatrix4();

	        let ttmwi = camera.matrixWorldInverse;

	        ttCamera.matrixWorldInverse.n11 = ttmwi.elements[0];
	        ttCamera.matrixWorldInverse.n12 = ttmwi.elements[1];
	        ttCamera.matrixWorldInverse.n13 = ttmwi.elements[2];
	        ttCamera.matrixWorldInverse.n14 = ttmwi.elements[3];

	        ttCamera.matrixWorldInverse.n21 = ttmwi.elements[4];
	        ttCamera.matrixWorldInverse.n22 = ttmwi.elements[5];
	        ttCamera.matrixWorldInverse.n23 = ttmwi.elements[6];
	        ttCamera.matrixWorldInverse.n24 = ttmwi.elements[7];

	        ttCamera.matrixWorldInverse.n31 = ttmwi.elements[8];
	        ttCamera.matrixWorldInverse.n32 = ttmwi.elements[9];
	        ttCamera.matrixWorldInverse.n33 = ttmwi.elements[10];
	        ttCamera.matrixWorldInverse.n34 = ttmwi.elements[11];

	        ttCamera.matrixWorldInverse.n41 = ttmwi.elements[12];
	        ttCamera.matrixWorldInverse.n42 = ttmwi.elements[13];
	        ttCamera.matrixWorldInverse.n43 = ttmwi.elements[14];
	        ttCamera.matrixWorldInverse.n44 = ttmwi.elements[15];

	        let ttpm = camera.projectionMatrix;
	        ttCamera.projectionMatrix.n11 = ttpm.elements[0];
	        ttCamera.projectionMatrix.n12 = ttpm.elements[1];
	        ttCamera.projectionMatrix.n13 = ttpm.elements[2];
	        ttCamera.projectionMatrix.n14 = ttpm.elements[3];

	        ttCamera.projectionMatrix.n21 = ttpm.elements[4];
	        ttCamera.projectionMatrix.n22 = ttpm.elements[5];
	        ttCamera.projectionMatrix.n23 = ttpm.elements[6];
	        ttCamera.projectionMatrix.n24 = ttpm.elements[7];

	        ttCamera.projectionMatrix.n31 = ttpm.elements[8];
	        ttCamera.projectionMatrix.n32 = ttpm.elements[9];
	        ttCamera.projectionMatrix.n33 = ttpm.elements[10];
	        ttCamera.projectionMatrix.n34 = ttpm.elements[11];

	        ttCamera.projectionMatrix.n41 = ttpm.elements[12];
	        ttCamera.projectionMatrix.n42 = ttpm.elements[13];
	        ttCamera.projectionMatrix.n43 = ttpm.elements[14];
	        ttCamera.projectionMatrix.n44 = ttpm.elements[15];

	        let ress = null;
	        var exc = false;
	        // DIVISION
	        try {
	            ress = this.client.searchPhotoByNearest(this.resourceID, ttCamera, thriftDPs);
	            console.log(ress);
	        } catch(excp){
	            console.log(excp.errorType);
	            console.log(excp.errorDes);

	            exc = true;

	            return null;
	        }

	        let projM = new THREE.Matrix4();
	        let viewM = new THREE.Matrix4();

	        if(!exc) {
	            this.betterArNode.index = ress.index;
	            this.betterArNode.imgPower = ress.imgPower;
	            this.betterArNode.deltaCenter = ress.deltaToCenter;
	            this.betterArNode.angle = ress.angle;
	            this.betterArNode.imgUrl = ress.imgUrl;

	            viewM.set(ress.viewMatrix.n11, ress.viewMatrix.n12, ress.viewMatrix.n13, ress.viewMatrix.n14,
	                ress.viewMatrix.n21, ress.viewMatrix.n22, ress.viewMatrix.n23, ress.viewMatrix.n24,
	                ress.viewMatrix.n31, ress.viewMatrix.n32, ress.viewMatrix.n33, ress.viewMatrix.n34,
	                ress.viewMatrix.n41, ress.viewMatrix.n42, ress.viewMatrix.n43, ress.viewMatrix.n44);

	            projM.set(ress.projectionMatrix.n11,ress.projectionMatrix.n12,ress.projectionMatrix.n13,ress.projectionMatrix.n14,
	                ress.projectionMatrix.n21,ress.projectionMatrix.n22,ress.projectionMatrix.n23,ress.projectionMatrix.n24,
	                ress.projectionMatrix.n31,ress.projectionMatrix.n32,ress.projectionMatrix.n33,ress.projectionMatrix.n34,
	                ress.projectionMatrix.n41,ress.projectionMatrix.n42,ress.projectionMatrix.n43,ress.projectionMatrix.n44);

	            this.betterArNode.viewMatrix = viewM;
	            this.betterArNode.projectionMatrix = projM;
	            return this.betterArNode;
	        }
	        //
	        return null;
	    }
	    //
	    applyArNode(camera, arNode, keepPos) {
	        this.terrainLayer.dataBasePager.enableRequestData = false;
	        this.cameraAnimation = new ArCameraAnimation(camera, arNode, keepPos);
	    }


	}

	/**
	 * @classdesc 后期处理图层
	 * @class
	 * @memberOf tjh.ar
	 */
	class PostLayer {
	    constructor() {
	        this.visible = true;
	    };

	    /**
	     * 判断该图层是否为空
	     * @return {bool} -是否为空
	     */
	    isEmpty() {
	        return true;
	    }
	}

	class RenderPass {
	    constructor(scene, camera, renderTarget) {
	        this.scene = scene ;
	        this.camera = camera;
	        this.renderTarget = renderTarget;
	    }

	    setRenderResource(scene, camera, renderTarget) {
	        this.scene = scene ;
	        this.camera = camera;
	        this.renderTarget = renderTarget;
	    }

	    render(renderer) {

	    }

	    release() {

	    }

	    setSize(width, height) {

	    }
	}

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
	            currentOutLineColor = object.outlineColor ? object.outlineColor : currentOutLineColor;
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
	        //
	        let noSelectUnVisibleObjs = [];
	        //
	        let  outlineObjDepthRT = new THREE.WebGLRenderTarget(this.renderTarget.width, this.renderTarget.height, pars);
	        outlineObjDepthRT.texture.generateMipmaps = false;
	        outlineObjDepthRT.depthTexture = new THREE.DepthTexture(this.renderTarget.width, this.renderTarget.height,
	            THREE.UnsignedInt248Type, undefined, undefined, undefined, THREE.LinearFilter, THREE.LinearFilter, undefined, THREE.DepthStencilFormat);
	        let outlineObjDepthRenderPass = new RenderPass(scene, camera);
	        outlineObjDepthRenderPass.render = function (renderer) {
	            this.scene = outLineRenderPass.scene;
	            this.camera = outLineRenderPass.camera;
	            //
	            if(outLineObjs.length === 0)
	                return false;
	            //
	            noSelectUnVisibleObjs = [];
	            //
	            let unvisibleNoSelectObjs = (object)=>{
	                if(outLineObjs.indexOf(object) >= 0) {
	                    //object.visible = true;
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
	            };
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
	            };
	            for(let i=0; i<outLineObjs.length; ++i) {
	                materialReplace(outLineObjs[i]);
	                setMaskMaterial(outLineObjs[i]);
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
	            };
	            for(let i=0; i<outLineObjs.length; ++i) {
	                unsetMaskMaterial(outLineObjs[i]);
	            }
	            //
	            return true;
	        };
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
	        let outlineObjMaskRT = new THREE.WebGLRenderTarget( this.renderTarget.width, this.renderTarget.height, pars );
	        outlineObjMaskRT.texture.generateMipmaps = false;

	        let outlineObjMaskRenderPass = new RenderPass(tmpScene, orthoCamera);
	        outlineObjMaskRenderPass.outLineObjs = outLineObjs;
	        outlineObjMaskRenderPass.renderCamera = this.camera;
	        outlineObjMaskRenderPass.render = function (renderer) {
	            let frustum = this.renderCamera.isPerspectiveCamera ? this.renderCamera.projectionMatrix.getFrustum() : this.renderCamera.projectionMatrix.getOrtho();
	            quad.material.uniforms[ "depthTexture0" ].value = outLineRenderPass.renderTarget.depthTexture;
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
	                    "resolution": { value: new THREE.Vector2(outlineObjMaskRT.width, outlineObjMaskRT.height)},
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

	        let outLineRT = new THREE.WebGLRenderTarget( this.renderTarget.width, this.renderTarget.height, pars );
	        outLineRT.texture.name = "outline";
	        outLineRT.texture.generateMipmaps = false;

	        let outlineGeneratePass = new RenderPass(tmpScene1, orthoCamera);
	        outlineGeneratePass.render = function (renderer) {
	            quad1.material.uniforms[ "maskTexture" ].value = outlineObjMaskRT.texture;
	            quad1.material.uniforms[ "edgeColor" ].value = new THREE.Vector3( 1.0, 1.0, 0.0 );
	            quad1.material.uniforms[ "resolution" ].value = new THREE.Vector2(outLineRT.width, outLineRT.height);
	            //
	            renderer.render(this.scene, this.camera, outLineRT);
	            //
	            return true;
	        };
	        //
	        let screenImgRT = new THREE.WebGLRenderTarget( this.renderTarget.width, this.renderTarget.height, pars);
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
	            if(this.renderTarget.renderToScreen)
	                return false;
	            //
	            outLineObjs = [];
	            let layers = this.scene.getPostLayer('OutLineObjLayer');
	            for(let i=0; i<layers.length; ++i) {
	                outLineObjs = outLineObjs.concat(layers[i].layer.getOutLineObjs());
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
	        };
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
	        };
	    }
	}

	/**
	 * @classdesc 轮廓化图层
	 * @class
	 * @memberOf tjh.ar
	 * @extends PostLayer
	 */
	class OutLineObjLayer extends PostLayer {
	    constructor() {
	        super();
	        //
	        this.name = 'OutLineObjLayer';
	        //
	        let outLineObjs = [];

	        /**
	         * 添加轮廓化对象（一个或多个）
	         * @param {THREE.Object3D} obj -对象
	         */
	        this.addOutlineObj = (...objects)=> {
	            for(let i=0; i<objects.length; ++i) {
	                if(outLineObjs.indexOf(objects[i]) >= 0) {
	                }
	                else {
	                    if(!objects[i].outlineColor)
	                        objects[i].outlineColor = this.outlineColor;
	                    //
	                    outLineObjs.push(objects[i]);
	                }
	            }
	        };

	        /**
	         * 移除轮廓化对象（一个或多个）
	         * @param {THREE.Object3D} obj -对象
	         */
	        this.removeOutlineObj = (...objects)=> {
	            for(let i=0; i<objects.length; ++i) {
	                let index = outLineObjs.indexOf(objects[i]);
	                if(index >= 0) {
	                    outLineObjs.splice(index,1);
	                }
	            }
	        };

	        /**
	         * 清除所有轮廓化对象
	         */
	        this.clear = ()=> {
	            for(let i=0, length = outLineObjs.length; i<length; ++i) {
	                this.removeOutlineObj(outLineObjs[i]);
	            }
	            //
	            outLineObjs = [];
	        };

	        /**
	         * 获取所有轮廓化对象
	         * @param {array} outLineObjs -轮廓化对象
	         */
	        this.getOutLineObjs = ()=> {
	            return outLineObjs;
	        };

	        this.isEmpty = function () {
	            if(outLineObjs.length > 0)
	                return false;
	            //
	            return true;
	        };
	    }
	}

	//import {NormalRenderPass} from "./render_technique/NormalRenderPass";

	/**
	 * ARScene 类
	 * @class
	 * @extends THREE.Scene
	 * @memberOf tjh.ar
	 */
	class ARScene extends  THREE.Scene {
	    constructor() {
	        super();
	        //
	        /**
	         * 地形图层
	         * @public
	         * @type {Array}
	         */
	        this.terrainLayers = [];
	        /**
	         * 矢量图层
	         * @public
	         * @type {Array}
	         */
	        this.featureLayers = [];
	        /**
	         * 模型图层
	         * @public
	         * @type {Array}
	         */
	        this.modelLayers = [];
	        /**
	         * 航空影像图层
	         * @public
	         * @type {Array}
	         */
	        this.arLayers = [];
	        /**
	         * 临时对象
	         * @public
	         * @type {Array}
	         */
	        this.temporaryObjs = [];
	        /**
	         * 屏幕特效图层
	         * @type {Array}
	         */
	        this.postLayers = [];
	        /**
	         * 自定义图层
	         * @type {Array}
	         */
	        this.customLayers = [];
	        /**
	         * 光源
	         * @public
	         * @type {Array}
	         */
	        this.lightSources = [];
	        /**
	         * 全局偏移
	         * @type {number[]}
	         */
	        this.globalOffset = [0.0,0.0,0.0];
	        //
	        this.currentBoundingBox = new THREE.Box3();
	        //
	        this.addPostLayer('OutLineObjLayer', 100, new OutLineObjLayer());
	        //
	        this._visibleTerrianLayers = [];
	        this._visibleModelLayers = [];
	        this._visibleMeshes = [];
	        this.onBeforeRender = function( renderer, scene, camera, renderTarget ) {
	            this._visibleMeshes = [];
	            //
	            this._visibleTerrianLayers = [];
	            for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
	                if(this.terrainLayers[n].visible) {
	                    this._visibleTerrianLayers[this._visibleTerrianLayers.length] = this.terrainLayers[n];
	                    this._visibleMeshes = this._visibleMeshes.concat(this.terrainLayers[n]._visibleMesh_);
	                }
	            }
	            //
	            this._visibleModelLayers = [];
	            for(let n=0, length = this.modelLayers.length; n<length; ++n) {
	                if(this.modelLayers[n].visible) {
	                    this._visibleModelLayers[this._visibleModelLayers.length] = this.modelLayers[n];
	                    this._visibleMeshes = this._visibleMeshes.concat(this.modelLayers[n]._visibleMesh_);
	                }
	            }
	        };

	        this.onAfterRender = function( renderer, scene, camera ) {
	            for(let n=0, length = this._visibleTerrianLayers.length; n<length; ++n) {
	                this._visibleTerrianLayers[n].visible = true;
	            }
	            for(let n=0, length = this._visibleModelLayers.length; n<length; ++n) {
	                this._visibleModelLayers[n].visible = true;
	            }
	            //
	            for(let n=0, length = this.lightSources.length; n<length; ++n) {
	                if(this.lightSources[n].oldPos) {
	                    this.lightSources[n].position.copy(this.lightSources[n].oldPos);
	                    delete this.lightSources[n].oldPos;
	                }
	                //
	                if(this.lightSources[n].oldTargetPos) {
	                    this.lightSources[n].target.position.copy(this.lightSources[n].oldTargetPos);
	                    delete this.lightSources[n].oldTargetPos;
	                }
	            }
	        };
	        //
	        this._numSkipRemoveUnExpected_ = 0;
	    }

	    /**
	     * 添加光源
	     * @param {THREE.Light} lightSource -光源
	     */
	    addLightSource(lightSource) {
	        this.lightSources.push(lightSource);
	        this.add(lightSource);
	    }

	    /**
	     * @param lightSource
	     */
	    removeLightSource(lightSource) {
	        let index = this.lightSources.indexOf(lightSource);
	        if(index >= 0) {
	            this.lightSources.splice(index, 1);
	            this.remove(lightSource);
	        }
	    }

	    /**
	     * 添加地形图层
	     * @param {tjh.ar.TerrainLayer} terrainLayer -地形图层
	     */
	    addTerrainLayer(terrainLayer) {
	        this.terrainLayers.push(terrainLayer);
	        this.add(terrainLayer);
	    }

	    /**
	     * @param terrainLayer
	     */
	    removeTerrainLayer(terrainLayer) {
	        let index = this.terrainLayers.indexOf(terrainLayer);
	        if(index >= 0) {
	            terrainLayer.dispose();
	            this.terrainLayers.splice(index, 1);
	            this.remove(terrainLayer);
	        }
	    }
	    /**
	     * 添加航空影像图层
	     * @param {tjh.ar.ARLayer} arLayer -AR图层
	     */
	    addARLayer(arLayer) {
	        this.arLayers.push(arLayer);
	        this.add(arLayer);
	    }

	    /**
	     * @param arLayer
	     */
	    removeARLayer(arLayer) {
	        let index = this.arLayers.indexOf(arLayer);
	        if(index >= 0) {
	            arLayer.dispose();
	            this.arLayers.splice(index, 1);
	            this.remove(arLayer);
	        }
	    }
	    /**
	     * 添加模型图层
	     * @param {tjh.ar.ModelLayer} modelLayer -模型图层
	     */
	    addModelLayer(modelLayer) {
	        this.modelLayers.push(modelLayer);
	        this.add(modelLayer);
	    }

	    /**
	     * @param modelLayer
	     */
	    removeModelLayer(modelLayer) {
	        let index = this.modelLayers.indexOf(modelLayer);
	        if(index >= 0) {
	            modelLayer.dispose();
	            this.modelLayers.splice(index, 1);
	            this.remove(modelLayer);
	        }
	    }
	    /**
	     * 添加矢量图层
	     * @param {tjh.ar.FeatureLayer} ftLayer -矢量图曾
	     */
	    addFeatureLayer(ftLayer) {
	        this.featureLayers.push(ftLayer);
	        this.add(ftLayer);
	    }

	    /**
	     * @param ftLayer
	     */
	    removeFeatureLayer(ftLayer) {
	        let index = this.featureLayers.indexOf(ftLayer);
	        if(index >= 0) {
	            ftLayer.dispose();
	            this.featureLayers.splice(index, 1);
	            this.remove(ftLayer);
	        }
	    }

	    addPostLayer(name, order, postLayer) {
	        for(let n=0, length = this.postLayers.length; n<length; ++n) {
	            if(this.postLayers[n].order < order) {
	                this.postLayers.splice(n,0, {name:name, order:order, enable:true, layer:postLayer});
	                return;
	            }
	        }
	        //
	        this.postLayers[this.postLayers.length] = {name:name, order:order, enable:true, layer:postLayer};
	    }

	    removePostLayer(name) {
	        for(let n=0, length = this.postLayers.length; n<length; ++n) {
	            if(this.postLayers[n].name === name) {
	                this.postLayers.splice(n,1);
	                return;
	            }
	        }
	    }

	    getPostLayer(name) {
	        let layers = [];
	        for(let n=0, length = this.postLayers.length; n<length; ++n) {
	            if(this.postLayers[n].name === name && this.postLayers[n].enable) {
	                layers[layers.length] = this.postLayers[n];
	            }
	        }
	        return layers;
	    }

	    addCustomLayer(layer) {
	        this.customLayers.push(layer);
	        this.add(layer);
	    }

	    removeCustomLayer(layer) {
	        let index = this.customLayers.indexOf(layer);
	        if(index >= 0) {
	            layer.dispose();
	            this.customLayers.splice(index, 1);
	            this.remove(layer);
	        }
	    }
	    /**
	     * 添加临时渲染对象
	     * @param {THREE.Object3D} obj -临时渲染对象
	     */
	    addTemporaryObj(obj) {
	        this.temporaryObjs.push(obj);
	        this.add(obj);
	    }
	    /**
	     * 删除临时渲染对象
	     * @param {THREE.Object3D} obj -临时渲染对象
	     */
	    removeTemporaryObj(obj) {
	        let index = this.temporaryObjs.indexOf(obj);
	        if(index >= 0) {
	            obj.dispose();
	            this.temporaryObjs.splice(index, 1);
	            this.remove(obj);
	        }
	    }

	    /**
	     * 更新模型矩阵
	     */
	    updateMatrixWorld() {
	        for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
	            if(this.terrainLayers[n].matrixAutoUpdate)
	                this.terrainLayers[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.featureLayers.length; n<length; ++n) {
	            if(this.featureLayers[n].matrixAutoUpdate)
	                this.featureLayers[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.arLayers.length; n<length; ++n) {
	            if(this.arLayers[n].matrixAutoUpdate)
	                this.arLayers[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.modelLayers.length; n<length; ++n) {
	            if(this.modelLayers[n].matrixAutoUpdate)
	                this.modelLayers[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.temporaryObjs.length; n<length; ++n) {
	            this.temporaryObjs[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.customLayers.length; n<length; ++n) {
	            this.customLayers[n].updateMatrixWorld();
	        }
	        for(let n=0, length = this.lightSources.length; n<length; ++n) {
	            this.lightSources[n].updateMatrixWorld();
	        }
	    }

	    /**
	     * 删除过期数据
	     */
	    removeUnExpected() {
	        if(this._numSkipRemoveUnExpected_ !== 10) {
	            ++this._numSkipRemoveUnExpected_;
	            return;
	        }
	        //
	        for(let n=0, length = this.terrainLayers.length; n<length; ++n) {
	            if(this.terrainLayers[n].removeUnExpected) {
	                this.terrainLayers[n].removeUnExpected();
	            }
	        }
	        for(let n=0, length = this.featureLayers.length; n<length; ++n) {
	            if(this.featureLayers[n].removeUnExpected) {
	                this.featureLayers[n].removeUnExpected();
	            }
	        }
	        for(let n=0, length = this.arLayers.length; n<length; ++n) {
	            if(this.arLayers[n].removeUnExpected) {
	                this.arLayers[n].removeUnExpected();
	            }
	        }
	        for(let n=0, length = this.modelLayers.length; n<length; ++n) {
	            if(this.modelLayers[n].removeUnExpected) {
	                this.modelLayers[n].removeUnExpected();
	            }
	        }
	        for(let n=0, length = this.customLayers.length; n<length; ++n) {
	            if(this.customLayers[n].removeUnExpected()) {
	                this.customLayers[n].removeUnExpected();
	            }
	        }
	        //
	        this._numSkipRemoveUnExpected_ = 0;
	    }
	}


	/**
	 * 渲染窗口事件处理基类，所有需要处理渲染窗口事件的对象都应从此类继承
	 * 如果对象处理了某个窗口事件则反会 true
	 * @class
	 * @memberOf tjh.ar
	 */
	class WindowEventListener {
	    constructor(viewer) {
	        /**
	         * 所属 viewer 对象
	         * @type {Viewer}
	         */
	        this.viewer = viewer;
	        /**
	         * 用于存放临时渲染对象
	         * @type {THREE.Group}
	         */
	        this.tempObj = new THREE.Group();

	        /**
	         * mouse down 处理函数
	         * @param mouseEvent
	         * @returns {boolean}
	         */
	        this.onMouseDown = (mouseEvent)=> {
	            switch ( mouseEvent.button ) {
	                case THREE.MOUSE.LEFT:
	                    return this.onLeftDown(mouseEvent);
	                case THREE.MOUSE.MIDDLE:
	                    return this.onMiddleDown(mouseEvent);
	                case THREE.MOUSE.RIGHT:
	                    return this.onRightDown(mouseEvent);
	            }
	            return false;
	        };
	        /**
	         * mouse up 处理函数
	         * @param mouseEvent
	         * @returns {boolean}
	         */
	        this.onMouseUp = (mouseEvent)=> {
	            switch ( mouseEvent.button ) {
	                case THREE.MOUSE.LEFT:
	                    return this.onLeftUp(mouseEvent);
	                case THREE.MOUSE.MIDDLE:
	                    return this.onMiddleUp(mouseEvent);
	                case THREE.MOUSE.RIGHT:
	                    return this.onRightUp(mouseEvent);
	            }
	            //
	            return false;
	        };
	    }

	    /**
	     * 释放函数
	     */
	    release() {
	        this.viewer.scene.removeTemporaryObj(this.tempObj);
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onLeftDown(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onMiddleDown(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onRightDown(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onLeftUp(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onMiddleUp(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onClick(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onDoubleClick(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onRightUp(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param mouseEvent
	     * @returns {boolean}
	     */
	    onMouseMove(mouseEvent) {
	        return false;
	    }

	    /**
	     * @param wheelEvent
	     * @returns {boolean}
	     */
	    onMouseWheel(wheelEvent) {
	        return false;
	    }

	    /**
	     * @param keyboardEvent
	     * @returns {boolean}
	     */
	    onKeyDown(keyboardEvent) {
	        return false;
	    }

	    /**
	     * @param keyboardEvent
	     * @returns {boolean}
	     */
	    onKeyUp(keyboardEvent) {
	        return false;
	    }
	}

	/**
	 * Viewer 对象用于管理渲染循环、场景更新、窗口事件路由。
	 * 窗口事件路由规则：
	 * 遍历窗口事件监听者队列，如果当前对象处理了当前事件并返回 true 则此次事件处理结束，否则继续向下传递当前事件
	 * @class
	 * @memberOf tjh.ar
	 */
	class Viewer {
	    constructor(domElement) {
	        THREE.Cache.enabled = false;
	        THREE.FontManager.getFont("msyh");
	        //
	        let viewer = this;
	        //
	        this.active = true;
	        /**
	         * 场景对象
	         * @type {ARScene}
	         */
	        this.scene = new ARScene();
	        this.scene.autoUpdate = false;
	        /**
	         * 渲染器对象
	         * @type {THREE.Renderer}
	         */
	        this.renderer = new THREE.WebGLRenderer({canvas:domElement ? domElement : undefined});
	        this.renderer.supportMaterialStencil();
	        if(domElement) {
	            this.renderer.setPixelRatio(window.devicePixelRatio);
	            this.renderer.setSize(domElement.clientWidth, domElement.clientHeight);
	        }
	        else {

	        }
	        /**
	         * 所属 dom 对象
	         */
	        this.domElement = ( domElement !== undefined ) ? domElement : this.renderer.domElement;
	        /**
	         * 相机对象
	         * @type {THREE.Camera}
	         */
	        this.camera = new THREE.PerspectiveCamera( 45, this.domElement.clientWidth / this.domElement.clientHeight, 1, 100000 );
	        /**
	         * 窗口事件监听者队列
	         * @type {Array}
	         */
	        this.eventListenerStack = [];

	        this.EventState = { NONE: 0, LEFT_BTN_DOWN: 1, MIDDLE_BTN_DOWN: 2, RIGHT_BTN_DOWN: 4,
	            SHIFT_L_DOWN: 8, SHIFT_R_DOWN: 16, CTRL_L_DOWN: 32, CTRL_R_DOWN: 64, KEY_DOWN: 128};
	        this.eventState = this.EventState.NONE;
	        /**
	         * @callback
	         * @type {function}
	         */
	        this.onBeginFrame = undefined;
	        /**
	         * @callback
	         * @type {function}
	         */
	        this.onEndFrame = undefined;

	        this.onBeginRenderTechnique = undefined;
	        this.onEndRenderTechnique = undefined;
	        /**
	         * 帧率
	         * @type {number}
	         */
	        this.fps = 0;

	        this.numFrame = 0;
	        /**
	         * RenderTechnique 栈
	         * 场景将由栈顶 RenderTechnique 对象渲染
	         * @type {Array}
	         */
	        let renderTechniqueStack = [];
	        /**
	         * @param {RenderTechnique} renderTechnique -渲染技侦
	         */
	        this.pushRenderTechnique = function (renderTechnique) {
	            renderTechniqueStack.splice(0,0, renderTechnique);
	        };
	        /**
	         * 移除栈顶 RenderTechnique 对象
	         * @param {boolean} [release=true] -是否释放对象
	         */
	        this.popRenderTechnique = function (release = true) {
	            if(renderTechniqueStack.length === 0)
	                return;
	            //
	            if(release) {
	                renderTechniqueStack[0].release();
	            }
	            //
	            renderTechniqueStack.splice(0,1);
	        };
	        /**
	         * 获取当前使用的 RenderTechnique 对象
	         * @returns {RenderTechnique}
	         */
	        this.getCurrentRenderTechnique = function () {
	            if(renderTechniqueStack.length === 0)
	                return null;
	            //
	            return renderTechniqueStack[0];
	        };

	        //let defaultRenderTechnique = new RenderTechnique(this.renderer, this.scene, this.camera);
	        //let defaultRenderPass = new NormalRenderPass(this.scene, this.camera, defaultRenderTechnique.screenRT);
	        //defaultRenderTechnique.addRenderPass(defaultRenderPass);
	        //this.pushRenderTechnique(defaultRenderTechnique);
	        //
	        let clock = new THREE.Clock();

	        let onProjectObject = function(scene, camera, projectObject) {
	            if(!scene._visibleMeshes) {
	                return;
	            }
	            //
	            for(let n=0, length = scene._visibleMeshes.length; n<length; ++n) {
	                let object = scene._visibleMeshes[n];
	                //
	                projectObject(object, camera, this.sortObjects);
	            }
	            //
	            for(let n=0, length = scene._visibleTerrianLayers.length; n<length; ++n) {
	                scene._visibleTerrianLayers[n].visible = false;
	            }
	            for(let n=0, length = scene._visibleModelLayers.length; n<length; ++n) {
	                scene._visibleModelLayers[n].visible = false;
	            }
	        };

	        let onRenderShadowMap = function(shadowsArray, scene, camera) {
	            if(!scene._visibleTerrianLayers) {
	                return;
	            }
	            //
	            for(let n=0, length = scene._visibleTerrianLayers.length; n<length; ++n) {
	                scene._visibleTerrianLayers[n].visible = true;
	            }
	            for(let n=0, length = scene._visibleModelLayers.length; n<length; ++n) {
	                scene._visibleModelLayers[n].visible = true;
	            }
	        };
	        /**
	         * 渲染场景
	         */
	        this._lastCamera_ = new THREE.Matrix4();
	        this._numSkipUpdate_ = 0;
	        this.renderOneFrame =  (()=> {
	            let pagedLodSet = new Set();
	            //
	            let updateScene = (object, frustum, numFrame) => {
	                let isCameraChanged = true;
	                if(this._lastCamera_.equals(this.camera.matrixWorldInverse)) {
	                    isCameraChanged = false;
	                }
	                else {
	                    this._lastCamera_.copy(this.camera.matrixWorldInverse);
	                }
	                //
	                if(isCameraChanged || this._numSkipUpdate_ === 5) {
	                    for(let n=0, length = this.scene.terrainLayers.length; n<length; ++n) {
	                        if(this.scene.terrainLayers[n].visible) {
	                            this.scene.terrainLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                        }
	                    }
	                }
	                //
	                for(let n=0, length = this.scene.modelLayers.length; n<length; ++n) {
	                    if(this.scene.modelLayers[n].visible) {
	                        if(this.scene.modelLayers[n].isTJHModelLayer) {
	                            if(isCameraChanged || this._numSkipUpdate_ === 5)
	                              this.scene.modelLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                        }
	                        else {
	                            this.scene.modelLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                        }
	                    }
	                }
	                //
	                if(this._numSkipUpdate_ === 5 || isCameraChanged) {
	                    this._numSkipUpdate_ = 0;
	                }
	                else {
	                    ++this._numSkipUpdate_;
	                }
	                //
	                for(let n=0, length = this.scene.featureLayers.length; n<length; ++n) {
	                    if(this.scene.featureLayers[n].visible) {
	                        this.scene.featureLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                    }
	                }
	                //
	                for(let n=0, length = this.scene.arLayers.length; n<length; ++n) {
	                    if(this.scene.arLayers[n].visible) {
	                        this.scene.arLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                    }
	                }
	                //
	                for(let n=0, length = this.scene.customLayers.length; n<length; ++n) {
	                    if(this.scene.customLayers[n].visible) {
	                        this.scene.customLayers[n].update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                    }
	                }
	                //
	                for(let n=0, length = this.scene.temporaryObjs.length; n<length; ++n) {
	                    let object = this.scene.temporaryObjs[n];
	                    //
	                    if(!object.visible) {
	                        continue;
	                    }
	                    //
	                    if(object.isPagedLod) {
	                        object.resetVisible(true, true);
	                        object.isRoot = true;
	                        object.update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                        pagedLodSet.add(object);
	                    }
	                    else if(object.isProxyNode){
	                        object.update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                    }
	                    else if(object.update !== undefined){
	                        object.update({camera:this.camera, frustum:frustum, numFrame:numFrame});
	                    }
	                }
	                //
	                this.scene.currentBoundingBox.makeEmpty();
	                //
	                if(this.renderer.shadowMap.enabled || this.camera.atuoCalculateNearFar) {
	                    for(let i=0, numTerrain = this.scene.terrainLayers.length; i<numTerrain; ++i) {
	                        this.scene.currentBoundingBox.expandByBox3(this.scene.terrainLayers[i].getCurrentBoundingBoxWorld());
	                    }
	                    //
	                    for(let i=0, numModelLayer = this.scene.modelLayers.length; i<numModelLayer; ++i) {
	                        this.scene.currentBoundingBox.expandByBox3(this.scene.modelLayers[i].getCurrentBoundingBoxWorld());
	                    }
	                }
	                //
	                for(let n=0, length = this.scene.lightSources.length; n<length; ++n) {
	                    if(this.renderer.shadowMap.enabled && this.scene.lightSources[n].castShadow) {
	                        if(!this.scene.currentBoundingBox.valid())
	                            break;
	                        //
	                        if(!this.scene.lightSources[n].isDirectionalLight) {
	                            return;
	                        }
	                        //
	                        this.scene.lightSources[n].oldPos = this.scene.lightSources[n].position.clone();
	                        this.scene.lightSources[n].oldTargetPos = this.scene.lightSources[n].target.position.clone();
	                        //
	                        let bb = this.scene.currentBoundingBox.clone();
	                        let sceneCenter = bb.getCenter();
	                        this.scene.lightSources[n].position.add(sceneCenter);
	                        this.scene.lightSources[n].updateMatrixWorld(true);
	                        this.scene.lightSources[n].target.position.copy(sceneCenter);
	                        this.scene.lightSources[n].target.updateMatrixWorld(true);
	                        //
	                        bb.applyMatrix4(this.scene.lightSources[n].shadow.camera.matrixWorldInverse);
	                        //
	                        let tmp = new THREE.Box3();
	                        tmp.expandByPoint(bb.min);
	                        tmp.expandByPoint(bb.max);
	                        //
	                        this.scene.lightSources[n].shadow.camera.left = tmp.min.x;
	                        this.scene.lightSources[n].shadow.camera.right = tmp.max.x;
	                        this.scene.lightSources[n].shadow.camera.top = tmp.max.y;
	                        this.scene.lightSources[n].shadow.camera.bottom = tmp.min.y;
	                        this.scene.lightSources[n].shadow.camera.near = -tmp.max.z - 10;
	                        this.scene.lightSources[n].shadow.camera.far = -tmp.min.z + 10;
	                        //
	                        this.scene.lightSources[n].shadow.camera.updateProjectionMatrix();
	                    }
	                }
	                //
	                let layers = [];
	                for(let n=0, length = this.scene.terrainLayers.length; n<length; ++n) {
	                    if(this.scene.terrainLayers[n].visible && this.scene.terrainLayers[n].loadRequest && this.scene.terrainLayers[n].loadRequest.length > 0) {
	                        layers[layers.length] = {layer:this.scene.terrainLayers[n], bs:this.scene.terrainLayers[n].getBoundingSphereWorld().clone()};
	                    }
	                }
	                //
	                layers.sort((a,b)=> {
	                    if(!a.bs.valid() && b.bs.valid()) {
	                        return -1;
	                    }
	                    if(a.bs.valid() && !b.bs.valid()) {
	                        return 1;
	                    }
	                    if(a.bs.valid() && b.bs.valid()) {
	                        let da = a.bs.center.clone().distanceTo(this.camera.position);
	                        let db = b.bs.center.clone().distanceTo(this.camera.position);
	                        return da - db;
	                    }
	                    //
	                    return 0;
	                });
	                //
	                for(let n=0, length = layers.length; n<length; ++n) {
	                    layers[n].layer.dataBasePager.requestData(layers[n].layer.loadRequest);
	                }
	                //
	                layers = [];
	                for(let n=0, length = this.scene.modelLayers.length; n<length; ++n) {
	                    if(this.scene.modelLayers[n].visible) {
	                        if(this.scene.modelLayers[n].isTJHModelLayer && this.scene.modelLayers[n].loadRequest && this.scene.modelLayers[n].loadRequest.length > 0) {
	                            layers[layers.length] = {layer:this.scene.modelLayers[n], bs:this.scene.modelLayers[n].getBoundingSphereWorld().clone()};
	                        }
	                    }
	                }
	                //
	                layers.sort((a,b)=> {
	                    if(!a.bs.valid() && b.bs.valid()) {
	                        return -1;
	                    }
	                    if(a.bs.valid() && !b.bs.valid()) {
	                        return 1;
	                    }
	                    if(a.bs.valid() && b.bs.valid()) {
	                        let da = a.bs.center.clone().distanceTo(this.camera.position);
	                        let db = b.bs.center.clone().distanceTo(this.camera.position);
	                        return da - db;
	                    }
	                    //
	                    return 0;
	                });
	                //
	                for(let n=0, length = layers.length; n<length; ++n) {
	                    layers[n].layer.dataBasePager.requestData(layers[n].layer.loadRequest);
	                }
	            };
	            //

	            let frustum = new THREE.Frustum();
	            let projScreenMatrix = new THREE.Matrix4();
	            return function () {
	                if(this.onBeginFrame !== undefined)
	                    this.onBeginFrame();
	                //
	                let oldCamera = null;
	                //
	                if(this.active) {
	                    this.camera.updateMatrixWorld(true);
	                    this.camera.pixelSizeVector = THREE.computePixelSizeVector(this.domElement.clientWidth,this.domElement.clientHeight,
	                        this.camera.projectionMatrix, this.camera.matrixWorldInverse);
	                    //
	                    projScreenMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
	                    frustum.setFromMatrix( projScreenMatrix );
	                    //
	                    pagedLodSet.clear();
	                    this.scene.updateMatrixWorld();
	                    updateScene(this.scene, frustum, this.numFrame);
	                    //
	                    if(this.camera.atuoCalculateNearFar && this.scene.currentBoundingBox.valid()) {
	                        oldCamera = this.camera.clone();
	                        let bb = this.scene.currentBoundingBox.clone().applyMatrix4(this.camera.matrixWorldInverse);
	                        let tmp = new THREE.Box3();
	                        tmp.expandByPoint(bb.min);
	                        tmp.expandByPoint(bb.max);
	                        //
	                        if(this.camera.isPerspectiveCamera) {
	                            this.camera.near = -tmp.max.z >= 1.0 ? -tmp.max.z : 1.0;
	                            this.camera.far = -tmp.min.z > this.camera.near ? -tmp.min.z : this.camera.near + 1000;
	                            this.camera.updateProjectionMatrix();
	                        }
	                        else if(this.camera.isOrthographicCamera) {
	                            this.camera.near = -tmp.max.z ;
	                            this.camera.far = -tmp.min.z ;
	                            this.camera.updateProjectionMatrix();
	                        }
	                    }
	                }
	                //
	                this.getCurrentRenderTechnique().renderer.onProjectObject = onProjectObject;
	                this.getCurrentRenderTechnique().renderer.onRenderShadowMap = onRenderShadowMap;
	                //
	                if(this.onBeginRenderTechnique) {
	                    this.onBeginRenderTechnique(this.getCurrentRenderTechnique());
	                }
	                //
	                this.getCurrentRenderTechnique().render();
	                //
	                if(this.onEndRenderTechnique) {
	                    this.onEndRenderTechnique(this.getCurrentRenderTechnique());
	                }
	                //
	                if(this.active) {
	                    if(oldCamera) {
	                        this.camera.copy(oldCamera);
	                        oldCamera = null;
	                    }
	                    pagedLodSet.forEach(function(value, key, ownerSet) {
	                        key.removeUnExpectedChild(10);
	                    });
	                    //
	                    this.scene.removeUnExpected();
	                }
	                //
	                this.fps = 1/ clock.getDelta();
	                //
	                if(this.onEndFrame !== undefined)
	                    this.onEndFrame();
	                //
	                this.numFrame++;
	            }
	        })();

	        /**
	         * 路由 mouse down 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onMouseDown = ( event )=> {
	            if(!this.active) {
	                this.active = true;
	                if(this.onActivate) {
	                    this.onActivate(viewer);
	                }
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            viewer.eventState |= viewer.EventState.LEFT_BTN_DOWN;
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if (viewer.eventListenerStack[i].onMouseDown !== undefined &&
	                    viewer.eventListenerStack[i].onMouseDown(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 mouse up 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onMouseUp = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if (viewer.eventListenerStack[i].onMouseUp !== undefined &&
	                    viewer.eventListenerStack[i].onMouseUp(event)) {
	                    return true;
	                }
	            }
	        };
	        /**
	         * 路由 mouse click 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onClick = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onClick !== undefined &&
	                    viewer.eventListenerStack[i].onClick(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 mouse dblclick 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onDoubleClick = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onDoubleClick !== undefined &&
	                    viewer.eventListenerStack[i].onDoubleClick(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 mouse move 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onMouseMove = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onMouseMove !== undefined &&
	                    viewer.eventListenerStack[i].onMouseMove(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 mouse wheel 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onMouseWheel = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onMouseWheel !== undefined &&
	                    viewer.eventListenerStack[i].onMouseWheel(event)) {
	                    return true;
	                }
	            }
	        };

	        this.onContextMenu = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	        };

	        /**
	         * 路由 key down 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onKeyDown = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onKeyDown !== undefined &&
	                    viewer.eventListenerStack[i].onKeyDown(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 key up 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onKeyUp = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onKeyUp !== undefined &&
	                    viewer.eventListenerStack[i].onKeyUp(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 touch start 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onTouchStart = ( event )=> {
	            if(!this.active) {
	                this.active = true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onTouchStart !== undefined &&
	                    viewer.eventListenerStack[i].onTouchStart(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 touch move 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onTouchMove = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onTouchMove !== undefined &&
	                    viewer.eventListenerStack[i].onTouchMove(event)) {
	                    return true;
	                }
	            }
	        };

	        /**
	         * 路由 touch end 事件
	         * @param event
	         * @returns {boolean}
	         */
	        this.onTouchEnd = ( event )=> {
	            if(!this.active) {
	                return true;
	            }
	            //
	            event.preventDefault();
	            event.stopPropagation();
	            //
	            for(let i=0; i<viewer.eventListenerStack.length; ++i) {
	                if(viewer.eventListenerStack[i].onTouchEnd !== undefined &&
	                    viewer.eventListenerStack[i].onTouchEnd(event)) {
	                    return true;
	                }
	            }
	        };
	        /**
	         * 处理窗口变化事件
	         */
	        this.onWindowResize =()=> {
	            viewer.domElement.width = viewer.domElement.clientWidth;
	            viewer.domElement.height = viewer.domElement.clientHeight;
	            //
	            viewer.camera.aspect = viewer.domElement.clientWidth / viewer.domElement.clientHeight;
	            viewer.camera.updateProjectionMatrix();

	            viewer.getCurrentRenderTechnique().setSize(viewer.domElement.clientWidth, viewer.domElement.clientHeight);
	        };
	        //
	        this.registWindowEvent();
	        //

	        /**
	         * 开始渲染循环
	         */
	        this.run = ()=> {
	            requestAnimationFrame( viewer.run );
	            viewer.renderOneFrame();
	        };
	    }

	    /**
	     * 注册可处理的 window 事件
	     */
	    registWindowEvent() {
	        this.domElement.viewer = this;
	        //
	        this.domElement.addEventListener( 'contextmenu', this.onContextMenu, false );

	        this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
	        this.domElement.addEventListener( 'mouseup', this.onMouseUp, false );
	        this.domElement.addEventListener( 'click', this.onClick, false );
	        this.domElement.addEventListener( 'dblclick', this.onDoubleClick, false );
	        this.domElement.addEventListener( 'mousemove', this.onMouseMove, false );
	        this.domElement.addEventListener( 'wheel', this.onMouseWheel, false );

	        this.domElement.addEventListener( 'touchstart', this.onTouchStart, false );
	        this.domElement.addEventListener( 'touchend', this.onTouchEnd, false );
	        this.domElement.addEventListener( 'touchmove', this.onTouchMove, false );


	        window.addEventListener( 'keydown', this.onKeyDown, false );
	        window.addEventListener( 'keyup', this.onKeyUp, false );

	        window.addEventListener( 'resize', this.onWindowResize, false );
	    }

	    /**
	     *
	     */
	    unregistWindowEvent() {
	        this.domElement.removeEventListener( 'contextmenu', this.onContextMenu, false );

	        this.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
	        this.domElement.removeEventListener( 'mouseup', this.onMouseUp, false );
	        this.domElement.removeEventListener( 'click', this.onClick, false );
	        this.domElement.removeEventListener( 'dblclick', this.onDoubleClick, false );

	        this.domElement.removeEventListener( 'mousemove', this.onMouseMove, false );
	        this.domElement.removeEventListener( 'wheel', this.onMouseWheel, false );

	        this.domElement.removeEventListener( 'touchstart', this.onTouchStart, false );
	        this.domElement.removeEventListener( 'touchend', this.onTouchEnd, false );
	        this.domElement.removeEventListener( 'touchmove', this.onTouchMove, false );

	        window.removeEventListener( 'keydown', this.onKeyDown, false );
	        window.removeEventListener( 'keyup', this.onKeyUp, false );

	        //window.removeEventListener( 'resize', this.onWindowResize, false );
	    }

	    /**
	     * 设置场景对象
	     * @param {ARScene} scene
	     */
	    setScene(scene) {
	        this.scene = scene;
	        this.scene.autoUpdate = false;
	    }

	    /**
	     * 获取场景对象
	     * @returns {ARScene}
	     */
	    getScene() {
	        return this.scene;
	    }

	    /**
	     * 设置相机对象
	     * @param {THREE.Camera} camera
	     */
	    setCamera(camera) {
	        this.camera = camera;
	    }

	    /**
	     * 获取相机对象
	     * @returns {THREE.Camera}
	     */
	    getCamera() {
	        return this.camera;
	    }

	    /**
	     * 设置渲染器
	     * @param {THREE.Renderer} renderer -渲染器
	     */
	    setRenderer(renderer) {
	        this.unregistWindowEvent();
	        //
	        this.renderer = renderer;
	        this.renderer.supportMaterialStencil();
	        this.domElement = this.renderer.domElement;
	        //
	        this.registWindowEvent();
	    }

	    /**
	     * 获取渲染器
	     * @returns {THREE.Renderer}
	     */
	    getRenderer() {
	        return this.renderer;
	    }

	    /**
	     * 设置帧开始事件回掉函数
	     * @param {function} callBack
	     */
	    setBeginFrameCallBack(callBack) {
	        this.onBeginFrame = callBack;
	    }

	    /**
	     * 获取帧开始事件回掉函数
	     * @returns {function}
	     */
	    getBeginFrameCallBack() {
	        return this.onBeginFrame;
	    }

	    /**
	     * 将窗口事件处理对象放入队列顶部
	     * @param {WindowEventListener} eventListener
	     */
	    pushEventListenerFront(eventListener) {
	        this.eventListenerStack.splice(0,0, eventListener);
	        this.scene.addTemporaryObj(eventListener.tempObj);
	    }

	    /**
	     * 将窗口事件处理对象放入队列底部
	     * @param {WindowEventListener} eventListener
	     */
	    pushEventListenerBack(eventListener) {
	        this.eventListenerStack.push(eventListener);
	        this.scene.addTemporaryObj(eventListener.tempObj);
	    }

	    /**
	     * 移除队列顶部窗口事件处理对象
	     * @param {boolean} [release] -是否释放对象
	     */
	    removeEventListenerFront(release = true) {
	        if(release) {
	            this.eventListenerStack[0].release();
	        }
	        this.scene.removeTemporaryObj(this.eventListenerStack[0].tempObj);
	        this.eventListenerStack.splice(0,1);
	    }

	    /**
	     * 移除队列底部窗口事件处理对象
	     * @param {boolean} [release] -是否释放对象
	     */
	    removeEventListenerBack(release = true) {
	        if(release) {
	            this.eventListenerStack[this.eventListenerStack.length-1].release();
	        }
	        this.scene.removeTemporaryObj(this.eventListenerStack[0].tempObj);
	        this.eventListenerStack.remove(this.eventListenerStack.length-1);
	    }

	    /**
	     * 获取队列顶部窗口事件处理对象
	     * @return {WindowEventListener}
	     */
	    getFrontEventListener() {
	        return this.eventListenerStack[0];
	    }
	}

	/**
	 * 一个简单的地形浏览控制器
	 * @class
	 * @memberof tjh.ar
	 * @extends tjh.ar.WindowEventListener
	 */
	class BasicTerrainControls extends  WindowEventListener {
	    constructor(viewer) {
	        super(viewer);
	        //
	        this.geomRotateFlag = new THREE.Group();
	        let geometry = new THREE.ConeGeometry( 5, 20, 32 );
	        let material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
	        material.lights = true;
	        let cone = new THREE.Mesh( geometry, material );
	        cone.setRotationFromAxisAngle(new  THREE.Vector3(-1,0,0), 3.1415926/2);
	        this.geomRotateFlag.add(cone);

	        this.leftBtnDown = false;
	        this.middleBtnDown = false;
	        this.rightBtnDown = false;

	        this.intersectionPos = null;

	        this.oldMx = 0;
	        this.oldMy = 0;

	        this._floorPlane_ = null;
	    }

	    onLeftDown(mouseEvent) {
	        this.leftBtnDown = true;
	        //
	        if(this.viewer.camera.isPerspectiveCamera) {
	            let terrainBox = new THREE.Box3();
	            for(let n=0; n < this.viewer.scene.terrainLayers.length; ++n) {
	                terrainBox.expandByBox3(this.viewer.scene.terrainLayers[n].getBoundingBoxWorld());
	            }
	            if(terrainBox.valid()) {
	                this._floorPlane_ = new THREE.Plane();
	                this._floorPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), terrainBox.min);
	            }
	            else {
	                this._floorPlane_ = new THREE.Plane();
	                this._floorPlane_.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0));
	            }
	        }
	        else if(this.viewer.camera.isOrthographicCamera) {
	            let terrainBs = new THREE.Sphere();
	            for(let n=0; n < this.viewer.scene.terrainLayers.length; ++n) {
	                terrainBs.expandBySphere(this.viewer.scene.terrainLayers[n].getBoundingSphereWorld());
	            }
	            //
	            this._floorPlane_ = new THREE.Plane();
	            let lookAt = this.viewer.camera.matrixWorldInverse.getLookAt();
	            this._floorPlane_.setFromNormalAndCoplanarPoint(lookAt.lookDirection, terrainBs.center.add(lookAt.lookDirection.clone().multiplyScalar(terrainBs.radius)));
	        }
	        //
	        return true;
	    }

	    onMiddleDown(mouseEvent) {
	        const clientX = mouseEvent.offsetX;
	        const clientY = mouseEvent.offsetY;
	        //
	        let raycaster = new THREE.Raycaster();
	        let mouse = new THREE.Vector2();

	        mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
	        mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;

	        raycaster.setFromCamera( mouse, this.viewer.getCamera());
	        if(this.viewer.getCamera().isOrthographicCamera) {
	            let testOrigin = new THREE.Vector3(mouse.x, mouse.y, -1).unproject(this.viewer.getCamera());
	            raycaster.ray.origin.copy(testOrigin);
	        }
	        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

	        if(intersects.length <= 0) {
	            return false;
	        }
	        //
	        this.intersectionPos = intersects[0].point;

	        // 相交视椎体添加到temporaryObj图层中
	        this.geomRotateFlag.position.set(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	        this.geomRotateFlag.updateMatrix();
	        //
	        let scale = 3 *(this.geomRotateFlag.position.clone().dot(this.viewer.camera.pixelSizeVector)+ this.viewer.camera.pixelSizeVector.w);
	        scale = scale > 0 ? scale : -scale;
	        this.geomRotateFlag.scale.set(scale, scale, scale);
	        this.geomRotateFlag.updateMatrix();
	        //
	        this.tempObj.add(this.geomRotateFlag);
	        //
	        this.middleBtnDown = true;
	        //
	        return true;
	    }

	    onRightDown(mouseEvent) {
	        return false;
	    }

	    onLeftUp(mouseEvent) {
	        this.leftBtnDown = false;
	        return true;
	    }

	    onMiddleUp(mouseEvent) {
	        this.tempObj.remove(this.geomRotateFlag);
	        this.middleBtnDown = false;
	        return true;
	    }

	    onRightUp(mouseEvent) {
	        return false;
	    }

	    onMouseMove(mouseEvent) {
	        const clientX = mouseEvent.offsetX;
	        const clientY = mouseEvent.offsetY;
	        //
	        if(this.leftBtnDown) {
	            let raycaster0 = new THREE.Raycaster();
	            let mouse0 = new THREE.Vector2();
	            mouse0.x = ( this.oldMx / this.viewer.domElement.clientWidth ) * 2 - 1;
	            mouse0.y = - ( this.oldMy / this.viewer.domElement.clientHeight ) * 2 + 1;
	            raycaster0.setFromCamera( mouse0, this.viewer.getCamera());
	            if(this.viewer.getCamera().isOrthographicCamera) {
	                let testOrigin = new THREE.Vector3(mouse0.x, mouse0.y, -1).unproject(this.viewer.getCamera());
	                raycaster0.ray.origin.copy(testOrigin);
	            }
	            let intersect0 = new THREE.Vector3();
	            intersect0 = raycaster0.ray.intersectPlane(this._floorPlane_, intersect0);
	            //
	            let raycaster = new THREE.Raycaster();
	            let mouse = new THREE.Vector2();
	            mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
	            mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;
	            raycaster.setFromCamera( mouse, this.viewer.getCamera());
	            if(this.viewer.getCamera().isOrthographicCamera) {
	                let testOrigin = new THREE.Vector3(mouse.x, mouse.y, -1).unproject(this.viewer.getCamera());
	                raycaster.ray.origin.copy(testOrigin);
	            }
	            let intersect1 = new THREE.Vector3();
	            intersect1 = raycaster.ray.intersectPlane(this._floorPlane_, intersect1);
	            //
	            let translate = intersect0.sub(intersect1);
	            //
	            let tranMatrix = new THREE.Matrix4();
	            tranMatrix.makeTranslation(translate.x, translate.y, translate.z);
	            this.viewer.camera.position.applyMatrix4(tranMatrix);
	        }
	        else if(this.middleBtnDown) {
	            var pos = new THREE.Vector3();
	            var q = new THREE.Quaternion();
	            var s = new THREE.Vector3();
	            //delta y;
	            {
	                let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
	                look_at.right = look_at.up.clone();
	                look_at.right.cross(look_at.lookDirection);
	                look_at.right.normalize();
	                //
	                let raycaster = new THREE.Raycaster();
	                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
	                //
	                let tranMatrix0 = new THREE.Matrix4();
	                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
	                let rotateMatrix0 = new THREE.Matrix4();
	                let ax = new THREE.Vector3(look_at.right.x, look_at.right.y, 0);
	                ax.normalize();
	                rotateMatrix0.makeRotationAxis(ax, (-clientY + this.oldMy)*3.1415926/180);
	                let tranMatrix1 = new THREE.Matrix4();
	                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	                //
	                let transform = tranMatrix0.premultiply(rotateMatrix0).premultiply(tranMatrix1);
	                transform.premultiply(this.viewer.camera.matrixWorldInverse);
	                //
	                let camMatrix = new THREE.Matrix4();
	                camMatrix.getInverse(transform);
	                camMatrix.decompose(pos, q, s);
	                this.viewer.camera.position.copy(pos);
	                this.viewer.camera.quaternion.copy(q);
	                this.viewer.camera.scale.copy(s);
	                this.viewer.camera.updateMatrixWorld(true);
	            }
	            //delta x
	            {
	                let raycaster = new THREE.Raycaster();
	                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
	                //
	                let tranMatrix0 = new THREE.Matrix4();
	                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
	                let rotateMatrix1 = new THREE.Matrix4();
	                let ax = new THREE.Vector3(0,0,1);
	                let mm = new THREE.Matrix4();
	                mm.getInverse(this.viewer.scene.terrainLayers[0].matrixWorld).transpose();
	                ax.applyMatrix4(mm);
	                ax.normalize();
	                rotateMatrix1.makeRotationAxis(ax, (-clientX + this.oldMx)*3.1415926/180);
	                let tranMatrix1 = new THREE.Matrix4();
	                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	                //
	                let transform = tranMatrix0.premultiply(rotateMatrix1).premultiply(tranMatrix1);
	                transform.premultiply(this.viewer.camera.matrixWorldInverse);
	                let camMatrix = new THREE.Matrix4();
	                camMatrix.getInverse(transform);
	                camMatrix.decompose(pos, q, s);
	                this.viewer.camera.position.copy(pos);
	                this.viewer.camera.quaternion.copy(q);
	                this.viewer.camera.scale.copy(s);
	                this.viewer.camera.updateMatrixWorld(true);
	            }
	        }
	        else if(this.rightBtnDown) {

	        }
	        //
	        this.oldMx = clientX;
	        this.oldMy = clientY;
	        //
	        return true;
	    }


	    onMouseWheel(wheelEvent) {
	        const delta = -wheelEvent.deltaY;
	        //
	        if(this.viewer.getCamera().isPerspectiveCamera) {
	            let minz = 0;
	            /*for(let n=0; n<this.viewer.scene.terrainLayers.length; ++n) {
	                let terrain = this.viewer.scene.terrainLayers[n];
	                if(!terrain.visible)
	                    continue;
	                //
	                let bx = terrain.getBoundingBox(false);
	                if(bx.min.z < minz)
	                    minz = bx.min.z;
	            }*/
	            //
	            let terrainBottomPlane = new THREE.Plane();
	            terrainBottomPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,minz));
	            //
	            let raycaster = new THREE.Raycaster();
	            let mouse = new THREE.Vector2();

	            mouse.x = ( wheelEvent.clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
	            mouse.y = - ( wheelEvent.clientY / this.viewer.domElement.clientHeight ) * 2 + 1;

	            raycaster.setFromCamera( mouse, this.viewer.getCamera());
	            let intersectP = new THREE.Vector3();
	            intersectP = raycaster.ray.intersectPlane(terrainBottomPlane, intersectP);

	            if(intersectP) {
	                let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
	                this.viewer.camera.position.add(look_at.lookDirection.multiplyScalar((intersectP.sub(look_at.eye).length()/20)*(delta > 0? 1 : -1)));
	                return true;
	            }
	            //
	            let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
	            this.viewer.camera.position.add(look_at.lookDirection.multiplyScalar(15*(delta > 0? 1 : -1)));
	            return true;
	        }
	        else if(this.viewer.getCamera().isOrthographicCamera) {
	            if(delta < 0) {
	                let scaleMt = new THREE.Matrix4();
	                scaleMt.makeScale(1.1,1.1,1.1);
	                this.viewer.camera.left = (new THREE.Vector3(this.viewer.camera.left, 0, 0)).applyMatrix4(scaleMt).x;
	                this.viewer.camera.right = (new THREE.Vector3(this.viewer.camera.right, 0, 0)).applyMatrix4(scaleMt).x;
	                this.viewer.camera.bottom = (new THREE.Vector3(0, this.viewer.camera.bottom, 0)).applyMatrix4(scaleMt).y;
	                this.viewer.camera.top = (new THREE.Vector3(0, this.viewer.camera.top, 0)).applyMatrix4(scaleMt).y;
	                //
	                this.viewer.camera.updateProjectionMatrix();
	            }
	            else if(delta > 0) {
	                let scaleMt = new THREE.Matrix4();
	                scaleMt.makeScale(0.9,0.9,0.9);
	                this.viewer.camera.left = (new THREE.Vector3(this.viewer.camera.left, 0, 0)).applyMatrix4(scaleMt).x;
	                this.viewer.camera.right = (new THREE.Vector3(this.viewer.camera.right, 0, 0)).applyMatrix4(scaleMt).x;
	                this.viewer.camera.bottom = (new THREE.Vector3(0, this.viewer.camera.bottom, 0)).applyMatrix4(scaleMt).y;
	                this.viewer.camera.top = (new THREE.Vector3(0, this.viewer.camera.top, 0)).applyMatrix4(scaleMt).y;
	                //
	                this.viewer.camera.updateProjectionMatrix();
	            }
	            return true;
	        }
	    }
	}

	/**
	 * 一个简单的航空影像浏览控制器
	 * @class
	 * @memberof tjh.ar
	 * @extends tjh.ar.WindowEventListener
	 */
	class BasicArControls extends  WindowEventListener {
	    constructor(viewer) {
	        super(viewer);
	        //
	        this.geomRotateFlag = new THREE.Group();
	        let geometry = new THREE.ConeGeometry( 5, 20, 32 );
	        let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	        let cone = new THREE.Mesh( geometry, material );
	        cone.setRotationFromAxisAngle(new  THREE.Vector3(-1,0,0), 3.1415926/2);
	        this.geomRotateFlag.add(cone);

	        this.leftBtnDown = false;
	        this.middleBtnDown = false;
	        this.rightBtnDown = false;

	        this.intersectionPos = null;

	        this.lastArNode = null;
	        this.lastArLayer = null;
	        this.currentArLayer = null;

	        this.oldMx = 0;
	        this.oldMy = 0;
	    }

	    onLeftDown(mouseEvent) {
	        this.leftBtnDown = true;
	        //
	        return true;
	    }

	    onMiddleDown(mouseEvent) {
	        const clientX = mouseEvent.offsetX;
	        const clientY = mouseEvent.offsetY;
	        //
	        let raycaster = new THREE.Raycaster();
	        let mouse = new THREE.Vector2();

	        mouse.x = ( clientX / this.viewer.domElement.clientWidth ) * 2 - 1;
	        mouse.y = - ( clientY / this.viewer.domElement.clientHeight ) * 2 + 1;

	        raycaster.setFromCamera( mouse, this.viewer.getCamera());
	        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

	        if(intersects.length <= 0) {
	            return false;
	        }
	        //
	        this.intersectionPos = intersects[0].point;

	        this.geomRotateFlag.position.set(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	        let scale = 3 *(this.geomRotateFlag.position.clone().dot(this.viewer.camera.pixelSizeVector)+ this.viewer.camera.pixelSizeVector.w);
	        scale = scale > 0 ? scale : -scale;
	        this.geomRotateFlag.scale.set(scale, scale, scale);
	        this.geomRotateFlag.updateMatrix();
	        //
	        this.tempObj.add(this.geomRotateFlag);
	        //
	        this.viewer.scene.arLayers[0].removeImgNode();
	        //
	        this.middleBtnDown = true;
	        //

	        let frustum = this.viewer.camera.projectionMatrix.getFrustum();
	        if(Math.abs(frustum.left+frustum.right) > 0.000001 || Math.abs(frustum.bottom+frustum.top)>0.000001) {
	            let oldLookAt = this.viewer.camera.matrixWorldInverse.getLookAt();
	            let disEyeToInter = this.intersectionPos.clone().sub(oldLookAt.eye).length();
	            //
	            let projectionInter = this.intersectionPos.clone().applyMatrix4(this.viewer.camera.matrixWorldInverse).applyMatrix4(this.viewer.camera.projectionMatrix);
	            //
	            let frustumHWidth = (frustum.right - frustum.left)/2;
	            let frustumHHeight = (frustum.top - frustum.bottom)/2;
	            this.viewer.camera.projectionMatrix.makeFrustum(-frustumHWidth, frustumHWidth, frustumHHeight, -frustumHHeight, frustum.zNear, frustum.zFar);
	            //
	            let plane = new THREE.Plane();
	            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.intersectionPos);
	            //
	            raycaster.setFromCamera( new THREE.Vector2(0, 0), this.viewer.getCamera());
	            let lookCenter = raycaster.ray.intersectPlane(plane);
	            let disCurrent = lookCenter.clone().sub(oldLookAt.eye).length();
	            this.viewer.camera.position.sub(oldLookAt.lookDirection.clone().multiplyScalar(disEyeToInter - disCurrent));
	            this.viewer.camera.updateMatrixWorld();
	            //
	            raycaster.setFromCamera( new THREE.Vector2(projectionInter.x, projectionInter.y), this.viewer.getCamera());

	            let pt = raycaster.ray.intersectPlane(plane);
	            this.viewer.camera.position.x+=this.intersectionPos.x - pt.x;
	            this.viewer.camera.position.y+=this.intersectionPos.y - pt.y;
	            //
	            lookCenter.x += this.intersectionPos.x - pt.x;
	            lookCenter.y += this.intersectionPos.y - pt.y;
	            //
	            this.viewer.camera.up.copy(oldLookAt.up);
	            this.viewer.camera.lookAt(lookCenter);
	            //
	            this.viewer.camera.updateMatrixWorld(true);
	        }
	        return true;
	    }

	    onRightDown(mouseEvent) {
	        return false;
	    }

	    onLeftUp(mouseEvent) {
	         this.leftBtnDown = false;
	         //
	        let raycaster = new THREE.Raycaster();
	        raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
	        let intersects = raycaster.intersectObjects( this.viewer.scene.terrainLayers);

	        if(intersects.length <= 0) {
	            return true;
	        }
	        //
	        this.intersectionPos = intersects[0].point;
	        //
	        let tmpCamera = this.viewer.camera.clone();
	        //
	        let frustum = tmpCamera.projectionMatrix.getFrustum();
	        if(Math.abs(frustum.left+frustum.right) > 0.000001 || Math.abs(frustum.bottom+frustum.top)>0.000001) {
	            let oldLookAt = tmpCamera.matrixWorldInverse.getLookAt();
	            let disEyeToInter = this.intersectionPos.clone().sub(oldLookAt.eye).length();
	            //
	            let projectionInter = this.intersectionPos.clone().applyMatrix4(tmpCamera.matrixWorldInverse).applyMatrix4(tmpCamera.projectionMatrix);
	            //
	            let frustumHWidth = (frustum.right - frustum.left)/2;
	            let frustumHHeight = (frustum.top - frustum.bottom)/2;
	            tmpCamera.projectionMatrix.makeFrustum(-frustumHWidth, frustumHWidth, frustumHHeight, -frustumHHeight, frustum.zNear, frustum.zFar);
	            //
	            let plane = new THREE.Plane();
	            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), this.intersectionPos);
	            //
	            raycaster.setFromCamera( new THREE.Vector2(0, 0), tmpCamera);
	            let lookCenter = raycaster.ray.intersectPlane(plane);
	            let disCurrent = lookCenter.clone().sub(oldLookAt.eye).length();
	            tmpCamera.position.sub(oldLookAt.lookDirection.clone().multiplyScalar(disEyeToInter - disCurrent));
	            tmpCamera.updateMatrixWorld();
	            //
	            raycaster.setFromCamera( new THREE.Vector2(projectionInter.x, projectionInter.y), tmpCamera);

	            let pt = raycaster.ray.intersectPlane(plane);
	            tmpCamera.position.x+=this.intersectionPos.x - pt.x;
	            tmpCamera.position.y+=this.intersectionPos.y - pt.y;
	            //
	            lookCenter.x += this.intersectionPos.x - pt.x;
	            lookCenter.y += this.intersectionPos.y - pt.y;
	            //
	            tmpCamera.up.copy(oldLookAt.up);
	            tmpCamera.lookAt(lookCenter);
	            //
	            tmpCamera.updateMatrixWorld(true);
	        }
	        //
	        let arNode = null;
	        for (let j = 0, len = this.viewer.scene.arLayers.length; j < len; ++j) {
	            if (!this.viewer.scene.arLayers[j].visible)
	                continue;
	            arNode = this.viewer.scene.arLayers[j].searchPhotoByNearest1(tmpCamera, this.intersectionPos);
	            if (arNode) {
	                this.currentArLayer = this.viewer.scene.arLayers[j];
	                break;
	            }
	        }
	        if ((!this.lastArNode && arNode) || (arNode && this.lastArNode && arNode.index !== this.lastArNode.index)) {
	            if (this.lastArLayer)
	                this.lastArLayer.removeImgNode();
	            this.viewer.camera.copy(tmpCamera);
	            this.lastArNode = arNode.clone();
	            this.currentArLayer.applyArNode(this.viewer.camera, arNode, this.intersectionPos);
	            this.lastArLayer = this.currentArLayer;
	        }

	        //
	        return true;
	    }

	    onMiddleUp(mouseEvent) {
	        const clientX = mouseEvent.offsetX;
	        const clientY = mouseEvent.offsetY;
	        //
	        this.tempObj.remove(this.geomRotateFlag);
	        this.middleBtnDown = false;
	        //
	        let arNode = null;
	        for (let j = 0, len = this.viewer.scene.arLayers.length; j < len; ++j) {
	            if (!this.viewer.scene.arLayers[j].visible)
	                continue;
	            arNode = this.viewer.scene.arLayers[j].searchPhotoByNearest1(this.viewer.camera, this.intersectionPos);
	            if (arNode) {
	                this.currentArLayer = this.viewer.scene.arLayers[j];
	                break;
	            }
	        }
	        //
	        //if((!this.lastArNode) || (arNode && this.lastArNode.index !== arNode.index)) {
	        if (arNode){
	            this.lastArNode = arNode.clone();
	            this.currentArLayer.applyArNode(this.viewer.camera, arNode, this.intersectionPos);
	            this.lastArLayer = this.currentArLayer;        }
	        //}

	        //this.viewer.camera.projectionMatrix.copy(arNode.projectionMatrix);
	        //
	        return true;
	    }

	    onRightUp(mouseEvent) {
	        return false;
	    }

	    onMouseMove(mouseEvent) {
	        const clientX = mouseEvent.offsetX;
	        const clientY = mouseEvent.offsetY;
	        //
	        if(this.leftBtnDown) {
	            let pers = this.viewer.camera.projectionMatrix.getPerspective();
	            let frustum = this.viewer.camera.projectionMatrix.getFrustum();
	            let translate0 = new THREE.Matrix4();
	            translate0.makeTranslation(-(clientX - this.oldMx)*Math.sin(pers.fovy*pers.aspectRatio*3.1415926/180)/this.viewer.domElement.clientWidth, -(-clientY + this.oldMy)*Math.sin(pers.fovy*3.1415926/180)/this.viewer.domElement.clientHeight, 0);
	            let tm = new THREE.Matrix4();
	            tm.premultiply(translate0);
	            //
	            let np_lb = new THREE.Vector3(frustum.left, frustum.bottom, frustum.zNear);
	            np_lb.applyMatrix4(tm);
	            let np_rt = new THREE.Vector3(frustum.right, frustum.top, frustum.zNear);
	            np_rt.applyMatrix4(tm);
	            //
	            frustum.left = np_lb.x;
	            frustum.right = np_rt.x;
	            frustum.bottom = np_lb.y;
	            frustum.top = np_rt.y;
	            //
	            this.viewer.camera.projectionMatrix.makeFrustum(frustum.left, frustum.right, frustum.top, frustum.bottom, frustum.zNear, frustum.zFar);
	        }
	        else if(this.middleBtnDown) {
	            var pos = new THREE.Vector3();
	            var q = new THREE.Quaternion();
	            var s = new THREE.Vector3();
	            //delta y;
	            {
	                let look_at = this.viewer.camera.matrixWorldInverse.getLookAt();
	                look_at.right = look_at.up.clone();
	                look_at.right.cross(look_at.lookDirection);
	                look_at.right.normalize();
	                //
	                let raycaster = new THREE.Raycaster();
	                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
	                //
	                let tranMatrix0 = new THREE.Matrix4();
	                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
	                let rotateMatrix0 = new THREE.Matrix4();
	                let ax = new THREE.Vector3(look_at.right.x, look_at.right.y, 0);
	                ax.normalize();
	                rotateMatrix0.makeRotationAxis(ax, (-clientY + this.oldMy)*3.1415926/180);
	                let tranMatrix1 = new THREE.Matrix4();
	                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	                //
	                let transform = tranMatrix0.premultiply(rotateMatrix0).premultiply(tranMatrix1);
	                transform.premultiply(this.viewer.camera.matrixWorldInverse);
	                let camMatrix = new THREE.Matrix4();
	                camMatrix.getInverse(transform);
	                camMatrix.decompose(pos, q, s);
	                this.viewer.camera.position.copy(pos);
	                this.viewer.camera.quaternion.copy(q);
	                this.viewer.camera.scale.copy(s);

	                this.viewer.camera.updateMatrixWorld(true);
	            }
	            //delta x
	            {
	                let raycaster = new THREE.Raycaster();
	                raycaster.setFromCamera( new THREE.Vector2(0,0), this.viewer.getCamera());
	                //
	                let tranMatrix0 = new THREE.Matrix4();
	                tranMatrix0.makeTranslation(-this.intersectionPos.x, -this.intersectionPos.y, -this.intersectionPos.z);
	                let rotateMatrix1 = new THREE.Matrix4();
	                let ax = new THREE.Vector3(0,0,1);
	                let mm = new THREE.Matrix4();
	                mm.getInverse(this.viewer.scene.terrainLayers[0].matrixWorld).transpose();
	                ax.applyMatrix4(mm);
	                ax.normalize();
	                rotateMatrix1.makeRotationAxis(ax, (-clientX + this.oldMx)*3.1415926/180);
	                let tranMatrix1 = new THREE.Matrix4();
	                tranMatrix1.makeTranslation(this.intersectionPos.x, this.intersectionPos.y, this.intersectionPos.z);
	                //
	                let transform = tranMatrix0.premultiply(rotateMatrix1).premultiply(tranMatrix1);
	                transform.premultiply(this.viewer.camera.matrixWorldInverse);
	                let camMatrix = new THREE.Matrix4();
	                camMatrix.getInverse(transform);
	                camMatrix.decompose(pos, q, s);
	                this.viewer.camera.position.copy(pos);
	                this.viewer.camera.quaternion.copy(q);
	                this.viewer.camera.scale.copy(s);
	                this.viewer.camera.updateMatrixWorld(true);
	            }
	        }
	        else if(this.rightBtnDown) {

	        }
	        //
	        this.oldMx = clientX;
	        this.oldMy = clientY;
	        //
	        return true;
	    }

	    onMouseWheel(wheelEvent) {
	        const delta = -wheelEvent.deltaY;
	        //
	        let frustum = this.viewer.camera.projectionMatrix.getFrustum();
	        let frustumCenter = new THREE.Vector3((frustum.left+frustum.right)/2, (frustum.bottom+frustum.top)/2, frustum.zNear);
	        let translate0 = new THREE.Matrix4();
	        translate0.makeTranslation(-frustumCenter.x, -frustumCenter.y, -frustumCenter.z);
	        let scale = new THREE.Matrix4();

	        let ratio = 1 - delta/(this.viewer.domElement.clientWidth + this.viewer.domElement.clientHeight);
	        scale.makeScale(ratio, ratio, ratio);
	        let translate1 = new THREE.Matrix4();
	        translate1.makeTranslation(frustumCenter.x, frustumCenter.y, frustumCenter.z);
	        let tm = new THREE.Matrix4();
	        tm.premultiply(translate0).premultiply(scale).premultiply(translate1);
	        //
	        let np_lb = new THREE.Vector3(frustum.left, frustum.bottom, frustum.zNear);
	        np_lb.applyMatrix4(tm);
	        let np_rt = new THREE.Vector3(frustum.right, frustum.top, frustum.zNear);
	        np_rt.applyMatrix4(tm);
	        //
	        frustum.left = np_lb.x;
	        frustum.right = np_rt.x;
	        frustum.bottom = np_lb.y;
	        frustum.top = np_rt.y;
	        //
	        this.viewer.camera.projectionMatrix.makeFrustum(frustum.left, frustum.right, frustum.top, frustum.bottom, frustum.zNear, frustum.zFar);

	        return true;
	    }
	}

	class NormalRenderPass extends RenderPass {
	    constructor(scene, camera, renderTarget) {
	        super(scene, camera, renderTarget);
	        let visibleTerrainRange = new THREE.Box3();
	        let textureMatrix = new THREE.Matrix4();
	        //
	        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
	        //
	        let terrainDepthRT = new THREE.WebGLRenderTarget( this.renderTarget.width, this.renderTarget.height, pars );
	        terrainDepthRT.texture.generateMipmaps = false;
	        let terrainDepthCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
	        terrainDepthCamera.position.set(0,0,0);
	        terrainDepthCamera.up.set(0,1,0);
	        terrainDepthCamera.lookAt(0,0,-1);
	        terrainDepthCamera.updateMatrixWorld();
	        let terrainDepthCameraNearFar = new THREE.Vector2();
	        let memDepthSapmler = new MemDepthSampler();
	        memDepthSapmler.data = new Uint8Array(this.renderTarget.width * this.renderTarget.height * 4);
	        memDepthSapmler.size[0] = this.renderTarget.width;
	        memDepthSapmler.size[1] = this.renderTarget.height;
	        let depthBufferUpdated = false;
	        //
	        let terrainDepthRenderPass = new RenderPass(scene);
	        terrainDepthRenderPass.overrideMaterial = new THREE.MeshDepthMaterial();
	        terrainDepthRenderPass.overrideMaterial.side = THREE.FrontSide;
	        terrainDepthRenderPass.overrideMaterial.depthPacking = THREE.RGBADepthPacking;
	        terrainDepthRenderPass.overrideMaterial.blending = THREE.NoBlending;
	        terrainDepthRenderPass.frequencyOfReadDepthBuffer = 5;
	        terrainDepthRenderPass.numSkipReadDepthBuffer = 0;
	        terrainDepthRenderPass.render = function (renderer) {
	            let visibleObjs = [];
	            for(let i=0; i<this.scene.featureLayers.length; ++i) {
	                if(this.scene.featureLayers[i].visible) {
	                    this.scene.featureLayers[i].visible = false;
	                    visibleObjs.push(this.scene.featureLayers[i]);
	                }
	            }
	            for(let i=0; i<this.scene.modelLayers.length; ++i) {
	                if(this.scene.modelLayers[i].visible) {
	                    this.scene.modelLayers[i].visible = false;
	                    visibleObjs.push(this.scene.modelLayers[i]);
	                }
	            }
	            for(let i=0; i<this.scene.arLayers.length; ++i) {
	                if(this.scene.arLayers[i].visible) {
	                    this.scene.arLayers[i].visible = false;
	                    visibleObjs.push(this.scene.arLayers[i]);
	                }
	            }
	            for(let i=0; i<this.scene.temporaryObjs.length; ++i) {
	                if(this.scene.temporaryObjs[i].visible) {
	                    this.scene.temporaryObjs[i].visible = false;
	                    visibleObjs.push(this.scene.temporaryObjs[i]);
	                }
	            }
	            //
	            visibleTerrainRange.makeEmpty();
	            //
	            for(let i=0; i<this.scene.terrainLayers.length; ++i) {
	                if(this.scene.terrainLayers[i].visible) {
	                    visibleTerrainRange.expandByBox3(this.scene.terrainLayers[i].getCurrentBoundingBoxWorld());
	                }
	            }
	            //
	            let oldClearColor = renderer.getClearColor().clone();
	            let oldClearAlpha = renderer.getClearAlpha();
	            renderer.setClearColor(new THREE.Color(1.0,1.0,1.0), 1.0);
	            //
	            if(!visibleTerrainRange.valid()) {
	                terrainDepthCamera.visible = false;
	                renderer.clearTarget(terrainDepthRT, true, false, false);
	                renderer.setClearColor(oldClearColor, oldClearAlpha);
	                for(let i=0; i<visibleObjs.length; ++i) {
	                    visibleObjs[i].visible = true;
	                    visibleObjs[i] = null;
	                }
	                return true;
	            }
	            //
	            if(this.numSkipReadDepthBuffer%this.frequencyOfReadDepthBuffer === 0) {
	                this.numSkipReadDepthBuffer = 0;
	                depthBufferUpdated = true;
	            }
	            else {
	                depthBufferUpdated = false;
	            }
	            //
	            terrainDepthCameraNearFar.x = -visibleTerrainRange.max.z - 10;
	            terrainDepthCameraNearFar.y = -visibleTerrainRange.min.z + 10;
	            terrainDepthCamera.visible = true;
	            terrainDepthCamera.left = visibleTerrainRange.min.x;
	            terrainDepthCamera.right = visibleTerrainRange.max.x;
	            terrainDepthCamera.top = visibleTerrainRange.max.y;
	            terrainDepthCamera.bottom = visibleTerrainRange.min.y;
	            terrainDepthCamera.near = terrainDepthCameraNearFar.x;
	            terrainDepthCamera.far = terrainDepthCameraNearFar.y;
	            terrainDepthCamera.updateProjectionMatrix();
	            //
	            if(depthBufferUpdated) {
	                memDepthSapmler.noValue = visibleTerrainRange.max.z;
	                memDepthSapmler.range[0] = terrainDepthCamera.left;
	                memDepthSapmler.range[1] = terrainDepthCamera.right;
	                memDepthSapmler.range[2] = terrainDepthCamera.bottom;
	                memDepthSapmler.range[3] = terrainDepthCamera.top;
	                memDepthSapmler.cameraNearFar[0] = terrainDepthCamera.near;
	                memDepthSapmler.cameraNearFar[1] = terrainDepthCamera.far;
	            }
	            //
	            this.scene.overrideMaterial = this.overrideMaterial;
	            //
	            renderer.render(this.scene, terrainDepthCamera, terrainDepthRT);
	            this.scene.overrideMaterial = undefined;
	            renderer.setClearColor(oldClearColor, oldClearAlpha);
	            //
	            for(let i=0; i<visibleObjs.length; ++i) {
	                visibleObjs[i].visible = true;
	                visibleObjs[i] = null;
	            }
	            visibleObjs = null;
	            //
	            textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
	                0.0, 0.5, 0.0, 0.5,
	                0.0, 0.0, 0.5, 0.5,
	                0.0, 0.0, 0.0, 1.0 );
	            textureMatrix.multiply( terrainDepthCamera.projectionMatrix );
	            textureMatrix.multiply( terrainDepthCamera.matrixWorldInverse );
	            //
	            if(depthBufferUpdated) {
	                renderer.readRenderTargetPixels(terrainDepthRT, 0, 0, terrainDepthRT.width, terrainDepthRT.height, memDepthSapmler.data);
	            }
	            //
	            this.numSkipReadDepthBuffer++;
	            //
	            return true;
	        };

	        this.setRenderResource = (scene, camera, renderTarget)=> {
	            this.scene = scene;
	            this.camera = camera;
	            this.renderTarget = renderTarget;
	            //
	            terrainDepthRenderPass.scene = scene;
	        };

	        this.render = (renderer)=> {
	            let needTerrainDepthRenderPass = false;
	            for(let i=0, numFtLayer = this.scene.featureLayers.length; i<numFtLayer; ++i) {
	                if(this.scene.featureLayers[i].visible && this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH) {
	                    needTerrainDepthRenderPass = true;
	                    break;
	                }
	            }
	            if(needTerrainDepthRenderPass) {
	                terrainDepthRenderPass.render(renderer);
	            }
	            //
	            for(let i=0, numFtLayer = this.scene.featureLayers.length; i<numFtLayer; ++i) {
	                if(!this.scene.featureLayers[i].visible) {
	                    continue;
	                }
	                if(this.scene.featureLayers[i].lineMaterial) {
	                    this.scene.featureLayers[i].lineMaterial.uniforms["resolution"].value.set(this.renderTarget.width, this.renderTarget.height);
	                    this.scene.featureLayers[i].lineMaterial.needUpdate = true;
	                }
	                //
	                if(this.scene.featureLayers[i].visible && this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH) {
	                    this.scene.featureLayers[i].memDepthSampler = depthBufferUpdated ? memDepthSapmler : null;
	                    //
	                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].pointMaterial) {
	                        this.scene.featureLayers[i].pointMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
	                        this.scene.featureLayers[i].pointMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
	                        this.scene.featureLayers[i].pointMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
	                        this.scene.featureLayers[i].pointMaterial.uniforms["textureMatrix"].value = textureMatrix;
	                        this.scene.featureLayers[i].pointMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
	                        this.scene.featureLayers[i].pointMaterial.needUpdate = true;
	                    }
	                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].lineMaterial) {
	                        this.scene.featureLayers[i].lineMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
	                        this.scene.featureLayers[i].lineMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
	                        this.scene.featureLayers[i].lineMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
	                        this.scene.featureLayers[i].lineMaterial.uniforms["textureMatrix"].value = textureMatrix;
	                        this.scene.featureLayers[i].lineMaterial.uniforms["textureRange"].value.set(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
	                    }
	                    if(this.scene.featureLayers[i].regulator.fitPattern <= FeatureLayer.FIT_PATTERN.FIT_TERRIAN_HIGH && this.scene.featureLayers[i].polygonMaterial) {
	                        this.scene.featureLayers[i].polygonMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
	                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
	                        this.scene.featureLayers[i].polygonMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
	                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureMatrix"].value = textureMatrix;
	                        this.scene.featureLayers[i].polygonMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
	                        this.scene.featureLayers[i].polygonMaterial.needUpdate = true;
	                    }
	                    if(this.scene.featureLayers[i].labelMaterial) {
	                        this.scene.featureLayers[i].labelMaterial.uniforms["depthTexture"].value = terrainDepthRT.texture;
	                        this.scene.featureLayers[i].labelMaterial.uniforms["textureSize"].value.set(this.renderTarget.width, this.renderTarget.height);
	                        this.scene.featureLayers[i].labelMaterial.uniforms["depthCameraNearFar"].value = terrainDepthCameraNearFar;
	                        this.scene.featureLayers[i].labelMaterial.uniforms["textureMatrix"].value = textureMatrix;
	                        this.scene.featureLayers[i].labelMaterial.uniforms["textureRange"].value = new THREE.Vector4(visibleTerrainRange.min.x, visibleTerrainRange.min.y, visibleTerrainRange.max.x, visibleTerrainRange.max.y);
	                        this.scene.featureLayers[i].labelMaterial.needUpdate = true;
	                    }
	                }
	            }
	            //
	            renderer.render(this.scene, this.camera, this.renderTarget.renderToScreen ? null : this.renderTarget);
	            //
	            return true;
	        };
	        //
	        this.setSize = function(width, height) {
	            terrainDepthRT.setSize(width, height);
	            memDepthSapmler.data = new Uint8Array(width * height * 4);
	            memDepthSapmler.size[0] = width;
	            memDepthSapmler.size[1] = height;
	        };
	        //
	        this.release = function () {
	            terrainDepthRT.texture.dispose();
	            terrainDepthRT.dispose();
	        };
	    }
	}

	class OutPutRenderPass extends RenderPass {
	    constructor(scene, camera, renderTarget) {
	        super(scene, camera, renderTarget);
	        //
	        let orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	        let geom = new THREE.BufferGeometry();
	        geom.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0], 3 ) );
	        geom.addAttribute('uv', new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1], 2 ));
	        //
	        let quad = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ map:this.renderTarget.texture }) );
	        quad.drawMode = THREE.TriangleFanDrawMode;
	        quad.frustumCulled = false;
	        let tmpScene = new THREE.Scene();
	        tmpScene.add(quad);
	        //
	        this.render = function (renderer) {
	            if(this.renderTarget.renderToScreen)
	                return false;
	            //
	            renderer.render(tmpScene, orthoCamera);
	            return true;
	        };
	        //
	        this.release = function () {
	            geom.dispose();
	        };
	    }
	}

	class OutLineTechnique extends RenderTechnique {
	    constructor(renderer, scene, camera) {
	        super(renderer, scene, camera);
	        //
	        let normalRenderPass = new NormalRenderPass(scene, camera, this.screenRT);
	        let outLineRenderPass = new OutLineRenderPass(scene, camera, this.offScreenRT);
	        let outPutRenderPass = new OutPutRenderPass(scene, camera, this.offScreenRT);
	        //
	        this.addRenderPass(normalRenderPass);
	        this.addRenderPass(outLineRenderPass);
	        this.addRenderPass(outPutRenderPass);
	    }
	}

	exports.ARScene = ARScene;
	exports.WindowEventListener = WindowEventListener;
	exports.Viewer = Viewer;
	exports.MemDepthSampler = MemDepthSampler;
	exports.TerrainLayer = TerrainLayer;
	exports.BasicTerrainControls = BasicTerrainControls;
	exports.PyramidImage = PyramidImage;
	exports.ARLayer = ARLayer;
	exports.BasicArControls = BasicArControls;
	exports.ModelLayer = ModelLayer;
	exports.TJHModelLayer = TJHModelLayer;
	exports.FitTerrainMaterial = FitTerrainMaterial;
	exports.FeatureLayer = FeatureLayer;
	exports.PostLayer = PostLayer;
	exports.RenderPass = RenderPass;
	exports.NormalRenderPass = NormalRenderPass;
	exports.OutLineRenderPass = OutLineRenderPass;
	exports.OutPutRenderPass = OutPutRenderPass;
	exports.RenderTechnique = RenderTechnique;
	exports.OutLineTechnique = OutLineTechnique;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
