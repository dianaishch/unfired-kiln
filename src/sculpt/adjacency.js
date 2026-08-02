// Builds a per-vertex neighbor list from a geometry's index buffer, used by
// the smoothing brush (Laplacian averaging) and gives us the mesh topology
// we need since these primitives aren't uniform grids.
export function buildAdjacency(geometry) {
  const index = geometry.getIndex()
  const vertexCount = geometry.getAttribute('position').count
  const neighborSets = new Array(vertexCount)
  for (let i = 0; i < vertexCount; i++) neighborSets[i] = new Set()

  if (index) {
    const arr = index.array
    for (let i = 0; i < arr.length; i += 3) {
      const a = arr[i]
      const b = arr[i + 1]
      const c = arr[i + 2]
      neighborSets[a].add(b).add(c)
      neighborSets[b].add(a).add(c)
      neighborSets[c].add(a).add(b)
    }
  }

  return neighborSets.map((set) => Int32Array.from(set))
}
