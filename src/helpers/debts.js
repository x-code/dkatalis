import storage from '../helpers/storage'
import { getClientByUID, topUpClientBalance } from './client'
import { generateRandomId } from '../helpers/general'

export function getAllDebtsRecord() {
    return storage.getDebtRecords() || []
}

export function getDebtTo(uid, debtRecordsList = []) {
    return debtRecordsList.filter(debt => debt.from.uid === uid)
}

export function getDebtFrom(uid, debtRecordsList = []) {
    return debtRecordsList.filter(debt => debt.to.uid === uid)
}

export function getMyDebtSummary(uid) {
    const debtRecordsList = getAllDebtsRecord()
    return {
        debtTo: getDebtTo(uid, debtRecordsList),
        debtFrom: getDebtFrom(uid, debtRecordsList)
    }
}

export function createDebtRecord(senderUID, recipientUID, oweAmount) {
    const newDebtRecord = {
        amount: oweAmount,
        from: { uid: senderUID, name: getClientByUID(senderUID).name },
        id: generateRandomId(),
        to: { uid: recipientUID, name: getClientByUID(recipientUID).name }
    }
    storage.setDebtRecords([...getAllDebtsRecord(), newDebtRecord])
}

export function updateDebtRecords(debtRecords) {
    storage.setDebtRecords(debtRecords)
}

export function clearDebtRecords(debtID) {
    const allDebtRecords = getAllDebtsRecord()
    return allDebtRecords.filter(record => record.id !== debtID)
}

export function updateDebtAmount(debtId, amount, mode = 'increment') {
    const allDebtRecords = getAllDebtsRecord()
    return allDebtRecords.map(record => {
        if (record.id === debtId) {
            return {
                ...record,
                amount: mode === 'increment'
                    ? record.amount + amount
                    : record.amount - amount
            }
        }
        return record
    })
}

export function senderOweToRecipient(senderUID, recipientUID) {
    const { debtTo } = getMyDebtSummary(senderUID)
    return debtTo.find(debt => debt.to.uid === recipientUID)
}

export function recipientOweToSender(senderUID, recipientUID) {
    const { debtFrom } = getMyDebtSummary(senderUID)
    return debtFrom.find(debt => debt.from.uid === recipientUID)
}

export function processDebtSettlement(topUpAmount, debtTo) {
    if (!debtTo.length) {
        return {
            finalTopUpAmount: topUpAmount,
            settlement: {}
        }
    }

    let remainingTopUpAmount = topUpAmount
    let settlement = {}

    for (let i = 0; i < debtTo.length; i++) {
        const currDebt = debtTo[i]

        if (remainingTopUpAmount === 0) break

        if (remainingTopUpAmount < currDebt.amount) {
            settlement[currDebt.id] = {
                transferTo: { uid: currDebt.to.uid, name: currDebt.to.name },
                transferredAmount: remainingTopUpAmount,
                isClear: false
            }
            remainingTopUpAmount = 0

        }

        if (remainingTopUpAmount >= currDebt.amount) {
            settlement[currDebt.id] = {
                transferTo: { uid: currDebt.to.uid, name: currDebt.to.name },
                transferredAmount: currDebt.amount,
                isClear: true
            }
            remainingTopUpAmount = remainingTopUpAmount - currDebt.amount
        }
    }

    return {
        finalTopUpAmount: remainingTopUpAmount,
        settlement
    }
}

export function getUpdatedDebtRecords(allDebtRecords = [], settlement) {
    if (!Object.keys(settlement).length) {
        return allDebtRecords
    }

    let result = []
    allDebtRecords.forEach(record => {
        if (!settlement[record.id]) {
            result.push(record)
        }
        
        if (settlement[record.id] && !settlement[record.id].isClear) {
            const { transferTo: { uid }, transferredAmount } = settlement[record.id]

            const newDebtRecord = {
                ...record,
                amount: record.amount - transferredAmount
            }
            result.push(newDebtRecord)
            topUpClientBalance(uid, transferredAmount)
        }
        
        if (settlement[record.id] && settlement[record.id].isClear) {
            const { transferTo: { uid }, transferredAmount } = settlement[record.id]
            topUpClientBalance(uid, transferredAmount)
        }
    })

    return result
}



