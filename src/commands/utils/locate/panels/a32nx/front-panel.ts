import { LOCATE_DOCS_BASE_URLS, LOCATE_IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

const FRONT_DOCS_BASE_URL = LOCATE_DOCS_BASE_URLS.a32nx.front;
const FRONT_IMAGE_BASE_URL = LOCATE_IMAGE_BASE_URLS.a32nx.front;

export const instrumentLightingPanel: Panel = {
  name: 'Instrument Lighting Control Panel',
  title: 'FlyByWire A32NX | Instrument Lighting Control Panel',
  docsUrl: `${FRONT_DOCS_BASE_URL}/ilcp/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/instrument_lighting.png`,
  identifiers: [
    'instrument-brightness',
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
  name: 'PFD',
  title: 'FlyByWire A32NX | Primary Flight Display (PFD)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/pfd`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/pfd.png`,
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
  name: 'ND',
  title: 'FlyByWire A32NX | Navigation Display (ND)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/nd`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/nd.png`,
  identifiers: ['nd', 'navigation-display', 'weather-radar', 'terrain-map', 'terr-on-nd-switch'],
};

export const isis: Panel = {
  name: 'ISIS',
  title: 'FlyByWire A32NX | Integrated Standby Instrument System (ISIS)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/isis`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/isis.png`,
  identifiers: ['isis', 'integrated-standby-instrument-system', 'backup-pfd'],
};

export const dcdu: Panel = {
  name: 'DCDU',
  title: 'FlyByWire A32NX | Datalink Ctl and Display Unit (DCDU)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/dcdu`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/dcdu.png`,
  identifiers: ['dcdu', 'datalink-ctl-and-display-unit', 'cpdlc'],
};

export const ewd: Panel = {
  name: 'E/WD',
  title: 'FlyByWire A32NX | Engine and Warning Display (E/WD) (Upper ECAM)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/upper-ecam`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/ewd.png`,
  identifiers: ['ecam-upper', 'upper-ecam', 'ewd', 'engine-and-warning-display', 'n1-display'],
};

export const sd: Panel = {
  name: 'SD',
  title: 'FlyByWire A32NX | System Display (SD) (Lower ECAM)',
  docsUrl: `${FRONT_DOCS_BASE_URL}/lower-ecam`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/sd.png`,
  identifiers: [
    'sd',
    'system-display',
    'lower-ecam',
    'ecam-lower',
    'tat-display',
    'sat-display',
    'isa-display',
    'gw-display',
    'gross-weight-display',
  ],
};

export const autobrakeAndGearPanel: Panel = {
  name: 'Autobrake and Gear Indicator',
  title: 'FlyByWire A32NX | Autobrake and Gear Indications',
  docsUrl: `${FRONT_DOCS_BASE_URL}/autobrake-gear`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/autobrake_gear.png`,
  identifiers: [
    'gear',
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
  name: 'Clock Panel',
  title: 'FlyByWire A32NX | Clock',
  docsUrl: `${FRONT_DOCS_BASE_URL}/clock`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/clock.png`,
  identifiers: ['clock', 'date'],
};

export const accuPressPanel: Panel = {
  name: 'Accumulator Pressure Indicator',
  title: 'FlyByWire A32NX | Accumulator Pressure Indicator',
  docsUrl: `${FRONT_DOCS_BASE_URL}/accu`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${FRONT_IMAGE_BASE_URL}/accu_press.png`,
  identifiers: ['accu-press', 'accumulator-pressure-indicator', 'brake-pressure-indicator'],
};
