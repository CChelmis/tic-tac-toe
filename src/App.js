import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, onValue, update, get } from 'firebase/database';
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
      <h1>Emma eisai kouukla</h1>
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

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'creating', 'joining', 'playing'
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameId, setGameId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [playerRole, setPlayerRole] = useState(''); // 'X' or 'O'
  const [joinCode, setJoinCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState('');

  // Generate a unique ID for the player when the component mounts
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 9);
    setPlayerId(id);
  }, []);

  // Listen for game updates
  useEffect(() => {
    if (gameId && gameState === 'playing') {
      const gameRef = ref(database, `games/${gameId}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameData(data);
          
          // Update player names if needed
          if (playerRole === 'X' && data.player2Name && data.player2Name !== player2Name) {
            setPlayer2Name(data.player2Name);
          } else if (playerRole === 'O' && data.player1Name && data.player1Name !== player1Name) {
            setPlayer1Name(data.player1Name);
          }
          
          // Update scores
          if (data.player1Score !== undefined) setPlayer1Score(data.player1Score);
          if (data.player2Score !== undefined) setPlayer2Score(data.player2Score);
        }
      });
      
      return () => unsubscribe();
    }
  }, [gameId, gameState, playerRole, player1Name, player2Name]);

  const createGame = () => {
    setGameState('creating');
  };

  const joinGame = () => {
    setGameState('joining');
  };

  const handleCreateGame = (name) => {
    setPlayer1Name(name);
    setPlayerRole('X');
    
    // Generate a unique game ID (6 characters)
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(newGameId);
    
    // Create game in Firebase
    set(ref(database, `games/${newGameId}`), {
      player1Id: playerId,
      player1Name: name,
      player1Score: 0,
      player2Score: 0,
      currentPlayer: 'X',
      board: Array(9).fill(null),
      status: 'waiting',
      lastUpdated: Date.now()
    });
    
    setGameState('playing');
  };

  const handleJoinGame = (code, name) => {
    const gameRef = ref(database, `games/${code}`);
    
    get(gameRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.status === 'waiting') {
          setPlayer2Name(name);
          setPlayerRole('O');
          setGameId(code);
          setPlayer1Name(data.player1Name);
          
          // Update game in Firebase
          update(gameRef, {
            player2Id: playerId,
            player2Name: name,
            status: 'playing',
            lastUpdated: Date.now()
          });
          
          setGameState('playing');
        } else {
          setError('This game is already full');
        }
      } else {
        setError('Game not found. Check the code and try again.');
      }
    }).catch((error) => {
      setError('Error joining game: ' + error.message);
    });
  };

  const handleGameEnd = (winner) => {
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`);
      
      if (winner === 'X') {
        update(gameRef, {
          player1Score: player1Score + 1,
          lastUpdated: Date.now()
        });
      } else if (winner === 'O') {
        update(gameRef, {
          player2Score: player2Score + 1,
          lastUpdated: Date.now()
        });
      }
    }
    // No score change for a draw
  };

  const handleResetScores = () => {
    if (gameId) {
      update(ref(database, `games/${gameId}`), {
        player1Score: 0,
        player2Score: 0,
        lastUpdated: Date.now()
      });
    }
  };

  const handleBoardUpdate = (squares, isXNext) => {
    if (gameId) {
      update(ref(database, `games/${gameId}`), {
        board: squares,
        currentPlayer: isXNext ? 'X' : 'O',
        lastUpdated: Date.now()
      });
    }
  };

  const backToMenu = () => {
    setGameState('menu');
    setError('');
    setJoinCode('');
  };

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu-screen">
          <h1>Emma eisai kouukla</h1>
          <div className="menu-buttons">
            <button onClick={createGame} className="menu-button">Create Game</button>
            <button onClick={joinGame} className="menu-button">Join Game</button>
          </div>
        </div>
      )}

      {gameState === 'creating' && (
        <div className="create-game-screen">
          <h1>Create New Game</h1>
          <div className="input-group">
            <label htmlFor="playerName">Your Name:</label>
            <input
              type="text"
              id="playerName"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="menu-buttons">
            <button 
              onClick={() => handleCreateGame(player1Name || 'Player X')} 
              className="menu-button"
            >
              Create Game
            </button>
            <button onClick={backToMenu} className="menu-button secondary">Back</button>
          </div>
        </div>
      )}

      {gameState === 'joining' && (
        <div className="join-game-screen">
          <h1>Join Game</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <label htmlFor="gameCode">Game Code:</label>
            <input
              type="text"
              id="gameCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
            />
          </div>
          <div className="input-group">
            <label htmlFor="playerName">Your Name:</label>
            <input
              type="text"
              id="playerName"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="menu-buttons">
            <button 
              onClick={() => handleJoinGame(joinCode, player2Name || 'Player O')} 
              className="menu-button"
              disabled={!joinCode || joinCode.length !== 6}
            >
              Join Game
            </button>
            <button onClick={backToMenu} className="menu-button secondary">Back</button>
          </div>
        </div>
      )}

      {gameState === 'playing' && gameData && (
        <div className="game-container">
          {playerRole === 'X' && gameData.status === 'waiting' && (
            <div className="waiting-message">
              <h2>Waiting for opponent to join...</h2>
              <p>Share this code with your friend: <span className="game-code">{gameId}</span></p>
            </div>
          )}
          
          <OnlineBoard 
            player1Name={player1Name}
            player2Name={player2Name}
            player1Score={player1Score}
            player2Score={player2Score}
            onGameEnd={handleGameEnd}
            onResetScores={handleResetScores}
            onBoardUpdate={handleBoardUpdate}
            gameData={gameData}
            playerRole={playerRole}
            gameId={gameId}
          />
        </div>
      )}
    </div>
  );
}

function OnlineBoard({ 
  player1Name, 
  player2Name, 
  player1Score, 
  player2Score, 
  onGameEnd, 
  onResetScores, 
  onBoardUpdate,
  gameData,
  playerRole,
  gameId
}) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Update local state when game data changes
  useEffect(() => {
    if (gameData && gameData.board) {
      setSquares(gameData.board);
      setXIsNext(gameData.currentPlayer === 'X');
    }
  }, [gameData]);

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
    // Only allow moves if it's this player's turn
    const isMyTurn = (playerRole === 'X' && xIsNext) || (playerRole === 'O' && !xIsNext);
    
    if (!isMyTurn || calculateWinner(squares) || squares[i] || gameData.status !== 'playing') {
      return;
    }
    
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    
    // Update local state
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    
    // Update Firebase
    onBoardUpdate(nextSquares, !xIsNext);
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
    const newSquares = Array(9).fill(null);
    setSquares(newSquares);
    setXIsNext(true);
    onBoardUpdate(newSquares, true);
  };

  return (
    <div className="game">
      <div className="game-header">
        <h1>Emma eisai kouukla</h1>
        <div className="game-info">
          <span className="game-code-label">Game Code: </span>
          <span className="game-code">{gameId}</span>
        </div>
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
      
      {gameData.status === 'playing' ? (
        <>
          <div className="board">
            {squares.map((square, i) => (
              <Square
                key={i}
                value={square}
                onClick={() => handleClick(i)}
              />
            ))}
          </div>
          <div className="game-controls">
            <button className="reset-button" onClick={resetGame}>
              New Game
            </button>
            <div className="player-indicator">
              You are Player {playerRole === 'X' ? '1' : '2'} ({playerRole})
            </div>
          </div>
        </>
      ) : (
        <div className="waiting-overlay">
          <div className="waiting-message">Waiting for opponent...</div>
        </div>
      )}
    </div>
  );
}

export default App; 