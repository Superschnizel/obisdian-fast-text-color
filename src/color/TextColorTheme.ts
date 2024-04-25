import { TextColor } from "./TextColor";

export class TextColorTheme {
	colors: Array<TextColor>;
	
	name: string;
	
	constructor(name: string, colors: TextColor[]) {
		this.colors = colors;
		this.name = name;
	}
}
