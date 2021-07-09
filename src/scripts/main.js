import '../main.css';
import * as PIXI from 'pixi.js';
import config from '../configs/config.json';
import nextLevelImg from '../assets/buttons/next-level.png';
import replayLevelImg from '../assets/buttons/replay-level.png';
import bgImg from '../assets/backgrounds/background.png';
import { boxes, windowSizes,
         sceneBackground, sceneHeaders,
         Moves, Score, Progress, Field, Result, Navigation }  from './gameSceneComponents.js';


// Init PIXI aliases
const Application     = PIXI.Application,
    Container       = PIXI.Container,
    loader          = PIXI.Loader.shared;

// Init PIXI app
export const app = new Application({
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
  .add(replayLevelImg)
  .add(nextLevelImg)
  .load(createNewLevel);


// Create new game level
export function createNewLevel() {
  app.stage.removeChildren();
  app.stage.addChild(new GameScene());
}


// New game scene
function GameScene() {

  // Create game scene container
  const gameScene = new Container();

  // Create game scene background
  gameScene.addChild(sceneBackground(bgImg));

  // Create scene headers
  gameScene.addChild(...sceneHeaders());

  // Create moves component
  const { moves, movesContainer } = new Moves();
  gameScene.addChild(movesContainer);

  // Create score component
  const { score, scoreContainer } = new Score();
  gameScene.addChild(scoreContainer);

  // Create progress component
  const { progress, progressContainer } = new Progress();
  gameScene.addChild(progressContainer);

  // Create result component
  const { result, resultContainer } = new Result();
  gameScene.addChild(resultContainer);

  // Create navigation component
  const { navigation, navigationContainer } = new Navigation(result, replayLevelImg, nextLevelImg);
  gameScene.addChild(navigationContainer);

  // Create game field
  const field = new Field(score, progress, moves, result, navigation);
  gameScene.addChild(field);

  return gameScene;
}


