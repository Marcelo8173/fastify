import { FastifyInstance } from 'fastify'
import { z as Zod } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createBodySchema = Zod.object({
      title: Zod.string(),
      amount: Zod.number(),
      type: Zod.enum(['credit', 'debit']),
    })

    const { amount, title, type } = createBodySchema.parse(request.body)

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return {
      ...transactions,
    }
  })

  app.get('/:id', async (request) => {
    const paramsScema = Zod.object({
      id: Zod.string().uuid(),
    })

    const { id } = paramsScema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return {
      ...transaction,
    }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', {
        as: 'ammount',
      })
      .first()

    return {
      ...summary,
    }
  })
}

// cookies -> formas da gente manter contexto entre requisições
