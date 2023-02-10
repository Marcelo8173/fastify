import { it, beforeAll, describe, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 50000,
        type: 'credit',
      })
      .expect(201)
  })

  it('Sould be able list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 50000,
        type: 'credit',
      })
      .expect(201)
    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionResponse.body[0]).toEqual(
      expect.objectContaining({
        title: 'new transaction',
        amount: 50000,
      }),
    )
  })

  it('Sould be able list on transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 50000,
        type: 'credit',
      })
      .expect(201)
    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const id = listTransactionResponse.body[0].id

    const listByidTransaction = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(listByidTransaction.body).toEqual(
      expect.objectContaining({
        title: 'new transaction',
        amount: 50000,
      }),
    )
  })

  it.only('Sould be able list summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 50000,
        type: 'credit',
      })
      .expect(201)
    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new transaction',
        amount: 2000,
        type: 'debit',
      })
      .expect(201)

    const listSummaryTransaction = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(listSummaryTransaction.body).toEqual({
      ammount: 50000 - 2000,
    })
  })
})
