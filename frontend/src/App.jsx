import React from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Optimizer from './pages/Optimizer'
import Analytics from './pages/Analytics'

// Custom theme with FPL colors
const theme = extendTheme({
  colors: {
    fpl: {
      50: '#e6fffa',
      100: '#b3f5e8',
      200: '#80ead5',
      300: '#4dd0c2',
      500: '#00ff87', // Primary FPL green
      600: '#00d470',
      700: '#00aa5a',
      800: '#008043',
      900: '#00562d',
    },
    purple: {
      500: '#37003c', // FPL purple
      600: '#2d0030',
      700: '#240026',
    }
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
      },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/optimizer" element={<Optimizer />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </motion.div>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
