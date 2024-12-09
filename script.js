const sizePicker = document.getElementById("sizePicker");
let inputHeight = document.getElementById("inputHeight");
let inputWidth = document.getElementById("inputWidth");
let colorPicker = document.getElementById("colorPicker");
const pixelCanvas = document.getElementById("pixelCanvas");
const obstacleBtn = document.getElementById("obstacleBtn");

let grid = [];
let start, end; 
let startPoint = null;
let endPoint = null;
let paths = []; 
let placingObstacles = false; 

function createGrid(height, width) {
    pixelCanvas.innerHTML = "";
    grid = [];

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper");

    const table = document.createElement("table");

    const headerRow = document.createElement("tr");

    const cornerCell = document.createElement("th");
    headerRow.appendChild(cornerCell);

    for (let col = 0; col < width; col++) {
        const colHeader = document.createElement("th");
        colHeader.innerText = String(col + 1).padStart(2, '0');
        headerRow.appendChild(colHeader);
    }
    table.appendChild(headerRow);

    for (let row = 0; row < height; row++) {
        let tr = document.createElement("tr");
        const rowHeader = document.createElement("th");
        rowHeader.innerText = String(row + 1).padStart(2, '0'); 
        tr.appendChild(rowHeader);
    
        grid.push([]);

        for (let col = 0; col < width; col++) {
            let td = document.createElement("td");
            td.setAttribute("data-row", row);
            td.setAttribute("data-col", col);
            td.addEventListener("click", handleCellClick);
            tr.appendChild(td);
            grid[row].push(td);
        }
    
        table.appendChild(tr);
    }

    tableWrapper.appendChild(table);
    pixelCanvas.appendChild(tableWrapper);
}

sizePicker.addEventListener("submit", (e) => {
    e.preventDefault();
    const height = parseInt(inputHeight.value);
    const width = parseInt(inputWidth.value);
    createGrid(height, width);
});

obstacleBtn.addEventListener("click", () => {
    placingObstacles = !placingObstacles; 
    if (placingObstacles) {
        obstacleBtn.innerText = "Click to Place Obstacles";
    } else {
        obstacleBtn.innerText = "Toggle Obstacles";
    }

    if (!placingObstacles) {
        startPoint = null;
        endPoint = null;
    }
});
document.getElementById("visualizeFlowBtn").addEventListener("click", () => {
    if (!startPoint || !endPoint) {
        alert("Please set both start and end points.");
        return;
    }

    visualizeFlow(startPoint, endPoint, colorPicker.value);
});

function visualizeFlow(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    let interval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(interval);
            alert("Flow visualization complete!");
            findPath(start, end, pathColor);
            return;
        }

        queue.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = queue.shift();
        const { row, col } = current;
        const currentKey = `${row}-${col}`;

        if (visited.has(currentKey)) return;
        visited.add(currentKey);

        const cell = grid[row][col];
        if (!cell.classList.contains("obstacle")) {
            cell.style.backgroundColor = "lightblue"; 
        }

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length &&
                !visited.has(`${newRow}-${newCol}`) && !grid[newRow][newCol].classList.contains("obstacle")) {
                const newDistance = distances[`${row}-${col}`] + 1;
                if (newDistance < distances[`${newRow}-${newCol}`]) {
                    distances[`${newRow}-${newCol}`] = newDistance;
                    previous[`${newRow}-${newCol}`] = { row, col };
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }
    }, 100); 
}
function handleCellClick(e) {
    const row = parseInt(e.target.getAttribute("data-row"));
    const col = parseInt(e.target.getAttribute("data-col"));

    if (placingObstacles) {
        const cell = grid[row][col];
        if (cell.classList.contains("obstacle")) {
            cell.classList.remove("obstacle"); 
        } else {
            cell.classList.add("obstacle");
        }
        return;
    }

    if (!startPoint) {
        startPoint = { row, col };
        e.target.style.backgroundColor = colorPicker.value;
    }
    else if (!endPoint) {
        endPoint = { row, col };
        e.target.style.backgroundColor = colorPicker.value;
    }
}

function findPath(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};
    let pathCells = [];

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    while (queue.length > 0) {
        queue.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = queue.shift();
        const { row, col } = current;
        const currentKey = `${row}-${col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);

        if (row === end.row && col === end.col) {
            let path = [];
            let currentCell = current;
            while (currentCell) {
                path.unshift(currentCell);
                pathCells.push(currentCell);
                currentCell = previous[`${currentCell.row}-${currentCell.col}`];
            }

            path.forEach((cell) => {
                const cellElement = grid[cell.row][cell.col];
                if (cellElement.style.backgroundColor !== pathColor) {
                    cellElement.style.backgroundColor = pathColor; 
                }
            });
            paths.push(pathCells);

            return true;
        }

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (
                newRow >= 0 &&
                newRow < grid.length &&
                newCol >= 0 &&
                newCol < grid[0].length &&
                !visited.has(`${newRow}-${newCol}`) &&
                !grid[newRow][newCol].classList.contains("obstacle")
            ) {
                const newDistance = distances[`${row}-${col}`] + 1;
                if (newDistance < distances[`${newRow}-${newCol}`]) {
                    distances[`${newRow}-${newCol}`] = newDistance;
                    previous[`${newRow}-${newCol}`] = { row, col };
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    alert("No path found.");
    return false;
}

document.getElementById("undoBtn").addEventListener("click", () => {
    if (paths.length === 0) {
        return;
    }

    const lastPathCells = paths.pop();

    lastPathCells.forEach(({ row, col }) => {
        const cell = grid[row][col];
        cell.style.backgroundColor = "";
    });
});
document.getElementById("findPathBtn").addEventListener("click", () => {
    if (!startPoint || !endPoint) {
        alert("Please set both start and end points.");
        return;
    }

    const success = findPath(startPoint, endPoint, colorPicker.value);

    if (success) {
        startPoint = null;
        endPoint = null;
    }
});

document.getElementById("resetBtn").addEventListener("click", () => {
    startPoint = null;
    endPoint = null;
    paths = [];
    createGrid(parseInt(inputHeight.value), parseInt(inputWidth.value));
});

let flowHistory = [];

document.getElementById("undoFlowBtn").addEventListener("click", () => {
    undoFlow();
});

function resetGrid() {
    startPoint = null;
    endPoint = null;

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            grid[row][col].style.backgroundColor = ""; 
            grid[row][col].classList.remove('start', 'end');
        }
    }
}

function undoFlow() {
    if (flowHistory.length === 0) {
        alert("No flow to undo.");
        return;
    }

    const lastShadedCells = flowHistory.pop();
    lastShadedCells.forEach(cell => {
        cell.style.backgroundColor = "";
    });

    startPoint = null;
    endPoint = null;
}

function visualizeFlow(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    let shadedCells = [];

    let interval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(interval);
            flowHistory.push(shadedCells);
            return;
        }

        queue.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = queue.shift();
        const { row, col } = current;
        const currentKey = `${row}-${col}`;

        if (visited.has(currentKey)) return;

        visited.add(currentKey);

        const cell = grid[row][col];
        if (!cell.classList.contains("obstacle")) {
            cell.style.backgroundColor = pathColor;
            shadedCells.push(cell);
        }

        if (row === end.row && col === end.col) {
            clearInterval(interval);
            flowHistory.push(shadedCells);
            return;
        }

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (
                newRow >= 0 &&
                newRow < grid.length &&
                newCol >= 0 &&
                newCol < grid[0].length &&
                !visited.has(`${newRow}-${newCol}`) &&
                !grid[newRow][newCol].classList.contains("obstacle")
            ) {
                const newDistance = distances[`${row}-${col}`] + 1;
                if (newDistance < distances[`${newRow}-${newCol}`]) {
                    distances[`${newRow}-${newCol}`] = newDistance;
                    previous[`${newRow}-${newCol}`] = { row, col };
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }

    }, 50);

function saveCanvasAsImage() {
    const tempCanvas = document.createElement("canvas");
    const context = tempCanvas.getContext("2d");

    const gridWidth = grid[0].length;
    const gridHeight = grid.length;

    tempCanvas.width = gridWidth * 20;
    tempCanvas.height = gridHeight * 20;

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cell = grid[row][col];
            const color = cell.style.backgroundColor || "white";
            context.fillStyle = color;
            context.fillRect(col * 20, row * 20, 20, 20);
        }
    }

    const link = document.createElement("a");
    link.href = tempCanvas.toDataURL("image/png");
    link.download = "pixel_art.png";

    link.click();
}

document.getElementById("saveBtn").addEventListener("click", saveCanvasAsImage);
}

createGrid(parseInt(inputHeight.value), parseInt(inputWidth.value));

