/**
 * My Projects projection — Service Bus sync-message sender.
 *
 * Wraps `@azure/service-bus` v7 `ServiceBusClient` + `ServiceBusSender` behind
 * an `IProjectionSyncMessageSender` interface so:
 *   - the webhook handler never imports the SDK directly,
 *   - tests inject an in-memory fake via `clientFactory`,
 *   - SDK errors are caught and translated into a closed-set typed outcome
 *     before bubbling — the webhook never sees raw AMQP error shapes,
 *   - error messages are sanitized (no Bearer/JWT/long-base64-url substrings
 *     leak into telemetry).
 *
 * Caching: a single `ServiceBusSender` is built lazily and reused across the
 * sender instance lifetime. `close()` disposes both the sender and the
 * underlying client. After `close()`, the next `sendSyncMessage` rebuilds.
 *
 * The package locks the message body to `resources/Service_Bus_Message_Contract.json`
 * (see Prompt 01 — `IMyProjectsProjectionSyncMessage`); deterministic
 * `messageId` is built upstream via `buildProjectionSyncMessageId` and passed
 * here so Service Bus duplicate detection can suppress redundant debounce
 * sends.
 */

import { ServiceBusClient, type ServiceBusMessage } from '@azure/service-bus';
import { DefaultAzureCredential, type TokenCredential } from '@azure/identity';
import type { IMyProjectsProjectionSyncMessage } from '../projection-message-contract.js';
import { buildProjectionSyncMessageId } from '../projection-message-contract.js';

export type ProjectionSyncMessageSendFailureCode =
  | 'send-failed'
  | 'sender-unavailable'
  | 'invalid-message';

export type IProjectionSyncMessageSendOutcome =
  | {
      readonly acknowledged: true;
      readonly messageId: string;
      readonly duplicateDetected?: boolean;
    }
  | {
      readonly acknowledged: false;
      readonly failureCode: ProjectionSyncMessageSendFailureCode;
      readonly sanitizedReason: string;
    };

export interface IProjectionSyncMessageSender {
  sendSyncMessage(
    message: IMyProjectsProjectionSyncMessage,
  ): Promise<IProjectionSyncMessageSendOutcome>;
  close(): Promise<void>;
}

export interface IServiceBusSenderLike {
  sendMessages(messages: ServiceBusMessage | ServiceBusMessage[]): Promise<void>;
  close(): Promise<void>;
}

export interface IServiceBusClientLike {
  createSender(queueOrTopicName: string): IServiceBusSenderLike;
  close(): Promise<void>;
}

export interface IProjectionSyncMessageSenderOptions {
  readonly fqdn: string;
  readonly queueName: string;
  readonly credential?: TokenCredential;
  readonly clientFactory?: (fqdn: string, credential: TokenCredential) => IServiceBusClientLike;
}

const TOKEN_SHAPED_PATTERNS: readonly RegExp[] = [
  /Bearer\s+[A-Za-z0-9._+/=-]+/gi,
  /eyJ[A-Za-z0-9._-]{20,}/g,
  /[A-Za-z0-9_-]{40,}/g,
];

const SANITIZED_REASON_MAX_LENGTH = 240;

function sanitizeReason(value: unknown): string {
  const raw = value instanceof Error ? value.message : String(value);
  let scrubbed = raw;
  for (const pattern of TOKEN_SHAPED_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, '[REDACTED]');
  }
  if (scrubbed.length > SANITIZED_REASON_MAX_LENGTH) {
    scrubbed = `${scrubbed.slice(0, SANITIZED_REASON_MAX_LENGTH)}…`;
  }
  return scrubbed;
}

function defaultClientFactory(fqdn: string, credential: TokenCredential): IServiceBusClientLike {
  return new ServiceBusClient(fqdn, credential) as unknown as IServiceBusClientLike;
}

class ProjectionSyncMessageSender implements IProjectionSyncMessageSender {
  private readonly fqdn: string;
  private readonly queueName: string;
  private readonly credential: TokenCredential;
  private readonly clientFactory: (
    fqdn: string,
    credential: TokenCredential,
  ) => IServiceBusClientLike;

  private client: IServiceBusClientLike | null = null;
  private sender: IServiceBusSenderLike | null = null;

  constructor(opts: IProjectionSyncMessageSenderOptions) {
    if (typeof opts.fqdn !== 'string' || opts.fqdn.trim().length === 0) {
      throw new RangeError(
        'createProjectionSyncMessageSender: fqdn must be a non-empty Service Bus FQDN.',
      );
    }
    if (typeof opts.queueName !== 'string' || opts.queueName.trim().length === 0) {
      throw new RangeError(
        'createProjectionSyncMessageSender: queueName must be a non-empty Service Bus queue name.',
      );
    }
    this.fqdn = opts.fqdn;
    this.queueName = opts.queueName;
    this.credential = opts.credential ?? new DefaultAzureCredential();
    this.clientFactory = opts.clientFactory ?? defaultClientFactory;
  }

  private ensureSender(): IServiceBusSenderLike {
    if (this.sender !== null) {
      return this.sender;
    }
    if (this.client === null) {
      this.client = this.clientFactory(this.fqdn, this.credential);
    }
    this.sender = this.client.createSender(this.queueName);
    return this.sender;
  }

  async sendSyncMessage(
    message: IMyProjectsProjectionSyncMessage,
  ): Promise<IProjectionSyncMessageSendOutcome> {
    let messageId: string;
    try {
      messageId = buildProjectionSyncMessageId(message.sourceListKind, message.debounceBucketUtc);
    } catch (err: unknown) {
      return {
        acknowledged: false,
        failureCode: 'invalid-message',
        sanitizedReason: sanitizeReason(err),
      };
    }

    let sender: IServiceBusSenderLike;
    try {
      sender = this.ensureSender();
    } catch (err: unknown) {
      return {
        acknowledged: false,
        failureCode: 'sender-unavailable',
        sanitizedReason: sanitizeReason(err),
      };
    }

    const serviceBusMessage: ServiceBusMessage = {
      messageId,
      contentType: 'application/json',
      body: { ...message },
    };

    try {
      await sender.sendMessages(serviceBusMessage);
      return { acknowledged: true, messageId };
    } catch (err: unknown) {
      return {
        acknowledged: false,
        failureCode: 'send-failed',
        sanitizedReason: sanitizeReason(err),
      };
    }
  }

  async close(): Promise<void> {
    try {
      if (this.sender !== null) {
        await this.sender.close();
      }
    } finally {
      this.sender = null;
      try {
        if (this.client !== null) {
          await this.client.close();
        }
      } finally {
        this.client = null;
      }
    }
  }
}

export function createProjectionSyncMessageSender(
  opts: IProjectionSyncMessageSenderOptions,
): IProjectionSyncMessageSender {
  return new ProjectionSyncMessageSender(opts);
}
