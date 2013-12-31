/*++++parser combinator++++*/ 

module paka {
    // status enum
    export var S = { OK : 'OK', ERROR : 'ERROR' };

    // operator enum 
    export var P = { 
        EOF : 'EOF', // end of file
        WS : 'WS', // white space
        RANGE : 'RANGE', // range
        ALPH : 'ALPH', //alphabet
        UNICODE : 'UNICODE', //unicode
        DIGIT : 'DIGIT', // digit
        HEX_DIGIT : 'HEX_DIGIT', // hex digit
        NUM : 'NUM', // number 
        INT : 'INT', // signed integer
        UINT : 'UINT', // unsigned integer
        SYM : 'SYM', // symbol
        IN : 'IN', // char in set
        NOT_IN : 'NOT_IN', // char not in set
        Q_STR : 'Q_STR', // quoted string
        DQ_STR : 'DQ_STR', // double quoted string
        SQ_STR : 'SQ_STR', // single quoted string
        OR : 'OR', // or
        SEQ : 'SEQ', // sequence 
        CONCAT : 'CONCAT', // concatenate (ignore white spaces)
        LIST : 'LIST', // list 
        OPT_LIST : 'OPT_LIST', // list 
        ENCLOSED_LIST : 'ENCLOSED_LIST', // enclosed list
        REPEAT : 'REPEAT', // repeat
        OPT : 'OPT', // optional
        RULE : 'RULE', // rule
        PERMU : 'PERMU' // permutation
    };

    // parsing result
    export class R {
        constructor(public status: string
            , public rule: string
            , public operator: string
            , public index: number
            , public length: number
            , public children: R[]
            , public extra 
            , public err: string
            ) {
        }

        public text(): string {
            return 0 != this.length ? _src.substring(this.index, this.index + this.length) : null;
        }

        static ok(operator: string, index: number, length: number, children: R[]): R {
            return new R(S.OK
                , null
                , operator
                , index
                , length
                , children
                , null
                , null
            );
        }

        static error(operator: string, index: number, children: R[], err: string): R {
            return new R(S.ERROR
                , null
                , operator
                , index
                , 0 
                , children
                , null
                , err
            );
        }
    };
   
    export function define(grammar, action) {
        _grammar = grammar;
        _action = action;
        
        return {
            parse : function parse(rule: string, src: string) {
                _src = src;
                _last_error = null;
                return $(rule)(src, 0);
            }
        };
    }
    
    // ======== parsers ========
    // End of source code: matches the end of source code
    export function EOF(buffer: string, index: number, depth: number) {
        if (index >= buffer.length) {
            return R.ok(P.EOF, index, 0, null);
        }
        else {
            var r: R;
            r = R.error(P.EOF, index, null, "Expects EOF");
            //_update_last_error(r);
            return r;
        }
    }
    
    // Whitespace: matches white spaces, example: ' ', '\t'
    export function WS(min_len: number = 1, max_len: number = Number.MAX_VALUE) {
        return function(buffer: string, index: number, depth: number) {
            var r: R;
            var idx: number = 0;
            var len: number = 0;
            
            for (idx = index; idx < buffer.length && idx - index < max_len; ++idx) {
                var c = buffer.charAt(idx);
                if (' ' != c && '\t' != c && '\n' != c && '\r' != c) {
                    break;
                }
            }

            len = idx - index;

            if (len >= min_len && len <= max_len) {
                return R.ok(P.WS, index, len, null);    
            }
            else {
                r = R.error(P.WS, index, null, "Expects white spaces");
                _update_last_error(r);
                return r;
            }
        };
    }

    // Range: matches character in a range
    export function RANGE(from: string, to: string) {
        if (null == from || 1 != from.length || null == to || 1 != to.length) {
            throw 'Invalid args for RANGE';
        }

        return function(buffer: string, index: number, depth: number = 0) {
            var r: R;
            if (index < buffer.length && buffer.charAt(index) >= from && buffer.charAt(index) <= to) {
                return R.ok(P.RANGE, index, 1, null);
            }
            else {
                r = R.error(P.RANGE, index, null, 'Expects number in range [' + from + ', ' + to + ']');
                _update_last_error(r);
                return r;
            }
        };
    }

    // Digit: matches digit, example: '1' 
    export function DIGIT() {
        var _func = 'DIGIT';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var parser = RANGE('0', '9');
            var r = parser(buffer, index, depth);
            r.operator = P.DIGIT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Hex Digit: matches hex digit, example: 'f' 
    export function HEX_DIGIT() {
        return _make_alias('HEX_DIGIT', P.HEX_DIGIT, OR(RANGE('0', '9'), RANGE('a', 'f'), RANGE('A', 'F')));
    }

    // Number: matches number, example: '-123e-8'
    export function NUM() {
        var _parser = 
        SEQ(
            OPT('-'), 
            OR(
                '0',
                SEQ(RANGE('1','9'), REPEAT(DIGIT())) 
            ),
            OPT(SEQ('.', REPEAT(DIGIT(), 1))),
            OPT(
                SEQ(
                    OR('e', 'E'),
                    OPT(OR('+', '-')),
                    REPEAT(DIGIT(), 1)
                )
            )
        );
        
        return _make_alias('NUM', P.NUM, _parser);
    }

    // Int: matches signed integer, example: '-123'
    export function INT(max_len: number = 10) {
        var _func = 'INT';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var parser = CONCAT(OPT(OR('+', '-')), REPEAT(DIGIT(), 1, max_len));
            var r = parser(buffer, index, depth);
            r.operator = P.INT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Unsigned Int: matches unsigned signed integer, example: '123'
    export function UINT(max_len: number = 10) {
        var _func = 'UINT';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var parser = CONCAT(REPEAT(DIGIT(), 1, max_len));
            var r = parser(buffer, index, depth);
            r.operator = P.UINT;
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Alphabet: matches alphabet, exmaple: 'L'
    export function ALPH() {
        var _func = 'ALPH';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var r: R;
            var c = buffer.charAt(index);

            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
                _trace(_func, depth, false, S.OK);
                return R.ok(P.ALPH, index, 1, null);    
            }
            else {
                r = R.error(P.ALPH, index, null, 'Expects alphabet');
                _update_last_error(r);
                _trace(_func, depth, false, S.ERROR);
                return r;
            }
        };
    }

    // Unicode: matches a unicode character, exmaple: 'L'
    export function UNICODE() {
        var _func = 'UNICODE';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var r: R;

            if (index < buffer.length) {
                r = R.ok(P.UNICODE, index, 1, null);    
            }
            else {
                r = R.error(P.UNICODE, index, null, 'Expects a unicode character');
            }

            S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Symbol: matches a string like "function"
    export function SYM(symbol: string) {
        var _func = 'SYM("' + symbol + '")';
        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_func, depth, true);
            var r: R;
            if (index + symbol.length <= buffer.length && index == buffer.indexOf(symbol, index)) {
                _trace(_func, depth, false, S.OK);
                return R.ok(P.SYM, index, symbol.length, null);
            }
            else {
                r = R.error(P.SYM, index, null, 'Expects string "' + symbol + '"');
                _update_last_error(r);
                _trace(_func, depth, false, S.ERROR);
                return r;
            }
        };
    }
    
    // Quoted string: matches a quoted string, example: "a b c", 'a b c'
    export function Q_STR(quote: string) {
        if ('string' != typeof(quote) || 1 != quote.length) {
            throw 'Invalid quote for Q_STR';
        }
        var _parser = SEQ(
            quote, 
            REPEAT(OR(
                  '\\' + quote
                , '\\\\'
                , '\\/'
                , '\\b'
                , '\\f'
                , '\\n'
                , '\\r'
                , '\\t'
                , '\\u' + REPEAT(HEX_DIGIT(), 4, 4)
                , NOT_IN(quote + '\\')
            ))
            , quote
        );
        return _make_alias('Q_STR(' + quote + ')', P.Q_STR, _parser);
    }

    // Double quoted string: matches a double quoted string "a b 1"
    export function DQ_STR() {
        return _make_alias('DQ_STR()' , P.DQ_STR, Q_STR('"'));
    }

    // Single quoted string: matches a single quoted string 'a b 1'
    export function SQ_STR() {
        return _make_alias('SQ_STR()' , P.SQ_STR, Q_STR("'"));
    }

    // IN: matches any character in the given string
    export function IN(chars: string) {
        var _func = 'IN("' + chars + '")';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var r: R;
            if (index < buffer.length && chars.indexOf(buffer[index]) >= 0) {
                _trace(_func, depth, false, S.OK);
                return R.ok(P.IN, index, 1, null);
            }
            else {
                r = R.error(P.IN, index, null, 'Expects a char in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, S.ERROR);
                return r; 
            }
        };
    }

    // Not In: matches any character not in the given string
    export function NOT_IN(chars: string) {
        var _func = 'NOT_IN("' + chars + '")';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var r: R;
            if (index < buffer.length && chars.indexOf(buffer[index]) < 0) {
                _trace(_func, depth, false, S.OK);
                return R.ok(P.NOT_IN, index, 1, null);
            }
            else {
                r = R.error(P.NOT_IN, index, null, 'Expects a char not in "' + chars + '"');
                _update_last_error(r);
                _trace(_func, depth, false, S.ERROR);
                return r; 
            }
        };
    }

    // Sequence: matches all the sub-parsers in sequence 
    export function SEQ(...parsers) {
        var _func = 'SEQ';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var i: number;
            var idx: number;
            var children: R[];
            
            idx  = index;
            children = [];
            
            for (i = 0; i < parsers.length; ++i) {
                var r: R;
                var parser: Function;

                parser = _wrap(parsers[i]);
                r = parser(buffer, idx, depth + 1);
                
                children.push(r);

                if (S.OK == r.status) {
                    idx += r.length;
                }
                else {
                    r = R.error(P.SEQ, idx, children, r.err);
                    _update_last_error(r);
                    _trace(_func, depth, false, S.ERROR);
                    return r;
                }
            }

            _trace(_func, depth, false, S.OK);
            return R.ok(P.SEQ, index, idx - index, children);
        };
    }

    // Sequence: matches all the sub-parsers in sequence ignore whitespaces between them
    export function CONCAT(...parsers) {
        var _func = 'CONCAT';
        var _parsers = _insert_ws_matchers(parsers);

        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var i: number;
            var idx: number;
            var children: R[];
            
            idx  = index;
            children = [];

            for (i = 0; i < _parsers.length; ++i) {
                var r: R;
                var parser: Function;

                parser = _wrap(_parsers[i]);
                r = parser(buffer, idx, depth + 1);

                _log('depth=' + depth + ', i=' + i + ', op=' + r.operator, depth);
                
                if (P.WS != r.operator) {
                    children.push(r);
                }

                if (S.OK == r.status) {
                    idx += r.length;
                }
                else {
                    r = R.error(P.CONCAT, idx, children, r.err);
                    _update_last_error(r);
                    _trace(_func, depth, false, S.ERROR);
                    return r;
                }
            }

            _trace(_func, depth, false, S.OK);
            return R.ok(P.CONCAT, index, idx - index, children);
        };
    }

    // List: matches a list of elements separated by a delimiter, example "a, b, c" 
    export function LIST(element_parser, delimiter_parser, save_delimiter: boolean = false) {
        var _func = 'LIST';
        var _parser = CONCAT(element_parser, REPEAT(CONCAT(delimiter_parser, element_parser), 0));

        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            
            var r: R;
            var _r: R = _parser(buffer, index, depth);

            if (S.OK == _r.status) {
                var _children: R[] = [];

                _children.push(_r.children[0]);

                for (var i = 0; i < _r.children[1].children.length; ++i) {
                    if (save_delimiter) {
                        _children.push(_r.children[1].children[i].children[0]);
                    }
                    _children.push(_r.children[1].children[i].children[1]);
                }

                r = R.ok(P.LIST, index, _r.length, _children);
            }
            else {
                r = R.error(P.LIST, index, null, 'Failed to match LIST');
            }

            S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Optional List: matches a list of n elements (n >= 0), example "a, b, c"
    export function OPT_LIST(element_parser, delimiter_parser, save_delimiter: boolean = false) {
        var _func = 'OPT_LIST';
        var _parser = OPT(LIST(element_parser, delimiter_parser, save_delimiter));

        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            
            var r: R;
            var _r: R = _parser(buffer, index, depth);

            if (S.OK == _r.status) {
                var _children: R[] = (null != _r.children && _r.children.length > 0 ? _r.children[0].children : null);
                r = R.ok(P.OPT_LIST, index, _r.length, _children);
            }
            else {
                r = R.error(P.OPT_LIST, index, null, 'Failed to match OPT_LIST');
            }

            S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    // Enclosed List: matches a enclosed list of n elements (n >= 0), example "[ a, b, c ]"
    export function ENCLOSED_LIST(left_bracket, element_parser, delimiter_parser, right_bracket, save_delimiter: boolean = false) {
        var _func = 'ENCLOSED_LIST';
        var _parser = CONCAT(left_bracket, OPT_LIST(element_parser, delimiter_parser, save_delimiter), right_bracket);

        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            
            var r: R;
            var _r: R = _parser(buffer, index, depth);

            if (S.OK == _r.status) {
                var _children: R[] = _r.children[1].children;
                r = R.ok(P.ENCLOSED_LIST, index, _r.length, _children);
            }
            else {
                r = R.error(P.ENCLOSED_LIST, index, null, 'Failed to match ENCLOSED_LIST');
            }

            S.ERROR == r.status && _update_last_error(r);
            _trace(_func, depth, false, r.status);
            return r;
        };
    }

    export function OR(...parsers) {
        var _func = 'OR';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var r: R;
            var i: number;
            var children: R[];
            
            children = [];

            for (i = 0; i < parsers.length; ++i) {
                var parser = _wrap(parsers[i]);
                var _r: R;

                _r = parser(buffer, index, depth + 1);

                if (S.OK == _r.status) {
                    _trace(_func, depth, false, S.OK);
                    return R.ok(P.OR, index, _r.length, [_r]);
                }
                else {
                    children.push(_r);
                }
            }

            r = R.error(P.OR, index, children, 'Failed to match OR');
            _update_last_error(r);
            _trace(_func, depth, false, S.ERROR);
            return r;
        };
    }

    export function NOT(...parsers) {
        var _func = 'OR';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var r: R;
            var i: number;
            var children: R[];
            
            children = [];

            for (i = 0; i < parsers.length; ++i) {
                var parser = _wrap(parsers[i]);
                var _r: R;

                _r = parser(buffer, index, depth + 1);

                if (S.OK == _r.status) {
                    _trace(_func, depth, false, S.OK);
                    return R.ok(P.OR, index, _r.length, [_r]);
                }
                else {
                    children.push(_r);
                }
            }

            r = R.error(P.OR, index, children, 'Failed to match OR');
            _update_last_error(r);
            _trace(_func, depth, false, S.ERROR);
            return r;
        };
    }

    export function REPEAT(parser, min_times: number = 0, max_times: number = Number.MAX_VALUE) {
        var _func = 'REPEAT';

        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);

            var i: number;
            var idx: number;
            var children: R[];

            idx = index;
            children = [];

            while (idx < buffer.length && children.length < max_times) {
                var _r: R;

                _r = _wrap(parser)(buffer, idx, depth + 1);

                if (S.OK == _r.status) {
                    idx += _r.length;
                    children.push(_r);
                }
                else {
                    break;
                }
            }

            if (children.length < min_times)  {
                var r: R;
                r = R.error(P.REPEAT, index, children, 'Failed to match REPEAT');
                _update_last_error(r);
                _trace(_func, depth, false, S.ERROR);
                return r;
            }

            _trace(_func, depth, false, S.OK);
            return R.ok(P.REPEAT, index, idx - index, children);
        };
    }

    export function OPT(parser) {
        return _make_alias('OPT', P.OPT, REPEAT(parser, 0, 1));
    }
     
    export function $(rule: string) {
        var _func = '[' + rule + ']';
        return function(buffer: string, index: number, depth: number = 0): R {
            _trace(_func, depth, true);
            var r: R;
            if (null != _grammar && null != _grammar[rule]) {
                r = _wrap(_grammar[rule])(buffer, index, depth);
                r.rule = rule;
                
                // apply semantics action
                if (null != _action && null != _action[rule] && S.OK == r.status) {
                    var r1 = _action[rule](r);
                    if (null != r1) {
                        r = r1;
                    }
                }

                _trace(_func, depth, false, r.status);
                return r;
            }
            else {
                r = new R(S.ERROR, rule, null, index, 0, null, null, 'Rule ' + rule + ' not found');
                _update_last_error(r);
                _trace(_func, depth, false, r.status);
                return r;
            }
        }
    }

    export function last_error(): R {
        return _last_error;
    }

    // ======== private fields ======== 
    var _trace_enabled: boolean = false;
    var _debug_enabled: boolean = false;
    var _last_error: R;
    var _grammar;
    var _action;
    var _src;

    // ======== private methods======== 
    // return a parser based on the type of arg 
    function _wrap(arg) {
        return ('string' == typeof(arg)) ? SYM(arg) : arg;
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

    function _update_last_error(r: R) {
        if (null == _last_error || r.index > _last_error.index) {
            _last_error = r;
        }
    }

    function _trace(name: string, depth: number, beginOrEnd, status: string = null) {
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

    function _make_alias(name: string, operator: string, parser: Function) {
        var _name = name;
        var _parser = parser;

        return function(buffer: string, index: number, depth: number = 0) {
            _trace(_name, depth, true);

            var r: R = _parser(buffer, index, depth);

            if (S.OK == r.status) {
                r = R.ok(operator, r.index, r.length, r.children);
            }
            else {
                r = R.error(operator, index, null, null);
            }

            (S.ERROR == r.status) && _update_last_error(r);
            _trace(_name, depth, false, r.status);
            return r;
        };
    }

    function _log(message: string, depth: number = 0) {
        if (_debug_enabled) {
            var msg = '';
            for (var i = 0; i < depth; ++i) {
                msg += '  ';
            }
            msg += message;
            console.log(msg); 
        }
    }
}

export = paka; 
