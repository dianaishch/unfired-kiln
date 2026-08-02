import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import SculptMesh from './SculptMesh.jsx'
import '../materials/FiredGlazeMaterial.js'

function StaticMesh({ geometry, color, roughness = 0.92 }) {
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FiredMesh({ geometry, glazeDef, cracked, seed }) {
  return (
    <mesh geometry={geometry}>
      <firedGlazeMaterial
        uBaseColor={glazeDef.fired.base}
        uRimColor={glazeDef.fired.rim}
        uSpeckleColor={glazeDef.fired.speckle}
        uCracked={cracked ? 1 : 0}
        uSeed={seed}
        uCrackScale={5.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// One persistent <Canvas> lives in App; this component swaps what's inside it
// per app stage so we never spin up more than a single WebGL context.
export default function Scene3D({
  stage,
  previewGeometry,
  previewColor,
  geometry,
  clayColor,
  brush,
  mode,
  onMetrics,
  glazeApplied,
  glazeUnfiredColor,
  firePhase,
  fireGlazeDef,
  fireOutcome,
  fireSeed,
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 2]} intensity={1.3} />
      <directionalLight position={[-2, -1, -2]} intensity={0.35} />

      {stage === 'pick' && (
        <group position={[0, 0.55, 0]}>
          <StaticMesh geometry={previewGeometry} color={previewColor} />
        </group>
      )}

      {stage === 'sculpt' && geometry && (
        <SculptMesh geometry={geometry} color={clayColor} brush={brush} mode={mode} onMetrics={onMetrics} />
      )}

      {stage === 'glaze' && geometry && (
        <StaticMesh
          geometry={geometry}
          color={glazeApplied ? glazeUnfiredColor : clayColor}
          roughness={glazeApplied ? 1 : 0.92}
        />
      )}

      {stage === 'fire' && geometry && (
        firePhase === 'result' ? (
          <FiredMesh geometry={geometry} glazeDef={fireGlazeDef} cracked={fireOutcome?.cracked} seed={fireSeed} />
        ) : (
          <StaticMesh geometry={geometry} color={fireGlazeDef.unfiredColor} roughness={1} />
        )
      )}

      <OrbitControls
        key={stage}
        target={stage === 'pick' ? [0, 0.55, 0] : [0, 0, 0]}
        enablePan={false}
        autoRotate={stage === 'pick'}
        autoRotateSpeed={2.2}
        mouseButtons={
          stage === 'sculpt'
            ? { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
            : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
        }
      />
    </>
  )
}
