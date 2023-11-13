import { Brackets, Connection } from 'typeorm';

export const customerListByQueryBuilder = async (
    _connection: Connection,
    limit: number,
    offset: number,
    select: any = [],
    whereConditions: any = [],
    searchConditions: any = [],
    relations: any = [],
    groupBy: any = [],
    sort: any = [],
    count: boolean = false,
    rawQuery: boolean = false)
    : Promise<any> => {

    const query: any = await _connection.getRepository('Customer').createQueryBuilder();
    // Select
    if (select && select.length > 0) {
        query.select(select);
    }
    // Join
    if (relations && relations.length > 0) {
        relations.forEach((joinTb: any) => {
            // query.innerJoin(joinTb.tableName, joinTb.aliasName);
            if (joinTb.op === 'left') {
                query.leftJoin(joinTb.tableName, joinTb.aliasName);
            } else {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
            }
        });
    }
    // Where
    if (whereConditions && whereConditions.length > 0) {
        whereConditions.forEach((item: any) => {
            if (item.op === 'where' && item.sign === undefined) {
                query.where(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign === undefined) {
                query.andWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'and' && item.sign !== undefined) {
                query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'raw' && item.sign !== undefined) {
                query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
            } else if (item.op === 'or' && item.sign === undefined) {
                query.orWhere(item.name + ' = ' + item.value);
            } else if (item.op === 'IN' && item.sign === undefined) {
                query.andWhere(item.name + ' IN (' + item.value + ')');
            }
        });
    }
    // Keyword Search
    if (searchConditions && searchConditions.length > 0) {
        searchConditions.forEach((table: any) => {
            if ((table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                const namesArray = table.name;
                namesArray.forEach((name: string, index: number) => {
                    query.andWhere(new Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value: string | number, subIndex: number) => {
                            if (subIndex === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                });
            } else if (table.name && table.name instanceof Array && table.name.length > 0) {
                query.andWhere(new Brackets(qb => {
                    const namesArray = table.name;
                    namesArray.forEach((name: string, index: number) => {
                        if (index === 0) {
                            qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                            return;
                        }
                        qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                    });
                }));
            } else if (table.value && table.value instanceof Array && table.value.length > 0) {
                query.andWhere(new Brackets(qb => {
                    const valuesArray = table.value;
                    valuesArray.forEach((value: string | number, index: number) => {
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
        groupBy.forEach((item: any) => {
            if (i === 0) {
                query.groupBy(item.name);
            } else {
                query.addGroupBy(item.name);
            }
            i++;
        });
    }
    // orderBy
    if (sort && sort.length > 0) {
        sort.forEach((item: any) => {
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
    } else {
        return query.getCount();
    }
}