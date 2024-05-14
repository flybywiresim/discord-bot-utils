import { DOCS_BASE_URLS } from '../../docs-base-urls';
import { Panel } from '../panel';

const FRONT_BASE_URL = DOCS_BASE_URLS.a32nx.front;

export const instrumentLightingPanel: Panel = {
    name: 'A32NX - Instrument Lighting Control Panel',
    docsUrl: `${FRONT_BASE_URL}/ilcp/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'instrument-lighting-panel',
        'gpws-gs-button',
        'pfd-brightness-knob',
        'pfd-nd-xfr-button',
        'nd-brightness-knob',
        'loudspeaker-knob',
        'console-floor-light-switch',
    ],
};

export const pfd: Panel = {
    name: 'A32NX - Primary Flight Display (PFD)',
    docsUrl: `${FRONT_BASE_URL}/pfd`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'pfd',
        'primary-flight-display',
        'fma',
        'flight-mode-annunciator',
        'speed-tape',
        'artificial-horizon',
        'compass-scale',
        'v-dev-scales',
        'loc-scale',
        'gs-scale',
        'altitude-tape',
        'vs-indicator',
        'vertical-speed-indicator',
    ],
};

export const nd: Panel = {
    name: 'A32NX - Navigation Display (ND)',
    docsUrl: `${FRONT_BASE_URL}/nd`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'nd',
        'navigation-display',
        'weather-radar',
        'terrain-map',
        'terr-on-nd-switch',
    ],
};

export const isis: Panel = {
    name: 'A32NX - Integrated Standby Instrument System (ISIS)',
    docsUrl: `${FRONT_BASE_URL}/isis`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'isis',
        'integrated-standby-instrument-system',
        'backup-pfd',
    ],
};

export const dcdu: Panel = {
    name: 'A32NX - Datalink Ctl and Display Unit (DCDU)',
    docsUrl: `${FRONT_BASE_URL}/dcdu`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'dcdu',
        'datalink-ctl-and-display-unit',
        'cpdlc',
        '',
    ],
};

export const ewd: Panel = {
    name: 'A32NX - Engine and Warning Display (E/WD) (Upper ECAM)',
    docsUrl: `${FRONT_BASE_URL}/upper-ecam`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'upper-ecam',
        'ewd',
        'engine-and-warning-display',
        'n1-display',
    ],
};

export const sd: Panel = {
    name: 'A32NX - System Display (SD) (Lower ECAM)',
    docsUrl: `${FRONT_BASE_URL}/lower-ecam`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'sd',
        'system-display',
        'lower-ecam',
        'tat-display',
        'sat-display',
        'isa-display',
        'gw-display',
        'gross-weight-display',
    ],
};

export const autobrakeAndGearPanel: Panel = {
    name: 'A32NX - Autobrake and Gear Indications',
    docsUrl: `${FRONT_BASE_URL}/autobrake-gear`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'ldg-gear-indicator',
        'brk-fan-switch',
        'brake-fan-switch',
        'autobrake-switch',
        'anti-skid-nosewheel-steering-switch',
        'lg-lever',
        'landing-gear-lever',
    ],
};

export const clockPanel: Panel = {
    name: 'A32NX - Clock',
    docsUrl: `${FRONT_BASE_URL}/clock`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'clock',
        'date',
    ],
};

export const accuPressPanel: Panel = {
    name: 'A32NX - Accumulator Pressure Indicator',
    docsUrl: `${FRONT_BASE_URL}/accu`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'accu-press',
        'accumulator-pressure-indicator',
        'brake-pressure-indicator',
    ],
};
