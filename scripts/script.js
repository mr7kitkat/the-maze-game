// module aliases
const {Events, Engine, Render, Runner, Bodies, Composite, Body} = Matter;

// Confrigation constant values
const cellsHorizental = 14;
const cellsVertical = 9;
const height = window.innerHeight - (window.innerHeight * 5 / 100);
const width = window.innerWidth - (window.innerWidth * 5 / 100);

// Cells width
const cellLengthX = width / cellsHorizental;
const cellLengthY = height / cellsVertical;


// create an engine
const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;

// create a renderer
const render = Render.create({
    element: document.body,
    engine,
    options:{
        height,
        width,
        wireframes: false
    }
});



// Creating Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 30, {isStatic:true, render:{fillStyle: 'gray'}}),
    Bodies.rectangle(width, height / 2, 30, height, {isStatic:true, render:{fillStyle: 'gray'}}),

    Bodies.rectangle(width/2, height, width, 30, {isStatic:true, render:{fillStyle: 'gray'}}),
    Bodies.rectangle(0, height/2, 30, height, {isStatic:true, render:{fillStyle: 'gray'}}),
];



// add all of the bodies to the world
Composite.add(world, walls);
// run the renderer
Render.run(render);
// create runner
const runner = Runner.create();
// run the engine
Runner.run(runner, engine);



// Maze generation
const suffle = (arr) => {
    let counter = arr.length;
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;

    return arr;
}

const grid = Array(cellsVertical)
            .fill(null)
            .map(() => Array(cellsHorizental).fill(false));


const verticals = Array(cellsVertical)
                .fill(null)
                .map(() => Array(cellsHorizental - 1).fill(false));


const horizontals = Array(cellsVertical - 1)
                .fill(null)
                .map(() => Array(cellsHorizental).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumns = Math.floor(Math.random() * cellsHorizental);

const moveInGrid = (row, col) => {
    // If i have visited cell then return from the function
    if (grid[row][col]) {
        return;
    }

    // If not visited than mark it as true
    grid[row][col] = true;

    // Assembel list of all the neighbour cells
    const neighbours = suffle([
        [row - 1, col, 'up'],
        [row, col + 1, 'right'],
        [row + 1, col, 'down'],
        [row, col - 1, 'left']
    ]);

    // For each neighbour....do something
    for (let neighbour of neighbours) {
        const [nextRow, nextCol, direction] = neighbour;

        if (nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizental ) {
            continue;
        }

        if (grid[nextRow][nextCol]) {
            continue;
        }

        if (direction === 'left') {
            verticals[row][col - 1] = true;
        }
        else if (direction === 'right') {
            verticals[row][col] = true;
        }
        else if (direction === 'up')  {
            horizontals[row - 1][col] = true;
        }
        else if (direction === 'down')  {
            horizontals[row][col] = true;
        }

        moveInGrid(nextRow, nextCol);
    }
};

moveInGrid(startRow, startColumns);


// Creating Vertical stages
horizontals.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
        if (cell) {
            return;
        }

        const wall = Bodies.rectangle(
            colIdx * cellLengthX + cellLengthX / 2,
            rowIdx * cellLengthY + cellLengthY,
            cellLengthX,
            10,
            {
                label: 'wall',
                isStatic : true,
                render: {
                    fillStyle: 'red'
                }
            }            
        );

        Composite.add(world, wall);
    })
})


// Creating horizontals stages
verticals.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
        if (cell) {
            return;
        }

        const wall = Bodies.rectangle(
            colIdx * cellLengthX + cellLengthX,
            rowIdx * cellLengthY + cellLengthY / 2,
            10,
            cellLengthY,
            {
                label: 'wall',
                isStatic : true,
                render: {
                    fillStyle: 'red'
                }
            }            
        );

        Composite.add(world, wall);
    })
})


// End point or Finish point 
const goal = Bodies.rectangle(
    width - cellLengthX / 2,
    height - cellLengthY / 2,
    cellLengthX * 0.7,
    cellLengthY * 0.7,
    {
        label: 'goal',
        isStatic : true,
        render: {
            fillStyle: 'lightgreen'
        }
    }  
)

Composite.add(world, goal);


// Hero player or start point 
const radius = Math.min(cellLengthX, cellLengthY) / 4;
const ball = Bodies.circle(
    cellLengthX / 2,
    cellLengthY / 2,
    radius,
    {
        label: 'ball',
    }
)

Composite.add(world, ball);


document.addEventListener('keydown', event => {
    // console.log(event);

    const {x, y} = ball.velocity
    if (event.keyCode === 38) {
        Body.setVelocity(ball, {x, y: y - 5});
    }

    if (event.keyCode === 39) {
        Body.setVelocity(ball, {x: x + 5, y});
    }

    if (event.keyCode === 37) {
        Body.setVelocity(ball, {x: x - 5, y});
    }

    if (event.keyCode === 40) {
        Body.setVelocity(ball, {x, y: y + 5});
    }
})




// Winning condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('h1').classList.remove('hide');
            engine.world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })
        }
        
    })
})