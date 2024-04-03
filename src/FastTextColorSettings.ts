import FastTextColorPlugin from 'main';
import { App, PluginSettingTab, Setting } from "obsidian";
import { TextColor } from "./color/TextColor";
import { confirmByModal } from "./utils/ConfirmationModal"
import { getKeyBindWithModal } from "./utils/KeyBindModal"

export interface FastTextColorPluginSettings {
	colors: Array<TextColor>;
	version: string;
}

export const CSS_COLOR_PREFIX = "--ftc-color-"

export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	colors: [
		new TextColor("#ff0000", `red`, false, false, 0, 0, 'A'),
		new TextColor("#ea732a", `orange`, false, false, 0, 0, 'S'),
		new TextColor("#f0cc2e", `yellow`, false, false, 0, 0, 'D'),
		new TextColor("#bc18dc", `magenta`, false, false, 0, 0, 'F'),
		new TextColor("#51070f", `green`, false, false, 0, 0, 'J'),
		new TextColor("#28c883", `cyan`, false, false, 0, 0, 'K'),
		new TextColor("#2778ff", `blue`, false, false, 0, 0, 'L'),
		new TextColor("#123f59", `black`, false, false, 0, 0, 'Ö')],
	version: "1"
}

export class FastTextColorPluginSettingTab extends PluginSettingTab {
	plugin: FastTextColorPlugin;

	newId: string;

	constructor(app: App, plugin: FastTextColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.newId = ''
	}


	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// containerEl.createDiv().innerText = "Define your colors here. The numbers on the left indicate wich number key can be pressed to insert the color. Change the order of the colors to change which ones will be activated by the number keys. Be careful when changing the ID of the colors as this does not change the assignment in the notes."
		containerEl.createEl('h1').innerText = "Colors";

		let count = 1;
		this.plugin.settings.colors.forEach((color: TextColor) => {
			this.createColorSetting(containerEl, color, count);
			count++;
		});

		new Setting(containerEl)
			.setName("Add new Color")
			.addText(txt => {
				txt
					.setValue(this.newId == '' ? (this.plugin.settings.colors.length + 1).toString() : this.newId)
					.onChange(value => {
						this.newId = value;
					})
			})
			.addButton(btn => {
				btn.setButtonText("+")
					.onClick(async evt => {
						this.plugin.settings.colors.push(new TextColor("#ffffff", this.newId == '' ? (this.plugin.settings.colors.length + 1).toString() : this.newId));
						await this.plugin.saveSettings();
						this.display();
					})
			})
		// .addButton(btn => {
		// 	btn
		// 		.setButtonText("-")
		// 		.setTooltip("remove last color")
		// 		.onClick(async evt => {
		// 			this.plugin.settings.colors.pop();
		// 			await this.plugin.saveSettings();
		// 			this.display();
		// 		})
		// })
	}

	createColorSetting(container: HTMLElement, tColor: TextColor, count: number): void {

		let frag = new DocumentFragment()
		let fragdiv = frag.createDiv();
		fragdiv.addClass("ftc-name-div")

		const key = fragdiv.createDiv();
		key.innerText = `${tColor.id}`;

		const exampletext = fragdiv.createDiv()
		exampletext.addClass(`${CSS_COLOR_PREFIX}${tColor.id}`);
		exampletext.innerText = `~={${tColor.id}}This is colored text=~`

		new Setting(container)
			.setName(frag)
			.addButton(btn => {
				btn
					.setButtonText(`${tColor.keybind}`)
					.setTooltip("keybinding")
					.setClass("key-indicator")
					.onClick(async evt => {
						tColor.keybind = await getKeyBindWithModal(this.app);
						btn.setButtonText(`${tColor.keybind}`);
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
				btn.buttonEl.addClass("ftc-format-left")
			})
			.addButton(btn => {
				btn
					.setButtonText("B")
					.setTooltip("Bold")
					.setClass("ftc-format-item")
					.onClick(async evt => {
						tColor.bold = !tColor.bold;
						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
				btn.buttonEl.addClass("ftc-format-left")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
			})
			.addButton(btn => {
				btn
					.setButtonText("I")
					.setTooltip("Italic")
					.setClass("ftc-format-item")
					.onClick(async evt => {
						tColor.italic = !tColor.italic;
						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
				btn.buttonEl.addClass("ftc-format-middle")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
			})
			.addButton(btn => {
				btn
					.setButtonText("U")
					.setTooltip(tColor.line_mode.state)
					.setClass("ftc-format-item")
					.onClick(async evt => {
						// cycle through enum
						tColor.line_mode.cycle();
						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.line_mode.state != "none");
						btn.setTooltip(tColor.line_mode.state);
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
				btn.buttonEl.addClass("ftc-format-middle")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.line_mode.state != "none");
			})
			.addButton(btn => {
				btn
					.setButtonText("Tt")
					.setTooltip(tColor.cap_mode.state)
					.setClass("ftc-format-item")
					.onClick(async evt => {
						// cycle through enum
						tColor.cap_mode.cycle();
						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.cap_mode.state != "normal");
						btn.setTooltip(tColor.cap_mode.state);
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
				btn.buttonEl.addClass("ftc-format-right")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.cap_mode.state != "normal");
			})
			.addColorPicker((cb) => {
				cb
					.setValue(tColor.color)
					.onChange(async (value) => {
						tColor.color = value;
						this.plugin.setCssVariables();
						await this.plugin.saveSettings();
					})
			})
			.addButton(btn => {
				btn
					.setIcon("chevron-up")
					.setTooltip("move item up")
					.setClass("ftc-move-btn-left")
					.onClick(async evt => {
						moveColor(count - 1, -1, this.plugin.settings);
						await this.plugin.saveSettings();
						this.display();
					})
			})
			.addButton(btn => {
				btn
					.setIcon("chevron-down")
					.setTooltip("move item down")
					.setClass("ftc-move-btn-right")
					.onClick(async evt => {
						moveColor(count - 1, 1, this.plugin.settings);
						await this.plugin.saveSettings();
						this.display();
					})
			})
			.addButton(btn => {
				btn
					.setIcon("trash")
					.setTooltip("delete color")
					.setClass("ftc-move-btn-right")
					.onClick(async evt => {
						if (await confirmByModal(this.app,
							`Colored section whith the id "${tColor.id}" will no longer be colored until you add another color with that id.`,
							`Delete color: ${tColor.id}`)) {
							this.plugin.settings.colors.remove(tColor);
						}
						await this.plugin.saveSettings();
						this.display();
					})
			})
	}
}

// moving up means decreasing index
function moveColor(index: number, direction: number, settings: FastTextColorPluginSettings) {
	if ((direction < 0 && index == 0) || (direction > 0 && index == settings.colors.length - 1)) {
		return;
	}

	let temp = settings.colors[index + direction];
	settings.colors[index + direction] = settings.colors[index];
	settings.colors[index] = temp;
}
