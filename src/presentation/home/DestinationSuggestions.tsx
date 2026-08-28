import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Destination, getPopularDestinations } from './destinations';
import './DestinationSuggestions.css';

const DestinationSuggestions: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const destinations = getPopularDestinations();

  const openDestination = (destination: Destination) => {
    const params = new URLSearchParams({ q: destination.city });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="destination-suggestions" aria-labelledby="destination-suggestions-heading">
      <div className="destination-suggestions-copy">
        <h2 id="destination-suggestions-heading">{t('home.inspirationTitle')}</h2>
        <p>{t('home.inspirationSubtitle')}</p>
      </div>

      <div className="destination-grid">
        {destinations.map(destination => {
          const cityLabel = t(`cities.${destination.city}`);
          const countryLabel = t(`countries.${destination.country}`);

          return (
            <button
              key={destination.city}
              type="button"
              className="destination-card"
              onClick={() => openDestination(destination)}
              aria-label={t('home.exploreDestination', { city: cityLabel })}
            >
              <span className="destination-card-art" style={{ backgroundColor: destination.accent }}>
                {destination.image && (
                  <img
                    src={destination.image}
                    alt=""
                    className="destination-card-photo"
                    aria-hidden="true"
                    loading="lazy"
                  />
                )}
                <span className="destination-card-badge">{t('home.popular')}</span>
              </span>
              <span className="destination-card-body">
                <strong>{cityLabel}</strong>
                <span className="destination-card-meta">{countryLabel}</span>
                <span className="destination-card-count">
                  {t('home.roastersCount', { count: destination.roasterCount })}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default DestinationSuggestions;
