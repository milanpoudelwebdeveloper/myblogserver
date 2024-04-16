import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

// PGUSER=postgres
// PGHOST=localhost
// PGPASSWORD=milanpoudel
// PGDATABASE=myblogserver
// PGPORT=5432

const pool = (() => {
  if (process.env.NODE_ENV === 'development') {
    return new Pool({})
  } else {
    return new Pool({
      user: 'postgres.nilyjfpmxpoaeqcblmip',
      host: 'aws-0-ap-south-1.pooler.supabase.com',
      database: 'postgres',
      password: 'thebestdeveloper_1234',
      port: 5432,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
})()

export default {
  query: (text: string, params: string[]) => pool.query(text, params)
}
