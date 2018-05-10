/**
 * Created by davidho on 1/12/17.
 */


import * as express from "express";
import * as Promise from "bluebird";
import { PROPERTIES, ROLE } from "../../../../libs/constants";
import { HttpStatus, ErrorCode, Utils, Logger } from "../../../../libs";
import { CondoService } from "../../../../interactors";
import { CondoNameRepository } from "../../../../data";
import { CondoModel, ExceptionModel, StateModel, SessionModel, BlockModel, FloorModel, UnitModel, CondoNameModel } from "../../../../models";
import * as Schema from "../../../../data/sql/schema";
import * as parser from "csv-parse";
import * as _ from "lodash";
import * as uuid from "uuid";

export class CondoHandler {

    public static list(req: express.Request, res: express.Response, next: express.NextFunction) {

        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        let related = [];
        if (req.query.related) {
            related = req.query.related.split(",");
        }
        let total = 0;

        CondoService.search(queryParams, offset, limit, related, ["isDeleted"])
        .then(condos => {
            res.header(PROPERTIES.HEADER_TOTAL, condos.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(condos.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static listName(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;

        CondoService.searchName(queryParams, offset, limit, [], ["isDeleted", "isEnable"])
        .then(condos => {
            res.header(PROPERTIES.HEADER_TOTAL, condos.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(condos.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static verifyName(req: express.Request, res: express.Response, next: express.NextFunction) {
        let queryParams = req.query || null;
        queryParams.isEnable = true;

        CondoService.search(queryParams, null, null, [], ["isDeleted", "isEnable"])
        .then(result => {
            let condo = result.data[0];
            if (!condo) {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                    ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                ));
            }
            res.status(HttpStatus.OK);
            res.json(condo);
        })
        .catch(err => {
            next(err);
        });
    }

    public static listBlock(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        let total = 0;

        CondoService.listBlock(queryParams, offset, limit, ["floors", "floors.units"], ["isEnable", "isDeleted", "createdDate", "updatedDate"])
        .then(blocks => {
            res.header(PROPERTIES.HEADER_TOTAL, blocks.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);

            res.json(blocks.data);
        })
        .catch(err => {
            next(err);
        });
    }

    public static listUnit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        let total = 0;

        CondoService.listUnit(queryParams, offset, limit, [], ["isEnable", "isDeleted", "createdDate", "updatedDate"])
        .then(units => {
            if (!queryParams.unitId) {
                res.header(PROPERTIES.HEADER_TOTAL, units.total.toString(10));
                if (offset != null) {
                    res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
                }
                if (limit != null) {
                    res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
                }
                res.status(HttpStatus.OK);
                res.json(units.data);
            } else {
                res.status(HttpStatus.OK);
                res.json(units.data[0]);
            }
        })
        .catch(err => {
            next(err);
        });
    }

    public static verifyUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let condoId = req.body.condoId || "";
            let blockNumber = req.body.blockNumber || "";
            let floorNumber = req.body.floorNumber || "";
            let stackNumber = req.body.stackNumber || "";

            if (condoId === "" || blockNumber === "" || floorNumber === "" || stackNumber === "") {
                return next(new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            }
            return Promise.resolve()
                .then(() => {
                    return CondoService.verifyUnit(condoId, blockNumber, floorNumber, stackNumber);
                })
                .then((object) => {
                    if (object) {
                        res.status(HttpStatus.OK);
                        res.json(StateModel.stateSuccessful(object.id, "", undefined));
                    } else {
                        return next(new ExceptionModel(
                            ErrorCode.RESOURCE.UNIT_INVALID.CODE,
                            ErrorCode.RESOURCE.UNIT_INVALID.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST,
                        ));

                    }

                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static detail(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return CondoService.findOne(req.body.id, [], ["isDeleted"])
        .then(object => {
            res.status(HttpStatus.OK);
            res.json(object);
        })
        .catch(err => {
            next(err);
        });
    }

    public static information(req: express.Request, res: express.Response, next: express.NextFunction): any {
        try {
            let session = res.locals.session || SessionModel.empty();

            if (session.roleId !== ROLE.SYSTEM_ADMIN && session.roleId !== ROLE.OWNER && session.roleId !== ROLE.TENANT ) {
                return next(new ExceptionModel(
                    ErrorCode.PRIVILEGE.NOT_ALLOW.CODE,
                    ErrorCode.PRIVILEGE.NOT_ALLOW.MESSAGE,
                    false,
                    HttpStatus.FORBIDDEN,
                ));
            }

            return CondoService.information(req.params.id, [], ["isDeleted"])
                .then(object => {
                    res.status(HttpStatus.OK);
                    res.json(object);
                })
                .catch(err => {
                    next(err);
                });
        } catch (err) {
            next(err);
        }
    }

    public static create(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let condo = CondoModel.fromRequest(req);
        if (!condo.name || !condo.imageUrl) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        return CondoNameRepository.findOneByQuery(q => {
            q.where(Schema.CONDO_NAME_TABLE_SCHEMA.FIELDS.NAME, condo.name);
        })
        .then(condoName => {
            if (!condoName) {
                next(new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_CONDO_NAME.CODE,
                    ErrorCode.RESOURCE.INVALID_CONDO_NAME.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST,
                ));
            } else {
                return CondoService.createCondo(condo);
            }
        })
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.createSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static edit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let condo = CondoModel.fromRequest(req);
        return CondoService.update(condo)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static delete(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!req.body.id) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return CondoService.delete(req.body.id)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static createBlock(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!(req.body.data instanceof Array)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        };
        let blocks = BlockModel.fromBulkRequest(req);
        let totalSuccess = blocks.length;
        let totalFail = 0;
        let failIndex = [];

        Promise.each(blocks, (block, index) => {
            return CondoService.createBlock(block)
            // handle err to continue, if not the iterator will be stop
            .catch(err => {
                totalSuccess--;
                totalFail++;
                failIndex.push(index);
                return 0;
            });
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.bulkCreate(totalSuccess, totalFail, failIndex));
        })
        .catch(err => {
            next(err);
        });
    }

    public static editBlock(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let block = BlockModel.fromRequest(req);
        return CondoService.updateBlock(block)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteBlock(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!req.body.blockId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return CondoService.deleteBlock(req.body.blockId)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static createFloor(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!(req.body.data instanceof Array)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        let floors = FloorModel.fromBulkRequest(req);
        let totalSuccess = floors.length;
        let totalFail = 0;
        let failIndex = [];

        Promise.each(floors, (floor, index) => {
            return CondoService.createFloor(floor)
            // handle err to continue, if not the iterator will be stop
            .catch(err => {
                totalSuccess--;
                totalFail++;
                failIndex.push(index);
                return 0;
            });
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.bulkCreate(totalSuccess, totalFail, failIndex));
        })
        .catch(err => {
            next(err);
        });
    }

    public static editFloor(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let floor = FloorModel.fromRequest(req);
        return CondoService.updateFloor(floor)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteFloor(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!req.body.floorId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return CondoService.deleteFloor(req.body.floorId)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static createUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!(req.body.data instanceof Array)) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST,
            ));
        }
        let units = UnitModel.fromBulkRequest(req);
        let totalSuccess = units.length;
        let totalFail = 0;
        let failIndex = [];

        Promise.each(units, (unit, index) => {
            return CondoService.createUnit(unit)
            // handle err to continue, if not the iterator will be stop
            .catch(err => {
                totalSuccess--;
                totalFail++;
                failIndex.push(index);
                return 0;
            });
        })
        .then(result => {
            res.status(HttpStatus.OK);
            res.json(StateModel.bulkCreate(totalSuccess, totalFail, failIndex));
        })
        .catch(err => {
            next(err);
        });
    }

    public static editUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        let unit = UnitModel.fromRequest(req);
        return CondoService.updateUnit(unit)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.updateSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static deleteUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        if (!req.body.unitId) {
            return next(new ExceptionModel(
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                false,
                HttpStatus.BAD_REQUEST
            ));
        }

        return CondoService.deleteUnit(req.body.unitId)
        .then(id => {
            res.status(HttpStatus.OK);
            res.json(StateModel.deleteSuccessful(id));
        })
        .catch(err => {
            next(err);
        });
    }

    public static importCondoName(req: express.Request, res: express.Response, next: express.NextFunction): any {
        parser(req.body, {
            delimiter: ","
        }, (err, data) => {
            if (err) {
                return next(err);
            }
            // data.shift(); // remove header at first line
            let condoNames = CondoNameModel.fromCsvArray(data);
            return CondoService.importCondoName(condoNames)
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(StateModel.bulkCreate(result.totalSuccess, result.totalFail, result.failIndex));
            })
            .catch(err => {
                next(err);
            });
        });
    }

    public static importBlockFloorUnit(req: express.Request, res: express.Response, next: express.NextFunction): any {
        parser(req.body, {
            delimiter: ","
        }, (err, data) => {
            if (err) {
                return next(err);
            }
            data.shift(); // remove header at first line
            data = _.groupBy(data, (o => { return o[0]; }));
            let blocks = [];
            let floors = [];
            let units = [];
            for (let blockNumber in data) {
                let block = new BlockModel();
                block.id = uuid.v4();
                block.blockNumber = blockNumber;
                block.condoId = req.params.condoId;
                blocks.push(block);
                data[blockNumber] = _.groupBy(data[blockNumber], (o => { return o[1]; }));
                for (let floorNumber in data[blockNumber]) {
                    let floor = new FloorModel();
                    floor.id = uuid.v4();
                    floor.floorNumber = floorNumber;
                    floor.block = block;
                    floors.push(floor);
                    for (let item of data[blockNumber][floorNumber]) {
                        let unit = new UnitModel();
                        unit.id = uuid.v4();
                        unit.stackNumber = item[2];
                        unit.unitNumber = `${blockNumber}${floorNumber}${item[2]}`;
                        unit.floor = floor;
                        units.push(unit);
                    }
                }
            }
            let totalSuccess = units.length;
            let totalFail = 0;
            Promise.mapSeries(blocks, (block, index) => {
                return CondoService.findOrCreateBlock(block)
                // handle err to continue, if not the iterator will be stop
                .catch(err => {
                    return new BlockModel();
                });
            })
            .then(result => {
                return Promise.mapSeries(floors, (floor, index) => {
                    for (let blockModel of result) {
                        if (floor.block.blockNumber === blockModel.blockNumber) {
                            floor.blockId = blockModel.id;
                            break;
                        }
                    }
                    return CondoService.findOrCreateFloor(floor)
                    // handle err to continue, if not the iterator will be stop
                    .catch(err => {
                        return new FloorModel();
                    });
                });
            })
            .then(result => {
                return Promise.each(units, (unit, index) => {
                    for (let floorModel of result) {
                        if (unit.floor.floorNumber === floorModel.floorNumber && unit.floor.block.blockNumber === floorModel.block.blockNumber) {
                            unit.floorId = floorModel.id;
                            break;
                        }
                    }
                    return CondoService.createUnit(unit)
                    // handle err to continue, if not the iterator will be stop
                    .catch(err => {
                        Logger.error(err);
                        totalSuccess--;
                        totalFail++;
                        return 0;
                    });
                });
            })
            .then(result => {
                res.status(HttpStatus.OK);
                res.json(StateModel.bulkCreate(totalSuccess, totalFail));
            })
            .catch(err => {
                next(err);
            });
        });
    }

    public static unregisteredUnit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let offset = parseInt(req.query.offset, 10) || null;
        let limit = parseInt(req.query.limit, 10) || null;
        let queryParams = req.query || null;
        let total = 0;

        CondoService.unregisteredUnit(queryParams, offset, limit, ["floor.block"], ["isEnable", "isDeleted", "createdDate", "updatedDate"])
        .then(units => {
            res.header(PROPERTIES.HEADER_TOTAL, units.total.toString(10));

            if (offset != null) {
                res.header(PROPERTIES.HEADER_OFFSET, offset.toString(10));
            }
            if (limit != null) {
                res.header(PROPERTIES.HEADER_LIMIT, limit.toString(10));
            }

            res.status(HttpStatus.OK);
            res.json(units.data);
        })
        .catch(err => {
            next(err);
        });
    }
}
export default CondoHandler;

