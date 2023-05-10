import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import Fastify, {FastifyInstance} from 'fastify'
import {prisma} from "./prisma.js";
import {Static, Type} from "@sinclair/typebox";

const server: FastifyInstance = Fastify({})

server.register(import('@fastify/cors'), {
    origin: '*'
})

// @ts-ignore
await server.register(import('@fastify/rate-limit'), {
    max: 5,
    timeWindow: '1 minute'
})

const leaderboardQuerystring = Type.Object({
    count: Type.Number({default: 10})
})

type LeaderboardQuerystringType = Static<typeof leaderboardQuerystring>

server.get<{ Querystring: LeaderboardQuerystringType }>('/leaderboard', {
    schema: {
        querystring: leaderboardQuerystring
    }
}, async (request, reply) => {
    const count = request.query.count ?? 10;
    return prisma.db_player.findMany({
        take: count,
        orderBy: {
            score: 'desc'
        },
        select: {
            score: true,
            username: true
        }
    });
})

const playerParams = Type.Object({
    nickname: Type.String()
})

server.get<{Params: Static<typeof playerParams>}>('/player/:nickname', async (request, reply) => {
    const nickname = request.params.nickname;
    return prisma.db_player.findFirstOrThrow({
        where: {
            username: nickname
        },
        select: {
            score: true,
            username: true
        }
    });
})

const start = async () => {
    try {
        // check if prisma is connected to the database
        await prisma.$connect()
        console.log('Connected to database')

        console.log('Starting server...')
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        const host = process.env.HOST ?? 'localhost';
        await server.listen({port: 3001, host})

        const address = server.server.address()
        const port = typeof address === 'string' ? address : address?.port

        console.log(`Server is listening at ${port}`)

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
start().finally(() => {
    prisma.$disconnect()
})
