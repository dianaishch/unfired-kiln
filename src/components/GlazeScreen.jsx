import { GLAZE_DEFS } from '../glaze/glazeDefs.js'

export default function GlazeScreen({ glazeId, applied, onSelectGlaze, onApply, onContinue }) {
  return (
    <div className="stage-screen">
      <div className="top-bar">
        <span className="stage-title">{applied ? 'Glazed · Unfired' : 'Choose a Glaze'}</span>
      </div>

      {!applied && (
        <div className="hint-text">Pick a glaze, then apply it. Unfired glaze looks nothing like the fired result.</div>
      )}

      <div className="glaze-panel">
        <div className="glaze-row">
          {GLAZE_DEFS.map((g) => (
            <button
              key={g.id}
              className={`glaze-swatch ${g.id === glazeId ? 'selected' : ''}`}
              disabled={applied}
              onClick={() => onSelectGlaze(g.id)}
            >
              <span className="dot" style={{ background: g.unfiredColor }} />
              <span className="name">{g.label}</span>
            </button>
          ))}
        </div>

        {!applied ? (
          <button className="primary-btn" onClick={onApply}>
            Apply Glaze
          </button>
        ) : (
          <button className="primary-btn" onClick={onContinue}>
            Fire →
          </button>
        )}
      </div>
    </div>
  )
}
