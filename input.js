let keys = {};

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