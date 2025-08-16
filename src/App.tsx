import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
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
  // Load state from cookie if available
  const saved = Cookies.get('crosswordState');
  let initialLetters = crossword.map(col => Array(col.answer.length).fill(''));
  let initialChecked = crossword.map(col => Array(col.answer.length).fill(false));
  let initialIncorrect = crossword.map(col => Array(col.answer.length).fill(false));
  let initialSelected = { col: 0, square: 0 };
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.letters && parsed.checked && parsed.incorrect && parsed.selected) {
        initialLetters = parsed.letters;
        initialChecked = parsed.checked;
        initialIncorrect = parsed.incorrect;
        initialSelected = parsed.selected;
      }
    } catch {
      // Ignore cookie parse errors and fall back to default state
    }
  }
  // State: letters[col][square], checked[col][square], incorrect[col][square]
  const [selected, setSelected] = useState<{col: number, square: number}>(initialSelected);
  const [letters, setLetters] = useState<string[][]>(initialLetters);
  const [checked, setChecked] = useState<boolean[][]>(initialChecked);
  const [incorrect, setIncorrect] = useState<boolean[][]>(initialIncorrect);
  // Save state to cookie whenever relevant state changes
  useEffect(() => {
    const state = { letters, checked, incorrect, selected };
    Cookies.set('crosswordState', JSON.stringify(state), { expires: 365 });
  }, [letters, checked, incorrect, selected]);

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
    if (checked[selected.col][selected.square]) {
      // If checked, move to next square without changing the letter
      let nextCol = selected.col;
      const nextSq = selected.square + 1;
      if (nextSq < crossword[nextCol].answer.length) {
        setSelected({ col: nextCol, square: nextSq });
        setTimeout(() => {
          const inputs = document.querySelectorAll('.crossword-square');
          const idx = crossword.slice(0, nextCol).reduce((acc, col) => acc + col.answer.length, 0) + nextSq;
          if (inputs[idx]) (inputs[idx] as HTMLInputElement).focus();
        }, 0);
      } else {
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
      return;
    }
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
    setSelected({ col: 0, square: 0 });
    Cookies.remove('crosswordState');
  };

  // Delete incorrect letters
  const handleClearIncorrect = () => {
    setLetters(letters.map((col, colIdx) =>
      col.map((letter, sqIdx) => (incorrect[colIdx][sqIdx] ? '' : letter))
    ));
    const newIncorrect = incorrect.map(arr => arr.map(() => false));
    setIncorrect(newIncorrect);
  };



  const handleBackspace = () => {
    if (!selected) return;
    const { col, square } = selected;
    if (checked[col][square]) return;
    const newLetters = letters.map(arr => [...arr]);
    // If current square is not empty, clear it
    if (newLetters[col][square] !== '') {
      newLetters[col][square] = '';
      setLetters(newLetters);
      // Remove incorrect highlight if present
      if (incorrect[col][square]) {
        const newIncorrect = incorrect.map(arr => [...arr]);
        newIncorrect[col][square] = false;
        setIncorrect(newIncorrect);
      }
      return;
    }
    // If current square is empty, move to previous square
    let prevCol = col;
    let prevSq = square - 1;
    while (prevSq < 0 && prevCol > 0) {
      prevCol--;
      prevSq = crossword[prevCol].answer.length - 1;
    }
    if (prevSq >= 0) {
      setSelected({ col: prevCol, square: prevSq });
      setTimeout(() => {
        const inputs = document.querySelectorAll('.crossword-square');
        const idx = crossword.slice(0, prevCol).reduce((acc, col) => acc + col.answer.length, 0) + prevSq;
        if (inputs[idx]) (inputs[idx] as HTMLInputElement).focus();
      }, 0);
      // Clear previous square
      const newLetters2 = letters.map(arr => [...arr]);
      if (!checked[prevCol][prevSq]) {
        newLetters2[prevCol][prevSq] = '';
        setLetters(newLetters2);
        if (incorrect[prevCol][prevSq]) {
          const newIncorrect2 = incorrect.map(arr => [...arr]);
          newIncorrect2[prevCol][prevSq] = false;
          setIncorrect(newIncorrect2);
        }
      }
    }
  };

  return (
    <div className="crossword-app">
      <div className="clue-display">
        {crossword[selected.col].clue}
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
                className={`crossword-square${selected.col === colIdx && selected.square === sqIdx ? ' selected' : ''}${checked[colIdx][sqIdx] ? ' correct' : ''}${incorrect[colIdx][sqIdx] ? ' incorrect' : ''}`}
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
      {/* Custom QWERTY keyboard for mobile usability */}
      <div className="crossword-keyboard">
        <div className="keyboard-row">
          {[...'QWERTYUIOP'].map(l => (
            <button
              key={l}
              className="keyboard-key"
              onClick={() => handleKeyboardInput(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="keyboard-row">
          {[...'ASDFGHJKL'].map(l => (
            <button
              key={l}
              className="keyboard-key"
              onClick={() => handleKeyboardInput(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="keyboard-row">
          {[...'ZXCVBNM'].map(l => (
            <button
              key={l}
              className="keyboard-key"
              onClick={() => handleKeyboardInput(l)}
            >
              {l}
            </button>
          ))}
          <button
            key="Backspace"
            className="keyboard-key backspace-key"
            onClick={() => handleBackspace()}
          >
            ⌫
          </button>
        </div>
      </div>
      <div className="crossword-buttons">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleClearIncorrect}>Clear Incorrect</button>
        <button onClick={handleCheck}>Check</button>
      </div>
    </div>
  );
}

export default App;
