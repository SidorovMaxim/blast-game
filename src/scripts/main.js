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

  // Create scene headers
  gameScene.addChild(...sceneHeaders());

  // Create result component
  const { result, resultContainer } = Result();
  gameScene.addChild(resultContainer);

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
