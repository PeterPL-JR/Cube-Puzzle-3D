const canvas = document.querySelector("canvas");

const WIDTH = 1224;
const HEIGHT = 565;

let started = false;

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(WIDTH, HEIGHT);

    initCamera();

    scene = new THREE.Scene();
    scene.add(camera);

    initKeyboard();
    initMouse();

    initCube();
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