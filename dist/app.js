let currentPoint = null;
function getAvailablePoints(x, y, width, height, board) {
    // Wszystkie możliwe kierunki
    const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
    ];
    let allowedDirections = directions;
    if (x === 0) {
        allowedDirections = [{ dx: 1, dy: 0 }, { dx: 1, dy: -1 }, { dx: 1, dy: 1 }];
    }
    else if (x === width - 1) {
        allowedDirections = [{ dx: -1, dy: 0 }, { dx: -1, dy: -1 }, { dx: -1, dy: 1 }];
    }
    if (y === 0) {
        if (x === 0) {
            allowedDirections = [{ dx: 1, dy: 1 }];
        }
        else if (x === width - 1) {
            allowedDirections = [{ dx: -1, dy: 1 }];
        }
        else {
            allowedDirections = [{ dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }];
        }
    }
    else if (y === height - 1) {
        if (x === 0) {
            allowedDirections = [{ dx: 1, dy: -1 }];
        }
        else if (x === width - 1) {
            allowedDirections = [{ dx: -1, dy: -1 }];
        }
        else {
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
        .filter((p) => p !== null);
}
function createBoard(width, height) {
    if (height % 2 === 0)
        height++;
    if (width % 2 === 0)
        width++;
    const board = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => ({
        taken: false,
        x,
        y,
        outgoingPaths: [],
        availablePoints: [],
    })));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            board[y][x].availablePoints = getAvailablePoints(x, y, width, height, board);
        }
    }
    return board;
}
function getPointAt(x, y, board) {
    if (y < 0 || y >= board.length || x < 0 || x >= board[0].length)
        return null;
    return board[y][x];
}
function renderBoard(board) {
    const container = document.querySelector('.square-container');
    if (!container)
        return;
    container.innerHTML = '';
    const height = board.length;
    const width = board[0].length;
    const xLeftPole = (board[0].length - 1) / 2 - 1;
    const xRightPole = (board[0].length - 1) / 2 + 1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const div = document.createElement('div');
            let classes = ['square'];
            if (y === 0)
                classes.push('square-top');
            if ((y === 0 || y === height - 1) && (x === xLeftPole || x === xRightPole))
                classes.push('goal');
            if (y === height - 1)
                classes.push('square-bottom');
            if (x === 0)
                classes.push('square-left');
            if (x === width - 1)
                classes.push('square-right');
            div.className = classes.join(' ');
            div.textContent = `${x},${y}`;
            div.setAttribute('data-x', x.toString());
            div.setAttribute('data-y', y.toString());
            container.appendChild(div);
            const dot = document.createElement('span');
            dot.className = 'dot';
            div.appendChild(dot);
        }
        container.appendChild(document.createElement('br'));
    }
}
// Dodaj delegację zdarzeń po wyrenderowaniu planszy
function setupBoardClick(board) {
    const container = document.querySelector('.square-container');
    if (!container)
        return;
    container.addEventListener('click', (event) => {
        const target = event.target.closest('.square');
        if (!target)
            return;
        const x = Number(target.getAttribute('data-x'));
        const y = Number(target.getAttribute('data-y'));
        const point = getPointAt(x, y, board);
        if (point) {
            currentPoint = point;
            console.log('New currentPoint:', currentPoint);
        }
    });
}
function main() {
    const board = createBoard(9, 11);
    currentPoint = getPointAt(4, 5, board);
    console.log("Board initialized:", board, 'Current Point:', currentPoint);
    renderBoard(board);
    setupBoardClick(board);
}
main();
export {};
// function createBoard(width: number, height: number): Point[][] {
//     // sprawdź czy height i width są nieparzyste i jeśli nie, to zwiększ je o 1
//     if (height % 2 === 0) height++;
//     if (width % 2 === 0) width++;
//     // Najpierw utwórz tablicę punktów bez availablePoints
//     const board: Point[][] = Array.from({ length: height }, (_, y) =>
//         Array.from({ length: width }, (_, x) => ({
//             taken: false,
//             x,
//             y,
//             outgoingPaths: [],
//             availablePoints: [],
//         }))
//     );
//     // Teraz ustaw availablePoints dla każdego punktu
//     const directions = [
//         { dx: -1, dy: 0 }, // lewo
//         { dx: 1, dy: 0 }, // prawo
//         { dx: 0, dy: -1 }, // góra
//         { dx: 0, dy: 1 }, // dół
//         { dx: -1, dy: -1 }, // lewy-górny róg
//         { dx: 1, dy: -1 }, // prawy-górny róg
//         { dx: -1, dy: 1 }, // lewy-dolny róg
//         { dx: 1, dy: 1 }, // prawy-dolny róg
//     ];
// for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//         const neighbors: Point[] = [];
//         for (const { dx, dy } of directions) {
//             const nx = x + dx;
//             const ny = y + dy;
//             if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
//                 neighbors.push(board[ny][nx]);
//             }
//         }
//         board[y][x].availablePoints = neighbors;
//     }
// }
//     determineAvailablePoints(height, width, directions, board);
//     return board;
// }
