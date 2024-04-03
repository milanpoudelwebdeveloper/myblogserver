import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

const pool = (() => {
  if (process.env.NODE_ENV === 'development') {
    return new Pool({})
  } else {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
})()

export default {
  query: (text: string, params: string[]) => pool.query(text, params)
}
