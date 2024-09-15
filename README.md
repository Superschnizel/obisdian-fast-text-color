# Fast Text Color

This Obsidian plugin allows you to create beautifully colored interactive notes using a custom coloring syntax. 

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/422a5839-d352-4f44-99d1-e76311a54900" width="75%">


## Features
- Wide variety of available formatting options
- Full live preview support
- Multiple ways of applying/removing color to suit your individual needs
	- Multiple intuitive editor integrations
	- Custom coloring syntax that neatly integrates into Obsidian Markdown
	- Keyboard-only usage possible
- Bundle formatting presets into themes
	- Override active theme for individual notes through Frontmatter property
- No exposed HTML in the editing view
- Further in-depth customization using CSS classes

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/c7974c32-1b92-4a9d-a539-13a2ec38ed1d" width="80%">

## Usage

Color text sections using the following syntax:

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/fdc4c624-7fc5-4b6a-9fa4-8e1de7fb97f4" width="60%">

```
~={id} This text is colored according to the id=~
```

The id maps to one of the color formats provided by the current active theme, which can be selected in the settings.

The formatting options include:

- $\textsf{{\color[rgb]{1.0, 0.0, 0.0}T}{\color[rgb]{1.0, 0.5, 0.0}e}{\color[rgb]{1.0, 1.0, 0.0}x}{\color[rgb]{0.0, 1.0, 0.0}t~ }{\color[rgb]{0.0, 1.0, 1.0}c}{\color[rgb]{0.0, 0.0, 1.0}o}{\color[rgb]{0.33, 0.0, 0.5}l}{\color[rgb]{1.0, 0.0, 1.0}o}{\color[rgb]{1.0, 0.0, 0.5}r}}$: custom or provided by the active Obsidian theme.
- **Bold**
- *Italics*
- <ins>Under</ins>-, o̅v̅e̅r̅-, and ~~through~~lines
- FULL CAPS, Sᴍᴀʟʟ Cᴀᴘs

These options are handled using CSS classes, which means that any changes will be applied to preexisting sections marked with the respective id retroactively.

### Themes

Colors are bundled into themes, which can be created and edited in the plugin settings. You can also pick the global active theme there.

If you want to override your global active theme for a specific note, you can do so by setting the frontmatter property `ftcTheme` to the name of the theme you wish to use.

### Applying Color

#### Editor Context Menu

Right clicking on highlighted text lets you change the color via the context menu. All colors included in the current theme will be available.

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/4ad2c7c1-6f9b-4221-b3eb-ad26853cc0c1" width="30%">

#### Interactive Delimiter

If the interactive delimiter option is enabled in the settings (default), you can change or remove the color of text using the interactive delimiter shown in place of the color name.

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/06587d0b-9e3d-4b24-9427-9ab5f655060b" width="30%">

### Command

Calling the `change text color` command lets you choose one of the colors that are available from the currently selected theme using a suggester modal.

#### Coloring Menu

If the option *Use keybindings and colormenu* is set, calling the `change text color` command instead opens the coloring menu.

You can select a color by clicking the corresponding button or using the keybind assigned in the theme editor.

<p float="left">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/6ff82ee6-e096-4095-9cd3-03839d15fe18" width="49%">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/e6c02305-fc4c-4325-be4b-41dc2f1155dc" width="49%">
</p>

## Known Issues

These issues mainly arise from the different techniques required for live preview and reading mode and will be fixed in the future.

- **Reading Mode**.
	- An unopened closing delimiter `=~` will lead to problems in reading mode.

## Planned Features

- [x] Selectable color themes
- [ ] More/better ways to apply color
	- [x] Submenu in editor context menu
    - [ ] Suggester modal
 - [x] Changing color through interactive delimiter
 - [ ] Individual commands for theme colors
 - [ ] Automatically color by keyword
 - [ ] More (custom) CSS options
 - [ ] Full note commands (color by keyword etc.)

## How It Works

This plugin uses a custom parser, which allows the coloring to interact with the established Obsidian Markdown syntax. A CSS class containing the specified style options is created for each color id.
