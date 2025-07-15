const cubes = [];

const CENTRE = 0;
const EDGE = 1;
const CORNER = 2;

class CubeWall {
    constructor(axis, dir, name, colour) {
        this.axis = axis;
        this.dir = dir;
        this.name = name;
        this.colour = COLOURS[colour];

        let vector = new THREE.Vector3();
        vector[this.axis] = dir;
        this.normalVector = vector;
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
    new CubeWall("z", -1, "front", "orange")
];

const EMPTY_WALL = new THREE.MeshBasicMaterial({color: "#242424"});

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
                    cubeObject.add(cube);
                    cubes.push(cube);
                }
            }
        }
    }
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

    cube.position.set(x, y, z);
    cube.basicPosition = [x, y, z];

    cube.sides = sides;
    cube.textures = textureObject;
    cube.materials = textures;

    return cube;
}

function updateCube(cube) {
    let position = new THREE.Vector3();
    for(let side of cube.sides) {
        let wall = findCubeWallByName(side);
        position[wall.axis] = wall.dir;
    }

    cube.position.copy(position);
    cube.basicPosition = vectorToPoint(position);
}

function findCubeWallIndex(axis, dir) {
    return CUBE_WALLS.indexOf(CUBE_WALLS.find(w => w.axis == axis && w.dir == dir));
}

function findCubeWallIndexByName(wallName) {
    return CUBE_WALLS.findIndex(w => w.name == wallName);
}

function findCubeWallByName(wallName) {
    return CUBE_WALLS.find(w => w.name == wallName);
}

function getAxisByWallName(wallName) {
    return findCubeWallByName(wallName).axis;
}

function getDirByWallName(wallName) {
    return findCubeWallByName(wallName).dir;
}

function getCubePart(wallName) {
    return cubes.filter(c => c.sides.includes(wallName));
}

function getCubeType(cube) {
    return cube.sides.length - 1;
}

function getOppositeCubeWallName(wallName) {
    let wall = CUBE_WALLS.find(w => w.name == wallName);
    return CUBE_WALLS.find(w => w != wall && w.axis == wall.axis).name;
}