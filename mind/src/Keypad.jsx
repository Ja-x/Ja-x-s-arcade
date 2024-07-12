import './Keypad.css';
import { useState } from 'react';
import React from 'react';

export function Keypad({ secret }) {
  const [keysPressed, setKeysPressed] = useState('');
  const [result, setResult] = useState('');
  const [gameMessage, setGameMessage] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [guessCount, setGuessCount] = useState(0);

  function analyseResult(keysPressed, secret) {
    let tmp = secret.split('');
    let tmpInput = keysPressed.split('');
    let tmpResult = '';

    let correctPosition = 0;
    let correctNumber = 0;

    // Count correct positions
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i] === tmpInput[i]) {
        correctPosition++;
        tmp[i] = tmpInput[i] = null; // Nullify matched characters
      }
    }

    // Count correct numbers in wrong positions
    for (let i = 0; i < tmp.length; i++) {
      if (tmpInput[i] !== null) {
        const index = tmp.indexOf(tmpInput[i]);
        if (index !== -1) {
          correctNumber++;
          tmp[index] = null; // Nullify matched character
        }
      }
    }

    // Construct result string
    tmpResult = '*'.repeat(correctPosition) + 'o'.repeat(correctNumber);
    return tmpResult;
  }

  const myFunction = (number) => {
    if (guessCount >= 10) {
      setGameMessage('You have used all your attempts! Game over.');
      return;
    }

    const newKeysPressed = keysPressed + number;
    setKeysPressed(newKeysPressed);

    if (newKeysPressed.length >= secret.length) {
      const analysisResult = analyseResult(newKeysPressed, secret);
      setResult(analysisResult);

      const newAttempt = `${newKeysPressed} - ${analysisResult}`;
      setAttempts([...attempts, newAttempt]);
      setGuessCount(guessCount + 1);


      if (newKeysPressed === secret&&guessCount<7) {
        setGameMessage('You have solved the game! N65 00 123 E025 00 123');
      } else if (newKeysPressed === secret) {
        setGameMessage('You have solved the game, but you can do better than this!');
      } else {
        setGameMessage('');
      }

      setKeysPressed('');

      if (guessCount + 1 >= 10 && newKeysPressed !== secret) {
        setGameMessage('You have used all your attempts! Game over.');
      }
    }
  };

  const handleDelete = () => {
    if (keysPressed.length > 0) {
      setKeysPressed(keysPressed.slice(0, -1));
    }
  };

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
        <button key={number} id={`button-${number}`} onClick={() => myFunction(number)}>{number}</button>
      ))}
      <div id="keysPressedDisplay">
        <p>Your sequence: {keysPressed}
        <button id="deleteButton" onClick={handleDelete} disabled={keysPressed.length === 0}>del</button> </p>
        {/* <p>Result: {result}</p> */}
        <hr/>
        <p>{gameMessage}</p> 
        <div>
          {attempts.map((attempt, index) => (
            <p key={index}>{attempt}</p>
          ))}
        </div>
      </div>
    </>
  );
}
