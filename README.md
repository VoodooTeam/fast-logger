# fast-logger

<div align="center">
<b>Fast logger with buffer</b><br/>
<br/><br/>
<a href="https://badge.fury.io/js/%40voodoo.io%2Ffast-logger.svg">
   <img src="https://badge.fury.io/js/%40voodoo.io%2Ffast-logger.svg" alt="npm version" height="18">
</a>
</div>

# Purpose
Simple fast logger which contain a LRU cache to avoid big spike to the stack of logs.

# Compatibility

Supported and tested : >= 8.10

| Version       | Supported     | Tested         |
| ------------- |:-------------:|:--------------:|
| 12.x          | yes           | yes            |
| 10.x          | yes           | yes            |
| 9.x           | yes           | yes            |
| 8.x           | yes           | yes            |

# Installation

```console
$ npm install @voodoo.io/fast-logger --save
```

# Usage

You must set in your var env: `APP_NAME`  
Accepted format:
- string
- array
- object
- Error

### Basic Usage

```javascript
const logger = require('@voodoo.io/fast-logger');

logger.info('My log', {key: 'value'}, [0,1,2]);
logger.error('My error');
// output:
// {"app":"MyAppName","time":"2020-02-11T16:18:07.731Z","level":"info","msg":"My log","key":"value","data_0":[0,1,2]}
// {"app":"MyAppName","time":"2020-02-11T16:18:07.731Z","level":"error","msg":"My error"}
```

### Buffer

The logger has a buffer of 100 ms by default if the logs are exactly the same
 
```javascript
const logger = require('@voodoo.io/fast-logger');

// It will log only one time `My log` and `My error`
for (let i = 0; i < 100; i++) {
    logger.info('My log');
    logger.error('My error');
}
```

### Options

You can disable the logger by calling the function `setCacheTTL` with a negative integer value or you can customize the TTL 
of the items in the cache

```javascript
const logger = require('@voodoo.io/fast-logger');

// cache is disable
logger.setCacheTTL(-1);

// buffer of 1 sec in the cache
logger.setCacheTTL(1000);
```

# Test

```console
$ npm test
```

Coverage report can be found in coverage/.
