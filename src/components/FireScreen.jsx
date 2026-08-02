export default function FireScreen({ phase, outcome, onFire, onNewPiece }) {
  return (
    <div className="stage-screen">
      <div className="top-bar">
        <span className="stage-title">
          {phase === 'ready' && 'Ready for the Kiln'}
          {phase === 'firing' && 'Firing…'}
          {phase === 'result' && 'Fired'}
        </span>
      </div>

      {phase === 'ready' && (
        <>
          <div className="hint-text">Once fired, this piece is done. No going back to sculpting.</div>
          <div className="action-row">
            <button className="primary-btn" onClick={onFire}>
              Fire
            </button>
          </div>
        </>
      )}

      {phase === 'firing' && (
        <div className="fire-overlay">
          <span>Firing in the kiln…</span>
        </div>
      )}

      {phase === 'result' && outcome && (
        <>
          <div className={`result-banner ${outcome.cracked ? 'crack' : 'success'}`}>
            {outcome.cracked ? 'It cracked in the kiln.' : 'Beautifully fired.'}
          </div>
          <div className="action-row">
            <button className="ghost-btn" onClick={onNewPiece}>
              Start a New Piece
            </button>
          </div>
        </>
      )}
    </div>
  )
}
