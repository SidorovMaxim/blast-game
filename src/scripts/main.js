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

  // Create moves component
  const { moves, movesContainer } = Moves();
  gameScene.addChild(movesContainer);

  // Create score component
  const { score, scoreContainer } = Score();
  gameScene.addChild(scoreContainer);

  // Create progress component
  const { progress, progressContainer } = Progress();
  gameScene.addChild(progressContainer);

  // Create game field
  const field = new Field(score, moves, result);
  gameScene.addChild(field);
}
