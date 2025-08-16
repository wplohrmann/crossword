
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
    const newLetters = letters.map(arr => [...arr]);
    newLetters[colIdx][squareIdx] = value.toUpperCase().slice(0, 1);
    setLetters(newLetters);
    // Remove incorrect highlight if deleted
    if (incorrect[colIdx][squareIdx] && value === '') {
      const newIncorrect = incorrect.map(arr => [...arr]);
      newIncorrect[colIdx][squareIdx] = false;
      setIncorrect(newIncorrect);
    }
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

  // Helper: is column fully correct?
  const isColCorrect = (colIdx: number) => checked[colIdx].every(Boolean);
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
              <input
                key={sqIdx}
                type="text"
                maxLength={1}
                value={letters[colIdx][sqIdx]}
                onFocus={() => handleSelect(colIdx, sqIdx)}
                onChange={e => handleInput(colIdx, sqIdx, e.target.value)}
                className={`crossword-square${selected && selected.col === colIdx && selected.square === sqIdx ? ' selected' : ''}${checked[colIdx][sqIdx] ? ' correct' : ''}${incorrect[colIdx][sqIdx] ? ' incorrect' : ''}`}
                disabled={checked[colIdx][sqIdx]}
              />
            ))}
          </div>
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
