"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("redis");
var debug_1 = __importDefault(require("debug"));
var logger = (0, debug_1.default)('nextjs-redis');
var CacheHandler = (function () {
    function CacheHandler(ctx) {
        if (ctx.flushToDisk) {
            this.flushToDisk = !!ctx.flushToDisk;
        }
        logger("Current mode: ".concat(ctx.dev ? 'development' : 'non-development'));
        if (ctx.dev) {
            logger("Redis based cache does not work in development mode,");
            logger("just like NextJS LRU cache and file system cache do not work in development mode.");
        }
        if (ctx.maxMemoryCacheSize) {
            console.warn('Redis cache handler ignores CacheHandlerContext.maxMemoryCacheSize');
        }
        if (ctx.serverDistDir) {
            console.warn('Redis cache handler ignores CacheHandlerContext.serverDistDir');
        }
        if (ctx.fs) {
            console.warn('Redis cache handler ignores CacheHandlerContext.fs');
        }
        if (!ctx.dev) {
            this.initialize();
        }
    }
    CacheHandler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.client = (0, redis_1.createClient)({
                    url: process.env.REDIS_URL || 'redis://0.0.0.0:6379',
                });
                this.client.on('error', function (err) { return console.error('Redis Client Error', err); });
                this.client
                    .connect()
                    .then(function () { return logger('Redis cache handler connected to Redis server'); })
                    .catch(function () { return console.error('Unable to connect to Redis server'); });
                process.on('SIGTERM', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.client.disconnect()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.client.disconnect()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                return [2];
            });
        });
    };
    CacheHandler.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var redisResponse, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger("Redis get: ".concat(key));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.client.get(key)];
                    case 2:
                        redisResponse = _a.sent();
                        if (redisResponse) {
                            return [2, JSON.parse(redisResponse)];
                        }
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        logger(e_1);
                        return [3, 4];
                    case 4:
                        logger("Redis no data found for key ".concat(key));
                        return [2, null];
                }
            });
        });
    };
    CacheHandler.prototype.set = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger("Redis set: ".concat(key));
                        if (!this.flushToDisk) {
                            logger("Redis flushToDisk is false, not storing data in Redis");
                            return [2];
                        }
                        if (!data) return [3, 2];
                        cacheData = {
                            value: data,
                            lastModified: Date.now(),
                        };
                        return [4, this.client.set(key, JSON.stringify(cacheData))];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        logger("Redis set: ".concat(key, " - no data to store"));
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    return CacheHandler;
}());
exports.default = CacheHandler;
