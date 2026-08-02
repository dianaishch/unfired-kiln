import * as THREE from 'three'

// Builds a Vector2 profile for THREE.LatheGeometry, with extra points
// clustered near the rim (top) for higher ring density there.
function vesselProfile(points) {
  return points.map(([r, y]) => new THREE.Vector2(r, y))
}

function lumpGeometry() {
  const geo = new THREE.SphereGeometry(0.75, 48, 36)
  geo.computeVertexNormals()
  return geo
}

function cylinderGeometry() {
  const geo = new THREE.CylinderGeometry(0.6, 0.6, 1.3, 32, 20, false)
  geo.computeVertexNormals()
  return geo
}

function boxGeometry() {
  const geo = new THREE.BoxGeometry(1.1, 1.1, 1.1, 12, 12, 12)
  geo.computeVertexNormals()
  return geo
}

function cupGeometry() {
  const profile = vesselProfile([
    [0.0, 0.0],
    [0.42, 0.02],
    [0.55, 0.08],
    [0.6, 0.2],
    [0.6, 0.36],
    [0.58, 0.48],
    // rim cluster - extra density
    [0.57, 0.55],
    [0.575, 0.6],
    [0.58, 0.64],
    [0.585, 0.67],
    [0.59, 0.69],
  ])
  const geo = new THREE.LatheGeometry(profile, 48)
  geo.translate(0, -0.35, 0)
  geo.computeVertexNormals()
  return geo
}

function mugGeometry() {
  const profile = vesselProfile([
    [0.0, 0.0],
    [0.5, 0.02],
    [0.55, 0.1],
    [0.56, 0.3],
    [0.56, 0.55],
    [0.55, 0.75],
    // rim cluster
    [0.545, 0.85],
    [0.545, 0.92],
    [0.55, 0.97],
    [0.555, 1.0],
    [0.56, 1.02],
  ])
  const geo = new THREE.LatheGeometry(profile, 48)
  geo.translate(0, -0.51, 0)
  geo.computeVertexNormals()
  return geo
}

function vaseGeometry() {
  const profile = vesselProfile([
    [0.0, 0.0],
    [0.3, 0.02],
    [0.5, 0.12],
    [0.58, 0.3],
    [0.5, 0.5],
    [0.32, 0.68],
    [0.24, 0.82],
    // neck + rim cluster
    [0.24, 0.92],
    [0.27, 1.0],
    [0.3, 1.06],
    [0.32, 1.1],
    [0.33, 1.13],
  ])
  const geo = new THREE.LatheGeometry(profile, 48)
  geo.translate(0, -0.56, 0)
  geo.computeVertexNormals()
  return geo
}

export const FORM_DEFS = [
  { id: 'lump', label: 'Lump', build: lumpGeometry },
  { id: 'cylinder', label: 'Cylinder', build: cylinderGeometry },
  { id: 'cup', label: 'Cup', build: cupGeometry },
  { id: 'mug', label: 'Mug', build: mugGeometry },
  { id: 'vase', label: 'Vase', build: vaseGeometry },
  { id: 'box', label: 'Brick', build: boxGeometry },
]

export function getFormDef(id) {
  return FORM_DEFS.find((f) => f.id === id) || FORM_DEFS[0]
}
