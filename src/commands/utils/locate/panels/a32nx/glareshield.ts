import { DOCS_BASE_URLS, IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

const GLARESHIELD_DOCS_BASE_URL = DOCS_BASE_URLS.a32nx.glareshield;
const GLARESHIELD_IMAGE_BASE_URL = IMAGE_BASE_URLS.a32nx.glareshield;

export const warningPanel: Panel = {
    name: 'Warning Panel',
    title: 'FlyByWire A32NX | Warning Panel',
    docsUrl: `${GLARESHIELD_DOCS_BASE_URL}/warning/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: `${GLARESHIELD_IMAGE_BASE_URL}/warning.png`,
    identifiers: [
        'warning-panel',
        'atc-msg',
        'autoland-warning-light',
        'master-caution',
        'master-warning',
        'chrono-button',
        'sidestick-priority-indicator',
    ],
};

export const efisPanel: Panel = {
    name: 'EFIS',
    title: 'FlyByWire A32NX | EFIS Panel',
    docsUrl: `${GLARESHIELD_DOCS_BASE_URL}/efis_control/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: `${GLARESHIELD_IMAGE_BASE_URL}/efis.png`,
    identifiers: [
        'efis-panel',
        'qnh',
        'fd',
        'flight-director-switch',
        'ls',
        'ls-switch',
        'cstr',
        'constraint-switch',
        'wpt',
        'waypoint-switch',
        'vor-d',
        'vor-dme-switch',
        'ndb',
        'ndb-switch',
        'arpt',
        'airport-switch',
        'rose-mode',
        'arc-mode',
        'plan-mode',
        'nd-range',
        'adf-switch',
        'vor-switch',
    ],
};

export const fcuPanel: Panel = {
    name: 'FCU',
    title: 'FlyByWire A32NX | Flight Control Unit (FCU)',
    docsUrl: `${GLARESHIELD_DOCS_BASE_URL}/fcu/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: `${GLARESHIELD_IMAGE_BASE_URL}/fcu.png`,
    identifiers: [
        'fcu',
        'flight-control-unit',
        'spd-mach-button',
        'spd-mach-knob',
        'hdg-trk-knob',
        'loc-switch',
        'hdg-vs',
        'trk-fpa',
        'hdg-vs-trk-fpa-button',
        'ap-1-switch',
        'ap-2-switch',
        'alt-knob',
        'exped-switch',
        'metric-alt-button',
        'vs-knob',
        'vertical-speed-knob',
        'fpa-knob',
    ],
};

export const lightKnobsPanel: Panel = {
    name: 'Lighting Knobs Panel',
    title: 'FlyByWire A32NX | Light Knobs Panel',
    docsUrl: `${GLARESHIELD_DOCS_BASE_URL}/light-knobs/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: `${GLARESHIELD_IMAGE_BASE_URL}/light_knobs.png`,
    identifiers: [
        'table-light-knob',
        'integral-glareshield-lighting-knob',
        'fcu-brightness-knob',
    ],
};
