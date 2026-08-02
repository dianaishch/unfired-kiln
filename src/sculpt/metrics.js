import * as THREE from 'three'

const _raycaster = new THREE.Raycaster()
const _origin = new THREE.Vector3()
const _dir = new THREE.Vector3()

// Approximate min wall thickness: from a sample of vertices, nudge slightly
// inward along the (inverted) normal and raycast into the mesh to find the
// opposing surface. Not exact CAD-grade analysis, just a lightweight signal
// that responds to pinching/thinning while sculpting.
export function sampleMinThickness(mesh, positions, normals, vertexCount, sampleCount, prevMin = Infinity) {
  let min = prevMin
  const epsilon = 0.01
  for (let s = 0; s < sampleCount; s++) {
    const i = Math.floor(Math.random() * vertexCount)
    const ix = i * 3
    const nx = normals[ix], ny = normals[ix + 1], nz = normals[ix + 2]
    _origin.set(
      positions[ix] - nx * epsilon,
      positions[ix + 1] - ny * epsilon,
      positions[ix + 2] - nz * epsilon,
    )
    _dir.set(-nx, -ny, -nz).normalize()
    _raycaster.set(_origin, _dir)
    _raycaster.near = 0
    _raycaster.far = 4
    const hits = _raycaster.intersectObject(mesh, false)
    if (hits.length > 0) {
      const thickness = hits[0].distance + epsilon
      if (thickness < min) min = thickness
    }
  }
  return min
}

// Current total deformation: sum of each vertex's distance from its
// original (pre-sculpt) position. Naturally decreases if the user smooths
// a distorted area back down.
export function computeTotalDeformation(positions, basePositions, vertexCount) {
  let total = 0
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const dx = positions[ix] - basePositions[ix]
    const dy = positions[ix + 1] - basePositions[ix + 1]
    const dz = positions[ix + 2] - basePositions[ix + 2]
    total += Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return total
}
