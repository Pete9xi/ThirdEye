type RawText = {
    text: string;
};

type ChatPacket = {
    type: "chat";
    needs_translation: boolean;
    source_name: undefined | string;
    message: string;
    parameters: undefined | any;
    xuid: string;
    platform_chat_id: string;
};

type WhisperPacket = {
    type: "json_whisper";
    needs_translation: boolean;
    source_name: undefined | string;
    message: string;
    parameters: undefined | any;
    xuid: string;
    platform_chat_id: string;
};

type WhisperMessage = {
    rawtext: RawText[];
};

type ParsedWhisperPacket = WhisperPacket & WhisperMessage;
