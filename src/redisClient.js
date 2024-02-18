import { createClient } from 'redis'

const client = createClient(
    {
    port: 6379,
    host: 'redis'
    }
)

export default client