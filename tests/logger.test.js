const logger = require('../index');

describe('Logger',  () => {
  it('Normal case', () => {
    logger.info('data');
    logger.error('data')
  })
});
