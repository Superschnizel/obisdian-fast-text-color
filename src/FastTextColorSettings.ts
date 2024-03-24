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
		new TextColor("#ad360e", `1`),
		new TextColor("#370c94", `2`),
		new TextColor("#0c9476", `3`),
		new TextColor("#0c9417", `4`)],
	counter: 4
}

export class FastTextColorPluginSettingTab extends PluginSettingTab {
	plugin: FastTextColorPlugin;

	constructor(app: App, plugin: FastTextColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		let count = 1;
		this.plugin.settings.colors.forEach((color: TextColor) => {
			this.createColorSetting(containerEl, color, count);
			count++;
		});

		new Setting(containerEl)
			.setName("Add new Color")
			.addButton(btn => {
				btn.setButtonText("+")
					.onClick(async evt => {
						this.plugin.settings.colors.push(new TextColor("#ffffff", `${CSS_COLOR_PREFIX}${this.plugin.settings.colors.length}`));
						await this.plugin.saveSettings();
						this.display();
					})
			})
			.addButton(btn => {
				btn
					.setButtonText("-")
					.onClick(async evt => {
						this.plugin.settings.colors.pop();
						await this.plugin.saveSettings();
						this.display();
					})
			})
	}

	createColorSetting(container: HTMLElement, tColor: TextColor, count: number): void {

		let frag = new DocumentFragment()
		let fragdiv = frag.createDiv();
		fragdiv.innerHTML = `${count} - Textcolor`;
		fragdiv.addClass(tColor.id);

		new Setting(container)
			.setName(frag)
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
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
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
						await this.plugin.saveSettings();
						this.plugin.setCssVariables();
					})
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
				.onClick(async evt => {
					moveColor(count - 1, -1, this.plugin.settings);
					await this.plugin.saveSettings();
					this.display();
				})
			})
			.addButton(btn => {
				btn
					.setIcon("chevron-down")
				.onClick(async evt => {
					moveColor(count - 1, 1, this.plugin.settings);
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
