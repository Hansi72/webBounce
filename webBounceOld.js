//bouncy logic
function frameTick() {

    const elements = document.getElementsByClassName("block");

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementId = element.id;

        //create a random direction for a block
        if (!blockDirections.hasOwnProperty(elementId)) {
            const randomX = Math.floor(Math.random() < 0.5 ? 1 : -1);
            const randomY = Math.floor(Math.random() < 0.5 ? 1 : -1);
            blockDirections[elementId] = { x: randomX, y: randomY };
        }

        /*if (blockCoords[elementId].movable == 0) { 
            placeElement(element, blockCoords[elementId].x, blockCoords[elementId].y);
            continue; }*/
        setCollisionGrid(element, elementId, 255);

        //move block
        blockCoords[elementId].x = blockCoords[elementId].x + blockDirections[elementId].x;
        blockCoords[elementId].y = blockCoords[elementId].y + blockDirections[elementId].y;

        //bounce off walls of client view
        if (blockCoords[elementId].x + element.offsetWidth > viewWidth) {
            blockCoords[elementId].x = viewWidth - element.offsetWidth;
            blockDirections[elementId].x = blockDirections[elementId].x * -1;
        }
        if (blockCoords[elementId].x < 0) {
            blockCoords[elementId].x = 0;

            blockDirections[elementId].x = blockDirections[elementId].x * -1;
        }

        if (blockCoords[elementId].y + element.offsetHeight > viewHeight) {
            blockCoords[elementId].y = viewHeight - element.offsetHeight;
            blockDirections[elementId].y = blockDirections[elementId].y * -1;
        }
        if (blockCoords[elementId].y < 0) {
            blockCoords[elementId].y = 0;
            blockDirections[elementId].y = blockDirections[elementId].y * -1;
        }

        const collisions = findCollisions(element, elementId);
        handleCollisions(elementId, collisions);

        setCollisionGrid(element, elementId, elementId);
        placeElement(element, blockCoords[elementId].x, blockCoords[elementId].y);
    }
}

//returns an object of collision data. Todo: introduce elements with radius
function findCollisions(element, elementId) {
    const collisions = { up: [], down: [], right: [], left: [] };
    let width = element.offsetWidth;
    let height = element.offsetHeight;

    if (blockCoords[elementId].isCircle != 1) {
        for (let i = 0; i < 2; i++) {
            y = blockCoords[elementId].y + i * height;
            for (let x = blockCoords[elementId].x; x < blockCoords[elementId].x + width; x++) {
                let index = get2dArrayIndex(x, y);
                if (collisionGrid[index] !== 255 && collisionGrid[index] !== elementId) {
                    if (i == 0) {
                        collisions["up"].push(collisionGrid[index]);
                    } else {
                        collisions["down"].push(collisionGrid[index]);
                    }
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            x = blockCoords[elementId].x + i * width;
            for (let y = blockCoords[elementId].y; y < blockCoords[elementId].y + height; y++) {
                let index = get2dArrayIndex(x, y);
                if (collisionGrid[index] !== 255 && collisionGrid[index] !== elementId) {
                    if (i == 0) {
                        collisions["left"].push(collisionGrid[index]);
                    } else {
                        collisions["right"].push(collisionGrid[index]);
                    }
                }
            }
        }
    } else {
        let radius = width / 2;
        let centerX = blockCoords[elementId].x + radius;
        let centerY = blockCoords[elementId].y + height / 2;
        var x, y;

        for (let angle = 0; angle < 360; angle++) {
            x = Math.floor(centerX + radius * Math.cos(Math.PI * 2 * angle / 360));
            y = Math.floor(centerY + radius * Math.cos(Math.PI * 2 * angle / 360));
            let index = get2dArrayIndex(x, y);
            if (collisionGrid[index] !== 255 && collisionGrid[index] !== elementId) {
                if (x < centerX) {
                    collisions["left"].push(collisionGrid[index]);
                } else {
                    collisions["right"].push(collisionGrid[index]);
                }
                if (y < centerY) {
                    collisions["up"].push(collisionGrid[index]);
                } else {
                    collisions["down"].push(collisionGrid[index]);
                }
            }
        }

    }
    return collisions;
}

//args, crashed element(s)
function handleCollisions(elementId, collisions) {
    let crashedBlock = null;

    //handle x axis
    if (blockDirections[elementId].x > 0) {
        crashedBlock = collisions["right"][0];
    } else if (blockDirections[elementId].x < 0) {
        crashedBlock = collisions["left"][0];
    }
    if (crashedBlock) {
        if (blockCoords[crashedBlock].movable == 1) {
            const temp = blockDirections[elementId].x;
            blockDirections[elementId].x = blockDirections[crashedBlock].x;
            blockDirections[crashedBlock].x = temp;
        } else {
            blockDirections[elementId].x = blockDirections[elementId].x * -1;
        }
    }

    crashedBlock = null;
    //handle y axis
    if (blockDirections[elementId].y > 0) {
        crashedBlock = collisions["down"][0];
    } else if (blockDirections[elementId].y < 0) {
        crashedBlock = collisions["up"][0];
    }
    if (crashedBlock) {
        if (blockCoords[crashedBlock].movable == 1) {
            const temp = blockDirections[elementId].y;
            blockDirections[elementId].y = blockDirections[crashedBlock].y;
            blockDirections[crashedBlock].y = temp;
        } else {
            blockDirections[elementId].y = blockDirections[elementId].y * -1;
        }
    }
}

//sets a value to the collision grid
function setCollisionGrid(element, elementId, value) {
    for (let x = blockCoords[elementId].x; x < blockCoords[elementId].x + element.offsetWidth; x++) {
        collisionGrid[get2dArrayIndex(x, blockCoords[elementId].y)] = value;
        collisionGrid[get2dArrayIndex(x, blockCoords[elementId].y + element.offsetHeight)] = value;
    }
    for (let y = blockCoords[elementId].y; y < blockCoords[elementId].y + element.offsetHeight; y++) {
        collisionGrid[get2dArrayIndex(blockCoords[elementId].x, y)] = value;
        collisionGrid[get2dArrayIndex(blockCoords[elementId].x + element.offsetWidth, y)] = value;
    }
}

function placeElement(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
}

function get2dArrayIndex(x, y) {
    return (viewWidth) * y + x;
}

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const collisionGrid = [];
for (let x = 0; x < viewWidth; x++) {
    for (let y = 0; y < viewHeight; y++) {
        collisionGrid[get2dArrayIndex(x, y)] = 255;
    }
}

const blockDirections = [];
const blockCoords = [];

blockCoords[1] = { x: 200, y: 200 };
blockCoords[2] = { x: 600, y: 400 };
blockCoords[3] = { x: 600, y: 200 };
blockCoords[4] = { x: 600, y: 400 };

blockCoords["kiwi"] = { x: 50, y: 50, movable: 1, isCircle: 0 };
blockCoords["mail"] = { x: 1000, y: 50, movable: 1 };
blockCoords["linkedin"] = { x: 1000, y: 600, movable: 1 };
blockCoords["github"] = { x: 50, y: 600, movable: 1, isCircle: 0 };

var interval = 6;

const imageElements = document.getElementsByClassName("image");
for (let i = 0; i < imageElements.length; i++) {
    const element = imageElements[i];
    element.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });
}

function speedUp() {
    if (interval < 2) {
        blockCoords["kiwi"] = { ...blockCoords["kiwi"], movable: 0 };
        blockDirections["mail"] = { x: blockDirections["mail"].x * 2, y: blockDirections["mail"].y * 2 };
        blockDirections["github"] = { x: blockDirections["github"].x * 2, y: blockDirections["github"].y * 2 };
        blockDirections["linkedin"] = { x: blockDirections["linkedin"].x * 2, y: blockDirections["linkedin"].y * 2 };
    } else {
        interval = interval - 5;
        setInterval(frameTick, interval);
    }
}

document.getElementById("kiwi").onclick = speedUp;
setInterval(frameTick, interval);


