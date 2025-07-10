function toRadians(deg) {
    return deg * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * 180 / Math.PI;
}

function getVector3(point) {
    return new THREE.Vector3(point[0], point[1], point[2]);
}