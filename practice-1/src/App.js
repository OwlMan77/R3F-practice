import Box from './components/Box'
import IconHolderAnimation from './components/IconHolderAnimation'
import IconHolder from './components/IconHolder'
import './App.css';

function App() {
  return (
    <div className="App" style={{
      height: '100vw'
    }}>
      <Box></Box>
      <IconHolderAnimation></IconHolderAnimation>
      <IconHolder></IconHolder>
    </div>
  );  
}

export default App;
