import { readFile, writeFile } from "node:fs/promises";

const packageRoot = "node_modules/traq-bot-ts";

const patches = [
    {
        path: `${packageRoot}/dist/import/index.mjs`,
        before: "this.ws?.ping({},void 0,",
        after: "this.ws?.ping(Buffer.alloc(0),void 0,",
    },
    {
        path: `${packageRoot}/dist/require/index.cjs`,
        before: "this.ws?.ping({},void 0,",
        after: "this.ws?.ping(Buffer.alloc(0),void 0,",
    },
    {
        path: `${packageRoot}/src/index.mts`,
        before: "this.ws?.ping({}, undefined,",
        after: "this.ws?.ping(Buffer.alloc(0), undefined,",
    },
];

for (const patch of patches) {
    const source = await readFile(patch.path, "utf8");

    if (source.includes(patch.after)) {
        continue;
    }
    if (!source.includes(patch.before)) {
        throw new Error(`Expected PING implementation was not found in ${patch.path}`);
    }

    await writeFile(patch.path, source.replace(patch.before, patch.after));
}

console.log("Patched traq-bot-ts WebSocket PING payload.");
