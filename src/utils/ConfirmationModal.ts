import { App, Modal, Setting } from "obsidian";

class ConfirmationModal extends Modal {
	result: string;
	message :string;
	heading: string;

	finished: boolean;
	confirmed: boolean;

	constructor(app: App, message:string, heading:string) {
		super(app);

		this.message = message;
		this.heading = heading;

		this.confirmed = false;
		this.finished = false;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: this.heading});
		contentEl.createDiv({text: this.message});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("OK")
					.setCta()
					.onClick(() => {
						this.finished = true;
						this.confirmed = true;
					}))
			.addButton((btn) =>
				btn
					.setButtonText("Cancel")
					.setCta()
					.onClick(() => {
						this.finished = true;
					}))
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}


export async function confirmByModal(app: App, message:string='', heading:string='') : Promise<boolean>{
	let modal = new ConfirmationModal(app, message != '' ? message : "Are you sure?", heading != '' ? heading : "Confirm");
	modal.open();

	while (!modal.finished) {
		await sleep(16); // only check periodically
	}
	
	let result = modal.confirmed;

	modal.close();

	return result;
}
