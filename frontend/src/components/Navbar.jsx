import React from 'react'
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  Button,
} from '@chakra-ui/react'
import { Menu, X } from 'lucide-react' // Using lucide-react instead
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const NavLink = ({ children, to }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      color={isActive ? 'fpl.500' : 'white'}
      fontWeight={isActive ? 'bold' : 'normal'}
      _hover={{
        textDecoration: 'none',
        color: 'fpl.300',
        transform: 'translateY(-1px)',
      }}
      transition="all 0.2s"
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <MotionBox
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box bg="rgba(0,0,0,0.1)" backdropFilter="blur(10px)" px={4} shadow="lg">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <X /> : <Menu />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            bg="transparent"
            color="white"
            _hover={{ bg: 'rgba(255,255,255,0.1)' }}
          />
          
          <HStack spacing={8} alignItems={'center'}>
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              color="white"
              bgGradient="linear(to-r, fpl.300, fpl.500)"
              bgClip="text"
            >
              🏆 FPL Optimizer
            </Text>
            
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/optimizer">Optimizer</NavLink>
              <NavLink to="/analytics">Analytics</NavLink>
            </HStack>
          </HStack>

          <Button
            bg="fpl.500"
            color="purple.500"
            _hover={{ bg: 'fpl.400', transform: 'scale(1.05)' }}
            size="sm"
            fontWeight="bold"
            display={{ base: 'none', md: 'flex' }}
          >
            Get Pro
          </Button>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/optimizer">Optimizer</NavLink>
              <NavLink to="/analytics">Analytics</NavLink>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </MotionBox>
  )
}

