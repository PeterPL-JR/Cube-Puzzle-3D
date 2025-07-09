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

const WALL_ROTATION_SPEED = toRadians(10);
const CENTRE_POINT = pointToVector3([0, 0, 0]);
let rotation = null;

const cubes = [];

const AXISES = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
};

class CubeWall {
    constructor(axis, dir, name, colour) {
        this.axis = axis;
        this.dir = dir;
        this.name = name;
        this.colour = COLOURS[colour];
    }
}

const COLOURS = {
    blue: "#0000FF",
    green: "#00C413",
    white: "#ffffff",
    yellow: "#FFDD00",
    red: "#FF0000",
    orange: "#FF6600"
};

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
let started = false;

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

    initKeyboard();
    initMouse();

    initCube();
}

function initCube() {
    for(let wall of CUBE_WALLS) {
        loadTexture(wall);
    }

    let interval = setInterval(() => {
        if(TEXTURES.length >= 6) {
            initCubeElements();
            update();
            clearInterval(interval);
        }
    }, 1);
}

function initCubeElements() {
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
}

function initKeyboard() {
    document.body.onkeydown = function(event) {
        keys[event.key.toUpperCase()] = true;
    }
    document.body.onkeyup = function(event) {
        keys[event.key.toUpperCase()] = false;
    }
}

function initMouse() {
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

    updateRotation();

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

    cube.basicPosition = [x, y, z];

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

    let {x, y, z} = coords;

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    cube.basicPosition = [x, y, z];
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

function pointToVector3(point) {
    return new THREE.Vector3(point[0], point[1], point[2]);
}

function loadTexture(wall) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    const IMG_SIZE = 16;
    canvas.width = IMG_SIZE;
    canvas.height = IMG_SIZE;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
    ctx.fillStyle = wall.colour;
    ctx.fillRect(1, 1, IMG_SIZE - 2, IMG_SIZE - 2);

    let img = document.createElement("img");
    img.src = canvas.toDataURL();
    img.onload = function() {
        let material = createImgMaterial(img);
        wall.texture = material;
        TEXTURES.push(material);
    }
}

function createImgMaterial(img) {
    return createMaterial(createTexture(img));
}

function createTexture(img) {
    let tex = new THREE.Texture(img);
    tex.magFilter = tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
}

function createMaterial(texture) {
    return new THREE.MeshBasicMaterial({map: texture});
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
    if(rotation) return;

    
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
        cube.position.set(pointToVector3(cube.basicPosition));
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