function GroupProxy() {
    this.flag = 0;
    this.children = [];
    this.matrix = null;
    this.name = null;
}

function PagedLodProxy() {
    this.flag = 1;
    this.levels = [];
    this.children = [];
    this.boundingSphere = [];
    this.rangeMode = 0;
    this.name = null;
}

function GeometryProxy() {
    this.vertexes = null;
    this.uv = null;
    this.indexes = null;
    this.normal = null;
    this.name = null;
}

function TextureProxy() {
    this.url = null;
    this.magFilter = "LINEAR";
    this.minFilter = "LINEAR_MIPMAP_LINEAR";
    this.wrapS = "REPEAT";
    this.wrapT = "REPEAT";
}

function MaterialProxy() {
    this.texture = null;
    this.ambient = [ 1.000000, 1.000000, 1.000000, 1.000000];
    this.diffuse = [ 1.000000, 1.000000, 1.000000, 1.000000];
    this.emission = [ 0.000000, 0.000000, 0.000000, 1.000000];
    this.shininess = 0.000000;
    this.specular = [ 0.000000, 0.000000, 0.000000, 1.000000];
}

function MeshProxy(geometry, material) {
    this.flag = 2;
    this.geometry = geometry;
    this.material = material;

    this.drawMode = 0;
    this.name = null;
}

function ProxyProxy() {
    this.flag = 3;
    this.fileList = [];
    this.name = null;
}


