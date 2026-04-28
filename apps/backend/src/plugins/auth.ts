import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../config/supabase'

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null
  }
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
    requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void>
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('user', null)

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return reply.status(401).send({
          error: { code: 'UNAUTHORIZED', message: 'Missing authorization token', details: [] },
        })
      }

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (error || !user) {
        return reply.status(401).send({
          error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token', details: [] },
        })
      }

      request.user = user
    }
  )

  fastify.decorate(
    'requireAdmin',
    async function (request: FastifyRequest, reply: FastifyReply) {
      await fastify.authenticate(request, reply)
      if (reply.sent) return

      if (request.user?.app_metadata?.role !== 'admin') {
        return reply.status(403).send({
          error: { code: 'FORBIDDEN', message: 'Admin access required', details: [] },
        })
      }
    }
  )
}
