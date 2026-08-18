import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DUMMY_CLIENTS,
  MarkerData,
  getClientLocationLabel,
  getClientName,
  matchesClientQuery,
} from '../map/dummyClients';
import './SearchBar.css';

const HomeSearch: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return DUMMY_CLIENTS.filter(client => matchesClientQuery(client, query));
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openResults = (query: string, place?: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const params = new URLSearchParams({ q: trimmed });
    if (place) {
      params.set('place', place);
    }

    setIsSuggestionsOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const selectClient = (client: MarkerData) => {
    const name = getClientName(client);
    setSearch(name);
    openResults(name, name);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setActiveSuggestion(-1);
    setIsSuggestionsOpen(value.trim().length > 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      openResults(search);
      return;
    }

    if (!isSuggestionsOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsSuggestionsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion(index => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  return (
    <div className="searchbar-container">
      <div className="searchbar-panel">
      <img src="/img/BeanBaseLogo.jpg" alt="BeanBase logo" className="logo-image" style={{ display: 'block' }} />
      <p className="brand-subtitle">Find your next favorite cup</p>

      <div className="searchbar-wrap" ref={searchWrapRef}>
        <div className="searchbar-row">
        <input
          type="text"
          className="searchbar-input"
          placeholder="Search by location or roaster..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onFocus={() => search.trim() && setIsSuggestionsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isSuggestionsOpen}
          aria-controls="client-suggestions"
          aria-autocomplete="list"
        />
        <button type="button" className="searchbar-submit" onClick={() => openResults(search)}>
          Search
        </button>
        </div>
        {isSuggestionsOpen && suggestions.length > 0 && (
          <ul id="client-suggestions" className="searchbar-suggestions" role="listbox">
            {suggestions.map((client, index) => {
              const name = getClientName(client);
              const location = getClientLocationLabel(client);
              return (
                <li key={`${name}-${index}`}>
                  <button
                    type="button"
                    className={`searchbar-suggestion${index === activeSuggestion ? ' is-active' : ''}`}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => selectClient(client)}
                    role="option"
                    aria-selected={index === activeSuggestion}
                  >
                    <span className="searchbar-suggestion-name">{name}</span>
                    {location && (
                      <span className="searchbar-suggestion-location">{location}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
};

export default HomeSearch;
