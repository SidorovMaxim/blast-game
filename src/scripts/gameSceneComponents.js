import * as PIXI from 'pixi.js';
import config from '../configs/config.json';
import { handleClick } from './handlers.js';
import { checkPossibleProgress } from './controllers.js';

import red      from '../assets/boxes/red.png';
import blue     from '../assets/boxes/blue.png';
import green    from '../assets/boxes/green.png';
import purple   from '../assets/boxes/purple.png';
import yellow   from '../assets/boxes/yellow.png';



// Init PIXI aliases
let Container   = PIXI.Container,
    loader      = PIXI.Loader.shared,
    Texture     = PIXI.Texture,
    Sprite      = PIXI.Sprite,
    Text        = PIXI.Text,
    TextStyle   = PIXI.TextStyle;

// Init items images
export const boxes = [blue, green, purple, red, yellow];

// Init wondow sizes
export const windowSizes = {
  window_width: window.innerWidth,
  window_height: window.innerHeight,
  window_aspect_ratio: +(window.innerWidth / window.innerHeight).toFixed(3)
}

// Init ratio
let ratio = +((windowSizes.window_aspect_ratio > 1) ?
              (windowSizes.window_width / config.screen.width_default) :
              (windowSizes.window_height / config.screen.height_default)).toFixed(3);

// Init first level
let level = 0;



// Func for creating game scene background
export function sceneBackground(bgImg) {
  const background = new Sprite(loader.resources[bgImg].texture);

  background.scale.set(ratio);
  background.x = 0;
  background.y = 0;

  return background;
}


// Func for creating game scene headers
export function sceneHeaders() {
  const headersText = [
    {
      text: 'ПРОГРЕСС',
      position: {x: 875, y: 25}
    },
    {
      text: 'ХОДЫ:',
      position: {x: 1500, y: 260}
    },
    {
      text: 'ОЧКИ:',
      position: {x: 1500, y: 670}
    }
  ];

  const headerStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 40 * ratio,
    fill: 'white'
  });

  let headers = [];
  for (let i = 0; i < headersText.length; i++) {
    const header = new Text(headersText[i].text, headerStyle);
    header.x = headersText[i].position.x * ratio;
    header.y = headersText[i].position.y * ratio;
    header.anchor.set(.5);
    headers.push(header);
  }

  return headers;
}


// Func for creating result component
export function Result() {

  // Create result component
  const resultContainer = new Container();
  resultContainer.x = config.result.position_default.x * ratio;
  resultContainer.y = config.result.position_default.y * ratio;

  // Create result text style
  const resultStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 115 * ratio,
    fill: 'white'
  });

  // Create result text
  const result = new Text('', resultStyle);
  result.anchor.set(.5);
  resultContainer.addChild(result);

  return {result, resultContainer};
}


// Func for creating moves component
export function Moves() {

  // Create moves container
  const movesContainer = new Container();
  movesContainer.x = config.moves.position_default.x * ratio;
  movesContainer.y = config.moves.position_default.y * ratio;

  // Create moves text style
  const movesStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 115 * ratio,
    fill: 'white'
  });

  // Create moves text
  const moves = new Text(config.levels[level].moves, movesStyle);
  moves.anchor.set(.5);
  movesContainer.addChild(moves);

  return {moves, movesContainer};
}


// Func for creating score component
export function Score() {

  // Create score container
  const scoreContainer = new Container();
  scoreContainer.x = config.score.position_default.x * ratio;
  scoreContainer.y = config.score.position_default.y * ratio;

  // Create score text style
  const scoreStyle = new TextStyle({
    fontFamily: 'Marvin',
    fontSize: 80 * ratio,
    fill: 'white'
  });

  // Create score text
  const score = new Text('0', scoreStyle);
  score.target = config.levels[level].score;
  score.anchor.set(.5);
  scoreContainer.addChild(score);

  return {score, scoreContainer};
}


// Func for creating progress component
export function Progress() {

  // Create progress container
  const progressContainer = new Container();
  progressContainer.x = config.progress.position_default.x * ratio;
  progressContainer.y = config.progress.position_default.y * ratio;

  // Init progress
  const progress = {value: 0};

  // Change progress
  Progress.change = function(progress) {

    // Create progress canvas
    function progressCanvas(progress) {
      progress.value = Math.round(636 * progress.value / 100);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext("2d");
      canvas.width  = 44 + progress.value;
      canvas.height = 44;

      const gradient = ctx.createLinearGradient(0, 44, 0, 0);
      gradient.addColorStop(0,    'rgb(96,255,0)');
      gradient.addColorStop(0.32, 'rgb(29,155,0)');
      gradient.addColorStop(0.77, 'rgb(162,255,0)');
      gradient.addColorStop(0.91, 'rgb(199,255,102)');
      gradient.addColorStop(1,    'rgb(236,255,204)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(22, 22, 22, (Math.PI/180)*90, (Math.PI/180)*270);
      ctx.fill();
      ctx.fillRect(22, 0, progress.value, 44);
      ctx.beginPath();
      ctx.arc(22+progress.value, 22, 22, (Math.PI/180)*270, (Math.PI/180)*90);
      ctx.fill();

      return canvas;
    }

    // Create progress texture
    const progressTexture = new Texture.from(progressCanvas(progress));

    // Create progress
    progress = new Sprite(progressTexture);
    progress.scale.set(ratio);
    progress.change = Progress.change;
    progressContainer.addChild(progress);

    return progress;
  }

  return {progress: Progress.change(progress), progressContainer};
}


// Func for creating new game field item
export function Item(column, row, field, score, progress, moves, result) {

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
  item.on('pointerdown', handleClick.bind(null, field, score, progress, moves, result));

  return item;
}


// Func for creating new game field items
export function Items(field, score, progress, moves, result) {
  let items = [];

  for (let column = 0; column < field.size; column++) {
    const fieldColumn = new Container();

    for (let row = 0; row < field.size; row++) {
      const item = new Item(column, row, field, score, progress, moves, result);
      fieldColumn.addChild(item);
    }

    items.push(fieldColumn);
  }

  return items;
}


// Func for creating new game field
export function Field(score, progress, moves, result) {
  const field = new Container();
  field.x = config.field.position_default.x * ratio;
  field.y = config.field.position_default.y * ratio;

  field.size = config.levels[level].field.size;
  field.size_default = config.field.size_default;

  field.numOfColors = config.levels[level].field.numOfColors;
  field.sizeRatio = field.size_default / field.size;
  field.itemSize = {
    width: config.item.width_default * ratio * field.sizeRatio,
    height: config.item.height_default * ratio * field.sizeRatio
  }

  // Add new items on game field
  field.addChild(...Items(field, score, progress, moves, result));

  // Сheck the existence of paired items with same texture
  checkPossibleProgress(field, score, progress, moves, result);

  return field;
}
