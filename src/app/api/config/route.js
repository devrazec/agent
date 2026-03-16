export const runtime = 'nodejs';

export async function startSession(clientId, frontendConfig, ws) {
    try {
        const endpoint = process.env.AZURE_VOICELIVE_ENDPOINT;
        if (!endpoint) throw new Error("Missing AZURE_VOICELIVE_ENDPOINT");

        const credential = getCredential();
        const send = sendToClient(ws, clientId);

        // Build typed session config — frontend values override .env defaults
        const config = {
            mode: process.env.VOICELIVE_MODE || "model",
            model: process.env.VOICELIVE_MODEL || "gpt-realtime",
            voice:
                process.env.VOICELIVE_VOICE ||
                "en-US-Ava:DragonHDLatestNeural",
            voiceType:
                process.env.VOICELIVE_VOICE_TYPE ||
                "azure-standard",
            transcribeModel:
                process.env.VOICELIVE_TRANSCRIBE_MODEL ||
                "gpt-4o-transcribe",
            inputLanguage: process.env.VOICELIVE_INPUT_LANGUAGE || "",
            instructions:
                process.env.VOICELIVE_INSTRUCTIONS ||
                "",
            temperature: parseFloat(
                process.env.VOICELIVE_TEMPERATURE ??
                "0.8"
            ),
            vadType:
                process.env.VOICELIVE_VAD_TYPE ||
                "azure_semantic",
            noiseReduction: process.env.VOICELIVE_NOISE_REDUCTION ?? true,
            echoCancellation: process.env.VOICELIVE_ECHO_CANCELLATION ?? true,
            agentName:
                process.env.AZURE_VOICELIVE_AGENT_NAME || "",
            projectName:
                process.env.AZURE_VOICELIVE_PROJECT || "",
            agentVersion:
                process.env.AZURE_VOICELIVE_AGENT_VERSION ||
                "",
            conversationId: process.env.AZURE_VOICELIVE_CONVERSATION_ID || "",
            foundryResourceOverride:
                process.env.AZURE_VOICELIVE_FOUNDRY_RESOURCE_OVERRIDE ||
                "",
            authIdentityClientId:
                frontendConfig.auth_identity_client_id ||
                process.env.AZURE_VOICELIVE_AUTH_IDENTITY_CLIENT_ID ||
                "",
            proactiveGreeting: frontendConfig.proactive_greeting ?? true,
            greetingType: frontendConfig.greeting_type || "llm",
            greetingText: frontendConfig.greeting_text || "",
            interimResponse: frontendConfig.interim_response ?? false,
            interimResponseType: frontendConfig.interim_response_type || "llm",
            interimTriggerTool: frontendConfig.interim_trigger_tool ?? true,
            interimTriggerLatency: frontendConfig.interim_trigger_latency ?? true,
            interimLatencyMs: frontendConfig.interim_latency_ms ?? 100,
            interimInstructions: frontendConfig.interim_instructions || "",
            interimStaticTexts: frontendConfig.interim_static_texts || "",
        };
    }
    catch (error) {
        console.error("Error starting session:", error);
        ws.send(JSON.stringify({ type: "error", message: error.message }));
    }
}

function getCredential() {
    const { DefaultAzureCredential } = require("@azure/identity");
    return new DefaultAzureCredential();
}

function sendToClient(ws, clientId) {
    return (message) => {
        ws.send(JSON.stringify({ clientId, ...message }));
    };
}