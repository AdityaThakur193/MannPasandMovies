import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FancySelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  ariaLabel,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  const handleOpenToggle = () => {
    if (disabled) return;
    const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (opt) => {
    if (disabled) return;
    onChange(opt.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (['Enter', ' ', 'Spacebar'].includes(event.key)) {
      event.preventDefault();
      if (!isOpen) {
        handleOpenToggle();
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex]);
      }
    }

    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= options.length ? 0 : next;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? options.length - 1 : next;
      });
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`fancy-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`.trim()}
      ref={containerRef}
    >
      <button
        type="button"
        className="fancy-select__button"
        onClick={handleOpenToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <span className="fancy-select__value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className={`fancy-select__chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          className="fancy-select__list"
          role="listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `fancy-opt-${highlightedIndex}` : undefined}
        >
          {options.map((opt, index) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={opt.value ?? opt.label}
                id={`fancy-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`fancy-select__option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`.trim()}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(opt)}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FancySelect;
