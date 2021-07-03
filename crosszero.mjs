import Mouse from './mouse.mjs';

class CrossZero
{
    constructor(id)
    {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.mouse = new Mouse(this.canvas);

        this.cursor = { x: 0, y: 0, w: 20, h: 20, colors: ['black', 'red'] };
        this.drag = { dragging: false, timeout: false };

        this.cellOptions = {w: 20, h: 20, gap: 2, 
            colors: [ 'white', 'red', 'green' ]};

        this.restart();

    }
    
    restart()
    {
        this.state = 'play';

        this.map = [
            [1],
        ];
        this.mapWidth = 3;
        
        const { width, height } = this.canvas;

        this.mapCenterX = width/2;
        this.mapCenterY = height/2;

        this.currentMove = 0;
    }

    run()
    {
        this.mouse.on('mousemove', e => this.onMouseMove(e));
        this.mouse.on('mousedown', e => this.onMouseDown(e));
        this.mouse.on('mouseup',   e => this.onMouseUp(e));
        this.render();
    }

    onMouseMove(e)
    {
        const { x, y } = this.mouse;
        const { cursor, drag } = this;
        cursor.x = x;
        cursor.y = y;

        if(drag.dragging)
        {
            this.mapCenterX = this.mapCenterX + e.movementX;
            this.mapCenterY = this.mapCenterY + e.movementY;
        }
    }

    onMouseDown(e)
    {
        const { drag } = this;

        drag.timeout = setTimeout(() => {
            drag.dragging = true; 
            console.log('drag start');

        }, 200);
    }

    onMouseUp(e)
    {
        const { drag } = this;

    
        if(!drag.dragging)
        {
            if(this.state === 'end')
                this.restart();
            else this.doTurn();
        }

        drag.dragging = false;
        clearTimeout(drag.timeout);
        drag.timeout = false;
    }

    doTurn()
    {
        const { map, cellOptions } = this;
        const { x, y } = this.mouse;

        const { row, col } = this.getMapCell(x, y);
        let { row: cellRow, col: cellCol } = { row, col };
        
        const cellHalfHeight = (cellOptions.h + cellOptions.gap)/2;

        if(map[row] && map[row][col])
        {
            console.log('Is filled!');
        }
        else
        {
            if(row < 0)
            {
                for(let i=0; i< -row; ++i )
                    map.unshift([]);
                
                cellRow = 0;
                this.mapCenterY += row * cellHalfHeight;
            }

            if(col < 0)
            {
                for( let i=0; i< map.length; ++i )
                    for( let j=0; j< -col; ++j )
                    {
                        if(!map[i])
                            map[i] = [];

                        map[i].unshift(0);
                    }

                cellCol = 0;
                this.mapCenterX += col * (cellOptions.w + cellOptions.gap);

            } 

            if(!map[cellRow])
            {
                const oldRows = map.length;
                if(cellRow > oldRows - 1)
                {
                    this.mapCenterY += (cellRow - oldRows + 1) * cellHalfHeight;
                }
                map[cellRow] = [];
            }

            map[cellRow][cellCol] = this.getCurrentPlayer();

            const isEnd = this.checkGameEnd(cellRow, cellCol);

            !isEnd && ++this.currentMove; 
        } 

    }

    checkGameEnd(row, col)
    {
        const dirs = [
            [0, 1], [1, 1], [1, 0], [1, -1]
        ];

        let count = 0;

        for(let dir = 0; dir < dirs.length && count < 5; ++dir)
        {
            count = 1 + this.checkCellsDir(row, col, dirs[dir][0], dirs[dir][1])
            + this.checkCellsDir(row, col, -dirs[dir][0], -dirs[dir][1]);           
        }

        if(count >= 5)
        {
            this.state = 'end';
        }

        return count >= 5;
    }

    checkCellsDir(row, col, dy, dx, limit = 5)
    {
        const { map } = this;

        let count = 0;
        const player = map[row][col];
        let [y, x] = [row + dy, col + dx];

        for(let i = 1; i < limit && map[y] && map[y][x] === player; ++i, x+=dx, y+=dy)
            ++count;
        
        return count;
    }

    render()
    {
        this.clearScreen();
        if(this.state === 'play')
            this.renderMap();
        else this.renderWin();
        this.renderCurrentPlayer();
        this.renderCursor();

        window.requestAnimationFrame(() => this.render());
    }
    
    clearScreen()
    {
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
    }

    renderWin()
    {
        const { ctx, canvas, cellOptions } = this;
        const { width, height } = canvas;

        const x = width/2 - 100;
        const y = height/2 - 50;

        ctx.fillStyle = cellOptions.colors[this.getCurrentPlayer()];
        ctx.fillRect(x, y, 200, 100);
        
        ctx.fillStyle = 'black';
        ctx.font = "40px sans-serif";
        ctx.strokeStyle = "black";
        ctx.fillText('Winner!', x+20, y+65);
    }

    renderCursor()
    {
        const { ctx, cursor, mouse, cellOptions } = this;
        const { x, y, w, h } = cursor;

        ctx.fillStyle = mouse.left ? 'black' : cellOptions.colors[this.getCurrentPlayer()];

        ctx.fillRect(x, y, w, h);
    }

    renderCurrentPlayer()
    {
        const { ctx, cellOptions } = this;

        ctx.fillStyle = cellOptions.colors[this.getCurrentPlayer()];

        ctx.fillRect(0, 0, 40, 40);
    }

    renderMap()
    {
        const { ctx, map, cellOptions } = this;
        const { w, h, gap, colors } = cellOptions;

        const { mapX, mapY } = this.getMapStart();

        for(let row = 0; row < map.length; ++row)
        {
            if(map[row])
                for(let col = 0; col < map[row].length; ++col)
                {
                    const x = mapX + col * (w + gap);
                    const y = mapY + row * (h + gap);

                    ctx.fillStyle = colors[ map[row][col] || 0];
                    ctx.fillRect(x, y, w, h);               
                }
        }
    }

    getMapCell(x, y)
    {
        const { cellOptions } = this;

        const w = cellOptions.w + cellOptions.gap;
        const h = cellOptions.h + cellOptions.gap;

        const { mapX, mapY } = this.getMapStart();
    
        return {row: Math.floor((y - mapY) / h), col: Math.floor((x - mapX) / w)};
    }

    getMapStart()
    {
        const { map, mapWidth, cellOptions } = this;
        const { w, h, gap } = cellOptions;

        const mapH = map.length;
        const mapX = this.mapCenterX - (mapWidth * (w + gap))/2;
        const mapY = this.mapCenterY - (mapH * (h + gap))/2;

        return { mapX, mapY };
    }

    getCurrentPlayer()
    {
        return (this.currentMove + 1) % 2 + 1;
    }
}

export default CrossZero;

