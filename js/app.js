import { SatisfactoryCanvas } from "./satisfactory-canvas.js";

const canvas = document.getElementById("canvas");

const satisfactoryCanvas = new SatisfactoryCanvas(canvas);

satisfactoryCanvas.redraw();
