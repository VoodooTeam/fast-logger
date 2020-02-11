const logger = require('../index');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockConsole = jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(global, 'setImmediate').mockImplementation(cb => cb());

describe('Logger', () => {
  afterEach(() => {
    mockConsole.mockClear();
  });

  beforeEach(() => {
    logger.cache.reset()
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
    err.moreInfo = {code: 5000};
    const obj = {'key': 'value'};
    const errObj = new Error(JSON.stringify(obj));
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
      circular: true
    };
    obj.newValue = obj;
    logger.info(obj);
    expect(mockConsole).toBeCalledTimes(1);
  });

  it('Cache case', async () => {
    const obj = {key: 'value'};
    logger.setCacheTTL(900);

    logger.info(obj);
    logger.info(obj);
    logger.error(obj);
    logger.error(obj);
    await sleep(1000);
    logger.info(obj);
    logger.error(obj);

    expect(mockConsole).toBeCalledTimes(4)
  });

  it('Without cache', () => {
    const obj = {key: 'value'};

    logger.setCacheTTL(-1);

    logger.info(obj);
    logger.info(obj);
    logger.error(obj);
    logger.error(obj);
    expect(mockConsole).toBeCalledTimes(4)
  })
});
