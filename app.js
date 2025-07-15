const canvas = document.querySelector("canvas");

const WIDTH = 1224;
const HEIGHT = 565;

let started = false;

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    canvas.oncontextmenu = () => false;

    initKeyboard();
    initMouse();

    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(WIDTH, HEIGHT);

    initCamera();

    scene = new THREE.Scene();
    scene.add(camera);

    cubeObject = new THREE.Object3D();
    scene.add(cubeObject);
    rotateCube(30, -45, 0);

    initCube();
}

function update() {
    requestAnimationFrame(update);

    updateRotation();

    render();
}

function render() {
    renderer.render(scene, camera);
}