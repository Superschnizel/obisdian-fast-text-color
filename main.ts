import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu, HoverPopover, Component, HoverParent } from 'obsidian';
import { ColorPickerModal } from 'src/ColorPickerModal';
import {DEFAULT_SETTINGS, FastTextColorPluginSettingTab, FastTextColorPluginSettings} from 'src/FastTextColorSettings';
import { TextColor } from 'src/TextColor';

export default class FastTextColorPlugin extends Plugin implements HoverParent {
	hoverPopover: HoverPopover | null;
	settings: FastTextColorPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('dice', 'Sample Plugin', 
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('This is a notice!');
		});

		this.addCommand({
			id: 'change-text-color',
			name: 'Change text color',
			editorCallback: (editor: Editor) => { // for this to work, needs to be in editor mode
				this.createColorMenu(editor);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new FastTextColorPluginSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	createColorMenu(editor: Editor) {
		const cursorPos = editor.getCursor('from');
		const cursorOffset = editor.posToOffset(cursorPos);
		
		// @ts-ignore
		const coordsAtPos = editor.cm.coordsAtPos(cursorOffset, -1)
		
		// console.log(coordsAtPos)
		
		const menu = new Menu();

		// need to get the DOM of the menu object
		// @ts-ignore
		var menuDom = menu.dom as HTMLElement;

		menuDom.addClass("fast-color-menu");
		
		for (let i = 0; i < this.settings.colors.length; i++) {
			console.log("creating item")
			this.createColorItem(menu, this.settings.colors[i], i+1);			
		}
		menu.showAtPosition({x : coordsAtPos.left, y : coordsAtPos.bottom }, undefined);

		return;
		menu.addItem((item) =>
        {item
          .setTitle("1")
          .setIcon(null)
          .onClick(() => {
            new Notice("Copied");
          });

		  // this is really hacky, but its the most straight-forward way i found to do this.
		  // @ts-ignore
		  const itemDom = item.dom as HTMLElement;
		  itemDom.find("div").setAttribute("style", "background-color: #ff0000");
		}
      	).addItem((item) =>
		item
		.setTitle("2")
		.setIcon(null)
		.onClick(() => {
			new Notice("Pasted");
		})
		).showAtPosition({x : coordsAtPos.left, y : coordsAtPos.bottom }, undefined);

		

		
		// {"style": `position:absolute;z-index:100000;left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}`}}
		// this.app.workspace.getActiveViewOfType<MarkdownView>(MarkdownView)?.contentEl.createDiv({text : "this is a test spanferkel", attr : {"style": `position:absolute;z-index:100000;left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}px`}})
		// new ColorPickerModal(this.app, coordsAtPos).open();
		
		// console.log(`left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}`)

		/*
		var popover = new HoverPopover(this, null);
		popover.hoverEl.setText("Spanferkel");
		popover.hoverEl.setAttr("style", `position:absolute; left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}px`) // this seems to work!!
		*/
	}

	createColorItem(menu : Menu, tColor : TextColor, counter : number){
		menu.addItem((item) =>
        {item
          .setTitle(`${counter}`)
          .setIcon(null)
          .onClick(() => {
            let n = new Notice("activated color");
			n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
          });

		  // this is really hacky, but its the most straight-forward way i found to do this.
		  // @ts-ignore
		  const itemDom = item.dom as HTMLElement;
		  itemDom.find("div").setAttribute("style", `background-color: ${tColor.color}`);
		  itemDom.addEventListener("keypress", ({key}) => {
			if (key === `${counter}`) {
					let n = new Notice("activated color");
					n.noticeEl.setAttr("style", `background-color: ${tColor.color}`);
				}
			});
		  
		});
	}
}





