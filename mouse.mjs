class Mouse {
    constructor(obj)
    {
        this.obj = obj;
        this.x = 0;
        this.y = 0;
        this.left = false;

        this.on('mousedown', e => this.onMouseDown(e));
        this.on('mouseup', e => this.onMouseUp(e));
        this.on('mousemove', e => this.onMouseMove(e));
    }

    on(event, callback)
    {
        this.obj.addEventListener(event, e => this.onMouseEvent(e, callback), false);
    }

    onMouseDown(e)
    {
        this.left = e.button === 0;
    }

    onMouseUp(e)
    {
        this.left = e.button !== 0;
    }

    onMouseMove(e)
    {
        this.x = e.layerX;
        this.y = e.layerY;
    }

    onMouseEvent(e, callback)
    {
        callback(e);
    }
}

export default Mouse;