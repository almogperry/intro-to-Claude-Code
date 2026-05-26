import { fetchState } from './api.js';
import { initStore } from './store.js';
import { renderBoard } from './components/board.js';

async function init() {
  try {
    const state = await fetchState();
    initStore(state);
    renderBoard(document.getElementById('app'));
  } catch (e) {
    console.error('init failed:', e);
    document.getElementById('app').innerHTML = '<p>Failed to load app</p>';
  }
}

init();
