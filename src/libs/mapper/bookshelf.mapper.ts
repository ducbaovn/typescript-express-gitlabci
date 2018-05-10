import "reflect-metadata";
import { BookshelfConverter, BookshelfMetadata, BOOKSHELF_METADATA_KEY } from "./bookshelf.metadata";
import { Utils } from "./utils";

export class BookshelfMapper {
    private static getClazz(target: any, propertyKey: string): any {
        return Reflect.getMetadata("design:type", target, propertyKey);
    }

    private static getBookshelfProperty<T>(target: any, propertyKey: string): BookshelfMetadata<T> {
        return Reflect.getMetadata(BOOKSHELF_METADATA_KEY, target, propertyKey);
    }

    private static serializeProperty(metadata: BookshelfMetadata<any>, prop: any): any {

        if (!metadata || metadata.ignore === true) {
            return;
        }

        if (prop == null) {
            return;
        }

        if (metadata.converter) {
            return metadata.converter.toBookshelf(prop);
        }

        if (Utils.isArray(prop)) {
            return prop.map((propItem: any) => BookshelfMapper.serialize(propItem));
        }

        return BookshelfMapper.serialize(prop);
    }

    static serialize(instance: any): any {
        if (!Utils.isType(instance, "object") || Utils.isArray(instance)) {
            return instance;
        }

        let obj: any = {};
        Object.keys(instance).forEach((key: string) => {
            let metadata = BookshelfMapper.getBookshelfProperty(instance, key);
            if (metadata != null && metadata.name != null) {
                obj[metadata.name] = BookshelfMapper.serializeProperty(metadata, instance[key]);
            }
        });
        return obj;
    }

    static deserialize<T>(clazz: { new (): T }, bookshelfModel: any): T {
        if ((clazz == null) || (bookshelfModel == null) || (bookshelfModel.get == null)) {
            return undefined;
        }

        let obj = new clazz();
        Object.keys(obj).forEach((key) => {
            let metadata = BookshelfMapper.getBookshelfProperty(obj, key);
            if (metadata != null) {
                let clazz = BookshelfMapper.getClazz(obj, key);
                if (metadata.name != null) {
                    let propertyName = metadata.name || key;
                    let val = bookshelfModel.get(propertyName);
                    if (metadata.converter != null) {
                        obj[key] = metadata.converter.fromBookshelf(val);
                    } else {
                        obj[key] = val;
                    }
                }
                else if (metadata.relation != null) {
                    if (Utils.isArray(clazz)) {
                        let relation = bookshelfModel.related(metadata.relation);
                        let arr = [];
                        relation.models.forEach(model => {
                            arr.push(BookshelfMapper.deserialize(metadata.clazz, model));
                        });
                        obj[key] = arr;
                    } else {
                        let dto = bookshelfModel.related(metadata.relation);
                        if (dto.get(dto.idAttribute) != null) {
                            obj[key] = BookshelfMapper.deserialize(clazz, dto);
                        }
                    }
                }
            }
        });
        return obj;
    }
}
