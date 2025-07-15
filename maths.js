function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * 180 / Math.PI;
}

function pointToVector(point) {
    return new THREE.Vector3(point[0], point[1], point[2]);
}

function vectorToPoint(vector) {
    return [vector.x, vector.y, vector.z];
}

function between(value, min, max) {
    return value >= min && value <= max;
}