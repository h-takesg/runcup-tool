import * as log from "https://deno.land/std/log/mod.ts";

// Logの設定
await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler("DEBUG"),
    },
    loggers: {
        default: {
            level: "DEBUG",
            handlers: ["console"],
        }
    }
});

const Logger = log.getLogger();

export {Logger};