import React from 'react';
import { APP_VERSION_LABEL } from '../../appVersion';
import './VersionBadge.css';

const VersionBadge: React.FC = () => (
  <p className="app-version-badge" aria-label={APP_VERSION_LABEL}>
    {APP_VERSION_LABEL}
  </p>
);

export default VersionBadge;
