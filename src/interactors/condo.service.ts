/**
 * Created by davidho on 1/12/17.
 */

import * as Promise from "bluebird";
import { BaseService } from "./base.service";
import { PaymentGatewayAccountModel, CollectionWrap, CondoModel, ExceptionModel, UnitModel, BlockModel, FloorModel, CondoNameModel, LatestTransactionModel } from "../models";
import { PaymentGatewayAccountRepository, CondoRepository, UnitRepository, LatestTransactionRepository, BlockRepository, FloorRepository, CondoNameRepository } from "../data";
import { PaymentGatewayManager, UserUnitService, HousingLoanService } from "./";
import * as express from "express";
import * as Schema from "../data/sql/schema";
import { ErrorCode, HttpStatus, Logger, Utils } from "../libs/index";
import { DELETE_STATUS, ENABLE_STATUS, LATEST_TRANSACTION_TYPE, PAYMENT_GATEWAY, REPORT_KEY } from "../libs/constants";


export class CondoService extends BaseService<CondoModel, typeof CondoRepository> {
    constructor() {
        super(CondoRepository);
    }

    public search(searchParams: any, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<CondoModel>> {
        return CondoRepository.search(searchParams, offset, limit, related, filters);
    }

    public searchName(searchParams: any, offset?: number, limit?: number, related: string[] = [], filters: string[] = []): Promise<CollectionWrap<CondoNameModel>> {
        return CondoNameRepository.search(searchParams, offset, limit, related, filters);
    }

    public listBlock(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<BlockModel>> {
        return Promise.resolve()
            .then(() => {
                return BlockRepository.search(searchParams, offset, limit, related, filters);
            });
    }

    public listUnit(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UnitModel>> {
        return Promise.resolve()
            .then(() => {
                return UnitRepository.search(searchParams, offset, limit, related, filters);
            });
    }

    public unregisteredUnit(searchParams: any, offset?: number, limit?: number, related = [], filters = []): Promise<CollectionWrap<UnitModel>> {
        return Promise.resolve()
            .then(() => {
                return UnitRepository.unregisteredUnit(searchParams, offset, limit, related, filters);
            });
    }

    public verifyUnit(condoId: string, blockNumber: string, floorNumber: string, stackNumber: string): Promise<UnitModel> {
        return Promise.resolve()
            .then(() => {
                return CondoRepository.findOne(condoId);
            })
            .then((condo) => {
                if (condo === null || condo.isEnable === false) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                return UnitRepository.findUnit(condoId, blockNumber, floorNumber, stackNumber);
            });

    }

    public information(condoId: string, related: string[] = [], filters: string[] = []): Promise<CondoModel> {
        let condoModel = new CondoModel();
        return Promise.resolve()
            .then(() => {
                return CondoRepository.findOne(condoId, related, filters);
            })
            .then((condo) => {
                if (condo === null || condo.isEnable === false) {
                    return Promise.reject(new ExceptionModel(
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.CODE,
                        ErrorCode.RESOURCE.CONDO_NOT_ACTIVE.MESSAGE,
                        false,
                        HttpStatus.BAD_REQUEST,
                    ));
                }
                condoModel = condo;
                return HousingLoanService.detail();
            }).then(object => {
                if (object !== null) {
                    condoModel.housingLoan = object;
                }
                return LatestTransactionRepository.findOneByQuery(q => {
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, condoModel.id);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE, LATEST_TRANSACTION_TYPE.SALE);
                    q.orderBy(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE, "DESC");
                }, related, filters);
            }).then(object => {
                if (object !== null) {
                    object = LatestTransactionModel.showPrice([object])[0];
                    condoModel.latestTransactionSale = object.price;
                }
                return LatestTransactionRepository.findOneByQuery(q => {
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_DELETED, DELETE_STATUS.NO);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.IS_ENABLE, ENABLE_STATUS.YES);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.CONDO_ID, condoModel.id);
                    q.where(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TYPE, LATEST_TRANSACTION_TYPE.RENT);
                    q.orderBy(Schema.LATEST_TRANSACTION_TABLE_SCHEMA.FIELDS.TRANSACTION_DATE, "DESC");
                }, related, filters);
            }).then(object => {
                if (object !== null) {
                    condoModel.latestTransactionRent = `$${Utils.numberWithCommas(parseFloat(object.price))}`;
                }
                return condoModel;
            });
    }

    /**
     * admin create condo
     * @param condo
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public createCondo(condo: CondoModel): Promise<string> {
        let paymentGatewayAccount = new PaymentGatewayAccountModel();
        paymentGatewayAccount.gateway = condo.paymentGateway;
        paymentGatewayAccount.merchantId = condo.merchantId;
        paymentGatewayAccount.privateKey = condo.privateKey;
        paymentGatewayAccount.publicKey = condo.publicKey;

        return CondoRepository.findOneByQuery((q) => {
            q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(q1 => {
                q1.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.NAME, condo.name);
                q1.orWhere(Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER, condo.mcstNumber);
            });
        })
        .then(object => {
            if (object) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if (!condo.payByCash) {
                return PaymentGatewayManager.validateAccount(paymentGatewayAccount);
            }
        })
        .then(object => {
            return CondoRepository.insert(condo);
        })
        .then(condoDto => {
            if (!condo.payByCash) {
                paymentGatewayAccount.condoId = condoDto.id;
                return PaymentGatewayAccountRepository.insert(paymentGatewayAccount)
                .then(paymentGatewayAccountDto => {
                    return condoDto.id;
                });
            }
            return condoDto.id;
        });
    }

    public importCondoName(condoNames: CondoNameModel[]) {
        let totalSuccess = condoNames.length;
        let totalFail = 0;
        let failIndex = [];

        return CondoNameRepository.truncate()
        .then(() => {
            return Promise.each(condoNames, (condoName, index) => {
                return CondoNameRepository.insert(condoName)
                // handle err to continue, if not the iterator will be stop
                .catch(err => {
                    Logger.error(err);
                    totalSuccess--;
                    totalFail++;
                    failIndex.push(index + 1);
                    return 0;
                });
            });
        })
        .then(() => {
            return {
                totalSuccess: totalSuccess,
                totalFail: totalFail,
                failIndex: failIndex
            };
        });
    }

    /**
     * update condo
     * @param condo
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public update(condo: CondoModel): Promise<string> {
        let paymentGatewayAccount = new PaymentGatewayAccountModel();
        return Promise.resolve()
        .then(() => {
            if (!condo.id) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.CODE,
                    ErrorCode.RESOURCE.MISSING_REQUIRED_FIELDS.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if (condo.mcstNumber) {
                return CondoRepository.findOneByQuery((q) => {
                    q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
                    q.whereNot(Schema.CONDO_TABLE_SCHEMA.FIELDS.ID, condo.id);
                    q.where(Schema.CONDO_TABLE_SCHEMA.FIELDS.MCST_NUMBER, condo.mcstNumber);
                })
                .then(object => {
                    if (object) {
                        throw new ExceptionModel(
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                            ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                            false,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                });
            }
        })
        .then(object => {
            return CondoRepository.findOne(condo.id, ["paymentGatewayAccount"]);
        })
        .then(object => {
            if (!object) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.INVALID_PARAMETER.CODE,
                    ErrorCode.RESOURCE.INVALID_PARAMETER.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            if ((condo.publicKey && condo.publicKey !== object.publicKey) ||
                (condo.privateKey && condo.privateKey !== object.privateKey) ||
                (condo.merchantId && condo.merchantId !== object.merchantId) ||
                (condo.paymentGateway && condo.paymentGateway !== object.paymentGateway)) {
                paymentGatewayAccount.gateway = condo.paymentGateway;
                paymentGatewayAccount.privateKey = condo.privateKey;
                paymentGatewayAccount.publicKey = condo.publicKey;
                paymentGatewayAccount.merchantId = condo.merchantId;
                paymentGatewayAccount.condoId = condo.id;
                return PaymentGatewayManager.updateAccount(object.paymentGatewayAccountId, paymentGatewayAccount)
                .then(paymentGatewayAccountId => {
                    condo.paymentGatewayAccountId = paymentGatewayAccountId;
                });
            }
        })
        .then(object => {
            return CondoRepository.update(condo);
        })
        .then(condoDto => {
            return condo.id;
        });
    }

    public delete(condoId: string): Promise<string> {
        let deletePromises: any[] = [CondoRepository.deleteLogic(condoId)];
        return BlockRepository.findByQuery(q => {
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID, condoId);
        })
        .then(blocks => {
            for (let block of blocks) {
                deletePromises.push(this.deleteBlock(block.id));
            }
            return Promise.all(deletePromises);
        })
        .then(result => {
            return condoId;
        });
    }

    /**
     * admin create block
     * @param block
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public createBlock(block: BlockModel): Promise<string> {
        return BlockRepository.findOneByQuery((q) => {
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER, block.blockNumber);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID, block.condoId);
        })
        .then(object => {
            if (object) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return BlockRepository.insert(block);
        })
        .then(blockDto => {
            return block.id;
        });
    }

    /**
     * admin import block
     * @param block
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public findOrCreateBlock(block: BlockModel): Promise<BlockModel> {
        return BlockRepository.findOneByQuery((q) => {
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.BLOCK_NUMBER, block.blockNumber);
            q.where(Schema.BLOCK_TABLE_SCHEMA.FIELDS.CONDO_ID, block.condoId);
        })
        .then(object => {
            if (object) {
                return object;
            }
            return BlockRepository.insert(block)
            .then(blockDto => {
                return BlockModel.fromDto(blockDto);
            });
        });
    }

    /**
     * admin update block
     * @param block
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public updateBlock(block: BlockModel): Promise<string> {
        return BlockRepository.update(block)
        .then(blockDto => {
            return block.id;
        });
    }

    /**
     * admin delete block
     * @param blockId
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public deleteBlock(blockId: string): Promise<string> {
        return FloorRepository.findByQuery(q => {
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID, blockId);
        })
        .then(floors => {
            return Promise.each(floors, floor => {
                return this.deleteFloor(floor.id);
            });
        })
        .then(result => {
            return BlockRepository.deleteLogic(blockId);
        })
        .then(result => {
            return blockId;
        });
    }

    /**
     * admin create floor
     * @param floor
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public createFloor(floor: FloorModel): Promise<string> {
        return FloorRepository.findOneByQuery((q) => {
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER, floor.floorNumber);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID, floor.blockId);
        })
        .then(object => {
            if (object) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return FloorRepository.insert(floor);
        })
        .then(floorDto => {
            return floor.id;
        });
    }

    /**
     * admin import floor
     * @param floor
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public findOrCreateFloor(floor: FloorModel): Promise<FloorModel> {
        return FloorRepository.findOneByQuery((q) => {
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.FLOOR_NUMBER, floor.floorNumber);
            q.where(Schema.FLOOR_TABLE_SCHEMA.FIELDS.BLOCK_ID, floor.blockId);
        })
        .then(object => {
            if (object) {
                object.block = floor.block;
                return object;
            }
            return FloorRepository.insert(floor)
            .then(floorDto => {
                let result = FloorModel.fromDto(floorDto);
                result.block = floor.block;
                return result;
            });
        });
    }

    /**
     * admin update floor
     * @param floor
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public updateFloor(floor: FloorModel): Promise<string> {
        return FloorRepository.update(floor)
        .then(floorDto => {
            return floor.id;
        });
    }

    /**
     * admin delete floor
     * @param floorId
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public deleteFloor(floorId: string): Promise<string> {
        return this.deleteUnitsByFloor(floorId)
        .then(result => {
            return FloorRepository.deleteLogic(floorId);
        })
        .then(result => {
            return floorId;
        });
    }

    /**
     * admin create unit
     * @param unit
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public createUnit(unit: UnitModel): Promise<string> {
        return UnitRepository.findOneByQuery((q) => {
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER, unit.unitNumber);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER, unit.stackNumber);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID, unit.floorId);
        })
        .then(object => {
            if (object) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.CODE,
                    ErrorCode.RESOURCE.DUPLICATE_RESOURCE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return UnitRepository.insert(unit);
        })
        .then(unitDto => {
            return unit.id;
        });
    }

    /**
     * admin import unit
     * @param unit
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public findOrCreateUnit(unit: UnitModel): Promise<UnitModel> {
        return UnitRepository.findOneByQuery((q) => {
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.UNIT_NUMBER, unit.unitNumber);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.STACK_NUMBER, unit.stackNumber);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID, unit.floorId);
        })
        .then(object => {
            if (object) {
                return object;
            }
            return UnitRepository.insert(unit)
            .then(unitDto => {
                return UnitModel.fromDto(unitDto);
            });
        });
    }

    /**
     * admin update unit
     * @param unit
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public updateUnit(unit: UnitModel): Promise<string> {
        return UnitRepository.update(unit)
        .then(unitDto => {
            return unit.id;
        });
    }

    /**
     * admin delete unit
     * @param unitId
     * @param related
     * @param filters
     * @returns {Promise<string>}
     */
    public deleteUnit(unitId: string): Promise<string> {
        let searchParams = {
            unitId: unitId
        };
        return UserUnitService.searchUserUnit(searchParams)
        .then(result => {
            if (result.total > 0) {
                throw new ExceptionModel(
                    ErrorCode.RESOURCE.UNIT_IN_USE.CODE,
                    ErrorCode.RESOURCE.UNIT_IN_USE.MESSAGE,
                    false,
                    HttpStatus.BAD_REQUEST
                );
            }
            return UnitRepository.deleteLogic(unitId);
        })
        .then(unitDto => {
            return unitId;
        });
    }

    public deleteUnitsByFloor(floorId: string): Promise<any> {
        let query = (q): void => {
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_DELETED, false);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.IS_ENABLE, true);
            q.where(Schema.UNIT_TABLE_SCHEMA.FIELDS.FLOOR_ID, floorId);
        };
        return UnitRepository.findByQuery(query)
        .then(units => {
            return Promise.each(units, unit => {
                return this.deleteUnit(unit.id);
            });
        });
    }

    public reportUnit(condoId: string): Promise<any> {
        let unregisteredUnit;

        return UnitRepository.countUnregisteredUnit(condoId)
        .then(countUnregistered => {
            unregisteredUnit = countUnregistered;
            return UnitRepository.countTotalUnit(condoId);
        })
        .then(total => {
            return [
                {
                    key: REPORT_KEY.REGISTERED_UNIT,
                    value: total - unregisteredUnit
                },
                {
                    key: REPORT_KEY.UNREGISTERED_UNIT,
                    value: unregisteredUnit
                }
            ];
        });
    }
}

export default CondoService;
