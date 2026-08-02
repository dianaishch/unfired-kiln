import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildAdjacency } from '../sculpt/adjacency.js'
import { applyPushPull, applySmooth } from '../sculpt/brush.js'
import { sampleMinThickness, computeTotalDeformation } from '../sculpt/metrics.js'

const PUSH_STRENGTH_SCALE = 0.9
const SMOOTH_STRENGTH_SCALE = 1.0
const METRIC_SAMPLE_INTERVAL_MS = 400
const METRIC_SAMPLE_COUNT = 24

export default function SculptMesh({ geometry, color, brush, mode, onMetrics }) {
  const meshRef = useRef()
  const dragPoint = useRef(new THREE.Vector3())
  const lastApplyTime = useRef(0)

  const vertexCount = geometry.attributes.position.count
  const basePositions = useMemo(
    () => geometry.attributes.position.array.slice(),
    [geometry],
  )
  const neighborLists = useMemo(() => buildAdjacency(geometry), [geometry])
  const minThicknessRef = useRef(Infinity)

  useEffect(() => {
    const id = setInterval(() => {
      if (!meshRef.current) return
      const positions = geometry.attributes.position.array
      const normals = geometry.attributes.normal.array
      minThicknessRef.current = sampleMinThickness(
        meshRef.current,
        positions,
        normals,
        vertexCount,
        METRIC_SAMPLE_COUNT,
        minThicknessRef.current,
      )
      const totalDeformation = computeTotalDeformation(positions, basePositions, vertexCount)
      onMetrics({
        minThickness: minThicknessRef.current,
        totalDeformation,
        vertexCount,
      })
    }, METRIC_SAMPLE_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry])

  const applyBrushAt = (point) => {
    const now = performance.now()
    const dt = lastApplyTime.current ? Math.min((now - lastApplyTime.current) / 1000, 0.05) : 1 / 60
    lastApplyTime.current = now
    const dtScale = dt * 60

    const positions = geometry.attributes.position.array
    const normals = geometry.attributes.normal.array

    let changed
    if (mode.smooth) {
      changed = applySmooth(
        positions,
        neighborLists,
        vertexCount,
        point,
        brush.radius,
        brush.strength * SMOOTH_STRENGTH_SCALE * 0.15,
        dtScale,
      )
    } else {
      const sign = mode.invert ? -1 : 1
      changed = applyPushPull(
        positions,
        normals,
        vertexCount,
        point,
        brush.radius,
        brush.strength * PUSH_STRENGTH_SCALE * 0.35,
        sign,
        dtScale,
      )
    }

    if (changed) {
      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
    }
  }

  const handlePointerDown = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.target.setPointerCapture?.(e.pointerId)
    lastApplyTime.current = 0
    dragPoint.current.copy(e.point)
    applyBrushAt(dragPoint.current)
  }

  const handlePointerMove = (e) => {
    if ((e.buttons & 1) === 0) return
    e.stopPropagation()
    dragPoint.current.copy(e.point)
    applyBrushAt(dragPoint.current)
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <meshStandardMaterial color={color} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}
