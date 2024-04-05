import { useState } from "react";

function Square({ value, onSquareClick, winning = false }) {
  let squareClass = "square " + (winning ? "winning-square" : "");
  return (
    <button className={squareClass} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo.winner;
  const winningLine = winnerInfo.line;
  let status;

  if (winner) {
    status = "Winner: " + winner;
  } else {
    if(winnerInfo.isDraw) {
      status = "Draw"
    } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }}

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares).winner) {
      return;
    }

    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares, i);
  }

  // Rewrite Board to use two loops to make the squares instead of hardcoding them
  const boardRows = [...Array(3)].map((x, i) => {
    const boardSquares = [...Array(3)].map((x, j) => {
      return (
        <Square
          key={3 * i + j}
          value={squares[3 * i + j]}
          onSquareClick={() => handleClick(3 * i + j)}
          winning={winningLine && winningLine.includes(3 * i + j)}
        />
      );
    });

    return (
      <div key={i} className="board-row">
        {boardSquares}
      </div>
    );
  });

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), index: -1 },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascending, setAscending] = useState(true);

  const displayOrder = ascending ? "Ascending" : "Descending";
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, i) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, index: i },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((turnInfo, move) => {
    let description;
    if (move > 0) {
      const row = Math.floor(turnInfo.index / 3);
      const col = turnInfo.index % 3;
      description = "Go to move #" + move + ' - (' + row + ', ' + col + ')';
    } else {
      description = "Go to game start";
    }

    return (
      <li key={move}>
        {/* 1 - For the current move only, show “You are at move #…” instead of a button. */}
        {move === currentMove ? (
          <b>{"You are at move #" + move}</b>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  // 3 - Add a toggle button that lets you sort the moves in either ascending or descending order.
  function toggleDisplayOrder() {
    setAscending(!ascending);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>

      <div className="game-info">
        <button onClick={toggleDisplayOrder}>Sort list {displayOrder}</button>
        <ol>{ascending ? moves : moves.slice().reverse()}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
        isDraw: false,
      };
    }
  }

  let isDraw = true;
  for(let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }

  return {
    winner: null,
    line: null,
    isDraw: isDraw,
  };
}
