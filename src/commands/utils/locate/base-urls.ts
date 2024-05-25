import { imageBaseUrl } from '../../../lib';

// Base URL for all documentation links.
const LOCATE_DOCS_BASE_URL = 'https://docs.flybywiresim.com';

// Base URL for all A32NX documentation links.
const LOCATE_A32NX_DOCS_BASE_URL = `${LOCATE_DOCS_BASE_URL}/pilots-corner/a32nx-briefing/flight-deck`;

export const LOCATE_DOCS_BASE_URLS = {
    a32nx: {
        flightdeck: 'https://docs.flybywiresim.com/pilots-corner/a32nx-briefing/flight-deck/',
        rearCb: `${LOCATE_A32NX_DOCS_BASE_URL}/ovhd-aft/circuit/#rear-right-back-panel`,
        overhead: `${LOCATE_A32NX_DOCS_BASE_URL}/ovhd`,
        aftOverhead: `${LOCATE_A32NX_DOCS_BASE_URL}/ovhd-aft`,
        glareshield: `${LOCATE_A32NX_DOCS_BASE_URL}/glareshield`,
        front: `${LOCATE_A32NX_DOCS_BASE_URL}/front`,
        pedestal: `${LOCATE_A32NX_DOCS_BASE_URL}/pedestal`,
    },
};

// Base URL for all locate-cmd images.
const LOCATE_IMAGE_BASE_URL = `${imageBaseUrl}/utils/locate-cmd`;

// Base URL for all A32NX images.
const LOCATE_A32NX_IMAGE_BASE_URL = `${LOCATE_IMAGE_BASE_URL}/a32nx`;

export const LOCATE_IMAGE_BASE_URLS = {
    a32nx: {
        rearCb: `${LOCATE_A32NX_IMAGE_BASE_URL}`,
        overhead: `${LOCATE_A32NX_IMAGE_BASE_URL}/overhead`,
        aftOverhead: `${LOCATE_A32NX_IMAGE_BASE_URL}/aft-overhead`,
        front: `${LOCATE_A32NX_IMAGE_BASE_URL}/front`,
        glareshield: `${LOCATE_A32NX_IMAGE_BASE_URL}/glareshield`,
        pedestal: `${LOCATE_A32NX_IMAGE_BASE_URL}/pedestal`,
    },
};
