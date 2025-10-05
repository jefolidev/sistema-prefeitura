import cors from 'cors'

export const corsMiddleware = cors({
  origin: 'http://vg08ss0048wkscsos4gosg08.72.60.241.250.sslip.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
})
