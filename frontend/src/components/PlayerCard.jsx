import React from 'react'
import {
  Box,
  Text,
  Badge,
  Flex,
  Avatar,
  Stat,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TrendingUp, Star, DollarSign } from 'lucide-react'

const MotionBox = motion(Box)

const PlayerCard = ({ player, showDetailedStats = false }) => {
  const positionColors = {
    GKP: 'yellow',
    DEF: 'blue',
    MID: 'green',
    FWD: 'red',
  }

  const getPlayerImage = (playerId) => {
    return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerId}.png`
  }

  return (
    <MotionBox
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        bg="white"
        rounded="xl"
        shadow="lg"
        p={4}
        borderLeft="4px solid"
        borderLeftColor={`${positionColors[player.position]}.400`}
        _hover={{ shadow: 'xl' }}
        transition="all 0.2s"
      >
        <Flex align="center" justify="space-between" mb={3}>
          <HStack spacing={3}>
            <Avatar
              size="sm"
              src={getPlayerImage(player.id)}
              name={player.name}
              fallback={<Box bg="gray.100" rounded="full" />}
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="md" color="gray.800">
                {player.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Team {player.team}
              </Text>
            </VStack>
          </HStack>
          
          <Badge 
            colorScheme={positionColors[player.position]} 
            variant="solid"
            rounded="full"
            px={2}
          >
            {player.position}
          </Badge>
        </Flex>

        <HStack justify="space-between" align="center">
          <Stat size="sm">
            <StatNumber fontSize="lg" color="green.500">
              {player.predicted_points?.toFixed(1) || '0.0'}
            </StatNumber>
            <StatHelpText color="gray.500" fontSize="xs" mb={0}>
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '2px' }} />
              Predicted Points
            </StatHelpText>
          </Stat>

          <Stat size="sm">
            <StatNumber fontSize="lg" color="red.500">
              £{(player.price || player.now_cost / 10)?.toFixed(1)}m
            </StatNumber>
            <StatHelpText color="gray.500" fontSize="xs" mb={0}>
              <DollarSign size={12} style={{ display: 'inline', marginRight: '2px' }} />
              Price
            </StatHelpText>
          </Stat>

          {showDetailedStats && (
            <Stat size="sm">
              <StatNumber fontSize="lg" color="purple.500">
                {player.value?.toFixed(1) || '0.0'}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                <Star size={12} style={{ display: 'inline', marginRight: '2px' }} />
                Value
              </StatHelpText>
            </Stat>
          )}
        </HStack>
      </Box>
    </MotionBox>
  )
}

export default PlayerCard
