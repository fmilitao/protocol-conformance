// Copyright (C) 2013-2015 Filipe Militao <filipe.militao@cs.cmu.edu>
// GPL v3 Licensed http://www.gnu.org/licenses/
var TypeChecker;
(function (TypeChecker) {
    TypeChecker.assert = function (msg, ast) {
        if (typeof (msg) === 'boolean' && msg)
            return;
        assertF('Type error', false, msg, ast);
    };
    TypeChecker.error = function (msg) {
        if (typeof (msg) === 'boolean' && msg)
            return;
        assertF('Bug Alert', false, msg, undefined);
    };
    TypeChecker.types = {};
    TypeChecker.fct = {};
    var newType = function (type, constructor) {
        TypeChecker.error((!TypeChecker.types.hasOwnProperty(type) && !TypeChecker.fct.hasOwnProperty(type))
            || ('@newType: already exists: ' + type));
        constructor.prototype.type = type;
        TypeChecker.types[type] = type;
        TypeChecker.fct[type] = constructor;
        return constructor;
    };
    newType('FunctionType', function FunctionType(argument, body) {
        this.argument = function () { return argument; };
        this.body = function () { return body; };
    });
    newType('BangType', function BangType(inner) {
        this.inner = function () { return inner; };
    });
    newType('SumType', function SumType() {
        var tags = {};
        this.add = function (tag, inner) {
            if (tags.hasOwnProperty(tag))
                return undefined;
            tags[tag] = inner;
            return true;
        };
        this.tags = function () {
            return Object.keys(tags);
        };
        this.inner = function (tag) {
            return tags[tag];
        };
        this.length = function () {
            return Object.keys(tags).length;
        };
    });
    var _Init = function (obj) {
        var v = [];
        obj.add = function (inner) {
            v.push(inner);
            return true;
        };
        obj.inner = function () { return v; };
    };
    newType('StarType', function StarType() {
        _Init(this);
    });
    newType('AlternativeType', function AlternativeType() {
        _Init(this);
    });
    newType('IntersectionType', function IntersectionType() {
        _Init(this);
    });
    newType('TupleType', function TupleType() {
        _Init(this);
    });
    newType('ForallType', function ForallType(id, inner, bound) {
        this.id = function () { return id; };
        this.inner = function () { return inner; };
        this.bound = function () { return bound; };
    });
    newType('ExistsType', function ExistsType(id, inner, bound) {
        this.id = function () { return id; };
        this.inner = function () { return inner; };
        this.bound = function () { return bound; };
    });
    newType('RecordType', function RecordType() {
        var fields = {};
        this.add = function (id, type) {
            if (fields.hasOwnProperty(id)) {
                return undefined;
            }
            fields[id] = type;
            return true;
        };
        this.select = function (id) {
            return fields[id];
        };
        this.isEmpty = function () {
            return Object.keys(fields).length === 0;
        };
        this.fields = function () {
            return fields;
        };
        this.length = function () {
            return Object.keys(fields).length;
        };
    });
    newType('NoneType', function NoneType() {
    });
    newType('TopType', function TopType() {
    });
    newType('ReferenceType', function ReferenceType(location) {
        this.location = function () { return location; };
    });
    newType('StackedType', function StackedType(left, right) {
        this.left = function () { return left; };
        this.right = function () { return right; };
    });
    newType('CapabilityType', function CapabilityType(loc, val) {
        this.location = function () { return loc; };
        this.value = function () { return val; };
    });
    var _Variable = function (obj, name, index, bound) {
        obj.index = function () { return index; };
        obj.name = function () { return name; };
        obj.bound = function () { return bound; };
        obj.copy = function (j) { return new obj.constructor(name, j, bound); };
    };
    newType('LocationVariable', function LocationVariable(name, index) {
        _Variable(this, name, index, null);
    });
    newType('TypeVariable', function TypeVariable(name, index, bound) {
        _Variable(this, name, index, bound);
    });
    newType('PrimitiveType', function PrimitiveType(name) {
        this.name = function () { return name; };
    });
    newType('RelyType', function RelyType(rely, guarantee) {
        this.rely = function () { return rely; };
        this.guarantee = function () { return guarantee; };
    });
    newType('GuaranteeType', function GuaranteeType(guarantee, rely) {
        this.rely = function () { return rely; };
        this.guarantee = function () { return guarantee; };
    });
    newType('DefinitionType', function DefinitionType(definition_name, arg, typedef) {
        this.definition = function () { return definition_name; };
        this.args = function () { return arg; };
        this.getDefinition = function () {
            return typedef.getDefinition(definition_name);
        };
        this.getParams = function () {
            return typedef.getType(definition_name);
        };
        this.getTypeDef = function () {
            return typedef;
        };
    });
    (function () {
        var wrap = function (t, v) {
            if (t.type === TypeChecker.types.ReferenceType ||
                t.type === TypeChecker.types.FunctionType ||
                t.type === TypeChecker.types.StackedType ||
                t.type === TypeChecker.types.StarType ||
                t.type === TypeChecker.types.AlternativeType ||
                t.type === TypeChecker.types.SumType) {
                return '(' + t.toString(v) + ')';
            }
            return t.toString(v);
        };
        var setupToString = function (type) {
            switch (type) {
                case TypeChecker.types.FunctionType:
                    return function (v) {
                        return wrap(this.argument(), v) + " -o " + wrap(this.body(), v);
                    };
                case TypeChecker.types.BangType:
                    return function (v) {
                        return "!" + wrap(this.inner(), v);
                    };
                case TypeChecker.types.RelyType:
                    return function (v) {
                        return wrap(this.rely(), v) + ' => ' + wrap(this.guarantee(), v);
                    };
                case TypeChecker.types.GuaranteeType:
                    return function (v) {
                        return wrap(this.guarantee(), v) + ' ; ' + wrap(this.rely(), v);
                    };
                case TypeChecker.types.SumType:
                    return function (v) {
                        var tags = this.tags();
                        var res = [];
                        for (var i in tags) {
                            res.push(tags[i] + '#' + wrap(this.inner(tags[i]), v));
                        }
                        return res.join('+');
                    };
                case TypeChecker.types.StarType:
                    return function (v) {
                        var inners = this.inner();
                        var res = [];
                        for (var i = 0; i < inners.length; ++i)
                            res.push(wrap(inners[i], v));
                        return res.join(' * ');
                    };
                case TypeChecker.types.AlternativeType:
                    return function (v) {
                        var inners = this.inner();
                        var res = [];
                        for (var i = 0; i < inners.length; ++i)
                            res.push(wrap(inners[i], v));
                        return res.join(' (+) ');
                    };
                case TypeChecker.types.IntersectionType:
                    return function (v) {
                        var inners = this.inner();
                        var res = [];
                        for (var i = 0; i < inners.length; ++i)
                            res.push(wrap(inners[i], v));
                        return res.join(' & ');
                    };
                case TypeChecker.types.ExistsType:
                    return function (v) {
                        return 'exists' + (v ? '' : ' ' + this.id().name())
                            + (!this.bound() ? '' : '<:' + wrap(this.bound(), v))
                            + '.' + wrap(this.inner(), v);
                    };
                case TypeChecker.types.ForallType:
                    return function (v) {
                        return 'forall' + (v ? '' : ' ' + this.id().name())
                            + (!this.bound() ? '' : '<:' + wrap(this.bound(), v))
                            + '.' + wrap(this.inner(), v);
                    };
                case TypeChecker.types.ReferenceType:
                    return function (v) {
                        return "ref " + wrap(this.location(), v);
                    };
                case TypeChecker.types.CapabilityType:
                    return function (v) {
                        return 'rw ' + wrap(this.location(), v) + ' ' + wrap(this.value(), v);
                    };
                case TypeChecker.types.StackedType:
                    return function (v) {
                        return wrap(this.left(), v) + ' :: ' + wrap(this.right(), v);
                    };
                case TypeChecker.types.RecordType:
                    return function (v) {
                        var res = [];
                        var fields = this.fields();
                        for (var i in fields)
                            res.push(i + ": " + wrap(fields[i], v));
                        return "[" + res.join() + "]";
                    };
                case TypeChecker.types.TupleType:
                    return function (v) {
                        var res = [];
                        var fields = this.inner();
                        for (var i in fields)
                            res.push(wrap(fields[i], v));
                        return "[" + res.join() + "]";
                    };
                case TypeChecker.types.DefinitionType:
                    return function (v) {
                        if (this.args().length > 0) {
                            var args = this.args();
                            var tmp = [];
                            for (var i = 0; i < args.length; ++i) {
                                tmp.push(wrap(args[i], v));
                            }
                            return wrap(this.definition(), v) + '[' + tmp.join() + ']';
                        }
                        return wrap(this.definition(), v);
                    };
                case TypeChecker.types.LocationVariable:
                case TypeChecker.types.TypeVariable:
                    return function (v) {
                        if (!v)
                            return this.name() + '^' + this.index();
                        var str = '';
                        if (this.type === TypeChecker.types.TypeVariable) {
                            var b = this.bound();
                            if (b !== null) {
                                str = '$' + b.toString(v);
                            }
                        }
                        return this.index() + str;
                    };
                case TypeChecker.types.PrimitiveType:
                    return function (v) { return this.name(); };
                case TypeChecker.types.NoneType:
                    return function (v) { return 'none'; };
                case TypeChecker.types.TopType:
                    return function (v) { return 'top'; };
                default:
                    TypeChecker.error('@setupToString: Not expecting type: ' + type);
            }
        };
        for (var i in TypeChecker.types) {
            var t = TypeChecker.types[i];
            var fun = setupToString(t);
            TypeChecker.error(!TypeChecker.fct[t].hasOwnProperty('toString') || ("Duplicated " + t));
            TypeChecker.fct[t].prototype.toString = fun;
        }
    })();
    TypeChecker.Gamma = function (typedef, parent, id, type, bound) {
        // id, type, bound are left undefined when called with:
        // new Gamma( typedef, null );
        this.getTypeDef = function () {
            return typedef;
        };
        this.newScope = function (id, type, bound) {
            return new TypeChecker.Gamma(typedef, this, id, type, bound);
        };
        this.endScope = function () {
            return parent;
        };
        this.getType = function (index) {
            if (index === 0)
                return type;
            if (parent === null || index < 0)
                return undefined;
            return parent.getType(index - 1);
        };
        this.getBound = function (index) {
            if (index === 0)
                return bound;
            if (parent === null || index < 0)
                return undefined;
            return parent.getBound(index - 1);
        };
        this.getTypeByName = function (name) {
            if (name === id)
                return type;
            if (parent === null)
                return undefined;
            return parent.getTypeByName(name);
        };
        this.getNameIndex = function (name) {
            if (id === name) {
                return 0;
            }
            if (parent === null)
                return -1;
            var tmp = parent.getNameIndex(name);
            if (tmp === -1)
                return tmp;
            return 1 + tmp;
        };
        this.forEach = function (f, i) {
            if (i === undefined)
                i = 0;
            f(i, id, type, bound);
            if (parent !== null)
                parent.forEach(f, i + 1);
        };
    };
    TypeChecker.TypeDefinition = function () {
        var typedefs;
        var typedefs_args;
        this.addType = function (name, array) {
            if (typedefs_args.hasOwnProperty(name))
                return false;
            typedefs_args[name] = array;
            return true;
        };
        this.addDefinition = function (name, definition) {
            if (typedefs.hasOwnProperty(name))
                return false;
            typedefs[name] = definition;
            return true;
        };
        this.getType = function (name) {
            return typedefs_args[name];
        };
        this.getDefinition = function (name) {
            return typedefs[name];
        };
        this.reset = function () {
            typedefs = {};
            typedefs_args = {};
        };
        this.reset();
    };
})(TypeChecker || (TypeChecker = {}));
;
