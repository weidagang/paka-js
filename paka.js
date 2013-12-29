/*++++parser combinator++++*/ var paka;
(function (paka) {
    // status enum
    paka.S = { OK: 'OK', ERROR: 'ERROR' };

    // operator enum
    paka.P = {
        EOF: 'EOF',
        WS: 'WS',
        RANGE: 'RANGE',
        ALPH: 'ALPH',
        DIGIT: 'DIGIT',
        INT: 'INT',
        UINT: 'UINT',
        STR: 'STR',
        CHAR: 'CHAR',
        NCHAR: 'NCHAR',
        OR: 'OR',
        SEQ: 'SEQ',
        CONCAT: 'CONCAT',
        REPEAT: 'REPEAT',
        OPT: 'OPT',
        RULE: 'RULE',
        PERMU: 'PERMU'
    };

    // parsing result
    var R = (function () {
        function R(status, rule, operator, index, length, children, extra, err) {
            this.status = status;
            this.rule = rule;
            this.operator = operator;
            this.index = index;
            this.length = length;
            this.children = children;
            this.extra = extra;
            this.err = err;
        }
        R.prototype.text = function () {
            return 0 != this.length ? _src.substring(this.index, this.index + this.length) : null;
        };

        R.ok = function (operator, index, length, children) {
            return new R(paka.S.OK, null, operator, index, length, children, null, null);
        };

        R.error = function (operator, index, children, err) {
            return new R(paka.S.ERROR, null, operator, index, 0, children, null, err);
        };
        return R;
    })();
    paka.R = R;
    ;

    function define(grammar, action) {
        _grammar = grammar;
        _action = action;

        return {
            parse: function parse(rule, src) {
                _src = src;
                _last_error = null;
                return $(rule)(src, 0);
            }
        };
    }
    paka.define = define;

    // ======== parsers ========
    // End of source code: matches the end of source code
    function EOF(buffer, index, depth) {
        if (index >= buffer.length) {
            return R.ok(paka.P.EOF, index, 0, null);
        } else {
            var r;
            r = R.error(paka.P.EOF, index, null, "Expects EOF");

            //_update_last_error(r);
            return r;
        }
    }
    paka.EOF = EOF;

    // Whitespace: matches white spaces, example: ' ', '\t'
    function WS(min_len, max_len) {
        if (typeof min_len === "undefined") { min_len = 1; }
        if (typeof max_len === "undefined") { max_len = Number.MAX_VALUE; }
        return function (buffer, index, depth) {
            var r;
            var idx = 0;
            var len = 0;

            for (idx = index; idx < buffer.length && idx - index < max_len; ++idx) {
                var c = buffer.charAt(idx);
                if (' ' != c && '\t' != c && '\n' != c && '\r' != c) {
                    break;
                }
            }

            len = idx - index;

            if (len >= min_len && len <= max_len) {
                return R.ok(paka.P.WS, index, len, null);
            } else {
                r = R.error(paka.P.WS, index, null, "Expects white spaces");
                _update_last_error(r);
                return r;
            }
        };
    }
    paka.WS = WS;

    // Range: matches character in a range
    function RANGE(from, to) {
        if (null == from || 1 != from.length || null == to || 1 != to.length) {
            throw 'Invalid args for RANGE';
        }

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            var r;
            if (index < buffer.length && buffer.charAt(index) >= from && buffer.charAt(index) <= to) {
                return R.ok(paka.P.RANGE, index, 1, null);
            } else {
                r = R.error(paka.P.RANGE, index, null, 'Expects number in range [' + from + ', ' + to + ']');
                _update_last_error(r);
                return r;
            }
        };
    }
    paka.RANGE = RANGE;

    // Digit: matches digit, example: '1'
    function DIGIT() {
        var _func = 'DIGIT';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var parser = RANGE('0', '9');
            var r = parser(buffer, index, depth);
            r.operator = paka.P.DIGIT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.DIGIT = DIGIT;

    // Int: matches signed integer, example: '-123'
    function INT(max_len) {
        if (typeof max_len === "undefined") { max_len = 10; }
        var _func = 'INT';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var parser = CONCAT(OPT(OR('+', '-')), REPEAT(DIGIT(), 1, max_len));
            var r = parser(buffer, index, depth);
            r.operator = paka.P.INT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.INT = INT;

    // Unsigned Int: matches unsigned signed integer, example: '123'
    function UINT(max_len) {
        if (typeof max_len === "undefined") { max_len = 10; }
        var _func = 'UINT';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var parser = CONCAT(REPEAT(DIGIT(), 1, max_len));
            var r = parser(buffer, index, depth);
            r.operator = paka.P.UINT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.UINT = UINT;

    // Alphabet: matches alphabet, exmaple: 'L'
    function ALPH() {
        var _func = 'ALPH';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            var c = buffer.charAt(index);

            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.ALPH, index, 1, null);
            } else {
                r = R.error(paka.P.ALPH, index, null, 'Expects alphabet');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.ALPH = ALPH;

    // Symbol: matches a string like "function"
    function STR(symbol) {
        var _func = 'STR("' + symbol + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index + symbol.length <= buffer.length && index == buffer.indexOf(symbol, index)) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.STR, index, symbol.length, null);
            } else {
                r = R.error(paka.P.STR, index, null, 'Expects string "' + symbol + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.STR = STR;

    // Char: matches any character in the given string
    function CHAR(chars) {
        var _func = 'CHAR("' + chars + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index < buffer.length && chars.indexOf(buffer[index]) >= 0) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.CHAR, index, 1, null);
            } else {
                r = R.error(paka.P.CHAR, index, null, 'Expects a char in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.CHAR = CHAR;

    // Not Char: matches any character not in the given string
    function NCHAR(chars) {
        var _func = 'NCHAR("' + chars + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index < buffer.length && chars.indexOf(buffer[index]) < 0) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.NCHAR, index, 1, null);
            } else {
                r = R.error(paka.P.NCHAR, index, null, 'Expects a char not in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.NCHAR = NCHAR;

    // Sequence: matches all the sub-parsers in sequence
    function SEQ() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'SEQ';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var i;
            var idx;
            var children;

            idx = index;
            children = [];

            for (i = 0; i < parsers.length; ++i) {
                var r;
                var parser;

                parser = _wrap(parsers[i]);
                r = parser(buffer, idx, depth + 1);

                children.push(r);

                if (paka.S.OK == r.status) {
                    idx += r.length;
                } else {
                    r = R.error(paka.P.SEQ, idx, children, r.err);
                    _update_last_error(r);
                    _trace(_func, depth, false, paka.S.ERROR);
                    return r;
                }
            }

            _trace(_func, depth, false, paka.S.OK);
            return R.ok(paka.P.SEQ, index, idx - index, children);
        };
    }
    paka.SEQ = SEQ;

    // Sequence: matches all the sub-parsers in sequence ignore whitespaces between them
    function CONCAT() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'CONCAT';
        var _parsers = _insert_ws_matchers(parsers);

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var i;
            var idx;
            var children;

            idx = index;
            children = [];

            for (i = 0; i < _parsers.length; ++i) {
                var r;
                var parser;

                parser = _wrap(_parsers[i]);
                r = parser(buffer, idx, depth + 1);

                _log('depth=' + depth + ', i=' + i + ', op=' + r.operator, depth);

                if (paka.P.WS != r.operator) {
                    children.push(r);
                }

                if (paka.S.OK == r.status) {
                    idx += r.length;
                } else {
                    r = R.error(paka.P.CONCAT, idx, children, r.err);
                    _update_last_error(r);
                    _trace(_func, depth, false, paka.S.ERROR);
                    return r;
                }
            }

            _trace(_func, depth, false, paka.S.OK);
            return R.ok(paka.P.CONCAT, index, idx - index, children);
        };
    }
    paka.CONCAT = CONCAT;

    function OR() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'OR';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            var i;
            var children;

            children = [];

            for (i = 0; i < parsers.length; ++i) {
                var parser = _wrap(parsers[i]);
                var _r;

                _r = parser(buffer, index, depth + 1);

                if (paka.S.OK == _r.status) {
                    _trace(_func, depth, false, paka.S.OK);
                    return R.ok(paka.P.OR, index, _r.length, [_r]);
                } else {
                    children.push(_r);
                }
            }

            r = R.error(paka.P.OR, index, children, 'Failed to match OR');
            _update_last_error(r);
            _trace(_func, depth, false, paka.S.ERROR);
            return r;
        };
    }
    paka.OR = OR;

    function NOT() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'OR';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            var i;
            var children;

            children = [];

            for (i = 0; i < parsers.length; ++i) {
                var parser = _wrap(parsers[i]);
                var _r;

                _r = parser(buffer, index, depth + 1);

                if (paka.S.OK == _r.status) {
                    _trace(_func, depth, false, paka.S.OK);
                    return R.ok(paka.P.OR, index, _r.length, [_r]);
                } else {
                    children.push(_r);
                }
            }

            r = R.error(paka.P.OR, index, children, 'Failed to match OR');
            _update_last_error(r);
            _trace(_func, depth, false, paka.S.ERROR);
            return r;
        };
    }
    paka.NOT = NOT;

    function REPEAT(parser, min_times, max_times) {
        if (typeof min_times === "undefined") { min_times = 0; }
        if (typeof max_times === "undefined") { max_times = Number.MAX_VALUE; }
        var _func = 'REPEAT';

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);

            var i;
            var idx;
            var children;

            idx = index;
            children = [];

            while (idx < buffer.length && children.length < max_times) {
                var _r;

                _r = _wrap(parser)(buffer, idx, depth + 1);

                if (paka.S.OK == _r.status) {
                    idx += _r.length;
                    children.push(_r);
                } else {
                    break;
                }
            }

            if (children.length < min_times) {
                var r;
                r = R.error(paka.P.REPEAT, index, children, 'Failed to match REPEAT');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }

            _trace(_func, depth, false, paka.S.OK);
            return R.ok(paka.P.REPEAT, index, idx - index, children);
        };
    }
    paka.REPEAT = REPEAT;

    function OPT(parser) {
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            var repeat = REPEAT(parser, 0, 1);
            var r = repeat(buffer, index, depth);
            r.operator = paka.P.OPT;
            return r;
        };
    }
    paka.OPT = OPT;

    function $(rule) {
        var _func = '[' + rule + ']';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (null != _grammar && null != _grammar[rule]) {
                r = _wrap(_grammar[rule])(buffer, index, depth);
                r.rule = rule;

                // apply semantics action
                if (null != _action && null != _action[rule] && paka.S.OK == r.status) {
                    var r1 = _action[rule](r);
                    if (null != r1) {
                        r = r1;
                    }
                }

                _trace(_func, depth, false, r.status);
                return r;
            } else {
                r = new R(paka.S.ERROR, rule, null, index, 0, null, null, 'Rule ' + rule + ' not found');
                _update_last_error(r);
                _trace(_func, depth, false, r.status);
                return r;
            }
        };
    }
    paka.$ = $;

    function last_error() {
        return _last_error;
    }
    paka.last_error = last_error;

    // ======== private fields ========
    var _trace_enabled = false;
    var _debug_enabled = false;
    var _last_error;
    var _grammar;
    var _action;
    var _src;

    // ======== private methods========
    // return a parser based on the type of arg
    function _wrap(arg) {
        return ('string' == typeof (arg)) ? STR(arg) : arg;
    }

    function _insert_ws_matchers(parsers) {
        var _parsers = [];
        var _ws = WS(0);
        _parsers.push(_ws);
        for (var i = 0; i < parsers.length; ++i) {
            _parsers.push(parsers[i]);
            _parsers.push(_ws);
        }
        return _parsers;
    }

    function _update_last_error(r) {
        if (null == _last_error || r.index > _last_error.index) {
            _last_error = r;
        }
    }

    function _trace(name, depth, beginOrEnd, status) {
        if (typeof status === "undefined") { status = null; }
        if (_trace_enabled) {
            var msg = '';
            for (var i = 0; i < depth; ++i) {
                msg += '  ';
            }
            msg += beginOrEnd ? '+' : '-';
            msg += name;
            if (false == beginOrEnd && null != status) {
                msg += ' ' + status;
            }
            console.log(msg);
        }
    }

    function _log(message, depth) {
        if (typeof depth === "undefined") { depth = 0; }
        if (_debug_enabled) {
            var msg = '';
            for (var i = 0; i < depth; ++i) {
                msg += '  ';
            }
            msg += message;
            console.log(msg);
        }
    }
})(paka || (paka = {}));

module.exports = paka;
