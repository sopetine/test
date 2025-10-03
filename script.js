document.addEventListener('DOMContentLoaded', () => {
    const cells = Array.from(document.querySelectorAll('.cell'));
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');

    let board = ['', '', '', '', '', '', '', '', ''];
    const HUMAN_PLAYER = 'X';
    const AI_PLAYER = 'O';
    let gameActive = true;
    let turn = HUMAN_PLAYER; // X starts

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // ==========================================================
    // Core Minimax Functions
    // ==========================================================

    // Helper function to check for a winner on a given board state
    function checkWinner(currentBoard, player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player) {
                return true;
            }
        }
        return false;
    }

    // Minimax Algorithm - The brain of the hard AI
    function minimax(newBoard, depth, isMaximizingPlayer) {
        // Base cases: check for wins, losses, or draw
        if (checkWinner(newBoard, AI_PLAYER)) {
            return { score: 10 - depth }; // AI wins (Maximizer)
        } else if (checkWinner(newBoard, HUMAN_PLAYER)) {
            return { score: depth - 10 }; // Human wins (Minimizer)
        } else if (!newBoard.includes('')) {
            return { score: 0 }; // Draw
        }

        const availableSpots = newBoard.map((val, index) => (val === '' ? index : null)).filter(val => val !== null);

        if (isMaximizingPlayer) {
            let bestScore = -Infinity;
            let bestMove = null;

            availableSpots.forEach(index => {
                newBoard[index] = AI_PLAYER;
                let score = minimax(newBoard, depth + 1, false).score;
                newBoard[index] = ''; // Reset spot
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            });
            return { score: bestScore, index: bestMove };
        } else {
            let bestScore = Infinity;
            let bestMove = null;

            availableSpots.forEach(index => {
                newBoard[index] = HUMAN_PLAYER;
                let score = minimax(newBoard, depth + 1, true).score;
                newBoard[index] = ''; // Reset spot

                if (score < bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            });
            return { score: bestScore, index: bestMove };
        }
    }

    // Function for AI to make a move
    function aiTurn() {
        // Use a slight delay for the "super-smooth" modern feel
        setTimeout(() => {
            const move = minimax(board, 0, true).index;

            if (move !== null && gameActive) {
                handleCellPlayed(cells[move], move, AI_PLAYER);
                handleResultValidation();
            }
        }, 500); // 500ms delay for a smooth 'thinking' pause
    }

    // ==========================================================
    // Game Flow & UI Functions (Modified)
    // ==========================================================

    function handleResultValidation() {
        let winningLine = null;

        // Check for AI Win
        if (checkWinner(board, AI_PLAYER)) {
            statusDisplay.innerHTML = 'AI Wins!';
            gameActive = false;
            // Find and animate winning line
            winningConditions.forEach(win => {
                if (board[win[0]] === AI_PLAYER && board[win[1]] === AI_PLAYER && board[win[2]] === AI_PLAYER) {
                    winningLine = win;
                }
            });
        }
        // Check for Human Win
        else if (checkWinner(board, HUMAN_PLAYER)) {
            statusDisplay.innerHTML = 'You Win!';
            gameActive = false;
            // Find and animate winning line
            winningConditions.forEach(win => {
                if (board[win[0]] === HUMAN_PLAYER && board[win[1]] === HUMAN_PLAYER && board[win[2]] === HUMAN_PLAYER) {
                    winningLine = win;
                }
            });
        }
        // Check for Draw
        else if (!board.includes('')) {
            statusDisplay.innerHTML = 'Game Draw!';
            gameActive = false;
        }

        // Apply animation if game is over
        if (!gameActive && winningLine) {
             winningLine.forEach(index => {
                cells[index].classList.add('win');
            });
        }

        // If game is still active, change player
        if (gameActive) {
            handlePlayerChange();
        }
    }

    function handlePlayerChange() {
        turn = (turn === HUMAN_PLAYER) ? AI_PLAYER : HUMAN_PLAYER;

        if (turn === AI_PLAYER) {
            statusDisplay.innerHTML = "AI is thinking...";
            aiTurn();
        } else {
            statusDisplay.innerHTML = "Your Turn (X)";
        }
    }

    function handleCellPlayed(clickedCell, clickedCellIndex, player) {
        board[clickedCellIndex] = player;
        // The class is the lowercase of the player ('x' or 'o')
        clickedCell.classList.add(player.toLowerCase());
        clickedCell.innerHTML = player;
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Only allow human moves if it's their turn and the cell is empty
        if (board[clickedCellIndex] !== '' || !gameActive || turn !== HUMAN_PLAYER) return;

        handleCellPlayed(clickedCell, clickedCellIndex, HUMAN_PLAYER);
        handleResultValidation();
    }

    function handleResetGame() {
        gameActive = true;
        turn = HUMAN_PLAYER;
        board = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.innerHTML = "Your Turn (X)";

        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('x', 'o', 'win');
        });
    }

    // --- Event Listeners ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', handleResetGame);
});
