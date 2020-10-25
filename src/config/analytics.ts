import ReactGA from 'react-ga';
import { GOOGLE_ANALYTICS_TRACKING_ID } from './constants';

// Tutorial: https://medium.com/@malith.dev/track-users-in-your-react-app-with-google-analytics-6364ebfcbae8

export const initGA = () => {
    ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID, {
        gaOptions: {
            siteSpeedSampleRate: 100,
        },
    });
};

export const PageView = () => {
    ReactGA.pageview(window.location.pathname + window.location.search);
};

/**
 * Event - Add custom tracking event.
 * @param {string} category
 * @param {string} action
 * @param {string} label
 */
export const Event = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
    });
};
