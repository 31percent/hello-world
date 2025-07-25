import React, { useState } from 'react';
import { PlayerAction } from '../types';
import './BettingControls.css';

interface BettingControlsProps {
  currentBet: number;
  playerChips: number;
  playerCurrentBet: number;
  onAction: (action: PlayerAction, amount?: number) => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({
  currentBet,
  playerChips,
  playerCurrentBet,
  onAction
}) => {
  const [raiseAmount, setRaiseAmount] = useState(currentBet + 10);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const callAmount = currentBet - playerCurrentBet;
  const canCheck = currentBet === playerCurrentBet;
  const canCall = callAmount > 0 && callAmount <= playerChips;
  const canRaise = playerChips > callAmount;
  const maxRaise = playerChips + playerCurrentBet;

  const handleFold = () => {
    onAction('fold');
  };

  const handleCheck = () => {
    onAction('check');
  };

  const handleCall = () => {
    onAction('call');
  };

  const handleRaise = () => {
    if (showRaiseSlider) {
      onAction('raise', raiseAmount);
      setShowRaiseSlider(false);
    } else {
      setShowRaiseSlider(true);
    }
  };

  const handleAllIn = () => {
    onAction('raise', maxRaise);
    setShowRaiseSlider(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(parseInt(e.target.value));
  };

  return (
    <div className="betting-controls">
      <div className="betting-info">
        <div className="info-item">
          <span className="label">Chipuri tale:</span>
          <span className="value">${playerChips}</span>
        </div>
        <div className="info-item">
          <span className="label">Pentru egalare:</span>
          <span className="value">${callAmount}</span>
        </div>
        <div className="info-item">
          <span className="label">Pariul tău:</span>
          <span className="value">${playerCurrentBet}</span>
        </div>
      </div>

      {showRaiseSlider && (
        <div className="raise-slider-container">
          <label htmlFor="raise-slider">Suma pentru raise: ${raiseAmount}</label>
          <input
            id="raise-slider"
            type="range"
            min={currentBet + 1}
            max={maxRaise}
            value={raiseAmount}
            onChange={handleSliderChange}
            className="raise-slider"
          />
          <div className="slider-labels">
            <span>Min: ${currentBet + 1}</span>
            <span>Max: ${maxRaise}</span>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="action-btn fold-btn" 
          onClick={handleFold}
        >
          🚫 Fold
        </button>

        {canCheck ? (
          <button 
            className="action-btn check-btn" 
            onClick={handleCheck}
          >
            ✅ Check
          </button>
        ) : canCall ? (
          <button 
            className="action-btn call-btn" 
            onClick={handleCall}
          >
            🤝 Call ${callAmount}
          </button>
        ) : null}

        {canRaise && (
          <button 
            className={`action-btn raise-btn ${showRaiseSlider ? 'confirm-raise' : ''}`}
            onClick={handleRaise}
          >
            {showRaiseSlider ? `✅ Raise $${raiseAmount}` : '📈 Raise'}
          </button>
        )}

        {canRaise && (
          <button 
            className="action-btn all-in-btn" 
            onClick={handleAllIn}
          >
            🚀 All In ${maxRaise}
          </button>
        )}
      </div>

      {showRaiseSlider && (
        <div className="slider-actions">
          <button 
            className="cancel-btn"
            onClick={() => setShowRaiseSlider(false)}
          >
            Anulează
          </button>
        </div>
      )}
    </div>
  );
};

export default BettingControls;