import React, { useMemo, useRef, Suspense } from "react";
import { WebGLRenderTarget, LinearFilter} from "three"
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

function IconHolderObject() {

    const { size, viewport, gl, scene, camera, clock } = useThree()
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
        console.log(model)
        // Render env to fbo
        gl.autoClear = false
        camera.layers.set(1)
        gl.setRenderTarget(envFbo)
        gl.render(scene, camera)
        // Render cube backfaces to fbo
        camera.layers.set(0)
        model.current.material = backfaceMaterial
        model.current.rotation.y = Math.PI / 2
        model.current.rotation.x = Math.PI / 1.75
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

        model.current.material.map = texture
        gl.render(scene, camera)
      }, 1)
  
    return (
      <mesh ref={model} args={[gltf.nodes.Cube.geometry, null, 1]}>
        <meshBasicMaterial />
      </mesh>
    )
}

function IconHolder() {
    return (
      <Canvas linear camera={{ fov: 50, position: [0, 0, 30] }}>
        <Suspense fallback={null}>
          <Background />
          <IconHolderObject onClick={() => console.log('clicked')}/>
        </Suspense>
      </Canvas>
    )
  }

export default IconHolder;
