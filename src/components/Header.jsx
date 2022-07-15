import React, { useEffect, useState } from 'react'
import {Link as RLink, useLocation} from 'react-router-dom'
import {
  Box,
  Kbd,
  Text,
  Link
} from '@chakra-ui/core'
import './Header.css'

const Header = () => {
  let location = useLocation()
  let [route, setRoute] = useState('')  
  const [isTextShowed, setIsTextShowed] = useState(true)
  useEffect(() => {    
    setRoute(location.pathname)
    let width = window.innerWidth
    if (width < 500) {
      setIsTextShowed(false)
    }
  }, [])
  return (
    <>
      <Box fontSize="xs" p="4">
      <div className='caution'>
            <h2 className='caution-heading'>Format Command</h2>
            <ul className='caution-list'>
                <li><span><Kbd>login</Kbd> <Kbd>{"<username>"}</Kbd></span></li>
                <li><span><Kbd>balance</Kbd></span></li>
                <li><span><Kbd>deposit</Kbd> <Kbd>{"<amount>"}</Kbd></span> </li>
                <li><span><Kbd>transfer</Kbd> <Kbd>{"<username>"}</Kbd> <Kbd>{"<amount>"}</Kbd></span></li>
                <li><span><Kbd>withdraw</Kbd> <Kbd>{"<amount>"}</Kbd></span></li>
                <li><span><Kbd>logout</Kbd></span></li>
            </ul>
        </div>
      </Box>
    </>
  )
}

export default Header