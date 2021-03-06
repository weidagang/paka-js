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
        UNICODE: 'UNICODE',
        DIGIT: 'DIGIT',
        HEX_DIGIT: 'HEX_DIGIT',
        NUM: 'NUM',
        INT: 'INT',
        UINT: 'UINT',
        SYM: 'SYM',
        IN: 'IN',
        NOT_IN: 'NOT_IN',
        Q_STR: 'Q_STR',
        DQ_STR: 'DQ_STR',
        SQ_STR: 'SQ_STR',
        OR: 'OR',
        SEQ: 'SEQ',
        CONCAT: 'CONCAT',
        LIST: 'LIST',
        OPT_LIST: 'OPT_LIST',
        ENCLOSED_LIST: 'ENCLOSED_LIST',
        REPEAT: 'REPEAT',
        OPT: 'OPT',
        RULE: 'RULE',
        PERMU: 'PERMU'
    };

    var Position = (function () {
        function Position(index, line, column) {
            this.index = index;
            this.line = line;
            this.column = column;
        }
        return Position;
    })();
    paka.Position = Position;

    var ErrorInfo = (function () {
        function ErrorInfo(line, column, context) {
            this.line = line;
            this.column = column;
            this.context = context;
        }
        ErrorInfo.prototype.to_str = function () {
            return 'Error at line ' + this.line + ' column ' + this.column + ':\n' + this.context;
        };
        return ErrorInfo;
    })();
    paka.ErrorInfo = ErrorInfo;

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

        R.prototype.matched = function () {
            return paka.S.OK == this.status;
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

    function create(grammar, action) {
        _grammar = grammar;
        _action = action;

        return {
            parse: function parse(rule, src) {
                _src = src;
                _last_error = null;
                var r = $(rule)(src, 0);
                if (!r.matched()) {
                    var err_pos = last_error_pos();
                    r.error_info = new ErrorInfo(err_pos.line, err_pos.column, last_error_context());
                }
                return r;
            }
        };
    }
    paka.create = create;

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
        return _make_alias('WS', paka.P.WS, REPEAT(IN([' ', '\t', '\n', '\n'].join('')), min_len, max_len));
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

    // Alphabet: matches alphabet, exmaple: 'L'
    function ALPH() {
        return _make_alias('ALPH', paka.P.ALPH, OR(RANGE('a', 'z'), RANGE('A', 'Z')));
    }
    paka.ALPH = ALPH;

    // Unicode: matches a unicode character, exmaple: 'L'
    function UNICODE() {
        var _func = 'UNICODE';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;

            if (index < buffer.length) {
                r = R.ok(paka.P.UNICODE, index, 1, null);
            } else {
                r = R.error(paka.P.UNICODE, index, null, 'Expects a unicode character');
            }

            paka.S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.UNICODE = UNICODE;

    // Digit: matches digit, example: '1'
    function DIGIT() {
        return _make_alias('DIGIT', paka.P.DIGIT, RANGE('0', '9'));
    }
    paka.DIGIT = DIGIT;

    // Hex Digit: matches hex digit, example: 'f'
    function HEX_DIGIT() {
        return _make_alias('HEX_DIGIT', paka.P.HEX_DIGIT, OR(RANGE('0', '9'), RANGE('a', 'f'), RANGE('A', 'F')));
    }
    paka.HEX_DIGIT = HEX_DIGIT;

    // Number: matches number, example: '-123e-8'
    function NUM() {
        var _parser = SEQ(OPT('-'), OR('0', SEQ(RANGE('1', '9'), REPEAT(DIGIT()))), OPT(SEQ('.', REPEAT(DIGIT(), 1))), OPT(SEQ(OR('e', 'E'), OPT(OR('+', '-')), REPEAT(DIGIT(), 1))));

        return _make_alias('NUM', paka.P.NUM, _parser);
    }
    paka.NUM = NUM;

    // Int: matches signed integer, example: '-123'
    function INT(max_len) {
        if (typeof max_len === "undefined") { max_len = Number.MAX_VALUE; }
        return _make_alias('INT', paka.P.INT, CONCAT(OPT(OR('+', '-')), REPEAT(DIGIT(), 1, max_len)));
    }
    paka.INT = INT;

    // Unsigned Int: matches unsigned signed integer, example: '123'
    function UINT(max_len) {
        if (typeof max_len === "undefined") { max_len = Number.MAX_VALUE; }
        return _make_alias('UINT', paka.P.UINT, CONCAT(REPEAT(DIGIT(), 1, max_len)));
    }
    paka.UINT = UINT;

    // Symbol: matches a string like "function"
    function SYM(symbol) {
        var _func = 'SYM("' + symbol + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index + symbol.length <= buffer.length && index == buffer.indexOf(symbol, index)) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.SYM, index, symbol.length, null);
            } else {
                r = R.error(paka.P.SYM, index, null, 'Expects string "' + symbol + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.SYM = SYM;

    // Quoted string: matches a quoted string, example: "a b c", 'a b c'
    function Q_STR(quote) {
        if ('string' != typeof (quote) || 1 != quote.length) {
            throw 'Invalid quote for Q_STR';
        }
        var _parser = SEQ(quote, REPEAT(OR('\\' + quote, '\\\\', '\\/', '\\b', '\\f', '\\n', '\\r', '\\t', '\\u' + REPEAT(HEX_DIGIT(), 4, 4), NOT_IN(quote + '\\'))), quote);
        return _make_alias('Q_STR(' + quote + ')', paka.P.Q_STR, _parser);
    }
    paka.Q_STR = Q_STR;

    // Double quoted string: matches a double quoted string "a b 1"
    function DQ_STR() {
        return _make_alias('DQ_STR()', paka.P.DQ_STR, Q_STR('"'));
    }
    paka.DQ_STR = DQ_STR;

    // Single quoted string: matches a single quoted string 'a b 1'
    function SQ_STR() {
        return _make_alias('SQ_STR()', paka.P.SQ_STR, Q_STR("'"));
    }
    paka.SQ_STR = SQ_STR;

    // IN: matches any character in the given string
    function IN(chars) {
        var _func = 'IN("' + chars + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index < buffer.length && chars.indexOf(buffer[index]) >= 0) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.IN, index, 1, null);
            } else {
                r = R.error(paka.P.IN, index, null, 'Expects a char in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.IN = IN;

    // Not In: matches any character not in the given string
    function NOT_IN(chars) {
        var _func = 'NOT_IN("' + chars + '")';
        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            if (index < buffer.length && chars.indexOf(buffer[index]) < 0) {
                _trace(_func, depth, false, paka.S.OK);
                return R.ok(paka.P.NOT_IN, index, 1, null);
            } else {
                r = R.error(paka.P.NOT_IN, index, null, 'Expects a char not in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, paka.S.ERROR);
                return r;
            }
        };
    }
    paka.NOT_IN = NOT_IN;

    // Sequence: matches all the sub-parsers in sequence
    function SEQ() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'SEQ';
        var _parsers = [];

        for (var i = 0; i < parsers.length; ++i) {
            _parsers.push(_wrap(parsers[i]));
        }

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var idx = index;
            var children = [];

            for (var i = 0; i < _parsers.length; ++i) {
                var r = _parsers[i](buffer, idx, depth + 1);

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
        var _parsers = [];

        for (var i = 0; i < parsers.length; ++i) {
            _parsers.push(_wrap(parsers[i]));
        }

        _parsers = _insert_ws_matchers(_parsers);

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var idx = index;
            var children = [];

            for (var i = 0; i < _parsers.length; ++i) {
                var r = _parsers[i](buffer, idx, depth + 1);

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

    // List: matches a list of elements separated by a delimiter, example "a, b, c"
    function LIST(element_parser, delimiter_parser, save_delimiter) {
        if (typeof save_delimiter === "undefined") { save_delimiter = false; }
        var _func = 'LIST';
        var _parser = CONCAT(element_parser, REPEAT(CONCAT(delimiter_parser, element_parser), 0));

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);

            var r;
            var _r = _parser(buffer, index, depth);

            if (paka.S.OK == _r.status) {
                var _children = [];

                _children.push(_r.children[0]);

                for (var i = 0; i < _r.children[1].children.length; ++i) {
                    if (save_delimiter) {
                        _children.push(_r.children[1].children[i].children[0]);
                    }
                    _children.push(_r.children[1].children[i].children[1]);
                }

                r = R.ok(paka.P.LIST, index, _r.length, _children);
            } else {
                r = R.error(paka.P.LIST, index, null, 'Failed to match LIST');
            }

            paka.S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.LIST = LIST;

    // Optional List: matches a list of n elements (n >= 0), example "a, b, c"
    function OPT_LIST(element_parser, delimiter_parser, save_delimiter) {
        if (typeof save_delimiter === "undefined") { save_delimiter = false; }
        var _func = 'OPT_LIST';
        var _parser = OPT(LIST(element_parser, delimiter_parser, save_delimiter));

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);

            var r;
            var _r = _parser(buffer, index, depth);

            if (paka.S.OK == _r.status) {
                var _children = (null != _r.children && _r.children.length > 0 ? _r.children[0].children : null);
                r = R.ok(paka.P.OPT_LIST, index, _r.length, _children);
            } else {
                r = R.error(paka.P.OPT_LIST, index, null, 'Failed to match OPT_LIST');
            }

            paka.S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.OPT_LIST = OPT_LIST;

    // Enclosed List: matches a enclosed list of n elements (n >= 0), example "[ a, b, c ]"
    function ENCLOSED_LIST(left_bracket, element_parser, delimiter_parser, right_bracket, save_delimiter) {
        if (typeof save_delimiter === "undefined") { save_delimiter = false; }
        var _func = 'ENCLOSED_LIST';
        var _parser = CONCAT(left_bracket, OPT_LIST(element_parser, delimiter_parser, save_delimiter), right_bracket);

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);

            var r;
            var _r = _parser(buffer, index, depth);

            if (paka.S.OK == _r.status) {
                var _children = _r.children[1].children;
                r = R.ok(paka.P.ENCLOSED_LIST, index, _r.length, _children);
            } else {
                r = R.error(paka.P.ENCLOSED_LIST, index, null, 'Failed to match ENCLOSED_LIST');
            }

            paka.S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }
    paka.ENCLOSED_LIST = ENCLOSED_LIST;

    function OR() {
        var parsers = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            parsers[_i] = arguments[_i + 0];
        }
        var _func = 'OR';
        var _parsers = [];

        for (var i = 0; i < parsers.length; ++i) {
            _parsers.push(_wrap(parsers[i]));
        }

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            var i;
            var children = [];

            for (i = 0; i < _parsers.length; ++i) {
                var _r = _parsers[i](buffer, index, depth + 1);

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
        var _parsers = [];

        for (var i = 0; i < parsers.length; ++i) {
            _parsers.push(_wrap(parsers[i]));
        }

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);
            var r;
            var children = [];

            for (var i = 0; i < _parsers.length; ++i) {
                var _r;

                _r = _parsers[i](buffer, index, depth + 1);

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
        var _parser = _wrap(parser);

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_func, depth, true);

            var i;
            var idx = index;
            var children = [];

            while (idx < buffer.length && children.length < max_times) {
                var _r = _parser(buffer, idx, depth + 1);

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
        return _make_alias('OPT', paka.P.OPT, REPEAT(parser, 0, 1));
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

    function last_error_pos() {
        if (null == _last_error) {
            return null;
        }

        var ln = 1;
        var ln_idx = -1;

        for (var i = 0; i < _last_error.index; ++i) {
            if ('\n' == _src.charAt(i)) {
                ++ln;
                ln_idx = i;
            }
        }

        return new Position(_last_error.index, ln, _last_error.index - ln_idx);
    }
    paka.last_error_pos = last_error_pos;

    function last_error_context() {
        if (null == _last_error) {
            return null;
        }

        var err_pos = last_error_pos();
        var err_line = _src.split('\n')[err_pos.line - 1];
        var err_idx = err_pos.column - 1;

        var left = err_line.substring(err_idx - 20, err_idx);
        var right = err_line.substring(err_idx, err_idx + 20);

        var sp = '';
        for (var i = 0; i < left.length; ++i) {
            sp += ' ';
        }
        sp += '^^^';

        return left + right + '\n' + sp;
    }
    paka.last_error_context = last_error_context;

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
        return ('string' == typeof (arg)) ? SYM(arg) : arg;
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

    function _make_alias(name, operator, parser) {
        var _name = name;
        var _parser = parser;

        return function (buffer, index, depth) {
            if (typeof depth === "undefined") { depth = 0; }
            _trace(_name, depth, true);

            var r = _parser(buffer, index, depth);

            if (paka.S.OK == r.status) {
                r = R.ok(operator, r.index, r.length, r.children);
            } else {
                r = R.error(operator, index, null, null);
            }

            (paka.S.ERROR == r.status) && _update_last_error(r);
            _trace(_name, depth, false, r.status);
            return r;
        };
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
