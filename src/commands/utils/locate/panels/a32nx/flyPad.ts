import { LOCATE_DOCS_BASE_URLS, LOCATE_IMAGE_BASE_URLS } from '../../base-urls';
import { Panel } from '../panel';

export const flyPad: Panel = {
    name: 'flyPad',
    title: 'FlyByWire A32NX | flyPad (EFB)',
    docsUrl: LOCATE_DOCS_BASE_URLS.a32nx.flypad,
    flightDeckUrl: LOCATE_DOCS_BASE_URLS.a32nx.flightdeck,
    imageUrl: `${LOCATE_IMAGE_BASE_URLS.a32nx.flypad}/efb_downscaled.gif`,
    identifiers: ['flypad', 'efb', 'electronic-flight-bag'],
};
