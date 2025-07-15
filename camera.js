const SPEED = 3;

let cameraDirection = new THREE.Vector3();
let lastPoint = new THREE.Vector3();

const CENTRE_POINT = pointToVector([0, 0, 0]);

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 4000);
    camera.position.set(0, 0, 10);
}

function rotateView() {
    const point = getThisSphere();

    const axis = new THREE.Vector3().crossVectors(lastPoint, point).normalize();
    const angle = Math.acos(Math.min(1, lastPoint.dot(point))) * SPEED;
    
    if(axis.lengthSq() > 0) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, angle);
        cubeObject.quaternion.premultiply(quaternion);
    }
    lastPoint.copy(point);
}

function mapToSphere(mouseX, mouseY, width, height) {
    let x = (2 * mouseX - width) / width;
    let y = (height - 2 * mouseY) / height;
    const lengthSquared = x * x + y * y;
    
    let z = 0;
    if(lengthSquared <= 1) {
        z = Math.sqrt(1 - lengthSquared);
    } else {
        const length = Math.sqrt(lengthSquared);
        x /= length;
        y /= length;
    }
    return pointToVector([x, y, z]).normalize();
}

function getThisSphere() {
    return mapToSphere(x, y, WIDTH, HEIGHT);
}

function getCameraDirection() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.negate();
    return dir; 
}

function rotateCube(x, y, z) {
    cubeObject.rotation.x += toRadians(x);
    cubeObject.rotation.y += toRadians(y);
    cubeObject.rotation.z += toRadians(z);
}