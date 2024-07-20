// 20221020, Mark Xu

import {DataSource,DataSourceOptions} from "typeorm"
import {CLog, CPath, gisProduction} from "./AppHelper";
import * as path from "path";

if(!process.env.PORT) {
    require('dotenv-flow').config();
}

if (!process.env.DB_FILE) {
    CLog.bad(`Invalid or Missing [Primary] DB Config env, ${process.env.DB_FILE}`);
    process.exit(1);
}


// alert only
const entityPath = process.env.ENV === 'production' ? path.join(__dirname + '/../../build/src/auth2/entity/**/*.entity.js') :  path.join(__dirname + '/../src/auth2/entity/**/*.entity.ts')
CLog.ok(`Env is: -->${process.env.NODE_ENV}` )
CLog.ok(`Server Path-->${__dirname}`)
CLog.ok(`Entity Path: -->${entityPath}`)
CLog.ok(`DB Info:
[Master]-->${process.env.DB_FILE}
`)

CLog.info(`Seed info: 
   ${process.env.TYPEORM_SEEDING_SEEDS} 
`)


const options: DataSourceOptions =
    {
        type: "sqlite",
        ...( {
            database: "./db/database.sqlite3"
        }),

        synchronize: process.env.DB_SYNC.toLowerCase() === 'true',
        extra: {connectionLimit: 50},
        logging: ["error"],
        maxQueryExecutionTime: 3000, //logging query executing 1 second

        // "keepConnectionAlive":true,
        // "[__for typeORM seeding": null,

        // "__for typeORM seeding": null,
        entities: [
            entityPath
            // path.join(__dirname, '../**/**.entity{.ts,.js}') : '**/*.entity{.ts,.js}'
        ],
        migrations: [
            process.env.MYSQL_MIGRATIONS
        ],
        subscribers: [
            process.env.MYSQL_SUBSCRIBERS
        ],
        // seeds: [
        //     //process.env.TYPEORM_SEEDING_SEEDS
        //     // MainSeed
        // ],
        // "cli": {
        //     "entitiesDir": process.env.MYSQL_ENTITIESDIR,
        //     "migrationsDir": process.env.MYSQL_MIGRATIONSDIR,
        //     "subscribersDir": process.env.MYSQL_SUBSCRIBERSDIR
        // }
    }
const gDB = new DataSource(options);
export default gDB
