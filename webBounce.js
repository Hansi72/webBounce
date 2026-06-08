//Main loop, runs every millisecond
function frameTick() {
    for (let i = 0; i < objects.length; i++) {

        //move object
        if (objects[i].movable) {
            objects[i].coords.x = objects[i].coords.x + objects[i].direction.x;
            objects[i].coords.y = objects[i].coords.y + objects[i].direction.y;
        }

        //bounce off walls of client view
        if (objects[i].coords.x + objects[i].diameter / 2 > viewWidth) {
            objects[i].coords.x = viewWidth - objects[i].diameter / 2;
            objects[i].direction.x = objects[i].direction.x * -1;
        }
        if (objects[i].coords.x < objects[i].diameter / 2) {
            objects[i].coords.x = objects[i].diameter / 2;
            objects[i].direction.x = objects[i].direction.x * -1;
        }

        if (objects[i].coords.y + objects[i].diameter / 2 > viewHeight) {
            objects[i].coords.y = viewHeight - objects[i].diameter / 2;
            objects[i].direction.y = objects[i].direction.y * -1;
        }
        if (objects[i].coords.y < objects[i].diameter / 2) {
            objects[i].coords.y = objects[i].diameter / 2;
            objects[i].direction.y = objects[i].direction.y * -1;
        }

        //visually move object
        newX = objects[i].coords.x - objects[i].diameter / 2;
        newY = objects[i].coords.y - objects[i].diameter / 2;
        objects[i].element.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    //Check for and handle collisions
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            let dist = calculateDistance(i, j);
            if (dist <= (objects[i].diameter + objects[j].diameter) / 2) {
                handleCollision(objects[i], objects[j]);

                //handle overlapping objects
                while (calculateDistance(i, j) < (objects[i].diameter + objects[j].diameter) / 2) {
                    let signX = objects[i].coords.x < objects[j].coords.x ? 1 : -1;
                    let signY = objects[i].coords.y < objects[j].coords.y ? 1 : -1;

                    if (objects[i].movable) {
                        objects[i].coords.x -= signX;
                        objects[i].coords.y -= signY;
                    }
                    if (objects[j].movable) {
                        objects[j].coords.x += signX;
                        objects[j].coords.y += signY;
                    }
                }
            }
        }
    }

    //draw lines between objects
    if (showLines) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {

                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.moveTo(objects[i].coords.x, objects[i].coords.y);
                ctx.lineTo(objects[j].coords.x, objects[j].coords.y);

                ctx.stroke();
            }
        }
    }
}

function getAngleBetweenPoints(x1, y1, x2, y2, asDegrees = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    let radians = Math.atan2(dy, dx);

    if (asDegrees) {
        return radians * (180 / Math.PI);
    }

    return radians;
}

//todo optimize math by skipping some intermediate steps
function handleCollision(object1, object2) {

    //find collision angle and collision unit vector
    collisionAngle = getAngleBetweenPoints(object1.coords.x, object1.coords.y, object2.coords.x, object2.coords.y);
    unitVx = Math.cos(collisionAngle);
    unitVy = Math.sin(collisionAngle);

    //magnitude of collision direction for each object
    object1Magnitude = object1.direction.x * unitVx + object1.direction.y * unitVy;
    object1MagnitudeX = object1Magnitude * Math.cos(collisionAngle);
    object1MagnitudeY = object1Magnitude * Math.sin(collisionAngle);

    object2Magnitude = object2.direction.x * -unitVx + object2.direction.y * -unitVy;
    object2MagnitudeX = object2Magnitude * Math.cos(collisionAngle + Math.PI);
    object2MagnitudeY = object2Magnitude * Math.sin(collisionAngle + Math.PI);

    //reverse magnitudes of moving object if the other is stationary
    if (!object1.movable) {
        object1MagnitudeX = -object2MagnitudeX;
        object1MagnitudeY = -object2MagnitudeY;
    }
    if (!object2.movable) {
        object2MagnitudeX = -object1MagnitudeX;
        object2MagnitudeY = -object1MagnitudeY;
    }

    //update new directions
    object1.direction.x += object2MagnitudeX - object1MagnitudeX;
    object1.direction.y += object2MagnitudeY - object1MagnitudeY;

    object2.direction.x += object1MagnitudeX - object2MagnitudeX;
    object2.direction.y += object1MagnitudeY - object2MagnitudeY;

}

//Calculate the distance between centers of two objects
function calculateDistance(object1, object2) {
    const diffx = objects[object1].coords.x - objects[object2].coords.x;
    const diffy = objects[object1].coords.y - objects[object2].coords.y;
    return Math.sqrt(diffx * diffx + diffy * diffy);
}

//initialization
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const elements = document.getElementsByClassName("bouncy");

const objects = [];
maxDiameter = 0;
for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const dirX = Math.random() < 0.5 ? 0.6 : -0.6;
    const dirY = Math.random() < 0.5 ? 0.6 : -0.6;
    const x = 100 + Math.random() * (viewWidth - 200);
    const y = 100 + Math.random() * (viewHeight - 200);
    objects[i] = {
        element: element,
        diameter: element.offsetWidth,
        direction: { x: dirX, y: dirY },
        coords: { x: x, y: y },
        movable: true
    }
}

//prevent mouse dragging of elements
const bouncyDescendants = document.querySelectorAll(".bouncy *");
bouncyDescendants.forEach(element => {
    element.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });
});

//show or hide lines between objects.
showLines = false;

//start physics loop
const intervalId = setInterval(frameTick, 1);

