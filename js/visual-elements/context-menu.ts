import { ContextMenuSelectOption, Position } from '../models';

export class ContextMenu {
  private menu: HTMLMenuElement | null = null;

  public show(
    screenPosition: Position,
    selectOptions: Array<ContextMenuSelectOption>,
  ) {
    const menu = document.createElement('menu');
    menu.classList.add('context-menu');
    document.documentElement.style.setProperty(
      '--context-menu-x',
      `${screenPosition.x}px`,
    );
    document.documentElement.style.setProperty(
      '--context-menu-y',
      `${screenPosition.y}px`,
    );

    selectOptions.forEach((option) => {
      const li = document.createElement('li');
      li.textContent = option.label;
      li.classList.add('context-menu-option');
      li.addEventListener('click', () => {
        option.action(option.callbackData);
        this.close();
      });
      menu.appendChild(li);
    });

    document.body.appendChild(menu);
    this.menu = menu;
  }

  public close() {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }
}
