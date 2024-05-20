import * as ccxt from 'ccxt';

import { TradekitError } from '../types/shared/errors';

export const handleError = (e: unknown): TradekitError => {
  if (e instanceof ccxt.NetworkError) {
    if (e instanceof ccxt.RateLimitExceeded) return { reason: 'RATE_LIMIT' };
    else
      return {
        reason: 'NETWORK_ERROR',
        info: {
          msg: e.message,
        },
      };
  }
  if (e instanceof ccxt.ExchangeError) {
    if (e instanceof ccxt.BadSymbol) {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'BAD_SYMBOL',
          msg: e.message,
        },
      };
    }

    if (e instanceof ccxt.InvalidOrder) {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'INVALID_ORDER',
          msg: e.message,
        },
      };
    }

    const parsed = JSON.parse(e.message.replace('binance ', '')) as {
      code: number;
      msg: string;
    };
    if (parsed.code === -2022) {
      return {
        reason: 'TRADEKIT_ERROR',
        info: {
          code: 'INVALID_ORDER',
          msg: parsed.msg,
        },
      };
    }
    return {
      reason: 'EXCHANGE_ERROR',
      info: {
        exchange: 'binance',
        code: parsed.code.toString(),
        msg: parsed.msg,
      },
    };
  }
  if (e instanceof ccxt.BaseError) {
    return {
      reason: 'CCXT_ERROR',
      info: {
        code: e.name
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toUpperCase(),
        msg: e.message,
        original: e,
      },
    };
  }
  if (e instanceof Error)
    return {
      reason: 'UNKNOWN_ERROR',
      info: {
        msg: e.name
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toUpperCase(),
        code: 'UNKNOWN',
      },
    };
  return {
    reason: 'UNKNOWN_ERROR',
    info: {
      msg: 'If you see this error you have successfully broken my code. Congratulations!',
      code: 'GOOD_JOB',
    },
  };
};
