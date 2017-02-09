//  ---------------------------------------------------------------------------------
//  Copyright (c) Microsoft Corporation.  All rights reserved.
// 
//  The MIT License (MIT)
// 
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
// 
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
// 
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//  ---------------------------------------------------------------------------------



//  ---------------------------------------------------------------------------------
// GetStarted - JavaScript 2D Game demo
// This is a simple game written is JavaScript, with the CreateJS library, to demonstrate
// how to quickly write a UWP game that is ready for publishing to the Store. The user
// controls a dinosaur who much jumped over incoming rolling boxes. For.. reasons.
// Some features are currenly commented out. Please see the accompanying README file
// for guidance.
//  ---------------------------------------------------------------------------------




// The canvas and stage are where our sprites are displayed. The canvas is defined in
// the index.html file, and the stage is an EaselJS object.
var canvas, stage, loader;

// Used to keep track of the current window size.
var width, height;

// Sprite objects
var dino_walk, dino_stand, dino_lying;

// Shapes
var sky, grass;

// Bitmap objects
var barrel, cloud = [];

// Text
var scoreText;

// Variables used to store state.
var dy, score = 0, jumping = false;

// Game state management.
GameStateEnum = {
    Ready: 0,
    Playing: 1,
    GameOver: 2
}
var GameState = GameStateEnum.Ready;


// This method is called to start the game.
// It creates the various game objects, adds them to the stage, and kicks off
// a gameLoop() called by a timer.

init();


function init() {

    // This method creates the various objects that exist in the game, including the 'stage'
    // which is where the sprite objects are displayed. It's called once, at the start of
    // the app.

    // Get a reference to the canvas object, and create the stage.
    canvas = document.getElementById("gameCanvas");
    stage = new createjs.Stage("gameCanvas");

    // Some sky for the background.
    sky = new createjs.Shape();
    sky.graphics.beginFill("DeepSkyBlue");

    // Some grass background shapes.
    grass = new createjs.Shape();
    grass.graphics.beginFill("Green");

    // Text to display the score and other messages.
    scoreText = new createjs.Text("Score: 00000", "42px Arial", "#ffffff");

    // Add these objects to the stage so they are visible.
    stage.addChild(sky, grass, scoreText);

    // For images that we are loading, we need to do something special and 
    // create a special handler. EaselJS helps us with this.
    // First we make a list of all images that should be loaded..
    manifest = [
		{ src: "walkingDino-SpriteSheet.png", id: "dino" },
		{ src: "barrel.png", id: "barrel" },
	//	{ src: "fluffy-cloud-small.png", id: "cloud" },
    ];

    // Now we create a special queue, and finally a handler that is
    // called when they are loaded. The queue object is provided by preloadjs.

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", loadingComplete);
    loader.loadManifest(manifest, true, "../images/");
}


function loadingComplete() {

    // Images have been loaded at this point, so we can continue.

    // Create some clouds to drift by..
    /*
    for (var i = 0; i < 3; i++) {
        cloud[i] = new createjs.Bitmap(loader.getResult("cloud"));
        cloud[i].x = Math.random()*1024;
        cloud[i].y = 64 + i * 48;
        stage.addChild(cloud[i]);
    }
   */

    // Define the animated dino walk using a spritesheet of images,
    // and also a standing still state, and a knocked-over state.
    var data = {
        images: [loader.getResult("dino")],
        frames: { width: 373, height: 256 },
        animations: {
            stand: 0,
            lying: {
                frames: [0, 1],
                speed: 0.1
            },
            walk: {
                frames: [0, 1, 2, 3, 2, 1],
                speed: 0.4
            }
        }
    }

    var spriteSheet = new createjs.SpriteSheet(data);
    dino_walk = new createjs.Sprite(spriteSheet, "walk");
    dino_stand = new createjs.Sprite(spriteSheet, "stand");
    dino_lying = new createjs.Sprite(spriteSheet, "lying");
    dino_lying.skewX = -50; // Make the dino lie down.
    stage.addChild(dino_walk, dino_stand, dino_lying);

    // Create an obsticle the dino must jump over.
    barrel = new createjs.Bitmap(loader.getResult("barrel"));
    barrel.regX = 32;
    barrel.regY = 32;
    barrel.x = width + 100;  // Move the obstical to the edge of the screen, and a little further.
    stage.addChild(barrel);

    // Now position everything according to the current window dimensions.
    resizeGameWindow();

    // Set up the game loop and keyboard handler.
    // The keyword 'tick' is required to automatically animated the sprite.
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", gameLoop);

    // This code will call the method 'keyboardPressed' is the user presses a key.
    // this.document.onkeydown = keyboardPressed;

    // Add support for mouse clicks
    //stage.on("stagemousedown", mouseClicked);

    // This code makes the app call the method 'resizeGameWindow' if the user resizes the current window.
    // window.addEventListener('resize', resizeGameWindow);
}


function resizeGameWindow() {

    // Get the current width and height of the view, and resize and position everything accordingly.
    // This method is also called once at the start of the app to put everything in an initial position.

    width = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().visibleBounds.width;
    height = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().visibleBounds.height;

    canvas.width = width;
    canvas.height = height;
    stage.setBounds(0, 0, width, height);

    scoreText.x = width / 2 - 100;
    scoreText.y = 16;

    sky.graphics.drawRect(0, 0, width, height / 2);
    sky.x = 0;
    sky.y = 0;

    grass.graphics.drawRect(0, 0, width, height / 2);
    grass.x = 0;
    grass.y = height / 2;

    dino_walk.x = 100;
    dino_walk.y = height / 2 - 100;

    dino_stand.x = dino_walk.x;
    dino_stand.y = height / 2 - 100;

    dino_lying.x = dino_walk.x - 75;
    dino_lying.y = dino_walk.y + 75;

    barrel.y = height / 2 + 100;
}


function gameLoop() {

    // This method is called 25 times a second, and it is where the object positions
    // are updated, and the keyboard is checked. It looks at the GameState to decide
    // what to do - i.e. in the Ready state, it only displays a 'press space'
    // message. In the Playing state the dinosaur is running. In the GameOver state
    // the dinosaur is lying down.

    switch (GameState) {
        // The game state defines what should be happening at each
        // stage of the game.

        case GameStateEnum.Ready:
            {
                // This is the 'get ready to play' screen.
                scoreText.text = "Press Space!";
                barrel.x = width + 100;
                jumping = false;
                dino_walk.y = height / 2 - 100;
                score = 0;
                dino_stand.visible = true;
                dino_walk.visible = false;
                dino_lying.visible = false;
                break;
            }

        case GameStateEnum.Playing:
            {
                // This is where the main game action happens.

                dino_stand.visible = false;
                dino_walk.visible = true;

                // Display the score
                scoreText.text = "Score: " + score.toString();

                // Move the obsticle across the screen, rolling as it goes.
                barrel.rotation = barrel.x;
                barrel.x -= (8 + score); // The barrel moves faster the more points you have!
                if (barrel.x < 0) {
                    barrel.x = width + Math.random() * 200;
                    score++;
                }

                // Handle moving the dino up and down if the player is making it jump.
                jumpingDino();

                // Very simple check for collision between dino and barrel
                if ((barrel.x > 220 && barrel.x < 380)
                    &&
                    (!jumping)) {
                    barrel.x = 380;
                    GameState = GameStateEnum.GameOver;
                }

                break;
            }

        case GameStateEnum.GameOver:
            {
                // The game over state.

                // Hide the walking sprite, display the fallen over sprite.
                dino_walk.visible = false;
                dino_lying.visible = true;
                scoreText.text = "Game Over. Score: " + score.toString();
                break;
            }
    }

    // Move clouds
    //animate_clouds();

    // Redraw all the object in new positions.
    stage.update();
}


function jumpingDino() {

    // Make the dino move up and down the screen, if the user has pressed the space bar.

    if (jumping) {
        dino_walk.y += dy;
        if (dy < 0) {
            dy = dy / 1.1;
            if (dy > -2) dy = 2;
        }
        else {
            dy = dy * 1.2;
            if (dino_walk.y > height / 2 - 100) {
                jumping = false;
                dino_walk.y = height / 2 - 100;
            }
        }
    }
}

function mouseClicked() {
    // The mouse click handler. Call the same code that is called if the user
    // presses the Space Bar.

    userDidSomething();
}

function keyboardPressed(event) {

    // The player has pressed a key, and if they have pressed Space, and the dino
    // isn't currently jumping, make it start jump.

    if (event.keyCode == 32) {  // 32 is the code for the Space Bar
        userDidSomething();
    }
}

function userDidSomething() {
    // This is called when the user either clicks with the mouse,
    // or presses the Space Bar.

    if (GameState == GameStateEnum.Playing) {
        if (jumping == false) {
            jumping = true;
            dy = -12;
        }
    }

    if (GameState == GameStateEnum.Ready) {
        GameState = GameStateEnum.Playing;
    }

    if (GameState == GameStateEnum.GameOver) {
        GameState = GameStateEnum.Ready;
    }
}

function animate_clouds() {
    // Move the cloud sprites across the sky. If they get to the left edge, 
    // move them over to the right.

    for (var i = 0; i < 3; i++) {
        cloud[i].x = cloud[i].x - (i + 1);
        if (cloud[i].x < -128)
            cloud[i].x = width + 128;
    }
}

