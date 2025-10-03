// routes/chat.js
const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

// These are wired in server.js via app.locals
function requireCtx(req) {
  const { anchor, driftLock, lattice, lsk, overlay } = req.app.locals;
  if (!anchor || !driftLock || !lattice || !lsk || !overlay) {
    throw new Error("MirrorCore context not initialized");
  }
  return { anchor, driftLock, lattice, lsk, overlay };
}

const ARTIFACT_DIR = path.join(process.cwd(), "artifacts");
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

router.post("/chat", async (req, res) => {
  const id = uuid();
  const t0 = Date.now();
  try {
    const { anchor, driftLock, lattice, lsk, overlay } = requireCtx(req);
    const { message, userId = "anon", meta = {} } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message (string) is required" });
    }

    // 1) Anchor → normalize input & attach session context
    const anchored = anchor.normalize({ text: message, userId, meta });

    // 2) Memory lattice → retrieve relevant prior facts
    const mem = await lattice.retrieve({ userId, query: anchored.text });

    // 3) Draft reply (placeholder: echo with light transformation)
    let draft = `You said: ${anchored.text}`;
    if (mem && mem.hits?.length) {
      draft += `\n\n(Recall: ${mem.hits.slice(0, 2).map(h => h.note).join(" | ")})`;
    }

    // 4) Apply DriftLock pass (safety & coherence guardrail)
    const locked = driftLock.review({
      input: anchored.text,
      draft,
      context: { userId, mem }
    });

    // 5) Ethical overlay (LSK+ lightweight heuristic)
    const ethics = lsk.evaluate({
      text: locked.text,
      userId,
      context: mem?.profile || {}
    });

    // 6) Final overlay (HLC overlay can tag or style the reply)
    const finalText = overlay.render({
      text: locked.text,
      tags: ethics.tags,
      score: ethics.score
    });

    // 7) Persist conversation shard
    await lattice.store({
      userId,
      turnId: id,
      input: anchored.text,
      output: finalText,
      tags: ethics.tags,
      ts: Date.now()
    });

    // 8) Write minimal artifact (for debugging / audits)
    const record = {
      id,
      userId,
      t0,
      t1: Date.now(),
      input: anchored.text,
      output: finalText,
      ethics
    };
    fs.writeFileSync(path.join(ARTIFACT_DIR, `chat_${id}.json`), JSON.stringify(record, null, 2));

    return res.json({
      id,
      output: finalText,
      ethics,
      latency_ms: record.t1 - t0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "internal_error" });
  }
});

module.exports = router;
