interface Serializable {
    toJSON(): Record<string, unknown>;
}

export type {Serializable};
