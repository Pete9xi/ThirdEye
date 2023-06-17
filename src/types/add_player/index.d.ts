type Position = {
    x: number;
    y: number;
    z: number;
};

type Velocity = {
    x: number;
    y: number;
    z: number;
};

type Extra = {
    has_nbt: number;
    nbt: undefined;
    can_place_on: any[];
    can_destroy: any[];
};

type HeldItem = {
    network_id: number;
    count: number;
    metadata: number;
    has_stack_id: number;
    stack_id: undefined;
    block_runtime_id: number;
    extra: Extra;
};

type Metadata = {
    key: string | number;
    type: string;
    value: any;
};

type Abilities = {
    type: string;
    allowed: any;
    enabled: any;
    fly_speed: number;
    walk_speed: number;
};

type PlayerData = {
    uuid: string;
    username: string;
    runtime_id: bigint;
    platform_chat_id: string;
    position: Position;
    velocity: Velocity;
    pitch: number;
    yaw: number;
    head_yaw: number;
    held_item: HeldItem;
    gamemode: string;
    metadata: Metadata[];
    properties: { ints: number[]; floats: number[] };
    unique_id: bigint;
    permission_level: string;
    command_permission: string;
    abilities: Abilities[];
    links: any[];
    device_id: string;
    device_os: string;
};
