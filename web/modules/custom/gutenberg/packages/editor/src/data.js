/* global drupalSettings */
import { store as preferencesStore } from '@wordpress/preferences';
import { __unstableCreatePersistenceLayer } from '@wordpress/preferences-persistence';
import { dispatch } from '@wordpress/data';

const userId = drupalSettings.user ? drupalSettings.user.uid || 1 : 1;
const storageKey = `WP_PREFERENCES_USER_${userId}`;

const getUserPreferences = () => {
  const persisted = localStorage.getItem(storageKey);
  if (persisted !== null) {
    try {
      return JSON.parse(persisted);
    } catch {
      // Ignore invalid stored preferences.
    }
  }
  return {};
};

const serverData = getUserPreferences();
const persistenceLayer = __unstableCreatePersistenceLayer(serverData, userId);
dispatch(preferencesStore).setPersistenceLayer(persistenceLayer);
