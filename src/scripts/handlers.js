import { changeGameScene } from './controllers.js';


export function handleClick(field, score, progress, moves, result, event) {
  if (!field.locked) {

    // Lock field
    field.locked = true;

    // Change field based on clicked item
    changeGameScene(field, score, progress, moves, result, event.target);
  }
}

export function handleNextLevel() {
  nextLevel();
}

export function handleReplayLevel() {
  replayLevel();
}