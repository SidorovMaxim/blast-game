import '../main.css';
import * as PIXI  from 'pixi.js';
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

