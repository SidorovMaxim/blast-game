import animate from './animate.js';
import { createNewLevel } from './main.js';
import config from '../configs/config.json';
import { Item, Items, Navigation, level } from './gameSceneComponents.js';


// Func for changing game field if player clicked on any item
export function changeGameScene(field, score, progress, moves, result, item) {
  let aloneItem = {value: true};
  let hiddenItems = {value: 0};

  // Hide clicked item and nearby items with same texture
  hideItems(field, item, {isClickedItem: true}, aloneItem, hiddenItems);

  // Unlocked field and interrupt if only one item
  if (aloneItem.value) {
    field.locked = false;
    return;
  }

  // Continue if item is not alone
  // Reduce the remaining num of moves
  moves.text--;

  // Change score based on num of hidden items
  changeScore(score, hiddenItems);

  // Change progress based on score
  changeProgress(score, progress);

  // Create new items based on num of hidden items in each column
  createItems(field, score, progress, moves, result);

  // Move items with empty space below in them column
  moveItems(field);

  setTimeout(() => {
    // Remove hidden items when animation is over
    removeHiddenItems(field);
  }, 200);

  
  setTimeout(() => {
    // Сheck the end of the game
    checkGameState(field, score, moves, result);

    // If it's the end of the game stop the game loop
    if (result.text) return;

    // Сheck the existence of paired items with same texture
    checkPossibleProgress(field, score, progress, moves, result);

    // Unlock field
    field.locked = false;
  }, 500);
}


// Func for hide clicked item and nearby items with same texture
function hideItems(field, item, isClickedItem, aloneItem, hiddenItems) {
  (function hideItemsRecursive(item, isClickedItem) {
    if (!isClickedItem) hideWithAnimation(item);

    const nearbyItems = {
      top: (item.row !== 0) ? field.children[item.column].children[item.row - 1] : null,
      right: (item.column !== field.size - 1) ? field.children[item.column + 1].children[item.row] : null,
      bottom: (item.row !== field.size - 1) ? field.children[item.column].children[item.row + 1] : null,
      left: (item.column !== 0) ? field.children[item.column - 1].children[item.row] : null
    };

    for (let key in nearbyItems) {
      if (nearbyItems[key] && !nearbyItems[key].hidden && nearbyItems[key].texture === item.texture) {
        if (isClickedItem && !item.hidden) {
          aloneItem.value = false;
          hideWithAnimation(item);
        } 

        hideItemsRecursive(nearbyItems[key]);
      } 
    }
  })(item, isClickedItem);

  function hideWithAnimation(item) {
    item.hidden = true;
    hiddenItems.value++;

    animate({
      duration: 200,
      action: 'hide',
      draw(animProgress, hidingItem) {
        hidingItem.width = field.itemSize.width * (1 - animProgress);
        hidingItem.height = field.itemSize.height * (1 - animProgress);
      }
    }, item);
  }
}


// Func for creating new items based on num of hidden items
function createItems(field, score, progress, moves, result) {
  for (let column = 0; column < field.size; column++) {
    let numOfNewItems = 0;

    for (let row = 0; row < field.size; row++) {
      if (field.children[column].children[row].hidden) {
        numOfNewItems++;
      }
    }

    for (let row = field.size; row < field.size + numOfNewItems; row++) {
      const item = new Item(column, row, field, score, progress, moves, result);
      field.children[column].addChild(item);
    }
  }
}


// Func for moving items
function moveItems(field) {
  for (let column = 0; column < field.size; column++) {
    let numOfMoves = 0;

    for (let row = 0; row < field.children[column].children.length; row++) {
      const item = field.children[column].children[row];

      if (item.hidden) {
        numOfMoves++;
      } else {
        if (numOfMoves) {
          // Set new row value of moving item
          item.row -= numOfMoves;

          animate({
            duration: 500,
            action: 'move',
            draw(animProgress, movingItem, initY, numOfMoves) {
              movingItem.y = initY + field.itemSize.height * numOfMoves * animProgress;
            }
          }, item, item.y, numOfMoves);
        }
      }
    }
  }
}


// Func for removing hidden items
function removeHiddenItems(field) {
  for (let column = 0; column < field.size; column++) {
    for (let row = field.size - 1; row >= 0; row--) {
      if (field.children[column].children[row].hidden) {
        field.children[column].removeChild(field.children[column].children[row]);
      }
    }
  }
}


// Func for checking the existence of paired items with same texture
export function checkPossibleProgress(field, score, progress, moves, result) {
  for (let column = 0; column < field.size; column++) {
    for (let row = 0; row < field.size; row++) {
      const item = field.children[column].children[row];

      const nearbyItems = {
        top: (item.row !== 0) ? field.children[item.column].children[item.row - 1] : null,
        right: (item.column !== field.size - 1) ? field.children[item.column + 1].children[item.row] : null,
        bottom: (item.row !== field.size - 1) ? field.children[item.column].children[item.row + 1] : null,
        left: (item.column !== 0) ? field.children[item.column - 1].children[item.row] : null
      };

      for (let key in nearbyItems) {
        // If possible, finish searching for paired items
        if (nearbyItems[key] && nearbyItems[key].texture === item.texture) return;
      }
    }
  }

  // If no pair of items
  shuffleItems(field, score, progress, moves, result);
}


// Func for shuffling items
function shuffleItems(field, score, progress, moves, result) {
  
  if (!field.numOfShuffles) return levelLost(field, result, 'Нет перемешиваний');
  field.numOfShuffles--;
  
  // Remove all current items
  field.removeChildren();

  // Add new items
  field.addChild(...Items(field, score, progress, moves, result));

  // Recursive check
  checkPossibleProgress(field, score, progress, moves, result);
}


// Func for changing score
function changeScore(score, hiddenItems) {
  score.text = +score.text + Math.pow(hiddenItems.value, 2);
}


// Func for changing progress
function changeProgress(score, progress) {
  (function changeProgressWithAnimation() {
    animate({
      duration: 500,
      action: 'change',
      draw(animProgress, progress, prevValue) {
        progress.value = +(prevValue + (+score.text / score.target * 100 - prevValue) * animProgress).toFixed(1);
        if (progress.value > 100) progress.value = 100;
        progress.change(progress);
      }
    }, progress, progress.value);
  })();
}


// Func for check game end
function checkGameState(field, score, moves, result) {
  if (+score.text >= score.target) {
    levelWon(field, score, moves, result);

  } else if (!+moves.text) {
    levelLost(field, result, 'Попробуй ещё раз');
  }
}


// Level passed
function levelWon(field, score, moves, result) {
  if (level.value < config.levels.length - 1) {
    field.removeChildren();
    result.text = 'Уровень пройден!';

    const interval = setInterval(() => {
      if (+moves.text) {
        score.text = +score.text + 500;
        moves.text--;
      } else {
        clearInterval(interval);
        Navigation.toggleVisibility(true);
      }
    }, 100);
  } else {
    field.removeChildren();
    result.text = 'Ты прошел игру!'
  }
}


// Level failed
function levelLost(field, result, phrase) {
  field.removeChildren();
  result.text = phrase;
  Navigation.toggleVisibility(false);
}


// Go to the next level
export function nextLevel(result) {
  level.value++;
  createNewLevel();
}


// Replay current level
export function replayLevel() {
  createNewLevel();
}
