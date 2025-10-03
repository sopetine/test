document.addEventListener('DOMContentLoaded', () => {
    const cells = Array.from(document.querySelectorAll('.cell'));
    const statusDisplay = document.getElementById('status');
    const hintMessage = document.getElementById('hint-message');
    const resetButton = document.getElementById('reset-btn');

    let board = ['', '', '', '', '', '', '', '', ''];
    const HUMAN_PLAYER = 'X';
    const AI_PLAYER = 'O';
    let gameActive = true;
    let turn = HUMAN_PLAYER;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    // Helper function to map cell index to a user-friendly label
    function getCellLabel(index) {
        // Simple 1-9 numbering, left-to-right, top-to-bottom
        return `Cell ${index + 1}`;
    }

    // ==========================================================
    // Core Minimax Functions
    // ==========================================================

    function checkWinner(currentBoard, player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player) {
                return true;
            }
        }
        return false;
    }

    // Minimax Algorithm - calculates the best turn locally
    function minimax(newBoard, depth, isMaximizingPlayer) {
        // Base cases: scores are calculated based on depth for optimization
        if (checkWinner(newBoard, AI_PLAYER)) {
            return { score: 10 - depth }; // AI (Maximizer) wins
        } else if (checkWinner(newBoard, HUMAN_PLAYER)) {
            return { score: depth - 10 }; // Human (Minimizer) wins
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
                newBoard[index] = '';
                
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
                newBoard[index] = '';

                if (score < bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            });
            return { score: bestScore, index: bestMove };
        }
    }

    // ==========================================================
    // Hint & Turn Logic (FIXED & IMPROVED)
    // ==========================================================

    function updateHint() {
        cells.forEach(cell => cell.classList.remove('hint')); // Clear old hint highlight

        if (!gameActive || turn !== HUMAN_PLAYER) {
            hintMessage.textContent = 'Game Over or AI Turn';
            return;
        }
        
        hintMessage.textContent = 'Calculating...';
        
        // Calculate the best move for the Human Player (HUMAN_PLAYER is the Minimizier's opponent, 
        // so we run Minimax as the Minimizing player to find the "worst" case for the AI, 
        // which is the "best" case for the human).
        // A depth of 0 and isMaximizingPlayer set to 'false' (Minimizer) will search for the best human move.
        const humanBestMove = minimax(board.slice(), 0, false); 
        const bestIndex = humanBestMove.index;
        const bestScore = humanBestMove.score;

        if (bestIndex !== null) {
            // Apply hint class to the best cell
            cells[bestIndex].classList.add('hint');
            
            let resultMessage = getCellLabel(bestIndex);

            // Give context on the hint score
            if (bestScore === 0) {
                resultMessage += ' (Guaranteed Draw)';
            } else if (bestScore < 0) {
                resultMessage += ' (Winning Move!)';
            } else {
                resultMessage += ' (Best Defensive Move)';
            }
            
            hintMessage.textContent = resultMessage;
        } else {
            hintMessage.textContent = 'No available moves.';
        }
    }


    function aiTurn() {
        cells.forEach(cell => cell.classList.remove('hint'));
        hintMessage.textContent = 'AI Turn';

        setTimeout(() => {
            // AI calculates its move (Maximizing Player)
            const move = minimax(board.slice(), 0, true).index;

            if (move !== null && gameActive) {
                handleCellPlayed(cells[move], move, AI_PLAYER);
                handleResultValidation();
            }
        }, 500);
    }

    function handleResultValidation() {
        let winningLine = null;
        let gameOver = false;

        // Check for Win/Loss/Draw
        if (checkWinner(board, AI_PLAYER) || checkWinner(board, HUMAN_PLAYER) || !board.includes('')) {
            gameOver = true;
            if (checkWinner(board, AI_PLAYER)) {
                statusDisplay.innerHTML = 'AI Wins! 💔';
            } else if (checkWinner(board, HUMAN_PLAYER)) {
                statusDisplay.innerHTML = 'You Win! 🎉';
            } else {
                statusDisplay.innerHTML = 'Game Draw! 🤝';
            }
        }

        if (gameOver) {
            gameActive = false;
            // Find winning line for animation
            winningConditions.forEach(win => {
                if (board[win[0]] !== '' && board[win[0]] === board[win[1]] && board[win[1]] === board[win[2]]) {
                    winningLine = win;
                }
            });
            if (winningLine) {
                 winningLine.forEach(index => {
                    cells[index].classList.add('win');
                });
            }
            updateHint(); // Final hint update (to "Game Over")
            return;
        }

        // If game is still active, change player
        handlePlayerChange();
    }

    function handlePlayerChange() {
        turn = (turn === HUMAN_PLAYER) ? AI_PLAYER : HUMAN_PLAYER;

        if (turn === AI_PLAYER) {
            statusDisplay.innerHTML = "AI is thinking... 🤔";
            aiTurn();
        } else {
            statusDisplay.innerHTML = "Your Turn (X)";
            updateHint(); // Show the new hint for the human player
        }
    }

    function handleCellPlayed(clickedCell, clickedCellIndex, player) {
        board[clickedCellIndex] = player;
        clickedCell.classList.add(player.toLowerCase());
        clickedCell.innerHTML = player;
    }

    function handleCellClick(e) {
        const clickedCellIndex = parseInt(e.target.getAttribute('data-index'));

        if (board[clickedCellIndex] !== '' || !gameActive || turn !== HUMAN_PLAYER) return;

        handleCellPlayed(e.target, clickedCellIndex, HUMAN_PLAYER);
        handleResultValidation();
    }

    function handleResetGame() {
        gameActive = true;
        turn = HUMAN_PLAYER;
        board = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.innerHTML = "Your Turn (X)";

        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('x', 'o', 'win', 'hint');
        });
        
        updateHint(); // Show initial hint (FIXED)
    }

    // --- Event Listeners and Initialization ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', handleResetGame);
    
    // Initial call to set up the status and first hint (FIXED)
    updateHint();
});
