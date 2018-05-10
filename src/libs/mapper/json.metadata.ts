export interface JsonConverter<T> {
    fromJson(data: any): T;
    toJson(data: T): any;
}

export interface JsonMetadata<T> {
    name?: string;
    omitEmpty?: boolean;
    ignore?: boolean;
    clazz?: { new (): T };
    converter?: JsonConverter<any>;
}

export const JSON_METADATA_KEY: string = "json_metadata";
