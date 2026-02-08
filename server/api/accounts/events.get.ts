// server/api/accounts/events.get.ts
import { accountBus, ACTIONS } from '~~/server/utils/bus';

export default defineEventHandler((event) => {
  const stream = createEventStream(event);

  const handler = () => {
    // We send a simple message. The UI listens for 'update'
    stream.push({
      event: 'update',
      data: Date.now().toString() // Changing data forces a refresh
    });
  };

  accountBus.on(ACTIONS.ACCOUNTS_CHANGED, handler);

  stream.onClosed(() => {
    accountBus.off(ACTIONS.ACCOUNTS_CHANGED, handler);
  });

  return stream.send();
});