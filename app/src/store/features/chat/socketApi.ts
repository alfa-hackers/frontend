/* eslint-disable */
import { io, Socket } from 'socket.io-client'
import { AppDispatch } from '../../store'
import { updateMessageStatus, setWaitingForResponse } from './chatSlice'
import { FileAttachment, MessageFlag } from './chatTypes'
import { processAssistantMessageWithFile } from './apiAiWithFileProcess'

class SocketApi {
  private socket: Socket | null = null
  private dispatch: AppDispatch | null = null
  private joinedRooms: Set<string> = new Set()

  async initialize(dispatch: AppDispatch) {
    if (this.socket?.connected) {
      console.log('[SocketApi] Already connected, skipping initialization')
      return
    }
    this.dispatch = dispatch
    console.log('[SocketApi] Initializing socket...')

    const isDev = process.env.NODE_ENV === 'development'
    const getSocketUrl = () =>
      isDev ? 'http://localhost:3000' : 'wss://api.whirav.ru'

    try {
      const res = await fetch(
        `${isDev ? 'http://localhost:3000' : 'https://api.whirav.ru'}/user-temp`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) {
        throw new Error(
          `[SocketApi] Failed to fetch user temp id: ${res.status}`
        )
      }

      const data = await res.json()
      const userTempId = data.userTempId

      if (!userTempId) {
        throw new Error('[SocketApi] userTempId not received from server')
      }

      console.log('[SocketApi] Connecting socket with userTempId:', userTempId)

      this.socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        secure: !isDev,
        auth: { user_temp_id: userTempId },
        withCredentials: true,
      })

      this.socket.on('connect', () => {
        console.log('[SocketApi] Socket connected with id:', this.socket?.id)
        console.log('[SocketApi] Auth info:', this.socket?.auth)
      })

      this.socket.on(
        'message',
        (data: {
          userId: string
          message: string
          chatId?: string
          fileUrl?: string
          responseType?: string
        }) => {
          console.log('[SocketApi] Received message:', data)
          if (data.userId === 'assistant' && this.dispatch) {
            this.dispatch(
              processAssistantMessageWithFile(data.message, data.fileUrl) as any
            )
            if (data.chatId) {
              this.dispatch(
                setWaitingForResponse({ chatId: data.chatId, isWaiting: false })
              )
            }
          }
        }
      )

      this.socket.on(
        'message_sent',
        (data: { messageId: string; success: boolean }) => {
          console.log('[SocketApi] Message sent status:', data)
          if (this.dispatch) {
            this.dispatch(
              updateMessageStatus({
                messageId: data.messageId,
                status: data.success ? 'sent' : 'error',
              })
            )
          }
        }
      )

      this.socket.on(
        'message_error',
        (data: { messageId: string; error: string; chatId?: string }) => {
          console.error('[SocketApi] Message error received:', data)
          if (this.dispatch) {
            this.dispatch(
              updateMessageStatus({
                messageId: data.messageId,
                status: 'error',
              })
            )
            if (data.chatId) {
              this.dispatch(
                setWaitingForResponse({ chatId: data.chatId, isWaiting: false })
              )
            }
          }
        }
      )

      this.socket.on('disconnect', (reason) => {
        console.log('[SocketApi] Socket disconnected. Reason:', reason)
      })

      this.socket.on('connect_error', (error) => {
        console.error('[SocketApi] Socket connection error:', error.message)
      })
    } catch (error) {
      console.error('[SocketApi] Error initializing socket:', error)
      throw error
    }
  }

  joinRoom(roomId: string, roomName?: string) {
    if (this.socket?.connected && !this.joinedRooms.has(roomId)) {
      console.log('[SocketApi] Joining room:', roomId, 'name:', roomName)
      this.socket.emit('joinRoom', { roomId, roomName })
      this.joinedRooms.add(roomId)
    } else {
      console.log(
        '[SocketApi] Cannot join room, socket disconnected or already joined'
      )
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket?.connected && this.joinedRooms.has(roomId)) {
      console.log('[SocketApi] Leaving room:', roomId)
      this.socket.emit('leaveRoom', { roomId })
      this.joinedRooms.delete(roomId)
    } else {
      console.log(
        '[SocketApi] Cannot leave room, socket disconnected or not joined'
      )
    }
  }

  sendMessage(
    roomId: string,
    message: string,
    messageId: string,
    chatId: string,
    messageFlag: MessageFlag,
    attachments?: FileAttachment[]
  ) {
    if (!this.socket?.connected) {
      console.warn(
        '[SocketApi] Socket not connected. Cannot send message:',
        message
      )
      if (this.dispatch) {
        this.dispatch(updateMessageStatus({ messageId, status: 'error' }))
        this.dispatch(setWaitingForResponse({ chatId, isWaiting: false }))
      }
      return
    }

    console.log('[SocketApi] Sending message:', { roomId, message, messageId })
    this.socket.emit(
      'sendMessage',
      { roomId, message, messageId, chatId, messageFlag, attachments },
      (response: any) => {
        console.log('[SocketApi] sendMessage response:', response)
        if (this.dispatch) {
          this.dispatch(
            updateMessageStatus({
              messageId,
              status: response?.success ? 'sent' : 'error',
            })
          )
          if (!response?.success) {
            this.dispatch(setWaitingForResponse({ chatId, isWaiting: false }))
          }
        }
      }
    )
  }

  disconnect() {
    if (this.socket) {
      console.log('[SocketApi] Disconnecting socket...')
      this.socket.disconnect()
      this.socket = null
      this.joinedRooms.clear()
    } else {
      console.log('[SocketApi] Socket already disconnected')
    }
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketApi = new SocketApi()
