import { createCommand } from "commander"
import { setupOptions } from "./options"
import { setupAction } from "./action";

export const watchCommand = createCommand("watch")
setupOptions(watchCommand);
setupAction(watchCommand);
