import { changeField } from './controllers.js';


export function handleClick(field, score, progress, moves, result, event) {
  if (!field.locked) {

    // Lock field
    field.locked = true;

    // Change field based on clicked item
    changeField(field, score, progress, moves, result, event.target);
  }
}