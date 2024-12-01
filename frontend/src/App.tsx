import './App.css'
import { StarknetProvider } from './components/starknet-provider';
import { DevWallet } from './components/DevWallet';

import Navbar from "./components/Navbar"
import LandingPage from './components/LandingPage'

function App() {
  return (
    <div className="overflow-x-hidden w-full">
      <LandingPage/>
    </div>
  )
}

export default App
