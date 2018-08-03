
class CSS2DLabelLayer extends THREE.Group{
    constructor(viewer){
        super();

        this.viewer = viewer;

        this.labels = [];

        let labelLayer = this;

        this.css2DStyle = {
            color: "#ff0000",
            backgroundColor:"#ffff00",
            opacity : "0.5",
            fontFamily: "sans-serif",
            fontSize:"larger",
            borderRadius: "50%",
            width: "50px",
            height:"50px"
        };


        let initCSSStyle = function (div) {
            // 自定义属性，可自己定制（根据需求更改，然后上传svn）
            div.style.color = labelLayer.css2DStyle.color;
            div.style.backgroundColor = labelLayer.css2DStyle.backgroundColor;
            div.style.backgroundImage =
            div.style.opacity = labelLayer.css2DStyle.opacity;
            div.style.fontFamily = labelLayer.css2DStyle.fontFamily;
            div.style.borderRadius = labelLayer.css2DStyle.borderRadius;
            div.style.fontSize = labelLayer.css2DStyle.fontSize;
            div.style.width = labelLayer.css2DStyle.width;
            div.style.height = labelLayer.css2DStyle.height;


            // 屏蔽label div的所有鼠标事件
            div.style.pointerEvents = "none";

        }

        this.addLabel = function (id, description, pos, img) {
            let labelDiv = document.createElement( 'div' );
            labelDiv.labelID = id;
            initCSSStyle(labelDiv);
            labelDiv.textContent = description;
            var cssLabel = new THREE.CSS2DObject( labelDiv );

            cssLabel.position.copy(pos);
            cssLabel.labelId = id;
            cssLabel.labelDes = description;

            cssLabel.updateMatrixWorld(true);
            this.add(cssLabel);
            this.labels[this.labels.length] = cssLabel;
        }

        this.removeLabel = function (obj) {

            let index = this.labels.indexOf(obj);
            if(index === -1)
                return;
            else
            {
                this.labels[index].dispose();
                this.remove(obj);
                this.labels.splice(index, 1);
            }
        }
    }
    update(context)
    {
        for(let n=0, length = this.children.length; n<length; ++n) {
            let obj = this.children[n];
            if(obj instanceof THREE.CSS2DObject )
            {
                obj.quaternion.copy(context.camera.quaternion.clone());
                obj.updateMatrixWorld(true);
            }
        }
        super.update(context);
    }
    removeUnExpected()
    {

    }
}
