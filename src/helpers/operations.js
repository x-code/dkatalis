import { topUpClientBalance, deductClientBalance, createClient, isClientExist, setLoginClient, getLoginClientUID, getClientByUID, getClientBalance, getPayableAmount } from '../helpers/client'
import { getMyDebtSummary, getAllDebtsRecord, processDebtSettlement, getUpdatedDebtRecords, updateDebtRecords, recipientOweToSender, senderOweToRecipient, createDebtRecord, updateDebtAmount, clearDebtRecords } from '../helpers/debts'
import { OUTPUT, constructLoginOutputMsg, constructLogoutOutputMsg, constructBalanceOutputMsg, constructTopUpOutputMsg, constructWithdrawOutputMsg, constructPaymentOutputMsg } from '../helpers/output'
import { formatOutputMessage } from '../helpers/general'

export function login(username) {
    return new Promise((resolve, reject) => {
        // 1. if client username not exist, create the client
        const isExist = isClientExist(username)
        if (!isExist) createClient(username)

        // 2. login the client
        setLoginClient(username)

        // 3. check if having any debtTo or debtFrom records
        const uid = getLoginClientUID()
        const debtSummary = getMyDebtSummary(uid)

        // 4. output the messages
        const client = getClientByUID(uid)
        const message = constructLoginOutputMsg(client, debtSummary)

        // 5. format the messages with \n
        const formattedMessage = formatOutputMessage(message)

        console.log(formattedMessage)

        // always resolve, tentatively doesnt have promise rejection as unknow user will still login as new client
        resolve(formattedMessage)
    })
}
export function logout(uid) {
    return new Promise((resolve, reject) => {
        // 1. output the messages
        const client = getClientByUID(uid)
        const messages = constructLogoutOutputMsg(client)

        // 2. format the messages with \n
        const formattedMessage = formatOutputMessage(messages)
        console.log(formattedMessage)

        resolve(formattedMessage)
    })
}

export function ballance(uid) {
    return new Promise((resolve, reject) => {
        // 1. output the messages
        // const clientBalance = getClientBalance(uid)
        const client = getClientByUID(uid)
        const messages = constructBalanceOutputMsg(client)

        // 2. format the messages with \n
        const formattedMessage = formatOutputMessage(messages)
        console.log(formattedMessage)

        resolve(formattedMessage)
    })
}

export function deposit(uid, depositAmount) {
    return new Promise((resolve, reject) => {
        // 1. check if client has logged in
        const isClientLoggedIn = !!getClientByUID(uid)
        console.log(isClientLoggedIn)
        if (!isClientLoggedIn) {
            const message = OUTPUT.LOGIN_REQUIRED
            return resolve(message)
        }

        // 2. check if user has any debt, retrieve a settlement record and finalTopUpAmount
        const { debtTo } = getMyDebtSummary(uid)
        const { settlement, finalTopUpAmount } = processDebtSettlement(depositAmount, debtTo)

        // 3. once we got a settlement record, update the debtRecord with the settlement result
        const allDebtRecords = getAllDebtsRecord()
        const updatedDebtRecords = getUpdatedDebtRecords(allDebtRecords, settlement)
        updateDebtRecords(updatedDebtRecords)

        // 4. update user balance
        topUpClientBalance(uid, finalTopUpAmount)

        // 5. output the messages
        const client = getClientByUID(uid)
        const debtSummary = getMyDebtSummary(uid)
        const messages = constructTopUpOutputMsg(client, settlement, debtSummary)

        // 6. format the messages with \n
        const formattedMessage = formatOutputMessage(messages)
        console.log(formattedMessage)

        resolve(formattedMessage)
    })
}

export function withdraw(uid, withdrawAmount) {
    return new Promise((resolve, reject) => {
        // 1. check if client has logged in
        const isClientLoggedIn = !!getClientByUID(uid)
        console.log(isClientLoggedIn)
        if (!isClientLoggedIn) {
            const message = OUTPUT.LOGIN_REQUIRED
            return resolve(message)
        }

        // 5. output the messages
        const client = getClientByUID(uid)
        const messages = constructWithdrawOutputMsg(client, withdrawAmount)

        // 6. format the messages with \n
        const formattedMessage = formatOutputMessage(messages)
        console.log(formattedMessage)

        resolve(formattedMessage)
    })
}


export function transfer(senderUID, recipientUID, amount) {
    return new Promise((resolve, reject) => {
        // 1. check if client has logged in
        const isClientLoggedIn = !!getClientByUID(senderUID)
        if (!isClientLoggedIn) {
            const message = OUTPUT.LOGIN_REQUIRED
            return resolve(message)
        }

        // 2. check if user is make transfer to herself
        if (getLoginClientUID() === recipientUID) {
            const message = OUTPUT.NO_SELF_PAYMENT
            return resolve(message)
        }

        if (!getClientByUID(recipientUID)) {
            const message = OUTPUT.USER_NOT_FOUND
            return resolve(message)
        }

        const senderBalance = getClientBalance(senderUID)
        let formattedMessage = ''

        // 3. check if sender owe recipient, increase the debt without making transfer
        const oweToRecipient = senderOweToRecipient(senderUID, recipientUID)
        if (oweToRecipient) {
            const { id } = oweToRecipient
            const { unPayableAmount } = getPayableAmount(senderBalance, amount)
            const updatedDebtRecords = updateDebtAmount(id, unPayableAmount, 'increment')
            updateDebtRecords(updatedDebtRecords)

            // output the message
            const sender = getClientByUID(senderUID)
            const recipient = getClientByUID(recipientUID)
            const debtSummary = getMyDebtSummary(senderUID)
            const messages = constructPaymentOutputMsg({ sender, recipient, unPayableAmount, debtSummary })

            formattedMessage = formatOutputMessage(messages)
            console.log(formattedMessage)
        }

        // 4. check if recipient owe sender, 
        const oweToSender = recipientOweToSender(senderUID, recipientUID)
        if (oweToSender) {
            const { id, amount: oweAmount } = oweToSender

            // deduct his debt amount
            if (amount < oweAmount) {
                const updatedDebtRecords = updateDebtAmount(id, amount, 'decrement')
                updateDebtRecords(updatedDebtRecords)

                // output the message
                const sender = getClientByUID(senderUID)
                const recipient = getClientByUID(recipientUID)
                const debtSummary = getMyDebtSummary(senderUID)
                const messages = constructPaymentOutputMsg({ sender, recipient, debtSummary })
                formattedMessage = formatOutputMessage(messages)
                console.log(formattedMessage)

            }

            // clear the debt, transfer money after debt deduction to user
            if (amount >= oweAmount && amount <= senderBalance) {
                console.log('amount >= oweAmount && amount <= senderBalance')
                const payableAmount = amount - oweAmount
                const updatedDebtRecord = clearDebtRecords(id)
                updateDebtRecords(updatedDebtRecord)
                topUpClientBalance(recipientUID, payableAmount)
                deductClientBalance(senderUID, payableAmount)

                // output the message
                const sender = getClientByUID(senderUID)
                const recipient = getClientByUID(recipientUID)
                const debtSummary = getMyDebtSummary(senderUID)
                const messages = constructPaymentOutputMsg({ sender, recipient, payableAmount, debtSummary })
                formattedMessage = formatOutputMessage(messages)
                console.log(formattedMessage)
            }

            // clear the debt and invert the debt
            if (amount >= oweAmount && amount > senderBalance) {
                console.log('amount >= oweAmount && amount > senderBalance')
                const payableAmount = amount - oweAmount
                const updatedDebtRecord = clearDebtRecords(id)
                updateDebtRecords(updatedDebtRecord)
                if (payableAmount > senderBalance) {
                    createDebtRecord(senderUID, recipientUID, payableAmount - senderBalance)
                    topUpClientBalance(recipientUID, senderBalance)
                    deductClientBalance(senderUID, senderBalance)

                    // output the message
                    const sender = getClientByUID(senderUID)
                    const recipient = getClientByUID(recipientUID)
                    const debtSummary = getMyDebtSummary(senderUID)
                    const messages = constructPaymentOutputMsg({ sender, recipient, payableAmount: senderBalance, debtSummary })
                    formattedMessage = formatOutputMessage(messages)
                    console.log(formattedMessage)
                } else {
                    topUpClientBalance(recipientUID, payableAmount)
                    deductClientBalance(senderUID, payableAmount)

                    // output the message
                    const sender = getClientByUID(senderUID)
                    const recipient = getClientByUID(recipientUID)
                    const debtSummary = getMyDebtSummary(senderUID)
                    const messages = constructPaymentOutputMsg({ sender, recipient, payableAmount, debtSummary })
                    formattedMessage = formatOutputMessage(messages)
                    console.log(formattedMessage)
                }



            }
        }

        // 5. check if both sender recipient not owe each other
        if (!oweToSender && !oweToRecipient) {
            // const senderBalance = getClientBalance(senderUID)
            const { payableAmount, unPayableAmount } = getPayableAmount(senderBalance, amount)

            // insufficient balance to make transaction
            if (unPayableAmount > 0) {
                createDebtRecord(senderUID, recipientUID, unPayableAmount)
            }

            // has sufficient balance to make transaction
            if (payableAmount) {
                deductClientBalance(senderUID, payableAmount)
                topUpClientBalance(recipientUID, payableAmount)
            }

            // output the message
            const sender = getClientByUID(senderUID)
            const recipient = getClientByUID(recipientUID)
            const debtSummary = getMyDebtSummary(senderUID)
            const messages = constructPaymentOutputMsg({ sender, recipient, payableAmount, unPayableAmount, debtSummary })
            formattedMessage = formatOutputMessage(messages)

            console.log(formattedMessage)
        }

        resolve(formattedMessage)
    })
}