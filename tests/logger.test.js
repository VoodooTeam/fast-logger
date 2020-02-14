const logger = require('../index');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockConsole = jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(global, 'setImmediate').mockImplementation(cb => cb());


describe('Logger', () => {

  const OLD_ENV = process.env;
  const OLD_DATE = Date;

  afterEach(() => {
    mockConsole.mockClear();
    process.env = OLD_ENV;
    global.Date = OLD_DATE;
  });

  beforeEach(() => {
    jest.resetModules();
    logger.cache.reset();
    process.env = { ...OLD_ENV };
  });

  it('Normal case', () => {
    const obj = {'key': 'value'};
    const arr = [1, 2, 6];
    logger.info('sample log');
    logger.info(obj);
    logger.info(arr);
    logger.info('sample log', arr, obj);
    expect(mockConsole).toBeCalledTimes(4);
  });

  it('Error case', () => {
    const err = new Error('oops');
    const obj = {
      key: 'value', data: {
        key: [1, 2, 3], key2: [{key: 1}]
      }
    };
    const errObj = new Error('oops 2');
    errObj.moreInfo = 'more info';
    const arr = [1, 2, 6];

    logger.error('samples log');
    logger.error(obj);
    logger.error(arr);
    logger.error(err);
    logger.error(errObj);
    expect(mockConsole).toBeCalledTimes(5);
  });

  it('Circular json', () => {
    const obj = {
      key: 'value',
      circular: true,
      test: {
        test2: [5]
      }
    };
    obj.newValue = obj;
    logger.info(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(2);
  });

  it('Cache case', async () => {
    const obj = {key: 'value'};
    const test = {key2: 'value'};
    logger.setCacheTTL(900);

    logger.info(obj);
    logger.info(test);
    logger.info(obj);
    logger.error(obj);
    logger.error(obj);
    await sleep(1000);
    logger.info(obj);
    logger.error(obj);

    expect(mockConsole).toBeCalledTimes(5)
  });

  it('Without cache', () => {
    const obj = {key: 'value'};

    logger.setCacheTTL(-1);

    logger.info(obj);
    logger.info(obj);
    logger.error(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(4)
  });

  it('Default LOG_LEVEL is info', () => {
    const obj = {key: 'value'};
    logger.trace(obj);
    logger.debug(obj);
    logger.info(obj);
    logger.warn(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(3);
  });

  it('Trace Log level shows all logs', () => {
    process.env.LOG_LEVEL = 'trace';

    const logger = require('../index');

    const obj = {key: 'value'};
    logger.trace(obj);
    logger.debug(obj);
    logger.info(obj);
    logger.warn(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(5);
  });

  it('Error Log level shows only error logs', () => {
    process.env.LOG_LEVEL = 'error';

    const logger = require('../index');

    const obj = {key: 'value'};
    logger.trace(obj);
    logger.debug(obj);
    logger.info(obj);
    logger.warn(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(1);
  });

  it('Wrong LOG_LEVEL fallback to info', () => {
    process.env.LOG_LEVEL = 'voodoo';

    const logger = require('../index');

    const obj = {key: 'value'};
    logger.trace(obj);
    logger.debug(obj);
    logger.info(obj);
    logger.warn(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(3);
  });

  it('Logging only boolean does not log anything special.', () => {
    const staticDate = new Date();
    global.Date = jest.fn(() => staticDate);
    global.Date.now = OLD_DATE.now;

    logger.info(true);
    const expectedOutput = JSON.stringify({app: "Logger", time: new Date(), level: "info"});
    expect(mockConsole).toBeCalledWith(expectedOutput);
  });

});
