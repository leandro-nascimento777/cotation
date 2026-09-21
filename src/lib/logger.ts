/** Logger estruturado com níveis, timestamps e contexto seguro. */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

const formatLog = (level: LogLevel, { message, context, error }: LogPayload): string => {
  const timestamp = new Date().toISOString();
  const errorDetails =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error
        ? String(error)
        : undefined;

  return JSON.stringify({
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(context ? { context } : {}),
    ...(errorDetails ? { error: errorDetails } : {}),
  });
};

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(formatLog("info", { message, context }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(formatLog("warn", { message, context }));
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(formatLog("error", { message, error, context }));
  },
};
