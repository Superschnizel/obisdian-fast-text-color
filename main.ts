import {
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	Menu,
	Scope,
	ButtonComponent,
	Modal,
} from 'obsidian';
import { DEFAULT_SETTINGS, FastTextColorPluginSettingTab, FastTextColorPluginSettings, getColors, SETTINGS_VERSION, updateSettings, CSS_COLOR_PREFIX, getCurrentTheme } from 'src/FastTextColorSettings';
import { TextColor } from 'src/color/TextColor';
import { PREFIX, SUFFIX } from 'src/utils/regularExpressions';
import { textColorViewPlugin } from 'src/rendering/TextColorViewPlugin'
import { textColorParserField } from 'src/rendering/TextColorStateField';
import { textColorPostProcessor } from 'src/rendering/TextColorPostProcessor'
import { EditorState, Prec, Extension, Compartment } from "@codemirror/state";
import { keymap, EditorView } from '@codemirror/view'
import { settingsFacet } from "./src/SettingsFacet";
import { applyColor, removeColor } from "src/color/TextColorFunctions";
import { ColorSuggestModal } from 'src/utils/ColorSuggestModal';

const MAX_MENU_ITEMS: number = 10;


export default class FastTextColorPlugin extends Plugin {
	settings: FastTextColorPluginSettings;

	colorMenu: HTMLDivElement | null | undefined;
	scope: Scope;

	styleElement: HTMLElement;

	settingsExtension: Extension;
	settingsCompartment: Compartment;

	async onload() {
		await this.loadSettings();

		// setup Editor Extensions
		this.registerEditorExtension(textColorParserField);
		this.registerEditorExtension(textColorViewPlugin);
		this.registerMarkdownPostProcessor((el, ctx) => { textColorPostProcessor(el, ctx, this.settings); }, -1000);
		this.registerMarkdownPostProcessor((el, ctx) => { textColorPostProcessor(el, ctx, this.settings); }, 1000);

		// to make settings available in the ViewPlugin.
		this.settingsCompartment = new Compartment();
		this.settingsExtension = this.settingsCompartment.of(settingsFacet.of(this.settings));
		this.registerEditorExtension(this.settingsExtension);

		this.registerEditorExtension(
			Prec.high(
				keymap.of([
					{
						key: "Tab",
						run: (editorView) => this.jumpOut(editorView),
					},
				])
			)
		);

		this.addCommand({
			id: 'change-text-color',
			name: 'Change text color',
			editorCallback: (editor: Editor) => { // for this to work, needs to be in editor mode
				this.openColorMenu(editor);
			}
		});

		this.addCommand({
			id: 'remove-text-color',
			name: 'Remove text color',
			editorCallback: (editor, view) => {
				// @ts-expect-error, not typed
				const editorView = view.editor.cm as EditorView;

				removeColor(editor, editorView);
			}
		})

		// add coloring to editor context menu.
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				if (editor.getSelection() == '') {
					return;
				}
				menu.addItem((item) => {
					item
						.setSection("selection")
						.setTitle("Color")
						.setIcon("palette");
					// @ts-ignore
					const submenu: Menu = item.setSubmenu();
					getColors(this.settings).forEach(tColor => {
						submenu.addItem((subitem) => {

							subitem
								.setTitle(tColor.id)
								.setIcon("circle")
								.onClick(evt => {
									applyColor(tColor, editor);
								});

							// @ts-ignore
							(subitem.dom as HTMLElement).addClass(tColor.className);
							// @ts-ignore
							(subitem.iconEl as HTMLElement).addClass(tColor.className);
						})
					});
				})
			})
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new FastTextColorPluginSettingTab(this.app, this));

		this.setCssVariables();
	}

	onunload() {
		this.styleElement.remove();
		this.closeColorMenu();

		// remove editorextensions
	}

	async loadSettings() {
		// this.settings = DEFAULT_SETTINGS; return; // DEBUG
		const rawSettings = await this.loadData();

		// if settings already exists but are an older version
		if (rawSettings && +rawSettings.version < +SETTINGS_VERSION) {
			console.log("outdated Settings! Trying to update.")
			this.settings = updateSettings(rawSettings)
			await this.saveData(this.settings);
			return;
		}

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// reinitialize theme 
		for (let j = 0; j < this.settings.themes.length; j++) {
			const colors = getColors(this.settings, j);
			for (let i = 0; i < colors.length; i++) {
				let obj: TextColor = colors[i]
				colors[i] = new TextColor(obj.color, obj.id, this.settings.themes[j].name, obj.italic, obj.bold, obj.cap_mode.index, obj.line_mode.index, obj.keybind, obj.useCssColorVariable, obj.colorVariable);
			}
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editorView = (view?.editor as any)?.cm as EditorView;

		if (editorView == null) {
			return;
		}

		editorView.dispatch({
			effects: this.settingsCompartment.reconfigure(settingsFacet.of(this.settings))
		})
	}

	// create and open the color menu
	/**
	 * opens the color menu and pushed the scope onto the keybindings.
	 *
	 * @param {Editor} editor - [TODO:description]
	 */
	openColorMenu(editor: Editor) {
		if (!this.settings.useKeybindings) {
			// if keybindings are not used create a normal choice
			let modal = new ColorSuggestModal(this.app, getColors(this.settings), editor);
			modal.open();
			return;
		}


		// TODO: do i really need to rebuild this every time?
		if (this.colorMenu != null) {
			// console.log('colorMenu already exists');
			return;
		}

		this.colorMenu = createDiv();
		if (!this.colorMenu) {
			// console.log("could not create colorMenu.");
			new Notice("could not create Colormenu!")
			return;
		}

		let attributes = `bottom: 8.25em; grid-template-columns: ${"1fr ".repeat(getColors(this.settings).length)}`;

		this.colorMenu.setAttribute("style", attributes);
		this.colorMenu.setAttribute("id", "fast-color-menu");
		this.colorMenu.addClass("fast-color-menu");

		// add menu to the workspace, adapted from 
		// cMenu https://github.com/chetachiezikeuzor/cMenu-Plugin/blob/master/src/modals/cMenuModal.ts#L5
		document.body.querySelector(".mod-vertical.mod-root")?.insertAdjacentElement("afterbegin", this.colorMenu);


		for (let i = 0; i < Math.min(getColors(this.settings).length, MAX_MENU_ITEMS); i++) {
			this.createColorItem(this.colorMenu, getColors(this.settings)[i], i + 1, editor);
		}

		// have to apply it again, otherwise menu will not be centered.
		this.colorMenu.setAttribute("style", `left: calc(50% - ${this.colorMenu.offsetWidth}px / 2); ${attributes}`);

		if (!this.settings.useKeybindings) {
			return;
		}

		// for now construct scope on every opening TODO
		this.constructScope(editor);
		this.app.keymap.pushScope(this.scope);
	}

	closeColorMenu() {
		if (this.colorMenu) {
			this.colorMenu.remove();
			this.colorMenu = null;
		}
		this.app.keymap.popScope(this.scope);
	}

	constructScope(editor: Editor) {
		this.scope = new Scope();
		let { scope } = this;

		// colors - number keys
		for (let i = 0; i < getColors(this.settings).length; i++) {
			const tColor = getColors(this.settings)[i];
			scope.register([], tColor.keybind, (event) => {
				if (event.isComposing) {
					return true;
				}

				// let n = new Notice("activated color");
				// n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
				applyColor(tColor, editor);
				this.closeColorMenu();
				return false;
			});
		}

		scope.register([], "Escape", (event) => {
			if (event.isComposing) {
				return true;
			}

			this.closeColorMenu();
			return false;
		})
		scope.register([], "Delete", (event) => {
			if (event.isComposing) {
				return true;
			}

			this.closeColorMenu();
			return false;
		})
		scope.register([], "Backspace", (event) => {
			if (event.isComposing) {
				return true;
			}

			this.closeColorMenu();
			return false;
		})

		// TODO arrow keys movement.
		// TODO mouse click ends
	}

	/**
	 * Move the cursor behind the next end marker.
	 *
	 * @param {EditorView} editorView
	 * @returns {boolean} true if jump possible.
	 */
	jumpOut(editorView: EditorView): boolean {
		//@ts-ignore
		const state: EditorState = editorView.state;
		const tree = state.field(textColorParserField).tree;
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			return false;
		}

		let inner = tree.resolve(state.selection.main.head);

		if (inner.type.name == "Text" && inner.parent != null) {
			inner = inner.parent;
		}

		if (inner.type.name != "TcRight") {
			return false;
		}


		editor.setCursor(editor.offsetToPos(inner.to));

		return true;
	}

	createColorItem(menu: HTMLDivElement, tColor: TextColor, counter: number, editor: Editor) {
		new ButtonComponent(menu)
			.setButtonText(`${tColor.keybind}`)
			.setClass("fast-color-menu-item")
			.onClick(() => {
				let n = new Notice("activated color");
				n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
				applyColor(tColor, editor);
				this.closeColorMenu();
			})
			.buttonEl.setAttr("style", `background-color: ${tColor.color}`);
	}

	/**
	 * creates the stylesheet needed for the colors in the root of the document.
	 * A different set of classes is created for each theme.
	 *
	 */
	setCssVariables() {
		if (!this.styleElement) {
			const root = document.querySelector(':root');

			if (!root) {
				return;
			}

			this.styleElement = root.createEl('style');
			this.styleElement.id = "fast-text-color-stylesheet";

		}

		this.styleElement.textContent = "";
		const formatCss = (css: string) => {
			const lines = css.split('\n').map(l => l.trim()).filter(l => l.length);
			if (lines.length <= 5) { // format as a single line
				return lines.join(' ');
			}
			return lines.map(l => /[{}]/.test(l) ? l : `  ${l}`).join('\n');
		};
		// dynamically create stylesheet.
		for (let i = 0; i < this.settings.themes.length; i++) {
			getColors(this.settings, i).forEach((tColor: TextColor) => {

				const theme = this.settings.themes[i]
				const className = `.${CSS_COLOR_PREFIX}${theme.name}-${tColor.id}`;
				let cssClass = `${className} {\n${tColor.getInnerCss(this.settings)}\n}`;

				this.styleElement.textContent += formatCss(cssClass) + "\n";
			});
		}

	}
}






