import { db } from '@config/db'
import { env } from '@config/env'
import { googleClient } from '@config/googleClient'
import { refreshTokens, users } from '@db/index'
import { AuthError } from '@errors/AuthError'
import { generateToken, hashToken } from '@utils/token'
import { eq } from 'drizzle-orm'
import crypto from 'node:crypto'

// generate google auth url
export async function getGoogleAuthUrl(state: string): Promise<string> {
  const redirectUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ],
    state,
  })

  return redirectUrl
}

// handle callback logic
export async function handleGoogleAuthCallback(code: string): Promise<{
  accessToken: string
  refreshToken: string
  user: { name: string; email: string }
}> {
  // exchange the code for token
  const { tokens } = await googleClient.getToken(code)
  const idToken = tokens.id_token

  // no id token
  if (!idToken) {
    throw new AuthError('Missing ID token from Google', 400)
  }

  // verify id token
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  })

  // get and validate payload
  const payload = ticket.getPayload()

  if (!payload) {
    throw new AuthError('Invalid Google token', 400)
  }

  if (!payload.email) {
    throw new AuthError('Email not available from Google account', 400)
  }

  // const email = payload.email
  // const fullName = payload.name || ''
  // const [firstName, lastName = ''] = fullName.split(' ')
  const email = payload.email
  const firstName =
    payload.given_name || `user${crypto.randomInt(10000, 99999)}`
  const lastName = payload.family_name || ''

  // check if user exists
  let [user] = await db.select().from(users).where(eq(users.email, email))

  // if user doesnt exist, first create user
  // then log in the user automatically. otherwise,
  // directly login the user -> generate tokens
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({ firstName, lastName, email })
      .returning()

    user = newUser
  }

  // try {
  //   const [newUser] = await db
  //     .insert(users)
  //     .values({ firstName, lastName, email })
  //     .returning()

  //   user = newUser
  // } catch (err: any) {
  //   console.error('DB ERROR:', err.message, err.detail)
  //   throw err
  // }

  // generate tokens
  const accessToken = generateToken({ userId: user.id })
  const refreshToken = crypto.randomBytes(64).toString('hex')
  const hashedRefreshToken = hashToken(refreshToken)
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // save hashed refresh token in db
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashedRefreshToken,
    expiresAt: refreshTokenExpiry,
  })

  // return necessary data to controller
  return {
    accessToken,
    refreshToken,
    user: { name: user.firstName, email: user.email },
  }
}

// generate new accesstokens every 15 mins
export async function handleRefreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  // hash the token and find in db
  const hashedRefreshToken = hashToken(refreshToken)

  const [token] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashedRefreshToken))

  // check if token exists
  if (!token) {
    throw new AuthError('Refresh Token does not exist', 403)
  }

  // check if token expired
  if (token.expiresAt < new Date()) {
    throw new AuthError('Refresh token expired')
  }

  // generate access token
  const accessToken = generateToken({ userId: token.userId })

  return { accessToken }
}

// handle log out
export async function handleLogOut(refreshToken: any): Promise<void> {
  if (refreshToken) {
    const hashedRefreshToken = hashToken(refreshToken)

    // delete from db
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashedRefreshToken))
  }
}
