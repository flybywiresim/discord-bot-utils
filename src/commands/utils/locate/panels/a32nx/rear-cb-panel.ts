import { LOCATE_DOCS_BASE_URLS, LOCATE_IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

export const rearBackCbPanel: Panel = {
    name: 'Rear CB Panel',
    title: 'FlyByWire A32NX | Rear Back Circuit Breaker Panel',
    docsUrl: `${LOCATE_DOCS_BASE_URLS.a32nx.aftOverhead}/circuit/#rear-right-back-panel`,
    flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${LOCATE_IMAGE_BASE_URLS.a32nx.rearCb}/rear_right_back.jpg`,
    identifiers: [
        'rear-back-circuit-breaker-panel',
        'secondary-circuit-breaker-panel',
    ],
};
