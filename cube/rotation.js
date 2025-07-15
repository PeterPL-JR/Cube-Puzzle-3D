const ROTATION_CLOCKS = {
    x: ["top", "back", "bottom", "front"],
    y: ["back", "right", "front", "left"],
    z: ["top", "right", "bottom", "left"]
};

const AXISES = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
};

let rotation = null;
const WALL_ROTATION_SPEED = toRadians(10);

function rotate(object, point, rotation) {
    let vec3 = pointToVector(point);
    rotateAxis(object, vec3, AXISES.x, rotation[0]);
    rotateAxis(object, vec3, AXISES.y, rotation[1]);
    rotateAxis(object, vec3, AXISES.z, rotation[2]);
}

function rotateAxis(object, point, axis, angle) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);

    object.position.sub(point);
    object.position.applyQuaternion(quaternion);
    object.position.add(point);

    object.quaternion.premultiply(quaternion);
}

function getRotation(wallName, dir, moves) {
    let cubeWallType = findCubeWallByName(wallName);
    let axis = cubeWallType.axis;
    const DEG_90 = Math.PI / 2;;

    let axises = ["x", "y", "z"];
    let rotation = {};
    for(let a of axises) {
        if(a == axis) {
            rotation[a] = DEG_90 * moves * dir;
        } else {
            rotation[a] = 0;
        }
    }
    return rotation;
}

function rotateCubePart(wallName, dir, moves) {
    if(rotation) return;

    if(Math.abs(dir) != 1 || moves <= 0) return;
    
    let cubePart = getCubePart(wallName);
    let axis = getAxisByWallName(wallName);
    
    let rotDir = axis == "z" ? -dir : dir;

    let target = toRadians(90 * rotDir * moves);
    let speed = WALL_ROTATION_SPEED * rotDir;

    rotation = {target, moves, dir, speed, axis, angle: 0, cubePart};
}

function updateRotation() {
    if(rotation) {
        rotation.angle += rotation.speed;

        let angle = rotation.angle;
        let target = rotation.target;

        const isFinished = target > 0 ? (angle >= target) : (angle <= target);

        if(isFinished) {
            rotation.angle = rotation.target;
            rotateThisWall();
            finishRotation();
        } else {
            rotateThisWall();
        }
    }
}

function rotateThisWall() {
    for(let cube of rotation.cubePart) {
        rotateAxis(cube, CENTRE_POINT, AXISES[rotation.axis], rotation.speed);
    }
}

function finishRotation() {
    for(let cube of rotation.cubePart) {
        cube.position.set(pointToVector(cube.basicPosition));
        cube.quaternion.identity();
    }

     let clock = ROTATION_CLOCKS[rotation.axis];

    for(let cube of rotation.cubePart) {
        for(let i = 0; i < cube.sides.length; i++) {
            let sideName = cube.sides[i];
            if(clock.includes(sideName)) {
                let index = clock.indexOf(sideName);
                let nextIndex = getArrayIndex(index, rotation.moves * rotation.dir, clock.length);
                let newSideName = clock[nextIndex];
                cube.sides[i] = newSideName;
            }
        }
        updateCube(cube);

        let newTextures = rotateArray(cube.textures, rotation.axis, rotation.dir, rotation.moves);
        setCubeColours(cube, newTextures);
        cube.textures = newTextures;
    }
    rotation = null;
}

function rotateArray(array, axis, dir, moves) {
    let newArray = Object.assign({}, array);
    let clock = ROTATION_CLOCKS[axis];

    for(let side in array) {
        if(clock.includes(side)) {
            let index = clock.indexOf(side);
            let nextIndex = getArrayIndex(index, moves * dir, clock.length);
            let newSideName = clock[nextIndex];
            newArray[newSideName] = array[side];
        }
    }

    return newArray;
}

function getArrayIndex(startIndex, offset, arrayLength) {
    let newIndex = startIndex + offset;
    if(newIndex >= arrayLength) {
        return newIndex % arrayLength;
    }
    if(newIndex < 0) {
        return arrayLength + (newIndex % arrayLength);
    }
    return newIndex;
}