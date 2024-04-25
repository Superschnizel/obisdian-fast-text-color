import { App, Modal, Setting } from "obsidian";
import { addTheme, DEFAULT_COLORS, FastTextColorPluginSettings } from "../FastTextColorSettings";

export class CreateNewThemeModal extends Modal {
	settings: FastTextColorPluginSettings;
	name: string;

	errorDiv: HTMLElement;

	constructor(app: App, settings: FastTextColorPluginSettings) {
		super(app);

		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Create new theme" });
		// contentEl.createDiv({text: ""});

		new Setting(contentEl)
			.setName("Theme name")
			.addText(txt => {
				txt.setValue("newTheme")
					.setPlaceholder("theme name")
					.onChange(value => {
						this.name = value;
						this.evalNameErrors();
					})
			})

		this.errorDiv = contentEl.createDiv();
		this.errorDiv.addClass("ftc-theme-name-error")

		new Setting(contentEl)
			.addButton(btn => {
				btn
					.setButtonText("create")
					.onClick(evt => {
						if (this.evalNameErrors()) {
							return;
						}

						addTheme(this.settings, this.name, DEFAULT_COLORS);
					})
			})
			.addButton(btn => {
				btn
					.setButtonText("cancel")
					.onClick(evt => {
						this.close()
				})
			})

	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}

	evalNameErrors() {
		if (this.settings.themes.some(theme => { return theme.name == this.name })) {
			this.errorDiv.innerText = "a theme with this name already exists."
			return false;
		}

		if (this.name == '') {
			this.errorDiv.innerText = "name can not be empty."
			return false;
		}

		this.errorDiv.innerText = "";
		return true
	}
}
