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

const window_width = window.innerWidth;
const window_height = window.innerHeight;
const window_aspect_ratio = window_width / window_height;

let ratio = +((window_aspect_ratio > 1) ?
              (window_width / config.screen.width_default) :
              (window_height / config.screen.height_default)).toFixed(3);

let app = new Application({
  width:  (window_aspect_ratio > 1) ? (window_width) :
          (window_height * config.screen.aspectRatio),
  height: (window_aspect_ratio <= 1) ? (window_height) :
          (window_width / config.screen.aspectRatio),
  backgroundColor: '0xb3b3b3',
  antialias: true
});

document.body.appendChild(app.view);


loader
  .add(bgImg)
  .add(boxes)
  .load(newGame);

// Start new game
function newGame() {

  // Create game scene
  const gameScene = new Container();
  app.stage.addChild(gameScene);

  // Create game scene background
  gameScene.addChild(sceneBackground(bgImg));

  // Create headers text
  const headers = [
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

  for (let i = 0; i < headers.length; i++) {
    const header = new Text(headers[i].text, headerStyle);
    header.x = headers[i].position.x * ratio;
    header.y = headers[i].position.y * ratio;
    header.anchor.set(.5);
    gameScene.addChild(header);
  }


  // Create result container
  const resultContainer = new Container();
  resultContainer.x = config.result.position_default.x * ratio;
  resultContainer.y = config.result.position_default.y * ratio;
  gameScene.addChild(resultContainer);

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


  // Create moves container
  const movesContainer = new Container();
  movesContainer.x = config.moves.position_default.x * ratio;
  movesContainer.y = config.moves.position_default.y * ratio;
  gameScene.addChild(movesContainer);

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


  // Create score container
  const scoreContainer = new Container();
  scoreContainer.x = config.score.position_default.x * ratio;
  scoreContainer.y = config.score.position_default.y * ratio;
  gameScene.addChild(scoreContainer);

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


  // Create game field
  const field = new Field(score, moves, result);
  gameScene.addChild(field);
}
