THREE.WebGLRenderer.prototype.supportMaterialStencil = function () {
    let state = this.state;
    let context = this.context;
    this.state.setMaterial = function ( material, frontFaceCW ) {
        material.side === THREE.DoubleSide
            ? state.disable( context.CULL_FACE )
            : state.enable( context.CULL_FACE );

        var flipSided = ( material.side === THREE.BackSide );
        if ( frontFaceCW ) flipSided = ! flipSided;

        state.setFlipSided( flipSided );

        material.transparent === true
            ? this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha )
            : this.setBlending( THREE.NoBlending );

        state.buffers.depth.setFunc( material.depthFunc );
        state.buffers.depth.setTest( material.depthTest );
        state.buffers.depth.setMask( material.depthWrite );
        state.buffers.color.setMask( material.colorWrite );
        if(material.stencilTest !== undefined) {
            //state.buffers.stencil.setTest(material.stencilTest);
        }

        this.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );
    };
};
