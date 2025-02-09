// utils/wordSearchGenerator.js

const generateGrid = (size) => {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => '')
    );
};

const getRandomLetter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
};

const directions = [
    [0, 1],   // Right
    [1, 0],   // Down
    [1, 1],   // Diagonal Down-Right
    [0, -1],  // Left
    [-1, 0],  // Up
    [-1, -1]  // Diagonal Up-Left
];

const canPlaceWord = (grid, word, row, col, dir) => {
    const [dx, dy] = dir;

    for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;

        if (
            newRow < 0 || newRow >= grid.length ||
            newCol < 0 || newCol >= grid[0].length ||
            (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i])
        ) {
            return false;
        }
    }
    return true;
};

const placeWord = (grid, word) => {
    const size = grid.length;
    let placed = false;

    while (!placed) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const dir = directions[Math.floor(Math.random() * directions.length)];

        if (canPlaceWord(grid, word, row, col, dir)) {
            for (let i = 0; i < word.length; i++) {
                grid[row + i * dir[0]][col + i * dir[1]] = word[i];
            }
            placed = true;
        }
    }
};

const fillEmptySpaces = (grid) => {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = getRandomLetter();
            }
        }
    }
};

const generateWordSearch = (words, size = 10) => {
    const grid = generateGrid(size);
    words.forEach(word => placeWord(grid, word.toUpperCase()));
    fillEmptySpaces(grid);

    return { grid, words };
};

module.exports = generateWordSearch;