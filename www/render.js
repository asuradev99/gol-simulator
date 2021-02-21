class Renderer {
    constructor(ctx, cellsize, width, height, nodes, states) {
        this.ctx = ctx;
        this.cellsize = cellsize;
        this.ctx.width = width; 
        this.ctx.height = height; 
        this.nodes = nodes; 
        this.states = states; 
        this.data, this.delta;
        console.log(this.states)
    }
    setMemory(memory, dataptr, deltaptr) {
        this.data = new Uint8Array(memory.buffer, dataptr, this.width * this.height);
        this.delta = new Uint32Array(memory.buffer, deltaptr, this.width * this.height);
    }
    nodeRender(begin, end) {
        const node = document.createElement('canvas')
        const nctx = node.getContext('2d');
        this.states.forEach(s => {
            console.log(s)
            const value = s[0];
            const color = s[1];
            nctx.beginPath();
            nctx.fillStyle = color;
            for (let i = begin; i < end; i++) {
              if (this.delta[i] < this.delta[i - 1]) {
                //console.log("exited at ", i, ", ", this.delta[i - 1])
                break;
              }
              let idx = this.delta[i];
              if (this.data[idx] !== value) {
                continue;
              }
              let row = Math.floor(idx / width);
              let col = idx % width;
              nctx.fillRect(
                col * (this.cellsize + 1) + 1,
                row * (this.cellsize + 1) + 1,
                this.cellsize,
                this.cellsize
              );
            }

        });
        nctx.stroke();
        return node;
    };
    batchRender() {
        for (var i = 0; i < this.nodes; i++) {
            var interval = (this.width * this.height) / this.nodes;
            this.ctx.drawImage(this.nodeRender(interval * i, interval * (i + 1)), 0, 0);
        }
    }
}