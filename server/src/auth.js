import express from "express";
import { admin } from "./supabase.js";

const router = express.Router();

// Middleware para verificar JWT
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sem token de autenticação" });
  }

  const token = authHeader.substring(7);
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error("[verify token]", err.message);
    res.status(401).json({ error: "Erro ao verificar token" });
  }
}

// GET /api/auth/profile — retorna dados do usuário autenticado
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    // Busca dados adicionais do usuário na tabela
    const { data: profile, error } = await admin
      .from("users")
      .select("id,email,name,role,created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Se não houver profile na tabela, retorna dados básicos do auth
    const response = profile || {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || null,
      role: "user",
      createdAt: user.created_at,
    };

    res.json(response);
  } catch (err) {
    console.error("[profile]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout — limpa sessão do servidor
router.post("/logout", async (req, res) => {
  try {
    // Em um cenário real com tokens JWT, aqui você adicionaria o token
    // a uma blacklist ou revogaria a sessão. Por enquanto,
    // apenas confirmamos que o logout foi solicitado.
    res.json({ ok: true, message: "Logout realizado com sucesso" });
  } catch (err) {
    console.error("[logout]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh — refresh do token JWT
router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: "Faltou refresh_token" });
    }

    // Usa o refresh token do Supabase para obter um novo access token
    const { data, error } = await admin.auth.refreshSession({
      refresh_token: refresh_token,
    });

    if (error || !data.session) {
      return res.status(401).json({ error: "Não foi possível renovar a sessão" });
    }

    res.json({
      ok: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
    });
  } catch (err) {
    console.error("[refresh]", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
