import ky from 'ky'

export const dbInstance = ky.create({
  prefixUrl: 'http://localhost:3000'
})
