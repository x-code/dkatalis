import { validCommands } from '../constant/command.js'

export function generateRandomId() {
    return Math.floor(Math.random() * 100000)
}

export function formatOutputMessage(msg = []) {
    if (msg.length) return msg.join('\n')
    return ''
}

export function getTargetOperation(commandString) {
    const targetCommand = validCommands.find(validCommand => validCommand.regex.test(commandString))
    return targetCommand ? targetCommand.name : undefined

}