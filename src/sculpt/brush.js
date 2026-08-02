// Smooth (not hard-cutoff) radial falloff: 1 at the hit point, 0 at the
// brush radius edge, cosine-eased in between.
export function falloff(distance, radius) {
  if (distance >= radius) return 0
  const t = distance / radius
  return 0.5 * (1 + Math.cos(Math.PI * t))
}

// Displaces vertices within `radius` of `point` along their vertex normal.
// sign = +1 pulls outward (add clay), -1 pushes inward (remove clay).
export function applyPushPull(positions, normals, vertexCount, point, radius, strength, sign, dtScale) {
  const r2 = radius * radius
  let changed = false
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const dx = positions[ix] - point.x
    const dy = positions[ix + 1] - point.y
    const dz = positions[ix + 2] - point.z
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq >= r2) continue
    const f = falloff(Math.sqrt(distSq), radius)
    const amount = strength * f * sign * dtScale
    positions[ix] += normals[ix] * amount
    positions[ix + 1] += normals[ix + 1] * amount
    positions[ix + 2] += normals[ix + 2] * amount
    changed = true
  }
  return changed
}

// Laplacian smoothing: pulls each vertex within the brush toward the
// average position of its topological neighbors.
export function applySmooth(positions, neighborLists, vertexCount, point, radius, strength, dtScale) {
  const r2 = radius * radius
  const original = positions.slice()
  let changed = false
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const dx = original[ix] - point.x
    const dy = original[ix + 1] - point.y
    const dz = original[ix + 2] - point.z
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq >= r2) continue
    const neighbors = neighborLists[i]
    if (neighbors.length === 0) continue
    const f = falloff(Math.sqrt(distSq), radius)
    let ax = 0, ay = 0, az = 0
    for (let n = 0; n < neighbors.length; n++) {
      const nix = neighbors[n] * 3
      ax += original[nix]
      ay += original[nix + 1]
      az += original[nix + 2]
    }
    const count = neighbors.length
    ax /= count
    ay /= count
    az /= count
    const amt = strength * f * dtScale
    positions[ix] += (ax - original[ix]) * amt
    positions[ix + 1] += (ay - original[ix + 1]) * amt
    positions[ix + 2] += (az - original[ix + 2]) * amt
    changed = true
  }
  return changed
}
