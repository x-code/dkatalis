import React, { useEffect, useState } from 'react';
// import './App.css';

import { Box, Text, Image, Link, Flex, Badge } from "@chakra-ui/core";

import Home from './pages/Home.jsx';

import { Route, Switch, Link as RLink, BrowserRouter as Router } from 'react-router-dom';

function App() {
  const [isTextShowed, setIsTextShowed] = useState(true)
  useEffect(() => {
    let width = window.innerWidth
    if (width < 500) {
      setIsTextShowed(false)
    }
  }, [])
  return (
    <Box w="100%" minH="100vh" bg="gray.50">
      <Router>
        <Box alignItems="center" p="5">
          <Box d="block" textAlign="center" mb="4">
            <h1>Dkatalis</h1>
          </Box>

          <Box w="100%">
            <Flex 
            align="center" 
            borderRadius="md" 
            m="5" 
            mx="auto"
            width={[
              "100%", // base
              "70%", // 480px upwards
              "70%", // 768px upwards
              "70%", // 992px upwards
            ]}>
              <Switch>
                <Route exact path="/" component={Home} />
              </Switch>
            </Flex>
          </Box>

        </Box>
      </Router>
    </Box>
  );
}

export default App;
