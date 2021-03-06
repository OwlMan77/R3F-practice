import React, { useMemo, useRef, Suspense, useState } from "react";
import { WebGLRenderTarget, LinearFilter, Vector3, Vector2} from "three"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useGLTF, useTexture, useAspect } from "@react-three/drei"
import iconHolderGlb from "../assets/icon-holder.glb"
import textureUrl from '../assets/hex.jpg'
import BackfaceMaterial from "../materials/backface-material"
import RefractionMaterial from "../materials/refraction-material"

function Background() {
    const texture = useTexture(textureUrl)
    const size = useAspect(5000, 3800)
    return (
      <mesh layers={1} scale={size}>
        <planeGeometry />
        <meshBasicMaterial map={texture} map-minFilter={LinearFilter} depthTest={false} />
      </mesh>
    )
  }

function IconHolderObject(props) {

    const { size, viewport, gl, scene, camera, clock } = useThree()

      // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    const model = useRef()
    const gltf = useGLTF(iconHolderGlb)
    const texture = useTexture(textureUrl)
  
    // Create Fbo's and materials
    const [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial] = useMemo(() => {
      const envFbo = new WebGLRenderTarget(size.width, size.height)
      const backfaceFbo = new WebGLRenderTarget(size.width, size.height)
      const backfaceMaterial = new BackfaceMaterial()
      const refractionMaterial = new RefractionMaterial({ envMap: envFbo.texture, backfaceMap: backfaceFbo.texture, resolution: [size.width, size.height] })
      return [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial]
    }, [size])


    useFrame(() => {
        // Update instanced iconHolders
        model.current.matrix.needsUpdate = true 
        // Render env to fbo
        gl.autoClear = false
        camera.layers.set(1)
        gl.setRenderTarget(envFbo)
        gl.render(scene, camera)
        // Render cube backfaces to fbo
        camera.layers.set(0)
        model.current.material = backfaceMaterial
        model.current.rotation.y = Math.PI / 2
        model.current.rotation.x = Math.PI / 0.5
        gl.setRenderTarget(backfaceFbo)
        gl.clearDepth()
        gl.render(scene, camera)
        // Render env to screen
        camera.layers.set(1)
        gl.setRenderTarget(null)
        gl.render(scene, camera)
        gl.clearDepth()
        // Render cube with refraction material to screen
        camera.layers.set(0)
        model.current.material = refractionMaterial
        gl.render(scene, camera)

        // Renders test image on front of cube

        // model.current.material = texture
        // gl.render(scene, camera)
      }, 1)
  
    return (
      <mesh
      {...props}
      ref={model} args={[gltf.nodes.Cube.geometry, null, 1]}
      >
        <meshBasicMaterial color={hovered ? 'hotpink' : 'orange'}/>
      </mesh>
    )
}

function IconHolder() {
    return (
      <Canvas linear camera={{ fov: 50, position: [0, 0, 30] }}>
        <Suspense fallback={null}>
          <IconHolderObject position={[1, 8, 3]}/>
          <IconHolderObject position={[1, 2, 3]}/>
          <IconHolderObject position={[1, -4 , 3]}/>
          <IconHolderObject position={[-8, 8, 3]}/>
          <IconHolderObject position={[-8, 2, 3]}/>
          <IconHolderObject position={[-8, -4 , 3]}/>
          <IconHolderObject position={[8, 8, 3]}/>
          <IconHolderObject position={[8, 2, 3]}/>
          <IconHolderObject position={[8, -4 , 3]}/>
          <Background />

        </Suspense>
      </Canvas>
    )
  }

export default IconHolder;
