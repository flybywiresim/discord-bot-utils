import { LOCATE_DOCS_BASE_URLS, LOCATE_IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

const OVHD_DOCS_BASE_URL = LOCATE_DOCS_BASE_URLS.a32nx.overhead;
const AFT_OVHD_DOCS_BASE_URL = LOCATE_DOCS_BASE_URLS.a32nx.aftOverhead;

const OVHD_IMAGE_BASE_URL = LOCATE_IMAGE_BASE_URLS.a32nx.overhead;
const AFT_OVHD_IMAGE_BASE_URL = LOCATE_IMAGE_BASE_URLS.a32nx.aftOverhead;

export const wiperPanel: Panel = {
  name: 'Wiper Panel',
  title: 'FlyByWire A32NX | Wiper Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/wipers/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/wiper.png`,
  identifiers: [
    'wiper-panel',
    'wiper',
    'wipers',
    'rain',
    'rain-repellent',
    'repellent',
    'rplnt',
    'wiper-selector',
    'rain-rplnt-button',
  ],
};

export const callsPanel: Panel = {
  name: 'Calls Panel',
  title: 'FlyByWire A32NX | Calls Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/calls/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/calls.png`,
  identifiers: ['calls-panel', 'call', 'calls'],
};

export const oxyPanel: Panel = {
  name: 'Oxygen Panel',
  title: 'FlyByWire A32NX | Oxygen Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/oxygen/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/oxygen.png`,
  identifiers: ['oxy', 'oxygen-panel', 'oxygen', 'mask-man-on-switch', 'crew-supply-switch'],
};

export const cvrPanel: Panel = {
  name: 'RCDR Panel',
  title: 'FlyByWire A32NX | Voice Recorder Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/voice-recorder/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/rcdr.png`,
  identifiers: [
    'voice-recorder-panel',
    'cvr',
    'fdr',
    'cockpit-voice-recorder',
    'flight-data-recorder',
    'gnd-ctl-switch',
    'cvr-erase-button',
    'cvr-test-button',
  ],
};

export const gpwsPanel: Panel = {
  name: 'GPWS Panel',
  title: 'FlyByWire A32NX | GPWS Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/gpws/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/gpws.png`,
  identifiers: [
    'gpws-panel',
    'gpws',
    'egpws',
    'terr-switch',
    'sys-switch',
    'gs-mode-switch',
    'flap-mode-switch',
    'ldg-flap-3-switch',
  ],
};

export const emerElecPwrPanel: Panel = {
  name: 'EMER ELEC PWR Panel',
  title: 'FlyByWire A32NX | Emergency Electric Power Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/emergency-electric/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/emer_elec_pwr.png`,
  identifiers: [
    'emergency-electrical-panel',
    'emer-elec-panel',
    'emer-elec',
    'emer-elec-pwr',
    'emer-gen-test-switch',
    'gen-1-line-switch',
    'man-on-switch',
  ],
};

export const evacPanel: Panel = {
  name: 'EVAC Panel',
  title: 'FlyByWire A32NX | Evacuation Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/evacuation/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/evac.png`,
  identifiers: ['evac-panel', 'evac', 'evacuation', 'command-switch', 'horn-shut-off-button', 'capt-purs-switch'],
};

export const fltCtlPanel: Panel = {
  name: 'FLT CLT Panel',
  title: 'FlyByWire A32NX | Flight Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/flight-control-computer/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/flt_ctl.png`,
  identifiers: ['flight-controls', 'flight-control-panel', 'flt-ctl', 'elac', 'sec', 'fac'],
};

export const adirsPanel: Panel = {
  name: 'ADIRS Panel',
  title: 'FlyByWire A32NX | ADIRS Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/adirs/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/adirs.png`,
  identifiers: ['adirs-panel', 'adirs', 'adiru', 'irs', 'adr', 'ir-selector'],
};

export const paVideoPanel: Panel = {
  name: 'PA and Cockpit Video Panel',
  title: 'FlyByWire A32NX | PA and Cockpit Video Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/pa-cockpit-video/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/pa_video.png`,
  identifiers: ['pa-panel', 'video', 'cockpit-video-panel', 'cockpit-door-video', 'cockpit-door-video-switch'],
};

export const extLtPanel: Panel = {
  name: 'EXT LT Panel',
  title: 'FlyByWire A32NX | Exterior Lighting Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/ext-lt/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/ext_lt.png`,
  identifiers: [
    'ext-lt-panel',
    'ext-lt',
    'exterior-lights',
    'strobe-switch',
    'beacon-switch',
    'wing-switch',
    'nav-logo-switch',
    'rwy-turn-off-switch',
    'land-switch',
    'taxi-switch',
    'strobes',
    'wing-lights',
    'runway-turnoff-lights',
    'landing-lights',
    'taxi-lights',
    'logo-lights',
  ],
};

export const apuPanel: Panel = {
  name: 'APU Panel',
  title: 'FlyByWire A32NX | APU Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/apu/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/apu.png`,
  identifiers: ['apu-panel', 'apu', 'auxiliary-power-unit', 'apu-master-switch', 'apu-start-button'],
};

export const signsPanel: Panel = {
  name: 'Signs Panel',
  title: 'FlyByWire A32NX | Signs Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/signs/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/signs.png`,
  identifiers: [
    'signs-panel',
    'signs',
    'seat-belts',
    'no-smoking',
    'no-portable-devices',
    'emergency-exit-lights',
    'emer-exit-lights',
  ],
};

export const intLtPanel: Panel = {
  name: 'INT LT Panel',
  title: 'FlyByWire A32NX | Internal Lights Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/int-lt/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/int_lt.png`,
  identifiers: [
    'int-lt',
    'int-lt-panel',
    'dome-light',
    'overhead-integrated-light',
    'ovhd-integ-lt-knob',
    'ice-ind-stby-compass-switch',
    'dome-switch',
    'annunciator-lights',
    'ann-lt-switch',
  ],
};

export const antiIcePanel: Panel = {
  name: 'Anti Ice Panel',
  title: 'FlyByWire A32NX | Anti Ice Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/anti-ice/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/anti_ice.png`,
  identifiers: [
    'icing',
    'anti-ice-panel',
    'anti-ice',
    'window-heat',
    'probe-heat',
    'wing-anti-ice-switch',
    'engine-anti-ice-switch',
    'probe-window-heat-switch',
  ],
};

export const cabinPressPanel: Panel = {
  name: 'CABIN PRESS Panel',
  title: 'FlyByWire A32NX | Cabin Pressurization Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/cab-press/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/cabin_press.png`,
  identifiers: [
    'cabin-press',
    'cabin-press-panel',
    'pressurization',
    'cabin-pressure',
    'pressure',
    'landing-elevation',
    'man-vs-ctl-switch',
    'cabin-press-mode-sel-switch',
    'ldg-elev-knob',
    'ditching-switch',
  ],
};

export const airCondPanel: Panel = {
  name: 'AIR COND Panel',
  title: 'FlyByWire A32NX | Air Condition Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/ac/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/air_cond.png`,
  identifiers: [
    'air-cond',
    'air-cond-panel',
    'ac-panel',
    'air-cond-panel',
    'packs',
    'bleed',
    'bleed-air',
    'pack-flow-selector',
    'pack-switch',
    'pack-flow-switch',
    'eng-bleed-switch',
    'engine-bleed-switch',
    'ram-air-switch',
    'apu-bleed',
    'x-bleed-selector',
    'cross-bleed-selector',
    'hot-air-switch',
    'cabin-temp-selector',
  ],
};

export const elecPanel: Panel = {
  name: 'ELEC Panel',
  title: 'FlyByWire A32NX | Electrical System Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/elec/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/elec.png`,
  identifiers: [
    'elec',
    'elec-panel',
    'electrical-panel',
    'generators',
    'ac-bus',
    'dc-bus',
    'batteries',
    'external-power',
    'commercial-pwr-switch',
    'galy-cab-pwr-switch',
    'idg-switch',
    'eng-gen-switch',
    'engine-generator-switch',
    'apu-gen-switch',
    'bus-tie-switch',
    'ext-pwr-switch',
    'ac-ess-feed-switch',
    'battery-switch',
    'bat-switch',
  ],
};

export const fuelPanel: Panel = {
  name: 'FUEL Panel',
  title: 'FlyByWire A32NX | Fuel Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/fuel/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/fuel.png`,
  identifiers: ['fuel', 'fuel-panel', 'fuel-pumps', 'x-feed', 'cross-feed', 'wing-tanks', 'center-tanks'],
};

export const hydPanel: Panel = {
  name: 'HYD Panel',
  title: 'FlyByWire A32NX | Hydraulics Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/hyd/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/hyd.png`,
  identifiers: [
    'hyd',
    'hydraulics-panel',
    'green-system',
    'blue-system',
    'yellow-system',
    'rat',
    'ptu',
    'eng-hyd-pump-switch',
    'engine-hydraulics-pump-switch',
    'elec-hyd-pump',
    'rat-man-on-switch',
  ],
};

export const firePanel: Panel = {
  name: 'FIRE Panel',
  title: 'FlyByWire A32NX | Fire Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/fire/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/fire.png`,
  identifiers: ['engine-fire-panel', 'fire', 'smoke', 'fire-agent', 'disch'],
};

export const engManStartPanel: Panel = {
  name: 'ENG MAN START Panel',
  title: 'FlyByWire A32NX | Engine Manual Start Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/eng-man/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/eng_n1.png`,
  identifiers: ['eng-n1', 'manual-engine-start', 'eng-man-start-switch'],
};

export const ventilationPanel: Panel = {
  name: 'Ventilation Panel',
  title: 'FlyByWire A32NX | Ventilation Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/vent/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/ventilation.png`,
  identifiers: ['vent', 'ventilation-panel', 'cabin-fans', 'blower-switch', 'extract-ventilation-switch'],
};

export const cargoSmokePanel: Panel = {
  name: 'CARGO SMOKE Panel',
  title: 'FlyByWire A32NX | Cargo Smoke Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/cargo-smoke/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/cargo_smoke.png`,
  identifiers: ['cargo-fire', 'cargo-smoke-panel'],
};

export const cargoVentPanel: Panel = {
  name: 'CARGO VENT Panel',
  title: 'FlyByWire A32NX | Cargo Vent Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/cargo-vent/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/cargo_vent.png`,
  identifiers: ['cargo-vent-panel', 'cargo-ventilation', 'aft-isol-valve-switch'],
};

export const thirdACP: Panel = {
  name: '3rd ACP',
  title: 'FlyByWire A32NX | 3rd Audio Control Panel',
  docsUrl: `${OVHD_DOCS_BASE_URL}/3rd-acp/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${OVHD_IMAGE_BASE_URL}/acp_3.png`,
  identifiers: ['acp3', '3rd-acp', '3rd-audio-control-panel'],
};

export const readingLightsJumpSeats: Panel = {
  name: 'Jump Seats Reading Light Panel',
  title: 'FlyByWire A32NX | Reading Lights Jump Seats',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/reading-light/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/jump_seat_reading_lt.png`,
  identifiers: ['reading-lights-jump-seat', 'jump-seat-reading-lights'],
};

export const cockpitDoorIndicatorPanel: Panel = {
  name: 'CKPT DOOR CONT Panel',
  title: 'FlyByWire A32NX | Cockpit Door Panel',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/cockpit-door/#description`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/ckpt_door_cont.png`,
  identifiers: ['cockpit-door-cont', 'cockpit-door-indicator-panel'],
};

export const eltPanel: Panel = {
  name: 'ELT Panel',
  title: 'FlyByWire A32NX | ELT Panel',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/elt/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/elt.png`,
  identifiers: ['elt', 'elt-panel', 'emergency-locator-transmitter'],
};

export const pedestalLightPanel: Panel = {
  name: 'Pedestal Light Panel',
  title: 'FlyByWire A32NX | Pedestal Light and Audio 3 Switch',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/pedestal-light/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/pedestal_light.png`,
  identifiers: ['pedestal-light-panel', 'acp3-switching-selector', 'audio-control-panel-3-switching-selector'],
};

export const emerCbPanel: Panel = {
  name: 'EMER CB Panel',
  title: 'FlyByWire A32NX | Emergency Circuit Breaker Panel',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/circuit/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/emer_cb.png`,
  identifiers: ['emer-cb', 'emergency-circuit-breaker-panel'],
};

export const fmsLoadPanel: Panel = {
  name: 'FMS LOAD Panel',
  title: 'FlyByWire A32NX | FMS Load Panel',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/fms-load/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/fms_load.png`,
  identifiers: ['fms-load-panel'],
};

export const maintenancePanel: Panel = {
  name: 'Maintenance Panel',
  title: 'FlyByWire A32NX | Maintenance Panel',
  docsUrl: `${AFT_OVHD_DOCS_BASE_URL}/maintenance/`,
  flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
  imageUrl: `${AFT_OVHD_IMAGE_BASE_URL}/maintenance.png`,
  identifiers: [
    'maintenance',
    'maintenance-panel',
    'fadec-ground-power-switch',
    'blue-pump-override-switch',
    'hyd-leak-measurement-valves-switch',
    'oxygen-tmr-reset-switch',
    'svge-int-ovrd-switch',
    'avionics-comp-lt-switch',
  ],
};
