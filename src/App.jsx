import { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { FORM_DEFS, getFormDef } from './forms/formDefs.js'
import { CLAY_COLORS } from './forms/clayColors.js'
import { GLAZE_DEFS, getGlazeDef } from './glaze/glazeDefs.js'
import { rollFireOutcome } from './fire/crackLogic.js'
import Scene3D from './components/Scene3D.jsx'
import FormPicker from './components/FormPicker.jsx'
import SculptScreen from './components/SculptScreen.jsx'
import GlazeScreen from './components/GlazeScreen.jsx'
import FireScreen from './components/FireScreen.jsx'

const INITIAL_METRICS = { minThickness: Infinity, totalDeformation: 0, vertexCount: 0 }

export default function App() {
  const [stage, setStage] = useState('pick') // pick | sculpt | glaze | fire

  // picker selections (live-previewed in the single 3D canvas)
  const [pickerFormId, setPickerFormId] = useState(FORM_DEFS[0].id)
  const [pickerColorHex, setPickerColorHex] = useState(CLAY_COLORS[0].hex)
  const previewGeometry = useMemo(() => getFormDef(pickerFormId).build(), [pickerFormId])

  // committed sculpt piece
  const [clayColor, setClayColor] = useState(null)
  const [geometry, setGeometry] = useState(null)
  const [metrics, setMetrics] = useState(INITIAL_METRICS)

  // sculpt tool state
  const [radius, setRadius] = useState(0.32)
  const [strength, setStrength] = useState(0.5)
  const [smoothToggle, setSmoothToggle] = useState(false)
  const [invertToggle, setInvertToggle] = useState(false)
  const [ctrlHeld, setCtrlHeld] = useState(false)
  const [shiftHeld, setShiftHeld] = useState(false)

  // glaze
  const [glazeId, setGlazeId] = useState(GLAZE_DEFS[0].id)
  const [glazeApplied, setGlazeApplied] = useState(false)

  // fire
  const [firePhase, setFirePhase] = useState('ready') // ready | firing | result
  const [fireOutcome, setFireOutcome] = useState(null)
  const [fireSeed, setFireSeed] = useState(0)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(true)
      if (e.key === 'Shift') setShiftHeld(true)
    }
    const onKeyUp = (e) => {
      if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(false)
      if (e.key === 'Shift') setShiftHeld(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const mode = { smooth: smoothToggle || shiftHeld, invert: invertToggle || ctrlHeld }

  const handleStart = useCallback(() => {
    const def = getFormDef(pickerFormId)
    setClayColor(pickerColorHex)
    setGeometry(def.build())
    setMetrics(INITIAL_METRICS)
    setGlazeId(GLAZE_DEFS[0].id)
    setGlazeApplied(false)
    setFirePhase('ready')
    setFireOutcome(null)
    setStage('sculpt')
  }, [pickerFormId, pickerColorHex])

  const handleMetrics = useCallback((m) => setMetrics(m), [])

  const handleFire = useCallback(() => {
    const outcome = rollFireOutcome(metrics.minThickness, metrics.totalDeformation, metrics.vertexCount)
    setFireOutcome(outcome)
    setFireSeed(Math.random() * 1000)
    setFirePhase('firing')
    setTimeout(() => setFirePhase('result'), 2400)
  }, [metrics])

  const handleNewPiece = useCallback(() => {
    setStage('pick')
    setGeometry(null)
    setClayColor(null)
    setMetrics(INITIAL_METRICS)
    setGlazeApplied(false)
    setFirePhase('ready')
    setFireOutcome(null)
  }, [])

  const fireGlazeDef = getGlazeDef(glazeId)

  return (
    <div className="app-root">
      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 0.4, 3], fov: 42 }}>
          <Scene3D
            stage={stage}
            previewGeometry={previewGeometry}
            previewColor={pickerColorHex}
            geometry={geometry}
            clayColor={clayColor}
            brush={{ radius, strength }}
            mode={mode}
            onMetrics={handleMetrics}
            glazeApplied={glazeApplied}
            glazeUnfiredColor={fireGlazeDef.unfiredColor}
            firePhase={firePhase}
            fireGlazeDef={fireGlazeDef}
            fireOutcome={fireOutcome}
            fireSeed={fireSeed}
          />
        </Canvas>
      </div>

      {stage === 'pick' && (
        <FormPicker
          formId={pickerFormId}
          colorHex={pickerColorHex}
          onSelectForm={setPickerFormId}
          onSelectColor={setPickerColorHex}
          onStart={handleStart}
        />
      )}

      {stage === 'sculpt' && geometry && (
        <SculptScreen
          radius={radius}
          setRadius={setRadius}
          strength={strength}
          setStrength={setStrength}
          smoothToggle={smoothToggle}
          setSmoothToggle={setSmoothToggle}
          invertToggle={invertToggle}
          setInvertToggle={setInvertToggle}
          onContinue={() => setStage('glaze')}
        />
      )}

      {stage === 'glaze' && geometry && (
        <GlazeScreen
          glazeId={glazeId}
          applied={glazeApplied}
          onSelectGlaze={setGlazeId}
          onApply={() => setGlazeApplied(true)}
          onContinue={() => setStage('fire')}
        />
      )}

      {stage === 'fire' && geometry && (
        <FireScreen phase={firePhase} outcome={fireOutcome} onFire={handleFire} onNewPiece={handleNewPiece} />
      )}
    </div>
  )
}
