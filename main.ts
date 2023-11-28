import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu, HoverPopover, Component, HoverParent, Scope, ButtonComponent } from 'obsidian';
import { ColorPickerModal } from 'src/ColorPickerModal';
import {DEFAULT_SETTINGS, FastTextColorPluginSettingTab, FastTextColorPluginSettings} from 'src/FastTextColorSettings';
import { TextColor } from 'src/TextColor';

export default class FastTextColorPlugin extends Plugin implements HoverParent {
	hoverPopover: HoverPopover | null;
	settings: FastTextColorPluginSettings;

	colorMenu: HTMLDivElement | null | undefined;
	scope: Scope;

	async onload() {
		await this.loadSettings();

		// let scope = new Scope();
		// scope.register([], "1", (evt) => {console.log("1"); return false;})
		// this.app.keymap.pushScope(scope);
		

		this.addRibbonIcon('dice', 'Sample Plugin', 
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('This is a notice!');
		});

		this.addCommand({
			id: 'change-text-color',
			name: 'Change text color',
			editorCallback: (editor: Editor) => { // for this to work, needs to be in editor mode
				this.openColorMenu(editor);
			}
		});


		this.addCommand({
			id: 'text-color-debug',
			name: 'Debug',
			callback: () => {
				this.closeColorMenu();
			}
		});
		// compose scope

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new FastTextColorPluginSettingTab(this.app, this));
	}

	onunload() {
		this.closeColorMenu();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	openColorMenu(editor: Editor) {
		const cursorPos = editor.getCursor('from');
		const cursorOffset = editor.posToOffset(cursorPos);
		
		// @ts-ignore
		const coordsAtPos = editor.cm.coordsAtPos(cursorOffset, -1)
		
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

		
		for (let i = 0; i < this.settings.colors.length; i++) {
			this.createColorItem(this.colorMenu, this.settings.colors[i], i+1, editor);			
		}

		// have to apply it again, otherwise menu will not be centered.
		this.colorMenu.setAttribute("style", `left: calc(50% - ${this.colorMenu.offsetWidth}px / 2); ${attributes}`);
		
		// for now construct scope on every opening
		this.constructScope(editor);
		this.app.keymap.pushScope(this.scope);
	}

	closeColorMenu() {
		if (this.colorMenu) {
			this.colorMenu.remove();
		}
		this.app.keymap.popScope(this.scope);
	}

	constructScope(editor : Editor){
		this.scope = new Scope();
		let {scope} = this;

		// colors - number keys
		for (let i = 0; i < this.settings.colors.length; i++) {
			const tColor = this.settings.colors[i];
			scope.register([], (i+1).toString(), (event) => {
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

		// TODO arrow keys movement.
		// TODO mouse click ends
	}

	applyColor(tColor : TextColor, editor : Editor){
		if (!editor.somethingSelected()) {
			console.log("nothing selected, terminating");
			return;
		}

		const selected = editor.getSelection();

		// TODO check if there already is some coloring applied somewhere near.

		let coloredText = `<font color="${tColor.color}">${selected}</font>`

		editor.replaceSelection(coloredText);
	}

	createColorItem(menu : HTMLDivElement, tColor : TextColor, counter : number, editor : Editor){
		let button = new ButtonComponent(menu)
			.setButtonText(`${counter}`)
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
}





