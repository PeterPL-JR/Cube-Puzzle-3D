let x = 0;
let y = 0;
let z = 0;

let cameraPitch = 0;
let cameraYaw = 0;

const MOVE_SPEED = 0.75;
const ROTATION_SPEED = toRadians(1);

let cameraDirection = new THREE.Vector3();

const CENTRE_POINT = getVector3([0, 0, 0]);

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 4000);
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;

    getWorldDirection();
    setWorldRotation();

    moveStraight(-10);
}

function move(vector, speed) {
    camera.position.addScaledVector(vector, speed);
}

function moveStraight(speed) {
    move(cameraDirection, speed);
}

function moveCross(speed) {
    cameraDirection.crossVectors(cameraDirection, camera.up).normalize();
    moveStraight(speed);
}

function moveVertically(speed) {
    move(camera.up, speed);
}

function getWorldDirection() {
    camera.getWorldDirection(cameraDirection);
}

function setWorldRotation() {
    camera.rotation.set(cameraPitch, cameraYaw, 0, "YXZ");
}