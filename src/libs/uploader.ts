/**
 * Created by kiettv on 7/31/16.
 */
import {StorageOption} from "./config";
import * as aws from "aws-sdk";
import {S3, Credentials} from "aws-sdk";
import * as Upload from "s3-uploader";
import Meta = Upload.Meta;
import image = Upload.image;
import * as fs from "fs";
import * as Promise from "bluebird";

export class Uploader {
    private s3Client: S3;
    private bucketName: string;


    constructor(opts: StorageOption) {
        // Default setting;
        opts.opts = opts.opts || {};
        opts.awsBucketName = opts.awsBucketName ? opts.awsBucketName : "";
        opts.opts.aws = opts.opts.aws || {};

        aws.config.region = opts.opts.aws.region ? opts.opts.aws.region : "us-west-2";

        opts.opts.aws.accessKeyId = opts.opts.aws.accessKeyId ? opts.opts.aws.accessKeyId : "";
        opts.opts.aws.secretAccessKey = opts.opts.aws.secretAccessKey ? opts.opts.aws.secretAccessKey : "";

        aws.config.update({
            credentials: new Credentials(opts.opts.aws.accessKeyId, opts.opts.aws.secretAccessKey),
        });
        this.s3Client = new aws.S3({
            params: {
                Bucket: opts.awsBucketName,
                ACL: opts.opts.aws.acl ? opts.opts.aws.acl : "public-read",
            },
        });
        this.bucketName = opts.awsBucketName;
    }

    public uploadFile(path: string, name: string): Promise<any> {
        let body = fs.createReadStream(path);
        // fs.createReadStream(path).pipe(zlib.createGzip());
        let params = {
            ACL: "public-read",
            Bucket: this.bucketName,
            Key: `${name}`,
            Body: body,
        };
        return new Promise((resolve, reject) => {
            return this.s3Client.upload(params)
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

}

export default Uploader;
