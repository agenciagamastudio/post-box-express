// Middleware para produção: rate limiting, logging, validação

import { createClient } from "@supabase/supabase-js";

const requestLog = {};

/**
 * Rate limiting simples por IP
 * Máximo 100 requisições por minuto por IP
 */
export function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const window = 60 * 1000; // 1 minuto

  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }

  // Remover requisições antigas
  requestLog[ip] = requestLog[ip].filter((time) => now - time < window);

  // Verificar limite
  if (requestLog[ip].length >= 100) {
    return res.status(429).json({ error: "Muitas requisições. Tente novamente mais tarde." });
  }

  requestLog[ip].push(now);
  next();
}

/**
 * Logging estruturado
 */
export function loggingMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    console.log(JSON.stringify(log));
  });

  next();
}

/**
 * Validação de query params
 */
export function validateQueryParams(req, res, next) {
  const { period, limit } = req.query;

  // Validar period
  if (period && !["7days", "30days"].includes(period)) {
    return res.status(400).json({ error: "Period deve ser '7days' ou '30days'" });
  }

  // Validar limit
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ error: "Limit deve estar entre 1 e 100" });
  }

  next();
}

/**
 * Timeout global para requisições
 */
export function timeoutMiddleware(timeoutMs = 30000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: "Requisição expirou" });
      }
    }, timeoutMs);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    next();
  };
}

/**
 * Error handler global
 */
export function errorHandler(err, req, res, next) {
  console.error("ERROR:", {
    timestamp: new Date().toISOString(),
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
  });
}
