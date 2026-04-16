export class ContextMenu {
  #menu = null;

  show(screenX, screenY, worldX, worldY, options) {
    this.close();

    const menu = document.createElement("div");
    menu.style.position = "fixed";
    menu.style.left = screenX + "px";
    menu.style.top = screenY + "px";
    menu.style.backgroundColor = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.borderRadius = "4px";
    menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    menu.style.zIndex = "1000";
    menu.style.minWidth = "120px";

    options.forEach((option) => {
      const item = document.createElement("div");
      item.textContent = option.label;
      item.style.padding = "8px 12px";
      item.style.cursor = "pointer";
      item.style.userSelect = "none";
      item.addEventListener("mouseenter", () => {
        item.style.backgroundColor = "#f0f0f0";
      });
      item.addEventListener("mouseleave", () => {
        item.style.backgroundColor = "#fff";
      });
      item.addEventListener("click", () => {
        option.action(worldX, worldY);
        this.close();
      });
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    this.#menu = menu;
  }

  close() {
    if (this.#menu) {
      this.#menu.remove();
      this.#menu = null;
    }
  }
}
