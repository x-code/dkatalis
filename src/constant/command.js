export const validCommands = [
    {
        name: 'LOGIN',
        regex: new RegExp(/^login [a-zA-Z]+$/)
    },
    {
        name: 'LOGOUT',
        regex: new RegExp(/^logout+$/)
    },
    {
        name: 'BALANCE',
        regex: new RegExp(/^balance+$/)
    },
    {
        name: 'WITHDRAW',
        regex: new RegExp(/^withdraw ([0-9]+)$/)
    },
    {
        name: 'DEPOSIT',
        regex: new RegExp(/^deposit ([0-9]+)$/)
    },
    {
        name: 'TRANSFER',
        regex: new RegExp(/^transfer ([a-zA-Z]+) ([0-9]+)$/)
    }
]