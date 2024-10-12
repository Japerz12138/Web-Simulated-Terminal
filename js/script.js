document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('input');
    const output = document.getElementById('output');

    let commands = {};
    let asciiArt = '';
    let welcomeMessage = '';

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

    // Handles user inputs
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = inputField.value.trim();
            if (command) {
                handleCommand(command);
                inputField.value = ''; //Clear the input
            }
        } else if (e.key === 'Tab') {
            e.preventDefault(); // Disable browser's interaction with the key bind
            handleTabComplete(inputField.value);
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault(); // STOP the ctrl L
            handleCtrlL();
        }
    });

    // Handles commands
    function handleCommand(command) {
        printOutput(`> ${command}`);
        const [cmd, subCmd, ...args] = command.split(' ');
        if (commands[cmd]) {
            if (commands[cmd].subcommands && subCmd) {
                // HADOL SHUBCUMMAND
                if (commands[cmd].subcommands[subCmd]) {
                    const subOutput = commands[cmd].subcommands[subCmd].output || "No output.";
                    printOutput(subOutput);
                } else {
                    printOutput(`Unknown subcommand: ${subCmd} for command: ${cmd}`);
                }
            } else {
                displayCommandOutput(cmd);
            }
        } else {
            printOutput(`Unknown command: ${cmd}`);
        }
    }

    // Handels special commands
    function displayCommandOutput(cmd) {
        if (cmd === 'clear') {
            clearScreen(); // Clean screen
        } else if (cmd === 'help') {
            displayHelp(); // auto help
        } else {
            const outputContent = commands[cmd].output || "No output.";
            printOutput(outputContent);
        }
    }

    // Auto Generate the help list and sort them
    function displayHelp() {
        let helpText = "\nCommands:\n\n";
        const sortedCommands = Object.keys(commands).sort();
        for (const cmd of sortedCommands) {
            helpText += `${cmd}: ${commands[cmd].description}\n`;
            if (commands[cmd].subcommands) {
                const sortedSubCommands = Object.keys(commands[cmd].subcommands).sort();
                for (const subCmd of sortedSubCommands) {
                    helpText += ` ⇒ ${subCmd}: ${commands[cmd].subcommands[subCmd].description}\n`;
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
        output.scrollTop = output.scrollHeight;
    }

    // clear out 
    function clearScreen() {
        output.innerHTML = 'Terminal Cleared!';
    }
});
