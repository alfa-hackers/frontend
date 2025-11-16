/* eslint-disable */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { Chat, FileAttachment } from './chatTypes'
import { ApiMessage, ApiRoom } from './apiTypes'
import { fetchFileAsBase64, getApiUrl, getMimeTypeFromUrl } from './utils'

export const loadChats = createAsyncThunk('chat/loadChats', async () => {
  const apiUrl = getApiUrl()
  console.log('[loadChats] API URL:', apiUrl)

  const roomsResponse = await fetch(`${apiUrl}/rooms/by-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({}),
  })

  if (!roomsResponse.ok) {
    const errorData = await roomsResponse.json()
    console.error('[loadChats] Failed to load rooms:', errorData)
    throw new Error(`Failed to load chats: ${errorData.message}`)
  }

  const roomsResult = await roomsResponse.json()
  const rooms: ApiRoom[] = roomsResult.data
  console.log('[loadChats] Rooms loaded:', rooms.length)

  const chatsWithMessages = await Promise.all(
    rooms.map(async (room) => {
      console.log(
        `[loadChats] Loading messages for room: ${room.id} (${room.name})`
      )
      try {
        const messagesResponse = await fetch(`${apiUrl}/messages/by-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ roomId: room.id }),
        })

        if (!messagesResponse.ok) {
          console.warn(
            `[loadChats] Failed to load messages for room ${room.id}`
          )
          return {
            id: room.id,
            title: room.name || 'Новый чат',
            roomId: room.id,
            messages: [],
            isWaitingForResponse: false,
          }
        }

        const messagesResult = await messagesResponse.json()
        const messages: ApiMessage[] = messagesResult.data || []
        console.log(
          `[loadChats] Messages loaded for room ${room.id}:`,
          messages.length
        )

        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        const messagesWithAttachments = await Promise.all(
          sortedMessages.map(async (msg) => {
            const message: any = {
              id: msg.id,
              content: msg.text,
              sender: msg.messageType === 'user' ? 'user' : 'assistant',
              status: 'sent',
            }

            if (msg.file_address) {
              console.log(
                `[loadChats] Loading attachment for message ${msg.id}:`,
                msg.file_address
              )
              try {
                let cleanFileUrl = msg.file_address

                if (
                  cleanFileUrl.startsWith('http://') ||
                  cleanFileUrl.startsWith('https://')
                ) {
                  const urlObj = new URL(cleanFileUrl)
                  cleanFileUrl = urlObj.pathname.substring(1)
                }

                console.log('[loadChats] Clean fileUrl:', cleanFileUrl)

                const presignedResponse = await fetch(
                  `${apiUrl}/presigned/download`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ fileUrl: cleanFileUrl }),
                  }
                )

                if (presignedResponse.ok) {
                  const data = await presignedResponse.json()
                  const presignedUrl = data.url

                  if (presignedUrl) {
                    const fileName =
                      msg.file_name ||
                      msg.file_address.split('/').pop() ||
                      'file'
                    const mimeType = getMimeTypeFromUrl(msg.file_address)
                    const fileData = await fetchFileAsBase64(presignedUrl)

                    message.attachments = [
                      {
                        filename: fileName,
                        mimeType,
                        data: fileData,
                        size: 0,
                      } as FileAttachment,
                    ]
                    console.log(
                      `[loadChats] Attachment loaded for message ${msg.id}:`,
                      fileName
                    )
                  } else {
                    console.warn(
                      `[loadChats] No URL returned for message ${msg.id}`
                    )
                  }
                } else {
                  const errorData = await presignedResponse
                    .json()
                    .catch(() => ({}))
                  console.warn(
                    `[loadChats] Failed to get presigned URL for message ${msg.id}:`,
                    errorData
                  )
                }
              } catch (error) {
                console.error(
                  `[loadChats] Error fetching presigned URL for message ${msg.id}:`,
                  error
                )
              }
            }

            return message
          })
        )

        return {
          id: room.id,
          title: room.name || 'Новый чат',
          roomId: room.id,
          messages: messagesWithAttachments,
          isWaitingForResponse: false,
        }
      } catch (error) {
        console.error(`[loadChats] Error processing room ${room.id}:`, error)
        return {
          id: room.id,
          title: room.name || 'Новый чат',
          roomId: room.id,
          messages: [],
          isWaitingForResponse: false,
        }
      }
    })
  )

  console.log('[loadChats] All chats loaded')
  return chatsWithMessages
})
