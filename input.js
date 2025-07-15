let keys = {};

let x, y, oldX, oldY;
let mouseLeftClicked = false;
let mouseRightClicked = false;

const MOUSE_LEFT_BUTTON = 0;
const MOUSE_RIGHT_BUTTON = 2;

function initKeyboard() {
    document.body.onkeydown = function(event) {
        keys[event.key.toUpperCase()] = true;
    }
    document.body.onkeyup = function(event) {
        keys[event.key.toUpperCase()] = false;
    }
}

function initMouse() {
    canvas.onmousedown = function(event) {
        updateMouseDown(event);
    }

    canvas.onmouseup = function(event) {
        updateMouseUp(event);
    }

    canvas.onmousemove = function(event) {
        updateMouseMove(event);
    }
}

function updateMouseDown(event) {
    if(event.button == MOUSE_LEFT_BUTTON) {
        if(rotation || mouseLeftClicked) return;
        mouseLeftClicked = true;
    }
    if(event.button == MOUSE_RIGHT_BUTTON) {
        mouseRightClicked = true;
        lastPoint = getThisSphere();
    }
}

function updateMouseUp(event) {
    if(event.button == MOUSE_LEFT_BUTTON) {
        if(rotation || !mouseLeftClicked) return;
        mouseLeftClicked = false;
        applyCubesSelection();
    }
    if(event.button == MOUSE_RIGHT_BUTTON) {
        mouseRightClicked = false;
    }
}

function updateMouseMove(event) {
    x = event.clientX - canvas.offsetLeft;
    y = event.clientY - canvas.offsetTop;

    if(!oldX || !oldY) {
        oldX = x;
        oldY = y;
    }

    if(mouseLeftClicked) {
        selectCube(x, y);
    }
    if(mouseRightClicked) {
        rotateView();
    }

    oldX = x;
    oldY = y;
}