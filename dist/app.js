(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"core-js/shim":85,"regenerator/runtime":86}],2:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = $.toObject($this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":22}],3:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":22,"./$.ctx":11}],4:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":22}],5:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":22,"./$.enum-keys":14}],6:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":22,"./$.wks":36}],7:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, ID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      var that     = assert.inst(this, C, NAME)
        , iterable = arguments[0];
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":22,"./$.assert":4,"./$.ctx":11,"./$.for-of":15,"./$.iter":21,"./$.iter-define":19,"./$.uid":34}],8:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":12,"./$.for-of":15}],9:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , _has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      $.set(assert.inst(this, C, NAME), ID, id++);
      var iterable = arguments[0];
      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this)['delete'](key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this).has(key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      _has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":22,"./$.array-methods":3,"./$.assert":4,"./$.for-of":15,"./$.uid":34}],10:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , BUGGY = require('./$.iter').BUGGY
  , forOf = require('./$.for-of')
  , species = require('./$.species')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY, CHAIN){
    var method = proto[KEY];
    if($.FW)proto[KEY] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = function(){
        assertInstance(this, C, NAME);
        var that     = new Base
          , iterable = arguments[0];
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.for-of":15,"./$.iter":21,"./$.iter-detect":20,"./$.species":28}],11:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":4}],12:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && $.hide(target, key, out);
    }
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":22}],13:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":22}],14:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":22}],15:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":11,"./$.iter":21,"./$.iter-call":18}],16:[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],17:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],18:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":4}],19:[function(require,module,exports){
var $def            = require('./$.def')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$.hide(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.iter":21,"./$.wks":36}],20:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":36}],21:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: function(it){
    var Symbol  = $.g.Symbol
      , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
      , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.wks":36}],22:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":16}],23:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":22}],24:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":22,"./$.assert":4}],25:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":22,"./$.assert":4,"./$.invoke":17}],26:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],27:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":22,"./$.assert":4,"./$.ctx":11}],28:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":22,"./$.wks":36}],29:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":22}],30:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var $      = require('./$')
  , repeat = require('./$.string-repeat');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$":22,"./$.string-repeat":31}],31:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count){
  var str = String($.assertDefined(this))
    , res = ''
    , n   = $.toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$":22}],32:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":22,"./$.cof":6,"./$.ctx":11,"./$.dom-create":13,"./$.invoke":17}],33:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],34:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":22}],35:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":22,"./$.wks":36}],36:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":22,"./$.uid":34}],37:[function(require,module,exports){
var $                = require('./$')
  , cel              = require('./$.dom-create')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , html             = $.html
  , A                = []
  , _slice           = A.slice
  , _join            = A.join
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , toIndex          = $.toIndex
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4);

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~$indexOf(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it){ return !$.isObject(it); }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = _slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(_slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string and DOM objects
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}

var buggySlice = true;
try {
  if(html)_slice.call(html);
  buggySlice = false;
} catch(e){ /* empty */ }

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return _slice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});

$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  join: function join(){
    return _join.apply($.ES5Object(this), arguments);
  }
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":22,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.dom-create":13,"./$.invoke":17,"./$.replacer":26,"./$.throws":33,"./$.uid":34}],38:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":22,"./$.def":12,"./$.unscope":35}],39:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":22,"./$.def":12,"./$.unscope":35}],40:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],41:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],42:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , call  = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":22,"./$.ctx":11,"./$.def":12,"./$.iter":21,"./$.iter-call":18,"./$.iter-detect":20}],43:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.uid":34,"./$.unscope":35}],44:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":12}],45:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":28}],46:[function(require,module,exports){
var $             = require('./$')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(!$.isFunction(this) || !$.isObject(O))return false;
  if(!$.isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":22,"./$.wks":36}],47:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":22}],48:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":10,"./$.collection-strong":7}],49:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);
function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x){
    var $abs  = abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = 0
      , arg;
    while(len1--){
      arg = args[len1] = abs(arguments[len1]);
      if(arg == Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = larg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":12}],50:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , $Number    = $.g[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  $.hide($.g, NUMBER, $Number);
}
},{"./$":22}],51:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , _isFinite = $.g.isFinite
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":22,"./$.def":12}],52:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":5,"./$.def":12}],53:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function is(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":12}],54:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":12,"./$.set-proto":27}],55:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":22,"./$.def":12}],56:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $   = require('./$')
  , cof = require('./$.cof')
  , src = String({}.toString)
  , tmp = {};
function toString(){
  return '[object ' + cof.classof(this) + ']';
}
// lodash uses String(Object.prototype.toString) in isNative
toString.toString = function(){
  return src;
};
tmp[require('./$.wks')('toStringTag')] = 'z';
if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', toString);
},{"./$":22,"./$.cof":6,"./$.wks":36}],57:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj;

var useNative = function(){
  var test, works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && P.resolve(test = new P(function(){})) == test;
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  if(chain.length)asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    asap(function(){
      if(isUnhandled(promise = record.p)){
        if(cof(process) == 'process'){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && isFunction(console.error)){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then, wrapper;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      wrapper = {r: record, d: false}; // wrap
      then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(err){
    $reject.call(wrapper || {r: record, d: false}, err); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  $.mix(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      record.s && notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species($.core[PROMISE]); // for wrapper

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.ctx":11,"./$.def":12,"./$.for-of":15,"./$.iter-detect":20,"./$.set-proto":27,"./$.species":28,"./$.task":32,"./$.uid":34,"./$.wks":36}],58:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITERATOR  = require('./$.wks')('iterator')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getProto  = $.getProto
  , $Reflect  = $.g.Reflect
  , _apply    = Function.apply
  , assertObject = assert.obj
  , _isExtensible = Object.isExtensible || $.isObject
  , _preventExtensions = Object.preventExtensions || $.it
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      _preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getProto(target))){
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function setPrototypeOf(target, proto){
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch(e){
    return false;
  }
};

$def($def.G, {Reflect: {}});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);
},{"./$":22,"./$.assert":4,"./$.def":12,"./$.iter":21,"./$.own-keys":24,"./$.set-proto":27,"./$.uid":34,"./$.wks":36}],59:[function(require,module,exports){
var $       = require('./$')
  , cof     = require('./$.cof')
  , $RegExp = $.g.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();
if($.FW && $.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    $.hide($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":22,"./$.cof":6,"./$.replacer":26,"./$.species":28}],60:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":10,"./$.collection-strong":7}],61:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":29}],62:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],63:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":22,"./$.def":12}],64:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12}],65:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.string-at":29,"./$.uid":34}],66:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = $.toObject(callSite.raw)
      , len = $.toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":22,"./$.def":12}],67:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":12,"./$.string-repeat":31}],68:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],69:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , getNames = $.getNames
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , SymbolRegistry = {}
  , AllSymbols = {}
  , useNative = $.isFunction($Symbol);

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  $.DESC && setter && setDesc(Object.prototype, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D.enumerable = false;
    }
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(description){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  $.hide($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.enum-keys":14,"./$.keyof":23,"./$.uid":34,"./$.wks":36}],70:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}
},{"./$":22,"./$.collection":10,"./$.collection-weak":9}],71:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":10,"./$.collection-weak":9}],72:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":2,"./$.def":12,"./$.unscope":35}],73:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":8}],74:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":22,"./$.def":12,"./$.own-keys":24}],75:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":22,"./$.def":12}],76:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":12,"./$.replacer":26}],77:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":8}],78:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":29}],79:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":12,"./$.string-pad":30}],80:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":12,"./$.string-pad":30}],81:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = $.core.Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":22,"./$.ctx":11,"./$.def":12}],82:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NodeList    = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, ArrayValues);
}
Iterators.NodeList = ArrayValues;
},{"./$":22,"./$.iter":21,"./$.wks":36,"./es6.array.iterator":43}],83:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":12,"./$.task":32}],84:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $         = require('./$')
  , $def      = require('./$.def')
  , invoke    = require('./$.invoke')
  , partial   = require('./$.partial')
  , navigator = $.g.navigator
  , MSIE      = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":22,"./$.def":12,"./$.invoke":17,"./$.partial":25}],85:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":22,"./modules/es5":37,"./modules/es6.array.copy-within":38,"./modules/es6.array.fill":39,"./modules/es6.array.find":41,"./modules/es6.array.find-index":40,"./modules/es6.array.from":42,"./modules/es6.array.iterator":43,"./modules/es6.array.of":44,"./modules/es6.array.species":45,"./modules/es6.function.has-instance":46,"./modules/es6.function.name":47,"./modules/es6.map":48,"./modules/es6.math":49,"./modules/es6.number.constructor":50,"./modules/es6.number.statics":51,"./modules/es6.object.assign":52,"./modules/es6.object.is":53,"./modules/es6.object.set-prototype-of":54,"./modules/es6.object.statics-accept-primitives":55,"./modules/es6.object.to-string":56,"./modules/es6.promise":57,"./modules/es6.reflect":58,"./modules/es6.regexp":59,"./modules/es6.set":60,"./modules/es6.string.code-point-at":61,"./modules/es6.string.ends-with":62,"./modules/es6.string.from-code-point":63,"./modules/es6.string.includes":64,"./modules/es6.string.iterator":65,"./modules/es6.string.raw":66,"./modules/es6.string.repeat":67,"./modules/es6.string.starts-with":68,"./modules/es6.symbol":69,"./modules/es6.weak-map":70,"./modules/es6.weak-set":71,"./modules/es7.array.includes":72,"./modules/es7.map.to-json":73,"./modules/es7.object.get-own-property-descriptors":74,"./modules/es7.object.to-array":75,"./modules/es7.regexp.escape":76,"./modules/es7.set.to-json":77,"./modules/es7.string.at":78,"./modules/es7.string.lpad":79,"./modules/es7.string.rpad":80,"./modules/js.array.statics":81,"./modules/web.dom.iterable":82,"./modules/web.immediate":83,"./modules/web.timers":84}],86:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator, "next");
      var callThrow = step.bind(generator, "throw");

      function step(method, arg) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  function defineGeneratorMethod(method) {
    Gp[method] = function(arg) {
      return this._invoke(method, arg);
    };
  }
  defineGeneratorMethod("next");
  defineGeneratorMethod("throw");
  defineGeneratorMethod("return");

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],87:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],88:[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":87}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getAttacker = function getAttacker() {

    return {};
};
exports.getAttacker = getAttacker;

},{}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ConstantsBasesJs = require("../Constants/Bases.js");

var _ConfigAppConfigJs = require("../Config/AppConfig.js");

require("babel/polyfill");

var getBaseCommunicator = function getBaseCommunicator() {
    var marked1$0 = [basisGenerator].map(regeneratorRuntime.mark);

    var randomBasis = [],
        otherBasis = [],
        sharedKey = [],
        photons = [],
        decision = undefined,
        otherDecision = undefined;

    //jscs:disable
    function basisGenerator() {
        var i;
        return regeneratorRuntime.wrap(function basisGenerator$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    i = 0;

                case 1:
                    if (!(i < _ConfigAppConfigJs.PhotonsSize)) {
                        context$2$0.next = 7;
                        break;
                    }

                    i++;
                    context$2$0.next = 5;
                    return Math.floor(Math.random() * 2) === 1 ? _ConstantsBasesJs.Diagonal : _ConstantsBasesJs.Rectangular;

                case 5:
                    context$2$0.next = 1;
                    break;

                case 7:
                case "end":
                    return context$2$0.stop();
            }
        }, marked1$0[0], this);
    }
    //jscs:enable

    function generateRandomBasis() {
        this.randomBasis = [];
        var gen = basisGenerator(),
            i = gen.next().value;
        while (i !== undefined) {
            i = gen.next().value;
            if (i !== undefined) {
                this.randomBasis.push(i);
            }
        }
    }

    function isValidChannel(channel) {
        if (channel === undefined || channel.BasisUsed === undefined || channel.Photons === undefined || channel.Decision === undefined) {
            throw "BaseCommunicator.js - isValidChannel() - Invalid channel provided.";
        }
        return true;
    }

    function readBasisFromChannel(channel) {
        if (isValidChannel(channel)) {
            this.otherBasis = channel.BasisUsed.slice(0);
        }
    }

    function sendBasisToChannel(channel) {
        if (isValidChannel(channel)) {
            channel.BasisUsed = this.randomBasis.slice(0);
        }
    }

    function decide() {
        if (this.sharedKey === undefined || this.sharedKey.length <= 0) {
            throw "BaseCommunicator.js - decide() - Shared key is invalid.";
        }
        this.decision = this.sharedKey.length >= _ConfigAppConfigJs.MinSharedKeyLength;
    }

    function sendDecisionToChannel(channel) {
        if (isValidChannel(channel)) {
            channel.Decision = this.decision;
        }
    }

    function readDecisionFromChannel(channel) {
        if (isValidChannel(channel)) {
            this.otherDecision = channel.Decision;
        }
    }

    return {
        photons: photons,
        randomBasis: randomBasis,
        otherBasis: otherBasis,
        sharedKey: sharedKey,
        isValidChannel: isValidChannel,
        generateRandomBasis: generateRandomBasis,
        readBasisFromChannel: readBasisFromChannel,
        sendBasisToChannel: sendBasisToChannel,
        decide: decide,
        sendDecisionToChannel: sendDecisionToChannel,
        readDecisionFromChannel: readDecisionFromChannel
    };
};
exports.getBaseCommunicator = getBaseCommunicator;

},{"../Config/AppConfig.js":94,"../Constants/Bases.js":95,"babel/polyfill":88}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MessagesPhotonJs = require("../Messages/Photon.js");

var _BaseCommunicatorJs = require("./BaseCommunicator.js");

var _ConfigAppConfigJs = require("../Config/AppConfig.js");

var _ConstantsPolarizationsJs = require("../Constants/Polarizations.js");

var _ConstantsBasesJs = require("../Constants/Bases.js");

require("babel/polyfill");

var getReceiver = function getReceiver() {

    var BaseCommunicator = (0, _BaseCommunicatorJs.getBaseCommunicator)(),
        measuredPolarizations = [];

    function calculateBit(basis, polarization) {
        if (basis !== _ConstantsBasesJs.Diagonal && basis !== _ConstantsBasesJs.Rectangular) {
            throw "Receiver.js - calculateBit() - Invalid parameters. Basis: " + basis + " Polarization: " + polarization;
        }
        if (basis === _ConstantsBasesJs.Rectangular) {
            if (polarization === _ConstantsPolarizationsJs.Degrees.Zero) {
                return 0;
            } else {
                return 1;
            }
        } else {
            if (polarization === _ConstantsPolarizationsJs.Degrees.FortyFive) {
                return 0;
            } else {
                return 1;
            }
        }
    }

    function measurePhotonsFromChannel(channel) {
        if (BaseCommunicator.isValidChannel(channel)) {
            this.measuredPolarizations = [];
            BaseCommunicator.photons = channel.Photons.slice(0);
            if (BaseCommunicator.photons.length === BaseCommunicator.randomBasis.length) {
                for (var i = 0; i < BaseCommunicator.photons.length; i++) {
                    var basis = BaseCommunicator.randomBasis[i];
                    this.measuredPolarizations[i] = BaseCommunicator.photons[i].measure(basis);
                }
            } else {
                throw "Receiver.js - measurePolarizationsFromChannel() - Length of sender polars is not same as receiver random basis.";
            }
        }
    }

    function generateSharedKey() {
        if (BaseCommunicator.randomBasis.length !== BaseCommunicator.otherBasis.length) {
            throw "Receiver.js - generateSharedKey() - Length of random basis and other basis are not equal.";
        }
        if (this.measuredPolarizations.length !== BaseCommunicator.randomBasis.length) {
            throw "Receiver.js - generateSharedKey() - Length of measured polarizations and random basis are not equal.";
        }
        for (var i = 0; i < this.measuredPolarizations.length; i++) {
            var basis = BaseCommunicator.randomBasis[i],
                otherBasis = BaseCommunicator.otherBasis[i];
            if (basis === otherBasis) {
                BaseCommunicator.sharedKey.push(calculateBit(basis, this.measuredPolarizations[i]));
            }
        }
    }

    /* Base Calls */
    function generateRandomBasis() {
        BaseCommunicator.generateRandomBasis();
    }
    function sendBasisToChannel(channel) {
        BaseCommunicator.sendBasisToChannel(channel);
    }
    function readBasisFromChannel(channel) {
        BaseCommunicator.readBasisFromChannel(channel);
    }
    function decide() {
        BaseCommunicator.decide();
    }
    function sendDecisionToChannel(channel) {
        BaseCommunicator.sendDecisionToChannel(channel);
    }
    function readDecisionFromChannel(channel) {
        BaseCommunicator.readDecisionFromChannel(channel);
    }

    return {
        measuredPolarizations: measuredPolarizations,
        generateRandomBasis: generateRandomBasis,
        measurePhotonsFromChannel: measurePhotonsFromChannel,
        sendBasisToChannel: sendBasisToChannel,
        readBasisFromChannel: readBasisFromChannel,
        generateSharedKey: generateSharedKey,
        decide: decide,
        sendDecisionToChannel: sendDecisionToChannel,
        readDecisionFromChannel: readDecisionFromChannel
    };
};
exports.getReceiver = getReceiver;

},{"../Config/AppConfig.js":94,"../Constants/Bases.js":95,"../Constants/Polarizations.js":96,"../Messages/Photon.js":97,"./BaseCommunicator.js":90,"babel/polyfill":88}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MessagesPhotonJs = require("../Messages/Photon.js");

var _BaseCommunicatorJs = require("./BaseCommunicator.js");

var _ConfigAppConfigJs = require("../Config/AppConfig.js");

var _ConstantsPolarizationsJs = require("../Constants/Polarizations.js");

var _ConstantsBasesJs = require("../Constants/Bases.js");

require("babel/polyfill");

var getSender = function getSender() {
    var marked1$0 = [bitGenerator].map(regeneratorRuntime.mark);

    var BaseCommunicator = (0, _BaseCommunicatorJs.getBaseCommunicator)(),
        randomBits = [];

    //jscs:disable
    function bitGenerator() {
        var i;
        return regeneratorRuntime.wrap(function bitGenerator$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    i = 0;

                case 1:
                    if (!(i < _ConfigAppConfigJs.PhotonsSize)) {
                        context$2$0.next = 7;
                        break;
                    }

                    i++;
                    context$2$0.next = 5;
                    return Math.floor(Math.random() * 2);

                case 5:
                    context$2$0.next = 1;
                    break;

                case 7:
                case "end":
                    return context$2$0.stop();
            }
        }, marked1$0[0], this);
    }
    //jscs:enable

    function generateRandomBits() {
        this.randomBits = [];
        var gen = bitGenerator(),
            i = gen.next().value;
        while (i !== undefined) {
            i = gen.next().value;
            if (i !== undefined) {
                this.randomBits.push(i);
            }
        }
    }

    function calculatePolarization(bit, basis) {
        if (bit !== 0 && bit !== 1 || basis !== _ConstantsBasesJs.Diagonal && basis !== _ConstantsBasesJs.Rectangular) {
            throw "Sender.js - calculatePolarization() - Invalid parameters. Bit: " + bit + " Basis: " + basis;
        }
        if (basis === _ConstantsBasesJs.Rectangular) {
            if (bit === 0) {
                return _ConstantsPolarizationsJs.Degrees.Zero;
            } else {
                return _ConstantsPolarizationsJs.Degrees.Ninety;
            }
        } else {
            if (bit === 0) {
                return _ConstantsPolarizationsJs.Degrees.FortyFive;
            } else {
                return _ConstantsPolarizationsJs.Degrees.OneHundredThirtyFive;
            }
        }
    }

    function calculatePolarizations() {
        if (this.randomBits === undefined || BaseCommunicator.randomBasis === undefined) {
            throw "Sender.js - calculatePolarizations() - randomBits || randomBasis not generated.";
        }
        if (this.randomBits.length !== BaseCommunicator.randomBasis.length) {
            throw "Sender.js - calculatePolarizations() - Number of bits is not same as number of basis.";
        }
        for (var i = 0; i < this.randomBits.length; i++) {
            var photon = (0, _MessagesPhotonJs.getPhoton)(),
                polarization = calculatePolarization(this.randomBits[i], BaseCommunicator.randomBasis[i]);
            photon.setState(polarization);
            photon.setBasis(BaseCommunicator.randomBasis[i]);
            BaseCommunicator.photons.push(photon);
        }
    }

    function sendPhotonsToChannel(channel) {
        if (BaseCommunicator.isValidChannel(channel)) {
            channel.Photons = BaseCommunicator.photons.slice(0);
        }
    }

    function generateSharedKey() {
        if (BaseCommunicator.randomBasis.length !== BaseCommunicator.otherBasis.length) {
            throw "Sender.js - generateSharedKey() - Length of random basis and other basis are not equal.";
        }
        if (this.randomBits.length !== BaseCommunicator.randomBasis.length) {
            throw "Sender.js - generateSharedKey() - Length of random bits and random basis are not equal.";
        }
        for (var i = 0; i < this.randomBits.length; i++) {
            var basis = BaseCommunicator.randomBasis[i],
                otherBasis = BaseCommunicator.otherBasis[i];
            if (basis === otherBasis) {
                BaseCommunicator.sharedKey.push(this.randomBits[i]);
            }
        }
    }

    /* Base Calls */
    function generateRandomBasis() {
        BaseCommunicator.generateRandomBasis();
    }
    function sendBasisToChannel(channel) {
        BaseCommunicator.sendBasisToChannel(channel);
    }
    function readBasisFromChannel(channel) {
        BaseCommunicator.readBasisFromChannel(channel);
    }
    function decide() {
        BaseCommunicator.decide();
    }
    function sendDecisionToChannel(channel) {
        BaseCommunicator.sendDecisionToChannel(channel);
    }
    function readDecisionFromChannel(channel) {
        BaseCommunicator.readDecisionFromChannel(channel);
    }

    return {
        generateRandomBits: generateRandomBits,
        generateRandomBasis: generateRandomBasis,
        calculatePolarizations: calculatePolarizations,
        sendPhotonsToChannel: sendPhotonsToChannel,
        sendBasisToChannel: sendBasisToChannel,
        readBasisFromChannel: readBasisFromChannel,
        generateSharedKey: generateSharedKey,
        decide: decide,
        sendDecisionToChannel: sendDecisionToChannel,
        readDecisionFromChannel: readDecisionFromChannel
    };
};
exports.getSender = getSender;

},{"../Config/AppConfig.js":94,"../Constants/Bases.js":95,"../Constants/Polarizations.js":96,"../Messages/Photon.js":97,"./BaseCommunicator.js":90,"babel/polyfill":88}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var QuantumChannel = (function () {

    var Photons = [],
        BasisUsed = [],
        Decision = false;

    return {
        Photons: Photons,
        BasisUsed: BasisUsed,
        Decision: Decision
    };
})();
exports.QuantumChannel = QuantumChannel;

},{}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var PhotonsSize = 128;exports.PhotonsSize = PhotonsSize;
// number of photons in a pulse
var MinSharedKeyLength = 64; // number of 'bits' to consider secure
exports.MinSharedKeyLength = MinSharedKeyLength;

},{}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Diagonal = 'D';
exports.Diagonal = Diagonal;
var Rectangular = 'R';
exports.Rectangular = Rectangular;

},{}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Degrees = {
    Zero: 0,
    Ninety: 90,
    FortyFive: 45,
    OneHundredThirtyFive: 135
};
exports.Degrees = Degrees;

},{}],97:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ConstantsPolarizationsJs = require("../Constants/Polarizations.js");

var _ConstantsBasesJs = require("../Constants/Bases.js");

var getPhoton = function getPhoton() {

    var PolarizationState = undefined,
        Basis = undefined;

    function isValidState(state) {
        for (var prop in _ConstantsPolarizationsJs.Degrees) {
            if (_ConstantsPolarizationsJs.Degrees.hasOwnProperty(prop)) {
                if (_ConstantsPolarizationsJs.Degrees[prop] === state) {
                    return true;
                }
            }
        }
        throw "Photon.js - isValidState() - Invalid State Provided - State: " + state;
    }

    function isValidBasis(basis) {
        if (basis === _ConstantsBasesJs.Diagonal || basis === _ConstantsBasesJs.Rectangular) {
            return true;
        }
        throw "Photon.js - isValidState() - Invalid Basis Provided - Basis: " + basis;
    }

    function setState(state) {
        if (isValidState(state)) {
            PolarizationState = state;
        }
    }

    function setBasis(basis) {
        if (isValidBasis(basis)) {
            Basis = basis;
        }
    }

    function measure(basisToMeasureIn) {
        if (isValidBasis(basisToMeasureIn)) {
            if (Basis === basisToMeasureIn) {
                return PolarizationState;
            } else {
                Basis = basisToMeasureIn;
                var randomPolarBit = Math.floor(Math.random() * 2);
                if (Basis === _ConstantsBasesJs.Diagonal) {
                    if (randomPolarBit === 0) {
                        return _ConstantsPolarizationsJs.Degrees.FortyFive;
                    } else if (randomPolarBit === 1) {
                        return _ConstantsPolarizationsJs.Degrees.OneHundredThirtyFive;
                    }
                } else if (Basis === _ConstantsBasesJs.Rectangular) {
                    if (randomPolarBit === 0) {
                        return _ConstantsPolarizationsJs.Degrees.Zero;
                    } else if (randomPolarBit === 1) {
                        return _ConstantsPolarizationsJs.Degrees.Ninety;
                    }
                }
            }
        }
    }

    return {
        setState: setState,
        setBasis: setBasis,
        measure: measure
    };
};
exports.getPhoton = getPhoton;

},{"../Constants/Bases.js":95,"../Constants/Polarizations.js":96}],98:[function(require,module,exports){
"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _ConfigAppConfig = require("./Config/AppConfig");

var AppConfig = _interopRequireWildcard(_ConfigAppConfig);

var _ActorsSenderJs = require("./Actors/Sender.js");

var _ActorsReceiverJs = require("./Actors/Receiver.js");

var _ActorsAttackerJs = require("./Actors/Attacker.js");

var _ChannelsQuantumChannelJs = require("./Channels/QuantumChannel.js");

var Sender = (0, _ActorsSenderJs.getSender)(),
    Receiver = (0, _ActorsReceiverJs.getReceiver)(),
    Attacker = (0, _ActorsAttackerJs.getAttacker)();

Sender.generateRandomBits();
Sender.generateRandomBasis();
Sender.calculatePolarizations();
Sender.sendPhotonsToChannel(_ChannelsQuantumChannelJs.QuantumChannel);

//Attacker.interceptPhotonsFromChannel(QuantumChannel);

Receiver.generateRandomBasis();
Receiver.measurePhotonsFromChannel(_ChannelsQuantumChannelJs.QuantumChannel);

Sender.sendBasisToChannel(_ChannelsQuantumChannelJs.QuantumChannel);
//Attacker.interceptSenderBasisFromChannel(QuantumChannel);
Receiver.readBasisFromChannel(_ChannelsQuantumChannelJs.QuantumChannel);

Receiver.sendBasisToChannel(_ChannelsQuantumChannelJs.QuantumChannel);
//Attacker.interceptReceiverBasisFromChannel(QuantumChannel);
Sender.readBasisFromChannel(_ChannelsQuantumChannelJs.QuantumChannel);

Receiver.generateSharedKey();
Sender.generateSharedKey();

Sender.decide();
Receiver.decide();

Sender.sendDecisionToChannel(_ChannelsQuantumChannelJs.QuantumChannel);
Receiver.readDecisionFromChannel(_ChannelsQuantumChannelJs.QuantumChannel);

Receiver.sendDecisionToChannel(_ChannelsQuantumChannelJs.QuantumChannel);
Sender.readDecisionFromChannel(_ChannelsQuantumChannelJs.QuantumChannel);

},{"./Actors/Attacker.js":89,"./Actors/Receiver.js":91,"./Actors/Sender.js":92,"./Channels/QuantumChannel.js":93,"./Config/AppConfig":94}]},{},[98])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL2xpYi9iYWJlbC9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmFycmF5LW1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmFzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLXRvLWpzb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24td2Vhay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY3R4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5kZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmVudW0ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZm9yLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mdy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmtleW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vd24ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucmVwbGFjZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcGFkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcmVwZWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50YXNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50aHJvd3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudW5zY29wZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQud2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM1LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkub2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuaXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmF3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLXNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcucmVnZXhwLmVzY2FwZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcuYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5pbW1lZGlhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudGltZXJzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvcG9seWZpbGwuanMiLCJDOi9Vc2Vycy9qYWtlL0Rlc2t0b3AvZGV2L3FrQ3J5cHRvSlMvc3JjL0FjdG9ycy9BdHRhY2tlci5qcyIsIkM6L1VzZXJzL2pha2UvRGVza3RvcC9kZXYvcWtDcnlwdG9KUy9zcmMvQWN0b3JzL0Jhc2VDb21tdW5pY2F0b3IuanMiLCJDOi9Vc2Vycy9qYWtlL0Rlc2t0b3AvZGV2L3FrQ3J5cHRvSlMvc3JjL0FjdG9ycy9SZWNlaXZlci5qcyIsIkM6L1VzZXJzL2pha2UvRGVza3RvcC9kZXYvcWtDcnlwdG9KUy9zcmMvQWN0b3JzL1NlbmRlci5qcyIsIkM6L1VzZXJzL2pha2UvRGVza3RvcC9kZXYvcWtDcnlwdG9KUy9zcmMvQ2hhbm5lbHMvUXVhbnR1bUNoYW5uZWwuanMiLCJDOi9Vc2Vycy9qYWtlL0Rlc2t0b3AvZGV2L3FrQ3J5cHRvSlMvc3JjL0NvbmZpZy9BcHBDb25maWcuanMiLCJDOi9Vc2Vycy9qYWtlL0Rlc2t0b3AvZGV2L3FrQ3J5cHRvSlMvc3JjL0NvbnN0YW50cy9CYXNlcy5qcyIsIkM6L1VzZXJzL2pha2UvRGVza3RvcC9kZXYvcWtDcnlwdG9KUy9zcmMvQ29uc3RhbnRzL1BvbGFyaXphdGlvbnMuanMiLCJDOi9Vc2Vycy9qYWtlL0Rlc2t0b3AvZGV2L3FrQ3J5cHRvSlMvc3JjL01lc3NhZ2VzL1Bob3Rvbi5qcyIsIkM6L1VzZXJzL2pha2UvRGVza3RvcC9kZXYvcWtDcnlwdG9KUy9zcmMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QVEsQ0FBQyx5QkFBeUIsMkJBZDFCLGNBQWMsQ0FjNEIsQ0FBQzs7QUFFbkQsTUFBTSxDQUFDLGtCQUFrQiwyQkFoQmpCLGNBQWMsQ0FnQm1CLENBQUM7O0FBRTFDLFFBQVEsQ0FBQyxvQkFBb0IsMkJBbEJyQixjQUFjLENBa0J1QixDQUFDOztBQUU5QyxRQUFRLENBQUMsa0JBQWtCLDJCQXBCbkIsY0FBYyxDQW9CcUIsQ0FBQzs7QUFFNUMsTUFBTSxDQUFDLG9CQUFvQiwyQkF0Qm5CLGNBQWMsQ0FzQnFCLENBQUM7O0FBRTVDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUUzQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEIsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVsQixNQUFNLENBQUMscUJBQXFCLDJCQTlCcEIsY0FBYyxDQThCc0IsQ0FBQztBQUM3QyxRQUFRLENBQUMsdUJBQXVCLDJCQS9CeEIsY0FBYyxDQStCMEIsQ0FBQzs7QUFFakQsUUFBUSxDQUFDLHFCQUFxQiwyQkFqQ3RCLGNBQWMsQ0FpQ3dCLENBQUM7QUFDL0MsTUFBTSxDQUFDLHVCQUF1QiwyQkFsQ3RCLGNBQWMsQ0FrQ3dCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL3NoaW1cIik7XG5cbnJlcXVpcmUoXCJyZWdlbmVyYXRvci9ydW50aW1lXCIpO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlOyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2ZcclxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcclxuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KCR0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gJC50b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxyXG4gICAgICAsIHZhbHVlO1xyXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xyXG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XHJcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XHJcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXg7XHJcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XHJcbiAgfTtcclxufTsiLCIvLyAwIC0+IEFycmF5I2ZvckVhY2hcclxuLy8gMSAtPiBBcnJheSNtYXBcclxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcclxuLy8gMyAtPiBBcnJheSNzb21lXHJcbi8vIDQgLT4gQXJyYXkjZXZlcnlcclxuLy8gNSAtPiBBcnJheSNmaW5kXHJcbi8vIDYgLT4gQXJyYXkjZmluZEluZGV4XHJcbnZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ID0gcmVxdWlyZSgnLi8kLmN0eCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRZUEUpe1xyXG4gIHZhciBJU19NQVAgICAgICAgID0gVFlQRSA9PSAxXHJcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcclxuICAgICwgSVNfU09NRSAgICAgICA9IFRZUEUgPT0gM1xyXG4gICAgLCBJU19FVkVSWSAgICAgID0gVFlQRSA9PSA0XHJcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcclxuICAgICwgTk9fSE9MRVMgICAgICA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xyXG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCgkdGhpcykpXHJcbiAgICAgICwgc2VsZiAgID0gJC5FUzVPYmplY3QoTylcclxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcclxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBJU19NQVAgPyBBcnJheShsZW5ndGgpIDogSVNfRklMVEVSID8gW10gOiB1bmRlZmluZWRcclxuICAgICAgLCB2YWwsIHJlcztcclxuICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZihUWVBFKXtcclxuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xyXG4gIH07XHJcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XHJcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XHJcbn1cclxuYXNzZXJ0LmRlZiA9ICQuYXNzZXJ0RGVmaW5lZDtcclxuYXNzZXJ0LmZuID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzRnVuY3Rpb24oaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQub2JqID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQuaW5zdCA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XHJcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcclxuICByZXR1cm4gaXQ7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKTtcclxuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXtcclxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gJC5FUzVPYmplY3QoYXJndW1lbnRzW2krK10pXHJcbiAgICAgICwga2V5cyAgID0gZW51bUtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFRBRyAgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXHJcbiAgLCB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xyXG5mdW5jdGlvbiBjb2YoaXQpe1xyXG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XHJcbn1cclxuY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XHJcbiAgdmFyIE8sIFQ7XHJcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xyXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVCA6IGNvZihPKTtcclxufTtcclxuY29mLnNldCA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xyXG4gIGlmKGl0ICYmICEkLmhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkkLmhpZGUoaXQsIFRBRywgdGFnKTtcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBjb2Y7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIHNhZmUgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcclxuICAsIGFzc2VydCAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXHJcbiAgLCBmb3JPZiAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxyXG4gICwgc3RlcCAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpLnN0ZXBcclxuICAsIGhhcyAgICAgID0gJC5oYXNcclxuICAsIHNldCAgICAgID0gJC5zZXRcclxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxyXG4gICwgaGlkZSAgICAgPSAkLmhpZGVcclxuICAsIGlzRnJvemVuID0gT2JqZWN0LmlzRnJvemVuIHx8ICQuY29yZS5PYmplY3QuaXNGcm96ZW5cclxuICAsIElEICAgICAgID0gc2FmZSgnaWQnKVxyXG4gICwgTzEgICAgICAgPSBzYWZlKCdPMScpXHJcbiAgLCBMQVNUICAgICA9IHNhZmUoJ2xhc3QnKVxyXG4gICwgRklSU1QgICAgPSBzYWZlKCdmaXJzdCcpXHJcbiAgLCBJVEVSICAgICA9IHNhZmUoJ2l0ZXInKVxyXG4gICwgU0laRSAgICAgPSAkLkRFU0MgPyBzYWZlKCdzaXplJykgOiAnc2l6ZSdcclxuICAsIGlkICAgICAgID0gMDtcclxuXHJcbmZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XHJcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxyXG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XHJcbiAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcclxuICBpZihpc0Zyb3plbihpdCkpcmV0dXJuICdGJztcclxuICBpZighaGFzKGl0LCBJRCkpe1xyXG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcclxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcclxuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxyXG4gICAgaGlkZShpdCwgSUQsICsraWQpO1xyXG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcclxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XHJcbiAgLy8gZmFzdCBjYXNlXHJcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcclxuICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcclxuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcclxuICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24oTkFNRSwgSVNfTUFQLCBBRERFUil7XHJcbiAgICBmdW5jdGlvbiBDKCl7XHJcbiAgICAgIHZhciB0aGF0ICAgICA9IGFzc2VydC5pbnN0KHRoaXMsIEMsIE5BTUUpXHJcbiAgICAgICAgLCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgc2V0KHRoYXQsIE8xLCAkLmNyZWF0ZShudWxsKSk7XHJcbiAgICAgIHNldCh0aGF0LCBTSVpFLCAwKTtcclxuICAgICAgc2V0KHRoYXQsIExBU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgIH1cclxuICAgICQubWl4KEMucHJvdG90eXBlLCB7XHJcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcclxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XHJcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGF0W1NJWkVdID0gMDtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xyXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XHJcbiAgICAgICAgaWYoZW50cnkpe1xyXG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXHJcbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XHJcbiAgICAgICAgICBkZWxldGUgdGhhdFtPMV1bZW50cnkuaV07XHJcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcclxuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcclxuICAgICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcclxuICAgICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XHJcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XHJcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcclxuICAgICAgICAgICwgZW50cnk7XHJcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzW0ZJUlNUXSl7XHJcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xyXG4gICAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XHJcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZigkLkRFU0MpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBhc3NlcnQuZGVmKHRoaXNbU0laRV0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcclxuICAgICAgLCBwcmV2LCBpbmRleDtcclxuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxyXG4gICAgaWYoZW50cnkpe1xyXG4gICAgICBlbnRyeS52ID0gdmFsdWU7XHJcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XHJcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XHJcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxyXG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxyXG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XHJcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcclxuICAgICAgfTtcclxuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XHJcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XHJcbiAgICAgIHRoYXRbU0laRV0rKztcclxuICAgICAgLy8gYWRkIHRvIGluZGV4XHJcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBnZXRFbnRyeTogZ2V0RW50cnksXHJcbiAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXHJcbiAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxyXG4gIHNldEl0ZXI6IGZ1bmN0aW9uKEMsIE5BTUUsIElTX01BUCl7XHJcbiAgICByZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XHJcbiAgICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IGtpbmR9KTtcclxuICAgIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcclxuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxyXG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XHJcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cclxuICAgICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxyXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xyXG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xyXG4gICAgICByZXR1cm4gc3RlcCgwLCBbZW50cnkuaywgZW50cnkudl0pO1xyXG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcclxuICB9XHJcbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxyXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xyXG4gICRkZWYoJGRlZi5QLCBOQU1FLCB7XHJcbiAgICB0b0pTT046IGZ1bmN0aW9uIHRvSlNPTigpe1xyXG4gICAgICB2YXIgYXJyID0gW107XHJcbiAgICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9KTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgc2FmZSAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcclxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgZm9yT2YgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBfaGFzICAgICAgPSAkLmhhc1xyXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxyXG4gICwgaGlkZSAgICAgID0gJC5oaWRlXHJcbiAgLCBpc0Zyb3plbiAgPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgaWQgICAgICAgID0gMFxyXG4gICwgSUQgICAgICAgID0gc2FmZSgnaWQnKVxyXG4gICwgV0VBSyAgICAgID0gc2FmZSgnd2VhaycpXHJcbiAgLCBMRUFLICAgICAgPSBzYWZlKCdsZWFrJylcclxuICAsIG1ldGhvZCAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcclxuICAsIGZpbmQgICAgICA9IG1ldGhvZCg1KVxyXG4gICwgZmluZEluZGV4ID0gbWV0aG9kKDYpO1xyXG5mdW5jdGlvbiBmaW5kRnJvemVuKHN0b3JlLCBrZXkpe1xyXG4gIHJldHVybiBmaW5kKHN0b3JlLmFycmF5LCBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcclxuICB9KTtcclxufVxyXG4vLyBmYWxsYmFjayBmb3IgZnJvemVuIGtleXNcclxuZnVuY3Rpb24gbGVha1N0b3JlKHRoYXQpe1xyXG4gIHJldHVybiB0aGF0W0xFQUtdIHx8IGhpZGUodGhhdCwgTEVBSywge1xyXG4gICAgYXJyYXk6IFtdLFxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KXJldHVybiBlbnRyeVsxXTtcclxuICAgIH0sXHJcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHJldHVybiAhIWZpbmRGcm96ZW4odGhpcywga2V5KTtcclxuICAgIH0sXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KWVudHJ5WzFdID0gdmFsdWU7XHJcbiAgICAgIGVsc2UgdGhpcy5hcnJheS5wdXNoKFtrZXksIHZhbHVlXSk7XHJcbiAgICB9LFxyXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBpbmRleCA9IGZpbmRJbmRleCh0aGlzLmFycmF5LCBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZih+aW5kZXgpdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICByZXR1cm4gISF+aW5kZXg7XHJcbiAgICB9XHJcbiAgfSlbTEVBS107XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcclxuICAgIGZ1bmN0aW9uIEMoKXtcclxuICAgICAgJC5zZXQoYXNzZXJ0Lmluc3QodGhpcywgQywgTkFNRSksIElELCBpZCsrKTtcclxuICAgICAgdmFyIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhpc1tBRERFUl0sIHRoaXMpO1xyXG4gICAgfVxyXG4gICAgJC5taXgoQy5wcm90b3R5cGUsIHtcclxuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcclxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xyXG4gICAgICAgIHJldHVybiBfaGFzKGtleSwgV0VBSykgJiYgX2hhcyhrZXlbV0VBS10sIHRoaXNbSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbSURdXTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xyXG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XHJcbiAgICAgICAgcmV0dXJuIF9oYXMoa2V5LCBXRUFLKSAmJiBfaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIGlmKGlzRnJvemVuKGFzc2VydC5vYmooa2V5KSkpe1xyXG4gICAgICBsZWFrU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgX2hhcyhrZXksIFdFQUspIHx8IGhpZGUoa2V5LCBXRUFLLCB7fSk7XHJcbiAgICAgIGtleVtXRUFLXVt0aGF0W0lEXV0gPSB2YWx1ZTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBsZWFrU3RvcmU6IGxlYWtTdG9yZSxcclxuICBXRUFLOiBXRUFLLFxyXG4gIElEOiBJRFxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBCVUdHWSA9IHJlcXVpcmUoJy4vJC5pdGVyJykuQlVHR1lcclxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBzcGVjaWVzID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxyXG4gICwgYXNzZXJ0SW5zdGFuY2UgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuaW5zdDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xyXG4gIHZhciBCYXNlICA9ICQuZ1tOQU1FXVxyXG4gICAgLCBDICAgICA9IEJhc2VcclxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXHJcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxyXG4gICAgLCBPICAgICA9IHt9O1xyXG4gIGZ1bmN0aW9uIGZpeE1ldGhvZChLRVksIENIQUlOKXtcclxuICAgIHZhciBtZXRob2QgPSBwcm90b1tLRVldO1xyXG4gICAgaWYoJC5GVylwcm90b1tLRVldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHZhciByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpO1xyXG4gICAgICByZXR1cm4gQ0hBSU4gPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgfTtcclxuICB9XHJcbiAgaWYoISQuaXNGdW5jdGlvbihDKSB8fCAhKElTX1dFQUsgfHwgIUJVR0dZICYmIHByb3RvLmZvckVhY2ggJiYgcHJvdG8uZW50cmllcykpe1xyXG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3IoTkFNRSwgSVNfTUFQLCBBRERFUik7XHJcbiAgICAkLm1peChDLnByb3RvdHlwZSwgbWV0aG9kcyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBpbnN0ICA9IG5ldyBDXHJcbiAgICAgICwgY2hhaW4gPSBpbnN0W0FEREVSXShJU19XRUFLID8ge30gOiAtMCwgMSlcclxuICAgICAgLCBidWdneVplcm87XHJcbiAgICAvLyB3cmFwIGZvciBpbml0IGNvbGxlY3Rpb25zIGZyb20gaXRlcmFibGVcclxuICAgIGlmKCFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgbmV3IEMoaXRlcik7IH0pKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcclxuICAgICAgQyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgdmFyIHRoYXQgICAgID0gbmV3IEJhc2VcclxuICAgICAgICAgICwgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgICAgICByZXR1cm4gdGhhdDtcclxuICAgICAgfTtcclxuICAgICAgQy5wcm90b3R5cGUgPSBwcm90bztcclxuICAgICAgaWYoJC5GVylwcm90by5jb25zdHJ1Y3RvciA9IEM7XHJcbiAgICB9XHJcbiAgICBJU19XRUFLIHx8IGluc3QuZm9yRWFjaChmdW5jdGlvbih2YWwsIGtleSl7XHJcbiAgICAgIGJ1Z2d5WmVybyA9IDEgLyBrZXkgPT09IC1JbmZpbml0eTtcclxuICAgIH0pO1xyXG4gICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXHJcbiAgICBpZihidWdneVplcm8pe1xyXG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xyXG4gICAgICBmaXhNZXRob2QoJ2hhcycpO1xyXG4gICAgICBJU19NQVAgJiYgZml4TWV0aG9kKCdnZXQnKTtcclxuICAgIH1cclxuICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xyXG4gICAgaWYoYnVnZ3laZXJvIHx8IGNoYWluICE9PSBpbnN0KWZpeE1ldGhvZChBRERFUiwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICByZXF1aXJlKCcuLyQuY29mJykuc2V0KEMsIE5BTUUpO1xyXG5cclxuICBPW05BTUVdID0gQztcclxuICAkZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqIChDICE9IEJhc2UpLCBPKTtcclxuICBzcGVjaWVzKEMpO1xyXG4gIHNwZWNpZXMoJC5jb3JlW05BTUVdKTsgLy8gZm9yIHdyYXBwZXJcclxuXHJcbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldEl0ZXIoQywgTkFNRSwgSVNfTUFQKTtcclxuXHJcbiAgcmV0dXJuIEM7XHJcbn07IiwiLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXHJcbnZhciBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcclxuICBhc3NlcnRGdW5jdGlvbihmbik7XHJcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xyXG4gIHN3aXRjaChsZW5ndGgpe1xyXG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xyXG4gICAgfTtcclxuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcclxuICAgIH07XHJcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XHJcbiAgICB9O1xyXG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn07IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgZ2xvYmFsICAgICA9ICQuZ1xyXG4gICwgY29yZSAgICAgICA9ICQuY29yZVxyXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvbjtcclxuZnVuY3Rpb24gY3R4KGZuLCB0aGF0KXtcclxuICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gIH07XHJcbn1cclxuZ2xvYmFsLmNvcmUgPSBjb3JlO1xyXG4vLyB0eXBlIGJpdG1hcFxyXG4kZGVmLkYgPSAxOyAgLy8gZm9yY2VkXHJcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcclxuJGRlZi5TID0gNDsgIC8vIHN0YXRpY1xyXG4kZGVmLlAgPSA4OyAgLy8gcHJvdG9cclxuJGRlZi5CID0gMTY7IC8vIGJpbmRcclxuJGRlZi5XID0gMzI7IC8vIHdyYXBcclxuZnVuY3Rpb24gJGRlZih0eXBlLCBuYW1lLCBzb3VyY2Upe1xyXG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcclxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgJGRlZi5HXHJcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiB0eXBlICYgJGRlZi5TXHJcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KS5wcm90b3R5cGVcclxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xyXG4gIGlmKGlzR2xvYmFsKXNvdXJjZSA9IG5hbWU7XHJcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xyXG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXHJcbiAgICBvd24gPSAhKHR5cGUgJiAkZGVmLkYpICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xyXG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcclxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XHJcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxyXG4gICAgaWYodHlwZSAmICRkZWYuQiAmJiBvd24pZXhwID0gY3R4KG91dCwgZ2xvYmFsKTtcclxuICAgIGVsc2UgZXhwID0gdHlwZSAmICRkZWYuUCAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4dGVuZCBnbG9iYWxcclxuICAgIGlmKHRhcmdldCAmJiAhb3duKXtcclxuICAgICAgaWYoaXNHbG9iYWwpdGFyZ2V0W2tleV0gPSBvdXQ7XHJcbiAgICAgIGVsc2UgZGVsZXRlIHRhcmdldFtrZXldICYmICQuaGlkZSh0YXJnZXQsIGtleSwgb3V0KTtcclxuICAgIH1cclxuICAgIC8vIGV4cG9ydFxyXG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCkkLmhpZGUoZXhwb3J0cywga2V5LCBleHApO1xyXG4gIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9ICRkZWY7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGRvY3VtZW50ID0gJC5nLmRvY3VtZW50XHJcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcclxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcclxuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xyXG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xyXG4gIHZhciBrZXlzICAgICAgID0gJC5nZXRLZXlzKGl0KVxyXG4gICAgLCBnZXREZXNjICAgID0gJC5nZXREZXNjXHJcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XHJcbiAgaWYoZ2V0U3ltYm9scykkLmVhY2guY2FsbChnZXRTeW1ib2xzKGl0KSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIGlmKGdldERlc2MoaXQsIGtleSkuZW51bWVyYWJsZSlrZXlzLnB1c2goa2V5KTtcclxuICB9KTtcclxuICByZXR1cm4ga2V5cztcclxufTsiLCJ2YXIgY3R4ICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgZ2V0ICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuZ2V0XHJcbiAgLCBjYWxsID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XHJcbiAgdmFyIGl0ZXJhdG9yID0gZ2V0KGl0ZXJhYmxlKVxyXG4gICAgLCBmICAgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxyXG4gICAgLCBzdGVwO1xyXG4gIHdoaWxlKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSl7XHJcbiAgICBpZihjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKSA9PT0gZmFsc2Upe1xyXG4gICAgICByZXR1cm4gY2FsbC5jbG9zZShpdGVyYXRvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XHJcbiAgJC5GVyAgID0gdHJ1ZTtcclxuICAkLnBhdGggPSAkLmc7XHJcbiAgcmV0dXJuICQ7XHJcbn07IiwiLy8gRmFzdCBhcHBseVxyXG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XHJcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xyXG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XHJcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcclxuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcclxuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcclxuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcclxuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcclxuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XHJcbn07IiwidmFyIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmo7XHJcbmZ1bmN0aW9uIGNsb3NlKGl0ZXJhdG9yKXtcclxuICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xyXG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFzc2VydE9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xyXG59XHJcbmZ1bmN0aW9uIGNhbGwoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYXNzZXJ0T2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZShpdGVyYXRvcik7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxufVxyXG5jYWxsLmNsb3NlID0gY2xvc2U7XHJcbm1vZHVsZS5leHBvcnRzID0gY2FsbDsiLCJ2YXIgJGRlZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkaXRlciAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQGl0ZXJhdG9yJ1xyXG4gICwgS0VZUyAgICAgICAgICAgID0gJ2tleXMnXHJcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJ1xyXG4gICwgSXRlcmF0b3JzICAgICAgID0gJGl0ZXIuSXRlcmF0b3JzO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFKXtcclxuICAkaXRlci5jcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGhvZChraW5kKXtcclxuICAgIGZ1bmN0aW9uICQkKHRoYXQpe1xyXG4gICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoYXQsIGtpbmQpO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoKGtpbmQpe1xyXG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcclxuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xyXG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gJCQodGhpcyk7IH07XHJcbiAgfVxyXG4gIHZhciBUQUcgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xyXG4gICAgLCBwcm90byAgICA9IEJhc2UucHJvdG90eXBlXHJcbiAgICAsIF9uYXRpdmUgID0gcHJvdG9bU1lNQk9MX0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxyXG4gICAgLCBfZGVmYXVsdCA9IF9uYXRpdmUgfHwgY3JlYXRlTWV0aG9kKERFRkFVTFQpXHJcbiAgICAsIG1ldGhvZHMsIGtleTtcclxuICAvLyBGaXggbmF0aXZlXHJcbiAgaWYoX25hdGl2ZSl7XHJcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSAkLmdldFByb3RvKF9kZWZhdWx0LmNhbGwobmV3IEJhc2UpKTtcclxuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgIGNvZi5zZXQoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XHJcbiAgICAvLyBGRiBmaXhcclxuICAgIGlmKCQuRlcgJiYgJC5oYXMocHJvdG8sIEZGX0lURVJBVE9SKSkkaXRlci5zZXQoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XHJcbiAgfVxyXG4gIC8vIERlZmluZSBpdGVyYXRvclxyXG4gIGlmKCQuRlcpJGl0ZXIuc2V0KHByb3RvLCBfZGVmYXVsdCk7XHJcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxyXG4gIEl0ZXJhdG9yc1tOQU1FXSA9IF9kZWZhdWx0O1xyXG4gIEl0ZXJhdG9yc1tUQUddICA9ICQudGhhdDtcclxuICBpZihERUZBVUxUKXtcclxuICAgIG1ldGhvZHMgPSB7XHJcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgICAgICAgID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoS0VZUyksXHJcbiAgICAgIHZhbHVlczogIERFRkFVTFQgPT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoVkFMVUVTKSxcclxuICAgICAgZW50cmllczogREVGQVVMVCAhPSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZCgnZW50cmllcycpXHJcbiAgICB9O1xyXG4gICAgaWYoRk9SQ0UpZm9yKGtleSBpbiBtZXRob2RzKXtcclxuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKSQuaGlkZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xyXG4gICAgfSBlbHNlICRkZWYoJGRlZi5QICsgJGRlZi5GICogJGl0ZXIuQlVHR1ksIE5BTUUsIG1ldGhvZHMpO1xyXG4gIH1cclxufTsiLCJ2YXIgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXHJcbiAgLCBTQUZFX0NMT1NJTkcgICAgPSBmYWxzZTtcclxudHJ5IHtcclxuICB2YXIgcml0ZXIgPSBbN11bU1lNQk9MX0lURVJBVE9SXSgpO1xyXG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XHJcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XHJcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcclxuICBpZighU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcclxuICB2YXIgc2FmZSA9IGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICB2YXIgYXJyICA9IFs3XVxyXG4gICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpO1xyXG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XHJcbiAgICBhcnJbU1lNQk9MX0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xyXG4gICAgZXhlYyhhcnIpO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICByZXR1cm4gc2FmZTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqXHJcbiAgLCBTWU1CT0xfSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgRkZfSVRFUkFUT1IgICAgICAgPSAnQEBpdGVyYXRvcidcclxuICAsIEl0ZXJhdG9ycyAgICAgICAgID0ge31cclxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XHJcbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXHJcbnNldEl0ZXJhdG9yKEl0ZXJhdG9yUHJvdG90eXBlLCAkLnRoYXQpO1xyXG5mdW5jdGlvbiBzZXRJdGVyYXRvcihPLCB2YWx1ZSl7XHJcbiAgJC5oaWRlKE8sIFNZTUJPTF9JVEVSQVRPUiwgdmFsdWUpO1xyXG4gIC8vIEFkZCBpdGVyYXRvciBmb3IgRkYgaXRlcmF0b3IgcHJvdG9jb2xcclxuICBpZihGRl9JVEVSQVRPUiBpbiBbXSkkLmhpZGUoTywgRkZfSVRFUkFUT1IsIHZhbHVlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxyXG4gIEJVR0dZOiAna2V5cycgaW4gW10gJiYgISgnbmV4dCcgaW4gW10ua2V5cygpKSxcclxuICBJdGVyYXRvcnM6IEl0ZXJhdG9ycyxcclxuICBzdGVwOiBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XHJcbiAgICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxuICB9LFxyXG4gIGlzOiBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxyXG4gICAgICAsIFN5bWJvbCA9ICQuZy5TeW1ib2xcclxuICAgICAgLCBTWU0gICAgPSBTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SO1xyXG4gICAgcmV0dXJuIFNZTSBpbiBPIHx8IFNZTUJPTF9JVEVSQVRPUiBpbiBPIHx8ICQuaGFzKEl0ZXJhdG9ycywgY29mLmNsYXNzb2YoTykpO1xyXG4gIH0sXHJcbiAgZ2V0OiBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgU3ltYm9sICA9ICQuZy5TeW1ib2xcclxuICAgICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUl1cclxuICAgICAgLCBnZXRJdGVyID0gZXh0IHx8IGl0W1NZTUJPTF9JVEVSQVRPUl0gfHwgSXRlcmF0b3JzW2NvZi5jbGFzc29mKGl0KV07XHJcbiAgICByZXR1cm4gYXNzZXJ0T2JqZWN0KGdldEl0ZXIuY2FsbChpdCkpO1xyXG4gIH0sXHJcbiAgc2V0OiBzZXRJdGVyYXRvcixcclxuICBjcmVhdGU6IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0LCBwcm90byl7XHJcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShwcm90byB8fCBJdGVyYXRvclByb3RvdHlwZSwge25leHQ6ICQuZGVzYygxLCBuZXh0KX0pO1xyXG4gICAgY29mLnNldChDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcclxuICB9XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKVxyXG4gICwgY29yZSAgID0ge31cclxuICAsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XHJcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5XHJcbiAgLCBjZWlsICA9IE1hdGguY2VpbFxyXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXHJcbiAgLCBtYXggICA9IE1hdGgubWF4XHJcbiAgLCBtaW4gICA9IE1hdGgubWluO1xyXG4vLyBUaGUgZW5naW5lIHdvcmtzIGZpbmUgd2l0aCBkZXNjcmlwdG9ycz8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eS5cclxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gMjsgfX0pLmEgPT0gMjtcclxuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbn0oKTtcclxudmFyIGhpZGUgPSBjcmVhdGVEZWZpbmVyKDEpO1xyXG4vLyA3LjEuNCBUb0ludGVnZXJcclxuZnVuY3Rpb24gdG9JbnRlZ2VyKGl0KXtcclxuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxufVxyXG5mdW5jdGlvbiBkZXNjKGJpdG1hcCwgdmFsdWUpe1xyXG4gIHJldHVybiB7XHJcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXHJcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXHJcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXHJcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXHJcbiAgfTtcclxufVxyXG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xyXG4gIHJldHVybiBvYmplY3Q7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlRGVmaW5lcihiaXRtYXApe1xyXG4gIHJldHVybiBERVNDID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGRlc2MoYml0bWFwLCB2YWx1ZSkpO1xyXG4gIH0gOiBzaW1wbGVTZXQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KGl0KXtcclxuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNGdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydERlZmluZWQoaXQpe1xyXG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcblxyXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xyXG4gIGc6IGdsb2JhbCxcclxuICBjb3JlOiBjb3JlLFxyXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcbiAgLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxyXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXHJcbiAgaXQ6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdDtcclxuICB9LFxyXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9LFxyXG4gIC8vIDcuMS40IFRvSW50ZWdlclxyXG4gIHRvSW50ZWdlcjogdG9JbnRlZ2VyLFxyXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxyXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG4gIH0sXHJcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XHJcbiAgICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XHJcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcclxuICB9LFxyXG4gIGhhczogZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcclxuICB9LFxyXG4gIGNyZWF0ZTogICAgIE9iamVjdC5jcmVhdGUsXHJcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxyXG4gIERFU0M6ICAgICAgIERFU0MsXHJcbiAgZGVzYzogICAgICAgZGVzYyxcclxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxyXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxyXG4gIHNldERlc2NzOiAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxyXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxyXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIGdldFN5bWJvbHM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXHJcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcclxuICAvLyBEdW1teSwgZml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGluIGVzNSBtb2R1bGVcclxuICBFUzVPYmplY3Q6IE9iamVjdCxcclxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcclxuICB9LFxyXG4gIGhpZGU6IGhpZGUsXHJcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxyXG4gIHNldDogZ2xvYmFsLlN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGUsXHJcbiAgbWl4OiBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgICBmb3IodmFyIGtleSBpbiBzcmMpaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gICAgcmV0dXJuIHRhcmdldDtcclxuICB9LFxyXG4gIGVhY2g6IFtdLmZvckVhY2hcclxufSk7XHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXHJcbmlmKHR5cGVvZiBfX2UgIT0gJ3VuZGVmaW5lZCcpX19lID0gY29yZTtcclxuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGVsKXtcclxuICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXHJcbiAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59OyIsInZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvd25LZXlzKGl0KXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHZhciBrZXlzICAgICAgID0gJC5nZXROYW1lcyhpdClcclxuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9scztcclxuICByZXR1cm4gZ2V0U3ltYm9scyA/IGtleXMuY29uY2F0KGdldFN5bWJvbHMoaXQpKSA6IGtleXM7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGludm9rZSA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oLyogLi4ucGFyZ3MgKi8pe1xyXG4gIHZhciBmbiAgICAgPSBhc3NlcnRGdW5jdGlvbih0aGlzKVxyXG4gICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBfICAgICAgPSAkLnBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChwYXJnc1tpXSA9IGFyZ3VtZW50c1tpKytdKSA9PT0gXylob2xkZXIgPSB0cnVlO1xyXG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgIHZhciB0aGF0ICAgID0gdGhpc1xyXG4gICAgICAsIF9sZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgaiA9IDAsIGsgPSAwLCBhcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBwYXJncywgdGhhdCk7XHJcbiAgICBhcmdzID0gcGFyZ3Muc2xpY2UoKTtcclxuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGo7IGorKylpZihhcmdzW2pdID09PSBfKWFyZ3Nbal0gPSBhcmd1bWVudHNbaysrXTtcclxuICAgIHdoaWxlKF9sZW5ndGggPiBrKWFyZ3MucHVzaChhcmd1bWVudHNbaysrXSk7XHJcbiAgICByZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyZWdFeHAsIHJlcGxhY2UsIGlzU3RhdGljKXtcclxuICB2YXIgcmVwbGFjZXIgPSByZXBsYWNlID09PSBPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcclxuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xyXG4gIH0gOiByZXBsYWNlO1xyXG4gIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xyXG4gIH07XHJcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXHJcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpO1xyXG5mdW5jdGlvbiBjaGVjayhPLCBwcm90byl7XHJcbiAgYXNzZXJ0Lm9iaihPKTtcclxuICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgJC5pc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCAkLmdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XHJcbiAgICAgICAgICBzZXQoe30sIFtdKTtcclxuICAgICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xyXG4gICAgICAgICAgY2hlY2soTywgcHJvdG8pO1xyXG4gICAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcclxuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcclxuICAgICAgICAgIHJldHVybiBPO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0oKVxyXG4gICAgOiB1bmRlZmluZWQpLFxyXG4gIGNoZWNrOiBjaGVja1xyXG59OyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFNQRUNJRVMgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDKXtcclxuICBpZigkLkRFU0MgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6ICQudGhhdFxyXG4gIH0pO1xyXG59OyIsIi8vIHRydWUgIC0+IFN0cmluZyNhdFxyXG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xyXG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xyXG4gICAgdmFyIHMgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoYXQpKVxyXG4gICAgICAsIGkgPSAkLnRvSW50ZWdlcihwb3MpXHJcbiAgICAgICwgbCA9IHMubGVuZ3RoXHJcbiAgICAgICwgYSwgYjtcclxuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XHJcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbFxyXG4gICAgICB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcclxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxyXG4gICAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xyXG4gIH07XHJcbn07IiwiLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46c3RyaW5nX3BhZGRpbmdcclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCByZXBlYXQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0aGF0LCBtaW5MZW5ndGgsIGZpbGxDaGFyLCBsZWZ0KXtcclxuICAvLyAxLiBMZXQgTyBiZSBDaGVja09iamVjdENvZXJjaWJsZSh0aGlzIHZhbHVlKS5cclxuICAvLyAyLiBMZXQgUyBiZSBUb1N0cmluZyhPKS5cclxuICB2YXIgUyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpO1xyXG4gIC8vIDQuIElmIGludE1pbkxlbmd0aCBpcyB1bmRlZmluZWQsIHJldHVybiBTLlxyXG4gIGlmKG1pbkxlbmd0aCA9PT0gdW5kZWZpbmVkKXJldHVybiBTO1xyXG4gIC8vIDQuIExldCBpbnRNaW5MZW5ndGggYmUgVG9JbnRlZ2VyKG1pbkxlbmd0aCkuXHJcbiAgdmFyIGludE1pbkxlbmd0aCA9ICQudG9JbnRlZ2VyKG1pbkxlbmd0aCk7XHJcbiAgLy8gNS4gTGV0IGZpbGxMZW4gYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIFMgbWludXMgaW50TWluTGVuZ3RoLlxyXG4gIHZhciBmaWxsTGVuID0gaW50TWluTGVuZ3RoIC0gUy5sZW5ndGg7XHJcbiAgLy8gNi4gSWYgZmlsbExlbiA8IDAsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cclxuICAvLyA3LiBJZiBmaWxsTGVuIGlzICviiJ4sIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cclxuICBpZihmaWxsTGVuIDwgMCB8fCBmaWxsTGVuID09PSBJbmZpbml0eSl7XHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQ2Fubm90IHNhdGlzZnkgc3RyaW5nIGxlbmd0aCAnICsgbWluTGVuZ3RoICsgJyBmb3Igc3RyaW5nOiAnICsgUyk7XHJcbiAgfVxyXG4gIC8vIDguIExldCBzRmlsbFN0ciBiZSB0aGUgc3RyaW5nIHJlcHJlc2VudGVkIGJ5IGZpbGxTdHIuXHJcbiAgLy8gOS4gSWYgc0ZpbGxTdHIgaXMgdW5kZWZpbmVkLCBsZXQgc0ZpbGxTdHIgYmUgYSBzcGFjZSBjaGFyYWN0ZXIuXHJcbiAgdmFyIHNGaWxsU3RyID0gZmlsbENoYXIgPT09IHVuZGVmaW5lZCA/ICcgJyA6IFN0cmluZyhmaWxsQ2hhcik7XHJcbiAgLy8gMTAuIExldCBzRmlsbFZhbCBiZSBhIFN0cmluZyBtYWRlIG9mIHNGaWxsU3RyLCByZXBlYXRlZCB1bnRpbCBmaWxsTGVuIGlzIG1ldC5cclxuICB2YXIgc0ZpbGxWYWwgPSByZXBlYXQuY2FsbChzRmlsbFN0ciwgTWF0aC5jZWlsKGZpbGxMZW4gLyBzRmlsbFN0ci5sZW5ndGgpKTtcclxuICAvLyB0cnVuY2F0ZSBpZiB3ZSBvdmVyZmxvd2VkXHJcbiAgaWYoc0ZpbGxWYWwubGVuZ3RoID4gZmlsbExlbilzRmlsbFZhbCA9IGxlZnRcclxuICAgID8gc0ZpbGxWYWwuc2xpY2Uoc0ZpbGxWYWwubGVuZ3RoIC0gZmlsbExlbilcclxuICAgIDogc0ZpbGxWYWwuc2xpY2UoMCwgZmlsbExlbik7XHJcbiAgLy8gMTEuIFJldHVybiBhIHN0cmluZyBtYWRlIGZyb20gc0ZpbGxWYWwsIGZvbGxvd2VkIGJ5IFMuXHJcbiAgLy8gMTEuIFJldHVybiBhIFN0cmluZyBtYWRlIGZyb20gUywgZm9sbG93ZWQgYnkgc0ZpbGxWYWwuXHJcbiAgcmV0dXJuIGxlZnQgPyBzRmlsbFZhbC5jb25jYXQoUykgOiBTLmNvbmNhdChzRmlsbFZhbCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoY291bnQpe1xyXG4gIHZhciBzdHIgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgLCByZXMgPSAnJ1xyXG4gICAgLCBuICAgPSAkLnRvSW50ZWdlcihjb3VudCk7XHJcbiAgaWYobiA8IDAgfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XHJcbiAgZm9yKDtuID4gMDsgKG4gPj4+PSAxKSAmJiAoc3RyICs9IHN0cikpaWYobiAmIDEpcmVzICs9IHN0cjtcclxuICByZXR1cm4gcmVzO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBjZWwgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXHJcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSAkLmdcclxuICAsIGlzRnVuY3Rpb24gICAgICAgICA9ICQuaXNGdW5jdGlvblxyXG4gICwgaHRtbCAgICAgICAgICAgICAgID0gJC5odG1sXHJcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xyXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxyXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXHJcbiAgLCBwb3N0TWVzc2FnZSAgICAgICAgPSBnbG9iYWwucG9zdE1lc3NhZ2VcclxuICAsIGFkZEV2ZW50TGlzdGVuZXIgICA9IGdsb2JhbC5hZGRFdmVudExpc3RlbmVyXHJcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcclxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcclxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XHJcbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xyXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XHJcbmZ1bmN0aW9uIHJ1bigpe1xyXG4gIHZhciBpZCA9ICt0aGlzO1xyXG4gIGlmKCQuaGFzKHF1ZXVlLCBpZCkpe1xyXG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICAgIGZuKCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xyXG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xyXG59XHJcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcclxuaWYoIWlzRnVuY3Rpb24oc2V0VGFzaykgfHwgIWlzRnVuY3Rpb24oY2xlYXJUYXNrKSl7XHJcbiAgc2V0VGFzayA9IGZ1bmN0aW9uKGZuKXtcclxuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xyXG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcclxuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xyXG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XHJcbiAgICB9O1xyXG4gICAgZGVmZXIoY291bnRlcik7XHJcbiAgICByZXR1cm4gY291bnRlcjtcclxuICB9O1xyXG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uKGlkKXtcclxuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgfTtcclxuICAvLyBOb2RlLmpzIDAuOC1cclxuICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XHJcbiAgICB9O1xyXG4gIC8vIE1vZGVybiBicm93c2Vycywgc2tpcCBpbXBsZW1lbnRhdGlvbiBmb3IgV2ViV29ya2Vyc1xyXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxyXG4gIH0gZWxzZSBpZihhZGRFdmVudExpc3RlbmVyICYmIGlzRnVuY3Rpb24ocG9zdE1lc3NhZ2UpICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XHJcbiAgICB9O1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcclxuICAvLyBXZWJXb3JrZXJzXHJcbiAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oTWVzc2FnZUNoYW5uZWwpKXtcclxuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XHJcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcclxuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcclxuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xyXG4gIC8vIElFOC1cclxuICB9IGVsc2UgaWYoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0Jykpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcclxuICAgICAgICBydW4uY2FsbChpZCk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXHJcbiAgfSBlbHNlIHtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzZXQ6ICAgc2V0VGFzayxcclxuICBjbGVhcjogY2xlYXJUYXNrXHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcclxuICB0cnkge1xyXG4gICAgZXhlYygpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07IiwidmFyIHNpZCA9IDA7XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiAnU3ltYm9sKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpO1xyXG59XHJcbnVpZC5zYWZlID0gcmVxdWlyZSgnLi8kJykuZy5TeW1ib2wgfHwgdWlkO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHVpZDsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXHJcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndW5zY29wYWJsZXMnKTtcclxuaWYoJC5GVyAmJiAhKFVOU0NPUEFCTEVTIGluIFtdKSkkLmhpZGUoQXJyYXkucHJvdG90eXBlLCBVTlNDT1BBQkxFUywge30pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XHJcbiAgaWYoJC5GVylbXVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XHJcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vJCcpLmdcclxuICAsIHN0b3JlICA9IHt9O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxyXG4gICAgZ2xvYmFsLlN5bWJvbCAmJiBnbG9iYWwuU3ltYm9sW25hbWVdIHx8IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdTeW1ib2wuJyArIG5hbWUpKTtcclxufTsiLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjZWwgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxyXG4gICwgY29mICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgaW52b2tlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgYXJyYXlNZXRob2QgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcclxuICAsIElFX1BST1RPICAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnX19wcm90b19fJylcclxuICAsIGFzc2VydCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGFzc2VydE9iamVjdCAgICAgPSBhc3NlcnQub2JqXHJcbiAgLCBPYmplY3RQcm90byAgICAgID0gT2JqZWN0LnByb3RvdHlwZVxyXG4gICwgaHRtbCAgICAgICAgICAgICA9ICQuaHRtbFxyXG4gICwgQSAgICAgICAgICAgICAgICA9IFtdXHJcbiAgLCBfc2xpY2UgICAgICAgICAgID0gQS5zbGljZVxyXG4gICwgX2pvaW4gICAgICAgICAgICA9IEEuam9pblxyXG4gICwgY2xhc3NvZiAgICAgICAgICA9IGNvZi5jbGFzc29mXHJcbiAgLCBoYXMgICAgICAgICAgICAgID0gJC5oYXNcclxuICAsIGRlZmluZVByb3BlcnR5ICAgPSAkLnNldERlc2NcclxuICAsIGdldE93bkRlc2NyaXB0b3IgPSAkLmdldERlc2NcclxuICAsIGRlZmluZVByb3BlcnRpZXMgPSAkLnNldERlc2NzXHJcbiAgLCBpc0Z1bmN0aW9uICAgICAgID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCB0b09iamVjdCAgICAgICAgID0gJC50b09iamVjdFxyXG4gICwgdG9MZW5ndGggICAgICAgICA9ICQudG9MZW5ndGhcclxuICAsIHRvSW5kZXggICAgICAgICAgPSAkLnRvSW5kZXhcclxuICAsIElFOF9ET01fREVGSU5FICAgPSBmYWxzZVxyXG4gICwgJGluZGV4T2YgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxyXG4gICwgJGZvckVhY2ggICAgICAgICA9IGFycmF5TWV0aG9kKDApXHJcbiAgLCAkbWFwICAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMSlcclxuICAsICRmaWx0ZXIgICAgICAgICAgPSBhcnJheU1ldGhvZCgyKVxyXG4gICwgJHNvbWUgICAgICAgICAgICA9IGFycmF5TWV0aG9kKDMpXHJcbiAgLCAkZXZlcnkgICAgICAgICAgID0gYXJyYXlNZXRob2QoNCk7XHJcblxyXG5pZighJC5ERVNDKXtcclxuICB0cnkge1xyXG4gICAgSUU4X0RPTV9ERUZJTkUgPSBkZWZpbmVQcm9wZXJ0eShjZWwoJ2RpdicpLCAneCcsXHJcbiAgICAgIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA4OyB9fVxyXG4gICAgKS54ID09IDg7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICQuc2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFAsIEF0dHJpYnV0ZXMpe1xyXG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcclxuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xyXG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XHJcbiAgICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpYXNzZXJ0T2JqZWN0KE8pW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcclxuICAgIHJldHVybiBPO1xyXG4gIH07XHJcbiAgJC5nZXREZXNjID0gZnVuY3Rpb24oTywgUCl7XHJcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xyXG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcclxuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICAgIGlmKGhhcyhPLCBQKSlyZXR1cm4gJC5kZXNjKCFPYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKE8sIFApLCBPW1BdKTtcclxuICB9O1xyXG4gICQuc2V0RGVzY3MgPSBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24oTywgUHJvcGVydGllcyl7XHJcbiAgICBhc3NlcnRPYmplY3QoTyk7XHJcbiAgICB2YXIga2V5cyAgID0gJC5nZXRLZXlzKFByb3BlcnRpZXMpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBpID0gMFxyXG4gICAgICAsIFA7XHJcbiAgICB3aGlsZShsZW5ndGggPiBpKSQuc2V0RGVzYyhPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcclxuICAgIHJldHVybiBPO1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhJC5ERVNDLCAnT2JqZWN0Jywge1xyXG4gIC8vIDE5LjEuMi42IC8gMTUuMi4zLjMgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxyXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJC5nZXREZXNjLFxyXG4gIC8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiAgZGVmaW5lUHJvcGVydHk6ICQuc2V0RGVzYyxcclxuICAvLyAxOS4xLjIuMyAvIDE1LjIuMy43IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXHJcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllc1xyXG59KTtcclxuXHJcbiAgLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xyXG52YXIga2V5czEgPSAoJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsJyArXHJcbiAgICAgICAgICAgICd0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJykuc3BsaXQoJywnKVxyXG4gIC8vIEFkZGl0aW9uYWwga2V5cyBmb3IgZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gICwga2V5czIgPSBrZXlzMS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKVxyXG4gICwga2V5c0xlbjEgPSBrZXlzMS5sZW5ndGg7XHJcblxyXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxyXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XHJcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcclxuICB2YXIgaWZyYW1lID0gY2VsKCdpZnJhbWUnKVxyXG4gICAgLCBpICAgICAgPSBrZXlzTGVuMVxyXG4gICAgLCBndCAgICAgPSAnPidcclxuICAgICwgaWZyYW1lRG9jdW1lbnQ7XHJcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgaHRtbC5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcclxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xyXG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xyXG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcclxuICBpZnJhbWVEb2N1bWVudC53cml0ZSgnPHNjcmlwdD5kb2N1bWVudC5GPU9iamVjdDwvc2NyaXB0JyArIGd0KTtcclxuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xyXG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xyXG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdC5wcm90b3R5cGVba2V5czFbaV1dO1xyXG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XHJcbn07XHJcbmZ1bmN0aW9uIGNyZWF0ZUdldEtleXMobmFtZXMsIGxlbmd0aCl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIGkgICAgICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBbXVxyXG4gICAgICAsIGtleTtcclxuICAgIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcclxuICAgIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcclxuICAgIHdoaWxlKGxlbmd0aCA+IGkpaWYoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKXtcclxuICAgICAgfiRpbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG59XHJcbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGl0KXsgcmV0dXJuICEkLmlzT2JqZWN0KGl0KTsgfVxyXG5mdW5jdGlvbiBFbXB0eSgpe31cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcclxuICBnZXRQcm90b3R5cGVPZjogJC5nZXRQcm90byA9ICQuZ2V0UHJvdG8gfHwgZnVuY3Rpb24oTyl7XHJcbiAgICBPID0gT2JqZWN0KGFzc2VydC5kZWYoTykpO1xyXG4gICAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XHJcbiAgICBpZihpc0Z1bmN0aW9uKE8uY29uc3RydWN0b3IpICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcclxuICAgICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xyXG4gICAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcclxuICB9LFxyXG4gIC8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkLmdldE5hbWVzID0gJC5nZXROYW1lcyB8fCBjcmVhdGVHZXRLZXlzKGtleXMyLCBrZXlzMi5sZW5ndGgsIHRydWUpLFxyXG4gIC8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG4gIGNyZWF0ZTogJC5jcmVhdGUgPSAkLmNyZWF0ZSB8fCBmdW5jdGlvbihPLCAvKj8qL1Byb3BlcnRpZXMpe1xyXG4gICAgdmFyIHJlc3VsdDtcclxuICAgIGlmKE8gIT09IG51bGwpe1xyXG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBhc3NlcnRPYmplY3QoTyk7XHJcbiAgICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xyXG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBudWxsO1xyXG4gICAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHNoaW1cclxuICAgICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XHJcbiAgICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xyXG4gICAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRlZmluZVByb3BlcnRpZXMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcclxuICB9LFxyXG4gIC8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxyXG4gIGtleXM6ICQuZ2V0S2V5cyA9ICQuZ2V0S2V5cyB8fCBjcmVhdGVHZXRLZXlzKGtleXMxLCBrZXlzTGVuMSwgZmFsc2UpLFxyXG4gIC8vIDE5LjEuMi4xNyAvIDE1LjIuMy44IE9iamVjdC5zZWFsKE8pXHJcbiAgc2VhbDogJC5pdCwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjUgLyAxNS4yLjMuOSBPYmplY3QuZnJlZXplKE8pXHJcbiAgZnJlZXplOiAkLml0LCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuMTUgLyAxNS4yLjMuMTAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKE8pXHJcbiAgcHJldmVudEV4dGVuc2lvbnM6ICQuaXQsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMyAvIDE1LjIuMy4xMSBPYmplY3QuaXNTZWFsZWQoTylcclxuICBpc1NlYWxlZDogaXNQcmltaXRpdmUsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMiAvIDE1LjIuMy4xMiBPYmplY3QuaXNGcm96ZW4oTylcclxuICBpc0Zyb3plbjogaXNQcmltaXRpdmUsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMSAvIDE1LjIuMy4xMyBPYmplY3QuaXNFeHRlbnNpYmxlKE8pXHJcbiAgaXNFeHRlbnNpYmxlOiAkLmlzT2JqZWN0IC8vIDwtIGNhcFxyXG59KTtcclxuXHJcbi8vIDE5LjIuMy4yIC8gMTUuMy40LjUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQodGhpc0FyZywgYXJncy4uLilcclxuJGRlZigkZGVmLlAsICdGdW5jdGlvbicsIHtcclxuICBiaW5kOiBmdW5jdGlvbih0aGF0IC8qLCBhcmdzLi4uICovKXtcclxuICAgIHZhciBmbiAgICAgICA9IGFzc2VydC5mbih0aGlzKVxyXG4gICAgICAsIHBhcnRBcmdzID0gX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgIGZ1bmN0aW9uIGJvdW5kKC8qIGFyZ3MuLi4gKi8pe1xyXG4gICAgICB2YXIgYXJncyA9IHBhcnRBcmdzLmNvbmNhdChfc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcclxuICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhpcyBpbnN0YW5jZW9mIGJvdW5kID8gJC5jcmVhdGUoZm4ucHJvdG90eXBlKSA6IHRoYXQpO1xyXG4gICAgfVxyXG4gICAgaWYoZm4ucHJvdG90eXBlKWJvdW5kLnByb3RvdHlwZSA9IGZuLnByb3RvdHlwZTtcclxuICAgIHJldHVybiBib3VuZDtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gRml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGFuZCBET00gb2JqZWN0c1xyXG5pZighKDAgaW4gT2JqZWN0KCd6JykgJiYgJ3onWzBdID09ICd6Jykpe1xyXG4gICQuRVM1T2JqZWN0ID0gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xyXG4gIH07XHJcbn1cclxuXHJcbnZhciBidWdneVNsaWNlID0gdHJ1ZTtcclxudHJ5IHtcclxuICBpZihodG1sKV9zbGljZS5jYWxsKGh0bWwpO1xyXG4gIGJ1Z2d5U2xpY2UgPSBmYWxzZTtcclxufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG5cclxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBidWdneVNsaWNlLCAnQXJyYXknLCB7XHJcbiAgc2xpY2U6IGZ1bmN0aW9uIHNsaWNlKGJlZ2luLCBlbmQpe1xyXG4gICAgdmFyIGxlbiAgID0gdG9MZW5ndGgodGhpcy5sZW5ndGgpXHJcbiAgICAgICwga2xhc3MgPSBjb2YodGhpcyk7XHJcbiAgICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IGVuZDtcclxuICAgIGlmKGtsYXNzID09ICdBcnJheScpcmV0dXJuIF9zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpO1xyXG4gICAgdmFyIHN0YXJ0ICA9IHRvSW5kZXgoYmVnaW4sIGxlbilcclxuICAgICAgLCB1cFRvICAgPSB0b0luZGV4KGVuZCwgbGVuKVxyXG4gICAgICAsIHNpemUgICA9IHRvTGVuZ3RoKHVwVG8gLSBzdGFydClcclxuICAgICAgLCBjbG9uZWQgPSBBcnJheShzaXplKVxyXG4gICAgICAsIGkgICAgICA9IDA7XHJcbiAgICBmb3IoOyBpIDwgc2l6ZTsgaSsrKWNsb25lZFtpXSA9IGtsYXNzID09ICdTdHJpbmcnXHJcbiAgICAgID8gdGhpcy5jaGFyQXQoc3RhcnQgKyBpKVxyXG4gICAgICA6IHRoaXNbc3RhcnQgKyBpXTtcclxuICAgIHJldHVybiBjbG9uZWQ7XHJcbiAgfVxyXG59KTtcclxuXHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogKCQuRVM1T2JqZWN0ICE9IE9iamVjdCksICdBcnJheScsIHtcclxuICBqb2luOiBmdW5jdGlvbiBqb2luKCl7XHJcbiAgICByZXR1cm4gX2pvaW4uYXBwbHkoJC5FUzVPYmplY3QodGhpcyksIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIDIyLjEuMi4yIC8gMTUuNC4zLjIgQXJyYXkuaXNBcnJheShhcmcpXHJcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XHJcbiAgaXNBcnJheTogZnVuY3Rpb24oYXJnKXtcclxuICAgIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xyXG4gIH1cclxufSk7XHJcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5UmVkdWNlKGlzUmlnaHQpe1xyXG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLCBtZW1vKXtcclxuICAgIGFzc2VydC5mbihjYWxsYmFja2ZuKTtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IGlzUmlnaHQgPyBsZW5ndGggLSAxIDogMFxyXG4gICAgICAsIGkgICAgICA9IGlzUmlnaHQgPyAtMSA6IDE7XHJcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMilmb3IoOzspe1xyXG4gICAgICBpZihpbmRleCBpbiBPKXtcclxuICAgICAgICBtZW1vID0gT1tpbmRleF07XHJcbiAgICAgICAgaW5kZXggKz0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBpbmRleCArPSBpO1xyXG4gICAgICBhc3NlcnQoaXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleCwgJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnKTtcclxuICAgIH1cclxuICAgIGZvcig7aXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleDsgaW5kZXggKz0gaSlpZihpbmRleCBpbiBPKXtcclxuICAgICAgbWVtbyA9IGNhbGxiYWNrZm4obWVtbywgT1tpbmRleF0sIGluZGV4LCB0aGlzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBtZW1vO1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjMuMTAgLyAxNS40LjQuMTggQXJyYXkucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBmb3JFYWNoOiAkLmVhY2ggPSAkLmVhY2ggfHwgZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuMTUgLyAxNS40LjQuMTkgQXJyYXkucHJvdG90eXBlLm1hcChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIG1hcDogZnVuY3Rpb24gbWFwKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJG1hcCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjcgLyAxNS40LjQuMjAgQXJyYXkucHJvdG90eXBlLmZpbHRlcihjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIGZpbHRlcjogZnVuY3Rpb24gZmlsdGVyKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJGZpbHRlcih0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjIzIC8gMTUuNC40LjE3IEFycmF5LnByb3RvdHlwZS5zb21lKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgc29tZTogZnVuY3Rpb24gc29tZShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRzb21lKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuNSAvIDE1LjQuNC4xNiBBcnJheS5wcm90b3R5cGUuZXZlcnkoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBldmVyeTogZnVuY3Rpb24gZXZlcnkoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZXZlcnkodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy4xOCAvIDE1LjQuNC4yMSBBcnJheS5wcm90b3R5cGUucmVkdWNlKGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcclxuICByZWR1Y2U6IGNyZWF0ZUFycmF5UmVkdWNlKGZhbHNlKSxcclxuICAvLyAyMi4xLjMuMTkgLyAxNS40LjQuMjIgQXJyYXkucHJvdG90eXBlLnJlZHVjZVJpZ2h0KGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcclxuICByZWR1Y2VSaWdodDogY3JlYXRlQXJyYXlSZWR1Y2UodHJ1ZSksXHJcbiAgLy8gMjIuMS4zLjExIC8gMTUuNC40LjE0IEFycmF5LnByb3RvdHlwZS5pbmRleE9mKHNlYXJjaEVsZW1lbnQgWywgZnJvbUluZGV4XSlcclxuICBpbmRleE9mOiBmdW5jdGlvbiBpbmRleE9mKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcclxuICAgIHJldHVybiAkaW5kZXhPZih0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy4xNCAvIDE1LjQuNC4xNSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxyXG4gIGxhc3RJbmRleE9mOiBmdW5jdGlvbihlbCwgZnJvbUluZGV4IC8qID0gQFsqLTFdICovKXtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IGxlbmd0aCAtIDE7XHJcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSlpbmRleCA9IE1hdGgubWluKGluZGV4LCAkLnRvSW50ZWdlcihmcm9tSW5kZXgpKTtcclxuICAgIGlmKGluZGV4IDwgMClpbmRleCA9IHRvTGVuZ3RoKGxlbmd0aCArIGluZGV4KTtcclxuICAgIGZvcig7aW5kZXggPj0gMDsgaW5kZXgtLSlpZihpbmRleCBpbiBPKWlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaW5kZXg7XHJcbiAgICByZXR1cm4gLTE7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIDIxLjEuMy4yNSAvIDE1LjUuNC4yMCBTdHJpbmcucHJvdG90eXBlLnRyaW0oKVxyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHt0cmltOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXlxccyooW1xcc1xcU10qXFxTKT9cXHMqJC8sICckMScpfSk7XHJcblxyXG4vLyAyMC4zLjMuMSAvIDE1LjkuNC40IERhdGUubm93KClcclxuJGRlZigkZGVmLlMsICdEYXRlJywge25vdzogZnVuY3Rpb24oKXtcclxuICByZXR1cm4gK25ldyBEYXRlO1xyXG59fSk7XHJcblxyXG5mdW5jdGlvbiBseihudW0pe1xyXG4gIHJldHVybiBudW0gPiA5ID8gbnVtIDogJzAnICsgbnVtO1xyXG59XHJcblxyXG4vLyAyMC4zLjQuMzYgLyAxNS45LjUuNDMgRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcoKVxyXG4vLyBQaGFudG9tSlMgYW5kIG9sZCB3ZWJraXQgaGFkIGEgYnJva2VuIERhdGUgaW1wbGVtZW50YXRpb24uXHJcbnZhciBkYXRlICAgICAgID0gbmV3IERhdGUoLTVlMTMgLSAxKVxyXG4gICwgYnJva2VuRGF0ZSA9ICEoZGF0ZS50b0lTT1N0cmluZyAmJiBkYXRlLnRvSVNPU3RyaW5nKCkgPT0gJzAzODUtMDctMjVUMDc6MDY6MzkuOTk5WidcclxuICAgICAgJiYgcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7IG5ldyBEYXRlKE5hTikudG9JU09TdHJpbmcoKTsgfSkpO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJyb2tlbkRhdGUsICdEYXRlJywge3RvSVNPU3RyaW5nOiBmdW5jdGlvbigpe1xyXG4gIGlmKCFpc0Zpbml0ZSh0aGlzKSl0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIHRpbWUgdmFsdWUnKTtcclxuICB2YXIgZCA9IHRoaXNcclxuICAgICwgeSA9IGQuZ2V0VVRDRnVsbFllYXIoKVxyXG4gICAgLCBtID0gZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgLCBzID0geSA8IDAgPyAnLScgOiB5ID4gOTk5OSA/ICcrJyA6ICcnO1xyXG4gIHJldHVybiBzICsgKCcwMDAwMCcgKyBNYXRoLmFicyh5KSkuc2xpY2UocyA/IC02IDogLTQpICtcclxuICAgICctJyArIGx6KGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICsgbHooZC5nZXRVVENEYXRlKCkpICtcclxuICAgICdUJyArIGx6KGQuZ2V0VVRDSG91cnMoKSkgKyAnOicgKyBseihkLmdldFVUQ01pbnV0ZXMoKSkgK1xyXG4gICAgJzonICsgbHooZC5nZXRVVENTZWNvbmRzKCkpICsgJy4nICsgKG0gPiA5OSA/IG0gOiAnMCcgKyBseihtKSkgKyAnWic7XHJcbn19KTtcclxuXHJcbmlmKGNsYXNzb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnT2JqZWN0Jyljb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcclxuICB2YXIgdGFnID0gY2xhc3NvZihpdCk7XHJcbiAgcmV0dXJuIHRhZyA9PSAnT2JqZWN0JyAmJiBpc0Z1bmN0aW9uKGl0LmNhbGxlZSkgPyAnQXJndW1lbnRzJyA6IHRhZztcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XHJcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XHJcbiAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgY29weVdpdGhpbjogZnVuY3Rpb24gY29weVdpdGhpbih0YXJnZXQvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICB2YXIgTyAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGxlbiAgID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXHJcbiAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXHJcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcclxuICAgICAgLCBjb3VudCA9IE1hdGgubWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxyXG4gICAgICAsIGluYyAgID0gMTtcclxuICAgIGlmKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCl7XHJcbiAgICAgIGluYyAgPSAtMTtcclxuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XHJcbiAgICAgIHRvICAgPSB0byAgICsgY291bnQgLSAxO1xyXG4gICAgfVxyXG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xyXG4gICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xyXG4gICAgICBlbHNlIGRlbGV0ZSBPW3RvXTtcclxuICAgICAgdG8gICArPSBpbmM7XHJcbiAgICAgIGZyb20gKz0gaW5jO1xyXG4gICAgfSByZXR1cm4gTztcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdjb3B5V2l0aGluJyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xyXG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gIGZpbGw6IGZ1bmN0aW9uIGZpbGwodmFsdWUgLyosIHN0YXJ0ID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXHJcbiAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXHJcbiAgICAgICwgZW5kUG9zID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0luZGV4KGVuZCwgbGVuZ3RoKTtcclxuICAgIHdoaWxlKGVuZFBvcyA+IGluZGV4KU9baW5kZXgrK10gPSB2YWx1ZTtcclxuICAgIHJldHVybiBPO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2ZpbGwnKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIDIyLjEuMy45IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG52YXIgS0VZICAgID0gJ2ZpbmRJbmRleCdcclxuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgZm9yY2VkID0gdHJ1ZVxyXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg2KTtcclxuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcclxuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xyXG4gIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJGZpbmQodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKEtFWSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG4vLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbnZhciBLRVkgICAgPSAnZmluZCdcclxuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgZm9yY2VkID0gdHJ1ZVxyXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KTtcclxuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcclxuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xyXG4gIGZpbmQ6IGZ1bmN0aW9uIGZpbmQoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZmluZCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoS0VZKTsiLCJ2YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIGNhbGwgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcclxuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XHJcbiAgICB2YXIgTyAgICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcclxuICAgICAgLCBtYXBmbiAgID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcclxuICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAsIGluZGV4ICAgPSAwXHJcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xyXG4gICAgaWYoJGl0ZXIuaXMoTykpe1xyXG4gICAgICBpdGVyYXRvciA9ICRpdGVyLmdldChPKTtcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgcmVzdWx0ICAgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpO1xyXG4gICAgICBmb3IoOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xyXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgZiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxyXG4gICAgICByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpKTtcclxuICAgICAgZm9yKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xyXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBzZXRVbnNjb3BlID0gcmVxdWlyZSgnLi8kLnVuc2NvcGUnKVxyXG4gICwgSVRFUiAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsICRpdGVyICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBzdGVwICAgICAgID0gJGl0ZXIuc3RlcFxyXG4gICwgSXRlcmF0b3JzICA9ICRpdGVyLkl0ZXJhdG9ycztcclxuXHJcbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcclxuLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcclxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxyXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogJC50b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcclxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbn0sIGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgLCBraW5kICA9IGl0ZXIua1xyXG4gICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xyXG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcclxuICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcclxuICAgIHJldHVybiBzdGVwKDEpO1xyXG4gIH1cclxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcclxuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcclxuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XHJcbn0sICd2YWx1ZXMnKTtcclxuXHJcbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcclxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcclxuXHJcbnNldFVuc2NvcGUoJ2tleXMnKTtcclxuc2V0VW5zY29wZSgndmFsdWVzJyk7XHJcbnNldFVuc2NvcGUoJ2VudHJpZXMnKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjIuMyBBcnJheS5vZiggLi4uaXRlbXMpXHJcbiAgb2Y6IGZ1bmN0aW9uIG9mKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIGluZGV4ICA9IDBcclxuICAgICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXHJcbiAgICAgICwgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGgpO1xyXG4gICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcclxuICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7IiwicmVxdWlyZSgnLi8kLnNwZWNpZXMnKShBcnJheSk7IiwidmFyICQgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgSEFTX0lOU1RBTkNFICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaGFzSW5zdGFuY2UnKVxyXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcclxuLy8gMTkuMi4zLjYgRnVuY3Rpb24ucHJvdG90eXBlW0BAaGFzSW5zdGFuY2VdKFYpXHJcbmlmKCEoSEFTX0lOU1RBTkNFIGluIEZ1bmN0aW9uUHJvdG8pKSQuc2V0RGVzYyhGdW5jdGlvblByb3RvLCBIQVNfSU5TVEFOQ0UsIHt2YWx1ZTogZnVuY3Rpb24oTyl7XHJcbiAgaWYoISQuaXNGdW5jdGlvbih0aGlzKSB8fCAhJC5pc09iamVjdChPKSlyZXR1cm4gZmFsc2U7XHJcbiAgaWYoISQuaXNPYmplY3QodGhpcy5wcm90b3R5cGUpKXJldHVybiBPIGluc3RhbmNlb2YgdGhpcztcclxuICAvLyBmb3IgZW52aXJvbm1lbnQgdy9vIG5hdGl2ZSBgQEBoYXNJbnN0YW5jZWAgbG9naWMgZW5vdWdoIGBpbnN0YW5jZW9mYCwgYnV0IGFkZCB0aGlzOlxyXG4gIHdoaWxlKE8gPSAkLmdldFByb3RvKE8pKWlmKHRoaXMucHJvdG90eXBlID09PSBPKXJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufX0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgTkFNRSA9ICduYW1lJ1xyXG4gICwgc2V0RGVzYyA9ICQuc2V0RGVzY1xyXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcclxuLy8gMTkuMi40LjIgbmFtZVxyXG5OQU1FIGluIEZ1bmN0aW9uUHJvdG8gfHwgJC5GVyAmJiAkLkRFU0MgJiYgc2V0RGVzYyhGdW5jdGlvblByb3RvLCBOQU1FLCB7XHJcbiAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gIGdldDogZnVuY3Rpb24oKXtcclxuICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXHJcbiAgICAgICwgbmFtZSAgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XHJcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYyg1LCBuYW1lKSk7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9LFxyXG4gIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgJC5oYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCAkLmRlc2MoMCwgdmFsdWUpKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xyXG5cclxuLy8gMjMuMSBNYXAgT2JqZWN0c1xyXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdNYXAnLCB7XHJcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSl7XHJcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xyXG4gIH0sXHJcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIGtleSA9PT0gMCA/IDAgOiBrZXksIHZhbHVlKTtcclxuICB9XHJcbn0sIHN0cm9uZywgdHJ1ZSk7IiwidmFyIEluZmluaXR5ID0gMSAvIDBcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBFICAgICA9IE1hdGguRVxyXG4gICwgcG93ICAgPSBNYXRoLnBvd1xyXG4gICwgYWJzICAgPSBNYXRoLmFic1xyXG4gICwgZXhwICAgPSBNYXRoLmV4cFxyXG4gICwgbG9nICAgPSBNYXRoLmxvZ1xyXG4gICwgc3FydCAgPSBNYXRoLnNxcnRcclxuICAsIGNlaWwgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcclxuICAsIEVQU0lMT04gICA9IHBvdygyLCAtNTIpXHJcbiAgLCBFUFNJTE9OMzIgPSBwb3coMiwgLTIzKVxyXG4gICwgTUFYMzIgICAgID0gcG93KDIsIDEyNykgKiAoMiAtIEVQU0lMT04zMilcclxuICAsIE1JTjMyICAgICA9IHBvdygyLCAtMTI2KTtcclxuZnVuY3Rpb24gcm91bmRUaWVzVG9FdmVuKG4pe1xyXG4gIHJldHVybiBuICsgMSAvIEVQU0lMT04gLSAxIC8gRVBTSUxPTjtcclxufVxyXG5cclxuLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG5mdW5jdGlvbiBzaWduKHgpe1xyXG4gIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcclxufVxyXG4vLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbmZ1bmN0aW9uIGFzaW5oKHgpe1xyXG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xyXG59XHJcbi8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbmZ1bmN0aW9uIGV4cG0xKHgpe1xyXG4gIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xyXG59XHJcblxyXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XHJcbiAgLy8gMjAuMi4yLjMgTWF0aC5hY29zaCh4KVxyXG4gIGFjb3NoOiBmdW5jdGlvbiBhY29zaCh4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gIGFzaW5oOiBhc2luaCxcclxuICAvLyAyMC4yLjIuNyBNYXRoLmF0YW5oKHgpXHJcbiAgYXRhbmg6IGZ1bmN0aW9uIGF0YW5oKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcclxuICBjYnJ0OiBmdW5jdGlvbiBjYnJ0KHgpe1xyXG4gICAgcmV0dXJuIHNpZ24oeCA9ICt4KSAqIHBvdyhhYnMoeCksIDEgLyAzKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xMSBNYXRoLmNsejMyKHgpXHJcbiAgY2x6MzI6IGZ1bmN0aW9uIGNsejMyKHgpe1xyXG4gICAgcmV0dXJuICh4ID4+Pj0gMCkgPyAzMSAtIGZsb29yKGxvZyh4ICsgMC41KSAqIE1hdGguTE9HMkUpIDogMzI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTIgTWF0aC5jb3NoKHgpXHJcbiAgY29zaDogZnVuY3Rpb24gY29zaCh4KXtcclxuICAgIHJldHVybiAoZXhwKHggPSAreCkgKyBleHAoLXgpKSAvIDI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxyXG4gIGV4cG0xOiBleHBtMSxcclxuICAvLyAyMC4yLjIuMTYgTWF0aC5mcm91bmQoeClcclxuICBmcm91bmQ6IGZ1bmN0aW9uIGZyb3VuZCh4KXtcclxuICAgIHZhciAkYWJzICA9IGFicyh4KVxyXG4gICAgICAsICRzaWduID0gc2lnbih4KVxyXG4gICAgICAsIGEsIHJlc3VsdDtcclxuICAgIGlmKCRhYnMgPCBNSU4zMilyZXR1cm4gJHNpZ24gKiByb3VuZFRpZXNUb0V2ZW4oJGFicyAvIE1JTjMyIC8gRVBTSUxPTjMyKSAqIE1JTjMyICogRVBTSUxPTjMyO1xyXG4gICAgYSA9ICgxICsgRVBTSUxPTjMyIC8gRVBTSUxPTikgKiAkYWJzO1xyXG4gICAgcmVzdWx0ID0gYSAtIChhIC0gJGFicyk7XHJcbiAgICBpZihyZXN1bHQgPiBNQVgzMiB8fCByZXN1bHQgIT0gcmVzdWx0KXJldHVybiAkc2lnbiAqIEluZmluaXR5O1xyXG4gICAgcmV0dXJuICRzaWduICogcmVzdWx0O1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjE3IE1hdGguaHlwb3QoW3ZhbHVlMVssIHZhbHVlMlssIOKApiBdXV0pXHJcbiAgaHlwb3Q6IGZ1bmN0aW9uIGh5cG90KHZhbHVlMSwgdmFsdWUyKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gICAgdmFyIHN1bSAgPSAwXHJcbiAgICAgICwgbGVuMSA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBsZW4yID0gbGVuMVxyXG4gICAgICAsIGFyZ3MgPSBBcnJheShsZW4xKVxyXG4gICAgICAsIGxhcmcgPSAwXHJcbiAgICAgICwgYXJnO1xyXG4gICAgd2hpbGUobGVuMS0tKXtcclxuICAgICAgYXJnID0gYXJnc1tsZW4xXSA9IGFicyhhcmd1bWVudHNbbGVuMV0pO1xyXG4gICAgICBpZihhcmcgPT0gSW5maW5pdHkpcmV0dXJuIEluZmluaXR5O1xyXG4gICAgICBpZihhcmcgPiBsYXJnKWxhcmcgPSBhcmc7XHJcbiAgICB9XHJcbiAgICBsYXJnID0gbGFyZyB8fCAxO1xyXG4gICAgd2hpbGUobGVuMi0tKXN1bSArPSBwb3coYXJnc1tsZW4yXSAvIGxhcmcsIDIpO1xyXG4gICAgcmV0dXJuIGxhcmcgKiBzcXJ0KHN1bSk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTggTWF0aC5pbXVsKHgsIHkpXHJcbiAgaW11bDogZnVuY3Rpb24gaW11bCh4LCB5KXtcclxuICAgIHZhciBVSW50MTYgPSAweGZmZmZcclxuICAgICAgLCB4biA9ICt4XHJcbiAgICAgICwgeW4gPSAreVxyXG4gICAgICAsIHhsID0gVUludDE2ICYgeG5cclxuICAgICAgLCB5bCA9IFVJbnQxNiAmIHluO1xyXG4gICAgcmV0dXJuIDAgfCB4bCAqIHlsICsgKChVSW50MTYgJiB4biA+Pj4gMTYpICogeWwgKyB4bCAqIChVSW50MTYgJiB5biA+Pj4gMTYpIDw8IDE2ID4+PiAwKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4yMCBNYXRoLmxvZzFwKHgpXHJcbiAgbG9nMXA6IGZ1bmN0aW9uIGxvZzFwKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID4gLTFlLTggJiYgeCA8IDFlLTggPyB4IC0geCAqIHggLyAyIDogbG9nKDEgKyB4KTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4yMSBNYXRoLmxvZzEwKHgpXHJcbiAgbG9nMTA6IGZ1bmN0aW9uIGxvZzEwKHgpe1xyXG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4xMDtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4yMiBNYXRoLmxvZzIoeClcclxuICBsb2cyOiBmdW5jdGlvbiBsb2cyKHgpe1xyXG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gIHNpZ246IHNpZ24sXHJcbiAgLy8gMjAuMi4yLjMwIE1hdGguc2luaCh4KVxyXG4gIHNpbmg6IGZ1bmN0aW9uIHNpbmgoeCl7XHJcbiAgICByZXR1cm4gYWJzKHggPSAreCkgPCAxID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDIgOiAoZXhwKHggLSAxKSAtIGV4cCgteCAtIDEpKSAqIChFIC8gMik7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMzMgTWF0aC50YW5oKHgpXHJcbiAgdGFuaDogZnVuY3Rpb24gdGFuaCh4KXtcclxuICAgIHZhciBhID0gZXhwbTEoeCA9ICt4KVxyXG4gICAgICAsIGIgPSBleHBtMSgteCk7XHJcbiAgICByZXR1cm4gYSA9PSBJbmZpbml0eSA/IDEgOiBiID09IEluZmluaXR5ID8gLTEgOiAoYSAtIGIpIC8gKGV4cCh4KSArIGV4cCgteCkpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjM0IE1hdGgudHJ1bmMoeClcclxuICB0cnVuYzogZnVuY3Rpb24gdHJ1bmMoaXQpe1xyXG4gICAgcmV0dXJuIChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgaXNPYmplY3QgICA9ICQuaXNPYmplY3RcclxuICAsIGlzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb25cclxuICAsIE5VTUJFUiAgICAgPSAnTnVtYmVyJ1xyXG4gICwgJE51bWJlciAgICA9ICQuZ1tOVU1CRVJdXHJcbiAgLCBCYXNlICAgICAgID0gJE51bWJlclxyXG4gICwgcHJvdG8gICAgICA9ICROdW1iZXIucHJvdG90eXBlO1xyXG5mdW5jdGlvbiB0b1ByaW1pdGl2ZShpdCl7XHJcbiAgdmFyIGZuLCB2YWw7XHJcbiAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnZhbHVlT2YpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudG9TdHJpbmcpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XHJcbn1cclxuZnVuY3Rpb24gdG9OdW1iZXIoaXQpe1xyXG4gIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcclxuICBpZih0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMiAmJiBpdC5jaGFyQ29kZUF0KDApID09IDQ4KXtcclxuICAgIHZhciBiaW5hcnkgPSBmYWxzZTtcclxuICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcclxuICAgICAgY2FzZSA2NiA6IGNhc2UgOTggIDogYmluYXJ5ID0gdHJ1ZTtcclxuICAgICAgY2FzZSA3OSA6IGNhc2UgMTExIDogcmV0dXJuIHBhcnNlSW50KGl0LnNsaWNlKDIpLCBiaW5hcnkgPyAyIDogOCk7XHJcbiAgICB9XHJcbiAgfSByZXR1cm4gK2l0O1xyXG59XHJcbmlmKCQuRlcgJiYgISgkTnVtYmVyKCcwbzEnKSAmJiAkTnVtYmVyKCcwYjEnKSkpe1xyXG4gICROdW1iZXIgPSBmdW5jdGlvbiBOdW1iZXIoaXQpe1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiAkTnVtYmVyID8gbmV3IEJhc2UodG9OdW1iZXIoaXQpKSA6IHRvTnVtYmVyKGl0KTtcclxuICB9O1xyXG4gICQuZWFjaC5jYWxsKCQuREVTQyA/ICQuZ2V0TmFtZXMoQmFzZSkgOiAoXHJcbiAgICAgIC8vIEVTMzpcclxuICAgICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xyXG4gICAgICAvLyBFUzYgKGluIGNhc2UsIGlmIG1vZHVsZXMgd2l0aCBFUzYgTnVtYmVyIHN0YXRpY3MgcmVxdWlyZWQgYmVmb3JlKTpcclxuICAgICAgJ0VQU0lMT04saXNGaW5pdGUsaXNJbnRlZ2VyLGlzTmFOLGlzU2FmZUludGVnZXIsTUFYX1NBRkVfSU5URUdFUiwnICtcclxuICAgICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXHJcbiAgICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKCQuaGFzKEJhc2UsIGtleSkgJiYgISQuaGFzKCROdW1iZXIsIGtleSkpe1xyXG4gICAgICAgICQuc2V0RGVzYygkTnVtYmVyLCBrZXksICQuZ2V0RGVzYyhCYXNlLCBrZXkpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICk7XHJcbiAgJE51bWJlci5wcm90b3R5cGUgPSBwcm90bztcclxuICBwcm90by5jb25zdHJ1Y3RvciA9ICROdW1iZXI7XHJcbiAgJC5oaWRlKCQuZywgTlVNQkVSLCAkTnVtYmVyKTtcclxufSIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgYWJzICAgPSBNYXRoLmFic1xyXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXHJcbiAgLCBfaXNGaW5pdGUgPSAkLmcuaXNGaW5pdGVcclxuICAsIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxO1xyXG5mdW5jdGlvbiBpc0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiAhJC5pc09iamVjdChpdCkgJiYgX2lzRmluaXRlKGl0KSAmJiBmbG9vcihpdCkgPT09IGl0O1xyXG59XHJcbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xyXG4gIC8vIDIwLjEuMi4xIE51bWJlci5FUFNJTE9OXHJcbiAgRVBTSUxPTjogTWF0aC5wb3coMiwgLTUyKSxcclxuICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxyXG4gIGlzRmluaXRlOiBmdW5jdGlvbiBpc0Zpbml0ZShpdCl7XHJcbiAgICByZXR1cm4gdHlwZW9mIGl0ID09ICdudW1iZXInICYmIF9pc0Zpbml0ZShpdCk7XHJcbiAgfSxcclxuICAvLyAyMC4xLjIuMyBOdW1iZXIuaXNJbnRlZ2VyKG51bWJlcilcclxuICBpc0ludGVnZXI6IGlzSW50ZWdlcixcclxuICAvLyAyMC4xLjIuNCBOdW1iZXIuaXNOYU4obnVtYmVyKVxyXG4gIGlzTmFOOiBmdW5jdGlvbiBpc05hTihudW1iZXIpe1xyXG4gICAgcmV0dXJuIG51bWJlciAhPSBudW1iZXI7XHJcbiAgfSxcclxuICAvLyAyMC4xLjIuNSBOdW1iZXIuaXNTYWZlSW50ZWdlcihudW1iZXIpXHJcbiAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24gaXNTYWZlSW50ZWdlcihudW1iZXIpe1xyXG4gICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgfSxcclxuICAvLyAyMC4xLjIuNiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgLy8gMjAuMS4yLjEwIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSXHJcbiAgTUlOX1NBRkVfSU5URUdFUjogLU1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcclxuICBwYXJzZUZsb2F0OiBwYXJzZUZsb2F0LFxyXG4gIC8vIDIwLjEuMi4xMyBOdW1iZXIucGFyc2VJbnQoc3RyaW5nLCByYWRpeClcclxuICBwYXJzZUludDogcGFyc2VJbnRcclxufSk7IiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwiLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xyXG4gIGlzOiBmdW5jdGlvbiBpcyh4LCB5KXtcclxuICAgIHJldHVybiB4ID09PSB5ID8geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHkgOiB4ICE9IHggJiYgeSAhPSB5O1xyXG4gIH1cclxufSk7IiwiLy8gMTkuMS4zLjE5IE9iamVjdC5zZXRQcm90b3R5cGVPZihPLCBwcm90bylcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0fSk7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcclxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdDtcclxuZnVuY3Rpb24gd3JhcE9iamVjdE1ldGhvZChNRVRIT0QsIE1PREUpe1xyXG4gIHZhciBmbiAgPSAoJC5jb3JlLk9iamVjdCB8fCB7fSlbTUVUSE9EXSB8fCBPYmplY3RbTUVUSE9EXVxyXG4gICAgLCBmICAgPSAwXHJcbiAgICAsIG8gICA9IHt9O1xyXG4gIG9bTUVUSE9EXSA9IE1PREUgPT0gMSA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcclxuICB9IDogTU9ERSA9PSAyID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XHJcbiAgfSA6IE1PREUgPT0gMyA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBmYWxzZTtcclxuICB9IDogTU9ERSA9PSA0ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xyXG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSwga2V5KTtcclxuICB9IDogTU9ERSA9PSA1ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xyXG4gICAgcmV0dXJuIGZuKE9iamVjdCgkLmFzc2VydERlZmluZWQoaXQpKSk7XHJcbiAgfSA6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xyXG4gIH07XHJcbiAgdHJ5IHtcclxuICAgIGZuKCd6Jyk7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIGYgPSAxO1xyXG4gIH1cclxuICAkZGVmKCRkZWYuUyArICRkZWYuRiAqIGYsICdPYmplY3QnLCBvKTtcclxufVxyXG53cmFwT2JqZWN0TWV0aG9kKCdmcmVlemUnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgnc2VhbCcsIDEpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdwcmV2ZW50RXh0ZW5zaW9ucycsIDEpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc0Zyb3plbicsIDIpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc1NlYWxlZCcsIDIpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc0V4dGVuc2libGUnLCAzKTtcclxud3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgNCk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldFByb3RvdHlwZU9mJywgNSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2tleXMnKTtcclxud3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlOYW1lcycpOyIsIid1c2Ugc3RyaWN0JztcclxuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXHJcbnZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCBzcmMgPSBTdHJpbmcoe30udG9TdHJpbmcpXHJcbiAgLCB0bXAgPSB7fTtcclxuZnVuY3Rpb24gdG9TdHJpbmcoKXtcclxuICByZXR1cm4gJ1tvYmplY3QgJyArIGNvZi5jbGFzc29mKHRoaXMpICsgJ10nO1xyXG59XHJcbi8vIGxvZGFzaCB1c2VzIFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKSBpbiBpc05hdGl2ZVxyXG50b1N0cmluZy50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XHJcbiAgcmV0dXJuIHNyYztcclxufTtcclxudG1wW3JlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XHJcbmlmKCQuRlcgJiYgY29mKHRtcCkgIT0gJ3onKSQuaGlkZShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCB0b1N0cmluZyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBzZXRQcm90byA9IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXRcclxuICAsIHNwZWNpZXMgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxyXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxyXG4gICwgUkVDT1JEICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgncmVjb3JkJylcclxuICAsIFBST01JU0UgID0gJ1Byb21pc2UnXHJcbiAgLCBnbG9iYWwgICA9ICQuZ1xyXG4gICwgcHJvY2VzcyAgPSBnbG9iYWwucHJvY2Vzc1xyXG4gICwgYXNhcCAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2sgfHwgcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcclxuICAsIFAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXHJcbiAgLCBpc0Z1bmN0aW9uICAgICA9ICQuaXNGdW5jdGlvblxyXG4gICwgaXNPYmplY3QgICAgICAgPSAkLmlzT2JqZWN0XHJcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IGFzc2VydC5mblxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgPSBhc3NlcnQub2JqO1xyXG5cclxudmFyIHVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIHRlc3QsIHdvcmtzID0gZmFsc2U7XHJcbiAgZnVuY3Rpb24gUDIoeCl7XHJcbiAgICB2YXIgc2VsZiA9IG5ldyBQKHgpO1xyXG4gICAgc2V0UHJvdG8oc2VsZiwgUDIucHJvdG90eXBlKTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgd29ya3MgPSBpc0Z1bmN0aW9uKFApICYmIGlzRnVuY3Rpb24oUC5yZXNvbHZlKSAmJiBQLnJlc29sdmUodGVzdCA9IG5ldyBQKGZ1bmN0aW9uKCl7fSkpID09IHRlc3Q7XHJcbiAgICBzZXRQcm90byhQMiwgUCk7XHJcbiAgICBQMi5wcm90b3R5cGUgPSAkLmNyZWF0ZShQLnByb3RvdHlwZSwge2NvbnN0cnVjdG9yOiB7dmFsdWU6IFAyfX0pO1xyXG4gICAgLy8gYWN0dWFsIEZpcmVmb3ggaGFzIGJyb2tlbiBzdWJjbGFzcyBzdXBwb3J0LCB0ZXN0IHRoYXRcclxuICAgIGlmKCEoUDIucmVzb2x2ZSg1KS50aGVuKGZ1bmN0aW9uKCl7fSkgaW5zdGFuY2VvZiBQMikpe1xyXG4gICAgICB3b3JrcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cclxuICByZXR1cm4gd29ya3M7XHJcbn0oKTtcclxuXHJcbi8vIGhlbHBlcnNcclxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XHJcbiAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1BFQ0lFU107XHJcbiAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XHJcbn1cclxuZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XHJcbiAgdmFyIHRoZW47XHJcbiAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xyXG4gIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xyXG59XHJcbmZ1bmN0aW9uIG5vdGlmeShyZWNvcmQpe1xyXG4gIHZhciBjaGFpbiA9IHJlY29yZC5jO1xyXG4gIGlmKGNoYWluLmxlbmd0aClhc2FwKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxyXG4gICAgICAsIG9rICAgID0gcmVjb3JkLnMgPT0gMVxyXG4gICAgICAsIGkgICAgID0gMDtcclxuICAgIGZ1bmN0aW9uIHJ1bihyZWFjdCl7XHJcbiAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXHJcbiAgICAgICAgLCByZXQsIHRoZW47XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYoY2Ipe1xyXG4gICAgICAgICAgaWYoIW9rKXJlY29yZC5oID0gdHJ1ZTtcclxuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XHJcbiAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xyXG4gICAgICAgICAgICByZWFjdC5yZWooVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xyXG4gICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XHJcbiAgICAgICAgICB9IGVsc2UgcmVhY3QucmVzKHJldCk7XHJcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWFjdC5yZWooZXJyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSlydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXHJcbiAgICBjaGFpbi5sZW5ndGggPSAwO1xyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xyXG4gIHZhciByZWNvcmQgPSBwcm9taXNlW1JFQ09SRF1cclxuICAgICwgY2hhaW4gID0gcmVjb3JkLmEgfHwgcmVjb3JkLmNcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCByZWFjdDtcclxuICBpZihyZWNvcmQuaClyZXR1cm4gZmFsc2U7XHJcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XHJcbiAgICByZWFjdCA9IGNoYWluW2krK107XHJcbiAgICBpZihyZWFjdC5mYWlsIHx8ICFpc1VuaGFuZGxlZChyZWFjdC5QKSlyZXR1cm4gZmFsc2U7XHJcbiAgfSByZXR1cm4gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiAkcmVqZWN0KHZhbHVlKXtcclxuICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgLCBwcm9taXNlO1xyXG4gIGlmKHJlY29yZC5kKXJldHVybjtcclxuICByZWNvcmQuZCA9IHRydWU7XHJcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICByZWNvcmQudiA9IHZhbHVlO1xyXG4gIHJlY29yZC5zID0gMjtcclxuICByZWNvcmQuYSA9IHJlY29yZC5jLnNsaWNlKCk7XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgYXNhcChmdW5jdGlvbigpe1xyXG4gICAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlID0gcmVjb3JkLnApKXtcclxuICAgICAgICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcclxuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZihnbG9iYWwuY29uc29sZSAmJiBpc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKXtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmVjb3JkLmEgPSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICB9LCAxKTtcclxuICBub3RpZnkocmVjb3JkKTtcclxufVxyXG5mdW5jdGlvbiAkcmVzb2x2ZSh2YWx1ZSl7XHJcbiAgdmFyIHJlY29yZCA9IHRoaXNcclxuICAgICwgdGhlbiwgd3JhcHBlcjtcclxuICBpZihyZWNvcmQuZClyZXR1cm47XHJcbiAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgdHJ5IHtcclxuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XHJcbiAgICAgIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcclxuICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcclxuICAgICAgcmVjb3JkLnMgPSAxO1xyXG4gICAgICBub3RpZnkocmVjb3JkKTtcclxuICAgIH1cclxuICB9IGNhdGNoKGVycil7XHJcbiAgICAkcmVqZWN0LmNhbGwod3JhcHBlciB8fCB7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGVycik7IC8vIHdyYXBcclxuICB9XHJcbn1cclxuXHJcbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXHJcbmlmKCF1c2VOYXRpdmUpe1xyXG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXHJcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xyXG4gICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xyXG4gICAgdmFyIHJlY29yZCA9IHtcclxuICAgICAgcDogYXNzZXJ0Lmluc3QodGhpcywgUCwgUFJPTUlTRSksICAgICAgIC8vIDwtIHByb21pc2VcclxuICAgICAgYzogW10sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGF3YWl0aW5nIHJlYWN0aW9uc1xyXG4gICAgICBhOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcclxuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXHJcbiAgICAgIGQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBkb25lXHJcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICBoOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cclxuICAgIH07XHJcbiAgICAkLmhpZGUodGhpcywgUkVDT1JELCByZWNvcmQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCByZWNvcmQsIDEpLCBjdHgoJHJlamVjdCwgcmVjb3JkLCAxKSk7XHJcbiAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkLm1peChQLnByb3RvdHlwZSwge1xyXG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcclxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xyXG4gICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcykuY29uc3RydWN0b3IpW1NQRUNJRVNdO1xyXG4gICAgICB2YXIgcmVhY3QgPSB7XHJcbiAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXHJcbiAgICAgICAgZmFpbDogaXNGdW5jdGlvbihvblJlamVjdGVkKSAgPyBvblJlamVjdGVkICA6IGZhbHNlXHJcbiAgICAgIH07XHJcbiAgICAgIHZhciBwcm9taXNlID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUCkoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlcyk7XHJcbiAgICAgICAgcmVhY3QucmVqID0gYXNzZXJ0RnVuY3Rpb24ocmVqKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzW1JFQ09SRF07XHJcbiAgICAgIHJlY29yZC5jLnB1c2gocmVhY3QpO1xyXG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcclxuICAgICAgcmVjb3JkLnMgJiYgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfSxcclxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXHJcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcclxuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBleHBvcnRcclxuJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCB7UHJvbWlzZTogUH0pO1xyXG5jb2Yuc2V0KFAsIFBST01JU0UpO1xyXG5zcGVjaWVzKFApO1xyXG5zcGVjaWVzKCQuY29yZVtQUk9NSVNFXSk7IC8vIGZvciB3cmFwcGVyXHJcblxyXG4vLyBzdGF0aWNzXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgUFJPTUlTRSwge1xyXG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXHJcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocil7XHJcbiAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICByZWoocik7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxyXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoeCkgJiYgUkVDT1JEIGluIHggJiYgJC5nZXRQcm90byh4KSA9PT0gdGhpcy5wcm90b3R5cGVcclxuICAgICAgPyB4IDogbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICByZXMoeCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxufSk7XHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogISh1c2VOYXRpdmUgJiYgcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7XHJcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcclxufSkpLCBQUk9NSVNFLCB7XHJcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXHJcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xyXG4gICAgdmFyIEMgICAgICA9IGdldENvbnN0cnVjdG9yKHRoaXMpXHJcbiAgICAgICwgdmFsdWVzID0gW107XHJcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIHZhbHVlcy5wdXNoLCB2YWx1ZXMpO1xyXG4gICAgICB2YXIgcmVtYWluaW5nID0gdmFsdWVzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcclxuICAgICAgaWYocmVtYWluaW5nKSQuZWFjaC5jYWxsKHZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZSwgaW5kZXgpe1xyXG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXMocmVzdWx0cyk7XHJcbiAgICAgICAgfSwgcmVqKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGVsc2UgcmVzKHJlc3VsdHMpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXHJcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XHJcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlcywgcmVqKXtcclxuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcclxuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgc2V0UHJvdG8gID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpXHJcbiAgLCAkaXRlciAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIElURVIgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsIHN0ZXAgICAgICA9ICRpdGVyLnN0ZXBcclxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxyXG4gICwgZ2V0UHJvdG8gID0gJC5nZXRQcm90b1xyXG4gICwgJFJlZmxlY3QgID0gJC5nLlJlZmxlY3RcclxuICAsIF9hcHBseSAgICA9IEZ1bmN0aW9uLmFwcGx5XHJcbiAgLCBhc3NlcnRPYmplY3QgPSBhc3NlcnQub2JqXHJcbiAgLCBfaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCAkLmlzT2JqZWN0XHJcbiAgLCBfcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgJC5pdFxyXG4gIC8vIElFIFRQIGhhcyBicm9rZW4gUmVmbGVjdC5lbnVtZXJhdGVcclxuICAsIGJ1Z2d5RW51bWVyYXRlID0gISgkUmVmbGVjdCAmJiAkUmVmbGVjdC5lbnVtZXJhdGUgJiYgSVRFUkFUT1IgaW4gJFJlZmxlY3QuZW51bWVyYXRlKHt9KSk7XHJcblxyXG5mdW5jdGlvbiBFbnVtZXJhdGUoaXRlcmF0ZWQpe1xyXG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazogdW5kZWZpbmVkLCBpOiAwfSk7XHJcbn1cclxuJGl0ZXIuY3JlYXRlKEVudW1lcmF0ZSwgJ09iamVjdCcsIGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXHJcbiAgICAsIGtleXMgPSBpdGVyLmtcclxuICAgICwga2V5O1xyXG4gIGlmKGtleXMgPT0gdW5kZWZpbmVkKXtcclxuICAgIGl0ZXIuayA9IGtleXMgPSBbXTtcclxuICAgIGZvcihrZXkgaW4gaXRlci5vKWtleXMucHVzaChrZXkpO1xyXG4gIH1cclxuICBkbyB7XHJcbiAgICBpZihpdGVyLmkgPj0ga2V5cy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XHJcbiAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XHJcbiAgcmV0dXJuIHN0ZXAoMCwga2V5KTtcclxufSk7XHJcblxyXG52YXIgcmVmbGVjdCA9IHtcclxuICAvLyAyNi4xLjEgUmVmbGVjdC5hcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdClcclxuICBhcHBseTogZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3Qpe1xyXG4gICAgcmV0dXJuIF9hcHBseS5jYWxsKHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KTtcclxuICB9LFxyXG4gIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcclxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIGNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgLyosIG5ld1RhcmdldCovKXtcclxuICAgIHZhciBwcm90byAgICA9IGFzc2VydC5mbihhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXSkucHJvdG90eXBlXHJcbiAgICAgICwgaW5zdGFuY2UgPSAkLmNyZWF0ZShpc09iamVjdChwcm90bykgPyBwcm90byA6IE9iamVjdC5wcm90b3R5cGUpXHJcbiAgICAgICwgcmVzdWx0ICAgPSBfYXBwbHkuY2FsbCh0YXJnZXQsIGluc3RhbmNlLCBhcmd1bWVudHNMaXN0KTtcclxuICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XHJcbiAgfSxcclxuICAvLyAyNi4xLjMgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKVxyXG4gIGRlZmluZVByb3BlcnR5OiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKXtcclxuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgJC5zZXREZXNjKHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2goZSl7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIDI2LjEuNCBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgdmFyIGRlc2MgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XHJcbiAgfSxcclxuICAvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXHJcbiAgZ2V0OiBmdW5jdGlvbiBnZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcclxuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdXHJcbiAgICAgICwgZGVzYyA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcclxuICAgIGlmKGRlc2MpcmV0dXJuICQuaGFzKGRlc2MsICd2YWx1ZScpXHJcbiAgICAgID8gZGVzYy52YWx1ZVxyXG4gICAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgICA/IHVuZGVmaW5lZFxyXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XHJcbiAgICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKVxyXG4gICAgICA/IGdldChwcm90bywgcHJvcGVydHlLZXksIHJlY2VpdmVyKVxyXG4gICAgICA6IHVuZGVmaW5lZDtcclxuICB9LFxyXG4gIC8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxyXG4gIGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZih0YXJnZXQpe1xyXG4gICAgcmV0dXJuIGdldFByb3RvKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICB9LFxyXG4gIC8vIDI2LjEuOSBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gIGhhczogZnVuY3Rpb24gaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcclxuICB9LFxyXG4gIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxyXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKHRhcmdldCl7XHJcbiAgICByZXR1cm4gX2lzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfSxcclxuICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXHJcbiAgb3duS2V5czogcmVxdWlyZSgnLi8kLm93bi1rZXlzJyksXHJcbiAgLy8gMjYuMS4xMiBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRhcmdldClcclxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KXtcclxuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgX3ByZXZlbnRFeHRlbnNpb25zKHRhcmdldCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaChlKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWLyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cclxuICAgICAgLCBvd25EZXNjICA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpXHJcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcclxuICAgIGlmKCFvd25EZXNjKXtcclxuICAgICAgaWYoaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKSl7XHJcbiAgICAgICAgcmV0dXJuIHNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcclxuICAgICAgfVxyXG4gICAgICBvd25EZXNjID0gJC5kZXNjKDApO1xyXG4gICAgfVxyXG4gICAgaWYoJC5oYXMob3duRGVzYywgJ3ZhbHVlJykpe1xyXG4gICAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gJC5nZXREZXNjKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgJC5kZXNjKDApO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IudmFsdWUgPSBWO1xyXG4gICAgICAkLnNldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5LCBleGlzdGluZ0Rlc2NyaXB0b3IpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xyXG4gIH1cclxufTtcclxuLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXHJcbmlmKHNldFByb3RvKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKXtcclxuICBzZXRQcm90by5jaGVjayh0YXJnZXQsIHByb3RvKTtcclxuICB0cnkge1xyXG4gICAgc2V0UHJvdG8uc2V0KHRhcmdldCwgcHJvdG8pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG4kZGVmKCRkZWYuRywge1JlZmxlY3Q6IHt9fSk7XHJcblxyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqIGJ1Z2d5RW51bWVyYXRlLCAnUmVmbGVjdCcsIHtcclxuICAvLyAyNi4xLjUgUmVmbGVjdC5lbnVtZXJhdGUodGFyZ2V0KVxyXG4gIGVudW1lcmF0ZTogZnVuY3Rpb24gZW51bWVyYXRlKHRhcmdldCl7XHJcbiAgICByZXR1cm4gbmV3IEVudW1lcmF0ZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHJlZmxlY3QpOyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRSZWdFeHAgPSAkLmcuUmVnRXhwXHJcbiAgLCBCYXNlICAgID0gJFJlZ0V4cFxyXG4gICwgcHJvdG8gICA9ICRSZWdFeHAucHJvdG90eXBlXHJcbiAgLCByZSAgICAgID0gL2EvZ1xyXG4gIC8vIFwibmV3XCIgY3JlYXRlcyBhIG5ldyBvYmplY3RcclxuICAsIENPUlJFQ1RfTkVXID0gbmV3ICRSZWdFeHAocmUpICE9PSByZVxyXG4gIC8vIFJlZ0V4cCBhbGxvd3MgYSByZWdleCB3aXRoIGZsYWdzIGFzIHRoZSBwYXR0ZXJuXHJcbiAgLCBBTExPV1NfUkVfV0lUSF9GTEFHUyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gJFJlZ0V4cChyZSwgJ2knKSA9PSAnL2EvaSc7XHJcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbiAgfSgpO1xyXG5pZigkLkZXICYmICQuREVTQyl7XHJcbiAgaWYoIUNPUlJFQ1RfTkVXIHx8ICFBTExPV1NfUkVfV0lUSF9GTEFHUyl7XHJcbiAgICAkUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcclxuICAgICAgdmFyIHBhdHRlcm5Jc1JlZ0V4cCAgPSBjb2YocGF0dGVybikgPT0gJ1JlZ0V4cCdcclxuICAgICAgICAsIGZsYWdzSXNVbmRlZmluZWQgPSBmbGFncyA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICBpZighKHRoaXMgaW5zdGFuY2VvZiAkUmVnRXhwKSAmJiBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZClyZXR1cm4gcGF0dGVybjtcclxuICAgICAgcmV0dXJuIENPUlJFQ1RfTkVXXHJcbiAgICAgICAgPyBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgJiYgIWZsYWdzSXNVbmRlZmluZWQgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm4sIGZsYWdzKVxyXG4gICAgICAgIDogbmV3IEJhc2UocGF0dGVybklzUmVnRXhwID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuXHJcbiAgICAgICAgICAsIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5mbGFncyA6IGZsYWdzKTtcclxuICAgIH07XHJcbiAgICAkLmVhY2guY2FsbCgkLmdldE5hbWVzKEJhc2UpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBrZXkgaW4gJFJlZ0V4cCB8fCAkLnNldERlc2MoJFJlZ0V4cCwga2V5LCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIEJhc2Vba2V5XTsgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgQmFzZVtrZXldID0gaXQ7IH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gJFJlZ0V4cDtcclxuICAgICRSZWdFeHAucHJvdG90eXBlID0gcHJvdG87XHJcbiAgICAkLmhpZGUoJC5nLCAnUmVnRXhwJywgJFJlZ0V4cCk7XHJcbiAgfVxyXG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcclxuICBpZigvLi9nLmZsYWdzICE9ICdnJykkLnNldERlc2MocHJvdG8sICdmbGFncycsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxyXG4gIH0pO1xyXG59XHJcbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoJFJlZ0V4cCk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XHJcblxyXG4vLyAyMy4yIFNldCBPYmplY3RzXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1NldCcsIHtcclxuICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XHJcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XHJcbiAgfVxyXG59LCBzdHJvbmcpOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykoZmFsc2UpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcclxuICBjb2RlUG9pbnRBdDogZnVuY3Rpb24gY29kZVBvaW50QXQocG9zKXtcclxuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9MZW5ndGggPSAkLnRvTGVuZ3RoO1xyXG5cclxuLy8gc2hvdWxkIHRocm93IGVycm9yIG9uIHJlZ2V4XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyAncScuZW5kc1dpdGgoLy4vKTsgfSksICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxyXG4gIGVuZHNXaXRoOiBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHZhciB0aGF0ID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxyXG4gICAgICAsIGVuZCA9IGVuZFBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBsZW4gOiBNYXRoLm1pbih0b0xlbmd0aChlbmRQb3NpdGlvbiksIGxlbik7XHJcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XHJcbiAgICByZXR1cm4gdGhhdC5zbGljZShlbmQgLSBzZWFyY2hTdHJpbmcubGVuZ3RoLCBlbmQpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9JbmRleCA9IHJlcXVpcmUoJy4vJCcpLnRvSW5kZXhcclxuICAsIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGVcclxuICAsICRmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQ7XHJcblxyXG4vLyBsZW5ndGggc2hvdWxkIGJlIDEsIG9sZCBGRiBwcm9ibGVtXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogKCEhJGZyb21Db2RlUG9pbnQgJiYgJGZyb21Db2RlUG9pbnQubGVuZ3RoICE9IDEpLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXHJcbiAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24gZnJvbUNvZGVQb2ludCh4KXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gICAgdmFyIHJlcyA9IFtdXHJcbiAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAsIGkgICA9IDBcclxuICAgICAgLCBjb2RlO1xyXG4gICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgIGNvZGUgPSArYXJndW1lbnRzW2krK107XHJcbiAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xyXG4gICAgICByZXMucHVzaChjb2RlIDwgMHgxMDAwMFxyXG4gICAgICAgID8gZnJvbUNoYXJDb2RlKGNvZGUpXHJcbiAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxyXG4gICAgICApO1xyXG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjcgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyhzZWFyY2hTdHJpbmcsIHBvc2l0aW9uID0gMClcclxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xyXG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XHJcbiAgICByZXR1cm4gISF+U3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSkuaW5kZXhPZihzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSk7XHJcbiAgfVxyXG59KTsiLCJ2YXIgc2V0ICAgPSByZXF1aXJlKCcuLyQnKS5zZXRcclxuICAsICRhdCAgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpXHJcbiAgLCBJVEVSICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgc3RlcCAgPSAkaXRlci5zdGVwO1xyXG5cclxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XHJcbiAgc2V0KHRoaXMsIElURVIsIHtvOiBTdHJpbmcoaXRlcmF0ZWQpLCBpOiAwfSk7XHJcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxufSwgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAsIGluZGV4ID0gaXRlci5pXHJcbiAgICAsIHBvaW50O1xyXG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xyXG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcclxuICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xyXG4gIHJldHVybiBzdGVwKDAsIHBvaW50KTtcclxufSk7IiwidmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXHJcbiAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpe1xyXG4gICAgdmFyIHRwbCA9ICQudG9PYmplY3QoY2FsbFNpdGUucmF3KVxyXG4gICAgICAsIGxlbiA9ICQudG9MZW5ndGgodHBsLmxlbmd0aClcclxuICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgcmVzID0gW11cclxuICAgICAgLCBpICAgPSAwO1xyXG4gICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgIHJlcy5wdXNoKFN0cmluZyh0cGxbaSsrXSkpO1xyXG4gICAgICBpZihpIDwgc2xuKXJlcy5wdXNoKFN0cmluZyhhcmd1bWVudHNbaV0pKTtcclxuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICB9XHJcbn0pOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjEzIFN0cmluZy5wcm90b3R5cGUucmVwZWF0KGNvdW50KVxyXG4gIHJlcGVhdDogcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcblxyXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcclxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5zdGFydHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMy4xOCBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIFssIHBvc2l0aW9uIF0pXHJcbiAgc3RhcnRzV2l0aDogZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHZhciB0aGF0ICA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgaW5kZXggPSAkLnRvTGVuZ3RoKE1hdGgubWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcclxuICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cclxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHNldFRhZyAgID0gcmVxdWlyZSgnLi8kLmNvZicpLnNldFxyXG4gICwgdWlkICAgICAgPSByZXF1aXJlKCcuLyQudWlkJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBrZXlPZiAgICA9IHJlcXVpcmUoJy4vJC5rZXlvZicpXHJcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxyXG4gICwgaGFzICAgICAgPSAkLmhhc1xyXG4gICwgJGNyZWF0ZSAgPSAkLmNyZWF0ZVxyXG4gICwgZ2V0RGVzYyAgPSAkLmdldERlc2NcclxuICAsIHNldERlc2MgID0gJC5zZXREZXNjXHJcbiAgLCBkZXNjICAgICA9ICQuZGVzY1xyXG4gICwgZ2V0TmFtZXMgPSAkLmdldE5hbWVzXHJcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3RcclxuICAsICRTeW1ib2wgID0gJC5nLlN5bWJvbFxyXG4gICwgc2V0dGVyICAgPSBmYWxzZVxyXG4gICwgVEFHICAgICAgPSB1aWQoJ3RhZycpXHJcbiAgLCBISURERU4gICA9IHVpZCgnaGlkZGVuJylcclxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0ge31cclxuICAsIEFsbFN5bWJvbHMgPSB7fVxyXG4gICwgdXNlTmF0aXZlID0gJC5pc0Z1bmN0aW9uKCRTeW1ib2wpO1xyXG5cclxuZnVuY3Rpb24gd3JhcCh0YWcpe1xyXG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSAkLnNldCgkY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKSwgVEFHLCB0YWcpO1xyXG4gICQuREVTQyAmJiBzZXR0ZXIgJiYgc2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCB0YWcsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XHJcbiAgICAgIHNldERlc2ModGhpcywgdGFnLCBkZXNjKDEsIHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHN5bTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XHJcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSl7XHJcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcclxuICAgICAgaWYoIWhhcyhpdCwgSElEREVOKSlzZXREZXNjKGl0LCBISURERU4sIGRlc2MoMSwge30pKTtcclxuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0paXRbSElEREVOXVtrZXldID0gZmFsc2U7XHJcbiAgICAgIEQuZW51bWVyYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuIHNldERlc2MoaXQsIGtleSwgRCk7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XHJcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b09iamVjdChQKSlcclxuICAgICwgaSAgICA9IDBcclxuICAgICwgbCA9IGtleXMubGVuZ3RoXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsID4gaSlkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGUoaXQsIFApe1xyXG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyAkY3JlYXRlKGl0KSA6IGRlZmluZVByb3BlcnRpZXMoJGNyZWF0ZShpdCksIFApO1xyXG59XHJcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcclxuICB2YXIgRCA9IGdldERlc2MoaXQgPSB0b09iamVjdChpdCksIGtleSk7XHJcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XHJcbiAgcmV0dXJuIEQ7XHJcbn1cclxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XHJcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBrZXk7XHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4pcmVzdWx0LnB1c2goa2V5KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XHJcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBrZXk7XHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcclxuaWYoIXVzZU5hdGl2ZSl7XHJcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbChkZXNjcmlwdGlvbil7XHJcbiAgICBpZih0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xyXG4gICAgcmV0dXJuIHdyYXAodWlkKGRlc2NyaXB0aW9uKSk7XHJcbiAgfTtcclxuICAkLmhpZGUoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gIH0pO1xyXG5cclxuICAkLmNyZWF0ZSAgICAgPSBjcmVhdGU7XHJcbiAgJC5zZXREZXNjICAgID0gZGVmaW5lUHJvcGVydHk7XHJcbiAgJC5nZXREZXNjICAgID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG4gICQuc2V0RGVzY3MgICA9IGRlZmluZVByb3BlcnRpZXM7XHJcbiAgJC5nZXROYW1lcyAgID0gZ2V0T3duUHJvcGVydHlOYW1lcztcclxuICAkLmdldFN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcbn1cclxuXHJcbnZhciBzeW1ib2xTdGF0aWNzID0ge1xyXG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxyXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxyXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cclxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xyXG4gIH0sXHJcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXHJcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcclxuICAgIHJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcclxuICB9LFxyXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcclxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XHJcbn07XHJcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxyXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXHJcbi8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxyXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcclxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2VcclxuLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxyXG4vLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcclxuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xyXG4kLmVhY2guY2FsbCgoXHJcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xyXG4gICAgJ3NwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXHJcbiAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgc3ltID0gcmVxdWlyZSgnLi8kLndrcycpKGl0KTtcclxuICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gdXNlTmF0aXZlID8gc3ltIDogd3JhcChzeW0pO1xyXG4gIH1cclxuKTtcclxuXHJcbnNldHRlciA9IHRydWU7XHJcblxyXG4kZGVmKCRkZWYuRyArICRkZWYuVywge1N5bWJvbDogJFN5bWJvbH0pO1xyXG5cclxuJGRlZigkZGVmLlMsICdTeW1ib2wnLCBzeW1ib2xTdGF0aWNzKTtcclxuXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgJ09iamVjdCcsIHtcclxuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXHJcbiAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiAgZGVmaW5lUHJvcGVydHk6IGRlZmluZVByb3BlcnR5LFxyXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXHJcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllcyxcclxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXHJcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiBnZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcclxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IGdldE93blByb3BlcnR5U3ltYm9sc1xyXG59KTtcclxuXHJcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cclxuc2V0VGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcclxuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxyXG5zZXRUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcclxuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cclxuc2V0VGFnKCQuZy5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCB3ZWFrICAgICAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJylcclxuICAsIGxlYWtTdG9yZSA9IHdlYWsubGVha1N0b3JlXHJcbiAgLCBJRCAgICAgICAgPSB3ZWFrLklEXHJcbiAgLCBXRUFLICAgICAgPSB3ZWFrLldFQUtcclxuICAsIGhhcyAgICAgICA9ICQuaGFzXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBpc0Zyb3plbiAgPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgdG1wICAgICAgID0ge307XHJcblxyXG4vLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xyXG52YXIgV2Vha01hcCA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtNYXAnLCB7XHJcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xyXG4gICAgaWYoaXNPYmplY3Qoa2V5KSl7XHJcbiAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5nZXQoa2V5KTtcclxuICAgICAgaWYoaGFzKGtleSwgV0VBSykpcmV0dXJuIGtleVtXRUFLXVt0aGlzW0lEXV07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyAyMy4zLjMuNSBXZWFrTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCBrZXksIHZhbHVlKTtcclxuICB9XHJcbn0sIHdlYWssIHRydWUsIHRydWUpO1xyXG5cclxuLy8gSUUxMSBXZWFrTWFwIGZyb3plbiBrZXlzIGZpeFxyXG5pZigkLkZXICYmIG5ldyBXZWFrTWFwKCkuc2V0KChPYmplY3QuZnJlZXplIHx8IE9iamVjdCkodG1wKSwgNykuZ2V0KHRtcCkgIT0gNyl7XHJcbiAgJC5lYWNoLmNhbGwoWydkZWxldGUnLCAnaGFzJywgJ2dldCcsICdzZXQnXSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIHZhciBtZXRob2QgPSBXZWFrTWFwLnByb3RvdHlwZVtrZXldO1xyXG4gICAgV2Vha01hcC5wcm90b3R5cGVba2V5XSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBsZWFreSBtYXBcclxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgaXNGcm96ZW4oYSkpe1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBsZWFrU3RvcmUodGhpcylba2V5XShhLCBiKTtcclxuICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcclxuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXHJcbiAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xyXG4gICAgfTtcclxuICB9KTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxudmFyIHdlYWsgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJyk7XHJcblxyXG4vLyAyMy40IFdlYWtTZXQgT2JqZWN0c1xyXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrU2V0Jywge1xyXG4gIC8vIDIzLjQuMy4xIFdlYWtTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XHJcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywgdmFsdWUsIHRydWUpO1xyXG4gIH1cclxufSwgd2VhaywgZmFsc2UsIHRydWUpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG52YXIgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkaW5jbHVkZXMgPSByZXF1aXJlKCcuLyQuYXJyYXktaW5jbHVkZXMnKSh0cnVlKTtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdpbmNsdWRlcycpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzkzNTM3ODFcclxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgb3duS2V5cyA9IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpO1xyXG5cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmplY3Qpe1xyXG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIHJlc3VsdCA9IHt9O1xyXG4gICAgJC5lYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgJC5zZXREZXNjKHJlc3VsdCwga2V5LCAkLmRlc2MoMCwgJC5nZXREZXNjKE8sIGtleSkpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbn0pOyIsIi8vIGh0dHA6Ly9nb28uZ2wvWGtCcmpEXHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdFRvQXJyYXkoaXNFbnRyaWVzKXtcclxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcclxuICAgICAgLCBrZXlzICAgPSAkLmdldEtleXMoTylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGkgICAgICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBBcnJheShsZW5ndGgpXHJcbiAgICAgICwga2V5O1xyXG4gICAgaWYoaXNFbnRyaWVzKXdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gW2tleSA9IGtleXNbaSsrXSwgT1trZXldXTtcclxuICAgIGVsc2Ugd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBPW2tleXNbaSsrXV07XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgdmFsdWVzOiAgY3JlYXRlT2JqZWN0VG9BcnJheShmYWxzZSksXHJcbiAgZW50cmllczogY3JlYXRlT2JqZWN0VG9BcnJheSh0cnVlKVxyXG59KTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYW5nYXgvOTY5ODEwMFxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdSZWdFeHAnLCB7XHJcbiAgZXNjYXBlOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvKFtcXFxcXFwtW1xcXXt9KCkqKz8uLF4kfF0pL2csICdcXFxcJDEnLCB0cnVlKVxyXG59KTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXRvLWpzb24nKSgnU2V0Jyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxyXG4ndXNlIHN0cmljdCc7XHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBhdDogZnVuY3Rpb24gYXQocG9zKXtcclxuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBscGFkOiBmdW5jdGlvbiBscGFkKG4pe1xyXG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCB0cnVlKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBycGFkOiBmdW5jdGlvbiBycGFkKG4pe1xyXG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCBmYWxzZSk7XHJcbiAgfVxyXG59KTsiLCIvLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkQXJyYXkgID0gJC5jb3JlLkFycmF5IHx8IEFycmF5XHJcbiAgLCBzdGF0aWNzID0ge307XHJcbmZ1bmN0aW9uIHNldFN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcclxuICAkLmVhY2guY2FsbChrZXlzLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICBpZihsZW5ndGggPT0gdW5kZWZpbmVkICYmIGtleSBpbiAkQXJyYXkpc3RhdGljc1trZXldID0gJEFycmF5W2tleV07XHJcbiAgICBlbHNlIGlmKGtleSBpbiBbXSlzdGF0aWNzW2tleV0gPSByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgW11ba2V5XSwgbGVuZ3RoKTtcclxuICB9KTtcclxufVxyXG5zZXRTdGF0aWNzKCdwb3AscmV2ZXJzZSxzaGlmdCxrZXlzLHZhbHVlcyxlbnRyaWVzJywgMSk7XHJcbnNldFN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcclxuc2V0U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xyXG4gICAgICAgICAgICdyZWR1Y2UscmVkdWNlUmlnaHQsY29weVdpdGhpbixmaWxsLHR1cm4nKTtcclxuJGRlZigkZGVmLlMsICdBcnJheScsIHN0YXRpY3MpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XHJcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBJdGVyYXRvcnMgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuSXRlcmF0b3JzXHJcbiAgLCBJVEVSQVRPUiAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgQXJyYXlWYWx1ZXMgPSBJdGVyYXRvcnMuQXJyYXlcclxuICAsIE5vZGVMaXN0ICAgID0gJC5nLk5vZGVMaXN0O1xyXG5pZigkLkZXICYmIE5vZGVMaXN0ICYmICEoSVRFUkFUT1IgaW4gTm9kZUxpc3QucHJvdG90eXBlKSl7XHJcbiAgJC5oaWRlKE5vZGVMaXN0LnByb3RvdHlwZSwgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcclxufVxyXG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBBcnJheVZhbHVlczsiLCJ2YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICR0YXNrID0gcmVxdWlyZSgnLi8kLnRhc2snKTtcclxuJGRlZigkZGVmLkcgKyAkZGVmLkIsIHtcclxuICBzZXRJbW1lZGlhdGU6ICAgJHRhc2suc2V0LFxyXG4gIGNsZWFySW1tZWRpYXRlOiAkdGFzay5jbGVhclxyXG59KTsiLCIvLyBpZTktIHNldFRpbWVvdXQgJiBzZXRJbnRlcnZhbCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgZml4XHJcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpbnZva2UgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcclxuICAsIHBhcnRpYWwgICA9IHJlcXVpcmUoJy4vJC5wYXJ0aWFsJylcclxuICAsIG5hdmlnYXRvciA9ICQuZy5uYXZpZ2F0b3JcclxuICAsIE1TSUUgICAgICA9ICEhbmF2aWdhdG9yICYmIC9NU0lFIC5cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7IC8vIDwtIGRpcnR5IGllOS0gY2hlY2tcclxuZnVuY3Rpb24gd3JhcChzZXQpe1xyXG4gIHJldHVybiBNU0lFID8gZnVuY3Rpb24oZm4sIHRpbWUgLyosIC4uLmFyZ3MgKi8pe1xyXG4gICAgcmV0dXJuIHNldChpbnZva2UoXHJcbiAgICAgIHBhcnRpYWwsXHJcbiAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcclxuICAgICAgJC5pc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pXHJcbiAgICApLCB0aW1lKTtcclxuICB9IDogc2V0O1xyXG59XHJcbiRkZWYoJGRlZi5HICsgJGRlZi5CICsgJGRlZi5GICogTVNJRSwge1xyXG4gIHNldFRpbWVvdXQ6ICB3cmFwKCQuZy5zZXRUaW1lb3V0KSxcclxuICBzZXRJbnRlcnZhbDogd3JhcCgkLmcuc2V0SW50ZXJ2YWwpXHJcbn0pOyIsInJlcXVpcmUoJy4vbW9kdWxlcy9lczUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmlzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuZnVuY3Rpb24uaGFzLWluc3RhbmNlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLmNvbnN0cnVjdG9yJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yYXcnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcucmVwZWF0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5Lm9mJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3InKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4nKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maWxsJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQtaW5kZXgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWdleHAnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWFwJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc2V0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYud2Vhay1tYXAnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLXNldCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5hdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5scGFkJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXknKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5tYXAudG8tanNvbicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIudGltZXJzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuaW1tZWRpYXRlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9tb2R1bGVzLyQnKS5jb3JlO1xyXG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciBpdGVyYXRvclN5bWJvbCA9XG4gICAgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKChvdXRlckZuIHx8IEdlbmVyYXRvcikucHJvdG90eXBlKTtcblxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChcbiAgICAgIGlubmVyRm4sIHNlbGYgfHwgbnVsbCxcbiAgICAgIG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKVxuICAgICk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuZXJhdG9yID0gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCk7XG4gICAgICB2YXIgY2FsbE5leHQgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgICB2YXIgY2FsbFRocm93ID0gc3RlcC5iaW5kKGdlbmVyYXRvciwgXCJ0aHJvd1wiKTtcblxuICAgICAgZnVuY3Rpb24gc3RlcChtZXRob2QsIGFyZykge1xuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbmZvLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaW5mby52YWx1ZSkudGhlbihjYWxsTmV4dCwgY2FsbFRocm93KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsTmV4dCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiIHx8XG4gICAgICAgICAgICAgIChtZXRob2QgPT09IFwidGhyb3dcIiAmJiBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAvLyBBIHJldHVybiBvciB0aHJvdyAod2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIHRocm93XG4gICAgICAgICAgICAvLyBtZXRob2QpIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgICB2YXIgcmV0dXJuTWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl07XG4gICAgICAgICAgICBpZiAocmV0dXJuTWV0aG9kKSB7XG4gICAgICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChyZXR1cm5NZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBhcmcpO1xuICAgICAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXR1cm4gbWV0aG9kIHRocmV3IGFuIGV4Y2VwdGlvbiwgbGV0IHRoYXRcbiAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gcHJldmFpbCBvdmVyIHRoZSBvcmlnaW5hbCByZXR1cm4gb3IgdGhyb3cuXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSBvdXRlciByZXR1cm4sIG5vdyB0aGF0IHRoZSBkZWxlZ2F0ZVxuICAgICAgICAgICAgICAvLyBpdGVyYXRvciBoYXMgYmVlbiB0ZXJtaW5hdGVkLlxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZUdlbmVyYXRvck1ldGhvZChtZXRob2QpIHtcbiAgICBHcFttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICB9O1xuICB9XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcIm5leHRcIik7XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcInRocm93XCIpO1xuICBkZWZpbmVHZW5lcmF0b3JNZXRob2QoXCJyZXR1cm5cIik7XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICAvLyBQcmUtaW5pdGlhbGl6ZSBhdCBsZWFzdCAyMCB0ZW1wb3JhcnkgdmFyaWFibGVzIHRvIGVuYWJsZSBoaWRkZW5cbiAgICAgIC8vIGNsYXNzIG9wdGltaXphdGlvbnMgZm9yIHNpbXBsZSBnZW5lcmF0b3JzLlxuICAgICAgZm9yICh2YXIgdGVtcEluZGV4ID0gMCwgdGVtcE5hbWU7XG4gICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIHRlbXBOYW1lID0gXCJ0XCIgKyB0ZW1wSW5kZXgpIHx8IHRlbXBJbmRleCA8IDIwO1xuICAgICAgICAgICArK3RlbXBJbmRleCkge1xuICAgICAgICB0aGlzW3RlbXBOYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcbiAgICAgICAgcmV0dXJuICEhY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDpcbiAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDogdGhpc1xuKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2JhYmVsL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZS9wb2x5ZmlsbFwiKTtcbiIsImV4cG9ydCB2YXIgZ2V0QXR0YWNrZXIgPSAoKCkgPT4ge1xyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJyZXF1aXJlKFwiYmFiZWwvcG9seWZpbGxcIik7XHJcblxyXG5pbXBvcnQge0RpYWdvbmFsLCBSZWN0YW5ndWxhcn0gZnJvbSBcIi4uL0NvbnN0YW50cy9CYXNlcy5qc1wiO1xyXG5pbXBvcnQge1Bob3RvbnNTaXplLCBNaW5TaGFyZWRLZXlMZW5ndGh9IGZyb20gXCIuLi9Db25maWcvQXBwQ29uZmlnLmpzXCI7XHJcblxyXG5leHBvcnQgdmFyIGdldEJhc2VDb21tdW5pY2F0b3IgPSAoKCkgPT4ge1xyXG5cclxuICAgIHZhciByYW5kb21CYXNpcyA9IFtdLFxyXG4gICAgICAgIG90aGVyQmFzaXMgPSBbXSxcclxuICAgICAgICBzaGFyZWRLZXkgPSBbXSxcclxuICAgICAgICBwaG90b25zID0gW10sXHJcbiAgICAgICAgZGVjaXNpb24gPSB1bmRlZmluZWQsXHJcbiAgICAgICAgb3RoZXJEZWNpc2lvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvL2pzY3M6ZGlzYWJsZVxyXG4gICAgZnVuY3Rpb24qIGJhc2lzR2VuZXJhdG9yKCkge1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IFBob3RvbnNTaXplKSB7XHJcbiAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgeWllbGQgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgyKSkgPT09IDEpID8gRGlhZ29uYWwgOiBSZWN0YW5ndWxhcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL2pzY3M6ZW5hYmxlXHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb21CYXNpcygpIHtcclxuICAgICAgICB0aGlzLnJhbmRvbUJhc2lzID0gW107XHJcbiAgICAgICAgdmFyIGdlbiA9IGJhc2lzR2VuZXJhdG9yKCksXHJcbiAgICAgICAgICAgIGkgPSBnZW4ubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgIHdoaWxlIChpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaSA9IGdlbi5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZG9tQmFzaXMucHVzaChpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1ZhbGlkQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBjaGFubmVsID09PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgICAgY2hhbm5lbC5CYXNpc1VzZWQgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICBjaGFubmVsLlBob3RvbnMgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICBjaGFubmVsLkRlY2lzaW9uID09PSB1bmRlZmluZWRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdGhyb3cgYEJhc2VDb21tdW5pY2F0b3IuanMgLSBpc1ZhbGlkQ2hhbm5lbCgpIC0gSW52YWxpZCBjaGFubmVsIHByb3ZpZGVkLmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlYWRCYXNpc0Zyb21DaGFubmVsKGNoYW5uZWwpIHtcclxuICAgICAgICBpZiAoaXNWYWxpZENoYW5uZWwoY2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgdGhpcy5vdGhlckJhc2lzID0gY2hhbm5lbC5CYXNpc1VzZWQuc2xpY2UoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbmRCYXNpc1RvQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgaWYgKGlzVmFsaWRDaGFubmVsKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgIGNoYW5uZWwuQmFzaXNVc2VkID0gdGhpcy5yYW5kb21CYXNpcy5zbGljZSgwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVjaWRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNoYXJlZEtleSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuc2hhcmVkS2V5Lmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IGBCYXNlQ29tbXVuaWNhdG9yLmpzIC0gZGVjaWRlKCkgLSBTaGFyZWQga2V5IGlzIGludmFsaWQuYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWNpc2lvbiA9ICh0aGlzLnNoYXJlZEtleS5sZW5ndGggPj0gTWluU2hhcmVkS2V5TGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZW5kRGVjaXNpb25Ub0NoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkQ2hhbm5lbChjaGFubmVsKSkge1xyXG4gICAgICAgICAgICBjaGFubmVsLkRlY2lzaW9uID0gdGhpcy5kZWNpc2lvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVhZERlY2lzaW9uRnJvbUNoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkQ2hhbm5lbChjaGFubmVsKSkge1xyXG4gICAgICAgICAgICB0aGlzLm90aGVyRGVjaXNpb24gPSBjaGFubmVsLkRlY2lzaW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHBob3RvbnM6IHBob3RvbnMsXHJcbiAgICAgICAgcmFuZG9tQmFzaXM6IHJhbmRvbUJhc2lzLFxyXG4gICAgICAgIG90aGVyQmFzaXM6IG90aGVyQmFzaXMsXHJcbiAgICAgICAgc2hhcmVkS2V5OiBzaGFyZWRLZXksXHJcbiAgICAgICAgaXNWYWxpZENoYW5uZWw6IGlzVmFsaWRDaGFubmVsLFxyXG4gICAgICAgIGdlbmVyYXRlUmFuZG9tQmFzaXM6IGdlbmVyYXRlUmFuZG9tQmFzaXMsXHJcbiAgICAgICAgcmVhZEJhc2lzRnJvbUNoYW5uZWw6IHJlYWRCYXNpc0Zyb21DaGFubmVsLFxyXG4gICAgICAgIHNlbmRCYXNpc1RvQ2hhbm5lbDogc2VuZEJhc2lzVG9DaGFubmVsLFxyXG4gICAgICAgIGRlY2lkZTogZGVjaWRlLFxyXG4gICAgICAgIHNlbmREZWNpc2lvblRvQ2hhbm5lbDogc2VuZERlY2lzaW9uVG9DaGFubmVsLFxyXG4gICAgICAgIHJlYWREZWNpc2lvbkZyb21DaGFubmVsOiByZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbFxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJyZXF1aXJlKFwiYmFiZWwvcG9seWZpbGxcIik7XHJcblxyXG5pbXBvcnQge2dldFBob3Rvbn0gZnJvbSBcIi4uL01lc3NhZ2VzL1Bob3Rvbi5qc1wiXHJcbmltcG9ydCB7Z2V0QmFzZUNvbW11bmljYXRvcn0gZnJvbSBcIi4vQmFzZUNvbW11bmljYXRvci5qc1wiO1xyXG5pbXBvcnQge1Bob3RvbnNTaXplfSBmcm9tIFwiLi4vQ29uZmlnL0FwcENvbmZpZy5qc1wiO1xyXG5pbXBvcnQge0RlZ3JlZXN9IGZyb20gXCIuLi9Db25zdGFudHMvUG9sYXJpemF0aW9ucy5qc1wiO1xyXG5pbXBvcnQge0RpYWdvbmFsLCBSZWN0YW5ndWxhcn0gZnJvbSBcIi4uL0NvbnN0YW50cy9CYXNlcy5qc1wiO1xyXG5cclxuZXhwb3J0IHZhciBnZXRSZWNlaXZlciA9ICgoKSA9PiB7XHJcblxyXG4gICAgdmFyIEJhc2VDb21tdW5pY2F0b3IgPSBnZXRCYXNlQ29tbXVuaWNhdG9yKCksXHJcbiAgICAgICAgbWVhc3VyZWRQb2xhcml6YXRpb25zID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlQml0KGJhc2lzLCBwb2xhcml6YXRpb24pIHtcclxuICAgICAgICBpZiAoYmFzaXMgIT09IERpYWdvbmFsICYmIGJhc2lzICE9PSBSZWN0YW5ndWxhcikge1xyXG4gICAgICAgICAgICB0aHJvdyBgUmVjZWl2ZXIuanMgLSBjYWxjdWxhdGVCaXQoKSAtIEludmFsaWQgcGFyYW1ldGVycy4gQmFzaXM6ICR7YmFzaXN9IFBvbGFyaXphdGlvbjogJHtwb2xhcml6YXRpb259YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJhc2lzID09PSBSZWN0YW5ndWxhcikge1xyXG4gICAgICAgICAgICBpZiAocG9sYXJpemF0aW9uID09PSBEZWdyZWVzLlplcm8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwb2xhcml6YXRpb24gPT09IERlZ3JlZXMuRm9ydHlGaXZlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1lYXN1cmVQaG90b25zRnJvbUNoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIGlmIChCYXNlQ29tbXVuaWNhdG9yLmlzVmFsaWRDaGFubmVsKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVhc3VyZWRQb2xhcml6YXRpb25zID0gW107XHJcbiAgICAgICAgICAgIEJhc2VDb21tdW5pY2F0b3IucGhvdG9ucyA9IGNoYW5uZWwuUGhvdG9ucy5zbGljZSgwKTtcclxuICAgICAgICAgICAgaWYgKEJhc2VDb21tdW5pY2F0b3IucGhvdG9ucy5sZW5ndGggPT09IEJhc2VDb21tdW5pY2F0b3IucmFuZG9tQmFzaXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEJhc2VDb21tdW5pY2F0b3IucGhvdG9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNpcyA9IEJhc2VDb21tdW5pY2F0b3IucmFuZG9tQmFzaXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWFzdXJlZFBvbGFyaXphdGlvbnNbaV0gPSBCYXNlQ29tbXVuaWNhdG9yLnBob3RvbnNbaV0ubWVhc3VyZShiYXNpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBgUmVjZWl2ZXIuanMgLSBtZWFzdXJlUG9sYXJpemF0aW9uc0Zyb21DaGFubmVsKCkgLSBMZW5ndGggb2Ygc2VuZGVyIHBvbGFycyBpcyBub3Qgc2FtZSBhcyByZWNlaXZlciByYW5kb20gYmFzaXMuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZVNoYXJlZEtleSgpIHtcclxuICAgICAgICBpZiAoQmFzZUNvbW11bmljYXRvci5yYW5kb21CYXNpcy5sZW5ndGggIT09IEJhc2VDb21tdW5pY2F0b3Iub3RoZXJCYXNpcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgYFJlY2VpdmVyLmpzIC0gZ2VuZXJhdGVTaGFyZWRLZXkoKSAtIExlbmd0aCBvZiByYW5kb20gYmFzaXMgYW5kIG90aGVyIGJhc2lzIGFyZSBub3QgZXF1YWwuYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWVhc3VyZWRQb2xhcml6YXRpb25zLmxlbmd0aCAhPT0gQmFzZUNvbW11bmljYXRvci5yYW5kb21CYXNpcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgYFJlY2VpdmVyLmpzIC0gZ2VuZXJhdGVTaGFyZWRLZXkoKSAtIExlbmd0aCBvZiBtZWFzdXJlZCBwb2xhcml6YXRpb25zIGFuZCByYW5kb20gYmFzaXMgYXJlIG5vdCBlcXVhbC5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWVhc3VyZWRQb2xhcml6YXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBiYXNpcyA9IEJhc2VDb21tdW5pY2F0b3IucmFuZG9tQmFzaXNbaV0sXHJcbiAgICAgICAgICAgICAgICBvdGhlckJhc2lzID0gQmFzZUNvbW11bmljYXRvci5vdGhlckJhc2lzW2ldO1xyXG4gICAgICAgICAgICBpZiAoYmFzaXMgPT09IG90aGVyQmFzaXMpIHtcclxuICAgICAgICAgICAgICAgIEJhc2VDb21tdW5pY2F0b3Iuc2hhcmVkS2V5LnB1c2goY2FsY3VsYXRlQml0KGJhc2lzLCB0aGlzLm1lYXN1cmVkUG9sYXJpemF0aW9uc1tpXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qIEJhc2UgQ2FsbHMgKi9cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tQmFzaXMoKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5nZW5lcmF0ZVJhbmRvbUJhc2lzKCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzZW5kQmFzaXNUb0NoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIEJhc2VDb21tdW5pY2F0b3Iuc2VuZEJhc2lzVG9DaGFubmVsKGNoYW5uZWwpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVhZEJhc2lzRnJvbUNoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIEJhc2VDb21tdW5pY2F0b3IucmVhZEJhc2lzRnJvbUNoYW5uZWwoY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBkZWNpZGUoKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5kZWNpZGUoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNlbmREZWNpc2lvblRvQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5zZW5kRGVjaXNpb25Ub0NoYW5uZWwoY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5yZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbChjaGFubmVsKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1lYXN1cmVkUG9sYXJpemF0aW9uczogbWVhc3VyZWRQb2xhcml6YXRpb25zLFxyXG4gICAgICAgIGdlbmVyYXRlUmFuZG9tQmFzaXM6IGdlbmVyYXRlUmFuZG9tQmFzaXMsXHJcbiAgICAgICAgbWVhc3VyZVBob3RvbnNGcm9tQ2hhbm5lbDogbWVhc3VyZVBob3RvbnNGcm9tQ2hhbm5lbCxcclxuICAgICAgICBzZW5kQmFzaXNUb0NoYW5uZWw6IHNlbmRCYXNpc1RvQ2hhbm5lbCxcclxuICAgICAgICByZWFkQmFzaXNGcm9tQ2hhbm5lbDogcmVhZEJhc2lzRnJvbUNoYW5uZWwsXHJcbiAgICAgICAgZ2VuZXJhdGVTaGFyZWRLZXk6IGdlbmVyYXRlU2hhcmVkS2V5LFxyXG4gICAgICAgIGRlY2lkZTogZGVjaWRlLFxyXG4gICAgICAgIHNlbmREZWNpc2lvblRvQ2hhbm5lbDogc2VuZERlY2lzaW9uVG9DaGFubmVsLFxyXG4gICAgICAgIHJlYWREZWNpc2lvbkZyb21DaGFubmVsOiByZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbFxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJyZXF1aXJlKFwiYmFiZWwvcG9seWZpbGxcIik7XHJcblxyXG5pbXBvcnQge2dldFBob3Rvbn0gZnJvbSBcIi4uL01lc3NhZ2VzL1Bob3Rvbi5qc1wiXHJcbmltcG9ydCB7Z2V0QmFzZUNvbW11bmljYXRvcn0gZnJvbSBcIi4vQmFzZUNvbW11bmljYXRvci5qc1wiO1xyXG5pbXBvcnQge1Bob3RvbnNTaXplfSBmcm9tIFwiLi4vQ29uZmlnL0FwcENvbmZpZy5qc1wiO1xyXG5pbXBvcnQge0RlZ3JlZXN9IGZyb20gXCIuLi9Db25zdGFudHMvUG9sYXJpemF0aW9ucy5qc1wiO1xyXG5pbXBvcnQge0RpYWdvbmFsLCBSZWN0YW5ndWxhcn0gZnJvbSBcIi4uL0NvbnN0YW50cy9CYXNlcy5qc1wiO1xyXG5cclxuZXhwb3J0IHZhciBnZXRTZW5kZXIgPSAoKCkgPT4ge1xyXG5cclxuICAgIHZhciBCYXNlQ29tbXVuaWNhdG9yID0gZ2V0QmFzZUNvbW11bmljYXRvcigpLFxyXG4gICAgICAgIHJhbmRvbUJpdHMgPSBbXTtcclxuXHJcbiAgICAvL2pzY3M6ZGlzYWJsZVxyXG4gICAgZnVuY3Rpb24qIGJpdEdlbmVyYXRvcigpIHtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGkgPCBQaG90b25zU2l6ZSkge1xyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIHlpZWxkIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy9qc2NzOmVuYWJsZVxyXG5cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tQml0cygpIHtcclxuICAgICAgICB0aGlzLnJhbmRvbUJpdHMgPSBbXTtcclxuICAgICAgICB2YXIgZ2VuID0gYml0R2VuZXJhdG9yKCksXHJcbiAgICAgICAgICAgIGkgPSBnZW4ubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgIHdoaWxlIChpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaSA9IGdlbi5uZXh0KCkudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZG9tQml0cy5wdXNoKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZVBvbGFyaXphdGlvbihiaXQsIGJhc2lzKSB7XHJcbiAgICAgICAgaWYgKChiaXQgIT09IDAgJiYgYml0ICE9PSAxKSB8fCAoYmFzaXMgIT09IERpYWdvbmFsICYmIGJhc2lzICE9PSBSZWN0YW5ndWxhcikpIHtcclxuICAgICAgICAgICAgdGhyb3cgYFNlbmRlci5qcyAtIGNhbGN1bGF0ZVBvbGFyaXphdGlvbigpIC0gSW52YWxpZCBwYXJhbWV0ZXJzLiBCaXQ6ICR7Yml0fSBCYXNpczogJHtiYXNpc31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFzaXMgPT09IFJlY3Rhbmd1bGFyKSB7XHJcbiAgICAgICAgICAgIGlmIChiaXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBEZWdyZWVzLlplcm87XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRGVncmVlcy5OaW5ldHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYml0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRGVncmVlcy5Gb3J0eUZpdmU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRGVncmVlcy5PbmVIdW5kcmVkVGhpcnR5Rml2ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVQb2xhcml6YXRpb25zKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJhbmRvbUJpdHMgPT09IHVuZGVmaW5lZCB8fCBCYXNlQ29tbXVuaWNhdG9yLnJhbmRvbUJhc2lzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1NlbmRlci5qcyAtIGNhbGN1bGF0ZVBvbGFyaXphdGlvbnMoKSAtIHJhbmRvbUJpdHMgfHwgcmFuZG9tQmFzaXMgbm90IGdlbmVyYXRlZC4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5yYW5kb21CaXRzLmxlbmd0aCAhPT0gQmFzZUNvbW11bmljYXRvci5yYW5kb21CYXNpcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1NlbmRlci5qcyAtIGNhbGN1bGF0ZVBvbGFyaXphdGlvbnMoKSAtIE51bWJlciBvZiBiaXRzIGlzIG5vdCBzYW1lIGFzIG51bWJlciBvZiBiYXNpcy4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZG9tQml0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcGhvdG9uID0gZ2V0UGhvdG9uKCksXHJcbiAgICAgICAgICAgICAgICBwb2xhcml6YXRpb24gPSBjYWxjdWxhdGVQb2xhcml6YXRpb24odGhpcy5yYW5kb21CaXRzW2ldLCBCYXNlQ29tbXVuaWNhdG9yLnJhbmRvbUJhc2lzW2ldKTtcclxuICAgICAgICAgICAgcGhvdG9uLnNldFN0YXRlKHBvbGFyaXphdGlvbik7XHJcbiAgICAgICAgICAgIHBob3Rvbi5zZXRCYXNpcyhCYXNlQ29tbXVuaWNhdG9yLnJhbmRvbUJhc2lzW2ldKTtcclxuICAgICAgICAgICAgQmFzZUNvbW11bmljYXRvci5waG90b25zLnB1c2gocGhvdG9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2VuZFBob3RvbnNUb0NoYW5uZWwoY2hhbm5lbCkge1xyXG4gICAgICAgIGlmIChCYXNlQ29tbXVuaWNhdG9yLmlzVmFsaWRDaGFubmVsKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgIGNoYW5uZWwuUGhvdG9ucyA9IEJhc2VDb21tdW5pY2F0b3IucGhvdG9ucy5zbGljZSgwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVTaGFyZWRLZXkoKSB7XHJcbiAgICAgICAgaWYgKEJhc2VDb21tdW5pY2F0b3IucmFuZG9tQmFzaXMubGVuZ3RoICE9PSBCYXNlQ29tbXVuaWNhdG9yLm90aGVyQmFzaXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiU2VuZGVyLmpzIC0gZ2VuZXJhdGVTaGFyZWRLZXkoKSAtIExlbmd0aCBvZiByYW5kb20gYmFzaXMgYW5kIG90aGVyIGJhc2lzIGFyZSBub3QgZXF1YWwuXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnJhbmRvbUJpdHMubGVuZ3RoICE9PSBCYXNlQ29tbXVuaWNhdG9yLnJhbmRvbUJhc2lzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIlNlbmRlci5qcyAtIGdlbmVyYXRlU2hhcmVkS2V5KCkgLSBMZW5ndGggb2YgcmFuZG9tIGJpdHMgYW5kIHJhbmRvbSBiYXNpcyBhcmUgbm90IGVxdWFsLlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZG9tQml0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYmFzaXMgPSBCYXNlQ29tbXVuaWNhdG9yLnJhbmRvbUJhc2lzW2ldLFxyXG4gICAgICAgICAgICAgICAgb3RoZXJCYXNpcyA9IEJhc2VDb21tdW5pY2F0b3Iub3RoZXJCYXNpc1tpXTtcclxuICAgICAgICAgICAgaWYgKGJhc2lzID09PSBvdGhlckJhc2lzKSB7XHJcbiAgICAgICAgICAgICAgICBCYXNlQ29tbXVuaWNhdG9yLnNoYXJlZEtleS5wdXNoKHRoaXMucmFuZG9tQml0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyogQmFzZSBDYWxscyAqL1xyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb21CYXNpcygpIHtcclxuICAgICAgICBCYXNlQ29tbXVuaWNhdG9yLmdlbmVyYXRlUmFuZG9tQmFzaXMoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNlbmRCYXNpc1RvQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5zZW5kQmFzaXNUb0NoYW5uZWwoY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWFkQmFzaXNGcm9tQ2hhbm5lbChjaGFubmVsKSB7XHJcbiAgICAgICAgQmFzZUNvbW11bmljYXRvci5yZWFkQmFzaXNGcm9tQ2hhbm5lbChjaGFubmVsKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRlY2lkZSgpIHtcclxuICAgICAgICBCYXNlQ29tbXVuaWNhdG9yLmRlY2lkZSgpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2VuZERlY2lzaW9uVG9DaGFubmVsKGNoYW5uZWwpIHtcclxuICAgICAgICBCYXNlQ29tbXVuaWNhdG9yLnNlbmREZWNpc2lvblRvQ2hhbm5lbChjaGFubmVsKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlYWREZWNpc2lvbkZyb21DaGFubmVsKGNoYW5uZWwpIHtcclxuICAgICAgICBCYXNlQ29tbXVuaWNhdG9yLnJlYWREZWNpc2lvbkZyb21DaGFubmVsKGNoYW5uZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2VuZXJhdGVSYW5kb21CaXRzOiBnZW5lcmF0ZVJhbmRvbUJpdHMsXHJcbiAgICAgICAgZ2VuZXJhdGVSYW5kb21CYXNpczogZ2VuZXJhdGVSYW5kb21CYXNpcyxcclxuICAgICAgICBjYWxjdWxhdGVQb2xhcml6YXRpb25zOiBjYWxjdWxhdGVQb2xhcml6YXRpb25zLFxyXG4gICAgICAgIHNlbmRQaG90b25zVG9DaGFubmVsOiBzZW5kUGhvdG9uc1RvQ2hhbm5lbCxcclxuICAgICAgICBzZW5kQmFzaXNUb0NoYW5uZWw6IHNlbmRCYXNpc1RvQ2hhbm5lbCxcclxuICAgICAgICByZWFkQmFzaXNGcm9tQ2hhbm5lbDogcmVhZEJhc2lzRnJvbUNoYW5uZWwsXHJcbiAgICAgICAgZ2VuZXJhdGVTaGFyZWRLZXk6IGdlbmVyYXRlU2hhcmVkS2V5LFxyXG4gICAgICAgIGRlY2lkZTogZGVjaWRlLFxyXG4gICAgICAgIHNlbmREZWNpc2lvblRvQ2hhbm5lbDogc2VuZERlY2lzaW9uVG9DaGFubmVsLFxyXG4gICAgICAgIHJlYWREZWNpc2lvbkZyb21DaGFubmVsOiByZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbFxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJleHBvcnQgdmFyIFF1YW50dW1DaGFubmVsID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgUGhvdG9ucyA9IFtdLFxyXG4gICAgICAgIEJhc2lzVXNlZCA9IFtdLFxyXG4gICAgICAgIERlY2lzaW9uID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBQaG90b25zOiBQaG90b25zLFxyXG4gICAgICAgIEJhc2lzVXNlZDogQmFzaXNVc2VkLFxyXG4gICAgICAgIERlY2lzaW9uOiBEZWNpc2lvblxyXG4gICAgfTtcclxuXHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBQaG90b25zU2l6ZSA9IDEyODsgLy8gbnVtYmVyIG9mIHBob3RvbnMgaW4gYSBwdWxzZVxyXG5leHBvcnQgY29uc3QgTWluU2hhcmVkS2V5TGVuZ3RoID0gNjQ7IC8vIG51bWJlciBvZiAnYml0cycgdG8gY29uc2lkZXIgc2VjdXJlXHJcbiIsImV4cG9ydCBjb25zdCBEaWFnb25hbCA9ICdEJztcclxuZXhwb3J0IGNvbnN0IFJlY3Rhbmd1bGFyID0gJ1InO1xyXG4iLCJleHBvcnQgY29uc3QgRGVncmVlcyA9IHtcclxuICAgIFplcm86IDAsXHJcbiAgICBOaW5ldHk6IDkwLFxyXG4gICAgRm9ydHlGaXZlOiA0NSxcclxuICAgIE9uZUh1bmRyZWRUaGlydHlGaXZlOiAxMzVcclxufTtcclxuIiwiaW1wb3J0IHtEZWdyZWVzfSBmcm9tIFwiLi4vQ29uc3RhbnRzL1BvbGFyaXphdGlvbnMuanNcIjtcclxuaW1wb3J0IHtEaWFnb25hbCwgUmVjdGFuZ3VsYXJ9IGZyb20gXCIuLi9Db25zdGFudHMvQmFzZXMuanNcIjtcclxuXHJcbmV4cG9ydCB2YXIgZ2V0UGhvdG9uID0gKCgpID0+IHtcclxuXHJcbiAgICB2YXIgUG9sYXJpemF0aW9uU3RhdGUgPSB1bmRlZmluZWQsXHJcbiAgICAgICAgQmFzaXMgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgZnVuY3Rpb24gaXNWYWxpZFN0YXRlKHN0YXRlKSB7XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBEZWdyZWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChEZWdyZWVzLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRGVncmVlc1twcm9wXSA9PT0gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBgUGhvdG9uLmpzIC0gaXNWYWxpZFN0YXRlKCkgLSBJbnZhbGlkIFN0YXRlIFByb3ZpZGVkIC0gU3RhdGU6ICR7c3RhdGV9YDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1ZhbGlkQmFzaXMoYmFzaXMpIHtcclxuICAgICAgICBpZiAoYmFzaXMgPT09IERpYWdvbmFsIHx8IGJhc2lzID09PSBSZWN0YW5ndWxhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgYFBob3Rvbi5qcyAtIGlzVmFsaWRTdGF0ZSgpIC0gSW52YWxpZCBCYXNpcyBQcm92aWRlZCAtIEJhc2lzOiAke2Jhc2lzfWA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0U3RhdGUoc3RhdGUpIHtcclxuICAgICAgICBpZiAoaXNWYWxpZFN0YXRlKHN0YXRlKSkge1xyXG4gICAgICAgICAgICBQb2xhcml6YXRpb25TdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRCYXNpcyhiYXNpcykge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkQmFzaXMoYmFzaXMpKSB7XHJcbiAgICAgICAgICAgIEJhc2lzID0gYmFzaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1lYXN1cmUoYmFzaXNUb01lYXN1cmVJbikge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkQmFzaXMoYmFzaXNUb01lYXN1cmVJbikpIHtcclxuICAgICAgICAgICAgaWYgKEJhc2lzID09PSBiYXNpc1RvTWVhc3VyZUluKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUG9sYXJpemF0aW9uU3RhdGU7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIEJhc2lzID0gYmFzaXNUb01lYXN1cmVJbjtcclxuICAgICAgICAgICAgICAgIHZhciByYW5kb21Qb2xhckJpdCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgyKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoQmFzaXMgPT09IERpYWdvbmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmRvbVBvbGFyQml0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEZWdyZWVzLkZvcnR5Rml2ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJhbmRvbVBvbGFyQml0ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEZWdyZWVzLk9uZUh1bmRyZWRUaGlydHlGaXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoQmFzaXMgPT09IFJlY3Rhbmd1bGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmRvbVBvbGFyQml0ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEZWdyZWVzLlplcm87XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyYW5kb21Qb2xhckJpdCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRGVncmVlcy5OaW5ldHk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2V0U3RhdGU6IHNldFN0YXRlLFxyXG4gICAgICAgIHNldEJhc2lzOiBzZXRCYXNpcyxcclxuICAgICAgICBtZWFzdXJlOiBtZWFzdXJlXHJcbiAgICB9XHJcbn0pO1xyXG4iLCJpbXBvcnQgKiBhcyBBcHBDb25maWcgZnJvbSBcIi4vQ29uZmlnL0FwcENvbmZpZ1wiO1xyXG5pbXBvcnQge2dldFNlbmRlcn0gZnJvbSBcIi4vQWN0b3JzL1NlbmRlci5qc1wiO1xyXG5pbXBvcnQge2dldFJlY2VpdmVyfSBmcm9tIFwiLi9BY3RvcnMvUmVjZWl2ZXIuanNcIjtcclxuaW1wb3J0IHtnZXRBdHRhY2tlcn0gZnJvbSBcIi4vQWN0b3JzL0F0dGFja2VyLmpzXCI7XHJcbmltcG9ydCB7UXVhbnR1bUNoYW5uZWx9IGZyb20gXCIuL0NoYW5uZWxzL1F1YW50dW1DaGFubmVsLmpzXCJcclxuXHJcbnZhciBTZW5kZXIgPSBnZXRTZW5kZXIoKSxcclxuICAgIFJlY2VpdmVyID0gZ2V0UmVjZWl2ZXIoKSxcclxuICAgIEF0dGFja2VyID0gZ2V0QXR0YWNrZXIoKTtcclxuXHJcblNlbmRlci5nZW5lcmF0ZVJhbmRvbUJpdHMoKTtcclxuU2VuZGVyLmdlbmVyYXRlUmFuZG9tQmFzaXMoKTtcclxuU2VuZGVyLmNhbGN1bGF0ZVBvbGFyaXphdGlvbnMoKTtcclxuU2VuZGVyLnNlbmRQaG90b25zVG9DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuXHJcbi8vQXR0YWNrZXIuaW50ZXJjZXB0UGhvdG9uc0Zyb21DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuXHJcblJlY2VpdmVyLmdlbmVyYXRlUmFuZG9tQmFzaXMoKTtcclxuUmVjZWl2ZXIubWVhc3VyZVBob3RvbnNGcm9tQ2hhbm5lbChRdWFudHVtQ2hhbm5lbCk7XHJcblxyXG5TZW5kZXIuc2VuZEJhc2lzVG9DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuLy9BdHRhY2tlci5pbnRlcmNlcHRTZW5kZXJCYXNpc0Zyb21DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuUmVjZWl2ZXIucmVhZEJhc2lzRnJvbUNoYW5uZWwoUXVhbnR1bUNoYW5uZWwpO1xyXG5cclxuUmVjZWl2ZXIuc2VuZEJhc2lzVG9DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuLy9BdHRhY2tlci5pbnRlcmNlcHRSZWNlaXZlckJhc2lzRnJvbUNoYW5uZWwoUXVhbnR1bUNoYW5uZWwpO1xyXG5TZW5kZXIucmVhZEJhc2lzRnJvbUNoYW5uZWwoUXVhbnR1bUNoYW5uZWwpO1xyXG5cclxuUmVjZWl2ZXIuZ2VuZXJhdGVTaGFyZWRLZXkoKTtcclxuU2VuZGVyLmdlbmVyYXRlU2hhcmVkS2V5KCk7XHJcblxyXG5TZW5kZXIuZGVjaWRlKCk7XHJcblJlY2VpdmVyLmRlY2lkZSgpO1xyXG5cclxuU2VuZGVyLnNlbmREZWNpc2lvblRvQ2hhbm5lbChRdWFudHVtQ2hhbm5lbCk7XHJcblJlY2VpdmVyLnJlYWREZWNpc2lvbkZyb21DaGFubmVsKFF1YW50dW1DaGFubmVsKTtcclxuXHJcblJlY2VpdmVyLnNlbmREZWNpc2lvblRvQ2hhbm5lbChRdWFudHVtQ2hhbm5lbCk7XHJcblNlbmRlci5yZWFkRGVjaXNpb25Gcm9tQ2hhbm5lbChRdWFudHVtQ2hhbm5lbCk7XHJcbiJdfQ==
