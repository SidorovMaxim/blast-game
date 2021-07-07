import '../main.css';
import * as PIXI  from 'pixi.js';
import animate    from './animate.js';
import config     from '../configs/config.json';
import bgImg      from '../assets/backgrounds/background.png';
import blue       from '../assets/boxes/blue.png';
import green      from '../assets/boxes/green.png';
import purple     from '../assets/boxes/purple.png';
import red        from '../assets/boxes/red.png';
import yellow     from '../assets/boxes/yellow.png';


const boxes = [blue, green, purple, red, yellow];


let Application     = PIXI.Application,
    Container       = PIXI.Container,
    loader          = PIXI.Loader.shared,
    AnimatedSprite  = PIXI.AnimatedSprite,    
    Sprite          = PIXI.Sprite,
    Text            = PIXI.Text,
    TextStyle       = PIXI.TextStyle;


const HEIGHT_DEFAULT = 1357;
const ASPECT_RATIO = 1.41;

let windowHeight = window.innerHeight;
let ratio = +(windowHeight / HEIGHT_DEFAULT).toFixed(3);


let app = new Application({
  width: windowHeight * ASPECT_RATIO,
  height: windowHeight,
  backgroundColor: '0xb3b3b3'
});

document.body.appendChild(app.view);

loader
  .add(bgImg)
  .add(boxes)
  .load(setup);


// Start new game
function setup() {

  // Create game scene
  const gameScene = new Container();
  app.stage.addChild(gameScene);


  // Create game scene background
  const bg = new Sprite(loader.resources[bgImg].texture);
  bg.scale.set(ratio);
  bg.x = 0;
  bg.y = 0;
  gameScene.addChild(bg);


  // Create headers text
  const headers = [
    {
      text: 'ПРОГРЕСС',
      position: {x: 786, y: 5}
    },
    {
      text: 'ХОДЫ:',
      position: {x: 1430, y: 240}
    },
    {
      text: 'ОЧКИ:',
      position: {x: 1430, y: 650}
    }
  ];

  const headerStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 40 * ratio,
    fill: 'white'
  });

  for (let i = 0; i < headers.length; i++) {
    const header = new Text(headers[i].text, headerStyle);
    header.x = headers[i].position.x * ratio;
    header.y = headers[i].position.y * ratio;
    gameScene.addChild(header);
  }


  // Create score container
  const scoreContainer = new Container();
  scoreContainer.width = config.score.width_default;
  scoreContainer.x = config.score.position_default.x * ratio;
  scoreContainer.y = config.score.position_default.y * ratio;
  gameScene.addChild(scoreContainer);

  // Create score text
  const scoreStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 80 * ratio,
    fill: 'white'
  });

  const score = new Text('0', scoreStyle);
  score.anchor.set(.5);
  score.x = -score.width / 2;
  score.x = -score.height / 2;
  scoreContainer.addChild(score);


  // Create game field
  const field = new Field(score);
  gameScene.addChild(field);
}


// Handlers
function handleClick(field, score, event) {
  if (!field.locked) {
    // Lock field
    field.locked = true;

    // Change field based on clicked item
    changeField(field, score, event.target);
  }
}


// Func for creating new game field item
function Item(column, row, field, score) {

  // Get random item
  const itemColor = boxes[Math.floor(Math.random() * field.numOfColors)];

  // Create sprite
  const item = new Sprite(loader.resources[itemColor].texture);

  item.column = column;
  item.row = row;

  item.scale.set(config.item.width_default / item.width * ratio * field.sizeRatio);
  item.x = field.itemSize.width * (column + 0.5);
  item.y = field.itemSize.height * (field.size - 1 - row + 0.5);
  item.anchor.set(.5);

  item.interactive = true;
  item.buttonMOde = true;
  item.on('pointerdown', handleClick.bind(null, field, score));

  return item;
}


// Func for creating new game field
function Field(score) {
  const field = new Container();
  field.x = config.field.position_default.x * ratio;
  field.y = config.field.position_default.y * ratio;

  field.size = config.field.size;
  field.size_default = config.field.size_default;

  field.numOfColors = config.field.numOfColors;
  field.sizeRatio = field.size_default / field.size;
  field.itemSize = {
    width: config.item.width_default * ratio * field.sizeRatio,
    height: config.item.height_default * ratio * field.sizeRatio
  }

  // Add new items on game field
  field.addChild(...Items(field, score));

  return field;
}


// Func for creating new game field items
function Items(field, score) {
  let items = [];

  for (let column = 0; column < field.size; column++) {
    const fieldColumn = new Container();

    for (let row = 0; row < field.size; row++) {
      const item = new Item(column, row, field, score);
      fieldColumn.addChild(item);
    }

    items.push(fieldColumn);
  }

  return items;
}


// Func for changing game field if player clicked on any item
function changeField(field, score, item) {
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

    // Calculate score based on num of hidden items
    calculateScore(score, hiddenItems);

    // Create new items based on num of hidden items in each column
    createItems(field, score);

    // Move items with empty space below in them column
    moveItems(field);

    setTimeout(() => {
      // Remove hidden items when animation is over
      removeHiddenItems(field);

      // 
      checkPossibleProgress(field);
    }, 200);

    // Unlock field
    setTimeout(() => {
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
        draw(progress, hidingItem) {
          hidingItem.width = field.itemSize.width * (1 - progress);
          hidingItem.height = field.itemSize.height * (1 - progress);
        }
      }, item);
    }
  }


  function calculateScore(score, hiddenItems) {
    score.text = +score.text + Math.pow(hiddenItems, 2);
  }


  function createItems(field, score) {
    for (let column = 0; column < field.size; column++) {
      let numOfNewItems = 0;

      for (let row = 0; row < field.size; row++) {
        if (field.children[column].children[row].hidden) {
          numOfNewItems++;
        }
      }

      for (let row = field.size; row < field.size + numOfNewItems; row++) {
        const item = new Item(column, row, field, score);
        field.children[column].addChild(item);
      }
    }
  }


  function moveItems() {
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
              draw(progress, movingItem, initY, numOfMoves) {
                movingItem.y = initY + field.itemSize.height * numOfMoves * progress;
              }
            }, item, item.y, numOfMoves);
          }
        }
      }
    }
  }
  
  
  function checkPossibleProgress(field) {
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

    // No pair of items
    console.log('new field');
    field = new Field(score);
    
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