// Azure Functions v4 entry point
// Each import triggers function registration via app.http() / app.timer()

import './functions/provisioningSaga/index.js';
import './functions/proxy/index.js';
import './functions/timerFullSpec/index.js';
import './functions/signalr/index.js';
