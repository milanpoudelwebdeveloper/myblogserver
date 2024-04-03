import pkg from 'pg'
const { Pool } = pkg

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any

if (process.env.NODE_ENV) {
  pool = new Pool({})
} else {
  pool = new Pool({
    ssl: {
      rejectUnauthorized: false
    }
  })
}

export default {
  query: (text: string, params: string[]) => pool.query(text, params)
}
