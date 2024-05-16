import { DOCS_BASE_URLS, IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

export const rearBackCbPanel: Panel = {
    name: 'Rear CB Panel',
    title: 'FlyByWire A32NX | Rear Back Circuit Breaker Panel',
    docsUrl: `${DOCS_BASE_URLS.a32nx.aftOverhead}/circuit/#rear-right-back-panel`,
    flightDeckUrl: DOCS_BASE_URLS.a32nx.flightdeck,
    imagePath: `${IMAGE_BASE_URLS.a32nx.rearCb}/rear_right_back.jpg`,
    identifiers: [
        'rear-back-circuit-breaker-panel',
        'secondary-circuit-breaker-panel',
    ],
};
