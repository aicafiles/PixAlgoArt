// Select elements
const sizePicker = document.getElementById("sizePicker");
let inputHeight = document.getElementById("inputHeight");
let inputWidth = document.getElementById("inputWidth");
let colorPicker = document.getElementById("colorPicker");
const pixelCanvas = document.getElementById("pixelCanvas");
const obstacleBtn = document.getElementById("obstacleBtn");

let grid = []; // Your grid of cells
let start, end; // These would be the start and end points
let startPoint = null;
let endPoint = null;
let paths = []; // Store all paths and their colors
let placingObstacles = false; // Flag to check if user is placing obstacles

// Function to create grid with row and column numbers
function createGrid(height, width) {
    pixelCanvas.innerHTML = "";
    grid = [];

    // Create a wrapper for the table and add headers for row/column numbers
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper");

    const table = document.createElement("table");

    // Create the header row with column numbers
    const headerRow = document.createElement("tr");

    // Empty top-left corner for the row/column labels intersection
    const cornerCell = document.createElement("th");
    headerRow.appendChild(cornerCell);

    for (let col = 0; col < width; col++) {
        const colHeader = document.createElement("th");
        colHeader.innerText = String(col + 1).padStart(2, '0'); // Padded column number
        headerRow.appendChild(colHeader);
    }
    table.appendChild(headerRow);

    // Create rows with cell numbers
    for (let row = 0; row < height; row++) {
        let tr = document.createElement("tr");
        const rowHeader = document.createElement("th");
        rowHeader.innerText = String(row + 1).padStart(2, '0'); // Padded row number
        tr.appendChild(rowHeader); // Add row header
    
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

// Event listener for grid size change
sizePicker.addEventListener("submit", (e) => {
    e.preventDefault();
    const height = parseInt(inputHeight.value);
    const width = parseInt(inputWidth.value);
    createGrid(height, width);
});

// Toggle obstacle mode
obstacleBtn.addEventListener("click", () => {
    placingObstacles = !placingObstacles; // Toggle the flag
    if (placingObstacles) {
        obstacleBtn.innerText = "Click to Place Obstacles";
    } else {
        obstacleBtn.innerText = "Toggle Obstacles";
    }

    // Do NOT reset the grid when obstacles are toggled off
    // Only clear the start and end points
    if (!placingObstacles) {
        startPoint = null;
        endPoint = null;
        // You can choose to keep the obstacles as they are.
        // If you want to clear the obstacles, add logic to loop through grid and remove them here.
    }
});
document.getElementById("visualizeFlowBtn").addEventListener("click", () => {
    if (!startPoint || !endPoint) {
        alert("Please set both start and end points.");
        return;
    }

    // Visualize the flow of Dijkstra's algorithm
    visualizeFlow(startPoint, endPoint, colorPicker.value);
});

// New function to visualize the flow of Dijkstra's algorithm
function visualizeFlow(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};

    // Initialize distances and previous cells
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1],  // Right
    ];

    let interval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(interval);
            alert("Flow visualization complete!");
            // Now find the shortest path
            findPath(start, end, pathColor);
            return;
        }

        // Sort the queue to get the next closest cell
        queue.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = queue.shift();
        const { row, col } = current;
        const currentKey = `${row}-${col}`;

        if (visited.has(currentKey)) return; // Skip already visited cells
        visited.add(currentKey);

        // Color the cell to show the flow
        const cell = grid[row][col];
        if (!cell.classList.contains("obstacle")) {
            cell.style.backgroundColor = "lightblue"; // Color the flow cell
        }

        // Update neighbors
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
    }, 100); // Adjust the interval for speed of flow
}
// Handle cell click to set start and end points, or place obstacles
function handleCellClick(e) {
    const row = parseInt(e.target.getAttribute("data-row"));
    const col = parseInt(e.target.getAttribute("data-col"));

    // If we're placing obstacles
    if (placingObstacles) {
        const cell = grid[row][col];
        if (cell.classList.contains("obstacle")) {
            cell.classList.remove("obstacle"); // Remove obstacle
        } else {
            cell.classList.add("obstacle"); // Add obstacle
        }
        return;
    }

    // Handle setting of start point
    if (!startPoint) {
        startPoint = { row, col };
        e.target.style.backgroundColor = colorPicker.value;
    }
    // Handle setting of end point
    else if (!endPoint) {
        endPoint = { row, col };
        e.target.style.backgroundColor = colorPicker.value;
    }
}

// Dijkstra's algorithm to find the shortest path between start and end
function findPath(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};
    let pathCells = []; // Store cells involved in the path

    // Initialize distances to infinity
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    // Directions (Up, Down, Left, Right)
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
                pathCells.push(currentCell); // Track the path cells for undo
                currentCell = previous[`${currentCell.row}-${currentCell.col}`];
            }

            // Color the path cells with the path color (pathColor)
            path.forEach((cell) => {
                const cellElement = grid[cell.row][cell.col];
                // Only color the path cells if they are not obstacles or already part of the path
                if (cellElement.style.backgroundColor !== pathColor) {
                    cellElement.style.backgroundColor = pathColor; // Color path over existing flow
                }
            });

            // Store the path for undo (if needed)
            paths.push(pathCells);

            return true;
        }

        // Explore neighbors
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (
                newRow >= 0 &&
                newRow < grid.length &&
                newCol >= 0 &&
                newCol < grid[0].length &&
                !visited.has(`${newRow}-${newCol}`) &&
                !grid[newRow][newCol].classList.contains("obstacle") // Skip obstacles
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


// Undo the most recent path
document.getElementById("undoBtn").addEventListener("click", () => {
    if (paths.length === 0) {
        return;
    }

    // Get the most recent path
    const lastPathCells = paths.pop();  // Get the last stored path cells

    // Clear the color of the path cells
    lastPathCells.forEach(({ row, col }) => {
        const cell = grid[row][col];
        cell.style.backgroundColor = ""; // Reset to default (no color)
    });
});
// Button to find the path
document.getElementById("findPathBtn").addEventListener("click", () => {
    if (!startPoint || !endPoint) {
        alert("Please set both start and end points.");
        return;
    }

    // Draw the path with the selected color
    const success = findPath(startPoint, endPoint, colorPicker.value);

    if (success) {
        startPoint = null;
        endPoint = null;
    }
});

// Button to reset the grid
document.getElementById("resetBtn").addEventListener("click", () => {
    startPoint = null;
    endPoint = null;
    paths = [];
    createGrid(parseInt(inputHeight.value), parseInt(inputWidth.value));
});

// Undo the most recent path

// Add a stack to keep track of the shaded cells during visualization
let flowHistory = []; // To store cells for undoing the flow

// Add event listener for the new "Undo Flow" button
document.getElementById("undoFlowBtn").addEventListener("click", () => {
    undoFlow();
});

function resetGrid() {
    // Reset start and end point
    startPoint = null;
    endPoint = null;

    // Clear any path coloring
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            grid[row][col].style.backgroundColor = ""; // Reset color
            grid[row][col].classList.remove('start', 'end');
        }
    }
}

// Function to undo the most recent flow visualization
function undoFlow() {
    if (flowHistory.length === 0) {
        alert("No flow to undo.");
        return;
    }

    // Get the most recent shaded cells and clear their background
    const lastShadedCells = flowHistory.pop();
    lastShadedCells.forEach(cell => {
        cell.style.backgroundColor = ""; // Reset to default (no color)
    });

    // Reset start and end points to allow re-selection
    startPoint = null;
    endPoint = null;
}

// Modified visualizeFlow function to track shaded cells for undo
function visualizeFlow(start, end, pathColor) {
    let queue = [];
    let visited = new Set();
    let distances = {};
    let previous = {};

    // Initialize distances to infinity
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            distances[`${row}-${col}`] = Infinity;
            previous[`${row}-${col}`] = null;
        }
    }

    distances[`${start.row}-${start.col}`] = 0;
    queue.push(start);

    // Directions (Up, Down, Left, Right)
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    // Array to store the cells that are shaded during the flow
    let shadedCells = [];

    // Visualization loop (show the pathfinding process)
    let interval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(interval);
            // Push the shaded cells to flowHistory for undo
            flowHistory.push(shadedCells);
            return;
        }

        // Get the cell with the smallest distance from the queue
        queue.sort((a, b) => distances[`${a.row}-${a.col}`] - distances[`${b.row}-${b.col}`]);
        const current = queue.shift();
        const { row, col } = current;
        const currentKey = `${row}-${col}`;

        if (visited.has(currentKey)) return; // Skip already visited cells

        visited.add(currentKey);

        // Color the current cell to show the flow
        const cell = grid[row][col];
        if (!cell.classList.contains("obstacle")) {
            cell.style.backgroundColor = pathColor;  // Color the cell
            shadedCells.push(cell); // Keep track of the shaded cell
        }

        // If the current cell is the end point, stop the flow
        if (row === end.row && col === end.col) {
            clearInterval(interval);
            // Push the shaded cells to flowHistory for undo
            flowHistory.push(shadedCells);
            return;
        }

        // Explore neighbors
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (
                newRow >= 0 &&
                newRow < grid.length &&
                newCol >= 0 &&
                newCol < grid[0].length &&
                !visited.has(`${newRow}-${newCol}`) &&
                !grid[newRow][newCol].classList.contains("obstacle") // Skip obstacles
            ) {
                const newDistance = distances[`${row}-${col}`] + 1;
                if (newDistance < distances[`${newRow}-${newCol}`]) {
                    distances[`${newRow}-${newCol}`] = newDistance;
                    previous[`${newRow}-${newCol}`] = { row, col };
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }

    }, 50); // Visualize at an interval (adjust this for faster/slower flow)


    // Function to save canvas content to a PNG file
function saveCanvasAsImage() {
    // Create a temporary canvas to draw the current grid
    const tempCanvas = document.createElement("canvas");
    const context = tempCanvas.getContext("2d");

    // Get the width and height of the grid
    const gridWidth = grid[0].length;
    const gridHeight = grid.length;

    // Set the canvas size based on grid size and cell size
    tempCanvas.width = gridWidth * 20; // assuming each cell is 20px wide
    tempCanvas.height = gridHeight * 20; // assuming each cell is 20px high

    // Loop through the grid to draw each cell onto the canvas
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cell = grid[row][col];
            const color = cell.style.backgroundColor || "white"; // Default to white if no color set
            context.fillStyle = color;
            context.fillRect(col * 20, row * 20, 20, 20); // Draw the cell
        }
    }

    // Create a link to download the image
    const link = document.createElement("a");
    link.href = tempCanvas.toDataURL("image/png"); // Get the PNG data URL
    link.download = "pixel_art.png"; // Set the filename

    // Trigger the download by simulating a click
    link.click();
}

// Add event listener for saving the image
document.getElementById("saveBtn").addEventListener("click", saveCanvasAsImage);

const videoSection = document.createElement('div');
videoSection.className = 'info-section';
videoSection.innerHTML = `
  <h3>Learn More About Dijkstra's Algorithm</h3>
  <p>Dijkstra's algorithm is used to find the shortest path between two points on a grid. Watch this video to understand how it works:</p>
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/EFg3u_E6eHU?si=NqCV8bbEoB9WxMAh" 
    title="Dijkstra's Algorithm Explained" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
`;
document.body.appendChild(videoSection);


}



// Initialize grid
createGrid(parseInt(inputHeight.value), parseInt(inputWidth.value));

