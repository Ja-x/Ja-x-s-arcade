import { useState, useEffect } from 'react';
import './App.css';
import {Keypad} from './Keypad.jsx';

function App() {
  const [secret, setSecret] = useState('');

   useEffect(() => {
    const generateSecret = () => {
      const a = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setSecret(a);
      console.log("Secret is:", a);
    };
    generateSecret();
  }, []);

console.log("Arvattava luku on tällä kertaa: ",secret);

  return (
    <>
      <div>
 
      </div>
      <h1>GCAQVZ3 Keylock, solve the code</h1>
      <div >
          <Keypad secret={secret} />
       </div>
    </>
  )
}

export default App;