// Shameless rip of https://github.com/drcmda Pen. The only thing that is mine in the gflt and image used for texture.
import React, { useMemo, useRef, Suspense } from "react";
import { WebGLRenderTarget, Object3D, LinearFilter} from "three"
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
    const iconHolders = useMemo(
      () =>
        new Array(80).fill().map((_, i) => ({
          position: [viewport.width / 2 - Math.random() * viewport.width, 40 - Math.random() * 40, i < 5 ? 26 : 10 - Math.random() * 20],
          factor: 0.1 + Math.random(),
          direction: 1,
          rotation: [0, 0, 0]
        })),
      []
    )
  
    // Render-loop
    useFrame(() => {
      // Update instanced iconHolders
      iconHolders.forEach((data, i) => {
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
  
    return (
      <instancedMesh ref={model} args={[gltf.nodes.Cube.geometry, null, iconHolders.length]}>
        <meshBasicMaterial color={"transparent"} />
      </instancedMesh>
    )
}

function IconHolderAnimation() {
    return (
      <Canvas linear camera={{ fov: 50, position: [0, 0, 30] }}>
        <Suspense fallback={null}>
        <Background></Background>
          <IconHolders />
        </Suspense>
      </Canvas>
    )
  }

export default IconHolderAnimation;
