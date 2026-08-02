// Turns the two lightweight signals tracked during sculpting into a crack
// probability. Thin walls and heavy, extreme reshaping raise the odds, but a
// high baseline success rate keeps cracking the exception rather than the
// norm for a normally-sculpted piece.

const SAFE_THICKNESS = 0.3 // at/above this, thickness contributes ~0 risk
const CRITICAL_THICKNESS = 0.06 // at/below this, thickness risk maxes out

const SAFE_AVG_DISPLACEMENT = 0.02 // gentle sculpting, ~0 risk
const HIGH_AVG_DISPLACEMENT = 0.25 // dramatic, extreme reshaping, max risk

const BASELINE_CRACK_CHANCE = 0.12 // ~88% success for a normal piece
const MAX_CRACK_CHANCE = 0.85 // never a sure thing either way

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

export function computeCrackProbability(minThickness, totalDeformation, vertexCount) {
  const thickness = Number.isFinite(minThickness) ? minThickness : SAFE_THICKNESS
  const thicknessRisk = clamp01(
    (SAFE_THICKNESS - thickness) / (SAFE_THICKNESS - CRITICAL_THICKNESS),
  )

  const avgDisplacement = vertexCount > 0 ? totalDeformation / vertexCount : 0
  const deformRisk = clamp01(
    (avgDisplacement - SAFE_AVG_DISPLACEMENT) / (HIGH_AVG_DISPLACEMENT - SAFE_AVG_DISPLACEMENT),
  )

  const combinedRisk = 0.6 * thicknessRisk + 0.4 * deformRisk
  return clamp01(BASELINE_CRACK_CHANCE + combinedRisk * (MAX_CRACK_CHANCE - BASELINE_CRACK_CHANCE))
}

export function rollFireOutcome(minThickness, totalDeformation, vertexCount) {
  const probability = computeCrackProbability(minThickness, totalDeformation, vertexCount)
  const cracked = Math.random() < probability
  return { cracked, probability }
}
