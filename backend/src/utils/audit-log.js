const db = require("../config/db");
const writeAuditLog = async (input) => {
    await db.query(`
      INSERT INTO audit_logs (
        action,
        actor_user_id,
        actor_email,
        actor_role,
        target_type,
        target_id,
        status,
        ip_address,
        user_agent,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    `, [
        input.action,
        input.actorUserId ?? null,
        input.actorEmail ?? null,
        input.actorRole ?? null,
        input.targetType ?? null,
        input.targetId ?? null,
        input.status ?? "SUCCESS",
        input.ipAddress ?? null,
        input.userAgent ?? null,
        JSON.stringify(input.metadata ?? {}),
    ]);
};
exports.writeAuditLog = writeAuditLog;
