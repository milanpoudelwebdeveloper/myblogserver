import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import dotenv from 'dotenv'

dotenv.config()

const region = 'ap-south-1'
const awsAccessKey = process.env.AWS_ACCESS_KEY!
const awsSecret = process.env.AWS_SECRET!
const awsSender = process.env.EMAIL_SENDER!

const sesConfig = {
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecret
  },
  region: region
}

const sesClient = new SESClient(sesConfig)

export const sendEmail = async (email: string, subject: string, message: string) => {
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: message
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello ${subject}`
      }
    },
    Source: awsSender
  }
  try {
    const command = new SendEmailCommand(params)
    await sesClient.send(command)
    return true
  } catch (error) {
    console.log('Error while sending email', error)
    throw new Error('Error while sending email')
  }
}
