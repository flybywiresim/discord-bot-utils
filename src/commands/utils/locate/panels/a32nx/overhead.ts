import { DOCS_BASE_URLS } from '../../docs-base-urls';
import { Panel } from '../panel';

const OVHD_BASE_URL = DOCS_BASE_URLS.a32nx.overhead;
const OVHD_AFT_BASE_URL = DOCS_BASE_URLS.a32nx.aftOverhead;

export const wiperPanel: Panel = {
    name: 'A32NX - Wiper Panel',
    description: 'Each windshield is provided with two-speed electric wipers that are controlled by individual WIPER selectors. A rain repellent system is installed, but is deactivated by some airlines.',
    docsUrl: `${OVHD_BASE_URL}/wipers/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'wiper-panel',
        'wiper',
        'wipers',
        'rain-repellent',
        'repellent',
        'rplnt',
        'wiper-selector',
        'rain-rplnt-button',
    ],
};

export const callsPanel: Panel = {
    name: 'A32NX - Calls Panel',
    description: 'The calls panel allows the cockpit to initiate calls to the flight attendants via the cabin interphone system, and the ground crew via the flight interphone system.',
    docsUrl: `${OVHD_BASE_URL}/calls/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'calls-panel',
        'call',
        'calls',
    ],
};

export const oxyPanel: Panel = {
    name: 'A32NX - Oxygen Panel',
    description: 'The oxygen panel allows the crew to control the various oxygen systems of the aircraft.',
    docsUrl: `${OVHD_BASE_URL}/oxygen/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'oxygen-panel',
        'oxygen',
        'mask-man-on-switch',
        'crew-supply-switch',
    ],
};

export const cvrPanel: Panel = {
    name: 'A32NX - Voice Recorder Panel',
    description: 'The voice recorder panel consist of cockpit voice recorder (CVR) and digital flight data recorder (DFDR) controls.',
    docsUrl: `${OVHD_BASE_URL}/voice-recorder/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
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
    name: 'A32NX - GPWS Panel',
    description: 'The GPWS panel controls the GPWS and EGPWS system.',
    docsUrl: `${OVHD_BASE_URL}/gpws/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
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
    name: 'A32NX - Emergency Electric Power Panel',
    description: 'The Emergency Electric Power Panel is used by the crew to manually enter the electrical emergency configuration.',
    docsUrl: `${OVHD_BASE_URL}/emergency-electric/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'emer-elec-panel',
        'emer-elec',
        'emer-elec-pwr',
        'emer-gen-test-switch',
        'gen-1-line-switch',
        'man-on-switch',
    ],
};

export const evacPanel: Panel = {
    name: 'A32NX - Evacuation Panel',
    description: 'The emergency evacuation signal system alerts the flight attendants to evacuate the passenger cabin.',
    docsUrl: `${OVHD_BASE_URL}/evacuation/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'evac-panel',
        'evac',
        'evacuation',
        'command-switch',
        'horn-shut-off-button',
        'capt-purs-switch',
    ],
};

export const fltCtlPanel: Panel = {
    name: 'A32NX - Flight Control Panel',
    description: 'The Flight Control panels are used by the crew to control the various flight control computers.',
    docsUrl: `${OVHD_BASE_URL}/flight-control-computer/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'flight-control-panel',
        'flt-ctl',
        'elac',
        'sec',
        'fac',
    ],
};

export const adirsPanel: Panel = {
    name: 'A32NX - ADIRS Panel',
    description: "The Air Data Inertial Reference System (ADIRS) computes the aircraft's position, speed, altitude, attitude, and air data for the displays, flight management guidance system, flight controls, engine controls, and other systems.",
    docsUrl: `${OVHD_BASE_URL}/adirs/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'adirs-panel',
        'adirs',
        'adiru',
        'irs',
        'adr',
        'ir-selector',
    ],
};

export const paVideoPanel: Panel = {
    name: 'A32NX - PA and Cockpit Video Panel',
    description: 'Please read our documentation on this panel for more information.',
    docsUrl: `${OVHD_BASE_URL}/pa-cockpit-video/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'pa-panel',
        'cockpit-video-panel',
        'cockpit-door-video',
        'cockpit-door-video-switch',
    ],
};

export const extLtPanel: Panel = {
    name: 'A32NX - Exterior Lighting Panel',
    description: 'The Exterior Lighting panel is used by the crew to control the various exterior lights of the aircraft.',
    docsUrl: `${OVHD_BASE_URL}/ext-lt/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
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
    name: 'A32NX - APU Panel',
    description: 'The Auxiliary Power Unit (APU) is a small jet engine in the back of the A320neo which supplies the aircraft with pneumatic and electrical power.',
    docsUrl: `${OVHD_BASE_URL}/apu/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'apu-panel',
        'apu',
        'auxiliary-power-unit',
        'apu-master-switch',
        'apu-start-button',
    ],
};

export const signsPanel: Panel = {
    name: 'A32NX - Signs Panel',
    description: 'The Signs panel is used by the crew to control the seatbelt, no smoking/no portable devices signs and emergency exit lights in the cabin.',
    docsUrl: `${OVHD_BASE_URL}/signs/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
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
    name: 'A32NX - Internal Lights Panel',
    description: 'The Internal Lights Panel is used by the crew to control various lights inside the cockpit.',
    docsUrl: `${OVHD_BASE_URL}/int-lt/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
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
    name: 'A32NX - Anti Ice Panel',
    description: 'The ice protection system allows unrestricted operation of the aircraft in icing conditions.',
    docsUrl: `${OVHD_BASE_URL}/anti-ice/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
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
    name: 'A32NX - Cabin Pressurization Panel',
    description: 'The cabin pressurization system controls the pressurization of the cabin to allow crew and passengers to fly comfortably without the usage of oxygen masks and negative impact of too low pressure at high altitude.',
    docsUrl: `${OVHD_BASE_URL}/cab-press/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
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
    name: 'A32NX - Air Condition Control Panel',
    description: 'The air conditioning system operation is fully automatic and refreshes air constantly and maintains the temperature in the aircraft.',
    docsUrl: `${OVHD_BASE_URL}/ac/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
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
    name: 'A32NX - Electrical System Panel',
    description: "The Electical System panel is used by the crew to control the aircraft's electrical system. The A320neo's electrical system is automatic for most normal operations. There is only very little crew interaction or input required.",
    docsUrl: `${OVHD_BASE_URL}/elec/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
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
    name: 'A32NX - Fuel Control Panel',
    description: "The Fuel Control Panel is used by the crew to control the aircraft's fuel system.",
    docsUrl: `${OVHD_BASE_URL}/fuel/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'fuel-panel',
        'fuel-pumps',
        'x-feed',
        'cross-feed',
        'wing-tanks',
        'center-tanks',
    ],
};

export const hydPanel: Panel = {
    name: 'A32NX - Hydraulics Control Panel',
    description: 'The aircraft has three fully independent hydraulic systems: Green, Yellow, Blue.',
    docsUrl: `${OVHD_BASE_URL}/hyd/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
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
    name: 'A32NX - Fire Control Panel',
    description: "The Fire Control panel is used by the crew to control the aircraft's fire and smoke detection systems.",
    docsUrl: `${OVHD_BASE_URL}/fire/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'engine-fire-panel',
        'fire',
        'smoke',
        'fire-agent',
        'disch',
    ],
};

export const engManStartN1ModePanel: Panel = {
    name: 'A32NX - Engine Manual Start and N1 Mode Panel',
    description: 'This panel is used by the crew during manual engine start.',
    docsUrl: `${OVHD_BASE_URL}/eng-man/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'manual-engine-start',
        'eng-man-start-switch',
        'eng-n1-mode-switch',
    ],
};

export const ventilationPanel: Panel = {
    name: 'A32NX - Ventilation Panel',
    description: "The Ventilation panel is used by the crew to control the aircraft's ventilation system.",
    docsUrl: `${OVHD_BASE_URL}/vent/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'ventilation-panel',
        'cabin-fans',
        'blower-switch',
        'extract-ventilation-switch',
    ],
};

export const cargoSmokePanel: Panel = {
    name: 'A32NX - Cargo Smoke Panel',
    description: 'The forward and aft cargo compartments are equipped with smoke detection systems, which alert the crew and close isolation valves to the cargo compartment.',
    docsUrl: `${OVHD_BASE_URL}/cargo-smoke/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'cargo-fire',
        'cargo-smoke-panel',
    ],
};

export const cargoVentPanel: Panel = {
    name: 'A32NX - Cargo Vent Panel',
    description: 'An extraction fan draws air from forward cargo or aft cargo, and exhausts it overboard. Air from the cabin replaces the exhausted air, thus ventilating the cargo compartments.',
    docsUrl: `${OVHD_BASE_URL}/cargo-vent/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'cargo-vent-panel',
        'cargo-ventilation',
        'aft-isol-valve-switch',
    ],
};

export const thirdACP: Panel = {
    name: 'A32NX - 3rd Audio Control Panel',
    description: 'This panel is used to control the third communcations sytem.',
    docsUrl: `${OVHD_BASE_URL}/3rd-acp/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        '3rd-acp',
        '3rd-audio-control-panel',
    ],
};

export const readingLightsJumpSeats: Panel = {
    name: 'A32NX - Reading Lights Jump Seats',
    description: 'Additional lighting for the two jump seats behind the pilots.',
    docsUrl: `${OVHD_AFT_BASE_URL}/reading-light/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'jump-seat-reading-lights',
    ],
};

export const cockpitDoorIndicatorPanel: Panel = {
    name: 'A32NX - Cockpit Door Panel',
    description: 'This panel indicates the state of the cockpit door system.',
    docsUrl: `${OVHD_AFT_BASE_URL}/cockpit-door/#description`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'cockpit-door-indicator-panel',
    ],
};

export const eltPanel: Panel = {
    name: 'A32NX - ELT Panel',
    description: 'The Emergency Locator Transmitter is mounted in the back of the aircraft, and is designed to be triggered upon impact or may be manually activated using the remote switch and control panel indicator in the cockpit.',
    docsUrl: `${OVHD_AFT_BASE_URL}/elt/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'elt',
        'elt-panel',
        'emergency-locator-transmitter',
    ],
};

export const pedestalLightPanel: Panel = {
    name: 'A32NX - Pedestal Light and Audio 3 Switch',
    description: 'The Pedestal Light Panel houses the pedestal light as well as the ACP 3 XFRD selector.',
    docsUrl: `${OVHD_AFT_BASE_URL}/pedestal-light/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'pedestal-light-panel',
        'acp3-switching-selector',
        'audio-control-panel-3-switching-selector',
    ],
};

export const emerCbPanel: Panel = {
    name: 'A32NX - Emergency Circuit Breaker Panel',
    description: 'This panel houses the circuit breakers critical for the safety of the flight.',
    docsUrl: `${OVHD_AFT_BASE_URL}/circuit/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'emer-cb',
        'emergency-circuit-breaker-panel',
    ],
};

export const rearBackCbPanel: Panel = {
    name: 'A32NX - Rear Back Circuit Breaker Panel',
    description: "This panel houses secondary circuit breakers that don't need to be immediately accessible by the crew during flight.",
    docsUrl: `${OVHD_AFT_BASE_URL}/circuit/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'rear-back-circuit-breaker-panel',
        'secondary-circuit-breaker-panel',
    ],
};

export const fmsLoadPanel: Panel = {
    name: 'A32NX - FMS Load Panel',
    description: 'This panel is used by maintenance to load new FMS data.',
    docsUrl: `${OVHD_AFT_BASE_URL}/fms-load/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'fms-load-panel',
    ],
};

export const maintenancePanel: Panel = {
    name: 'A32NX - Maintenance Panel',
    description: 'The maintenance panel is mostly used by the maintenance crew.',
    docsUrl: `${OVHD_AFT_BASE_URL}/maintenance/`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: '',
    identifiers: [
        'maintenance-panel',
        'fadec-ground-power-switch',
        'blue-pump-override-switch',
        'hyd-leak-measurement-valves-switch',
        'oxygen-tmr-reset-switch',
        'svge-int-ovrd-switch',
        'avionics-comp-lt-switch',
    ],
};
