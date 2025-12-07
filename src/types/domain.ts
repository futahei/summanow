import { z } from 'zod';

const isoDateTime = () => z.string().datetime({ offset: true });

export const SiteCategorySchema = z.enum(['press_release', 'news']);
export type SiteCategory = z.infer<typeof SiteCategorySchema>;

export const CrawlWindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/u, 'Use HH:MM 24h format'),
  end: z.string().regex(/^\d{2}:\d{2}$/u, 'Use HH:MM 24h format'),
});
export type CrawlWindow = z.infer<typeof CrawlWindowSchema>;

export const SiteSchema = z.object({
  siteId: z.string().min(1),
  name: z.string().min(1),
  category: SiteCategorySchema,
  baseUrl: z.string().url(),
  crawlWindows: z.array(CrawlWindowSchema).min(1),
  allowedPaths: z.array(z.string().min(1)).min(1),
  requestIntervalMs: z.number().int().positive(),
  timezone: z.string().min(1),
  createdAt: isoDateTime(),
  updatedAt: isoDateTime(),
});
export type Site = z.infer<typeof SiteSchema>;

export const ArticleStatusSchema = z.enum(['summarized', 'pending_summary', 'summary_failed']);
export type ArticleStatus = z.infer<typeof ArticleStatusSchema>;

export const ArticleSchema = z.object({
  articleId: z.string().min(1),
  siteId: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  canonicalHash: z.string().min(1),
  publishedAt: isoDateTime(),
  fetchedAt: isoDateTime(),
  author: z.string().optional().nullable(),
  bodyPlain: z.string().max(10000),
  wordCount: z.number().int().nonnegative(),
  topics: z.array(z.string().min(1)).optional(),
  status: ArticleStatusSchema,
  summaryId: z.string().min(1).optional(),
  lastSummaryAttemptAt: isoDateTime().optional(),
  s3SnapshotKey: z.string().min(1).optional(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const SummaryProviderSchema = z.enum(['openai', 'azure_openai']);
export type SummaryProvider = z.infer<typeof SummaryProviderSchema>;

export const SummarySchema = z.object({
  summaryId: z.string().min(1),
  articleId: z.string().min(1),
  modelProvider: SummaryProviderSchema,
  modelId: z.string().min(1),
  promptTemplateId: z.string().min(1),
  summaryText: z.string().min(1),
  confidence: z.number().min(0).max(1),
  generatedAt: isoDateTime(),
  tokenUsage: z
    .object({
      input: z.number().int().nonnegative(),
      output: z.number().int().nonnegative(),
    })
    .optional(),
  disclaimer: z.string().min(1),
  s3PromptKey: z.string().min(1).optional(),
  s3ResponseKey: z.string().min(1).optional(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const CrawlStatusSchema = z.enum(['success', 'partial', 'failed']);
export type CrawlStatus = z.infer<typeof CrawlStatusSchema>;

export const CrawlRunSchema = z.object({
  runId: z.string().min(1),
  siteId: z.string().min(1),
  triggerType: z.enum(['schedule', 'manual']),
  startedAt: isoDateTime(),
  completedAt: isoDateTime().optional(),
  status: CrawlStatusSchema,
  processedCount: z.number().int().nonnegative(),
  newArticles: z.number().int().nonnegative(),
  failedArticles: z.number().int().nonnegative(),
  errorSummary: z.string().optional(),
  lambdaRequestId: z.string().optional(),
  s3LogKey: z.string().optional(),
});
export type CrawlRun = z.infer<typeof CrawlRunSchema>;

export const RetryFailureTypeSchema = z.enum(['fetch', 'summary']);
export type RetryFailureType = z.infer<typeof RetryFailureTypeSchema>;

export const RetryQueueItemSchema = z.object({
  articleId: z.string().min(1),
  failureType: RetryFailureTypeSchema,
  nextRetryAt: isoDateTime(),
  attemptCount: z.number().int().nonnegative(),
  lastError: z.string().optional(),
  createdAt: isoDateTime(),
});
export type RetryQueueItem = z.infer<typeof RetryQueueItemSchema>;

export type DynamoEntity =
  | ({ entityType: 'site' } & Site)
  | ({ entityType: 'article' } & Article)
  | ({ entityType: 'summary' } & Summary)
  | ({ entityType: 'crawlRun' } & CrawlRun)
  | ({ entityType: 'retryQueue' } & RetryQueueItem);

export const isArticle = (value: unknown): value is Article =>
  ArticleSchema.safeParse(value).success;
export const isSummary = (value: unknown): value is Summary =>
  SummarySchema.safeParse(value).success;
export const isSite = (value: unknown): value is Site => SiteSchema.safeParse(value).success;
export const isCrawlRun = (value: unknown): value is CrawlRun =>
  CrawlRunSchema.safeParse(value).success;
export const isRetryQueueItem = (value: unknown): value is RetryQueueItem =>
  RetryQueueItemSchema.safeParse(value).success;
