export class TextColor {
    color : string;
    cssName : string;

	// text style
	italic: boolean;
	bold: boolean;
	cap_mode: Cap_mode;
	line_mode: Line_mode;

    constructor(color : string, cssName : string){
        this.color = color;
        this.cssName = cssName;
		
		// text style
		this.italic = false;
		this.bold = false;
		this.cap_mode = Cap_mode.normal;
		this.line_mode = Line_mode.normal;
    }

	getCssStyle() : string {
		return `.${this.cssName} {\n 
				color : ${this.color};\n
				${this.italic ? "font-style: italic;\n" : ''}
				${this.bold ? 'font-weight: bold;\n' : ''}
				${this.line_mode != Line_mode.normal ? `text-decoration: ${this.line_mode.toString()};\n` : ''}
				${this.cap_mode == Cap_mode.all_caps ? "text-transform: uppercase;\n" : this.cap_mode == Cap_mode.small_caps ? "font-variant: small-caps;\n" : '' }
			    }`;
	}
}

export enum Cap_mode {
	normal = "normal",
	small_caps = "small-caps",
	all_caps = "uppercase"
}

export enum Line_mode {
	normal = "normal",
	underline = "underline",
	overline = "overline",
	linethrough = "linethrough"
}
