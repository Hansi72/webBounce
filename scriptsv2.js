//bouncy logic
function frameTick() {

    const elements = document.getElementsByClassName("block");

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        //create a random direction for a block
        if (!blockDirections.hasOwnProperty(i)) {
            const randomX = Math.floor(Math.random() < 0.5 ? 1 : -1);
            const randomY = Math.floor(Math.random() < 0.5 ? 1 : -1);
            blockDirections[i] = { x: randomX, y: randomY };
        }

        /*if (blockCoords[elementId].movable == 0) { 
            placeElement(element, blockCoords[elementId].x, blockCoords[elementId].y);
            continue; }*/
        //setCollisionGrid(element, elementId, 255);

        //move block
        blockCoords[i].x = blockCoords[i].x + blockDirections[i].x;
        blockCoords[i].y = blockCoords[i].y + blockDirections[i].y;

        //bounce off walls of client view
        if (blockCoords[i].x + element.offsetWidth > viewWidth) {
            blockCoords[i].x = viewWidth - element.offsetWidth;
            blockDirections[i].x = blockDirections[i].x * -1;
        }
        if (blockCoords[i].x < 0) {
            blockCoords[i].x = 0;

            blockDirections[i].x = blockDirections[i].x * -1;
        }

        if (blockCoords[i].y + element.offsetHeight > viewHeight) {
            blockCoords[i].y = viewHeight - element.offsetHeight;
            blockDirections[i].y = blockDirections[i].y * -1;
        }
        if (blockCoords[i].y < 0) {
            blockCoords[i].y = 0;
            blockDirections[i].y = blockDirections[i].y * -1;
        }

        placeElement(element, blockCoords[i].x, blockCoords[i].y);
    }

    //update distances
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            let dist = calculateDistance(i, j);
            distMatrix[Math.max(i, j)][Math.min(i, j)] = dist;
            
            if ((elements[i].offsetHeight + elements[j].offsetHeight) / 2 > dist || (elements[i].offsetWidth + elements[j].offsetWidth) / 2 > dist) { //todo improve this
                handleCollision(i, j, elements);
            }
        }
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    //draw lines between elements
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {

            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.moveTo(blockCoords[i].x + elements[i].offsetWidth / 2, blockCoords[i].y + elements[i].offsetHeight / 2);
            ctx.lineTo(blockCoords[j].x + elements[j].offsetWidth / 2, blockCoords[j].y + elements[j].offsetHeight / 2);

            //linetext
            /*ctx.font = "12px Arial";
            ctx.fillStyle = "blue";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Your Text", blockCoords[i].x - blockCoords[j].x, blockCoords[i].y - blockCoords[j].y);*/


            ctx.stroke();
        }
    }
}

function handleCollision(node1, node2, elements) {
    //console.log("handling coll");
    //if (blockCoords[node1].movable == 1) {

    normalX = blockCoords[node1].x - blockCoords[node2].x;
    normalY = blockCoords[node1].y - blockCoords[node2].y;

    //if(Math.abs(normalY) < elements[node1].offsetHeight/2){ 
    let temp = blockDirections[node1].x;
    blockDirections[node1].x = blockDirections[node2].x;
    blockDirections[node2].x = temp;
    //}

    //if(Math.abs(normalX) < elements[node1].offsetWidth/2){
    temp = blockDirections[node1].y;
    blockDirections[node1].y = blockDirections[node2].y;
    blockDirections[node2].y = temp;
    //}
}

function placeElement(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
}

function get2dArrayIndex(x, y) {
    return (viewWidth) * y + x;
}

//todo change this to some approximation instead
function calculateDistance(node1, node2) {
    const diffx = blockCoords[node1].x - blockCoords[node2].x;
    const diffy = blockCoords[node1].y - blockCoords[node2].y;
    return Math.sqrt(diffx * diffx + diffy * diffy);
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

const blockDirections = [];
const blockCoords = [];
//sparse graph matrix that contains all distances between nodes("blocks")
const distMatrix = [];

blockCoords[0] = { name: "kiwi", x: 50, y: 50, movable: 1, isCircle: 0 };
blockCoords[1] = { name: "mail", x: 1000, y: 50, movable: 1 };
blockCoords[2] = { name: "linkedin", x: 1000, y: 600, movable: 1 };
blockCoords[3] = { name: "github", x: 50, y: 600, movable: 1, isCircle: 0 };

for (let i = 0; i < 6; i++) {
    distMatrix[i] = [];
}

var interval = 6;
var someCounter = 0;

const imageElements = document.getElementsByClassName("image");
for (let i = 0; i < imageElements.length; i++) {
    const element = imageElements[i];
    element.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });
}

function speedUp() {
    if (interval < 2) {
        blockCoords[0] = { ...blockCoords[0], movable: 0 };
        blockDirections[1] = { x: blockDirections[1].x * 2, y: blockDirections[1].y * 2 };
        blockDirections[2] = { x: blockDirections[2].x * 2, y: blockDirections[2].y * 2 };
        blockDirections[3] = { x: blockDirections[3].x * 2, y: blockDirections[3].y * 2 };
    } else {
        interval = interval - 5;
        setInterval(frameTick, interval);
    }
}

document.getElementById("kiwi").onclick = speedUp;
setInterval(frameTick, interval);


