import { FastifyInstance } from 'fastify'
import { z as Zod } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkIdExist } from '../middleware/check-session-id-exist'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createBodySchema = Zod.object({
      title: Zod.string(),
      amount: Zod.number(),
      type: Zod.enum(['credit', 'debit']),
    })

    const { amount, title, type } = createBodySchema.parse(request.body)
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkIdExist],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      return {
        ...transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkIdExist],
    },
    async (request) => {
      const paramsScema = Zod.object({
        id: Zod.string().uuid(),
      })

      const { id } = paramsScema.parse(request.params)
      const sessionId = request.cookies.sessionId

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return {
        ...transaction,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkIdExist],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', {
          as: 'ammount',
        })
        .first()

      return {
        ...summary,
      }
    },
  )
}

// cookies -> formas da gente manter contexto entre requisições
