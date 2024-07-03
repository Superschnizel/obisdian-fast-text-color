import { EditorView, WidgetType } from "@codemirror/view";
import { CSS_COLOR_PREFIX, getColors, VAR_COLOR_PREFIX } from "../FastTextColorSettings"
import { Menu } from "obsidian";
import { settingsFacet } from "src/SettingsFacet";

export class ColorWidget extends WidgetType {
	id: string;
	from: number;
	to: number;
	expressionTo: number;
	themeName: string;

	menu: Menu | null;

	constructor(id: string, from: number, to: number, expressionTo: number, themeName: string) {
		super();
		this.id = id;
		this.from = from;
		this.to = to;
		this.expressionTo = expressionTo;
		this.themeName = themeName;
	}

	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("span");
		div.addClass(`${CSS_COLOR_PREFIX}${this.themeName}-${this.id}`)
		div.addClass("ftc-color-delimiter")

		div.innerText = "⬤";

		const settings = view.state.facet(settingsFacet);

		div.onclick = (event) => {
			if (this.menu != null) {

			}
			view.dispatch({
				selection: {
					anchor: this.from,
					head: this.to
				}
			})
		}

		div.onmouseover = (event) => {
			if (this.menu != null) {
				return;
			}

			this.menu = new Menu();

			getColors(settings).forEach(tColor => {
				this.menu!.addItem(item => {
					item
						.setTitle(tColor.id)
						.onClick(evt => {
							view.dispatch({
								changes: {
									from: this.from,
									to: this.to,
									insert: tColor.id
								}
							})
						})
						.setIcon("palette");
					// @ts-ignore
					(item.dom as HTMLElement).addClass(tColor.className);
				})
			});
			this.menu.addItem(item => {
				item
					.setTitle("Remove")
					.setIcon("ban")
					.onClick(evt => {
						view.dispatch({
							changes: [{
								from: this.from - 3,
								to: this.to + 1,
								insert: ''
							}, {
								from: this.expressionTo - 2,
								to: this.expressionTo,
								insert: ''
							}
							]
						})
					})
			})

			const rect = div.getBoundingClientRect();
			this.menu.showAtPosition({ x: rect.left, y: rect.bottom })
		}

		// div.onmouseout does not work. will close menu whenever the delimiter is not under the mouse.

		return div;
	}
}
