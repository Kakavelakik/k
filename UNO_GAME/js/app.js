console.log('uno!');

//#region DOM AND GLOBAL VARIABLES
const cpuHandDom = document.querySelector('.cpu-hand');
const playerHandDom = document.querySelector('.player-hand');

const cpuScoreDom = document.querySelector('#cpu-score');
const playerScoreDom = document.querySelector('#player-score');

const playPileDom = document.querySelector('.play-pile');
const drawPileDom = document.querySelector('.draw-pile');

const playerUno = document.querySelector('.player-animation');
const cpuUno = document.querySelector('.cpu-animation');

// Player hands and deck
const cpuHand = [];
const playerHand = [];
const deck = [];
let playPile = [];

let playerTurn = true;
let gameOn = true;
let colorPickerIsOpen = false;
let cpuDelay = Math.floor((Math.random() * 200) + 1500);
let gameOver = 100;
//#endregion

//#region AUDIO
const shuffleFX = new Audio('audio/shuffle.wav');
const playCardFX = new Audio('audio/playCardNew.wav');
const drawCardFX = new Audio('audio/drawCard.wav');
const winRoundFX = new Audio('audio/winRound.wav');
const loseFX = new Audio('audio/lose.wav');
const unoFX = new Audio('audio/uno.wav');
const colorButtonFX = new Audio('audio/colorButton.wav');
const playAgainFX = new Audio('audio/playAgain.wav');
//#endregion

//#region CARD CLASS AND DECK MANAGEMENT
class Card {
    constructor(color, value, points, changeTurn, drawValue, imgSrc) {
        this.color = color;
        this.value = value;
        this.points = points;
        this.changeTurn = changeTurn;
        this.drawValue = drawValue;
        this.src = imgSrc;
    }
}

const createDeck = () => {
    deck.length = 0;
    ['red', 'green', 'blue', 'yellow'].forEach((color, i) => {
        const colorRGB = i === 0 ? 'rgb(255, 6, 0)' :
                         i === 1 ? 'rgb(0, 170, 69)' :
                         i === 2 ? 'rgb(0, 150, 224)' : 'rgb(255, 222, 0)';
        for (let value = 0; value <= 14; value++) {
            const imgSrc = `images/${color}${value}.png`;
            if (value <= 9) {
                deck.push(new Card(colorRGB, value, value, true, 0, imgSrc));
                if (value > 0) deck.push(new Card(colorRGB, value, value, true, 0, imgSrc));
            } else if (value === 10 || value === 11) {
                deck.push(new Card(colorRGB, value, 20, false, 0, imgSrc));
                deck.push(new Card(colorRGB, value, 20, false, 0, imgSrc));
            } else if (value === 12) {
                deck.push(new Card(colorRGB, value, 20, false, 2, imgSrc));
                deck.push(new Card(colorRGB, value, 20, false, 2, imgSrc));
            } else if (value === 13 || value === 14) {
                const wildImg = `images/wild${value}.png`;
                deck.push(new Card('any', value, 50, value === 13, value === 14 ? 4 : 0, wildImg));
            }
        }
    });
};

const shuffleDeck = () => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    shuffleFX.play();
};
//#endregion

//#region GAME LOGIC
const dealCards = () => {
    for (let i = 0; i < 7; i++) {
        cpuHand.push(deck.shift());
        playerHand.push(deck.shift());

        const cpuCard = document.createElement('img');
        cpuCard.setAttribute('src', 'images/back.png');
        cpuCard.setAttribute('class', 'cpu');
        cpuHandDom.appendChild(cpuCard);

        const playerCard = document.createElement('img');
        playerCard.setAttribute('src', playerHand[i].src);
        playerCard.setAttribute('class', 'player');
        playerCard.setAttribute('id', i);
        playerHandDom.appendChild(playerCard);
    }
};

const startPlayPile = () => {
    for (let i = 0; i < deck.length; i++) {
        if (deck[i].color !== "any" && deck[i].value <= 9) {
            playPile = [deck.splice(i, 1)[0]];
            break;
        }
    }
    const playCard = document.createElement('img');
    playCard.setAttribute('src', playPile[0].src);
    playPileDom.appendChild(playCard);
};

const updatePlayPileDom = () => {
    playPileDom.innerHTML = '';
    const playCard = document.createElement('img');
    playCard.setAttribute('src', playPile[playPile.length - 1].src);
    playPileDom.appendChild(playCard);
};

const updateHandDom = (hand, dom) => {
    dom.innerHTML = '';
    hand.forEach((card, index) => {
        const cardEl = document.createElement('img');
        cardEl.setAttribute('src', dom === cpuHandDom ? 'images/back.png' : card.src);
        cardEl.setAttribute('class', dom === cpuHandDom ? 'cpu' : 'player');
        cardEl.setAttribute('id', index);
        dom.appendChild(cardEl);
    });
};

const drawCard = (hand) => {
    if (deck.length > 0) {
        hand.push(deck.shift());
    } else {
        shuffleDeck();
        playPile.forEach(card => deck.push(card));
        playPile.length = 1;
        hand.push(deck.shift());
    }
    drawCardFX.play();
};

const showUno = (unoElement) => {
    unoElement.classList.remove('hidden');
    unoFX.play();
    setTimeout(() => unoElement.classList.add('hidden'), 2000);
};

const showColorPicker = () => {
    document.querySelector('.color-picker').style.opacity = 1;
    colorPickerIsOpen = true;
};

const hideColorPicker = () => {
    document.querySelector('.color-picker').style.opacity = 0;
    colorPickerIsOpen = false;
};

const checkForWinner = () => {
    if (playerHand.length === 0 || cpuHand.length === 0) {
        gameOn = false;
        alert(playerHand.length === 0 ? 'Player wins!' : 'CPU wins!');
    }
};
//#endregion

//#region EVENT LISTENERS
playerHandDom.addEventListener('click', (event) => {
    if (gameOn && playerTurn && event.target.getAttribute('id')) {
        const index = parseInt(event.target.getAttribute('id'));
        const card = playerHand.splice(index, 1)[0];
        playPile.push(card);
        updateHandDom(playerHand, playerHandDom);
        updatePlayPileDom();

        if (playerHand.length === 1) showUno(playerUno);

        if (card.color === 'any') showColorPicker();

        playerTurn = false;
        setTimeout(() => drawCard(cpuHand), 1500);
    }
});

drawPileDom.addEventListener('click', () => {
    if (gameOn && playerTurn) {
        drawCard(playerHand);
        updateHandDom(playerHand, playerHandDom);
        playerTurn = false;
        setTimeout(() => drawCard(cpuHand), 1500);
    }
});
//#endregion

//#region START GAME
const startGame = () => {
    createDeck();
    shuffleDeck();
    dealCards();
    startPlayPile();
    gameOn = true;
};

startGame();
//#endregion
