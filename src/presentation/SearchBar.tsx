import React, { useState, ChangeEvent } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Let's get some good coffee...", onChange }) => {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
