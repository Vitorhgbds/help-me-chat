// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Configuration, OpenAIApi } = require("openai");
const Showdown = require('showdown');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left).show()
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "help-me-chat" is now active!');
	const OPENAI_API_KEY = await vscode.window.showInputBox({
		placeHolder: "Place your API Key here",
		prompt: "Provide yout OpenAI API Key."
	});

	const configuration = new Configuration({
		apiKey: OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('help-me-chat.error', async function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'help-me-chat', // Identifies the type of the webview. Used internally
			'Help Me Chat', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{} // Webview options. More on these later.
		);
		vscode.window.showInformationMessage('Hello World from Help Me Chat!');
		const prompt = await vscode.window.showInputBox({
			placeHolder: "Place your error here",
			prompt: "Please provide the error, and we will give you a possible solution"
		});
		console.log(prompt)
		if(prompt != undefined){
			const response = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages:[
					{"role": "system", "content": "You are a helpful code assistant."},
					{"role": "user", "content": "How to solve the following error: " + prompt + " ?"}
				],
				max_tokens: 1000,
			});
			panel.webview.html = getWebviewContent(response.data.choices[0].message.content);
			console.log(response.data.choices[0].message.content)
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

function getWebviewContent(chatResponse) {
	var converter = new Showdown.Converter(),
    chatHTML = converter.makeHtml(chatResponse);
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <style>
* {
  box-sizing: border-box;
}

/* Create two equal columns that floats next to each other */
.column {
  float: left;
  width: 50%;
  padding: 10px;
  height: 300px; /* Should be removed. Only for demonstration */
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}
</style>
	  <title>Cat Coding</title>
  </head>
  <body>
  Authors: <a href="https://www.linkedin.com/in/lucas-gavirachi-cardoso-7b214a16a/">Lucas Gavirachi Cardoso</a> & <a href="https://www.linkedin.com/in/vitor-hugo-garcez-a4843a195/">Vitor Hugo Garcez</a>
  <div class="row">
  <div class="column">
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </div>
  <div class="column">
    <h2>ChatGPTResponse</h2>
    <p>${chatHTML}</p>
  </div>
</div>
  </body>
  </html>`;
  }

module.exports = {
	activate,
	deactivate,
	getWebviewContent
}
