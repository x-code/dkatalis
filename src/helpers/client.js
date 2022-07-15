import storage from '../helpers/storage'
import { generateRandomId } from '../helpers/general'

/** CLIENT OPERATION HELPER */
export function transformUserName(username) {
    return username.toLowerCase()
}

export function isClientExist(username) {
    const usersList = storage.getUsers()
    if (!username) return false
    return usersList.find(user => transformUserName(user.name) === transformUserName(username)) || false
}

export function setLoginClient(username) {
    const clientUID = getClientUidByUsername(username)
    storage.setCurrentLogin(clientUID)
}

export function getLoginClientUID() {
    return storage.getCurrentLogin()
}

export function getClientUidByUsername(username) {
    const clientList = getAllClients()
    const found = clientList.find(client => transformUserName(username) === transformUserName(client.name))
    return found ? found.uid : ''
}

export function getAllClients() {
    return storage.getUsers()
}

export function getClientByUID(uid) {
    const usersList = storage.getUsers()
    return usersList.find(user => user.uid === uid) || undefined
}

export function createClient(username) {
    const client = {
        uid: generateRandomId(),
        name: username,
        balance: 0
    }
    storage.setUsers([...getAllClients(), client])
}

export function topUpClientBalance(uid, amount) {
    const clientList = getAllClients()
    const updatedList = clientList.map(client => {
        if (client.uid === uid) {
            return {
                ...client,
                balance: client.balance + amount
            }
        } else return client
    })
    storage.setUsers(updatedList)
}

export function deductClientBalance(uid, amount) {
    const clientList = getAllClients()
    const updatedList = clientList.map(client => {
        if (client.uid === uid) {
            return {
                ...client,
                balance: client.balance - amount
            }
        } else return client
    })
    storage.setUsers(updatedList)
}

export function getClientBalance(uid) {
    return storage.getUsers().find(user => user.uid === uid).balance
}

// transaction
export function getPayableAmount(balance, paymentAmount) {
    if (balance >= paymentAmount) {
        return {
            payableAmount: paymentAmount,
            unPayableAmount: 0
        }
    }

    return {
        payableAmount: balance,
        unPayableAmount: paymentAmount - balance
    }
}