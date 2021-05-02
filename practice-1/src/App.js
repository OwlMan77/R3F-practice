import { useRef } from "react";
import { Canvas, useFrame} from '@react-three/fiber'
import './App.css';

const AnimateFrame = (props) => {
  useFrame(({ clock }) => {
    props.meshRef.current.rotation.x += 0.01;
  });
  return null;
}

function App() {

  const squareMesh = useRef()
  return (
    <div className="App">
    <Canvas>
      <mesh ref={squareMesh}>
        <boxGeometry />
        <meshBasicMaterial color={"transparent"} />
        <AnimateFrame meshRef={squareMesh} />

      </mesh>
    </Canvas>
    </div>
  );  
}

export default App;
