export class Component {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.portOrder = ["left", "top", "right", "bottom"];
    this.ports = [];
  }

  draw(ctx) {
    // Base draw method - override in subclasses
  }

  contains(x, y) {
    // Check if point is within component bounds
    return false;
  }

  updatePorts() {
    for (const port of this.ports) {
      port.setParentPosition(this.x, this.y);
    }
  }

  drawPorts(ctx) {
    for (let index = 0; index < this.ports.length; index++) {
      const port = this.ports[index];
      const position = this.portOrder[index];
      port.draw(ctx, position);
    }
  }
}

export class Input extends Component {
  constructor(x, y) {
    super(x, y);
    this.rate = 100; // configurable items per minute
    this.size = 40;
    this.ports = [new PortOut({ x, y, size: this.size })];
    this.portOrder = ["right"];
  }

  draw(ctx) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("IN", this.x + this.size / 2, this.y + this.size / 2 + 4);
    this.drawPorts(ctx);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

export class Output extends Component {
  constructor(x, y) {
    super(x, y);
    this.size = 40;
    this.ports = [new PortIn({ x, y, size: this.size })];
  }

  draw(ctx) {
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("OUT", this.x + this.size / 2, this.y + this.size / 2 + 4);
    this.drawPorts(ctx);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

export class Merger extends Component {
  constructor(x, y) {
    super(x, y);
    this.size = 60;
    this.ports = [
      new PortIn({ x, y, size: this.size }),
      new PortIn({ x, y, size: this.size }),
      new PortOut({ x, y, size: this.size }),
      new PortIn({ x, y, size: this.size }),
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#2196F3";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("M", this.x + this.size / 2, this.y + this.size / 2 + 4);
    this.drawPorts(ctx);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

export class Splitter extends Component {
  constructor(x, y) {
    super(x, y);
    this.size = 60;
    this.ports = [
      new PortIn({ x, y, size: this.size }),
      new PortOut({ x, y, size: this.size }),
      new PortOut({ x, y, size: this.size }),
      new PortOut({ x, y, size: this.size }),
    ];
  }

  draw(ctx) {
    ctx.fillStyle = "#FF9800";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("S", this.x + this.size / 2, this.y + this.size / 2 + 4);
    this.drawPorts(ctx);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

export class HelperInput extends Component {
  constructor(x, y) {
    super(x, y);
    this.rate = 0; // helper inputs start at 0
    this.size = 40;
    this.ports = [new PortOut({ x, y, size: this.size })];
    this.portOrder = ["right"];
  }

  draw(ctx) {
    ctx.fillStyle = "#9C27B0";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.fillStyle = "#000";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HI", this.x + this.size / 2, this.y + this.size / 2 + 4);
    this.drawPorts(ctx);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

export class Port {
  constructor({ x, y, size }) {
    this.parentComponentData = {
      x,
      y,
      size,
    };
    this.x = x;
    this.y = y;
    this.size = 6;
  }

  setParentPosition(x, y) {
    this.parentComponentData.x = x;
    this.parentComponentData.y = y;
  }

  getTopMiddle() {
    return {
      x: this.parentComponentData.x + this.parentComponentData.size / 2,
      y: this.parentComponentData.y,
    };
  }

  getLeftMiddle() {
    return {
      x: this.parentComponentData.x,
      y: this.parentComponentData.y + this.parentComponentData.size / 2,
    };
  }

  getRightMiddle() {
    return {
      x: this.parentComponentData.x + this.parentComponentData.size,
      y: this.parentComponentData.y + this.parentComponentData.size / 2,
    };
  }

  getBottomMiddle() {
    return {
      x: this.parentComponentData.x + this.parentComponentData.size / 2,
      y: this.parentComponentData.y + this.parentComponentData.size,
    };
  }

  #getPortCoordinates(position) {
    switch (position) {
      case "top":
        return this.getTopMiddle();
      case "left":
        return this.getLeftMiddle();
      case "right":
        return this.getRightMiddle();
      case "bottom":
        return this.getBottomMiddle();
      default:
        return this.getRightMiddle();
    }
  }

  draw(ctx, position) {
    const portPosition = this.#getPortCoordinates(position);
    const rotation = this.#getRotation(position);

    // Update port coordinates for dragging detection
    this.x = portPosition.x;
    this.y = portPosition.y;

    this.#drawTriangle(ctx, portPosition.x, portPosition.y, rotation);
  }

  #getRotation(position) {
    let defaultRotation = 0;

    switch (position) {
      case "top":
        defaultRotation = 90;
        break;
      case "right":
        defaultRotation = 180;
        break;
      case "bottom":
        defaultRotation = -90;
        break;
      default:
        break;
    }

    return defaultRotation + (this.type === "in" ? 0 : 180);
  }

  #drawTriangle(ctx, portX, portY, rotationDegrees = 0) {
    const angle = (rotationDegrees * Math.PI) / 180; // Convert to radians

    ctx.save(); // Save current state
    ctx.translate(portX, portY); // Move origin to triangle center
    ctx.rotate(angle); // Rotate around the new origin

    ctx.fillStyle = "#333";
    ctx.beginPath();
    // Draw triangle relative to (0,0) now
    ctx.moveTo(-this.size, -this.size);
    ctx.lineTo(-this.size, this.size);
    ctx.lineTo(this.size / 2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // Restore original state
  }
}

class PortIn extends Port {
  constructor(x, y, position) {
    super(x, y, position);
    this.type = "in";
  }
}

class PortOut extends Port {
  constructor(x, y, position) {
    super(x, y, position);
    this.type = "out";
  }
}
