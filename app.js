const canvas = document.querySelector("canvas");

const WIDTH = 1224;
const HEIGHT = 565;

let x = 0;
let y = 0;
let z = 0;

let cameraPitch = 0;
let cameraYaw = 0;

let keys = {};

let cameraDirection = new THREE.Vector3();

const MOVE_SPEED = 0.75;
const ROTATION_SPEED = toRadians(1);

const cubes = [];

const AXISES = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
];

class CubeWall {
    constructor(axis, dir, name, colour) {
        this.axis = axis;
        this.dir = dir;
        this.name = name;
        this.colour = colour;
    }
}

const CUBE_WALLS = [
    new CubeWall("x", +1, "right", "blue"),
    new CubeWall("x", -1, "left", "green"),
    new CubeWall("y", +1, "top", "white"),
    new CubeWall("y", -1, "bottom", "yellow"),
    new CubeWall("z", +1, "back", "red"),
    new CubeWall("z", -1, "front", "orange"),
];

const ROTATION_CLOCKS = {
    x: ["top", "back", "bottom", "front"],
    y: ["back", "right", "front", "left"],
    z: ["top", "right", "bottom", "left"]
};

const TEXTURES = [];
const textureLoader = new THREE.TextureLoader();

const EMPTY_WALL = new THREE.MeshBasicMaterial({color: "#242424"});

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(WIDTH, HEIGHT);

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 4000);
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    
    getWorldDirection();
    setWorldRotation();

    moveStraight(-10);

    scene = new THREE.Scene();
    scene.add(camera);

    for(let wall of CUBE_WALLS) {
        wall.texture = createCubeColourMaterial(wall.colour);
    }

    let coords = {};
    for(let i = 0; i < 3; i++) {
        let x = i - 1;
        coords.x = x;
        for(let j = 0; j < 3; j++) {
            let y = j - 1;
            coords.y = y;
            for(let k = 2; k >= 0; k--) {
                let z = k - 1;
                coords.z = z;
                if(!(x == 0 && y == 0 && z == 0)) {
                    let cube = createCube(x, y, z, coords);
                    scene.add(cube);
                    cubes.push(cube);
                }
            }
        }
    }

    document.body.onkeydown = function(event) {
        keys[event.key.toUpperCase()] = true;
        if(event.key == "Enter") {
            rotateCubePart("top", 1, 1);
        }
    }
    document.body.onkeyup = function(event) {
        keys[event.key.toUpperCase()] = false;
    }

    let oldX = -1;
    let oldY = -1;

    canvas.onmousemove = function(event) {
        let x = event.clientX - canvas.offsetLeft;
        let y = event.clientY - canvas.offsetTop;

        if(x < oldX) cameraYaw += ROTATION_SPEED;
        if(x > oldX) cameraYaw -= ROTATION_SPEED;

        if(y < oldY) cameraPitch += ROTATION_SPEED;
        if(y > oldY) cameraPitch -= ROTATION_SPEED;

        oldX = x;
        oldY = y;
    }

    update();
}

function update() {
    requestAnimationFrame(update);
    getWorldDirection();

    if(keys["W"]) moveStraight(MOVE_SPEED);
    if(keys["S"]) moveStraight(-MOVE_SPEED);
    if(keys["A"]) moveCross(-MOVE_SPEED);
    if(keys["D"]) moveCross(MOVE_SPEED);
    
    if(keys[" "]) moveVertically(MOVE_SPEED);
    if(keys["SHIFT"]) moveVertically(-MOVE_SPEED);

    setWorldRotation();

    render();
}

function render() {
    renderer.render(scene, camera);
}

function createCube(x, y, z, coords) {
    const SIZE = 1;
    let textures = [];
    let textureObject = {};
    for(let i = 0; i < 6; i++) {
        textures.push(EMPTY_WALL);
        textureObject[CUBE_WALLS[i].name] = -1;
    }

    let sides = [];
    for(let axis in coords) {
        let dir = coords[axis];
        if(dir != 0) {
            let index = findCubeWallIndex(axis, coords[axis]);
            let wall = CUBE_WALLS[index];
            textures[index] = wall.texture;
            textureObject[wall.name] = index;
            sides.push(wall.name);
        }
    }

    let geom = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
    let cube = new THREE.Mesh(geom, textures);

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    cube.sides = sides;
    cube.textures = textureObject;
    cube.materials = textures;

    return cube;
}

function updateCube(cube) {
    let coords = {x:0, y:0, z:0};
    for(let side of cube.sides) {
        let wall = findCubeWallByName(side);
        coords[wall.axis] = wall.dir;
    }
    cube.position.x = coords.x;
    cube.position.y = coords.y;
    cube.position.z = coords.z;
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * 180 / Math.PI;
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

function rotate(object, point, rotation) {
    let vec3 = pointToVector3(point);
    rotateAxis(object, vec3, AXISES[0], rotation[0]);
    rotateAxis(object, vec3, AXISES[1], rotation[1]);
    rotateAxis(object, vec3, AXISES[2], rotation[2]);
}

function rotateAxis(object, point, axis, angle) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);

    object.position.sub(point);
    object.position.applyQuaternion(quaternion);
    object.position.add(point);

    object.quaternion.premultiply(quaternion);
}

function pointToVector3(point) {
    return new THREE.Vector3(point[0], point[1], point[2]);
}

function loadTexture(path) {
    let tex = textureLoader.load(path);
    tex.magFilter = tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
}

function createMaterial(texture) {
    return new THREE.MeshBasicMaterial({map: texture});
}

function createTextureMaterial(path) {
    return createMaterial(loadTexture(path));
}

function createCubeColourMaterial(colourName) {
    return createTextureMaterial("texture/" + colourName + ".png");
}

function findCubeWallIndex(axis, dir) {
    return CUBE_WALLS.indexOf(CUBE_WALLS.find(w => w.axis == axis && w.dir == dir));
}

function findCubeWallByName(wallName) {
    return CUBE_WALLS.find(w => w.name == wallName);
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

function getAxisByWallName(wallName) {
    return CUBE_WALLS.find(w => w.name == wallName).axis;
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

function getCubePart(wallName) {
    return cubes.filter(c => c.sides.includes(wallName));
}

function rotateCubePart(wallName, dir, moves) {
    moves %= 4;
    let cubePart = getCubePart(wallName);
    let rotation = getRotation(wallName, dir, moves);

    let axis = getAxisByWallName(wallName);
    let clock = ROTATION_CLOCKS[axis];
    
    for(let cube of cubePart) {
        for(let i = 0; i < cube.sides.length; i++) {
            let sideName = cube.sides[i];
            if(clock.includes(sideName)) {
                let index = clock.indexOf(sideName);
                let nextIndex = getArrayIndex(index, moves * dir, clock.length);
                let newSideName = clock[nextIndex];
                cube.sides[i] = newSideName;
            }
        }
        updateCube(cube);

        let newTextures = rotateArray(cube.textures, axis, dir, moves);
        setCubeColours(cube, newTextures);
        cube.textures = newTextures;
    }
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

function toTextureArray(array) {
    let textureArray = [];
    for(let side in array) {
        let index = CUBE_WALLS.indexOf(findCubeWallByName(side));
        if(array[side] != -1) {
            let texture = CUBE_WALLS[array[side]].texture;
            textureArray[index] = texture;
        } else {
            textureArray[index] = EMPTY_WALL;
        }
    }
    return textureArray;
}

function setCubeColours(cube, array) {
    cube.material = toTextureArray(array);
}