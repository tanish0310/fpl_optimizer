import React, { useState } from 'react'
import {
  Container,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  ButtonGroup,
  Alert,
  AlertIcon,
  Spinner,
  Select,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAnalytics, useTopPlayers } from '../hooks/useFPL'
import PlayerCard from '../components/PlayerCard'

const MotionContainer = motion(Container)
const MotionBox = motion(Box)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const Analytics = () => {
  const [selectedPosition, setSelectedPosition] = useState('GKP')
  
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalytics()
  const { data: topPlayers, isLoading: playersLoading } = useTopPlayers(selectedPosition)

  const positions = ['GKP', 'DEF', 'MID', 'FWD']

  if (analyticsLoading) {
    return (
      <Container maxW="7xl" py={8} textAlign="center">
        <Spinner size="xl" color="fpl.500" />
        <Text mt={4} color="white">Loading analytics...</Text>
      </Container>
    )
  }

  if (analyticsError) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          Failed to load analytics data. Please try again.
        </Alert>
      </Container>
    )
  }

  const chartData = analyticsData?.map(pos => ({
    position: pos.position_name,
    avgPoints: pos.predicted_points_mean,
    maxPoints: pos.predicted_points_max,
    avgPrice: pos.price_mean
  })) || []

  const pieData = analyticsData?.map(pos => ({
    name: pos.position_name,
    value: pos.predicted_points_mean
  })) || []

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
            📊 Analytics Dashboard
          </Heading>
          <Text color="whiteAlpha.800" fontSize="lg">
            Deep insights into player performance and predictions
          </Text>
        </MotionBox>

        {/* Position Stats */}
        <MotionBox
          bg="white"
          rounded="2xl"
          shadow="xl"
          p={8}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Heading size="lg" mb={6} color="gray.800">
            Position Analysis
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
            {/* Bar Chart */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.700">
                Average Predicted Points by Position
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgPoints" fill="#00ff87" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Pie Chart */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.700">
                Points Distribution
              </Text>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </MotionBox>

        {/* Position Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          {analyticsData?.map((position, index) => (
            <MotionBox
              key={position.position_name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <Stat
                bg="white"
                p={6}
                rounded="xl"
                shadow="lg"
                textAlign="center"
                borderTop="4px solid"
                borderTopColor="fpl.500"
              >
                <StatLabel color="gray.600" fontSize="sm" mb={2}>
                  {position.position_name}
                </StatLabel>
                <StatNumber color="fpl.600" fontSize="2xl" mb={1}>
                  {position.predicted_points_mean?.toFixed(1) || '0.0'}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                  Avg. Predicted Points
                </StatHelpText>
                <Text color="gray.500" fontSize="xs" mt={2}>
                  Max: {position.predicted_points_max?.toFixed(1) || '0.0'}
                </Text>
              </Stat>
            </MotionBox>
          ))}
        </Grid>

        {/* Top Players Section */}
        <MotionBox
          bg="white"
          rounded="2xl"
          shadow="xl"
          p={8}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <HStack justify="space-between" align="center" mb={6}>
            <Heading size="lg" color="gray.800">
              Top Predicted Players
            </Heading>
            
            <Select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              maxW="200px"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </Select>
          </HStack>

          {playersLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner color="fpl.500" />
              <Text mt={2} color="gray.500">Loading top players...</Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
              {topPlayers?.slice(0, 6).map((player, index) => (
                <motion.div
                  key={player.web_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PlayerCard 
                    player={{
                      id: index,
                      name: player.web_name,
                      position: selectedPosition,
                      team: player.team,
                      price: player.now_cost / 10,
                      predicted_points: player.predicted_points
                    }} 
                    showDetailedStats={true}
                  />
                </motion.div>
              ))}
            </Grid>
          )}
        </MotionBox>
      </VStack>
    </MotionContainer>
  )
}

export default Analytics
