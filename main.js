document.addEventListener('DOMContentLoaded', () => {

    const MY_BOARD_NAME = 'my'
    const HIS_BOARD_NAME = 'his'

    const CELL_EMPTY = 0;
    const CELL_SHIP = 1;
    const CELL_HIT = 2;
    const CELL_MISS = 3;

    const shipsConfig = {4: 1, 3: 2, 2: 3, 1: 4}

    const myBoardElement = document.getElementById('my-board');
    const hisBoardElement = document.getElementById('his-board');
    const initArray = () => Array(11).fill(0).map((n,i) => Array(11).fill(CELL_EMPTY));
    const myShips = initArray()
    const hisShips = initArray()
    console.log('myShips', myShips)

    let waitingForEnemyShoot = false;

    const getCellId = (name, y, x) => name + '_' + y+ '_' + x;

    const updateCellData = (name, y, x, state) => document.getElementById(getCellId(name, y, x)).dataset.state = state;

    const drawBoard = (name, container, createClickListener) => {
        for (let y=0; y<=10; y++) {
            for (let x=0; x<=10; x++) {
                const el = document.createElement('div');
                el.id = getCellId(name, y, x)
                if (x === 0 && y > 0) {
                    el.appendChild(document.createTextNode(y))
                }
                if (y === 0 && x > 0) {
                    el.appendChild(document.createTextNode(String.fromCharCode(64+x)))
                }
                if (x > 0 && y > 0) {
                    el.addEventListener('click', createClickListener(y, x))
                }
                container.appendChild(el)
                updateCellData(name, y, x, CELL_EMPTY)
            }
        }
    }

    const shoot = (name, y, x, ships) => {
        if (ships[y][x] === CELL_SHIP) {
            console.log('hit')
            ships[y][x] = CELL_HIT;
        } else {
            console.log('miss')
            ships[y][x] = CELL_MISS;
        }
        updateCellData(name, y, x, ships[y][x])
    }

    const enemyShoot = () => {
        let x, y;
        do {
            x = Math.floor(Math.random()*10)+1;
            y = Math.floor(Math.random()*10)+1;
        } while (myShips[y][x] !== CELL_EMPTY && myShips[y][x] !== CELL_SHIP);
        shoot(MY_BOARD_NAME, y, x, myShips);
        waitingForEnemyShoot = false;
    }

    const shipCellClickListenerFactory = (y, x) => event => {
        myShips[y][x] = CELL_SHIP;
        updateCellData(MY_BOARD_NAME, y, x, CELL_SHIP)
    }

    const shootCellClickListenerFactory = (y, x) => event => {
        if (hisShips[y][x] !== CELL_HIT && hisShips[y][x] !== CELL_MISS && !waitingForEnemyShoot) {
            shoot(HIS_BOARD_NAME, y, x, hisShips);
            waitingForEnemyShoot = true;
            setTimeout(enemyShoot, 1000 * (Math.random()*4+1));
        }
    }

    const generateRandomShips = (name, ships) => {
        const isCellEmpty = (y,x) => ships[y][x] === CELL_EMPTY
        const isCellAllowed = (y,x,prevY,prevX) => {
            for (let dx=-1; dx<=1; dx++) {
                for (let dy=-1; dy<=1; dy++) {
                    const newy = y+dy;
                    const newx = x+dx;
                    if (newy > 0 && newx > 0 && newy <= 10 && newx <= 10 && !(newy === prevY && newx === prevX)) {
                        if (!isCellEmpty(newy, newx)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        const createRandomShip = len => {
            const x = Math.floor(Math.random()*(11-len))+1
            const y = Math.floor(Math.random()*10)+1
            const dir = (Math.random() < 0.5);
            const draw = (a,b) => {
                ships[a][b] = CELL_SHIP
                updateCellData(name, a, b, CELL_SHIP)
            }
            const cellsToDraw = []
            for (let i=0; i<len; i++) {
                if (dir) {
                    if (!isCellAllowed(y,x+i, y, i>0 ? x+i-1 : null)) {
                        return false;
                    }
                    cellsToDraw.push([y,x+i])
                } else {
                    if (!isCellAllowed(x+i, y, i>0 ? x+i-1 : null, y)) {
                        return false;
                    }
                    cellsToDraw.push([x+i, y])
                }
            }
            cellsToDraw.forEach(([a,b]) => draw(a, b))
            return true
        }
        Object.keys(shipsConfig).forEach(len => {
            const count = shipsConfig[len]
            for (let i=0; i<count; i++) {
                let result;
                let count = 0;
                do {
                    count++;
                    if (count > 1000) {
                        location.reload();
                        break;
                    }
                    result = createRandomShip(len);
                } while (!result);
            }
        })
    }

    // draw my game board
    drawBoard(MY_BOARD_NAME, myBoardElement, shipCellClickListenerFactory)
    drawBoard(HIS_BOARD_NAME, hisBoardElement, shootCellClickListenerFactory)
    generateRandomShips(HIS_BOARD_NAME, hisShips)

})
