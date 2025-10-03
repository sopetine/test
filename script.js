/* --- Global Styles & Typography --- */
body {
    font-family: 'Poppins', sans-serif;
    background-color: #EAEAEA; /* Light background */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    color: #343A40;
}

.game-container {
    background-color: #FFFFFF;
    padding: 30px 40px;
    border-radius: 15px;
    /* Subtle, modern shadow for depth */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
    text-align: center;
}

h1 {
    font-weight: 700;
    margin-bottom: 10px;
    color: #00AEEF; /* Accent color for the title */
}

/* --- Hint Field Styling --- */
.hint-field {
    background-color: #F0F4F8; /* Very light blue/gray background */
    padding: 10px 15px;
    border-radius: 8px;
    margin: 15px 0;
    font-size: 0.95em;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 20px; /* To prevent jumping */
}

.hint-label {
    color: #343A40;
    margin-right: 8px;
}

.hint-message {
    color: #00BFA5; /* Use the X color for emphasis */
    font-weight: 700;
    transition: color 0.3s ease;
}


/* --- Board & Cells --- */
.game-board {
    display: grid;
    grid-template-columns: repeat(3, 100px); /* Adjust size as needed */
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    margin: 20px auto;
}

.cell {
    background-color: #F8F9FA;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 4em;
    cursor: pointer;
    transition: all 0.2s ease-out; /* Super smooth transition base */
    user-select: none;
}

/* Hover Effect - The smoothness is here */
.cell:not(.x):not(.o):hover {
    background-color: #E6E9EC;
    transform: translateY(-2px); /* Slight lift */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* --- Player Marks & Animation --- */
.cell.x {
    color: #00BFA5; /* Teal */
    font-weight: 600;
    transform: scale(0.8);
    opacity: 0;
    animation: mark-appear 0.3s forwards ease-out;
}

.cell.o {
    color: #FF6B6B; /* Coral */
    font-weight: 600;
    transform: scale(0.8);
    opacity: 0;
    animation: mark-appear 0.3s forwards ease-out;
}

@keyframes mark-appear {
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* --- Winning Cells (Add this class with JS) --- */
.cell.win {
    background-color: rgba(0, 191, 165, 0.2); /* Light transparent highlight */
    animation: win-pulse 1.5s infinite alternate;
}

@keyframes win-pulse {
    from { box-shadow: 0 0 15px 5px rgba(0, 191, 165, 0.8); }
    to { box-shadow: 0 0 5px 2px rgba(0, 191, 165, 0.5); }
}

/* --- Hint Cell Highlight (New feature) --- */
.cell.hint {
    border: 3px dashed #00AEEF; /* Electric Blue border */
    background-color: rgba(0, 174, 239, 0.1); /* Slight blue background tint */
    opacity: 1;
}

/* --- Buttons and Status --- */
.reset-button {
    padding: 12px 25px;
    font-size: 1em;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    background-color: #00AEEF; /* Blue accent */
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 15px;
    box-shadow: 0 4px #009BD8; /* Press-down effect base */
}

.reset-button:hover {
    background-color: #009BD8;
}

.reset-button:active {
    transform: translateY(4px); /* Press down */
    box-shadow: 0 0 #009BD8;
}
