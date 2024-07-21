import FastTextColorPlugin from 'main';
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { TextColor } from "./color/TextColor";
import { TextColorTheme } from "./color/TextColorTheme";
import { confirmByModal } from "./utils/ConfirmationModal"
import { CreateNewThemeModal } from './utils/CreateNewThemeModal';
import { getKeyBindWithModal } from "./utils/KeyBindModal"

// --------------------------------------------------------------------------
//                            CONSTANTS
// --------------------------------------------------------------------------

export const CSS_COLOR_PREFIX = "ftc-color-"
export const VAR_COLOR_PREFIX = "--ftc-color-"

export const SETTINGS_VERSION = "3"

export const DEFAULT_COLORS = [
	new TextColor("#ff0000", `red`, "default", false, false, 0, 0, 'A'),
	new TextColor("#ea732a", `orange`, "default", false, false, 0, 0, 'S'),
	new TextColor("#f0cc2e", `yellow`, "default", false, false, 0, 0, 'D'),
	new TextColor("#bc18dc", `magenta`, "default", false, false, 0, 0, 'F'),
	new TextColor("#51070f", `green`, "default", false, false, 0, 0, 'J'),
	new TextColor("#28c883", `cyan`, "default", false, false, 0, 0, 'K'),
	new TextColor("#2778ff", `blue`, "default", false, false, 0, 0, 'L'),
	new TextColor("#123f59", `black`, "default", false, false, 0, 0, 'Ö')];

export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	themes: [new TextColorTheme("default", DEFAULT_COLORS)],
	themeIndex: 0,
	version: SETTINGS_VERSION,
	interactiveDelimiters: true,
	useKeybindings: true,
	useNodeRebuilding: false
}


export interface FastTextColorPluginSettings {
	themes: Array<TextColorTheme>;
	themeIndex: number;

	version: string;
	interactiveDelimiters: boolean;
	useKeybindings: boolean;
	useNodeRebuilding: boolean;
}

// --------------------------------------------------------------------------
//                            Setting Functions.
// --------------------------------------------------------------------------

/**
 * Get the colors of the current selected theme or the theme given by the index.
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings
 * @param {number} [index] - the index.
 * @returns {TextColor[]} 
 */
export function getColors(settings: FastTextColorPluginSettings, index: number = -1): TextColor[] {
	if (index == -1) {
		index = settings.themeIndex;
	}
	return settings.themes[index].colors;
}


/**
 * get the current theme
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings.
 */
export function getCurrentTheme(settings: FastTextColorPluginSettings, index: number = -1): TextColorTheme {
	if (index == -1) {
		index = settings.themeIndex;
	}
	return settings.themes[index];
}

// THEME functions
/**
 * add a new theme to the settings. will contain default colors.
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings.
 * @param {string} name - the name of the new theme.
 * @param {TextColor[]} [DEFAULT_COLORS] - custom colors can be set.
 */
export function addTheme(settings: FastTextColorPluginSettings, name: string, colors: TextColor[] = DEFAULT_COLORS) {
	settings.themes.push(new TextColorTheme(name, colors));
}

/**
 * Changes the current theme index in the settings to the next.
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings.
 */
export function selectNextTheme(settings: FastTextColorPluginSettings) {
	settings.themeIndex = (settings.themeIndex + 1) % settings.themes.length;
}

/**
 * Changes the current theme index in the settings to the previous
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings.
 */
export function selectPreviousTheme(settings: FastTextColorPluginSettings) {
	settings.themeIndex = (settings.themes.length + settings.themeIndex - 1) % settings.themes.length;
}

/**
 * Remove the currently active theme from the list of themes.
 *
 * @param {FastTextColorPluginSettings} settings - the plugin settings.
 */
export function deleteTheme(settings: FastTextColorPluginSettings, index: number = -1) {
	if (settings.themes.length <= 1) {
		return;
	}
	if (index == -1) {
		index = settings.themeIndex;
	}
	settings.themes.slice(index, 1);
	settings.themeIndex = 0;
}

// UPDATESETTINGS
/**
 * Update the settings if their version is not current.
 *
 * @param {any} settings - the plugin settings.
 * @returns {FastTextColorPluginSettings} 
 */
export function updateSettings(settings: any): FastTextColorPluginSettings {
	switch (settings.version) {
		case "1":
		case "2":
			const colors = settings.colors.map((color: TextColor) => {
				return new TextColor(color.color, color.id, "default", color.italic, color.bold, color.cap_mode.index, color.line_mode.index, color.keybind);
			})
			const outSettings: FastTextColorPluginSettings = {
				themes: [new TextColorTheme("default", colors)],
				themeIndex: 0,
				version: SETTINGS_VERSION,
				interactiveDelimiters: settings.interactiveDelimiters,
				useKeybindings: true,
				useNodeRebuilding: false
			}
			return outSettings;

		default:
			console.log(`There is not update method for Settings Version ${settings.version}!\n${settings}`);

			return DEFAULT_SETTINGS;
	}
}

// --------------------------------------------------------------------------
//                           Settings Tab
// --------------------------------------------------------------------------

export class FastTextColorPluginSettingTab extends PluginSettingTab {
	plugin: FastTextColorPlugin;

	newId: string;

	editThemeIndex: number;

	constructor(app: App, plugin: FastTextColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.newId = ''
		this.editThemeIndex = plugin.settings.themeIndex;
	}


	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;

		containerEl.empty();

		// containerEl.createDiv().innerText = "Define your colors here. The numbers on the left indicate wich number key can be pressed to insert the color. Change the order of the colors to change which ones will be activated by the number keys. Be careful when changing the ID of the colors as this does not change the assignment in the notes."
		// containerEl.createEl('h1').innerText = "Colors";
		new Setting(containerEl).setName('Colors').setHeading();

		new Setting(containerEl)
			.setName("Set active theme")
			.setDesc("Set global active theme.")
			.addDropdown(dd => {
				let count = 0;
				settings.themes.forEach(theme => {
					dd.addOption(count.toString(), theme.name)
					count++;
				});
				dd.setValue(settings.themeIndex.toString())
				dd.onChange(value => {
					settings.themeIndex = +value;
					this.plugin.saveSettings();
					this.plugin.setCssVariables();
					this.display();
				})
			})

		// ------------------------------------------------------------------
		//                       THEME SETTINGS
		// ------------------------------------------------------------------

		new Setting(containerEl)
			.setName("Edit themes")
			.setDesc("Add new themes or edit existings ones.")
			.setClass("ftc-settings-theme-header")
			.addDropdown(dd => {
				let count = 0;
				settings.themes.forEach(theme => {
					dd.addOption(count.toString(), theme.name)
					count++;
				});
				dd.setValue(this.editThemeIndex.toString())
				dd.onChange(value => {
					this.editThemeIndex = +value;
					this.display();
				})
			})
			.addButton(btn => {
				btn
					.setIcon("plus")
					.setTooltip("add new Theme")
					.onClick(evt => {
						const modal = new CreateNewThemeModal(this.app, settings);
						modal.onSuccess(() => {
							this.plugin.saveSettings();
							this.display()
						});
						modal.open();
					})
			})
			.addButton(btn => {
				btn
					.setIcon("trash")
					.setTooltip("delete theme")
					.onClick(async evt => {
						if (await confirmByModal(this.app, `Are you sure?\n The theme ${settings.themes[settings.themeIndex].name} will no longer be available. `)) {
							deleteTheme(settings, this.editThemeIndex);
							this.editThemeIndex = 0;
							this.plugin.saveSettings();
							this.display();
						}
					})

			})

		const themeColorsEl = containerEl.createDiv();
		themeColorsEl.addClass("ftc-theme-colors");

		// Create Settings for individual Colors.
		let count = 1;
		getColors(settings, this.editThemeIndex).forEach((color: TextColor) => {
			this.createColorSetting(themeColorsEl, color, count);
			count++;
		});

		new Setting(containerEl)
			.setName("Add new color to theme")
			.setClass("ftc-settings-theme-footer")
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
						let colors = getColors(settings, this.editThemeIndex);
						if (colors.some(tColor => { return tColor.id == this.newId })) {
							new Notice(`color with id ${this.newId} already exists!`);
						}

						let newColorName = this.newId == '' ? (colors.length + 1).toString() : this.newId;
						colors.push(new TextColor("#ffffff", newColorName , getCurrentTheme(settings, this.editThemeIndex).name));
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
		// containerEl.createEl('h1').innerText = "Other";
		new Setting(containerEl).setName('Other').setHeading();
		new Setting(containerEl)
			.setName("Interactive delimiters")
			.setDesc("Use interactive delimiter to change colors inside the editor.")
			.addToggle(tgl => {
				tgl.setValue(settings.interactiveDelimiters)
					.onChange(async value => {
						settings.interactiveDelimiters = value;
						await this.plugin.saveSettings();
					})
			})
		new Setting(containerEl)
			.setName("Use keybindings")
			.setDesc("If enabled will allow you to use keybindings to activate colors from the colormenu")
			.addToggle(tgl => {
				tgl.setValue(settings.useKeybindings)
					.onChange(async value => {
						settings.useKeybindings = value;
						await this.plugin.saveSettings();
					})
			})

		new Setting(containerEl)
			.setName("Use node rebuilding (EXPERIMENTAL)")
			.setDesc("Enable node rebuilding in the postprocessing. Should fix most issues with objects loosing interactivity.\nBecause this feature is still in testing, enabling it might lead to unforseen rendering errors or (very unlikely) crashing.\nIf you find any issues with this rendering method please report them at the plugins github.")
			.addToggle(tgl => {
				tgl.setValue(settings.useNodeRebuilding)
				.onChange(async value => {
						settings.useNodeRebuilding = value;
						await this.plugin.saveSettings();
				})
		})
	}

	/**
	 * Create a color row in the theme view 
	 *
	 * @param {HTMLElement} container - the root container of the element.
	 * @param {TextColor} tColor - the color to be used for display
	 * @param {number} count - the index of the color
	 */
	createColorSetting(container: HTMLElement, tColor: TextColor, count: number): void {

		let frag = new DocumentFragment()
		let fragdiv = frag.createDiv();
		fragdiv.addClass("ftc-name-div")

		const key = fragdiv.createDiv();
		key.innerText = `${tColor.id}`;

		const exampletext = fragdiv.createDiv()
		// exampletext.addClass(`${CSS_COLOR_PREFIX}${tColor.id}`);
		exampletext.setAttr("style", tColor.getCssInlineStyle());
		exampletext.innerText = `~={${tColor.id}}This is colored text=~`

		new Setting(container)
			.setName(frag)
			// .setClass("fadeInLeft")
			.setClass("ftc-settings-item")
			.addButton(btn => {
				btn
					.setButtonText(`${tColor.keybind}`.toUpperCase())
					.setTooltip("set keybinding")
					.setClass("key-indicator")

					.onClick(async evt => {
						tColor.keybind = await getKeyBindWithModal(this.app);

						btn.setButtonText(`${tColor.keybind}`);
						await this.plugin.saveSettings();

						this.plugin.setCssVariables();
					})
				// btn.buttonEl.addClass("ftc-format-left")
			})

			.addButton(btn => {
				btn
					.setButtonText("B")
					.setTooltip("Bold")
					.setClass("ftc-format-item")

					.onClick(async evt => {
						tColor.bold = !tColor.bold;

						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
						btn.buttonEl.setCssStyles({ fontWeight: tColor.bold ? "bold" : "normal" });

						await this.plugin.saveSettings();
						this.plugin.setCssVariables();

						exampletext.setAttr("style", tColor.getCssInlineStyle());
					})

				btn.buttonEl.addClass("ftc-format-left")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
				btn.buttonEl.setCssStyles({ fontWeight: tColor.bold ? "bold" : "normal" });
			})

			.addButton(btn => {
				btn
					.setButtonText("I")
					.setTooltip("Italic")
					.setClass("ftc-format-item")

					.onClick(async evt => {
						tColor.italic = !tColor.italic;

						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
						btn.buttonEl.setCssStyles({ fontStyle: tColor.italic ? "italic" : "normal" });

						await this.plugin.saveSettings();
						this.plugin.setCssVariables();

						exampletext.setAttr("style", tColor.getCssInlineStyle());
					})

				btn.buttonEl.addClass("ftc-format-middle")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
				btn.buttonEl.setCssStyles({ fontStyle: tColor.italic ? "italic" : "normal" });
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
						btn.buttonEl.setCssStyles({ textDecoration: tColor.line_mode.state });
						btn.setTooltip(tColor.line_mode.state);

						await this.plugin.saveSettings();
						this.plugin.setCssVariables();

						exampletext.setAttr("style", tColor.getCssInlineStyle());
					})

				btn.buttonEl.addClass("ftc-format-middle");
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.line_mode.state != "none");
				btn.buttonEl.setCssStyles({ textDecoration: tColor.line_mode.state });
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
						btn.buttonEl.setCssStyles(
							tColor.cap_mode.state == "all_caps" ? { textTransform: "uppercase" }
								: tColor.cap_mode.state == "small_caps" ? { fontVariant: "small_caps" } : {}
						);
						btn.setTooltip(tColor.cap_mode.state);

						await this.plugin.saveSettings();
						this.plugin.setCssVariables();

						exampletext.setAttr("style", tColor.getCssInlineStyle());
					})

				btn.buttonEl.addClass("ftc-format-right");
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.cap_mode.state != "normal");
				btn.buttonEl.setCssStyles(
					tColor.cap_mode.state == "all_caps" ? { textTransform: "uppercase" }
						: tColor.cap_mode.state == "small_caps" ? { fontVariant: "small_caps" } : {}
				);
			})
			.addColorPicker((cb) => {
				cb
					.setValue(tColor.color)
					.onChange(async (value) => {
						tColor.color = value;

						this.plugin.setCssVariables();
						await this.plugin.saveSettings();

						exampletext.setAttr("style", tColor.getCssInlineStyle());
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
							getColors(this.plugin.settings).remove(tColor);
						}
						await this.plugin.saveSettings();
						this.display();
					})
			})
	}
}

// moving up means decreasing index
function moveColor(index: number, direction: number, settings: FastTextColorPluginSettings) {
	if ((direction < 0 && index == 0) || (direction > 0 && index == getColors(settings).length - 1)) {
		return;
	}

	let temp = getColors(settings)[index + direction];
	getColors(settings)[index + direction] = getColors(settings)[index];
	getColors(settings)[index] = temp;
}
