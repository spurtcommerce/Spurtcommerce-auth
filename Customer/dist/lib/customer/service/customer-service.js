"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerListByQueryBuilder = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const customerListByQueryBuilder = (_connection, limit, offset, select = [], whereConditions = [], searchConditions = [], relations = [], groupBy = [], sort = [], count = false, rawQuery = false) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const query = yield _connection.getRepository('Customer').createQueryBuilder();
    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb) => {
            // query.innerJoin(joinTb.tableName, joinTb.aliasName);
            if (joinTb.op === 'left') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            }
            else {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
            }
        });
    }
    // Where
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item) => {
            if (item.op === 'where' && item.sign === undefined) {
                query.where(item.name + ' = ' + item.value);
            }
            else if (item.op === 'and' && item.sign === undefined) {
                query.andWhere(item.name + ' = ' + item.value);
            }
            else if (item.op === 'and' && item.sign !== undefined) {
                query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
            }
            else if (item.op === 'raw' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
            }
            else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            }
            else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            }
        });
    }
    // Keyword Search
    if (searchConditions && searchConditions.length > 0) {
        searchConditions.forEach((table) => {
            if ((table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                const namesArray = table.name;
                namesArray.forEach((name, index) => {
                    query.andWhere(new typeorm_1.Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value, subIndex) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                });
            }
            else if (table.name && table.name instanceof Array && table.name.length > 0) {
                query.andWhere(new typeorm_1.Brackets(qb => {
                    const namesArray = table.name;
                    namesArray.forEach((name, index) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                    });
                }));
            }
            else if (table.value && table.value instanceof Array && table.value.length > 0) {
                query.andWhere(new typeorm_1.Brackets(qb => {
                    const valuesArray = table.value;
                    valuesArray.forEach((value, index) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                    });
                }));
            }
        });
    }
    // GroupBy
    if (groupBy && groupBy.length > 0) {
        let i = 0;
        groupBy.forEach((item) => {
            if (i === 0) {
                query.groupBy(item.name);
            }
            else {
                query.addGroupBy(item.name);
            }
            i++;
        });
    }
    // orderBy
    if (sort && sort.length > 0) {
        sort.forEach((item) => {
            query.orderBy('' + item.name + '', '' + item.order + '');
        });
    }
    // Limit & Offset
    if (limit && limit > 0) {
        query.limit(limit);
        query.offset(offset);
    }
    if (!count) {
        if (rawQuery) {
            return query.getRawMany();
        }
        return query.getMany();
    }
    else {
        return query.getCount();
    }
});
exports.customerListByQueryBuilder = customerListByQueryBuilder;
//# sourceMappingURL=customer-service.js.map