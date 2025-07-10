const TEXTURES = [];

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