# Contextual Snippets Extension for VS Code

> This extension provides an advanced way to control the display of custom snippet suggestions.

![CI Status](https://img.shields.io/github/workflow/status/brpaz/vscode-contextual-snippets/CI?color=orange&label=actions&logo=github&logoColor=orange&style=for-the-badge)](https://github.com/brpaz/vscode-contextual-snippets)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/brpaz.contextual-snips.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=contextual-snips)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/brpaz.contextual-snips.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=brpaz.contextual-snips)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/brpaz.contextual-snips.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=contextual-snips)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## Background

Code snippets is a great way to improve coding speed. A problem that I found on VS Code is that the user have limited control, related to the criteria of display the snippets suggestions. The only filter you can do is by language.

This limitation can result in lots of noise, when we are dealing with many snippets, because the editor will provide snippet suggestions that are not applicable to the current context. 

For example, for YAML files, if I am editing a "GitHub Action" workflow, I don´t want to see snippet suggestions for other YAML files, let´s say Kubernetes. 
Even in the scope of a particular language, if am working on a Javascript application, but I am not using Jest for testing why should I see Jest related suggestions?

This extension aims to help with these problems, but allowing you to define some more conditions for your snippets.

## Features

The following conditions are supported:

* pattern: A glob pattern, that only the active file matches it, the snippet will be displayed.
* npm package: Allow define that a snippet will only be displayed in a specific package is present in the project `package.json`.
* support for more packages management to come. (PRs Welcome)

## Install

To install the extension, open the command pallete and type: `ext install brpaz.contextual-snips`.

## Usage

After installing the extension, you must configure the paths where this extension will look for snippets.

Open settings and set ```contextual-snips.snippets-path```.

You need to create your snippets in that path as json files.

The snippet format is similar to the VS Code format, but with some extra fields:

Ex:

```json
{
    "jest-afterall": {
        "body": [
            "afterAll(() => {\n\t$0\n});"
        ],
        "description": "afterAll function is called once after all specs",
        "prefix": [
            "jest afterall",
            "aa"
        ],
        "scope": "javascript,javascriptreact,typescript,typescriptreact",
        "context": {
            "patterns": [
                "**/*/*.spec.{ts,js}"
            ],
            "package": {
                "provider": "npm",
                "name": "jest"
            }
        }
    },
```

Note the `context` field. Here you can define a list of patterns where the snippet will be displayed as well as package related details.


## Contributing

All contributions are welcome. Just open an issue or PR!

You must respect the [Contributor Convenant Code of conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct) when contributing to this project.

If you like my work, feel free to buy me a Coffee ;)

<a href="https://www.buymeacoffee.com/Z1Bu6asGV" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

## Author

👤 **Bruno Paz**

* Website: [brunopaz.dev](https://brunopaz.dev)
* Github: [@brpaz](https://github.com/brpaz)
* Twitter: [@brunopaz88](https://twitter.com/brunopaz88)

## License

[MIT](LICENSE)