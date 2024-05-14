import { Panel } from '../panel';
import { accuPressPanel, autobrakeAndGearPanel, clockPanel, dcdu, ewd, instrumentLightingPanel, isis, nd, pfd, sd } from './front-panel';
import { efisPanel, fcuPanel, lightKnobsPanel, warningPanel } from './glareshield';
import { antiIcePanel, adirsPanel, apuPanel, callsPanel, cvrPanel, emerElecPwrPanel, evacPanel, extLtPanel, fltCtlPanel, gpwsPanel, intLtPanel, oxyPanel, paVideoPanel, signsPanel, wiperPanel, cabinPressPanel, airCondPanel, elecPanel, fuelPanel, hydPanel, firePanel, engManStartN1ModePanel, ventilationPanel, cargoSmokePanel, cargoVentPanel, thirdACP, readingLightsJumpSeats, cockpitDoorIndicatorPanel, eltPanel, pedestalLightPanel, emerCbPanel, rearBackCbPanel, fmsLoadPanel, maintenancePanel } from './overhead';

export const a32nxPanels: Panel[] = [
    // OVERHEAD
    wiperPanel,
    callsPanel,
    oxyPanel,
    cvrPanel,
    gpwsPanel,
    emerElecPwrPanel,
    evacPanel,
    fltCtlPanel,
    adirsPanel,
    paVideoPanel,
    extLtPanel,
    apuPanel,
    signsPanel,
    intLtPanel,
    antiIcePanel,
    cabinPressPanel,
    airCondPanel,
    elecPanel,
    fuelPanel,
    hydPanel,
    firePanel,
    engManStartN1ModePanel,
    ventilationPanel,
    cargoSmokePanel,
    cargoVentPanel,
    thirdACP,
    readingLightsJumpSeats,
    cockpitDoorIndicatorPanel,
    eltPanel,
    pedestalLightPanel,
    emerCbPanel,
    rearBackCbPanel,
    fmsLoadPanel,
    maintenancePanel,

    // GLARESHIELD
    warningPanel,
    efisPanel,
    fcuPanel,
    lightKnobsPanel,

    // FRONT PANEL
    instrumentLightingPanel,
    pfd,
    nd,
    isis,
    dcdu,
    ewd,
    sd,
    autobrakeAndGearPanel,
    clockPanel,
    accuPressPanel,
]; // TODO: import all panels
