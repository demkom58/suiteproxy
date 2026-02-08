import { EventEmitter } from 'node:events';

const globalForBus = global as unknown as { accountBus: EventEmitter };

export const accountBus = globalForBus.accountBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForBus.accountBus = accountBus;

export const ACTIONS = {
  ACCOUNTS_CHANGED: 'accounts_changed'
} as const;