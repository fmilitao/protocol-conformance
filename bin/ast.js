// Copyright (C) 2013-2015 Filipe Militao <filipe.militao@cs.cmu.edu>
// GPL v3 Licensed http://www.gnu.org/licenses/
var AST = new function () {
    var aux = function (id, ast, info) {
        ast.kind = id;
        if (info) {
            ast.line = info.first_line - 1;
            ast.col = info.first_column;
            ast.last_line = info.last_line - 1;
            ast.last_col = info.last_column;
        }
        return ast;
    };
    var Enum = function (arguments) {
        for (var i in arguments) {
            this[arguments[i]] = arguments[i];
        }
    };
    this.kinds = new Enum(['PROGRAM',
        'IMPORT',
        'TYPEDEF',
        'FUN_TYPE',
        'CAP_TYPE',
        'BANG_TYPE',
        'EXISTS_TYPE',
        'FORALL_TYPE',
        'STACKED_TYPE',
        'SUM_TYPE',
        'ALTERNATIVE_TYPE',
        'INTERSECTION_TYPE',
        'RECORD_TYPE',
        'TUPLE_TYPE',
        'TAGGED_TYPE',
        'RELY_TYPE',
        'GUARANTEE_TYPE',
        'STAR_TYPE',
        'PRIMITIVE_TYPE',
        'NONE_TYPE',
        'TOP_TYPE',
        'DEFINITION_TYPE',
        'USE',
        'FORALL',
        'PACK',
        'OPEN',
        'TYPE_APP',
        'BOOLEAN',
        'NUMBER',
        'STRING',
        'NAME_TYPE',
        'CAP_STACK',
        'REF_TYPE',
        'ID',
        'FIELD_TYPE',
        'FIELD',
        'RECORD',
        'PARAM',
        'CASE',
        'BRANCH',
        'TAGGED',
        'LET',
        'SELECT',
        'ASSIGN',
        'CALL',
        'DEREF',
        'NEW',
        'DELETE',
        'FUN',
        'SHARE',
        'SUBTYPE',
        'EQUALS',
        'FOCUS',
        'DEFOCUS',
        'TUPLE',
        'LET_TUPLE',
        'SUBSTITUTION']);
    this.makeTypedef = function (id, type, pars, info) {
        return aux(this.kinds.TYPEDEF, { id: id, type: type, pars: pars }, info);
    };
    this.makeImport = function (id, info) {
        return aux(this.kinds.IMPORT, { id: id }, info);
    };
    this.makeProgram = function (typedefs, exp, info) {
        return aux(this.kinds.PROGRAM, { typedefs: typedefs, exp: exp }, info);
    };
    this.makeSubstitution = function (type, to, from, info) {
        return aux(this.kinds.SUBSTITUTION, { type: type, to: to, from: from }, info);
    };
    this.makeLetTuple = function (ids, val, exp, info) {
        return aux(this.kinds.LET_TUPLE, { ids: ids, val: val, exp: exp }, info);
    };
    this.makeTuple = function (exp, info) {
        return aux(this.kinds.TUPLE, { exp: exp }, info);
    };
    this.makeFocus = function (ts, info) {
        return aux(this.kinds.FOCUS, { types: ts }, info);
    };
    this.makeDefocus = function (info) {
        return aux(this.kinds.DEFOCUS, {}, info);
    };
    this.makeShare = function (v, t, a, b, info) {
        return aux(this.kinds.SHARE, { value: v, type: t, a: a, b: b }, info);
    };
    this.makeSubtype = function (v, a, b, info) {
        return aux(this.kinds.SUBTYPE, { value: v, a: a, b: b }, info);
    };
    this.makeEquals = function (v, a, b, info) {
        return aux(this.kinds.EQUALS, { value: v, a: a, b: b }, info);
    };
    this.makeLet = function (id, val, exp, info) {
        return aux(this.kinds.LET, { id: id, val: val, exp: exp }, info);
    };
    this.makeSelect = function (left, right, info) {
        return aux(this.kinds.SELECT, { left: left, right: right }, info);
    };
    this.makeAssign = function (lvalue, exp, info) {
        return aux(this.kinds.ASSIGN, { lvalue: lvalue, exp: exp }, info);
    };
    this.makeCall = function (fun, arg, info) {
        return aux(this.kinds.CALL, { fun: fun, arg: arg }, info);
    };
    this.makeDeRef = function (exp, info) {
        return aux(this.kinds.DEREF, { exp: exp }, info);
    };
    this.makeNew = function (exp, info) {
        return aux(this.kinds.NEW, { exp: exp }, info);
    };
    this.makeDelete = function (exp, info) {
        return aux(this.kinds.DELETE, { exp: exp }, info);
    };
    this.makeFunction = function (rec, parms, exp, result, type_params, info) {
        return aux(this.kinds.FUN, { rec: rec, parms: parms,
            result: result,
            type_pars: type_params,
            exp: exp }, info);
    };
    this.makeID = function (id, info) {
        return aux(this.kinds.ID, { text: id }, info);
    };
    this.makeNumber = function (val, info) {
        return aux(this.kinds.NUMBER, { text: val }, info);
    };
    this.makeBoolean = function (val, info) {
        return aux(this.kinds.BOOLEAN, { text: val }, info);
    };
    this.makeString = function (val, info) {
        return aux(this.kinds.STRING, { text: val }, info);
    };
    this.makeRecord = function (exp, info) {
        return aux(this.kinds.RECORD, { exp: exp }, info);
    };
    this.makeField = function (id, exp, info) {
        return aux(this.kinds.FIELD, { id: id, exp: exp }, info);
    };
    this.makeParameters = function (id, type, info) {
        return aux(this.kinds.PARAM, { id: id, type: type }, info);
    };
    this.makeForall = function (id, exp, bound, info) {
        return aux(this.kinds.FORALL, { id: id, exp: exp, bound: bound }, info);
    };
    this.makePack = function (id, label, exp, info) {
        return aux(this.kinds.PACK, { id: id, label: label, exp: exp }, info);
    };
    this.makeOpen = function (type, id, val, exp, info) {
        return aux(this.kinds.OPEN, { type: type, id: id, val: val, exp: exp }, info);
    };
    this.makeUse = function (type, exp, info) {
        return aux(this.kinds.USE, { type: type, exp: exp }, info);
    };
    this.makeTypeApp = function (exp, type, info) {
        return aux(this.kinds.TYPE_APP, { exp: exp, id: type }, info);
    };
    this.makeCapStack = function (exp, type, info) {
        return aux(this.kinds.CAP_STACK, { exp: exp, type: type }, info);
    };
    this.makeTagged = function (tag, exp, info) {
        return aux(this.kinds.TAGGED, { tag: tag, exp: exp }, info);
    };
    this.makeBranch = function (tag, id, exp, info) {
        return aux(this.kinds.BRANCH, { tag: tag, id: id, exp: exp }, info);
    };
    this.makeCase = function (exp, branches, info) {
        return aux(this.kinds.CASE, { exp: exp, branches: branches }, info);
    };
    this.makeExistsType = function (id, type, bound, info) {
        return aux(this.kinds.EXISTS_TYPE, { id: id, bound: bound, exp: type }, info);
    };
    this.makeForallType = function (id, type, bound, info) {
        return aux(this.kinds.FORALL_TYPE, { id: id, bound: bound, exp: type }, info);
    };
    this.makeStackedType = function (left, right, info) {
        return aux(this.kinds.STACKED_TYPE, { left: left, right: right }, info);
    };
    this.makeRelyType = function (left, right, info) {
        return aux(this.kinds.RELY_TYPE, { left: left, right: right }, info);
    };
    this.makeGuaranteeType = function (left, right, info) {
        return aux(this.kinds.GUARANTEE_TYPE, { left: left, right: right }, info);
    };
    this.makeSumType = function (sums, info) {
        return aux(this.kinds.SUM_TYPE, { sums: sums }, info);
    };
    var merge = function (kind, l, r) {
        var tmp = [];
        if (l.kind === kind) {
            tmp = tmp.concat(l.types);
        }
        else
            tmp.push(l);
        if (r.kind === kind) {
            tmp = tmp.concat(r.types);
        }
        else
            tmp.push(r);
        return tmp;
    };
    this.makeStarType = function (l, r, info) {
        var types = merge(this.kinds.STAR_TYPE, l, r);
        return aux(this.kinds.STAR_TYPE, { types: types }, info);
    };
    this.makeIntersectionType = function (l, r, info) {
        var types = merge(this.kinds.INTERSECTION_TYPE, l, r);
        return aux(this.kinds.INTERSECTION_TYPE, { types: types }, info);
    };
    this.makeAlternativeType = function (l, r, info) {
        var types = merge(this.kinds.ALTERNATIVE_TYPE, l, r);
        return aux(this.kinds.ALTERNATIVE_TYPE, { types: types }, info);
    };
    this.makeFunType = function (arg, exp, info) {
        return aux(this.kinds.FUN_TYPE, { arg: arg, exp: exp }, info);
    };
    this.makeCapabilityType = function (id, type, info) {
        return aux(this.kinds.CAP_TYPE, { id: id, type: type }, info);
    };
    this.makeNameType = function (text, info) {
        return aux(this.kinds.NAME_TYPE, { text: text }, info);
    };
    this.makePrimitiveType = function (text, info) {
        return aux(this.kinds.PRIMITIVE_TYPE, { text: text }, info);
    };
    this.makeRefType = function (text, info) {
        return aux(this.kinds.REF_TYPE, { text: text }, info);
    };
    this.makeBangType = function (type, info) {
        return aux(this.kinds.BANG_TYPE, { type: type }, info);
    };
    this.makeRecordType = function (exp, info) {
        return aux(this.kinds.RECORD_TYPE, { exp: exp }, info);
    };
    this.makeFieldType = function (id, exp, info) {
        return aux(this.kinds.FIELD_TYPE, { id: id, exp: exp }, info);
    };
    this.makeTupleType = function (exp, info) {
        return aux(this.kinds.TUPLE_TYPE, { exp: exp }, info);
    };
    this.makeTaggedType = function (tag, exp, info) {
        return aux(this.kinds.TAGGED_TYPE, { tag: tag, exp: exp }, info);
    };
    this.makeNoneType = function (info) {
        return aux(this.kinds.NONE_TYPE, {}, info);
    };
    this.makeTopType = function (info) {
        return aux(this.kinds.TOP_TYPE, {}, info);
    };
    this.makeDefinitionType = function (exp, type, info) {
        return aux(this.kinds.DEFINITION_TYPE, { name: exp, args: type }, info);
    };
}();
var ErrorWrapper = function (msg, kind, ast, debug, stack) {
    this.message = msg;
    this.kind = kind;
    this.ast = ast;
    this.debug = debug;
    this.stack = stack || (new Error()).stack.toString();
    this.toString = function () {
        return this.kind + ': ' + this.message;
    };
};
var assertF = function (kind, f, msg, ast) {
    var result = undefined;
    var error = true;
    var debug = null;
    try {
        if (f instanceof Function) {
            result = f();
            error = result === undefined;
        }
        else {
            result = f;
            error = result === undefined || result === false;
        }
    }
    catch (e) {
        if (e instanceof ErrorWrapper)
            throw e;
        if (e instanceof RangeError)
            msg = e.message;
        debug = (e || e.message);
    }
    if (error)
        throw new ErrorWrapper(msg, kind, ast, debug);
    return result;
};
