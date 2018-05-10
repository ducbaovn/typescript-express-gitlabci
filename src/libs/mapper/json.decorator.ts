import "reflect-metadata";
import {JsonMetadata, JSON_METADATA_KEY} from "./json.metadata";

export function Json<T>(metadata?: JsonMetadata<T> | string): any {
    if (metadata instanceof String || typeof metadata === "string") {
        return Reflect.metadata(JSON_METADATA_KEY, {
            name: metadata,
            clazz: undefined,
            omitEmpty: false,
            ignore: false,
            converter: undefined,
        });
    } else {
        let metadataObj = <JsonMetadata<T>>metadata;
        return Reflect.metadata(JSON_METADATA_KEY, metadataObj);
    }
}
