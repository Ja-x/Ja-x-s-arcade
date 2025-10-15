import { useState } from 'react'
import './App.css'
import {Dttable} from './Dt-table.jsx'

function App() {
  

  return (
    <>
      <h1>DT-table for geocaching</h1>
      <div className="tableHolder">
        <Dttable />
      </div>
    
    </>
  )
}

export default App
