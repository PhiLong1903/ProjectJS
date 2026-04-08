const zod = require("zod");
exports.cmsPageBodySchema = zod.z.object({
    title: zod.z.string().min(2).max(180),
    content: zod.z.record(zod.z.any()),
});
