import type { Defaults } from "../config/types.js";
import { mountPanel, type PanelHandle } from "./panel.js";

export interface MountDeps {
  getDefaults: () => Defaults;
  saveDefaults: (next: Defaults) => void;
}

const PANEL_ID = "upx-filler-panel";

export function installMount(deps: MountDeps): { handle: PanelHandle | null } {
  const state: { handle: PanelHandle | null } = { handle: null };

  function ensure(): void {
    if (document.getElementById(PANEL_ID)) return;
    state.handle = mountPanel({
      getDefaults: deps.getDefaults,
      saveDefaults: deps.saveDefaults,
    });
  }

  ensure();

  const observer = new MutationObserver(() => {
    if (!document.getElementById(PANEL_ID)) ensure();
  });
  observer.observe(document.body, { childList: true });

  return state;
}
