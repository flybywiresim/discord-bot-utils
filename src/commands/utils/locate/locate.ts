import { Panel } from './panels/panel';
import { a32nxPanels } from './panels/a32nx/a32nx-panels';

const a32nxPanelMap: Map<string, Panel> = new Map();
for (const panel of a32nxPanels) {
    for (const identifier of panel.identifiers) {
        a32nxPanelMap.set(identifier, panel);
    }
}
