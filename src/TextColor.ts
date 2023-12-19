
export class TextColor {
	color: string;
	cssName: string;

	// text style
	italic: boolean;
	bold: boolean;
	cap_mode: CycleState;
	line_mode: CycleState;

	constructor(color: string, cssName: string) {
		this.color = color;
		this.cssName = cssName;

		// text style
		this.italic = false;
		this.bold = false;
		this.cap_mode = new CycleState(['normal', 'all_caps', 'small_caps']);
		this.line_mode = new CycleState(['none', 'underline', 'overline', 'line-through']);
	}

	getCssStyle(): string {
		return `.${this.cssName} {\n 
				color : ${this.color};\n
				${this.italic ? "font-style: italic;\n" : ''}
				${this.bold ? 'font-weight: bold;\n' : ''}
				${this.line_mode.state != "none" ? `text-decoration: ${this.line_mode.state};\n` : ''}
				${this.cap_mode.state == "all_caps" ? "text-transform: uppercase;\n" : this.cap_mode.state == "small_caps" ? "font-variant: small-caps;\n" : ''}
			    }`;
	}
}

export class CycleState {
	state: string;
	private states: string[];
	private index: number;

	constructor(states: string[]) {
		this.states = states;

		if (states.length <= 0) {
			this.state = "error";
			return;
		}

		this.state = this.states[0];
		this.index = 0;
	}

	public	cycle() {
		this.index = (this.index + 1) % this.states.length;
		this.state = this.states[this.index];
	}
}
