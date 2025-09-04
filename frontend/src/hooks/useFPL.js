import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fplAPI } from '../services/api'

export const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: fplAPI.getPlayers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useOptimizeTeam = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: fplAPI.optimizeTeam,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries(['players'])
    },
  })
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fplAPI.getAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useTopPlayers = (position) => {
  return useQuery({
    queryKey: ['topPlayers', position],
    queryFn: () => fplAPI.getTopPlayers(position),
    enabled: !!position,
    staleTime: 5 * 60 * 1000,
  })
}
