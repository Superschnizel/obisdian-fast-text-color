import { EditorView, WidgetType } from "@codemirror/view";
import { CSS_COLOR_PREFIX } from "../FastTextColorSettings"

export class TextColorWidget extends WidgetType {
	cssClass: string;
	id: string;
	innerText: string;

	constructor(id: string, text: string) {
		super();
		this.cssClass = `${CSS_COLOR_PREFIX}${id}`
		this.innerText = text;
		this.id = id;
	}

	toDOM(view: EditorView): HTMLElement {
		const span = document.createElement("span");
		span.addClass(this.cssClass);

		span.innerText = this.innerText;

		return span;
	}
}
