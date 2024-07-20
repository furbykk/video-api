/*
20221025, Mark Xu
App wide helper for environment initialization and data source configuration
 */

import moment = require("moment");

import fs = require('fs');
import os = require('os');
// const os = require('os')
export const canNum = (...args) => args.filter(a => isNaN(parseInt(a))).length === 0
export const canStr= (...args) => args.filter(a => typeof a === 'string').length !== 0
//for back end nodejs server colorful console log
enum gColor {
    reset = "\x1b[0m",
    bright = "\x1b[1m",
    dim = "\x1b[2m",
    underscore = "\x1b[4m",
    blink = "\x1b[5m",
    reverse = "\x1b[7m",
    hidden = "\x1b[8m",

    black = "\x1b[30m",
    red = "\x1b[31m",
    green = "\x1b[32m",
    yellow = "\x1b[33m",
    blue = "\x1b[34m",
    magenta = "\x1b[35m",
    cyan = "\x1b[36m",
    white = "\x1b[37m",

    bgBlack = "\x1b[40m",
    bgRed = "\x1b[41m",
    bgGreen = "\x1b[42m",
    bgYellow = "\x1b[43m",
    bgBlue = "\x1b[44m",
    bgMagenta = "\x1b[45m",
    bgCyan = "\x1b[46m",
    bgWhite = "\x1b[47m"
}

export class CLog {
    private static get debugLine() {
        return (new Error().stack.split("at ")[3]).trim()
        // return "[" + functionName + ":" + lineNumber + "] "
    }

    private static get timeStamp() {
        moment.locale();
        return moment().format('YYMMDD/hh:mm:ss.SS')
    }


    static __cLog = (color, ...args): string[] => {
        // string part of args
        // console.log(1.constructor)
        // console.log(1?.constructor)
        let objsUnstrifiable: any[] = []
        // collect argument cannot be stringfied
        let argsStr = args.filter(a => (typeof a === typeof {} || typeof a === typeof []) ? objsUnstrifiable.push(a) & 0 : true)

        let str = argsStr.join('/# ')
        let resStr = str
        // print stringfied arguments
        str = `${color}${str}${gColor.reset}`;
        console.log(str)
        // print object with class type
        objsUnstrifiable.forEach(o => console.log(o))
        return args
    }

    static log(color: gColor, ...args): void {
        console.log(CLog.__cLog(color, ...args))
    }

    static ok(...args): void {
        CLog.__cLog(gColor.green, `🚀👌`, ...args)
    }


    static bad(...args): void {
        CLog.__cLog(gColor.red, `${CLog.timeStamp}🤬🧯🚒🐛🐛🐛`, ...args)
        CLog.__cLog(gColor.red, `        ${CLog.debugLine}`)
        // console.trace([...args].length > 0 ? [...args][0] : '')
    }

    static warning(...args): void {
        CLog.__cLog(gColor.yellow, `🙀⚠️`, ...args)
    }

    static info(...args): void {
        // return (new Error().stack.split("at ")[1]).trim()

        CLog.__cLog(gColor.blue, `😿📟`, ...args)
    }


}

CLog.info('App Env is: -->', process.env.NODE_ENV)

export const gisProduction = (): boolean => {
    const mode = process.env.NODE_ENV
    return mode === 'production';
}



// 1, test the upload file path template or not,
// 1.1 if it is not a template, means it is a directory should be read and write, then try to write a test file with name
// __upload_file_test.txt
// 1.2 if it still a path template, with: ##YourUserName##
// then: replace this place holder to user name. the final upload path should be:
// __dirname/username/lms_uploadfiles/

export class CPath {
    private static upload_root: string = process.env.UPLOADFILES_ROOT
    constructor() {
        // check and decide the upload file path
        if(!CPath.upload_root){
            CLog.bad('.env file does NOT have variable -> UPLOADFILES_ROOT')
        }
    }

    static initUploadFileFolder = (): string => {
        // if there is NO such variable in .env file
        if(!CPath.upload_root){
            CLog.bad('.env file does NOT have variable -> UPLOADFILES_ROOT')
        }

        try {
            // if UPLOADFILES_ROOT in .env file is a template
            if(CPath.upload_root.includes('##YourUserName##')){
                const username = os.userInfo().username
                const targetFolder = `${__dirname}/${username}/lms_uploadfiles`
                if(!fs.existsSync(targetFolder)){
                    fs.mkdirSync(targetFolder, {
                        recursive: true
                    })
                }
                CPath.upload_root = targetFolder
                return targetFolder
            }else{
                // if UPLOADFILES_ROOT in .env file is NOT a template
                // write test file with name: __upload_file_test.txt
                const testFile = '__upload_file_test.txt'
                if(!fs.existsSync(CPath.upload_root)){
                    fs.mkdirSync(CPath.upload_root, {
                        recursive: true
                    })
                }
                fs.writeFile(`${CPath.upload_root}/${testFile}`, 'hello world', err => {
                    return err && CLog.bad(err)
                })
                CLog.ok('Init Upload file folder ok:-->', CPath.upload_root)
                return CPath.upload_root
            }
        }catch (e) {
            CLog.bad('Error in initUploadFilePath', e)
        }
        CLog.bad('Error in initUploadFilePath')
        return CPath.upload_root = null
    }


    static getUploadFilePath = (): string => {
        return CPath.upload_root
    }
}
