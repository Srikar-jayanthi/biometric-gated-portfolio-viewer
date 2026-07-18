import { router } from '../trpc';
import { userRouter } from './user';
import { holdingRouter } from './holding';

export const appRouter = router({
  user: userRouter,
  holding: holdingRouter,
});

export type AppRouter = typeof appRouter;
