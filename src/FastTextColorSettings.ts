import FastTextColorPlugin from 'main';
import { App, PluginSettingTab, Setting } from "obsidian";
import { TextColor } from "./TextColor";

export interface FastTextColorPluginSettings {
	colors: Array<TextColor>;
	counter: number;
}

export const CSS_COLOR_PREFIX = "--ftc-color-"

export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	colors: [
        new TextColor("#ad360e", `${CSS_COLOR_PREFIX}0`), 
        new TextColor("#370c94", `${CSS_COLOR_PREFIX}1`),
        new TextColor("##0c9476", `${CSS_COLOR_PREFIX}2`), 
        new TextColor("#0c9417", `${CSS_COLOR_PREFIX}3`)],
	counter: 4
}

export class FastTextColorPluginSettingTab extends PluginSettingTab {
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
				.setValue("whoops")
				.onChange(async (value) => {
					
					await this.plugin.saveSettings();
				}));

        this.plugin.settings.colors.forEach((color : TextColor) => {
            this.createColorSetting(containerEl, color);
        });
	}

    createColorSetting(container : HTMLElement, tColor : TextColor): void{
        new Setting(container)
            .setName('color ')
			.addButton(btn => {btn
				.setButtonText("B")
				.setTooltip("Bold")
				.setClass("ftc-format-item")
				.onClick(async evt => {
					tColor.bold = !tColor.bold;
					btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.bold);
					await this.plugin.saveSettings();
					this.plugin.setCssVariables();
				})
			})
			.addButton(btn => {btn
				.setButtonText("I")
				.setTooltip("Italic")
				.setClass("ftc-format-item")
				.onClick(async evt => {
					tColor.italic = !tColor.italic;
					btn.buttonEl.toggleClass("ftc-format-item-enabled", tColor.italic);
					await this.plugin.saveSettings();
					this.plugin.setCssVariables();
				})
			})
			.addButton(btn => {btn
				.setButtonText("U")
				.setTooltip(tColor.line_mode.toString())
				.setClass("ftc-format-item")
				.onClick(async evt => {
					// cycle through enum
					console.log(tColor.line_mode.toString());
				})
			})
            .addColorPicker((cb) => {cb
                .setValue(tColor.color)
                .onChange(async (value) => {
                    tColor.color = value;
					this.plugin.setCssVariables();
                    await this.plugin.saveSettings();
                })
            })
    }
}
