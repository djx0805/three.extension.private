/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

THREE.UniformsLib.line = {
	linewidth: { value: 1 },
	resolution: { value: new THREE.Vector2( 1, 1 ) },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	gapSize: { value: 1 } // todo FIX - maybe change to totalSize
};

THREE.UniformsLib.depthTexture = {
    depthTexture : {value:null},
    textureSize : {value:new THREE.Vector2(0,0)},
    textureRange : {value: new THREE.Vector4(0,0,0,0)},
    textureMatrix : {value : new THREE.Matrix4()},
    depthCameraNearFar : {value:new THREE.Vector2(0,0)}
}



THREE.ShaderLib[ 'line' ] = {

	uniforms: THREE.UniformsUtils.merge ( [
		THREE.UniformsLib.common,
		THREE.UniformsLib.fog,
		THREE.UniformsLib.line
	] ),

	vertexShader:
		`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

    vertexShaderWithDepthMapLow:
        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform mat4 textureMatrix;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 > z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 > z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 > z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));
                z00 = z11 > z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 > z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 > z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 > z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 > z00 ? z22 : z00;
                z00 = z00 >0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 > z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 > z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 > z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));
                z00 = z11 > z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 > z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 > z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 > z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 > z00 ? z22 : z00;
                z00 = z00 >0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01, depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             //
			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

    vertexShaderWithDepthMapHigh:
        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

            //
            mat4 textureMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
               vec4 texCoord = textureMatrix*ps;
               float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z01 < z00 ? z01 : z00;
               float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z02 < z00 ? z02 : z00;
               float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
               z00 = z10 < z00 ? z10 : z00;
               float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
               z00 = z11 < z00 ? z11 : z00;
               float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
               z00 = z12 < z00 ? z12 : z00;
               float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z20 < z00 ? z20 : z00;
               float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z21 < z00 ? z21 : z00;
               float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
               z00 = z22 < z00 ? z22 : z00;
               z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                float z01 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z01 < z00 ? z01 : z00;
                float z02 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z02 < z00 ? z02 : z00;
                float z10 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z10 < z00 ? z10 : z00;
                float z11 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord));',
                z00 = z11 < z00 ? z11 : z00;
                float z12 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 0.0, 0.0, 0.0)));
                z00 = z12 < z00 ? z12 : z00;
                float z20 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z20 < z00 ? z20 : z00;
                float z21 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(0.0, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z21 < z00 ? z21 : z00;
                float z22 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(-1.0/textureSize.x, 1.0/textureSize.y, 0.0, 0.0)));
                z00 = z22 < z00 ? z22 : z00;
                z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

    vertexShaderWithDepthMapNormal:
        `
		#include <common>
		#include <packing>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;
		
		uniform sampler2D depthTexture;
        uniform vec2 textureSize;
        uniform vec4 textureRange;
        uniform vec2 depthCameraNearFar;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

            //
            mat4 textureMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
            vec3 newStart = instanceStart;
            vec3 newEnd = instanceEnd;
            //
            vec4 ps = modelMatrix * vec4( instanceStart, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
               vec4 texCoord = textureMatrix*ps;
               float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
               z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newStart = vec3( instanceStart.xy, z00);
             }
             //
             ps = modelMatrix * vec4( instanceEnd, 1.0 );
             if(ps.x>=(textureRange[0]) && ps.x<=(textureRange[2]) && ps.y>=(textureRange[1])&& ps.y<=(textureRange[3])) {
                vec4 texCoord = textureMatrix*ps;
                float z00 = unpackRGBAToDepth(texture2DProj( depthTexture, texCoord - vec4(1.0/textureSize.x, -1.0/textureSize.y, 0.0, 0.0)));
                z00 = z00 > 0.9 ? 0.0 : orthographicDepthToViewZ(z00 - 0.01 , depthCameraNearFar[0], depthCameraNearFar[1]);

                newEnd = vec3( instanceEnd.xy, z00);
             }
             
			// camera space
			vec4 start = modelViewMatrix * vec4( newStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( newEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
		`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <premultiplied_alpha_fragment>
			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>

		}
		`
};

THREE.LineMaterial = function ( parameters ) {

	THREE.ShaderMaterial.call( this, {

		type: 'LineMaterial',

		uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ 'line' ].uniforms ),

		vertexShader: THREE.ShaderLib[ 'line' ].vertexShader,
		fragmentShader: THREE.ShaderLib[ 'line' ].fragmentShader

	} );

	this.dashed = false;

	Object.defineProperties( this, {

		color: {

			enumerable: true,

			get: function () {

				return this.uniforms.diffuse.value;

			},

			set: function ( value ) {

				this.uniforms.diffuse.value = value;

			}

		},

		linewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.linewidth.value;

			},

			set: function ( value ) {

				this.uniforms.linewidth.value = value;

			}

		},

		dashScale: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashScale.value;

			},

			set: function ( value ) {

				this.uniforms.dashScale.value = value;

			}

		},

		dashSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashSize.value;

			},

			set: function ( value ) {

				this.uniforms.dashSize.value = value;

			}

		},

		gapSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.gapSize.value;

			},

			set: function ( value ) {

				this.uniforms.gapSize.value = value;

			}

		},

		resolution: {

			enumerable: true,

			get: function () {

				return this.uniforms.resolution.value;

			},

			set: function ( value ) {

				this.uniforms.resolution.value.copy( value );

			}

		}

	} );

	this.setValues( parameters );

};

THREE.LineMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.LineMaterial.prototype.constructor = THREE.LineMaterial;

THREE.LineMaterial.prototype.isLineMaterial = true;

THREE.LineMaterial.prototype.copy = function ( source ) {

	THREE.ShaderMaterial.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.linewidth = source.linewidth;

	this.resolution = source.resolution;

	// todo

	return this;

};




THREE.LineMaterialWithDepthMap = function ( parameters ) {

    THREE.ShaderMaterial.call( this, {

        type: 'LineMaterial',

        uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ 'line' ].uniforms ),


        vertexShader: THREE.ShaderLib[ 'line' ].vertexShaderWithDepthMapLow,
        fragmentShader: THREE.ShaderLib[ 'line' ].fragmentShader

    } );
    //
	let lineMaterialWithDepthMap = this;

    this.uniforms = THREE.UniformsUtils.merge([
        lineMaterialWithDepthMap.uniforms,
        THREE.UniformsLib.depthTexture
    ]);

    this.dashed = false;

    Object.defineProperties( this, {

        color: {

            enumerable: true,

            get: function () {

                return this.uniforms.diffuse.value;

            },

            set: function ( value ) {

                this.uniforms.diffuse.value = value;

            }

        },

        linewidth: {

            enumerable: true,

            get: function () {

                return this.uniforms.linewidth.value;

            },

            set: function ( value ) {

                this.uniforms.linewidth.value = value;

            }

        },

        dashScale: {

            enumerable: true,

            get: function () {

                return this.uniforms.dashScale.value;

            },

            set: function ( value ) {

                this.uniforms.dashScale.value = value;

            }

        },

        dashSize: {

            enumerable: true,

            get: function () {

                return this.uniforms.dashSize.value;

            },

            set: function ( value ) {

                this.uniforms.dashSize.value = value;

            }

        },

        gapSize: {

            enumerable: true,

            get: function () {

                return this.uniforms.gapSize.value;

            },

            set: function ( value ) {

                this.uniforms.gapSize.value = value;

            }

        },

        resolution: {

            enumerable: true,

            get: function () {

                return this.uniforms.resolution.value;

            },

            set: function ( value ) {

                this.uniforms.resolution.value.copy( value );

            }

        }

    } );

    this.setValues( parameters );

};

THREE.LineMaterialWithDepthMap.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.LineMaterialWithDepthMap.prototype.constructor = THREE.LineMaterial;

THREE.LineMaterialWithDepthMap.prototype.isLineMaterial = true;
THREE.LineMaterialWithDepthMap.prototype.isLineMaterialWithDepthMap = true;

THREE.LineMaterialWithDepthMap.prototype.copy = function ( source ) {

    THREE.ShaderMaterial.prototype.copy.call( this, source );

    this.color.copy( source.color );

    this.linewidth = source.linewidth;

    this.resolution = source.resolution;

    // todo

    return this;

};

