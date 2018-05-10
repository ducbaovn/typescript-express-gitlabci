export class Utils {
  public static isType(val: any, type: "object" | "string"): boolean {
        return typeof val === type;
    }
    public static isPrimitive(obj: any): boolean {
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean":
                return true;
        }
        return !!(obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean);
    }

    public static isArray(object: any): boolean {
        if (object === Array) {
            return true;
        } else if (typeof Array.isArray === "function") {
            return Array.isArray(object);
        }
        else {
            return !!(object instanceof Array);
        }
    }
}
