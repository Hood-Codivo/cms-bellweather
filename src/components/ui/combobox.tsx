import React, { useState } from "react";

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  allowCustom = false,
  placeholder = "Select or enter value",
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [showOptions, setShowOptions] = useState(false);

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      opt.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <input
        className="w-full border rounded px-3 py-2 text-sm"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (allowCustom) onChange(e.target.value);
        }}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 100)}
        autoComplete="off"
      />
      {showOptions && filtered.length > 0 && (
        <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-48 overflow-auto">
          {filtered.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm ${
                opt.value === value ? "bg-blue-50" : ""
              }`}
              onMouseDown={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
