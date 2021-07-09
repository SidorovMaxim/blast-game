import '../main.css';
import * as PIXI from 'pixi.js';
import config from '../configs/config.json';
import bgImg from '../assets/backgrounds/background.png';
import { boxes, windowSizes,
         sceneBackground, sceneHeaders,
         Result, Moves, Score, Progress, Field }  from './gameSceneComponents.js';


// Init PIXI aliases
let Application     = PIXI.Application,
    Container       = PIXI.Container,
    loader          = PIXI.Loader.shared;

// Init PIXI app
let app = new Application({
  width:  (windowSizes.window_aspect_ratio > 1) ? (windowSizes.window_width) :
          (windowSizes.window_height * config.screen.aspectRatio),
  height: (windowSizes.window_aspect_ratio <= 1) ? (windowSizes.window_height) :
          (windowSizes.window_width / config.screen.aspectRatio),
  backgroundColor: '0xb3b3b3',
  antialias: true
});
document.body.appendChild(app.view);

// Init PIXI loader
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
  const field = new Field(score, progress, moves, result);
  gameScene.addChild(field);
}
