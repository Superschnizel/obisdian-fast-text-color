import {
	App,
	Editor,
	EditorPosition,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Menu,
	HoverPopover,
	Component,
	HoverParent,
	Scope,
	ButtonComponent
} from 'obsidian';
import { CreateCaptureScope } from 'src/utils/CreateCaptureScope';
import { DEFAULT_SETTINGS, FastTextColorPluginSettingTab, FastTextColorPluginSettings } from 'src/FastTextColorSettings';
import { TextColor } from 'src/color/TextColor';
import { PREFIX, SUFFIX } from 'src/utils/regularExpressions';
import { textColorViewPlugin } from 'src/rendering/TextColorViewPlugin'
import { textColorParserField } from 'src/rendering/TextColorStateField';
import { textColorPostProcessor } from 'src/rendering/TextColorPostProcessor'

const MAX_MENU_ITEMS: number = 10;


export default class FastTextColorPlugin extends Plugin {
	settings: FastTextColorPluginSettings;

	colorMenu: HTMLDivElement | null | undefined;
	scope: Scope;

	style: HTMLElement;

	async onload() {
		await this.loadSettings();

		// let scope = new Scope();
		// scope.register([], "1", (evt) => {console.log("1"); return false;})
		// this.app.keymap.pushScope(scope);

		this.registerEditorExtension(textColorParserField);
		this.registerEditorExtension(textColorViewPlugin);
		this.registerMarkdownPostProcessor(textColorPostProcessor);

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
			editorCallback: (editor: Editor) => {
				this.removeColor((editor));
			}
		}
		)

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new FastTextColorPluginSettingTab(this.app, this));

		this.setCssVariables();
	}

	onunload() {
		this.style.remove();
		this.closeColorMenu();
	}

	async loadSettings() {
		// this.settings = DEFAULT_SETTINGS; return; // DEBUG
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		for (let i = 0; i < this.settings.colors.length; i++) {
			let obj: TextColor = this.settings.colors[i]
			this.settings.colors[i] = new TextColor(obj.color, obj.id, obj.italic, obj.bold, obj.cap_mode.index, obj.line_mode.index);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	openColorMenu(editor: Editor) {
		// const cursorPos = editor.getCursor('from');
		// const cursorOffset = editor.posToOffset(cursorPos);

		// @ts-ignore
		// const coordsAtPos = editor.cm.coordsAtPos(cursorOffset, -1)
		//
		//
		// TODO: do i really need to rebuild this every time?
		if (this.colorMenu != null) {
			console.log('colorMenu already exists');
			return;
		}

		this.colorMenu = createDiv();
		if (!this.colorMenu) {
			console.log("could not create colorMenu.");
			return;
		}

		let attributes = `bottom: 8.25em; grid-template-columns: ${"1fr ".repeat(this.settings.colors.length)}`;

		this.colorMenu.setAttribute("style", attributes);
		this.colorMenu.setAttribute("id", "fast-color-menu");
		this.colorMenu.addClass("fast-color-menu");

		// add menu to the workspace, adapted from 
		// cMenu https://github.com/chetachiezikeuzor/cMenu-Plugin/blob/master/src/modals/cMenuModal.ts#L5
		document.body.querySelector(".mod-vertical.mod-root")?.insertAdjacentElement("afterbegin", this.colorMenu);


		for (let i = 0; i < Math.min(this.settings.colors.length, MAX_MENU_ITEMS); i++) {
			this.createColorItem(this.colorMenu, this.settings.colors[i], i + 1, editor);
		}

		// have to apply it again, otherwise menu will not be centered.
		this.colorMenu.setAttribute("style", `left: calc(50% - ${this.colorMenu.offsetWidth}px / 2); ${attributes}`);

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
		for (let i = 0; i < this.settings.colors.length ; i++) {
			const tColor = this.settings.colors[i];
			scope.register([], tColor.keybind, (event) => {
				if (event.isComposing) {
					return true;
				}

				let n = new Notice("activated color");
				n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
				this.applyColor(tColor, editor);
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

	applyColor(tColor: TextColor, editor: Editor) {

		let prefix = `~={${tColor.id}}`;
		let suffix = `=~`;

		// nothing is selected, just insert coloring
		if (!editor.somethingSelected()) {
			editor.replaceSelection(prefix);

			let pos = editor.getCursor();
			// console.log(`line: ${pos.line}, ch: ${pos.ch}`);
			editor.replaceSelection(suffix);

			editor.setCursor(pos);

			// push a scope onto the stack to be able to jump out with tab
			// this made more Problems than it was worth... maybe readd later.

			// let scope = CreateCaptureScope(editor, this.app, pos, suffix);

			// this.app.keymap.pushScope(scope);
			return;
		}

		let selected = editor.getSelection();

		// TODO check if there already is some coloring applied somewhere near.
		// for now just check if what is marked is already a colored section and trim tags:
		// if (selected.match(IS_COLORED)) {
		// 	selected = selected.replace(LEADING_SPAN, '');
		// 	selected = selected.replace(TRAILING_SPAN, '');
		// }

		let coloredText = `${prefix}${selected}${suffix}`;

		editor.replaceSelection(coloredText);
	}

	removeColor(editor: Editor) {
		// for now only works if span is leading and trailing
		let selected = editor.getSelection();

		selected = selected.replace(PREFIX, '');
		selected = selected.replace(SUFFIX, '');
		editor.replaceSelection(selected);
	}



	createColorItem(menu: HTMLDivElement, tColor: TextColor, counter: number, editor: Editor) {
		new ButtonComponent(menu)
			.setButtonText(`${tColor.keybind}`)
			.setClass("fast-color-menu-item")
			.setTooltip("this is a tooltip")
			.onClick(() => {
				let n = new Notice("activated color");
				n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
				this.applyColor(tColor, editor);
				this.closeColorMenu();
			})
			.buttonEl.setAttr("style", `background-color: ${tColor.color}`);
	}

	setCssVariables() {
		if (!this.style) {
			var root = document.querySelector(':root');

			if (!root) {
				return;
			}

			this.style = root.createEl('style');
			this.style.id = "fast-text-color-stylesheet";

		}

		this.style.innerHTML = '';
		// dynamically create stylesheet.
		this.settings.colors.forEach((tColor: TextColor) => {
			// root.style.setProperty(tColor.cssVariable, tColor.color);
			// console.log(tColor.cssName);
			this.style.innerHTML += tColor.getCssStyle() + "\n";

		});

	}
}





