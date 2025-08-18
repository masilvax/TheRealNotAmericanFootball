import { Point } from "./types";

let board: Point[][] = [];
let currentPoint: Point | null = null;
let turn: 'red' | 'blue' = 'red';

function createBoard(width: number, height: number) {
    if (height % 2 === 0) height++;
    if (width % 2 === 0) width++;

    board = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => ({
            taken: false,
            x,
            y,
            outgoingPaths: [],
            availablePoints: [],
        }))
    );

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            board[y][x].availablePoints = getAvailablePoints(x, y, width, height);
            // Ustaw taken na true dla krawędzi planszy
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                board[y][x].taken = true;
            }
        }
    }
}

function getPointAt(x: number, y: number): Point | null {
    if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) return null;
    return board[y][x];
}

function getAvailablePoints(x: number, y: number, width: number, height: number): Point[] {
    // Wszystkie możliwe kierunki
    const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
    ];

    let allowedDirections = directions;

    if (x === 0) {
        allowedDirections = [{ dx: 1, dy: 0 }, { dx: 1, dy: -1 }, { dx: 1, dy: 1 }];
    } else if (x === width - 1) {
        allowedDirections = [{ dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: -1, dy: 1 }];
    }
    if (y === 0) {
        if (x === 0) {
            allowedDirections = [{ dx: 1, dy: 1 }];
        } else if (x === width - 1) {
            allowedDirections = [{ dx: -1, dy: 1 }];
        } else {
            allowedDirections = [{ dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }];
        }
    } else if (y === height - 1) {
        if (x === 0) {
            allowedDirections = [{ dx: 1, dy: -1 }];
        } else if (x === width - 1) {
            allowedDirections = [{ dx: -1, dy: -1 }];
        } else {
            allowedDirections = [{ dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }];
        }
    }

    return allowedDirections
        .map(({ dx, dy }) => {
            const nx = x + dx;
            const ny = y + dy;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                return board[ny][nx];
            }
            return null;
        })
        .filter((p): p is Point => p !== null);
}

function renderBoard(): void {
    const container = document.querySelector('.square-container');
    container?.setAttribute('style', `grid-template-columns: repeat(${board[0].length}, var(--square-size));`); 

    if (!container) return;

    container.innerHTML = '';

    const height = board.length;
    const width = board[0].length;
    const xLeftPole = (board[0].length - 1) / 2 - 1;
    const xRightPole = (board[0].length - 1) / 2 + 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const div = document.createElement('div');
            let classes = ['square'];
            if (y === 0) classes.push('square-top');
            if ((y === 0 || y === height - 1) && (x === xLeftPole || x === xRightPole)) classes.push('goal');
            if (y === height - 1) classes.push('square-bottom');
            if (x === 0) classes.push('square-left');
            if (x === width - 1) classes.push('square-right');
            div.className = classes.join(' ');
            //div.textContent = `${x},${y}`;

            div.setAttribute('data-x', x.toString());
            div.setAttribute('data-y', y.toString());
            container.appendChild(div);

            const point = getPointAt(x, y);
            renderPaths(point, div);
            renderDots(point, div);
        }
    }
}

function renderPaths(point: Point | null, div: HTMLDivElement) {
    if (!point || !point.outgoingPaths || point.outgoingPaths.length === 0) return;

    point.outgoingPaths.forEach(path => {
        const pathDiv = document.createElement('div');
        pathDiv.className = `path path-${path.direction}`;
        pathDiv.style.backgroundColor = path.color ?? 'black';
        div.appendChild(pathDiv);
    });
}

function renderDots(point: Point | null, div: HTMLDivElement) {
    if (point && currentPoint?.availablePoints?.includes(point)) {
        const dot = document.createElement('span');
        dot.className = 'available-dot';
        div.appendChild(dot);
    }
    if (point === currentPoint) {
        const currentDot = document.createElement('span');
        currentDot.className = 'current-dot';
        currentDot.style.backgroundColor = turn;
        div.appendChild(currentDot);
    }
}

// Dodaj delegację zdarzeń po wyrenderowaniu planszy
function setBoardClick() {
    const container = document.querySelector('.square-container');
    if (!container) return;
    container.addEventListener('click', (event) => {
        const target = (event.target as HTMLElement).closest('.square');
        if (!target) return;
        const x = Number(target.getAttribute('data-x'));
        const y = Number(target.getAttribute('data-y'));
        const point = getPointAt(x, y);
        if (point && currentPoint?.availablePoints?.includes(point)) {

            // remove avalablePoint from currentPoint and clicked point accordingly
            currentPoint.availablePoints = currentPoint.availablePoints.filter(p => p !== point);
            point.availablePoints = point.availablePoints?.filter(p => p !== currentPoint);
            
            const direction = getDirection(currentPoint, point);
            currentPoint?.outgoingPaths?.push({ direction, color: turn });
            currentPoint = point;
            console.log('New currentPoint:', currentPoint);

            if (!point.taken) {
                turn = turn === 'red' ? 'blue' : 'red';    
            }
            point.taken = true;
            
            renderBoard();
        }
    });
}

function setResetButton() {
    const resetButton = document.getElementById('reset');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            initializeGame();
        })
    }
}

function setChangeTurnButton() {
    const changeTurnButton = document.getElementById('change-turn');
    if (changeTurnButton) {
        const changeTurn = () => {
            turn = turn === 'red' ? 'blue' : 'red';
            renderBoard();
        };
        changeTurnButton.addEventListener('click', changeTurn);
    }
}

function getDirection(from: Point, to: Point): 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dx === 0 && dy < 0) return 'up';
    if (dx === 0 && dy > 0) return 'down';
    if (dx < 0 && dy === 0) return 'left';
    if (dx > 0 && dy === 0) return 'right';
    if (dx < 0 && dy < 0) return 'up-left';
    if (dx > 0 && dy < 0) return 'up-right';
    if (dx < 0 && dy > 0) return 'down-left';
    if (dx > 0 && dy > 0) return 'down-right';

    throw new Error('Invalid direction');
}

function initializeGame(): void {
    createBoard(9, 11);
    turn = turn === 'red' ? 'blue' : 'red';
    currentPoint = getPointAt(4, 5);
    if (currentPoint) {
        currentPoint.taken = true;
    }
    console.log("Board initialized:", board, 'Current Point:', currentPoint);
    renderBoard();
}

initializeGame();
setBoardClick();
setResetButton();
setChangeTurnButton();
