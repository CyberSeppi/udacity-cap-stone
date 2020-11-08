import * as Winston from "winston";

enum LOGLEVELS {
  DEBUG,
  INFO,
  ERROR,
}

export class Logger {
  private static thisInstance: Logger;
  private loggerImplInstance: Winston.LoggerInstance;

  private constructor() {
    this.loggerImplInstance = new Winston.Logger({
      transports: [
        new Winston.transports.Console({
          level: "debug",
          timestamp: true,
          stringify: true,
          prettyPrint: true,
          showLevel: true,
          json: true,
        }),
      ],
    });
  }

  /**
   * returns an instance of the Logger Singleton class
   */
  static getInstance(): Logger {
    if (!Logger.thisInstance) {
      Logger.thisInstance = new Logger();
    }

    return Logger.thisInstance;
  }

  private log(logLevel: LOGLEVELS, logMsg: string, ...optParams: any[]) {
    
    switch (logLevel) {
      case LOGLEVELS.INFO:
        this.loggerImplInstance.info(logMsg, { metaData: optParams });
        break;
      case LOGLEVELS.ERROR:
        this.loggerImplInstance.error(logMsg, { metaData: optParams });
        break;
      case LOGLEVELS.DEBUG:
        this.loggerImplInstance.debug(logMsg, { metaData: optParams });
        break;
      default:
        throw Error(`Loglevel ${logLevel} not known`);
    }
  }

  /**
   *
   * @param msg msg to be logged as info msg
   */
  info(msg: string, ...optParams: any[]) {
    Logger.thisInstance.log(LOGLEVELS.INFO, msg, optParams);
  }

  /**
   *
   * @param msg msg to be logged as debug msg
   */
  debug(msg: string, ...optParams: any[]) {
    Logger.thisInstance.log(LOGLEVELS.DEBUG, msg, optParams);
  }

  /**
   *
   * @param msg msg to be logged as error msg
   */
  error(msg: string, ...optParams: any[]) {
    Logger.thisInstance.log(LOGLEVELS.ERROR, msg, optParams);
  }
}
