import db from '@root/db'
import { Request, Response } from 'express'

export const getMessages = async (_: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM messages ORDER BY createdat DESC'
    const messages = await db.query(query, [])
    return res.status(200).json({ message: 'Messages fetched successfully', data: messages.rows })
  } catch (e) {
    console.log('hey error while fetching messages', e)
    return res.status(500).json({ message: 'Something went wrong while fetching messages.Please try again' })
  }
}

export const getMessageDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const query = 'SELECT * FROM messages WHERE id=$1'
    const message = await db.query(query, [id])
    if (message.rows.length > 0) {
      return res.status(200).json({ message: 'Message fetched successfully', data: message.rows[0] })
    } else {
      return res.status(404).json({ message: 'Message not found' })
    }
  } catch (e) {
    console.log('hey error while fetching message details', e)
    return res.status(500).json({ message: 'Something went wrong while fetching message details.Please try again' })
  }
}

export const postMessage = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body
  if (!name || !email || !message || !subject) {
    return res.status(400).json({ message: 'Name, email, subject and message are required' })
  }
  try {
    const query = 'INSERT INTO messages(name, email, subject, message, solved) VALUES($1, $2, $3, $4, $5) RETURNING *'
    await db.query(query, [name, email, subject, message, false])
    return res.status(201).json({ message: 'Message sent successfully' })
  } catch (e) {
    console.log('hey error while posting message', e)
    return res.status(500).json({ message: 'Something went wrong while sending message.Please try again' })
  }
}

export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { solved } = req.body
    if (!solved) {
      return res.status(400).json({ message: 'Solved status is required' })
    }
    const query = 'UPDATE messages SET solved=$1 WHERE id=$2 RETURNING *'
    const updatedMessage = await db.query(query, [solved, id])
    if (updatedMessage.rows.length > 0) {
      return res.status(200).json({ message: 'Message status updated successfully', data: updatedMessage.rows[0] })
    } else {
      return res.status(404).json({ message: 'Message not found' })
    }
  } catch (e) {
    console.log('hey error while updating message status', e)
    return res.status(500).json({ message: 'Something went wrong while updating message status.Please try again' })
  }
}
