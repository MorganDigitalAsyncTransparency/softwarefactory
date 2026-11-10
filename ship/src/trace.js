// Lets the code view show which function is drawing or playing right now: a function
// that the viewer should see at work calls trace with its own name.
const listeners = new Set();

export function trace(name) {
  for (const listener of listeners) listener(name);
}

export function onTrace(listener) {
  listeners.add(listener);
}
