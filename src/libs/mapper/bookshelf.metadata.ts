export interface BookshelfConverter<T> {
    fromBookshelf(data: any): T;
    toBookshelf(data: T): any;
}

export interface BookshelfMetadata<T> {
    name?: string;
    relation?: string;
    omitEmpty?: boolean;
    ignore?: boolean;
    clazz?: { new (): T };
    converter?: BookshelfConverter<any>;
}

export const BOOKSHELF_METADATA_KEY: string = "bookshelf_metadata";
