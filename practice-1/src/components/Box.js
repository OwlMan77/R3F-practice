import { useRef } from "react";
import { Canvas, useFrame} from '@react-three/fiber'

const AnimateFrame = (props) => {
  useFrame(({ clock }) => {
    props.meshRef.current.rotation.x += 0.01;
  });
  return null;
}

function Box() {

  const squareMesh = useRef()
  return (
    <div className="Box">
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

export default Box;
