import { FORM_DEFS } from '../forms/formDefs.js'
import { CLAY_COLORS } from '../forms/clayColors.js'

export default function FormPicker({ formId, colorHex, onSelectForm, onSelectColor, onStart }) {
  return (
    <div className="picker-screen">
      <div className="brand">
        <h1>UNFIRED</h1>
        <p>a little clay-sculpting toy</p>
      </div>

      <div className="picker-bottom">
        <div className="picker-section">
          <h2>Choose a form</h2>
          <div className="form-grid">
            {FORM_DEFS.map((f) => (
              <button
                key={f.id}
                className={`form-card ${f.id === formId ? 'selected' : ''}`}
                onClick={() => onSelectForm(f.id)}
              >
                <span className="label">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="picker-section">
          <h2>Choose your clay</h2>
          <div className="color-row">
            {CLAY_COLORS.map((c) => (
              <button
                key={c.id}
                title={c.label}
                className={`color-swatch ${c.hex === colorHex ? 'selected' : ''}`}
                style={{ background: c.hex }}
                onClick={() => onSelectColor(c.hex)}
              />
            ))}
          </div>
        </div>

        <button className="primary-btn" onClick={onStart}>
          Start Sculpting
        </button>
      </div>
    </div>
  )
}
