import React from 'react';
import './CompareCheckbox.scss';

interface CompareCheckboxProps {
  offerId: string;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

const CompareCheckbox: React.FC<CompareCheckboxProps> = ({
  offerId,
  isSelected,
  isDisabled,
  onToggle,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(offerId, e.target.checked);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="compare-checkbox" onClick={handleClick}>
      <input
        type="checkbox"
        id={`compare-${offerId}`}
        checked={isSelected}
        disabled={isDisabled && !isSelected}
        onChange={handleChange}
      />
      <label htmlFor={`compare-${offerId}`}>
        {isSelected ? 'Dodano do porównania' : 'Dodaj do porównania'}
      </label>
    </div>
  );
};

export default CompareCheckbox;
