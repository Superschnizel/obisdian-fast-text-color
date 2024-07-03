# Fast Text Color

This Obsidian plugin allows you to create beautifully colored and still interactive notes with a custom coloring syntax. 

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/422a5839-d352-4f44-99d1-e76311a54900" width="75%">


## Features

- Custom coloring syntax that integrates well with existing obsidian syntax.
- Keyboard-centric coloring menu.
- Editor integrations to add and remove color.
- Wide variety of formatting options through the use of CSS classes.
- Sorting of Colors into themes and the ability to select them in a Notes frontmatter.
- No use of HTML tags.

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/c7974c32-1b92-4a9d-a539-13a2ec38ed1d" width="80%">

## Usage

Colored text uses the following syntax:

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/fdc4c624-7fc5-4b6a-9fa4-8e1de7fb97f4" width="60%">

```
~={id} This text is colored according to the id=~
```

The id maps to the color and formatting options given by the currently active theme wich can be changed in the settings.

The formatting options include:

- Text color
- Italic
- Bold
- Underline, overline, throughline
- Capital letters, small capitals

These options are handled with CSS classes, wich means that any changes apply retroactively to all sections marked with the respective id.

### Themes

Colors are boundled into themes. You can create, manage and set the currently active theme in the settings.

if you want to have a certain theme active in a note although it is not set as the currently active theme you can do so by setting the property `ftcTheme` in the frontmatter to the name of the theme you want to use.

### Applying Color

#### Editor Context Menu

Right clicking on highlighted text lets you change the textcolor via the context menu. All Colors available in the current theme will be shown.

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/4ad2c7c1-6f9b-4221-b3eb-ad26853cc0c1" width="30%">

#### Interactive Delimiter

If the interactive delimiter option is enabled in the settings (default). you can change or remove the color of text via the interactive delimiter shown in place of the color name.

<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/06587d0b-9e3d-4b24-9427-9ab5f655060b" width="30%">

#### Coloring Menu

Calling the `change text color` command opens the coloring menu, which allows you to choose the color of the selected text or inserts a colored section if no text is selected.

You can select a color by either by clicking on a button or by using the assigned keybind. Keybinds can be set in the settings or be disabled if so wanted.

<p float="left">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/6ff82ee6-e096-4095-9cd3-03839d15fe18" width="49%">
	<img src="https://github.com/Superschnizel/obisdian-fast-text-color/assets/47162464/e6c02305-fc4c-4325-be4b-41dc2f1155dc" width="49%">
</p>

## Known issues

These issues mainly arrise from the different techniques needed for Live Preview and Reading Mode and will be fixed in the future.

- **Reading Mode**.
	- an unopened closing delimiter `=~` will lead to problems in reading mode.

## Planned Features:

- [x] Selectable color themes
- [ ] More/better ways to apply color
	- [x] submenu in editor context menu
	- [ ] add suggester
 - [x] changing color through interactable delimiter.
 - [ ] Individual Commands for Theme Colors.
 - [ ] Automatically Color by Keyword
 - [ ] More (Custom) Css options.
 - [ ] Option to use a Suggester Modal to choose color
 - [ ] Full Note Commands (color by keyword etc.)

## How it works

This plugin works by using a custom parser which allows the colloring to interact with the usual obsidian syntax. For each coloring id a css class is created.
