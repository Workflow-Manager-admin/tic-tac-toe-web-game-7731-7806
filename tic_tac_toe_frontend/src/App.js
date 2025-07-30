import React, { useState, useEffect } from 'react';
import './App.css';

const COLORS = {
  primary: '#1976d2',
  secondary: '#ffffff',
  accent: '#ff9800',
};

/**
 * Returns an array of starting squares for a new tic tac toe board.
 */
function getInitialBoard() {
  return Array(9).fill(null);
}

/**
 * Determines if a player has won.
 * @param {Array} squares - Squares of the board.
 * @return {'X'|'O'|null}
 */
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];
  for (let [a,b,c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], combo: [a, b, c] };
    }
  }
  return null;
}

/**
 * Returns true if all squares are non-null and no winner.
 */
function isDraw(squares, winner) {
  return !winner && squares.every(Boolean);
}

/**
 * Square component representing a single cell on the board.
 */
function Square({ value, onClick, highlight, disabled }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={`ttt-square-content${value ? ' pop' : ''}`}>
        {value}
      </span>
    </button>
  );
}

/**
 * Main App Component.
 */
// PUBLIC_INTERFACE
function App() {
  // Board: array of 9 squares
  const [board, setBoard] = useState(getInitialBoard());
  // X always starts the first game
  const [xIsNext, setXIsNext] = useState(true);
  // Is the game ongoing
  const [gameActive, setGameActive] = useState(true);
  // For win highlight
  const [winCombo, setWinCombo] = useState([]);
  // To flash notifications
  const [notification, setNotification] = useState('');
  // Responsive: calculate optimum board size
  const [boardSize, setBoardSize] = useState(360);

  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth;
      setBoardSize(Math.max(220, Math.min(vw * 0.85, 420)));
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for win/draw/notification
  useEffect(() => {
    const result = calculateWinner(board);
    if (result && gameActive) {
      setWinCombo(result.combo);
      setGameActive(false);
      setNotification(`Player ${result.player} wins!`);
    } else if (isDraw(board, result)) {
      setGameActive(false);
      setNotification('It\'s a Draw!');
      setWinCombo([]);
    } else {
      setWinCombo([]);
      setNotification('');
    }
  }, [board, gameActive]);

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (!gameActive || board[idx]) return;
    const nextBoard = board.slice();
    nextBoard[idx] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(getInitialBoard());
    setGameActive(true);
    setXIsNext(true);
    setWinCombo([]);
    setNotification('');
  }

  // For current player highlight / notification coloring
  const playerColor = xIsNext ? COLORS.primary : COLORS.accent;
  const statusText = !gameActive && notification
    ? notification
    : `Current Player: ${xIsNext ? 'X' : 'O'}`;

  // Animate notification if present
  useEffect(() => {
    if (notification) {
      // Animate a simple fade-in class
      const tag = document.getElementById('ttt-notification');
      if (tag) {
        tag.classList.remove('fade-in');
        setTimeout(() => tag.classList.add('fade-in'), 0);
      }
    }
  }, [notification]);

  return (
    <div
      className="ttt-app"
      style={{
        minHeight: '100vh',
        background: COLORS.primary + "11",
        color: COLORS.primary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="ttt-container" style={{marginTop: '32px'}}>
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div
          id="ttt-notification"
          className={`ttt-status${notification ? ' ttt-notification' : ''}`}
          style={{
            color: notification ? COLORS.accent : playerColor
          }}
        >
          {statusText}
        </div>
        <div
          className="ttt-board"
          style={{
            width: `${boardSize}px`,
            height: `${boardSize}px`,
            background: COLORS.secondary,
            borderRadius: '22px',
            boxShadow: `0 6px 32px 0 ${COLORS.primary}18`,
            margin: '1.5rem auto',
            display: 'grid',
            gridTemplate: `repeat(3, 1fr) / repeat(3, 1fr)`,
            gap: '14px',
            padding: '18px',
            maxWidth: '99vw',
            transition: 'box-shadow 0.2s'
          }}
        >
          {board.map((v,i) => (
            <Square
              key={i}
              value={v}
              highlight={winCombo.includes(i)}
              onClick={() => handleSquareClick(i)}
              disabled={!!board[i] || !gameActive}
            />
          ))}
        </div>
        <div className="ttt-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '1.5rem'
        }}>
          <button
            className="ttt-btn ttt-btn-primary"
            onClick={handleReset}
            aria-label="Reset Game"
          >
            {board.every((x) => x === null) ? 'Start Game' : 'Reset Game'}
          </button>
        </div>
        <footer className="ttt-footer">
          <small style={{color: COLORS.primary, opacity: .6}}>
            &copy; {new Date().getFullYear()} KAVIA – Classic Tic Tac Toe
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
