THREE.computePixelSizeVector = function (width, height, pM, vM) {
    // pre adjust P00,P20,P23,P33 by multiplying them by the viewport window matrix.
    // here we do it in short hand with the knowledge of how the window matrix is formed
    // note P23,P33 are multiplied by an implicit 1 which would come from the window matrix.
    // Robert Osfield, June 2002.

    // scaling for horizontal pixels
    let p00 = pM.elements[0]*width*0.5;
    let p20_00 = pM.elements[8]*width*0.5+pM.elements[11]*width*0.5;
    let scale_00 = new THREE.Vector3(vM.elements[0]*p00 + vM.elements[2]*p20_00,
        vM.elements[4]*p00+vM.elements[6]*p20_00,
        vM.elements[8]*p00+vM.elements[10]*p20_00);

    // scaling for vertical pixels
    let p10 = pM.elements[5]*height*0.5;
    let p20_10 = pM.elements[9]*height*0.5 + pM.elements[11].height*0.5;
    let scale_10 = new THREE.Vector3(vM.elements[1]*p10 + vM.elements[2]*p20_10,
        vM.elements[5]*p10 + vM.elements[6]*p20_10,
        vM.elements[9]*p10 + vM.elements[10]*p20_10);

    let p23 = pM.elements[11];
    let p33 = pM.elements[15];

    var pixelSizeVector = new THREE.Vector4(vM.elements[2]*p23,
        vM.elements[6]*p23,
        vM.elements[10]*p23,
        vM.elements[14]*p23 + vM.elements[15]*p33);

    let scaleRatio = 0.7071067811/Math.sqrt(scale_00.lengthSq() + scale_10.lengthSq());
    pixelSizeVector.multiplyScalar(scaleRatio);

    return pixelSizeVector;
};

