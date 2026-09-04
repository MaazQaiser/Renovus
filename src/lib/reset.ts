/**
 * Wipes every trace of app state from this device — records, in-flight
 * sessions, the PortCo roster, shares and UI preferences — leaving the sign-in
 * intact so the reset lands on a clean app rather than the login screen.
 *
 * Sweeps by prefix rather than a hardcoded list: every store in the app namespaces
 * its keys, so a new one is covered here the day it is added.
 */
const PREFIX = "renovers:";

/** Wiping this would sign the user out, which a data reset should not do. */
const PRESERVED = new Set([`${PREFIX}session`]);

export function resetLocalData(): void {
  if (typeof window === "undefined") return;

  const doomed: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith(PREFIX) && !PRESERVED.has(key)) {
      doomed.push(key);
    }
  }

  // Collected first: removing while iterating shifts the indices underneath us.
  for (const key of doomed) {
    window.localStorage.removeItem(key);
  }
}
