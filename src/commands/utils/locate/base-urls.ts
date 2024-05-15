import { imageBaseUrl } from '../../../lib';

// Base URL for all documentation links.
const DOCS_BASE_URL = 'https://docs.flybywiresim.com';

// Base URL for all A32NX documentation links.
const A32NX_DOCS_BASE_URL = `${DOCS_BASE_URL}/pilots-corner/a32nx-briefing/flight-deck`;

export const DOCS_BASE_URLS = {
    a32nx: {
        flightdeck: 'https://docs.flybywiresim.com/pilots-corner/a32nx-briefing/flight-deck/',
        rearCb: `${A32NX_DOCS_BASE_URL}/ovhd-aft/circuit/#rear-right-back-panel`,
        overhead: `${A32NX_DOCS_BASE_URL}/ovhd`,
        aftOverhead: `${A32NX_DOCS_BASE_URL}/ovhd-aft`,
        glareshield: `${A32NX_DOCS_BASE_URL}/glareshield`,
        front: `${A32NX_DOCS_BASE_URL}/front`,
        pedestal: `${A32NX_DOCS_BASE_URL}/pedestal`,
    },
};

// Base URL for all locate-cmd images.
const IMAGE_BASE_URL = `${imageBaseUrl}/utils/locate-cmd`;

// Base URL for all A32NX images.
const A32NX_IMAGE_BASE_URL = `${IMAGE_BASE_URL}/a32nx`;

export const IMAGE_BASE_URLS = {
    a32nx: {
        rearCb: `${A32NX_IMAGE_BASE_URL}`,
        overhead: `${A32NX_IMAGE_BASE_URL}/overhead`,
        aftOverhead: `${A32NX_IMAGE_BASE_URL}/aft-overhead`,
        front: `${A32NX_IMAGE_BASE_URL}/front`,
        glareshield: `${A32NX_IMAGE_BASE_URL}/glareshield`,
        pedestal: `${A32NX_IMAGE_BASE_URL}/pedestal`,
    },
};
