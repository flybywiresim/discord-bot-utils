import { DOCS_BASE_URLS, IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

const PEDESTAL_DOCS_BASE_URL = DOCS_BASE_URLS.a32nx.pedestal;
const PEDESTAL_IMAGE_BASE_URL = IMAGE_BASE_URLS.a32nx.pedestal;

export const console: Panel = {
    name: 'Console',
    title: 'FlyByWire A32NX | Console',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/console`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/console.png`,
    identifiers: [
        'console',
        'sidestick',
        'side-stick',
        'ap-disc-button',
        'autopilot-disconnect-button',
        'tiller',
        'pedal-disconnect-button',
    ],
};

export const mcdu: Panel = {
    name: 'MCDU',
    title: 'FlyByWire A32NX | Multipurpose Control & Display Unit (MCDU)',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/mcdu`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/mcdu.png`,
    identifiers: [
        'fms',
        'cdu',
        'mcdu',
        'fmgc',
    ],
};

export const rmpAcpPanel: Panel = {
    name: 'RMP/ACP Panel',
    title: 'FlyByWire A32NX | Radio Management and Audio Control Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/rmp`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/rmp_acp.png`,
    identifiers: [
        'rmp',
        'radio-management-panel',
        'acp',
        'audio-control-panel',
        'atc-panel',
    ],
};

export const captPedestalLightingPanel: Panel = {
    name: 'Pedestal Lighting Panel',
    title: 'FlyByWire A32NX | Pedestal Lighting Panel (Captain Side)',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/lighting-capt`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/capt_pedestal_lt.png`,
    identifiers: [
        'captain-pedestal-lighting-panel',
    ],
};

export const wxPanel: Panel = {
    name: 'WX Radar',
    title: 'Weather Radar Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/radar`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/wx_radar.png`,
    identifiers: [
        'wx',
        'weather-radar',
        'wx-radar',
        'pws',
        'predictive-windshear-systems',
    ],
};

export const speedBrake: Panel = {
    name: 'Speed Brake',
    title: 'FlyByWire A32NX | Speed Brake',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/speedbrake`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/spd_brk.png`,
    identifiers: [
        'speed-brake',
        'spd-brk',
        'spoilers',
        'gnd-sprls',
    ],
};

export const cockpitDoorPanel: Panel = {
    name: 'Cockpit Door Panel',
    title: 'FlyByWire A32NX | Cockpit Door Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/cockpit-door`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/cockpit_door.png`,
    identifiers: [
        'cockpit-door',
        'cockpit-door-panel',
        'cockpit-door-switch',
        'cockpit-door-video-button',
    ],
};

export const switchingPanel: Panel = {
    name: 'Switching Panel',
    title: 'FlyByWire A32NX | Switching Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/switching`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/switching.png`,
    identifiers: [
        'switching',
        'switching-panel',
        'att-hdg-selector',
        'air-data-selector',
        'eis-dmc-selector',
        'ecam-nd-xfr-selector',
    ],
};

export const ecamControlPanel: Panel = {
    name: 'ECAM Control Panel',
    title: 'FlyByWire A32NX | ECAM Control Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/ecam-control`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/ecam_ctl.png`,
    identifiers: [
        'ecam-control',
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
    name: 'THR LVR/Pitch Trim Column',
    title: 'FlyByWire A32NX | Thrust Lever and Pitch Trim Column',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/thrust-pitch-trim`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/thr_lvrs_pitch_trim.png`,
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
    name: 'ENG Panel',
    title: 'FlyByWire A32NX | Engine Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/engine`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/eng.png`,
    identifiers: [
        'engine-panel',
        'engine-master',
        'engine-master-switches',
        'eng-mode-selector',
        'engine-mode-selector',
    ],
};

export const rudderTrim: Panel = {
    name: 'Rudder Trim Panel',
    title: 'FlyByWire A32NX | Rudder Trim Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/rudder-trim`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/rudder_trim.png`,
    identifiers: [
        'rudder-trim',
    ],
};

export const parkBrkPanel: Panel = {
    name: 'Parking Brake Panel',
    title: 'FlyByWire A32NX | Parking Brake Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/parking-brake`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/park_brk.png`,
    identifiers: [
        'parking-brake',
        'park-brk',
    ],
};

export const gravityGearExtensionPanel: Panel = {
    name: 'Gravity Gear Extension Panel',
    title: 'FlyByWire A32NX | Emergency Gravity Gear Extension Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/gravity-gear-ext`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/gravity_gear_extn.png`,
    identifiers: [
        'gravity-gear-extension',
    ],
};

export const aidsDfdrPanel: Panel = {
    name: 'AIDS/DFDR Panel',
    title: 'FlyByWire A32NX | AIDS, DFDR  Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/lighting-aids-dfdr`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/aids_dfdr.png`,
    identifiers: [
        'aids',
        'dfdr',
        'ped-flood-lt-knob',
        'pedestal-flood-light-knob',
        'aids-button',
        'dfdr-button',
    ],
};

export const atcTcasPanel: Panel = {
    name: 'ATC/TCAS Panel',
    title: 'FlyByWire A32NX | ATC TCAS Panel',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/atc-tcas`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/atc_tcas.png`,
    identifiers: [
        'xpdr',
        'atc-tcas-panel',
        'transponder',
        'tcas',
        'alt-rptg-switch',
    ],
};

export const flaps: Panel = {
    name: 'Flaps',
    title: 'FlyByWire A32NX | Flaps',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/flaps`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/flaps.png`,
    identifiers: [
        'flaps',
    ],
};

export const printer: Panel = {
    name: 'Printer',
    title: 'FlyByWire A32NX | Printer',
    docsUrl: `${PEDESTAL_DOCS_BASE_URL}/printer`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${PEDESTAL_IMAGE_BASE_URL}/printer.png`,
    identifiers: [
        'printer',
    ],
};
