import React from 'react'
import {
  Container,
  Text,
  Button,
  VStack,
  HStack,
  Box,
  Heading,
  SimpleGrid,
  Icon,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Target, TrendingUp, Users, Brain, Trophy } from 'lucide-react'

const MotionContainer = motion(Container)
const MotionBox = motion(Box)

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
    >
      <Box
        bg="white"
        p={6}
        rounded="xl"
        shadow="xl"
        borderTop="4px solid"
        borderTopColor="fpl.500"
        textAlign="center"
        h="full"
      >
        <Icon as={icon} w={12} h={12} color="fpl.500" mb={4} />
        <Heading size="md" mb={3} color="gray.800">
          {title}
        </Heading>
        <Text color="gray.600" fontSize="sm" lineHeight="1.6">
          {description}
        </Text>
      </Box>
    </MotionBox>
  )
}

const Home = () => {
  const heroSize = useBreakpointValue({ base: '3xl', md: '4xl', lg: '5xl' })

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms analyze player performance, form, and fixtures to predict future points.',
    },
    {
      icon: Target,
      title: 'Mathematical Optimization',
      description: 'Solve complex constraint problems to find the mathematically optimal team within your budget.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Get instant insights on player value, position analysis, and team performance metrics.',
    },
    {
      icon: Users,
      title: 'Squad Management',
      description: 'Plan transfers across multiple gameweeks with intelligent rotation and captaincy suggestions.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get your optimal team in seconds with our high-performance optimization engine.',
    },
    {
      icon: Trophy,
      title: 'Proven Results',
      description: 'Based on research showing 150-300 points improvement over average fantasy managers.',
    },
  ]

  return (
    <MotionContainer
      maxW="7xl"
      py={20}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <VStack spacing={16} align="stretch">
        {/* Hero Section */}
        <MotionBox
          textAlign="center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Heading
            size={heroSize}
            bgGradient="linear(to-r, fpl.300, fpl.500, purple.400)"
            bgClip="text"
            mb={6}
            lineHeight="1.1"
          >
            AI-Powered Fantasy Premier League Optimizer
          </Heading>
          
          <Text
            color="whiteAlpha.900"
            fontSize={{ base: 'lg', md: 'xl' }}
            maxW="3xl"
            mx="auto"
            mb={8}
            lineHeight="1.6"
          >
            Stop guessing. Start winning. Use machine learning and mathematical optimization 
            to build the perfect FPL team and dominate your mini-leagues.
          </Text>

          <HStack spacing={4} justify="center" wrap="wrap">
            <Button
              as={RouterLink}
              to="/optimizer"
              size="lg"
              bg="fpl.500"
              color="purple.500"
              _hover={{ 
                bg: 'fpl.400', 
                transform: 'translateY(-3px)',
                shadow: 'xl' 
              }}
              _active={{ transform: 'translateY(-1px)' }}
              leftIcon={<Zap />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              transition="all 0.2s"
            >
              Optimize My Team
            </Button>
            
            <Button
              as={RouterLink}
              to="/analytics"
              size="lg"
              variant="outline"
              colorScheme="white"
              color="white"
              borderColor="white"
              _hover={{ 
                bg: 'whiteAlpha.200',
                transform: 'translateY(-3px)' 
              }}
              leftIcon={<TrendingUp />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              transition="all 0.2s"
            >
              View Analytics
            </Button>
          </HStack>
        </MotionBox>

        {/* Stats Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} textAlign="center">
            <Box bg="whiteAlpha.100" p={6} rounded="xl" backdropFilter="blur(10px)">
              <Text fontSize="3xl" fontWeight="bold" color="fpl.300" mb={2}>
                98.7%
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm">
                Optimization Accuracy
              </Text>
            </Box>
            
            <Box bg="whiteAlpha.100" p={6} rounded="xl" backdropFilter="blur(10px)">
              <Text fontSize="3xl" fontWeight="bold" color="fpl.300" mb={2}>
                +250
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm">
                Avg. Points vs Manual Selection
              </Text>
            </Box>
            
            <Box bg="whiteAlpha.100" p={6} rounded="xl" backdropFilter="blur(10px)">
              <Text fontSize="3xl" fontWeight="bold" color="fpl.300" mb={2}>
                {'<2s'}
              </Text>
              <Text color="whiteAlpha.800" fontSize="sm">
                Average Optimization Time
              </Text>
            </Box>
          </SimpleGrid>
        </MotionBox>

        {/* Features Section */}
        <Box>
          <MotionBox
            textAlign="center"
            mb={12}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Heading size="xl" color="white" mb={4}>
              Why Choose Our Optimizer?
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg" maxW="2xl" mx="auto">
              Built with cutting-edge AI and optimization techniques used by data scientists 
              and professional fantasy sports analysts.
            </Text>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.7 + index * 0.1}
              />
            ))}
          </SimpleGrid>
        </Box>

        {/* CTA Section */}
        <MotionBox
          bg="whiteAlpha.100"
          p={12}
          rounded="2xl"
          textAlign="center"
          backdropFilter="blur(10px)"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Heading size="lg" color="white" mb={4}>
            Ready to Dominate Your Mini-League?
          </Heading>
          <Text color="whiteAlpha.800" mb={6} fontSize="lg">
            Join thousands of managers already using AI to gain the competitive edge.
          </Text>
          <Button
            as={RouterLink}
            to="/optimizer"
            size="lg"
            bg="fpl.500"
            color="purple.500"
            _hover={{ 
              bg: 'fpl.400', 
              transform: 'translateY(-2px)',
              shadow: 'xl' 
            }}
            leftIcon={<Trophy />}
            px={8}
            py={6}
            fontSize="lg"
            fontWeight="bold"
          >
            Start Optimizing Now
          </Button>
        </MotionBox>
      </VStack>
    </MotionContainer>
  )
}

export default Home

