export const OUTPUT = {
    LOGIN_REQUIRED: 'Please login first',
    NO_SELF_PAYMENT: 'Aborted. You are unable to make payment to yourself',
    USER_NOT_FOUND: 'Aborted. Recipient not found',
}

export function constructLoginOutputMsg(client, debtSummary) {
    const { debtFrom, debtTo } = debtSummary

    const debtToMsg = []
    const debtFromMsg = []

    debtTo.forEach((info) => {
        const msg = `Owing ${info.amount} to ${info.to.name}`
        debtToMsg.push(msg)
    })

    debtFrom.forEach((info) => {
        const msg = `Owing ${info.amount} from ${info.from.name}`
        debtFromMsg.push(msg)
    })


    if (!debtFromMsg.length && !debtToMsg.length) {
        return [
            `Hello, ${client.name}!`,
            `Your balance is ${client.balance}`
        ]
    }

    if (debtFromMsg.length && debtToMsg.length) {
        return [
            `Hello, ${client.name}!`,
            ...debtToMsg,
            ...debtFromMsg,
            `Your balance is ${client.balance}`
        ]
    }

    if (debtFromMsg.length) {
        return [
            `Hello, ${client.name}!`,
            ...debtFromMsg,
            `Your balance is ${client.balance}`,
        ]
    }

    if (debtToMsg.length) {
        return [
            `Hello, ${client.name}!`,
            `Your balance is ${client.balance}`,
            ...debtToMsg
        ]
    }
}


export function constructBalanceOutputMsg(client) {

    return [
        `Hello, ${client.name}! Your balance is ${client.balance}`,
    ]
}

export function constructLogoutOutputMsg(client) {

    return [
        `Goodbye, ${client.name}!`,
    ]
}

export function constructTopUpOutputMsg(client, settlement, debtSummary) {
    let messages = []

    const settlementKeys = Object.keys(settlement)

    // output transfer
    if (settlementKeys.length) {
        settlementKeys.forEach(key => {

            const { transferTo: { name }, transferredAmount } = settlement[key]
            const msg = `Transferred ${transferredAmount} to ${name}`
            messages.push(msg)
        })
    }

    // output balance
    const balanceMsg = `Your balance is ${client.balance}`
    messages.push(balanceMsg)


    // output debtTo
    const { debtFrom, debtTo } = debtSummary
    if (debtTo.length || debtFrom.length) {
        debtTo.forEach((info) => {
            const msg = `Owing ${info.amount} to ${info.to.name}`
            messages.push(msg)
        })
    }

    return messages
}

export function constructWithdrawOutputMsg(client, withdrawAmount) {
    let messages = []
    // output balance
    messages.push(`withdraw amount : ${withdrawAmount}`)
    messages.push(`Your balance is ${client.balance-withdrawAmount}`)
    return messages
}


export function constructPaymentOutputMsg({ sender, recipient, payableAmount, unPayableAmount, debtSummary }) {
    let messages = []

    // output transfer
    if (payableAmount > 0) {
        messages.push(`Transferred ${payableAmount} to ${recipient.name}`)
    }

    // output oweFrom info
    if (!payableAmount && !unPayableAmount) {
        const { debtFrom } = debtSummary
        debtFrom.forEach(info => {
            const msg = `Owing ${info.amount} from ${info.from.name}`
            messages.push(msg)
        })
    }

    // output balance
    messages.push(`Your balance is ${sender.balance}`)

    // output oweTo info
    if (unPayableAmount) {
        const { debtTo } = debtSummary
        debtTo.forEach((info) => {
            const msg = `Owing ${info.amount} to ${info.to.name}`
            messages.push(msg)
        })
    }


    return messages

}
