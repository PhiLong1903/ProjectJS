const zod_1 = require("zod");
exports.cmsPageBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(180),
    content: zod_1.z.record(zod_1.z.any()),
});
