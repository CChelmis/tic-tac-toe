import React, { useState, useEffect } from 'react';
import './App.css';

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick} value={value}>
      {value}
    </button>
  );
}

function StartScreen({ onStartGame }) {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use default names if fields are empty
    onStartGame(
      player1Name || 'Player X', 
      player2Name || 'Player O'
    );
  };

  return (
    <div className="start-screen">
      <h1>Tic-Tac</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="player1">Player 1 (X):</label>
          <input
            type="text"
            id="player1"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="player2">Player 2 (O):</label>
          <input
            type="text"
            id="player2"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <button type="submit" className="start-button">Start Game</button>
      </form>
    </div>
  );
}

function Board({ player1Name, player2Name, player1Score, player2Score, onGameEnd, onResetScores }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], // horizontal
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6], // vertical
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8], // diagonal
      [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(square => square);
  
  // Update scores when game ends
  useEffect(() => {
    if (winner === 'X' || winner === 'O' || isDraw) {
      onGameEnd(winner);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw]);

  const currentPlayer = xIsNext ? player1Name : player2Name;
  
  const status = winner 
    ? `Winner: ${winner === 'X' ? player1Name : player2Name}`
    : isDraw
    ? "Game is a draw!"
    : `${currentPlayer} plays`;

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="game">
      <div className="game-header">
        <h1>Tic-Tac</h1>
        <button className="reset-scores-button" onClick={onResetScores} title="Reset Scores">
          ↻
        </button>
      </div>
      <div className="score-board">
        <div className="player-score">
          <span className="player-name">{player1Name}</span>
          <span className="score">{player1Score}</span>
        </div>
        <div className="player-score">
          <span className="player-name">{player2Name}</span>
          <span className="score">{player2Score}</span>
        </div>
      </div>
      <div className="status">{status}</div>
      <div className="board">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
      <button className="reset-button" onClick={resetGame}>
        New Game
      </button>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const handleStartGame = (p1Name, p2Name) => {
    setPlayer1Name(p1Name);
    setPlayer2Name(p2Name);
    setGameStarted(true);
  };

  const handleGameEnd = (winner) => {
    if (winner === 'X') {
      setPlayer1Score(prevScore => prevScore + 1);
    } else if (winner === 'O') {
      setPlayer2Score(prevScore => prevScore + 1);
    }
    // No score change for a draw
  };

  const handleResetScores = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
  };

  return (
    <div className="app">
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <Board 
          player1Name={player1Name}
          player2Name={player2Name}
          player1Score={player1Score}
          player2Score={player2Score}
          onGameEnd={handleGameEnd}
          onResetScores={handleResetScores}
        />
      )}
    </div>
  );
}

export default App; 