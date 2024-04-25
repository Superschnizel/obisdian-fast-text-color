import FastTextColorPlugin from 'main';
import { App, PluginSettingTab, Setting } from "obsidian";
import { TextColor } from "./color/TextColor";
import { TextColorTheme } from "./color/TextColorTheme";
import { confirmByModal } from "./utils/ConfirmationModal"
import { CreateNewThemeModal } from './utils/CreateNewThemeModal';
import { getKeyBindWithModal } from "./utils/KeyBindModal"

// CONSTANTS
export const CSS_COLOR_PREFIX = "ftc-color-"
export const VAR_COLOR_PREFIX = "--ftc-color-"

export const SETTINGS_VERSION = "3"

export const DEFAULT_COLORS = [
	new TextColor("#ff0000", `red`, false, false, 0, 0, 'A'),
	new TextColor("#ea732a", `orange`, false, false, 0, 0, 'S'),
	new TextColor("#f0cc2e", `yellow`, false, false, 0, 0, 'D'),
	new TextColor("#bc18dc", `magenta`, false, false, 0, 0, 'F'),
	new TextColor("#51070f", `green`, false, false, 0, 0, 'J'),
	new TextColor("#28c883", `cyan`, false, false, 0, 0, 'K'),
	new TextColor("#2778ff", `blue`, false, false, 0, 0, 'L'),
	new TextColor("#123f59", `black`, false, false, 0, 0, 'Ö')];

export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	themes: [new TextColorTheme("default", DEFAULT_COLORS)],
	themeIndex: 0,
	version: "3",
	interactiveDelimiters: true
}


export interface FastTextColorPluginSettings {
	themes: Array<TextColorTheme>;
	themeIndex: number;

	version: string;
	interactiveDelimiters: boolean;
}

export function getColors(settings: FastTextColorPluginSettings): TextColor[] {
	return settings.themes[settings.themeIndex].colors;
}

export function addTheme(settings: FastTextColorPluginSettings, name: string, colors: TextColor[] = DEFAULT_COLORS) {
	settings.themes.push(new TextColorTheme(name, colors));
}

export function selectNextTheme(settings: FastTextColorPluginSettings) {
	settings.themeIndex = (settings.themeIndex + 1) % settings.themes.length;
}

export function selectPreviousTheme(settings: FastTextColorPluginSettings) {
	settings.themeIndex = (settings.themes.length + settings.themeIndex - 1) % settings.themes.length;
}

export function deleteCurrentTheme(settings: FastTextColorPluginSettings) {
	if (settings.themes.length <= 1) {
		return;
	}
	settings.themes.slice(settings.themeIndex, 1);
	settings.themeIndex = 0;
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
		const { settings } = this.plugin;

		containerEl.empty();

		// containerEl.createDiv().innerText = "Define your colors here. The numbers on the left indicate wich number key can be pressed to insert the color. Change the order of the colors to change which ones will be activated by the number keys. Be careful when changing the ID of the colors as this does not change the assignment in the notes."
		containerEl.createEl('h1').innerText = "Colors";

		new Setting(containerEl)
			.setName("Theme")
			.addDropdown(dd => {
				let count = 0;
				settings.themes.forEach(theme => {
					dd.addOption(count.toString(), theme.name)
					count++;
				});
				dd.setValue(settings.themeIndex.toString())
				dd.onChange(value => {
					settings.themeIndex = +value;
				})
			})
			.addButton(btn => {
				btn
					.setIcon("plus")
					.setTooltip("add new Theme")
					.onClick(evt => {
						new CreateNewThemeModal(this.app, settings).open();
					})
			})
			.addButton(btn => {
				btn
					.setIcon("trash")
					.setTooltip("delete theme")
					.onClick(async evt => {
						if (await confirmByModal(this.app, `Are you sure?\n The theme ${settings.themes[settings.themeIndex]} will no longer be available. `)) {
							deleteCurrentTheme(settings);
						}

				})

			})

		let count = 1;
		getColors(settings).forEach((color: TextColor) => {
			this.createColorSetting(containerEl, color, count);
			count++;
		});

		new Setting(containerEl)
			.setName("Add new Color")
			.addText(txt => {
				txt
					.setValue(this.newId == '' ? (getColors(settings).length + 1).toString() : this.newId)
					.onChange(value => {
						this.newId = value;
					})
			})
			.addButton(btn => {
				btn.setButtonText("+")
					.onClick(async evt => {
						getColors(settings).push(new TextColor("#ffffff", this.newId == '' ? (getColors(settings).length + 1).toString() : this.newId));
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
		new Setting(containerEl)
			.setName("Interactive delimiters")
			.addToggle(tgl => {
				tgl.setValue(settings.interactiveDelimiters)
					.onChange(async value => {
						settings.interactiveDelimiters = value;
						await this.plugin.saveSettings();
					})
			})
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
			// .setClass("fadeInLeft")
			// .setClass("ftc-settings-item")
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
