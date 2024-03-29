import pkg from 'pg'
const { Pool } = pkg
const pool = new Pool({
  ssl: {
    rejectUnauthorized: false
  }
})

export default {
  query: (text: string, params: string[]) => pool.query(text, params)
}
