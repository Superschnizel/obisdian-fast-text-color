import FastTextColorPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { TextColor } from "./TextColor";

export interface FastTextColorPluginSettings {
	colors: Array<TextColor>;
}

export const DEFAULT_SETTINGS: FastTextColorPluginSettings = {
	colors: [
        new TextColor("#ad360e"), 
        new TextColor("#370c94"),
        new TextColor("##0c9476"), 
        new TextColor("#0c9417")]
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

        this.plugin.settings.colors.forEach(color => {
            this.createColor(containerEl, color);
        });
	}

    createColor(container : HTMLElement, tColor : TextColor): void{
        new Setting(container)
            .setName('color ')
            .addColorPicker((cb) => {cb
                .setValue(tColor.color)
                .onChange(async (value) => {
                    tColor.color = value;
                    await this.plugin.saveSettings;
                })
            })
    }
}