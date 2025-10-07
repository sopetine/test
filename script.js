// --- Elements ---
const boardEl = document.getElementById('board');
const turnEl  = document.getElementById('turn');
const msgEl   = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const resetScoresBtn = document.getElementById('resetScores');
const sxEl = document.getElementById('sx'), soEl = document.getElementById('so'), sdEl = document.getElementById('sd');
const confettiRoot = document.getElementById('confetti');

// --- Game constants ---
const WINS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

// --- State ---
let board, current, active, scores, lastWinLine;

// --- Init ---
initScores();
initState();
bindEvents();

// --- Functions ---
function initState(){
  board = Array(9).fill('');
  current = 'X'; // player always starts
  active = true;
  lastWinLine = null;
  setMessage('Ваш ход (X).');
  updateTurn();
  render();
}

function initScores(){
  scores = { X:0, O:0, D:0 };
  sxEl.textContent = soEl.textContent = sdEl.textContent = '0';
}

function bindEvents(){
  resetBtn.addEventListener('click', initState);
  resetScoresBtn.addEventListener('click', () => { initScores(); initState(); });
}

function setMessage(t){ msgEl.textContent = t; }
function updateTurn(){ turnEl.textContent = current; }

function render(){
  boardEl.innerHTML = '';
  const hints = (active && current === 'X') ? winningMovesFor('X') : new Set();

  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell' + (board[i] ? ' filled' : '');
    if(!board[i] && hints.has(i)) cell.classList.add('hint');
    if (lastWinLine && lastWinLine.includes(i)) cell.classList.add('won');
    cell.setAttribute('role','gridcell');
    cell.setAttribute('aria-label', `Клетка ${i+1} ${board[i] || 'пусто'}`);
    cell.dataset.idx = i;

    const mark = document.createElement('span');
    mark.className = 'cell__mark';
    mark.textContent = board[i];
    cell.appendChild(mark);

    cell.addEventListener('pointerdown', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--rx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--ry', `${e.clientY - r.top}px`);
      e.currentTarget.classList.add('ripple');
      setTimeout(() => e.currentTarget.classList.remove('ripple'), 650);
    });

    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

function onCellClick(e){
  const i = +e.currentTarget.dataset.idx;
  if (!active || board[i] || current !== 'X') return; // Only X clicks

  move(i, 'X');
  const res = evaluateBoard(board);
  if (res.winner) return endRound(res);

  // AI move
  aiTurn();
}

function move(i, symbol){
  board[i] = symbol;
  current = (symbol === 'X') ? 'O' : 'X';
  render();          // redraw (hides hints when O moves; shows hints when X moves)
  updateTurn();
}

function evaluateBoard(s){
  for (const line of WINS){
    const [a,b,c] = line;
    if (s[a] && s[a] === s[b] && s[a] === s[c]) return { winner: s[a], line };
  }
  if (s.every(Boolean)) return { winner:'D', line:null };
  return { winner:null, line:null };
}

function emptyIndices(s = board){
  const out = [];
  for (let i=0;i<9;i++) if (!s[i]) out.push(i);
  return out;
}

// Set of indices where placing `symbol` wins immediately
function winningMovesFor(symbol){
  const result = new Set();
  for (const i of emptyIndices()){
    const tmp = board.slice();
    tmp[i] = symbol;
    const r = evaluateBoard(tmp);
    if (r.winner === symbol) result.add(i);
  }
  return result;
}

// --- AI (O) — minimax with alpha-beta pruning ---
function aiTurn(){
  setMessage('Ход ИИ…');
  turnEl.classList.add('blink');
  setTimeout(() => {
    let best = minimax(board.slice(), 'O', -Infinity, Infinity);
    // Fallback safety
    if (best.index == null || best.index < 0 || board[best.index]){
      const empties = emptyIndices();
      best = { index: empties[Math.floor(Math.random()*empties.length)] };
    }

    move(best.index, 'O');
    turnEl.classList.remove('blink');

    const res = evaluateBoard(board);
    if (res.winner) return endRound(res);

    setMessage('Ваш ход (X).');
  }, 180);
}

function minimax(state, player, alpha, beta){
  const res = evaluateBoard(state);
  if (res.winner === 'O') return { score:+10 };
  if (res.winner === 'X') return { score:-10 };
  if (res.winner === 'D') return { score:0 };

  const isMax = (player === 'O');
  let best = { index:-1, score: isMax ? -Infinity : +Infinity };

  for (let i=0;i<9;i++) if (!state[i]){
    state[i] = player;
    const next = minimax(state, isMax ? 'X' : 'O', alpha, beta);
    state[i] = '';
    const move = { index:i, score: next.score };

    if (isMax){
      if (move.score > best.score) best = move;
      alpha = Math.max(alpha, move.score);
    } else {
      if (move.score < best.score) best = move;
      beta = Math.min(beta, move.score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function endRound({ winner, line }){
  active = false;
  lastWinLine = line;

  if (winner === 'D'){
    setMessage('Ничья 🙃');
    scores.D++; sdEl.textContent = scores.D;
  } else {
    setMessage(`Победа ${winner}! 🎉`);
    scores[winner]++; (winner === 'X' ? sxEl : soEl).textContent = scores[winner];
    fireConfetti(winner === 'X' ? '#70ffc3' : '#84d8ff');
  }
  render(); // final draw (no hints when inactive)
}

// --- Confetti (tiny & fast) ---
function fireConfetti(color){
  const N = 36;
  for (let i=0;i<N;i++){
    const s = document.createElement('span');
    s.className = 'confetti';
    const left = Math.random()*100;
    const delay = Math.random()*0.15;
    const dur = 0.9 + Math.random()*0.6;
    s.style.left = left + 'vw';
    s.style.background = color;
    s.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = delay + 's';
    s.style.filter = `hue-rotate(${Math.floor(Math.random()*60)-30}deg)`;
    confettiRoot.appendChild(s);
    setTimeout(() => s.remove(), (delay + dur) * 1000 + 120);
  }
}
