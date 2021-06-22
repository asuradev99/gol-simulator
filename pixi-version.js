import * as PIXI from "pixi.js"
import {Viewport} from "pixi-viewport"

const app = new PIXI.Application({
	autoResize: true,
    resolution: devicePixelRatio, 
    transparent: true
});

document.body.appendChild(app.view);

window.addEventListener('resize', resize);


const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,

    interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

app.stage.addChild(viewport)
viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()

// add a red box
let container =  new PIXI.ParticleContainer({
    scale: true,
    uve: true, 
    alpha: true
}); 
//viewport.addChild(container);
viewport.addChild(container);
var graphics = new PIXI.Graphics();
graphics.beginFill(0xFFF);
graphics.drawCircle(1, 1, 1);
graphics.endFill();
var texture = app.renderer.generateTexture(graphics);

var graphics2 = new PIXI.Graphics();
graphics2.beginFill(0xFFFF);
graphics2.drawCircle(1, 1, 1);
graphics2.endFill();
var texture2 = app.renderer.generateTexture(graphics2);
let sprites = [];
for (var j = 0; j < 1000; j++) {
    for (var i = 0; i < 1000; i++) {
        //for (var j = 0; i < 10; j++) {
            const sprite = container.addChild(new PIXI.Sprite(texture2))
           // sprite.tint = Math.random() * 1000;
            sprite.width = sprite.height = 1
            sprite.position.set(i * 0.5 , j * 0.5)
            sprite.interactive=true;
            //sprite.on('click', () => {
            //    sprite.tint = 0xffffff;
            //});            
            sprites.push(sprite);
            //console.log(i,j)
        //}
    }
}

let tick = 0;
app.ticker.add(() => {
    for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i];
        if (Math.random() < 0.5) {
            sprite.texture = texture;
        } else {
            sprite.texture = texture2;
        }
    }

    tick += 1;
})
sprites[1]
function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight, viewport.worldWidth, viewport.worldHeight)
}

resize();
