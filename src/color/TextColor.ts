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


	className: string;

	// enables the use of theme colors.
	useCssColorVariable: boolean;
	colorVariable: string;

	/**
	 * Create a basic Text Color
	 *
	 * @param {string} color - [TODO:description]
	 * @param {string} id - the id or name of the color
	 * @param {string} themeName - the associated theme that this color belongs to
	 * @param {boolean} [italic] - italic text
	 * @param {boolean} [bold] - bold text
	 * @param {number} [cap_mode_index] - the index for the cap mode
	 * @param {number} [line_mode_index] - the index for the line mode
	 * @param {string} [keybind] - the associated keybind
	 * @param {string} colorVariable - the builtin Css color variable that this color uses.
	 */
	constructor(
		color: string,
		id: string,
		themeName: string,
		italic: boolean = false,
		bold: boolean = false,
		cap_mode_index: number = 0,
		line_mode_index: number = 0,
		keybind: string = '',
		useCssColorVariable: boolean = false,
		colorVariable: string = "--color-base-00"
	) {
		this.color = color;
		this.id = id;
		this.keybind = keybind;

		// text style
		this.italic = italic;
		this.bold = bold;
		this.cap_mode = new CycleState(['normal', 'all_caps', 'small_caps'], cap_mode_index);
		this.line_mode = new CycleState(['none', 'underline', 'overline', 'line-through'], line_mode_index);

		this.useCssColorVariable = useCssColorVariable;
		this.colorVariable = colorVariable;

		this.className = `${CSS_COLOR_PREFIX}${themeName}-${this.id}`
	}

	getColorValue(): string {
    return this.useCssColorVariable ? `var(${this.colorVariable})` : this.color;
	}

	getCssClass(): string {
		return `.${CSS_COLOR_PREFIX}${this.id} { 
				color: ${this.getColorValue()};\n
				${this.italic ? "font-style: italic;\n" : ''}
				${this.bold ? 'font-weight: bold;\n' : ''}
				${this.line_mode.state != "none" ? `text-decoration: ${this.line_mode.state};\n` : ''}
				${this.cap_mode.state == "all_caps" ? "text-transform: uppercase;\n" : this.cap_mode.state == "small_caps" ? "font-variant: small-caps;\n" : ''}
				${VAR_COLOR_PREFIX}${this.id} : ${this.color};
			    }`;
	}

	/**
	 * get the inner css of the class for the color.
	 *
	 * @returns {string} the inner css.
	 */
	getInnerCss(): string {
		return `color: ${this.getColorValue()};\n` +
			`${this.italic ? "font-style: italic;\n" : ''}` +
			`${this.bold ? 'font-weight: bold;\n' : ''}` +
			`${this.line_mode.state != "none" ? `text-decoration: ${this.line_mode.state};\n` : ''}` +
			`${this.cap_mode.state == "all_caps" ? "text-transform: uppercase;\n" : this.cap_mode.state == "small_caps" ? "font-variant: small-caps;\n" : ''}`;
	}


	getCssInlineStyle(): string {
		return `color: ${this.getColorValue()};
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
