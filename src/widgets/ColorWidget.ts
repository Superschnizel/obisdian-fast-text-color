import { EditorView, WidgetType } from "@codemirror/view";
import { CSS_COLOR_PREFIX, getColors, VAR_COLOR_PREFIX } from "../FastTextColorSettings"
import { Menu } from "obsidian";
import { settingsFacet } from "src/SettingsFacet";

export class ColorWidget extends WidgetType {
	id: string;
	from: number;
	to: number;
	expressionTo: number;

	menu: Menu | null;

	constructor(id: string, from: number, to: number, expressionTo: number) {
		super();
		this.id = id;
		this.from = from;
		this.to = to;
		this.expressionTo = expressionTo; 
	}

	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("span");
		div.addClass(`${CSS_COLOR_PREFIX}${this.id}`)
		div.addClass("ftc-color-delimiter")
		// div.setAttr("style", `background-color: var(${VAR_COLOR_PREFIX}${this.id})`)

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
			if (this.menu == null) {
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
						(item.dom as HTMLElement).addClass(tColor.className());
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
								},{
									from: this.expressionTo - 2,
									to: this.expressionTo,
									insert: ''
								}
								]
							})
					})
				})
				// @ts-ignore
				// this.menu.dom.addClass("popover");
			}
			// this.menu.showAtMouseEvent(event);
			const rect = div.getBoundingClientRect();
			this.menu.showAtPosition({x:rect.left, y: rect.bottom})
		}

		div.onmouseout = (event) => {
			if (this.menu == null) {
				return;
			}

			// this.menu.close();
		}

		return div;
	}
}
