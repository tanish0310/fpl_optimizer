import React, { useState } from 'react'
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  Heading,
  Divider,
  Input,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Zap, Target, DollarSign, TrendingUp } from 'lucide-react'
import { useOptimizeTeam } from '../hooks/useFPL'
import PlayerCard from '../components/PlayerCard'

const MotionContainer = motion(Container)
const MotionBox = motion(Box)

const Optimizer = () => {
  const [budget, setBudget] = useState(100.0)
  const [excludeIds, setExcludeIds] = useState('')
  const [optimizedTeam, setOptimizedTeam] = useState(null)

  const optimizeTeamMutation = useOptimizeTeam()

  const handleOptimize = async () => {
    const excludePlayerIds = excludeIds
      ? excludeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : []

    try {
      const result = await optimizeTeamMutation.mutateAsync({
        budget: budget,
        exclude_players: excludePlayerIds,
      })
      setOptimizedTeam(result)
    } catch (error) {
      console.error('Optimization failed:', error)
    }
  }

  const groupPlayersByPosition = (players) => {
    return players.reduce((groups, player) => {
      const position = player.position
      if (!groups[position]) groups[position] = []
      groups[position].push(player)
      return groups
    }, {})
  }

  return (
    <MotionContainer
      maxW="7xl"
      py={8}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <MotionBox
          textAlign="center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Heading 
            size="2xl" 
            color="white" 
            mb={2}
            bgGradient="linear(to-r, fpl.300, fpl.500)"
            bgClip="text"
          >
            ⚡ AI Team Optimizer
          </Heading>
          <Text color="whiteAlpha.800" fontSize="lg">
            Machine learning powered team selection for maximum predicted points
          </Text>
        </MotionBox>

        {/* Controls */}
        <MotionBox
          bg="white"
          rounded="2xl"
          shadow="xl"
          p={8}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
            <HStack spacing={6} align="end" wrap="wrap">
              {/* Budget Input */}
              <FormControl maxW="200px">
                <FormLabel color="gray.700">Budget (£m)</FormLabel>
                <NumberInput
                  value={budget}
                  onChange={(valueString, valueNumber) => setBudget(valueNumber)}
                  min={95}
                  max={105}
                  step={0.1}
                  precision={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {/* Exclude Players Input */}
              <FormControl flex="1" minW="250px">
                <FormLabel color="gray.700">Exclude Players (IDs)</FormLabel>
                <Input
                  placeholder="e.g., 123, 456, 789"
                  value={excludeIds}
                  onChange={(e) => setExcludeIds(e.target.value)}
                />
              </FormControl>

              {/* Optimize Button */}
              <Button
                leftIcon={<Zap />}
                size="lg"
                bg="fpl.500"
                color="purple.500"
                _hover={{ bg: 'fpl.400', transform: 'translateY(-2px)' }}
                _active={{ transform: 'translateY(0px)' }}
                onClick={handleOptimize}
                isLoading={optimizeTeamMutation.isPending}
                loadingText="🤖 AI is optimizing..."
                fontWeight="bold"
                px={8}
              >
                Optimize with AI
              </Button>
            </HStack>

            {optimizeTeamMutation.isError && (
              <Alert status="error" rounded="lg">
                <AlertIcon />
                <Text>
                  <strong>Optimization failed:</strong> {optimizeTeamMutation.error?.message || 'Please check that your backend is running on port 8000'}
                </Text>
              </Alert>
            )}
          </VStack>
        </MotionBox>

        {/* Results */}
        {optimizedTeam && optimizedTeam.players && (
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Team Stats */}
            <Box bg="white" rounded="2xl" shadow="xl" p={8} mb={8}>
              <Heading size="lg" mb={6} color="gray.800">
                🤖 AI-Optimized Team Stats
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                <Stat textAlign="center" p={4} bg="green.50" rounded="xl">
                  <StatLabel color="gray.600">
                    <DollarSign size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    Total Cost
                  </StatLabel>
                  <StatNumber color="green.600" fontSize="2xl">
                    £{optimizedTeam.total_cost}m
                  </StatNumber>
                </Stat>

                <Stat textAlign="center" p={4} bg="blue.50" rounded="xl">
                  <StatLabel color="gray.600">
                    <TrendingUp size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    Predicted Points
                  </StatLabel>
                  <StatNumber color="blue.600" fontSize="2xl">
                    {optimizedTeam.total_predicted_points.toFixed(1)}
                  </StatNumber>
                </Stat>

                <Stat textAlign="center" p={4} bg="purple.50" rounded="xl">
                  <StatLabel color="gray.600">
                    <Target size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    Remaining Budget
                  </StatLabel>
                  <StatNumber color="purple.600" fontSize="2xl">
                    £{optimizedTeam.remaining_budget}m
                  </StatNumber>
                </Stat>
              </Grid>

              {/* AI Explanation */}
              <Box mt={6} p={4} bg="blue.50" rounded="lg">
                <Text fontSize="sm" color="blue.800">
                  <strong>🧠 How this works:</strong> Our AI analyzed {optimizedTeam.players?.length || 15} players using machine learning to predict future points based on form, fixtures, and historical data. The mathematical optimizer then selected the combination that maximizes total predicted points within your budget constraints.
                </Text>
              </Box>
            </Box>

            {/* Team Display */}
            <Box bg="white" rounded="2xl" shadow="xl" p={8}>
              <Heading size="lg" mb={6} color="gray.800">
                👥 Your AI-Optimized Squad
              </Heading>

              {Object.entries(groupPlayersByPosition(optimizedTeam.players)).map(([position, players]) => (
                <Box key={position} mb={8}>
                  <HStack mb={4}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.700">
                      {position === 'GKP' ? '🥅 Goalkeepers' :
                       position === 'DEF' ? '🛡️ Defenders' :
                       position === 'MID' ? '⚽ Midfielders' : '🎯 Forwards'}
                    </Text>
                    <Text color="gray.500">({players.length})</Text>
                  </HStack>
                  
                  <Grid 
                    templateColumns={{ 
                      base: "1fr", 
                      md: "repeat(2, 1fr)", 
                      lg: "repeat(3, 1fr)" 
                    }} 
                    gap={4}
                  >
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PlayerCard player={player} showDetailedStats />
                      </motion.div>
                    ))}
                  </Grid>
                  
                  {position !== 'FWD' && <Divider mt={6} />}
                </Box>
              ))}
            </Box>
          </MotionBox>
        )}
      </VStack>
    </MotionContainer>
  )
}

export default Optimizer


