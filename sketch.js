// All assets from https://www.kenney.nl/assets/

const SCENE_TITLE = 0;
const SCENE_PLAY = 1;
const SCENE_GAME_OVER = 2;

const STAR_COUNT = 100;
const STAR_COLOUR_LOW = '#d2cfcf';

const PLAYER_WIDTH = 70;
const PLAYER_HEIGHT = 70;
const PLAYER_SPEED = 2;
let PLAYER_RIGHT;
let PLAYER_LEFT;
let PLAYER_UP;
let PLAYER_DOWN;
let PLAYER_SHOOT;
let PLAYER_QUIT;
let PLAYER_START;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 40;
const BULLET_COLOUR = '#a5ecf1';
const BULLET_SPEED = 2;

const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const ENEMY_SPEED = 1.5;
const ENEMY_BULLET_WIDTH = 9;
const ENEMY_BULLET_HEIGHT = 30;
const ENEMY_BULLET_SPEED = 3;
const ENEMY_BULLET_COLOUR = '#f85300';

const BLAST_START_RADIUS = 1;
const BLAST_END_RADIUS = 30;
const BLAST_COLOUR_IN = '#fc9b23';
const BLAST_COLOUR_OUT = '#fc4423';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

let enemy_list = [];
let bullet_list = [];
let blast_list = [];
let enemy_ships_list = [];
let enemy_bullets_list = [];

let gameFlow;

let retroFont; // Font from Google fonts

// Variables for spaceships and laser bullets
let spaceshipImg;
let bulletImg;
let meteorImg;
let spaceshipEngineImg;
let yellowEnemyShip;
let pinkEnemyShip;
let greenEnemyShip;
let beigeEnemyShip;
let blueEnemyShip;
let enemyBulletImg;

// Variables for sounds
let playerLaserSound;
let enemyLaserSound;
let explosionSound;


function preload() {
    frameRate(30);
    gameFlow = new GameFlow();
    // Loading font
    retroFont = loadFont('assets/fonts/PressStart2P-Regular.ttf');
    // Loading images
    spaceshipImg = loadImage('assets/img/playerShip1_blue.png');
    bulletImg = loadImage('assets/img/laserBlue03.png');
    meteorImg = loadImage('assets/img/meteorGrey_tiny2.png');
    spaceshipEngineImg = loadImage('assets/img/fire03.png');
    yellowEnemyShip = loadImage('assets/img/shipYellow_manned.png');
    pinkEnemyShip = loadImage('assets/img/shipPink_manned.png');
    greenEnemyShip = loadImage('assets/img/shipGreen_manned.png');
    beigeEnemyShip = loadImage('assets/img/shipBeige_manned.png')
    blueEnemyShip = loadImage('assets/img/shipBlue_manned.png');
    enemyBulletImg = loadImage('assets/img/laserGreen05.png');
    // Loading sounds
    playerLaserSound = loadSound('./assets/audio/laserRetro_000.ogg');
    enemyLaserSound = loadSound('./assets/audio/laserRetro_004.ogg');
    explosionSound = loadSound('./assets/audio/explosionCrunch_000.ogg');
}


function setup() {
    const c = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    c.parent('app');
    frameRate(60);
    textFont(retroFont);
    // Setting the initial enemy ship to be drawn
    enemy_ships_list.push(yellowEnemyShip);
}


function draw() {
    gameFlow.update();
    gameFlow.draw();
}


function update_list(input_list) {
    for (let elem of input_list) {
        elem.update();
    }
}


function draw_list(input_list) {
    for (let elem of input_list) {
        elem.draw();
    }
}


function cleanup_list(input_list) {
    return input_list.filter(function (obj) {
        return obj.alive;
    });
}


// Constructor function for background
function Background() {
    this.starList = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        this.starList.push(
            [Math.random() * CANVAS_WIDTH,
                Math.random() * CANVAS_HEIGHT,
                Math.random() * 1.5 + 1]
        )
    }

    // Update stars
    this.update = function () {
        for (let i = 0; i < this.starList.length; i++) {
            let [x, y, speed] = this.starList[i];
            y += speed;
            if (y >= height) {
                y -= height;
            }
            this.starList[i] = [x, y, speed];
        }
    }

    // Draw background and stars
    this.draw = function () {
        background('#000000');
        for (let star of this.starList) {
            let [x, y, speed] = star;
            if (speed > 1.8) {
                image(meteorImg, x, y, 12, 12);
            } else {
                fill(STAR_COLOUR_LOW);
                ellipse(x, y, 7);
            }
        }
    }
}


// Constructor function for Player
function Player(x, y) {
    this.x = x;
    this.y = y;
    this.w = PLAYER_WIDTH;
    this.h = PLAYER_HEIGHT;
    this.alive = true;

    this.update = function () {
        if (PLAYER_LEFT) {
            this.x -= PLAYER_SPEED;
        }
        if (PLAYER_RIGHT) {
            this.x += PLAYER_SPEED;
        }
        if (PLAYER_UP) {
            this.y -= PLAYER_SPEED;
        }
        if (PLAYER_DOWN) {
            this.y += PLAYER_SPEED;
        }

        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, CANVAS_WIDTH - this.w);
        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, CANVAS_HEIGHT - this.h);

        if (PLAYER_SHOOT) {
            let newBullet = new Bullet
            (
                this.x + (PLAYER_WIDTH - BULLET_WIDTH) / 2,
                this.y - BULLET_HEIGHT / 2
            )
            newBullet.playLaserSound();
            PLAYER_SHOOT = false;
        }
    }

    this.draw = function () {
        image(spaceshipImg, this.x, this.y, this.w, this.h);
        image(spaceshipEngineImg, (this.x + this.w / 2 - 40), this.y + this.h, 80, 80);
    }
}


// Constructor function for Bullet
function Bullet(x, y) {
    this.x = x;
    this.y = y;
    this.w = BULLET_WIDTH;
    this.h = BULLET_HEIGHT;
    this.alive = true;

    bullet_list.push(this);

    this.update = function () {
        this.y -= BULLET_SPEED;
        if (this.y + this.h - 1 < 0) {
            this.alive = false;
        }
    }

    this.draw = function () {
        image(bulletImg, this.x, this.y, this.w, this.h);
        fill(BULLET_COLOUR);
        ellipse((this.x + this.w / 2), this.y, 10, 10);
    }

    // Function for Player laser bullets sound
    this.playLaserSound = function () {
        if (!playerLaserSound.isPlaying()) {
            playerLaserSound.play();
        }
    }
}


// Constructor function for Enemy Bullet
function EnemyBullet(x, y) {
    this.x = x;
    this.y = y;
    this.w = ENEMY_BULLET_WIDTH;
    this.h = ENEMY_BULLET_HEIGHT;
    this.alive = true;

    enemy_bullets_list.push(this);

    this.update = function () {
        this.y += ENEMY_BULLET_SPEED;
        if (this.y + 1 > CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    this.draw = function () {
        image(enemyBulletImg, this.x, this.y, this.w, this.h);
        fill(ENEMY_BULLET_COLOUR);
        ellipse((this.x + this.w / 2), this.y + this.h, 10, 10);
    }

    // Function for Enemy laser bullets sound
    this.playLaserSound = function () {
        if (!enemyLaserSound.isPlaying() && gameFlow.scene === SCENE_PLAY) {
            enemyLaserSound.play();
        }
    }
}


// Constructor function for enemy
function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.w = ENEMY_WIDTH;
    this.h = ENEMY_HEIGHT;
    this.alive = true;
    this.offset = parseInt('' + Math.random() * 60);
    this.image = enemy_ships_list[Math.floor(Math.random() * enemy_ships_list.length)];
    this.bulletFrameCount = parseInt('' + (Math.random() * 150 + 50));

    enemy_list.push(this);

    this.update = function () {
        if ((frameCount + this.offset) % 60 < 30) {
            this.x += ENEMY_SPEED;
        } else {
            this.x -= ENEMY_SPEED;
        }
        this.y += ENEMY_SPEED;

        if (this.y > CANVAS_HEIGHT - 1) {
            this.alive = false;
        }

        if (frameCount % this.bulletFrameCount === 0) {
            let newEnemyBullet = new EnemyBullet(this.x + this.w / 2, this.y + ENEMY_BULLET_HEIGHT / 2);
            newEnemyBullet.playLaserSound();
        }
    }

    this.draw = function () {
        // Select a random enemy ship to be drawn
        image(this.image, this.x, this.y, this.w, this.h)
    }
}


// Constructor function for blast
function Blast(x, y) {
    this.x = x;
    this.y = y;
    this.radius = BLAST_START_RADIUS;
    this.alive = true;

    blast_list.push(this);

    this.update = function () {
        this.radius += 1;
        if (this.radius > BLAST_END_RADIUS) {
            this.alive = false;
        }
    }

    this.draw = function () {
        fill(BLAST_COLOUR_OUT);
        ellipse(this.x, this.y, this.radius + 5);
        fill(BLAST_COLOUR_IN);
        ellipse(this.x, this.y, this.radius)
    }

    this.playExplosionSound = function () {
        if (!explosionSound.isPlaying()) {
            explosionSound.play();
        }
    }
}


// Function for game flow
function GameFlow() {
    this.scene = SCENE_TITLE;
    this.score = 0;
    this.background = new Background();
    this.player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);

    this.update = function () {
        this.background.update();
        if (this.scene === SCENE_TITLE) {
            this.updateTitleScene();
        } else if (this.scene === SCENE_PLAY) {
            this.updatePlayScene();
        } else if (this.scene === SCENE_GAME_OVER) {
            this.updateGameOverScene();
        }
        if (this.score === 50 && enemy_ships_list.length === 1) {
            enemy_ships_list.push(pinkEnemyShip);
        }
        if (this.score === 100 && enemy_ships_list.length === 2) {
            enemy_ships_list.push(greenEnemyShip);
        }
        if (this.score === 150 && enemy_ships_list.length === 3) {
            enemy_ships_list.push(beigeEnemyShip);
        }
        if (this.score === 200 && enemy_ships_list.length === 4) {
            enemy_ships_list.push(blueEnemyShip);
        }
    }

    this.updateTitleScene = function () {
        // If enter key is pressed
        if (PLAYER_START) {
            this.scene = SCENE_PLAY;
        }
    }

    this.updatePlayScene = function () {
        // Add new enemy
        if (frameCount % 50 === 0) {
            new Enemy(Math.random() * (CANVAS_WIDTH - PLAYER_WIDTH), 0);
        }

        // Checking if the Player's bullets collide with Enemy spaceships
        for (let a of enemy_list) {
            for (let b of bullet_list) {
                if ((a.x + a.w > b.x) &&
                    (b.x + b.w > a.x) &&
                    (a.y + a.h > b.y) &&
                    (b.y + b.h > a.y)) {
                    a.alive = false;
                    b.alive = false;
                    let newBlast = new Blast(a.x + ENEMY_WIDTH / 2, a.y + ENEMY_HEIGHT / 2);
                    newBlast.playExplosionSound();
                    blast_list.push(newBlast);
                    this.score += 10;
                }
            }
        }

        // Checking if the Enemy's bullets collide with Player's spaceship
        for (let b of enemy_bullets_list) {
            if ((this.player.x + this.player.w > b.x) &&
                (b.x + b.w > this.player.x) &&
                (this.player.y + this.player.h > b.y) &&
                (b.y + b.h > this.player.y)) {
                this.player.alive = false;
                b.alive = false;
                let newBlast = new Blast(this.player.x + PLAYER_WIDTH / 2,this.player.y + PLAYER_HEIGHT / 2);
                newBlast.playExplosionSound();
                blast_list.push(newBlast);
                this.scene = SCENE_GAME_OVER;
            }
        }

        for (let enemy of enemy_list) {
            if ((this.player.x + this.player.w > enemy.x) &&
                (enemy.x + enemy.w > this.player.x) &&
                (this.player.y + this.player.h > enemy.y) &&
                (enemy.y + enemy.h > this.player.y)) {
                enemy.alive = false;
                let newBlast = new Blast(this.player.x + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT / 2);
                newBlast.playExplosionSound();
                blast_list.push(newBlast);
                this.scene = SCENE_GAME_OVER;
            }
        }

        this.player.update();
        update_list(bullet_list);
        update_list(enemy_bullets_list);
        update_list(enemy_list);
        update_list(blast_list);
        enemy_list = cleanup_list(enemy_list);
        bullet_list = cleanup_list(bullet_list);
        enemy_bullets_list = cleanup_list(enemy_bullets_list);
        blast_list = cleanup_list(blast_list);
    }

    this.updateGameOverScene = function () {
        update_list(bullet_list);
        update_list(enemy_bullets_list);
        update_list(enemy_list);
        update_list(blast_list);
        enemy_list = cleanup_list(enemy_list);
        bullet_list = cleanup_list(bullet_list);
        enemy_bullets_list = cleanup_list(enemy_bullets_list);
        blast_list = cleanup_list(blast_list);
        // Reset enemy ships list to only contain yellow enemy spaceship
        enemy_ships_list = [yellowEnemyShip];

        if (PLAYER_START) {
            this.scene = SCENE_PLAY;
            this.player.x = CANVAS_WIDTH / 2;
            this.player.y = CANVAS_HEIGHT - 100;
            this.score = 0;
            enemy_list.length = 0;
            bullet_list.length = 0;
            blast_list.length = 0;
            enemy_bullets_list.length = 0;
        }
    }

    this.draw = function () {
        clear();
        this.background.draw();

        if (this.scene === SCENE_TITLE) {
            this.drawTitleScene();
        } else if (this.scene === SCENE_PLAY) {
            this.drawPlayScene();
        } else if (this.scene === SCENE_GAME_OVER) {
            this.drawGameOverScene();
        }
        fill('orange');
        textSize(22);
        text('SCORE: ' + this.score, 150, 40);
    }

    this.drawTitleScene = function () {
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text('START SHOOTER GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        if (frameCount % 100 < 50) {
            textSize(28);
            text('-PRESS ENTER-', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
        }
    }

    this.drawPlayScene = function () {
        this.player.draw();
        draw_list(bullet_list);
        draw_list(enemy_list);
        draw_list(blast_list);
        draw_list(enemy_bullets_list);
    }

    this.drawGameOverScene = function () {
        draw_list(bullet_list);
        draw_list(enemy_list);
        draw_list(blast_list);
        draw_list(enemy_bullets_list);
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        if (frameCount % 100 < 50) {
            textSize(28);
            text('-PRESS ENTER-', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
        }
    }
}


// Key pressed functionality
function keyPressed() {
    if (keyCode === UP_ARROW) {
        PLAYER_UP = true;
    } else if (keyCode === DOWN_ARROW) {
        PLAYER_DOWN = true;
    } else if (keyCode === RIGHT_ARROW) {
        PLAYER_RIGHT = true;
    } else if (keyCode === LEFT_ARROW) {
        PLAYER_LEFT = true;
    } else if (keyCode === 32) {
        PLAYER_SHOOT = true;
    } else if (keyCode === 81) {
        PLAYER_QUIT = true;
    } else if (keyCode === ENTER) {
        PLAYER_START = true;
    }
}


function keyReleased() {
    if (keyCode === UP_ARROW) {
        PLAYER_UP = false;
    } else if (keyCode === DOWN_ARROW) {
        PLAYER_DOWN = false;
    } else if (keyCode === RIGHT_ARROW) {
        PLAYER_RIGHT = false;
    } else if (keyCode === LEFT_ARROW) {
        PLAYER_LEFT = false;
    } else if (keyCode === ENTER) {
        PLAYER_START = false;
    }
}
