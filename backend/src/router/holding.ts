import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

export const holdingRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        ticker: z.string().min(1),
        shareCount: z.number().positive(),
        purchasePrice: z.number().nonnegative(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const holding = await ctx.prisma.holding.create({
        data: {
          ticker: input.ticker.toUpperCase(),
          shareCount: input.shareCount,
          purchasePrice: input.purchasePrice,
          userId: ctx.session.userId,
        },
      });
      return {
        id: holding.id,
        ticker: holding.ticker,
        shareCount: holding.shareCount,
        purchasePrice: holding.purchasePrice,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const holdings = await ctx.prisma.holding.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return holdings.map((h) => ({
      id: h.id,
      ticker: h.ticker,
      shareCount: h.shareCount,
      purchasePrice: h.purchasePrice,
    }));
  }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const holding = await ctx.prisma.holding.findUnique({
        where: { id: input.id },
      });

      if (!holding || holding.userId !== ctx.session.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Holding not found or unauthorized',
        });
      }

      await ctx.prisma.holding.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
