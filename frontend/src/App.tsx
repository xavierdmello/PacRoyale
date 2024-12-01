import './App.css'
import { StarknetProvider } from './components/starknet-provider';
import { DevWallet } from './components/DevWallet';

import Navbar from "./components/Navbar"
import LandingPage from './components/LandingPage'

function App() {

  return (
    <>
    <Navbar/>
    <LandingPage/>
    </>
  )
}

export default App
