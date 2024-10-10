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
        const [cmd, ...args] = command.split(' ');
        if (commands[cmd]) {
            displayCommandOutput(cmd);
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

    // Auto Gen help contents
    function displayHelp() {
        let helpText = "Commands:\n";
        for (const cmd in commands) {
            helpText += `${cmd}: ${commands[cmd].description}\n`;
        }
        printOutput(helpText);
    }

    // Handles Tab Complete
    function handleTabComplete(input) {
        const possibleCommands = Object.keys(commands).filter(cmd => cmd.startsWith(input));
        if (possibleCommands.length === 1) {
            inputField.value = possibleCommands[0];
        } else if (possibleCommands.length > 1) {
            printOutput(`You mean: ${possibleCommands.join(', ')} ?`);
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
