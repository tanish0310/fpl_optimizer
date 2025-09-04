import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fplAPI = {
  // Get all players
  getPlayers: async () => {
    const response = await api.get('/api/players')
    return response.data
  },

  // Optimize team
  optimizeTeam: async (request) => {
    const response = await api.post('/api/optimize', request)
    return response.data
  },

  // Get analytics
  getAnalytics: async () => {
    const response = await api.get('/api/analytics/position-stats')
    return response.data
  },

  // Get top players by position
  getTopPlayers: async (position, limit = 10) => {
    const response = await api.get(`/api/top-players/${position}?limit=${limit}`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health')
    return response.data
  },
}

export default api
