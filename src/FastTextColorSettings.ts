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

// "--color-red": "red",
// "--color-orange": "orange",
// "--color-yellow": "yellow",
// "--color-green": "green",
// "--color-cyan": "cyan",
// "--color-blue": "blue",
// "--color-purple": "purple",
// "--color-pink": "pink",
export const BUILTIN_COLORS = [
	new TextColor("#000000", "red", "builtin", false, false, 0, 0, 'R', true, "--color-red"),
	new TextColor("#000000", "orange", "builtin", false, false, 0, 0, 'O', true, "--color-orange"),
	new TextColor("#000000", "yellow", "builtin", false, false, 0, 0, 'Y', true, "--color-yellow"),
	new TextColor("#000000", "green", "builtin", false, false, 0, 0, 'G', true, "--color-green"),
	new TextColor("#000000", "cyan", "builtin", false, false, 0, 0, 'C', true, "--color-cyan"),
	new TextColor("#000000", "blue", "builtin", false, false, 0, 0, 'B', true, "--color-blue"),
	new TextColor("#000000", "purple", "builtin", false, false, 0, 0, 'P', true, "--color-purple"),
	new TextColor("#000000", "pink", "builtin", false, false, 0, 0, 'I', true, "--color-pink"),
]

export const DEFAULT_COLORS = [
	new TextColor("#ff0000", `red`, "default", false, false, 0, 0, 'R'),
	new TextColor("#00ff00", `green`, "default", false, false, 0, 0, 'G'),
	new TextColor("#0000ff", `blue`, "default", false, false, 0, 0, 'B'),
	new TextColor("#00ffff", `cyan`, "default", false, false, 0, 0, 'C'),
	new TextColor("#ff00ff", `magenta`, "default", false, false, 0, 0, 'M'),
	new TextColor("#ffff00", `yellow`, "default", false, false, 0, 0, 'Y'),
	new TextColor("#000000", `black`, "default", false, false, 0, 0, 'K')];


export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	themes: [new TextColorTheme("default", DEFAULT_COLORS), new TextColorTheme("builtin", BUILTIN_COLORS)],
	themeIndex: 0,
	version: SETTINGS_VERSION,
	interactiveDelimiters: true,
	useKeybindings: true,
	useNodeRebuilding: false,
	colorCodeSection: false,
}


export interface FastTextColorPluginSettings {
	themes: Array<TextColorTheme>;
	themeIndex: number;

	version: string;
	interactiveDelimiters: boolean;
	useKeybindings: boolean;
	useNodeRebuilding: boolean;
	colorCodeSection: boolean;
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
	settings.themes.remove(settings.themes[index]);

	if (index <= settings.themeIndex) {
		settings.themeIndex = Math.max(settings.themeIndex - 1, 0);
	}
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
				useNodeRebuilding: false,
				colorCodeSection: settings.colorCodeSection,
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
						colors.push(new TextColor("#ffffff", newColorName, getCurrentTheme(settings, this.editThemeIndex).name));
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
			.setName("Use keybindings and colormenu")
			.setDesc("If enabled will allow you to use keybindings to activate colors from a custom colormenu.")
			.addToggle(tgl => {
				tgl.setValue(settings.useKeybindings)
					.onChange(async value => {
						settings.useKeybindings = value;
						await this.plugin.saveSettings();
					})
			})
		new Setting(containerEl)
			.setName("Color inline code")
			.setDesc("Apply color to inline code.")
			.addToggle(tgl => {
				tgl.setValue(settings.colorCodeSection)
					.onChange(async value => {
						settings.colorCodeSection = value;
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
			})

		// new Setting(containerEl)
		// 	.setName("Use node rebuilding (EXPERIMENTAL)")
		// 	.setDesc("Enable node rebuilding in the postprocessing. Should fix most issues with objects loosing interactivity.\nBecause this feature is still in testing, enabling it might lead to unforseen rendering errors or (very unlikely) crashing.\nIf you find any issues with this rendering method please report them at the plugins github.")
		// 	.addToggle(tgl => {
		// 		tgl.setValue(settings.useNodeRebuilding)
		// 		.onChange(async value => {
		// 				settings.useNodeRebuilding = value;
		// 				await this.plugin.saveSettings();
		// 		})
		// })
	}

	/**
	 * Create a color row in the theme view 
	 *
	 * @param {HTMLElement} container - the root container of the element.
	 * @param {TextColor} tColor - the color to be used for display
	 * @param {number} count - the index of the color
	 */
	createColorSetting(container: HTMLElement, tColor: TextColor, count: number): void {

		let nameFragment = new DocumentFragment()
		let nameDiv = nameFragment.createDiv();
		nameDiv.addClass("ftc-name-div")

		const key = nameDiv.createDiv();
		key.innerText = `${tColor.id}`;

		const exampletext = nameDiv.createDiv()
		// exampletext.addClass(`${CSS_COLOR_PREFIX}${tColor.id}`);
		exampletext.setAttr("style", tColor.getCssInlineStyle());
		exampletext.innerText = `~={${tColor.id}}This is colored text=~`

		// utility function to apply settings and update displaytext
		let saveAndApply = async () => {
			await this.plugin.saveSettings();
			this.plugin.setCssVariables();

			exampletext.setAttr("style", tColor.getCssInlineStyle());
		}

		const setting = new Setting(container)
			.setName(nameFragment)
			// .setClass("fadeInLeft")
			.setClass("ftc-settings-item")

			// KEYBIND
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

			// -------------------------------------------------------------
			//                      FORMATTING
			// -------------------------------------------------------------
			.addButton(btn => {
				btn
					.setButtonText("B")
					.setTooltip("Bold")
					.setClass("ftc-format-item")

					.onClick(async evt => {
						tColor.bold = !tColor.bold;

						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
						btn.buttonEl.setCssStyles({ fontWeight: tColor.bold ? "bold" : "normal" });

						saveAndApply()
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

						saveAndApply()
					})

				btn.buttonEl.addClass("ftc-format-middle")
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
				btn.buttonEl.setCssStyles({ fontStyle: tColor.italic ? "italic" : "normal" });
			})

			.addButton(btn => {
				btn
					.setButtonText("U")
					.setTooltip("Lining")
					.setClass("ftc-format-item")
					.onClick(async evt => {
						// cycle through enum
						tColor.line_mode.cycle();

						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.line_mode.state != "none");
						btn.buttonEl.setCssStyles({ textDecoration: tColor.line_mode.state });

						saveAndApply()
					})

				btn.buttonEl.addClass("ftc-format-middle");
				btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.line_mode.state != "none");
				btn.buttonEl.setCssStyles({ textDecoration: tColor.line_mode.state });
			})
			.addButton(btn => {
				btn
					.setButtonText("Tt")
					.setTooltip("Capitalization")
					.setClass("ftc-format-item")

					.onClick(async evt => {
						// cycle through enum
						tColor.cap_mode.cycle();

						btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.cap_mode.state != "normal");
						btn.buttonEl.toggleClass("ftc-uppercase", tColor.cap_mode.state == "all_caps");
						btn.buttonEl.toggleClass("ftc-small-caps", tColor.cap_mode.state == "small_caps");

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
			});

		// -------------------------------------------------------------
		// -------------------------------------------------------------

		if (tColor.useCssColorVariable) {
			setting.addDropdown(dd => {
				dd
					.addOptions({
						"--color-red": "red",
						"--color-orange": "orange",
						"--color-yellow": "yellow",
						"--color-green": "green",
						"--color-cyan": "cyan",
						"--color-blue": "blue",
						"--color-purple": "purple",
						"--color-pink": "pink",
						// "--color-blue" : "50",
						// "--color-blue" : "60",
						// "--color-blue" : "70",
						// "--color-base-100": "100",
					})
					.setValue(tColor.colorVariable)
					.onChange((value) => {
						tColor.colorVariable = value;

						saveAndApply();
					})
			})
		} else {
			setting.addColorPicker((cb) => {
				cb
					.setValue(tColor.color)
					.onChange(async (value) => {
						tColor.color = value;

						saveAndApply();
					})
			})
		}


		// COLOR
		// OBSIDIAN VARIABLES TOGGLE
		setting.addButton(btn => {
			btn
				.setTooltip("use builtin obsidian colors")
				.setClass("ftc-format-item-small")

				.onClick(async evt => {
					tColor.useCssColorVariable = !tColor.useCssColorVariable;

					btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.useCssColorVariable);

					saveAndApply()
					this.display()
				})

			btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.useCssColorVariable);
		})

			// UP-DONW
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

			// DELETE
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
