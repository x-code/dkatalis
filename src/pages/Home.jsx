import React, { useState, useEffect } from 'react';
import { Flex, Box, Stack, Input, Textarea, Button } from "@chakra-ui/core";
import Header from '../components/Header';
import { login, logout, ballance, deposit, withdraw, transfer } from '../helpers/operations'
import { getLoginClientUID, getClientUidByUsername } from '../helpers/client'
import { getTargetOperation } from '../helpers/general'
import storage from '../helpers/storage';
import './Home.css'

const SubmitButton = (props) => {
  if (props.isLoading) {
    return (
      <Button
        isLoading
        loadingText="Sending"
        variantColor="teal"
        variant="outline"
      >
      </Button>
    )
  }
  return (
    <Button onClick={props.handleClick} variantColor="green">Reset</Button>
  )
}

const Home = (props) => {
  const [phone, setPhone] = useState('');
  const [messages, setMessages] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [command, setCommand] = useState('')
  const [resultArray, setResultArray] = useState([])

  const appendOutput = (outputMsg) => {
    const lastCommand = trimCommand(command)
    const html = (
        <div>
            <strong>{'> ' + lastCommand}</strong>
            <p style={{ margin: 0 }}>{outputMsg}</p>
        </div>
    )

    setResultArray([html, ...resultArray])
}

const trimCommand = (command) => {
    return command.trim()
}

const handleResetData = () => {
    storage.initializeData()
    setResultArray([])
}

const handleCommand = (e) => {
    e.preventDefault()

    const trimmedCommand = trimCommand(command)
    if (trimmedCommand === '') return

    const operationName = getTargetOperation(trimmedCommand)
    const splittedCommand = trimmedCommand.split(' ')

    switch (operationName) {
        case 'LOGIN': {
            const username = splittedCommand[1]
            return login(username).then(output => {
                appendOutput(output)
                setCommand('')
            })
        }

        case 'LOGOUT': {
            const uid = getLoginClientUID()
            return logout(uid).then(output => {
                appendOutput(output)
                setCommand('')
            })
        }

        case 'BALANCE': {
            const uid = getLoginClientUID()
            return ballance(uid).then(output => {
                appendOutput(output)
                setCommand('')
            })
        }

        case 'DEPOSIT': {
            const uid = getLoginClientUID()
            const depositAmount = Number(splittedCommand[1])
            return deposit(uid, depositAmount).then(output => {
                appendOutput(output)
                setCommand('')
            })
        }

        case 'WITHDRAW': {
            const uid = getLoginClientUID()
            const withdrawAmount = Number(splittedCommand[1])
            return withdraw(uid, withdrawAmount).then(output => {
                appendOutput(output)
                setCommand('')
            })
        }

        case 'TRANSFER': {
            const senderUID = getLoginClientUID()
            const recipientUID = getClientUidByUsername(splittedCommand[1])
            const transferAmount = Number(splittedCommand[2])
            return transfer(senderUID, recipientUID, transferAmount).then(output => {
                appendOutput(output)
                setCommand('')
            })

        }

        default: {
            setResultArray(['Invalid Command.\n', ...resultArray])
            setCommand('')
            return
        }
    }
}

const renderOutputMsg = () => {
    return resultArray.map((output, index) => <li className='list-output-item' key={index}>{output}</li>)
}
  
  return (
    <Box w="100%">
      <Header />
      <Flex align="center" d="block" p="4">
        <Stack spacing={4}>
            <form onSubmit={handleCommand}>
                <input onChange={e => setCommand(e.target.value)} value={command} className='terminal-command' placeholder=' > Enter your command here' />
            </form>
            <div className='terminal-body'>
                <ul className='list-output'>
                    {renderOutputMsg()}
                </ul>
            </div>
          <SubmitButton isLoading={isLoading} handleClick={handleResetData} />
        </Stack>
      </Flex>
    </Box>
  );
}

export default Home;