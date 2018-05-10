import "reflect-metadata";
import { BookshelfMetadata, BOOKSHELF_METADATA_KEY } from "./bookshelf.metadata";

export function Bookshelf<T>(metadata?: BookshelfMetadata<T> | string): any {
    if (metadata instanceof String || typeof metadata === "string") {
        return Reflect.metadata(BOOKSHELF_METADATA_KEY, {
            name: metadata,
            relation: undefined,
            clazz: undefined,
            ignore: false,
            omitEmpty: false,
            converter: undefined,
        });
    } else {
        let metadataObj = <BookshelfMetadata<T>>metadata;
        return Reflect.metadata(BOOKSHELF_METADATA_KEY, metadataObj);
    }
}
