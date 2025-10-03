document.addEventListener('DOMContentLoaded', () => {
    const cells = Array.from(document.querySelectorAll('.cell'));
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;

    // --- Winning Conditions ---
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]            // Diagonals
    ];

    // --- Game Logic Functions ---

    function handleResultValidation() {
        let roundWon = false;
        let winningLine = null;

        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];

            if (a === '' || b === '' || c === '') continue;

            if (a === b && b === c) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = `Player ${currentPlayer} Wins!`;
            gameActive = false;
            // Apply winning animation/style
            winningLine.forEach(index => {
                cells[index].classList.add('win');
            });
            return;
        }

        // Check for a Draw
        if (!board.includes('')) {
            statusDisplay.innerHTML = 'Game Draw!';
            gameActive = false;
            return;
        }

        // If no win or draw, change player
        handlePlayerChange();
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn`;
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        board[clickedCellIndex] = currentPlayer;
        // Add the player class (X or O) and update the text
        clickedCell.classList.add(currentPlayer.toLowerCase());
        clickedCell.innerHTML = currentPlayer;
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== '' || !gameActive) return;

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleResetGame() {
        gameActive = true;
        currentPlayer = 'X';
        board = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.innerHTML = `Player X's Turn`;

        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('x', 'o', 'win');
        });
    }

    // --- Event Listeners ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', handleResetGame);

    // Initial Status
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn`;
});
