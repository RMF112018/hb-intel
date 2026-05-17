import type { TokenCredential } from '@azure/identity';
import type { ServiceBusMessage } from '@azure/service-bus';
import { describe, expect, it, vi } from 'vitest';
import {
  createProjectionSyncMessageSender,
  type IServiceBusClientLike,
  type IServiceBusSenderLike,
} from '../my-projects-projection/webhook/projection-sync-message-sender.js';
import type { IMyProjectsProjectionSyncMessage } from '../my-projects-projection/projection-message-contract.js';

const SAMPLE_MESSAGE: IMyProjectsProjectionSyncMessage = {
  schemaVersion: 'v1',
  messageType: 'my-projects-projection-sync',
  sourceListKind: 'Projects',
  receivedAtUtc: '2026-05-17T12:00:00.000Z',
  debounceBucketUtc: '2026-05-17T12:00:00.000Z',
  notificationBatchId: 'batch-1',
};

const FAKE_CREDENTIAL: TokenCredential = {
  async getToken() {
    return { token: 'fake', expiresOnTimestamp: Date.now() + 60_000 };
  },
};

interface FakeSenderCapture {
  readonly sender: IServiceBusSenderLike;
  readonly sent: ServiceBusMessage[];
  readonly closes: number;
}

interface FakeClientCapture {
  readonly client: IServiceBusClientLike;
  readonly senderCalls: string[];
  readonly senders: FakeSenderCapture[];
  closeCalls: number;
}

function createFakeServiceBusClient(
  opts: {
    failNextSendWith?: Error;
    failNextSenderCreateWith?: Error;
  } = {},
): FakeClientCapture {
  const senderCalls: string[] = [];
  const senders: FakeSenderCapture[] = [];
  const capture: FakeClientCapture = {
    senderCalls,
    senders,
    closeCalls: 0,
    client: undefined as unknown as IServiceBusClientLike,
  };
  let failSendOnce = opts.failNextSendWith;
  const failCreateSenderOnce = opts.failNextSenderCreateWith;
  capture.client = {
    createSender: (queueName: string): IServiceBusSenderLike => {
      senderCalls.push(queueName);
      if (failCreateSenderOnce) {
        throw failCreateSenderOnce;
      }
      const sent: ServiceBusMessage[] = [];
      const senderCapture: FakeSenderCapture = {
        sent,
        closes: 0,
        sender: undefined as unknown as IServiceBusSenderLike,
      };
      const sender: IServiceBusSenderLike = {
        sendMessages: async (messages) => {
          if (failSendOnce) {
            const toThrow = failSendOnce;
            failSendOnce = undefined;
            throw toThrow;
          }
          const list = Array.isArray(messages) ? messages : [messages];
          for (const m of list) sent.push(m);
        },
        close: async () => {
          (senderCapture as unknown as { closes: number }).closes += 1;
        },
      };
      (senderCapture as unknown as { sender: IServiceBusSenderLike }).sender = sender;
      senders.push(senderCapture);
      return sender;
    },
    close: async () => {
      capture.closeCalls += 1;
    },
  };
  return capture;
}

describe('createProjectionSyncMessageSender', () => {
  it('lazily creates the sender on first sendSyncMessage and reuses it', async () => {
    const capture = createFakeServiceBusClient();
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'my-projects-projection-sync',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    await sender.sendSyncMessage(SAMPLE_MESSAGE);
    await sender.sendSyncMessage(SAMPLE_MESSAGE);
    expect(capture.senderCalls).toEqual([
      'my-projects-projection-sync',
      // sender is created exactly once
    ]);
    expect(capture.senders).toHaveLength(1);
    expect(capture.senders[0].sent).toHaveLength(2);
  });

  it('sets the deterministic Service Bus messageId from the locked template', async () => {
    const capture = createFakeServiceBusClient();
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'q',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    const outcome = await sender.sendSyncMessage(SAMPLE_MESSAGE);
    expect(outcome.acknowledged).toBe(true);
    if (outcome.acknowledged) {
      expect(outcome.messageId).toBe('my-projects-projection:Projects:2026-05-17T12:00:00.000Z');
    }
    const sentMessage = capture.senders[0].sent[0];
    expect(sentMessage.messageId).toBe('my-projects-projection:Projects:2026-05-17T12:00:00.000Z');
    expect(sentMessage.contentType).toBe('application/json');
    expect(sentMessage.body).toEqual(SAMPLE_MESSAGE);
  });

  it('returns invalid-message when sourceListKind is bogus', async () => {
    const capture = createFakeServiceBusClient();
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'q',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    const bogus = {
      ...SAMPLE_MESSAGE,
      sourceListKind: 'nope',
    } as unknown as IMyProjectsProjectionSyncMessage;
    const outcome = await sender.sendSyncMessage(bogus);
    expect(outcome).toMatchObject({ acknowledged: false, failureCode: 'invalid-message' });
    expect(capture.senders).toHaveLength(0);
  });

  it('returns send-failed and sanitizes the error message', async () => {
    const capture = createFakeServiceBusClient({
      failNextSendWith: new Error(
        'AMQP failure: Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH leaked',
      ),
    });
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'q',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    const outcome = await sender.sendSyncMessage(SAMPLE_MESSAGE);
    expect(outcome.acknowledged).toBe(false);
    if (outcome.acknowledged === false) {
      expect(outcome.failureCode).toBe('send-failed');
      expect(outcome.sanitizedReason).toContain('[REDACTED]');
      expect(outcome.sanitizedReason).not.toContain('eyJabcdef');
    }
  });

  it('returns sender-unavailable when createSender throws', async () => {
    const capture = createFakeServiceBusClient({
      failNextSenderCreateWith: new Error('namespace unreachable'),
    });
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'q',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    const outcome = await sender.sendSyncMessage(SAMPLE_MESSAGE);
    expect(outcome).toMatchObject({ acknowledged: false, failureCode: 'sender-unavailable' });
  });

  it('close() disposes both sender and client and allows re-creation on next send', async () => {
    const capture = createFakeServiceBusClient();
    const sender = createProjectionSyncMessageSender({
      fqdn: 'sb.servicebus.windows.net',
      queueName: 'q',
      credential: FAKE_CREDENTIAL,
      clientFactory: () => capture.client,
    });
    await sender.sendSyncMessage(SAMPLE_MESSAGE);
    await sender.close();
    expect(capture.senders[0].closes).toBe(1);
    expect(capture.closeCalls).toBe(1);
    // Next send should reopen — but the same fake-client instance is reused
    // (the production class caches `client`; after close it's reset to null
    // and the factory is invoked again, returning the same single fake).
    await sender.sendSyncMessage(SAMPLE_MESSAGE);
    expect(capture.senderCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('throws on empty fqdn or queueName at construction time', () => {
    expect(() =>
      createProjectionSyncMessageSender({
        fqdn: '',
        queueName: 'q',
        credential: FAKE_CREDENTIAL,
        clientFactory: vi.fn(),
      }),
    ).toThrow(RangeError);
    expect(() =>
      createProjectionSyncMessageSender({
        fqdn: 'sb.servicebus.windows.net',
        queueName: '   ',
        credential: FAKE_CREDENTIAL,
        clientFactory: vi.fn(),
      }),
    ).toThrow(RangeError);
  });
});
