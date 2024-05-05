import { CSS_COLOR_PREFIX, VAR_COLOR_PREFIX } from "../FastTextColorSettings";

export class TextColor {
	color: string;
	id: string;

	// text style
	italic: boolean;
	bold: boolean;
	cap_mode: CycleState;
	line_mode: CycleState;

	keybind: string;

	constructor(color: string, id: string, italic: boolean = false, bold: boolean = false, cap_mode_index: number = 0, line_mode_index: number = 0, keybind: string = '') {
		this.color = color;
		this.id = id;
		this.keybind = keybind;

		// text style
		this.italic = italic;
		this.bold = bold;
		this.cap_mode = new CycleState(['normal', 'all_caps', 'small_caps'], cap_mode_index);
		this.line_mode = new CycleState(['none', 'underline', 'overline', 'line-through'], line_mode_index);
	}

	className(): string {
		return `${CSS_COLOR_PREFIX}${this.id}`
	}

	getCssClass(): string {
		// what is going on?
		return `.${CSS_COLOR_PREFIX}${this.id} { 
				color : ${this.color}\n;
				${this.italic ? "font-style: italic;\n" : ''}
				${this.bold ? 'font-weight: bold;\n' : ''}
				${this.line_mode.state != "none" ? `text-decoration: ${this.line_mode.state};\n` : ''}
				${this.cap_mode.state == "all_caps" ? "text-transform: uppercase;\n" : this.cap_mode.state == "small_caps" ? "font-variant: small-caps;\n" : ''}
				${VAR_COLOR_PREFIX}${this.id} : ${this.color};
			    }`;
	}

	getCssInlineStyle(): string {
		return `color : ${this.color}\n;
				${this.italic ? "font-style: italic;" : ''}
				${this.bold ? 'font-weight: bold;' : ''}
				${this.line_mode.state != "none" ? `text-decoration: ${this.line_mode.state};` : ''}
				${this.cap_mode.state == "all_caps" ? "text-transform: uppercase;" : this.cap_mode.state == "small_caps" ? "font-variant: small-caps;" : ''}
				`
	}
}

export class CycleState {
	state: string;
	private states: string[];
	index: number;

	constructor(states: string[], index: number = 0) {
		this.states = states;

		if (states.length <= 0) {
			this.state = "error";
			return;
		}

		this.state = this.states[index];
		this.index = index;
	}

	public cycle() {
		this.index = (this.index + 1) % this.states.length;
		this.state = this.states[this.index];
	}
}
