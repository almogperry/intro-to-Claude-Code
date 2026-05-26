let STATE = null;
const subscribers = [];

export function initStore(init) {
  STATE = init;
  notify();
}

export function getState() {
  return STATE;
}

export function setState(fn) {
  STATE = fn(STATE);
  notify();
}

export function subscribe(fn) {
  subscribers.push(fn);
  return () => {
    subscribers.splice(subscribers.indexOf(fn), 1);
  };
}

function notify() {
  subscribers.forEach(fn => fn(STATE));
}
