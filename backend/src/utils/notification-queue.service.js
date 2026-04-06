const db_1 = require("../config/db");
const env_1 = require("../config/env");
const listNotificationJobs = async (limit, offset, status) => {
    const params = [];
    let whereClause = "";
    if (status) {
        params.push(status);
        whereClause = `WHERE nj.status = $${params.length}`;
    }
    const [rowsResult, countResult] = await Promise.all([
        db_1.query(`
        SELECT
          nj.id,
          nj.notification_id,
          nj.user_id,
          nj.channel,
          nj.status,
          nj.attempt_count,
          nj.max_attempts,
          nj.last_error,
          nj.next_retry_at::text,
          nj.processed_at::text,
          nj.created_at::text,
          nj.updated_at::text,
          u.email AS user_email,
          p.phone_number AS user_phone
        FROM notification_jobs nj
        INNER JOIN users u ON u.id = nj.user_id
        LEFT JOIN patients p ON p.user_id = u.id
        ${whereClause}
        ORDER BY nj.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),
        db_1.query(`
        SELECT COUNT(*)::text AS total
        FROM notification_jobs nj
        ${whereClause}
      `, params),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number(countResult.rows[0]?.total ?? 0),
    };
};
exports.listNotificationJobs = listNotificationJobs;
const shouldRetry = (attemptCount, maxAttempts) => attemptCount < maxAttempts;
const retryDelayMinutes = (attemptCount) => Math.max(1, attemptCount * 2);
const sendMockNotification = (job) => {
    if (job.channel === "EMAIL") {
        if (!job.user_email) {
            return { success: false, error: "Không tìm thấy email người nhận" };
        }
        return { success: true };
    }
    if (job.channel === "SMS") {
        if (!job.user_phone) {
            return { success: false, error: "Không tìm thấy số điện thoại người nhận" };
        }
        return { success: true };
    }
    return { success: true };
};
const processNotificationQueueBatch = async (limit = env_1.env.NOTIFICATION_QUEUE_BATCH_SIZE) => {
    const client = await db_1.db.connect();
    try {
        await client.query("BEGIN");
        const jobsResult = await client.query(`
        SELECT
          nj.id,
          nj.notification_id,
          nj.user_id,
          nj.channel,
          nj.status,
          nj.attempt_count,
          nj.max_attempts,
          nj.last_error,
          nj.next_retry_at::text,
          nj.processed_at::text,
          nj.created_at::text,
          nj.updated_at::text,
          u.email AS user_email,
          p.phone_number AS user_phone
        FROM notification_jobs nj
        INNER JOIN users u ON u.id = nj.user_id
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE (nj.status = 'PENDING' OR nj.status = 'FAILED')
          AND nj.attempt_count < nj.max_attempts
          AND (nj.next_retry_at IS NULL OR nj.next_retry_at <= NOW())
        ORDER BY nj.created_at ASC
        LIMIT $1
        FOR UPDATE OF nj SKIP LOCKED
      `, [limit]);
        let sent = 0;
        let failed = 0;
        let retried = 0;
        const sentIds = [];
        const retryIds = [];
        const retryErrors = [];
        const retryDelayMinutesList = [];
        const failedIds = [];
        const failedErrors = [];
        for (const job of jobsResult.rows) {
            const nextAttempt = job.attempt_count + 1;
            const sendResult = sendMockNotification(job);
            if (sendResult.success) {
                sentIds.push(job.id);
                continue;
            }
            if (shouldRetry(nextAttempt, job.max_attempts)) {
                retryIds.push(job.id);
                retryErrors.push(sendResult.error ?? "Lỗi gửi thông báo");
                retryDelayMinutesList.push(retryDelayMinutes(nextAttempt));
                continue;
            }
            failedIds.push(job.id);
            failedErrors.push(sendResult.error ?? "Lỗi gửi thông báo");
        }
        if (sentIds.length > 0) {
            await client.query(`
          UPDATE notification_jobs
          SET
            status = 'SENT',
            attempt_count = attempt_count + 1,
            last_error = NULL,
            next_retry_at = NULL,
            processed_at = NOW(),
            updated_at = NOW()
          WHERE id = ANY($1::uuid[])
        `, [sentIds]);
            sent = sentIds.length;
        }
        if (retryIds.length > 0) {
            await client.query(`
          UPDATE notification_jobs nj
          SET
            status = 'FAILED',
            attempt_count = nj.attempt_count + 1,
            last_error = src.last_error,
            next_retry_at = NOW() + (src.delay_minutes || ' minutes')::interval,
            updated_at = NOW()
          FROM (
            SELECT
              unnest($1::uuid[]) AS id,
              unnest($2::text[]) AS last_error,
              unnest($3::int[]) AS delay_minutes
          ) src
          WHERE nj.id = src.id
        `, [retryIds, retryErrors, retryDelayMinutesList]);
            retried = retryIds.length;
        }
        if (failedIds.length > 0) {
            await client.query(`
          UPDATE notification_jobs nj
          SET
            status = 'FAILED',
            attempt_count = nj.attempt_count + 1,
            last_error = src.last_error,
            next_retry_at = NULL,
            processed_at = NOW(),
            updated_at = NOW()
          FROM (
            SELECT
              unnest($1::uuid[]) AS id,
              unnest($2::text[]) AS last_error
          ) src
          WHERE nj.id = src.id
        `, [failedIds, failedErrors]);
            failed = failedIds.length;
        }
        await client.query("COMMIT");
        return {
            total: jobsResult.rows.length,
            sent,
            failed,
            retried,
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.processNotificationQueueBatch = processNotificationQueueBatch;
let workerInterval = null;
const startNotificationQueueWorker = () => {
    if (!env_1.env.NOTIFICATION_QUEUE_ENABLED || workerInterval) {
        return;
    }
    workerInterval = setInterval(() => {
        void exports.processNotificationQueueBatch().catch((error) => {
            console.error("Notification queue processing failed:", error);
        });
    }, env_1.env.NOTIFICATION_QUEUE_POLL_MS);
    workerInterval.unref();
};
exports.startNotificationQueueWorker = startNotificationQueueWorker;
const stopNotificationQueueWorker = () => {
    if (!workerInterval) {
        return;
    }
    clearInterval(workerInterval);
    workerInterval = null;
};
exports.stopNotificationQueueWorker = stopNotificationQueueWorker;
