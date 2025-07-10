const cubes = [];

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
                    scene.add(cube);
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

function findCubeWallIndex(axis, dir) {
    return CUBE_WALLS.indexOf(CUBE_WALLS.find(w => w.axis == axis && w.dir == dir));
}

function findCubeWallByName(wallName) {
    return CUBE_WALLS.find(w => w.name == wallName);
}

function getAxisByWallName(wallName) {
    return CUBE_WALLS.find(w => w.name == wallName).axis;
}

function getCubePart(wallName) {
    return cubes.filter(c => c.sides.includes(wallName));
}