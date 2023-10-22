import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu, HoverPopover, Component, HoverParent } from 'obsidian';
import { ColorPickerModal } from 'src/ColorPickerModal';

// Remember to rename these classes and interfaces!

interface FastTextColorPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	mySetting: 'default'
}

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
		

		

		const cursorPos = editor.getCursor('anchor');
		const cursorOffset = editor.posToOffset(cursorPos);
		
		// @ts-ignore
		const coordsAtPos = editor.cm.coordsAtPos(cursorOffset)

		console.log(coordsAtPos)
		
		// const menu = new Menu();
		// menu.addItem((item) =>
        // item
        //   .setTitle("Copy")
        //   .setIcon("documents")
        //   .onClick(() => {
        //     new Notice("Copied");
        //   })
      	// ).showAtPosition({x : coordsAtPos.left, y : coordsAtPos.bottom }, undefined);

		// {"style": `position:absolute;z-index:100000;left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}`}}
		// this.app.workspace.getActiveViewOfType<MarkdownView>(MarkdownView)?.contentEl.createDiv({text : "this is a test spanferkel", attr : {"style": `position:absolute;z-index:100000;left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}px`}})
		// new ColorPickerModal(this.app, coordsAtPos).open();
		
		var popover = new HoverPopover(this, null);
		popover.hoverEl.setText("Spanferkel");
		popover.hoverEl.setAttr("style", `left:${coordsAtPos.left}px; top:${coordsAtPos.bottom}px`)
	}
}




class FastTextColorPluginSettingTab extends PluginSettingTab {
	plugin: FastTextColorPlugin;

	constructor(app: App, plugin: FastTextColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
