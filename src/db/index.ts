import pkg from 'pg'
const { Pool } = pkg
const pool = new Pool({
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV ? true : false
  }
})

export default {
  query: (text: string, params: string[]) => pool.query(text, params)
}
