import { env } from '@config/env'
import app from 'app'

// start the server
;(async () => {
  // connect db -> later
  app.listen(env.PORT, () => {
    console.log(`Server is running on port http://localhost:${env.PORT}`)
  })
})()
