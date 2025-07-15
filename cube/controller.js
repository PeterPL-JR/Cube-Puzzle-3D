let selectedCubes = [];

const raycaster = new THREE.Raycaster();

function getSelectedCube(x, y) {
    let v = new THREE.Vector2();
    
    v.x = x / WIDTH * 2 - 1;
    v.y = -y / HEIGHT * 2 + 1;

    raycaster.setFromCamera(v, camera);

    const intersects = raycaster.intersectObjects(cubeObject.children, true);
    if(intersects.length != 0) {
        let {object, face} = intersects[0];
        return {
            cube: object,
            face: face.materialIndex
        };
    }
    return null;
}

function selectCube(x, y) {
    let object = getSelectedCube(x, y);
    if(!object) {
        mouseLeftClicked = false;
        applyCubesSelection();
    } else if(selectedCubes.findIndex(x => x.cube == object.cube && x.face == object.face) == -1) {
        selectedCubes.push(object);
    }
}

function applyCubesSelection() {
    if(selectedCubes.length == 0) return;

    if(verifyCubeRotation()) {
        rotateCubeWall(selectedCubes);
    }
    selectedCubes = [];
}

function rotateCubeWall(sequence) {
    let commonSidesArray = getCommonSides(sequence); 
    let selectedFace = CUBE_WALLS[getFaces(sequence)[0]].name;
    let wallName = commonSidesArray.find(x => x != selectedFace);

    let wallAxis = getAxisByWallName(wallName);
    let clock = ROTATION_CLOCKS[wallAxis];

    const pivots = createRotationPivots(sequence, CORNER);

    let firstIndex = clock.indexOf(pivots[0]);
    let secondIndex = clock.indexOf(pivots[1]);

    let dir = Math.sign(secondIndex - firstIndex);
    if(selectedFace == "left" || selectedFace == "top" || (selectedFace == "back" && wallAxis == "y") || (selectedFace == "front" && wallAxis == "x")) {
        dir = -dir;
    }
    rotateCubePart(wallName, dir, 1);
}

function createRotationPivots(sequence, pivotCubeType) {
    let cubesSequence = sequence.map(x => x.cube);

    let pivotFirst = getCubeType(cubesSequence[0]) == pivotCubeType;
    let innerSides = cubesSequence.find(x => getCubeType(x) != pivotCubeType).sides;

    let pivots = [];

    if(cubesSequence.length == 3) {
        pivots = cubesSequence.filter(x => getCubeType(x) == pivotCubeType);
        pivots = pivots.map(x => x.sides.filter(y => innerSides.indexOf(y) == -1)[0]);
    } else {
        let pivot = cubesSequence.find(x => getCubeType(x) == pivotCubeType);
        let pivotType = pivot.sides.find(x => innerSides.indexOf(x) == -1);
        pivots.push(pivotType);

        let secondPivotType = getOppositeCubeWallName(pivotType);
        if(pivotFirst) {
            pivots.push(secondPivotType);
        } else {
            pivots.unshift(secondPivotType);
        }
    }
    return pivots;
}

function verifyCubeRotation() {
    if(selectedCubes.length < 2) return false;
    
    const cubeTypes = selectedCubes.map(c => getCubeType(c.cube));
    const counters = [CENTRE, EDGE, CORNER].map(x => count(cubeTypes, x));

    if(counters[CENTRE] == 0 && counters[EDGE] == 1) {
        if(getCommonSides(selectedCubes).length != 0 && isOneValueArray(getFaces(selectedCubes))) {
            return true;
        }
    }
    return false;
}

function getCommonSides(array) {
    let commonSidesArray = [];

    for(let wall of CUBE_WALLS) {
        let wallName = wall.name;
        let every = true;
        for(let obj of array) {
            if(obj.cube.sides.indexOf(wallName) == -1) {
                every = false;
                break;
            }
        }
        if(every) {
            commonSidesArray.push(wallName);
        }
    }
    return commonSidesArray;
}

function getFaces(array) {
    return array.map(x => x.face);
}

function count(array, value) {
    return array.filter(x => x == value).length;
}

function isOneValueArray(array) {
    return count(array, array[0]) == array.length;
}