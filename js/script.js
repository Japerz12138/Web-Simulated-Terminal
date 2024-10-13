document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('input');
    const output = document.getElementById('output');

    let commands = {};
    let asciiArt = '';
    let welcomeMessage = '';
    let fileSystem = {};
    let currentPath = ['root'];

    let commandHistory = [];
    let historyIndex = -1;

    // Load the command json
    fetch('../json/commands.json')
        .then(response => response.json())
        .then(data => {
            commands = data.commands;
            asciiArt = data.asciiArt || '';  //Load Cyberhack ASCII!
            welcomeMessage = data.welcomeMessage || 'Welcome to the Cyberhack Terminal v1.0!';
            // Show welcome message
            printOutput(asciiArt);
            printOutput(welcomeMessage);
        });

    fetch('../json/filesystem.json')
        .then(response => response.json())
        .then(data => {
            fileSystem = data;
        });

    // Handles user inputs
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = inputField.value.trim();
            if (command) {
                handleCommand(command);
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                inputField.value = ''; //Clear the input
            }
        } else if (e.key === 'Tab') {
            e.preventDefault(); // Disable browser's interaction with the key bind
            handleTabComplete(inputField.value);
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault(); // STOP the ctrl L
            handleCtrlL();
        } else if (e.key === 'ArrowUp') {
            showPreviousCommand();
        } else if (e.key === 'ArrowDown') {
            showNextCommand();
        }
    });

    function showPreviousCommand() {
        if (historyIndex > 0) {
            historyIndex--;
            inputField.value = commandHistory[historyIndex];
        } else if (historyIndex === 0) {
            inputField.value = commandHistory[historyIndex];
        } else {
            inputField.value = ''; //empty out the input
        }
    }

    function showNextCommand() {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            inputField.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            inputField.value = '';
        } else {
            inputField.value = '';
        }
    }

    // Handles commands
    function handleCommand(command) {
        printOutput(`> ${command}`);
        const [cmd, subCmd, ...args] = command.split(' ');
        if (commands[cmd]) {
            if (commands[cmd].subcommands && subCmd) {
                // HADOL SHUBCUMMAND
                if (commands[cmd].subcommands[subCmd]) {
                    const subOutput = commands[cmd].subcommands[subCmd].output || "No output. Empty. Blank. Just no stuff here.";
                    printOutput(subOutput);
                } else {
                    printOutput(`Unknown subcommand: ${subCmd} for command: ${cmd}`);
                }
            } else {
                displayCommandOutput(cmd, args);
            }
        } else {
            printOutput(`Unknown command: ${cmd}`);
        }
    }

    // Handles ls commands
    function handleLs(args) {
        const currentDir = getCurrentDir();
        if (args.includes("-l")) {
            for (const item in currentDir.contents) {
                const entry = currentDir.contents[item];
                if (entry.type === "file") {
                    printOutput(`${entry.permissions} ${entry.size} ${item}`);
                } else {
                    printOutput(`drwxr-xr-x ${item}`);
                }
            }
        } else {
            const items = Object.keys(currentDir.contents);
            printOutput(items.join(' ')); // Prints all in one line
        }
    }


    function getCurrentDir() {
        let currentDir = fileSystem;
        for (const dir of currentPath) {
            currentDir = currentDir[dir];
        }
        return currentDir;
    }

    // Handels special commands (The commands that needs JS goes HERE!)
    function displayCommandOutput(cmd, args) {
        if (cmd === 'clear') {
            clearScreen(); // Clean screen
        } else if (cmd === 'help') {
            displayHelp(); // auto help
        } else if (cmd === "ls") {
            handleLs(args);
        } else if (cmd === "history") {
            printOutput(`Command History: ${commandHistory}`);
        } else {
            const outputContent = commands[cmd].output || "No output. Empty. Blank. Just no stuff here.";
            printOutput(outputContent);
        }
    }

    // Auto Generate the help list and sort them
    function displayHelp() {
        let helpText = "\nCommands:\n\n";
        const sortedCommands = Object.keys(commands).sort();
        for (const cmd of sortedCommands) {
            if (!commands[cmd].hide) {
                helpText += `${cmd}: ${commands[cmd].description}\n`;
                if (commands[cmd].subcommands) {
                    const sortedSubCommands = Object.keys(commands[cmd].subcommands).sort();
                    for (const subCmd of sortedSubCommands) {
                        helpText += ` ⇒ ${subCmd}: ${commands[cmd].subcommands[subCmd].description}\n`;
                    }
                }
            }
        }
        printOutput(helpText);
    }

    // Handles Tab Auto Complete
    function handleTabComplete(input) {
        const parts = input.split(' ');
        if (parts.length === 1) {
            // Main Command AC
            const possibleCommands = Object.keys(commands).filter(cmd => cmd.startsWith(input));
            if (possibleCommands.length === 1) {
                inputField.value = possibleCommands[0];
            } else if (possibleCommands.length > 1) {
                printOutput(`You mean: ${possibleCommands.join(', ')} ?`);
            }
        } else if (parts.length === 2) {
            // Attribute AC
            const mainCmd = parts[0];
            if (commands[mainCmd] && commands[mainCmd].subcommands) {
                const subInput = parts[1];
                const possibleSubCommands = Object.keys(commands[mainCmd].subcommands).filter(subCmd => subCmd.startsWith(subInput));
                if (possibleSubCommands.length === 1) {
                    inputField.value = `${mainCmd} ${possibleSubCommands[0]}`;
                } else if (possibleSubCommands.length > 1) {
                    printOutput(`You mean: ${possibleSubCommands.join(', ')} ?`);
                }
            }
        }
    }

    // Handles CTRL + L
    function handleCtrlL() {
        printOutput('^L');
        clearScreen();
    }

    // Print output
    function printOutput(text) {
        const newLine = document.createElement('div');
        newLine.textContent = text;
        output.appendChild(newLine);
        output.appendChild(document.createElement('br')); // Add a br to reduce use of \n in Json. Still a stupid idea tho.
        output.scrollTop = output.scrollHeight;
    }

    // clear out 
    function clearScreen() {
        output.innerHTML = 'Terminal Cleared!';
    }
});
