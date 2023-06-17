type Gamemode = "fallback" | "survival";

type Coordinate = {
    x: number;
    y: number;
    z: number;
};

type Rotation = {
    x: number;
    z: number;
};

type Gamerule = {
    name: string;
    editable: boolean;
    type: "bool" | "int";
    value: boolean | number;
};

type ItemState = {
    name: string;
    runtime_id: number;
    component_based: boolean;
};

type Experiment = {
    name: string;
    enabled: boolean;
};

type EduResourceUri = {
    button_name: string;
    link_uri: string;
};

type Packet = {
    entity_id: bigint;
    runtime_entity_id: bigint;
    player_gamemode: Gamemode;
    player_position: Coordinate;
    rotation: Rotation;
    seed: bigint;
    biome_type: number;
    biome_name: string;
    dimension: string;
    generator: number;
    world_gamemode: Gamemode;
    difficulty: number;
    spawn_position: Coordinate;
    achievements_disabled: boolean;
    editor_world: boolean;
    created_in_editor: boolean;
    exported_from_editor: boolean;
    day_cycle_stop_time: number;
    edu_offer: number;
    edu_features_enabled: boolean;
    edu_product_uuid: string;
    rain_level: number;
    lightning_level: number;
    has_confirmed_platform_locked_content: boolean;
    is_multiplayer: boolean;
    broadcast_to_lan: boolean;
    xbox_live_broadcast_mode: number;
    platform_broadcast_mode: number;
    enable_commands: boolean;
    is_texturepacks_required: boolean;
    gamerules: Gamerule[];
    experiments: Experiment[];
    experiments_previously_used: boolean;
    bonus_chest: boolean;
    map_enabled: boolean;
    permission_level: string;
    server_chunk_tick_range: number;
    has_locked_behavior_pack: boolean;
    has_locked_resource_pack: boolean;
    is_from_locked_world_template: boolean;
    msa_gamertags_only: boolean;
    is_from_world_template: boolean;
    is_world_template_option_locked: boolean;
    only_spawn_v1_villagers: boolean;
    persona_disabled: boolean;
    custom_skins_disabled: boolean;
    emote_chat_muted: boolean;
    game_version: string;
    limited_world_width: number;
    limited_world_length: number;
    is_new_nether: boolean;
    edu_resource_uri: EduResourceUri;
    experimental_gameplay_override: boolean;
    chat_restriction_level: string;
    disable_player_interactions: boolean;
    level_id: string;
    world_name: string;
    premium_world_template_id: string;
    is_trial: boolean;
    movement_authority: string;
    rewind_history_size: number;
    server_authoritative_block_breaking: boolean;
    current_tick: bigint;
    enchantment_seed: number;
    block_properties: any[]; // You can replace `any` with the appropriate type
    itemstates: ItemState[];
};
