class SmartRoam extends tjh.ar.WindowEventListener {
    constructor(viewer) {
        super(viewer);
        //
        let roamPath = [];
        let positionSeq = [];
        let quaternionSeq = [];
        let times = [];
        //
        let positionKF = null;
        let quaternionKF = null;
        //
        let updateProxy = new THREE.Object3D();
        this.tempObj.add(updateProxy);
        //
        let  clip = null;
        let mixer = null;
        let clock = null;
        let roaming = false;
        let speed = 10;
        //
        updateProxy.update = (context)=> {
            if(!mixer) {
                clip = new THREE.AnimationClip( 'Action', -1, [positionKF, quaternionKF]);
                clip.optimize();
                mixer = new THREE.AnimationMixer( viewer.camera );
                // create a ClipAction and set it to play
                let clipAction = mixer.clipAction( clip );
                let action = clipAction.play();
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                mixer.addEventListener("finished", ()=> {
                    roaming = false;
                });
            }
            else if(roaming) {
                mixer.update(clock.getDelta());
            }
        };


        this.start = function () {
            if(mixer) {
                let clipAction = mixer.clipAction( clip );
                let action = clipAction.play();
                action.reset();
            }
            roaming = true;
            //
            clock = new THREE.Clock();
        }

        this.pause = function () {
            if(mixer && roaming) {
                mixer.timeScale = 0;
            }
        }

        this.resume = function () {
            if(mixer && roaming) {
                mixer.timeScale = 1;
            }
        }

        //m/s
        this.setSpeed = function (s) {
            speed = s;
        }

        this.setSites = function (path) {
            roamPath = path;
            //
            positionSeq = [];
            quaternionSeq = [];
            times = [];
            //
            let camera = new THREE.PerspectiveCamera(45, 1.0, 1.0, 15000);
            let targetPosition = new THREE.Vector3();
            let targetQuaternion = new THREE.Quaternion();
            let targetScale = new THREE.Vector3();

            for(let n=0, length = path.length - 1; n<length; ++n) {
                camera.position.copy(path[n]);
                camera.up.set(0,0,1);
                camera.lookAt(path[n+1]);
                camera.updateMatrixWorld(true);
                camera.matrixWorld.decompose(targetPosition, targetQuaternion, targetScale);
                //
                quaternionSeq[quaternionSeq.length] = targetQuaternion.x;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.y;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.z;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.w;


                quaternionSeq[quaternionSeq.length] = targetQuaternion.x;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.y;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.z;
                quaternionSeq[quaternionSeq.length] = targetQuaternion.w;
                //
                positionSeq[positionSeq.length] = path[n].x;
                positionSeq[positionSeq.length] = path[n].y;
                positionSeq[positionSeq.length] = path[n].z;
                //
                positionSeq[positionSeq.length] = path[n+1].x;
                positionSeq[positionSeq.length] = path[n+1].y;
                positionSeq[positionSeq.length] = path[n+1].z;
                //
                times[times.length] = times.length === 0 ? 0 : times[times.length - 1] + 1;
                times[times.length] = times[times.length - 1] + path[n+1].clone().sub(path[n]).length()/speed;
            }
            //
            positionKF = new THREE.VectorKeyframeTrack( '.position', times, positionSeq);
            quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', times, quaternionSeq);
            //
            clip = null;
            mixer = null;
        };

        this.setPath = function (path, lookTarget) {
            if(!lookTarget) {
                this.setSites(path);
                return ;
            }
            //
            positionSeq = [path[0].x, path[0].y, path[0].z];
            times[0] = 0;
            for(let n=1, length = path.length; n<length; ++n) {
                positionSeq[positionSeq.length] = path[n].x;
                positionSeq[positionSeq.length] = path[n].y;
                positionSeq[positionSeq.length] = path[n].z;
                //
                times[times.length] = times[times.length - 1] + path[n].clone().sub(path[n-1]).length()/speed;
            }
            //
            quaternionSeq = [];
            let camera = new THREE.PerspectiveCamera(45, 1.0, 1.0, 15000);
            let targetPosition = new THREE.Vector3();
            let targetQuaternion = new THREE.Quaternion();
            let targetScale = new THREE.Vector3();
            //
            if(lookTarget instanceof  THREE.Vector3) {
                for(let n=0, length = path.length; n<length; ++n) {
                    camera.position.copy(path[n]);
                    camera.up.set(0,0,1);
                    camera.lookAt(lookTarget);
                    camera.updateMatrixWorld(true);
                    camera.matrixWorld.decompose(targetPosition, targetQuaternion, targetScale);
                    //
                    quaternionSeq[quaternionSeq.length] = targetQuaternion.x;
                    quaternionSeq[quaternionSeq.length] = targetQuaternion.y;
                    quaternionSeq[quaternionSeq.length] = targetQuaternion.z;
                    quaternionSeq[quaternionSeq.length] = targetQuaternion.w;
                }
            }
            else if(lookTarget instanceof  Array) {

            }
            //
            positionKF = new THREE.VectorKeyframeTrack( '.position', times, positionSeq);
            quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', times, quaternionSeq);
            //
            clip = null;
            mixer = null;
        }
    }
}
