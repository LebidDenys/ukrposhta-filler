import {
  getDefaults,
  onDefaultsChanged,
} from "../config/defaults.js";
import { FIRST_RUN_DEFAULTS, type Defaults } from "../config/types.js";
import { installMount } from "../ui/mountManager.js";
import { logInfo, logWarn } from "../ui/consoleLog.js";
import { STRINGS } from "../i18n/uk.js";

const URL_RE =
  /^https:\/\/ok\.ukrposhta\.ua\/ua\/lk(?:_old)?\/international\/add\//;

const FORM_PROBE = "#recv-fullname, #country-native";
const PROBE_TIMEOUT_MS = 30_000;

function waitForForm(): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLElement>(FORM_PROBE);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = performance.now();
    const obs = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(FORM_PROBE);
      if (el) {
        obs.disconnect();
        resolve(el);
      } else if (performance.now() - start > PROBE_TIMEOUT_MS) {
        obs.disconnect();
        resolve(null);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      obs.disconnect();
      const el = document.querySelector<HTMLElement>(FORM_PROBE);
      resolve(el);
    }, PROBE_TIMEOUT_MS);
  });
}

async function main(): Promise<void> {
  if (!URL_RE.test(location.href)) return;
  logInfo("content script loaded", { href: location.href });

  let currentDefaults: Defaults = { ...FIRST_RUN_DEFAULTS };

  const form = await waitForForm();
  if (!form) {
    logWarn(STRINGS.errors.formNotFound);
    return;
  }

  const mounted = installMount({
    getDefaults: () => currentDefaults,
    saveDefaults: (next) => {
      currentDefaults = next;
      mounted.handle?.refreshSummary();
    },
  });

  try {
    currentDefaults = await getDefaults();
    mounted.handle?.refreshSummary();
  } catch (e) {
    logWarn("getDefaults failed; using first-run defaults", e);
  }

  onDefaultsChanged((next) => {
    currentDefaults = next;
    mounted.handle?.refreshSummary();
  });
}

void main();
