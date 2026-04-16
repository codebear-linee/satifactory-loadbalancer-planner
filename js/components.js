export class Component {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.inputs = [];
    this.outputs = [];
  }

  draw(ctx) {
    // Base draw method - override in subclasses
  }

  contains(x, y) {
    // Check if point is within component bounds
    return false;
  }
}

export class Input extends Component {
  constructor(x, y) {
    super(x, y);
    this.rate = 100; // configurable items per minute
    this.width = 40;
    this.height = 40;
    this.outputs = [
      { x: this.x + this.width, y: this.y + this.height / 2, connected: null },
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("IN", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Output extends Component {
  constructor(x, y) {
    super(x, y);
    this.width = 40;
    this.height = 40;
    this.inputs = [{ x: this.x, y: this.y + this.height / 2, connected: null }];
  }

  draw(ctx) {
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("OUT", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Merger extends Component {
  constructor(x, y) {
    super(x, y);
    this.width = 50;
    this.height = 60;
    this.inputs = [
      { x: this.x, y: this.y + 10, connected: null },
      { x: this.x, y: this.y + 30, connected: null },
      { x: this.x, y: this.y + 50, connected: null },
    ];
    this.outputs = [
      { x: this.x + this.width, y: this.y + this.height / 2, connected: null },
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("M", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Splitter extends Component {
  constructor(x, y) {
    super(x, y);
    this.width = 50;
    this.height = 60;
    this.inputs = [{ x: this.x, y: this.y + this.height / 2, connected: null }];
    this.outputs = [
      { x: this.x + this.width, y: this.y + 10, connected: null },
      { x: this.x + this.width, y: this.y + 30, connected: null },
      { x: this.x + this.width, y: this.y + 50, connected: null },
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#FF9800";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("S", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class HelperInput extends Component {
  constructor(x, y) {
    super(x, y);
    this.rate = 0; // helper inputs start at 0
    this.width = 40;
    this.height = 40;
    this.outputs = [
      { x: this.x + this.width, y: this.y + this.height / 2, connected: null },
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#9C27B0";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#000";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HI", this.x + this.width / 2, this.y + this.height / 2 + 4);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}
