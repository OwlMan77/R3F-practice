import React, { useMemo, useRef, Suspense } from "react";
import { WebGLRenderTarget, Object3D } from "three"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import iconHolderGlb from "../assets/icon-holder.glb"
import BackfaceMaterial from "../materials/backface-material"
import RefractionMaterial from "../materials/refraction-material"

function IconHolders() {

    const { size, viewport, gl, scene, camera, clock } = useThree()
    const model = useRef()
    const gltf = useGLTF(iconHolderGlb)
  
    // Create Fbo's and materials
    const [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial] = useMemo(() => {
      const envFbo = new WebGLRenderTarget(size.width, size.height)
      const backfaceFbo = new WebGLRenderTarget(size.width, size.height)
      const backfaceMaterial = new BackfaceMaterial()
      const refractionMaterial = new RefractionMaterial({ envMap: envFbo.texture, backfaceMap: backfaceFbo.texture, resolution: [size.width, size.height] })
      return [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial]
    }, [size])
  
    // Create random position data
    const dummy = useMemo(() => new Object3D(), [])
    const diamonds = useMemo(
      () =>
        new Array(80).fill().map((_, i) => ({
          position: [i < 5 ? 0 : viewport.width / 2 - Math.random() * viewport.width, 40 - Math.random() * 40, i < 5 ? 26 : 10 - Math.random() * 20],
          factor: 0.1 + Math.random(),
          direction: Math.random() < 0.5 ? -1 : 1,
          rotation: [Math.sin(Math.random()) * Math.PI, Math.sin(Math.random()) * Math.PI, Math.cos(Math.random()) * Math.PI]
        })),
      []
    )
  
    // Render-loop
    useFrame(() => {
      // Update instanced diamonds
      diamonds.forEach((data, i) => {
        const t = clock.getElapsedTime()
        data.position[1] -= (data.factor / 5) * data.direction
        if (data.direction === 1 ? data.position[1] < -50 : data.position[1] > 50)
          data.position = [i < 5 ? 0 : viewport.width / 2 - Math.random() * viewport.width, 50 * data.direction, data.position[2]]
        const { position, rotation, factor } = data
        dummy.position.set(position[0], position[1], position[2])
        dummy.rotation.set(rotation[0] + t * factor, rotation[1] + t * factor, rotation[2] + t * factor)
        dummy.scale.set(1 + factor, 1 + factor, 1 + factor)
        dummy.updateMatrix()
        model.current.setMatrixAt(i, dummy.matrix)
      })
      model.current.instanceMatrix.needsUpdate = true
      // Render env to fbo
      gl.autoClear = false
      camera.layers.set(1)
      gl.setRenderTarget(envFbo)
      gl.render(scene, camera)
      // Render cube backfaces to fbo
      camera.layers.set(0)
      model.current.material = backfaceMaterial
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
    }, 1)
  
    console.log(gltf)
  
    return (
      <instancedMesh ref={model} args={[gltf.nodes.Cube.geometry, null, diamonds.length]}>
        <meshBasicMaterial />
      </instancedMesh>
    )
}

function IconHolder() {
    return (
      <Canvas linear camera={{ fov: 50, position: [0, 0, 30] }}>
        <Suspense fallback={null}>
          <IconHolders />
        </Suspense>
      </Canvas>
    )
  }

export default IconHolder;
