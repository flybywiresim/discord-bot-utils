import { DOCS_BASE_URLS } from '../../docs-base-urls';
import { Panel } from '../panel';

const PEDESTAL_BASE_URL = DOCS_BASE_URLS.a32nx.pedestal;

export const console: Panel = {
    name: 'A32NX - Console',
    docsUrl: `${PEDESTAL_BASE_URL}/console`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'console',
        'sidestick',
        'ap-disc-button',
        'autopilot-disconnect-button',
        'tiller',
        'pedal-disconnect-button',
    ],
};

export const mcdu: Panel = {
    name: 'A32NX - Multipurpose Control & Display Unit (MCDU)',
    docsUrl: `${PEDESTAL_BASE_URL}/mcdu`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'fms',
        'cdu',
        'mcdu',
        'fmgc',
    ],
};

export const rmpAcpPanel: Panel = {
    name: 'A32NX - Radio Management and Audio Control Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/rmp`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'rmp',
        'radio-management-panel',
        'acp',
        'audio-control-panel',
        'atc-panel',
    ],
};

export const captPedestalLightingPanel: Panel = {
    name: 'A32NX - Pedestal Lighting Panels (Captain Side)',
    docsUrl: `${PEDESTAL_BASE_URL}/lighting-capt`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'pedestal-lighting-panel-captain',
    ],
};

export const wxPanel: Panel = {
    name: 'Weather Radar Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/radar`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'weather-radar',
        'wx-radar',
        'pws',
        'predictive-windshear-systems',
    ],
};

export const speedBrake: Panel = {
    name: 'A32NX - Speed Brake',
    docsUrl: `${PEDESTAL_BASE_URL}/speedbrake`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'speed-brake',
        'spd-brk',
        'spoilers',
        'gnd-sprls',
    ],
};

export const cockpitDoorPanel: Panel = {
    name: 'A32NX - Cockpit Door Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/cockpit-door`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'cockpit-door-panel',
        'cockpit-door-switch',
        'cockpit-door-video-button',
    ],
};

export const switchingPanel: Panel = {
    name: 'A32NX - Switching Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/switching`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'switching-panel',
        'att-hdg-selector',
        'air-data-selector',
        'eis-dmc-selector',
        'ecam-nd-xfr-selector',
    ],
};

export const ecamControlPanel: Panel = {
    name: 'A32NX - ECAM Control Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/ecam-control`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'upper-ecam-display-brightness',
        'lower-ecam-display-brightness',
        'ecam-to-config',
        'to-config',
        'emer-canc',
        'ecam-clr',
        'ecam-rcl',
    ],
};

export const thrLvrPitchTrim: Panel = {
    name: 'A32NX - Thrust Lever and Pitch Trim Column',
    docsUrl: `${PEDESTAL_BASE_URL}/thrust-pitch-trim`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'thr-lvr',
        'thrust-levers',
        'athr-disc-button',
        'autothrust-disconnect-button',
        'pitch-trim-wheels',
        'idle-detent',
        'cb-detent',
        'clb-detent',
        'flx-mct-detent',
        'toga-detent',
        'reversers',
    ],
};

export const engPanel: Panel = {
    name: 'A32NX - Engine Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/engine`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'engine-panel',
        'engine-master-switches',
        'eng-mode-selector',
        'engine-mode-selector',
    ],
};

export const rudderTrim: Panel = {
    name: 'A32NX - Rudder Trim Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/rudder-trim`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'rudder-trim',
    ],
};

export const parkBrkPanel: Panel = {
    name: 'A32NX - Parking Brake Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/parking-brake`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'parking-brake',
        'park-brk',
    ],
};

export const gravityGearExtensionPanel: Panel = {
    name: 'A32NX - Emergency Gravity Gear Extension Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/gravity-gear-ext`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'gravity-gear-extension',
    ],
};

export const aidsDfdrPanel: Panel = {
    name: 'A32NX - AIDS, DFDR  Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/lighting-aids-dfdr`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'aids-button',
        'dfdr-button',
    ],
};

export const atcTcasPanel: Panel = {
    name: 'A32NX - ATC TCAS Panel',
    docsUrl: `${PEDESTAL_BASE_URL}/atc-tcas`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'atc-tcas-panel',
        'transponder',
        'tcas',
        'alt-rptg-switch',
    ],
};

export const flaps: Panel = {
    name: 'A32NX - Flaps',
    docsUrl: `${PEDESTAL_BASE_URL}/flaps`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'flaps',
    ],
};

export const printer: Panel = {
    name: 'A32NX - Printer',
    docsUrl: `${PEDESTAL_BASE_URL}/printer`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'printer',
    ],
};
