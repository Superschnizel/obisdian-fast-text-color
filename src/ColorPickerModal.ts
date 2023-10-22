import { App, Modal } from "obsidian";
import { ScreenPosition } from "./ScreenPosition";

export class ColorPickerModal extends Modal {

    position : ScreenPosition;

    constructor(app: App, position : ScreenPosition) {
        super(app);
        this.position = position;
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.setText("Look at me, I'm a modal! 👀");
        contentEl.setAttr("style", `left:${this.position.left}px; top:${this.position.bottom}`)
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}