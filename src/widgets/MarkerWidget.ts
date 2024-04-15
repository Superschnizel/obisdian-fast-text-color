import { EditorView, WidgetType } from "@codemirror/view";
import { CSS_COLOR_PREFIX } from "../FastTextColorSettings"

export class MarkerWidget extends WidgetType {
	cssClass: string;
	id: string;

	constructor() {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("span");

		// div.innerText = "|__D__|";

		return div;
	}
}
