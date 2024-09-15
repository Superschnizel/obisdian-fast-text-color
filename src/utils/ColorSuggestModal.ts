import { SuggestModal, App, Editor } from "obsidian";
import { applyColor } from "src/color/TextColorFunctions";
import { TextColor } from "../color/TextColor";

export class ColorSuggestModal extends SuggestModal<TextColor> {
	colors : TextColor[];
	editor : Editor;

	constructor(app: App, colors : TextColor[], editor: Editor ) {
		super(app);

		this.colors = colors;
		this.editor = editor;
		
	}

	getSuggestions(query: string): TextColor[] | Promise<TextColor[]> {
	    return this.colors.filter((tColor) => tColor.id.startsWith(query) || tColor.keybind == query);
	}

	renderSuggestion(tColor: TextColor, el: HTMLElement) {
	    let div = el.createDiv();
		div.innerText = tColor.id;
		div.setAttr("style", tColor.getCssInlineStyle());
	}

	onChooseSuggestion(tColor: TextColor, evt: MouseEvent | KeyboardEvent) {
		applyColor(tColor, this.editor);
	}
}
