import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import Map from '../map/Map';
import {
  DEFAULT_RADIUS_KM,
  DUMMY_CLIENTS,
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
  MarkerData,
  ORIGIN_COUNTRIES,
  OriginCountry,
  PROCESSING_TYPES,
  ProcessingType,
  RADIUS_STEP_KM,
  getClientLocationLabel,
  getClientName,
  getClientSlug,
  matchesClientQuery,
} from '../map/dummyClients';
import '../../search/SearchResults.css';
import {
  RoasterWithDistance,
  SearchTarget,
  geocodeQuery,
  resolveLocalSearchTarget,
  withDistance,
} from '../../search/searchUtils';
import './SearchBar.css';

const toggleValue = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter(item => item !== value) : [...values, value];

const SearchAndMap: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const place = searchParams.get('place');

  const [draftQuery, setDraftQuery] = useState(query);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [selectedOrigins, setSelectedOrigins] = useState<OriginCountry[]>([]);
  const [selectedProcessing, setSelectedProcessing] = useState<ProcessingType[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>(place || undefined);
  const [geocodedTarget, setGeocodedTarget] = useState<SearchTarget | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLAnchorElement>(null);

  const localTarget = useMemo(() => resolveLocalSearchTarget(query, place), [place, query]);
  const searchTarget = localTarget || geocodedTarget;

  const suggestions = useMemo(() => {
    if (!draftQuery.trim()) {
      return [];
    }

    return DUMMY_CLIENTS.filter(client => matchesClientQuery(client, draftQuery));
  }, [draftQuery]);

  useEffect(() => {
    setDraftQuery(query);
    setSelectedTitle(place || undefined);
    setGeocodedTarget(null);
  }, [place, query]);

  useEffect(() => {
    let cancelled = false;

    if (!query || localTarget) {
      setGeocodedTarget(null);
      return undefined;
    }

    geocodeQuery(query).then(target => {
      if (!cancelled) {
        setGeocodedTarget(target);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [localTarget, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedTitle) {
      return;
    }

    selectedCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedTitle]);

  const nearbyRoasters = useMemo<RoasterWithDistance[]>(() => {
    if (!searchTarget) {
      return [];
    }

    return withDistance(DUMMY_CLIENTS, searchTarget.center).filter(client => client.distanceKm <= radiusKm);
  }, [radiusKm, searchTarget]);

  const filteredRoasters = useMemo(
    () =>
      nearbyRoasters.filter(client => {
        const matchesOrigin =
          selectedOrigins.length === 0 || selectedOrigins.some(origin => client.origins.includes(origin));
        const matchesProcessing =
          selectedProcessing.length === 0 ||
          selectedProcessing.some(process => client.processingTypes.includes(process));
        const matchesOrganic = !organicOnly || client.organic;

        return matchesOrigin && matchesProcessing && matchesOrganic;
      }),
    [nearbyRoasters, organicOnly, selectedOrigins, selectedProcessing]
  );

  const runSearch = (nextQuery: string, nextPlace?: string) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      return;
    }

    const params = new URLSearchParams({ q: trimmed });
    if (nextPlace) {
      params.set('place', nextPlace);
    }

    setIsSuggestionsOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const selectSuggestion = (client: MarkerData) => {
    const name = getClientName(client);
    setDraftQuery(name);
    runSearch(name, name);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch(draftQuery);
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

  const clearFilters = () => {
    setRadiusKm(DEFAULT_RADIUS_KM);
    setSelectedOrigins([]);
    setSelectedProcessing([]);
    setOrganicOnly(false);
  };

  return (
    <div className="search-results">
      <div className="search-results-shell">
        <header className="search-results-header">
          <Link to="/" className="search-results-brand">
            <img src="/img/BeanBaseLogo.jpg" alt={t('common.logoAlt')} className="search-results-logo" />
            <span className="search-results-brand-copy">
              <strong>{t('common.brand')}</strong>
              <span>{t('search.brandTagline')}</span>
            </span>
          </Link>

          <div className="searchbar-wrap" ref={searchWrapRef}>
            <div className="searchbar-row">
              <input
                type="text"
                className="searchbar-input"
                placeholder={t('home.searchPlaceholder')}
                value={draftQuery}
                onChange={event => {
                  setDraftQuery(event.target.value);
                  setActiveSuggestion(-1);
                  setIsSuggestionsOpen(event.target.value.trim().length > 0);
                }}
                onFocus={() => draftQuery.trim() && setIsSuggestionsOpen(true)}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={isSuggestionsOpen}
                aria-controls="results-suggestions"
                aria-autocomplete="list"
              />
              <button type="button" className="searchbar-submit" onClick={() => runSearch(draftQuery)}>
                {t('home.search')}
              </button>
            </div>
            {isSuggestionsOpen && suggestions.length > 0 && (
              <ul id="results-suggestions" className="searchbar-suggestions" role="listbox">
                {suggestions.map((client, index) => {
                  const name = getClientName(client);
                  const location = getClientLocationLabel(client);
                  return (
                    <li key={`${name}-${index}`}>
                      <button
                        type="button"
                        className={`searchbar-suggestion${index === activeSuggestion ? ' is-active' : ''}`}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => selectSuggestion(client)}
                        role="option"
                        aria-selected={index === activeSuggestion}
                      >
                        <span className="searchbar-suggestion-name">{name}</span>
                        {location && <span className="searchbar-suggestion-location">{location}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </header>

        <div className="search-results-layout">
          <aside className="search-results-map">
            <Map
              markers={filteredRoasters}
              selectedTitle={selectedTitle}
              center={searchTarget?.center}
              height="min(78vh, 760px)"
              className="results-map"
              onMarkerSelect={setSelectedTitle}
            />
          </aside>

          <aside className={`search-results-panel${filtersOpen ? ' is-open' : ''}`}>
            <div className="search-results-panel-header">
              <div>
                <h2>{t('search.filters')}</h2>
                <p>
                  {t('search.filtersAround', {
                    place: searchTarget?.label || query || t('search.yourSearch'),
                  })}
                </p>
              </div>
              <button
                type="button"
                className="filters-toggle"
                aria-expanded={filtersOpen}
                aria-controls="search-filters"
                onClick={() => setFiltersOpen(open => !open)}
              >
                {filtersOpen ? t('search.hideFilters') : t('search.showFilters')}
              </button>
            </div>

            <div id="search-filters" className="search-filters">
              <div className="filter-group">
                <div className="radius-header">
                  <h3>{t('search.radius')}</h3>
                  <span className="radius-value">{t('common.km', { value: radiusKm.toFixed(1) })}</span>
                </div>
                <input
                  className="radius-slider"
                  type="range"
                  min={MIN_RADIUS_KM}
                  max={MAX_RADIUS_KM}
                  step={RADIUS_STEP_KM}
                  value={radiusKm}
                  onChange={event => setRadiusKm(Number(event.target.value))}
                  aria-label={t('search.radiusAria')}
                />
                <div className="radius-scale">
                  <span>{t('common.km', { value: MIN_RADIUS_KM })}</span>
                  <span>{t('common.km', { value: MAX_RADIUS_KM })}</span>
                </div>
              </div>

              <div className="filter-group">
                <h3>{t('search.origin')}</h3>
                <div className="filter-options">
                  {ORIGIN_COUNTRIES.map(origin => (
                    <label key={origin} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedOrigins.includes(origin)}
                        onChange={() => setSelectedOrigins(current => toggleValue(current, origin))}
                      />
                      {t(`origin.${origin}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>{t('search.processing')}</h3>
                <div className="filter-options">
                  {PROCESSING_TYPES.map(process => (
                    <label key={process} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedProcessing.includes(process)}
                        onChange={() => setSelectedProcessing(current => toggleValue(current, process))}
                      />
                      {t(`processing.${process}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>{t('search.organic')}</h3>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={event => setOrganicOnly(event.target.checked)}
                  />
                  {t('search.organicAvailable')}
                </label>
              </div>

              <button type="button" className="clear-filters" onClick={clearFilters}>
                {t('search.resetFilters')}
              </button>
            </div>
          </aside>

          <section className="search-results-list">
            <div className="search-results-list-header">
              <h2>{t('search.nearby', { count: filteredRoasters.length })}</h2>
              <p>
                {query
                  ? t('search.showing', {
                      radius: radiusKm,
                      place: searchTarget?.label || query,
                    })
                  : t('search.prompt')}
              </p>
            </div>

            {filteredRoasters.length > 0 ? (
              <div className="search-results-cards">
                {filteredRoasters.map(client => {
                  const name = getClientName(client);
                  return (
                    <Link
                      key={name}
                      to={`/roaster/${getClientSlug(client)}`}
                      state={{ fromSearch: searchParams.toString() ? `?${searchParams.toString()}` : '' }}
                      ref={selectedTitle === name ? selectedCardRef : undefined}
                      className={`roaster-card${selectedTitle === name ? ' is-selected' : ''}`}
                      aria-current={selectedTitle === name ? 'true' : undefined}
                    >
                      <div className="roaster-card-top">
                        <div>
                          <h3>{name}</h3>
                          <p>{getClientLocationLabel(client)}</p>
                        </div>
                        <p className="roaster-card-distance">
                          {t('common.km', { value: client.distanceKm.toFixed(1) })}
                        </p>
                      </div>
                      <div className="roaster-card-tags">
                        {client.organic && <span className="roaster-tag is-organic">{t('common.organic')}</span>}
                        {client.origins.map(origin => (
                          <span key={origin} className="roaster-tag">
                            {t(`origin.${origin}`)}
                          </span>
                        ))}
                        {client.processingTypes.map(process => (
                          <span key={process} className="roaster-tag">
                            {t(`processing.${process}`)}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="search-results-empty">
                {query ? t('search.emptyFiltered') : t('search.emptyPrompt')}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchAndMap;
