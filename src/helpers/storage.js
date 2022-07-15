const CURRENT_LOGIN_CLIENT_UID = 'CURRENT_LOGIN_CLIENT_UID'
const USERS = 'USERS'
const DEBT_RECORDS = 'DEBT_RECORDS'

const storage = {
    set: (key, value) => window.localStorage.setItem(key, value),
    get: (key) => window.localStorage.getItem(key),
    remove: (key) => window.localStorage.removeItem(key),

    // users
    setUsers: (userArr) => storage.set(USERS, JSON.stringify(userArr)),
    getUsers: () => JSON.parse(storage.get(USERS)),

    // current login
    setCurrentLogin: (userData) => storage.set(CURRENT_LOGIN_CLIENT_UID, JSON.stringify(userData)),
    getCurrentLogin: () => JSON.parse(storage.get(CURRENT_LOGIN_CLIENT_UID)),

    // debt records
    setDebtRecords: (debtList) => storage.set(DEBT_RECORDS, JSON.stringify(debtList)),
    getDebtRecords: () => JSON.parse(storage.get(DEBT_RECORDS)),

    // resetData
    initializeData: () => {
        console.log('initialize with empty data...')
        storage.setUsers([])
        storage.setCurrentLogin('')
        storage.setDebtRecords([])
    },
}

export default storage