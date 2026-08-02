export default function SculptScreen({
  radius,
  setRadius,
  strength,
  setStrength,
  smoothToggle,
  setSmoothToggle,
  invertToggle,
  setInvertToggle,
  onContinue,
}) {
  return (
    <div className="stage-screen">
      <div className="top-bar">
        <span className="stage-title">Raw · Sculpting</span>
      </div>

      <div className="hint-text">
        Left-drag: sculpt &middot; Right-drag: rotate &middot; Scroll: zoom &middot; Ctrl+drag: push in &middot; Shift+drag: smooth
      </div>

      <div className="tool-panel">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${!smoothToggle ? 'active' : ''}`}
            onClick={() => setSmoothToggle(false)}
          >
            Push / Pull
          </button>
          <button
            className={`mode-btn ${smoothToggle ? 'active' : ''}`}
            onClick={() => setSmoothToggle(true)}
          >
            Smooth
          </button>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="invert"
            checked={invertToggle}
            onChange={(e) => setInvertToggle(e.target.checked)}
          />
          <label htmlFor="invert">Push inward (or hold Ctrl)</label>
        </div>

        <div className="slider-row">
          <label>Brush radius</label>
          <input
            type="range"
            min="0.08"
            max="0.7"
            step="0.01"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-row">
          <label>Strength</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={onContinue}>
          Continue to Glaze →
        </button>
      </div>
    </div>
  )
}
