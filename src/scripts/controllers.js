import animate from './animate.js';
import { createNewLevel } from './main.js';
import config from '../configs/config.json';
import { Item, Navigation, level } from './gameSceneComponents.js';


// Func for changing game field if player clicked on any item
export function changeGameScene(field, score, progress, moves, result, item) {
  let aloneItem = true;
  let hiddenItems = 0;

  // Hide clicked item and nerby items with same texture
  hideItems(field, item, {isClickedItem: true});

  // Unlocked field and interrupt if only one item
  if (aloneItem) {
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
    createItems(field, score, moves, result);

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
      checkPossibleProgress(field, score, moves, result);

      // Unlock field
      field.locked = false;
    }, 500);


  function hideItems(field, item, isClickedItem) {
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
            aloneItem = false;
            hideWithAnimation(item);
          } 

          hideItemsRecursive(nearbyItems[key]);
        } 
      }
    })(item, isClickedItem);

    function hideWithAnimation(item) {
      item.hidden = true;
      hiddenItems++;

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


  function createItems(field, score, moves, result) {
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


  function removeHiddenItems(field) {
    for (let column = 0; column < field.size; column++) {
      for (let row = field.size - 1; row >= 0; row--) {
        if (field.children[column].children[row].hidden) {
          field.children[column].removeChild(field.children[column].children[row]);
        }
      }
    }
  }
}


// Func for checking the existence of paired items with same texture
export function checkPossibleProgress(field, score, moves, result) {
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
  (function shuffleItems(field) {
    // Remove all current items
    field.removeChildren();

    // Add new items
    field.addChild(...Items(field, score, moves, result));

    // Recursive check
    checkPossibleProgress(field, score, moves, result);
  })(field);
}


function changeScore(score, hiddenItems) {
  score.text = +score.text + Math.pow(hiddenItems, 2);
}


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


function checkGameState(field, score, moves, result) {
  if (+score.text >= score.target) {
    field.removeChildren();
    result.text = 'Уровень пройден!';

    const interval = setInterval(() => {
      if (+moves.text) {
        score.text = +score.text + 500;
        moves.text--;
      } else {
        clearInterval(interval);
        changeLevel(result);
      }
    }, 100);

  } else if (!+moves.text) {
    field.removeChildren();
    result.text = 'Попробуй ещё раз';
  }
}


function changeLevel(result) {
  if (level.value < config.levels.length - 1) {
    level.value++;
    createNewLevel();
  } else {
    result.text = 'Ты прошел игру!'
  }
}