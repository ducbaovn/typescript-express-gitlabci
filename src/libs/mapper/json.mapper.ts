import "reflect-metadata";
import { JsonConverter, JsonMetadata, JSON_METADATA_KEY } from "./json.metadata";
import { Utils } from "./utils";

export class JsonMapper {
    private static getClazz(target: any, propertyKey: string): any {
        return Reflect.getMetadata("design:type", target, propertyKey);
    }

    private static getJsonProperty<T>(target: any, propertyKey: string): JsonMetadata<T> {
        return Reflect.getMetadata(JSON_METADATA_KEY, target, propertyKey);
    }

    private static serializeProperty(metadata: JsonMetadata<any>, prop: any): any {

        if (!metadata || metadata.ignore === true) {
            return;
        }

        if (metadata.converter) {
            return metadata.converter.toJson(prop);
        }

        if (!metadata.clazz) {
            if (metadata.omitEmpty) {
                if (Utils.isArray(prop) && prop.length === 0) {
                    return;
                } else if (Utils.isType(prop, "string") && prop === "") {
                    return;
                } else if (Utils.isType(prop, "object") && prop == null) {
                    return;
                }
            }
            return prop;
        }

        if (Utils.isArray(prop)) {
            return prop.map((propItem: any) => JsonMapper.serialize(propItem));
        }

        return JsonMapper.serialize(prop);
    }

    static serialize(instance: any): any {
        if (!Utils.isType(instance, "object") || Utils.isArray(instance)) {
            return instance;
        }

        let obj: any = {};
        Object.keys(instance).forEach((key: string) => {
            let metadata = JsonMapper.getJsonProperty(instance, key);
            if (metadata != null && metadata.name != null) {
                obj[metadata.name] = JsonMapper.serializeProperty(metadata, instance[key]);
            }
        });
        return obj;
    }

    static deserialize<T>(clazz: { new (): T }, jsonObject): T {
        if (clazz == null || jsonObject == null) {
            return;
        }

        if (Utils.isPrimitive(clazz)) {
            return jsonObject;
        }

        let obj = new clazz();
        Object.keys(obj).forEach((key) => {
            let metadata = JsonMapper.getJsonProperty(obj, key);
            let clazz = JsonMapper.getClazz(obj, key);

            if (metadata != null && metadata.name != null) {
                let innerJson = jsonObject[metadata.name];
                if (Utils.isArray(clazz)) {
                    if (innerJson != null && Utils.isArray(innerJson)) {
                        if (metadata.clazz != null && !Utils.isPrimitive(metadata.clazz)) {
                            obj[key] = innerJson
                                .map((item) => JsonMapper.deserialize(metadata.clazz, item))
                                .filter(item => item != null);
                        } else if (metadata.converter != null) {
                            obj[key] = innerJson
                                .map((item) => metadata.converter.fromJson(item))
                                .filter(item => item != null);
                        } else {
                            obj[key] = innerJson
                                .filter(item => item != null);
                        }
                    } else {
                        obj[key] = [];
                    }
                } else if (innerJson != null && !Utils.isArray(innerJson)) {
                    if (metadata.converter != null) {
                        obj[key] = metadata.converter.fromJson(innerJson);
                    } else if (!Utils.isPrimitive(clazz)) {
                        obj[key] = JsonMapper.deserialize(clazz, innerJson);
                    } else {
                        obj[key] = innerJson;
                    }
                }
            }
        });
        return obj;
    }
}
