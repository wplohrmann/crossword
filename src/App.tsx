
import { useState } from 'react';
import './App.css';

// Hardcoded crossword data
const crossword = [
  {
    clue: '1. First two letters of the message',
    answer: 'HE',
    offset: 0,
  },
  {
    clue: '2. Third letter of the message',
    answer: 'L',
    offset: 1,
  },
  {
    clue: '3. Fourth letter of the message',
    answer: 'L',
    offset: 2,
  },
  {
    clue: '4. Fifth letter of the message',
    answer: 'O',
    offset: 3,
  },
];

function App() {
  // State: letters[col][square], checked[col][square], incorrect[col][square]
  const [selected, setSelected] = useState<{col: number, square: number} | null>(null);
  const [letters, setLetters] = useState<string[][]>(
    crossword.map(col => Array(col.answer.length).fill(''))
  );
  const [checked, setChecked] = useState<boolean[][]>(
    crossword.map(col => Array(col.answer.length).fill(false))
  );
  const [incorrect, setIncorrect] = useState<boolean[][]>(
    crossword.map(col => Array(col.answer.length).fill(false))
  );

  const handleSelect = (colIdx: number, squareIdx: number) => {
    setSelected({col: colIdx, square: squareIdx});
  };

  const handleInput = (colIdx: number, squareIdx: number, value: string) => {
    if (checked[colIdx][squareIdx]) return; // lock correct answers
    const letter = value.toUpperCase().slice(0, 1); // Only one letter
    const newLetters = letters.map(arr => [...arr]);
    newLetters[colIdx][squareIdx] = letter;
    setLetters(newLetters);
    // Remove incorrect highlight if deleted
    if (incorrect[colIdx][squareIdx] && letter === '') {
      const newIncorrect = incorrect.map(arr => [...arr]);
      newIncorrect[colIdx][squareIdx] = false;
      setIncorrect(newIncorrect);
    }

    // Move focus to next available square if a letter was entered
    if (letter !== '') {
      let nextCol = colIdx;
      const nextSq = squareIdx + 1;
      // If next square in column exists
      if (nextSq < crossword[nextCol].answer.length) {
        setSelected({ col: nextCol, square: nextSq });
        // Try to focus the next input
        setTimeout(() => {
          const inputs = document.querySelectorAll('.crossword-square');
          const idx = crossword.slice(0, nextCol).reduce((acc, col) => acc + col.answer.length, 0) + nextSq;
          if (inputs[idx]) (inputs[idx] as HTMLInputElement).focus();
        }, 0);
      } else {
        // Move to first square of next column if exists
        nextCol++;
        while (nextCol < crossword.length && crossword[nextCol].answer.length === 0) {
          nextCol++;
        }
        if (nextCol < crossword.length) {
          setSelected({ col: nextCol, square: 0 });
          setTimeout(() => {
            const inputs = document.querySelectorAll('.crossword-square');
            const idx = crossword.slice(0, nextCol).reduce((acc, col) => acc + col.answer.length, 0);
            if (inputs[idx]) (inputs[idx] as HTMLInputElement).focus();
          }, 0);
        }
      }
    }
  };

  // Custom keyboard handler
  const handleKeyboardInput = (letter: string) => {
    if (!selected) return;
    handleInput(selected.col, selected.square, letter);
  };

  const handleCheck = () => {
    const newChecked = checked.map(arr => [...arr]);
    const newIncorrect = incorrect.map(arr => [...arr]);
    crossword.forEach((col, colIdx) => {
      for (let sqIdx = 0; sqIdx < col.answer.length; sqIdx++) {
        if (letters[colIdx][sqIdx] === col.answer[sqIdx]) {
          newChecked[colIdx][sqIdx] = true;
          newIncorrect[colIdx][sqIdx] = false;
        } else {
          if (letters[colIdx][sqIdx] !== '') {
            newIncorrect[colIdx][sqIdx] = true;
          }
        }
      }
    });
    setChecked(newChecked);
    setIncorrect(newIncorrect);
  };

  const handleClear = () => {
    setLetters(crossword.map(col => Array(col.answer.length).fill('')));
    setChecked(crossword.map(col => Array(col.answer.length).fill(false)));
    setIncorrect(crossword.map(col => Array(col.answer.length).fill(false)));
    setSelected(null);
  };

  // Helper: is crossword fully correct?
  const isAllCorrect = checked.every(col => col.every(Boolean));

  return (
    <div className="crossword-app">
      <h2>Simple Crossword</h2>
      <div className="clue-display">
        {selected ? crossword[selected.col].clue : 'Select a square to see the clue'}
      </div>
      <div className="crossword-grid">
        {crossword.map((col, colIdx) => (
          <div
            key={colIdx}
            className="crossword-column"
            style={{ marginTop: col.offset * 30 }}
          >
            {Array.from({length: col.answer.length}).map((_, sqIdx) => (
              <div
                key={sqIdx}
                tabIndex={0}
                onClick={() => handleSelect(colIdx, sqIdx)}
                className={`crossword-square${selected && selected.col === colIdx && selected.square === sqIdx ? ' selected' : ''}${checked[colIdx][sqIdx] ? ' correct' : ''}${incorrect[colIdx][sqIdx] ? ' incorrect' : ''}`}
                style={{
                  userSelect: 'none',
                  outline: 'none',
                  cursor: checked[colIdx][sqIdx] ? 'default' : 'pointer',
                }}
                aria-label={`Square ${sqIdx + 1} of clue ${colIdx + 1}`}
              >
                {letters[colIdx][sqIdx]}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Custom keyboard for mobile usability */}
      <div className="crossword-keyboard">
        {[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(l => (
          <button
            key={l}
            className="keyboard-key"
            onClick={() => handleKeyboardInput(l)}
            disabled={!selected || (selected && checked[selected.col][selected.square])}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="crossword-buttons">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleCheck}>Check</button>
      </div>
      <div className="crossword-message">
        {/* Show the message if all correct */}
        {isAllCorrect ? <span className="success">Message: HELLO</span> : null}
      </div>
    </div>
  );
}

export default App;
