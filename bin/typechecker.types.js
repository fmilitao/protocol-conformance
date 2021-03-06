// Copyright (C) 2013-2015 Filipe Militao <filipe.militao@cs.cmu.edu>
// GPL v3 Licensed http://www.gnu.org/licenses/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TypeChecker;
(function (TypeChecker) {
    function error(msg) {
        if (!(typeof (msg) === 'boolean' && msg))
            throw new ErrorWrapper(msg.toString(), 'BUG ALERT');
    }
    TypeChecker.error = error;
    ;
    TypeChecker.types = {};
    TypeChecker.fct = {};
    function unsafe_addNewType(obj) {
        var name = obj.name;
        error((!TypeChecker.types.hasOwnProperty(name) && !TypeChecker.fct.hasOwnProperty(name))
            || ('@unsafe_addNewType: already exists: ' + name));
        TypeChecker.types[name] = name;
        TypeChecker.fct[name] = obj;
        obj.prototype['type'] = name;
    }
    ;
    ;
    ;
    var BaseType = (function () {
        function BaseType() {
        }
        BaseType.prototype.match = function (cases) {
            if (!cases.hasOwnProperty(this.type))
                throw new Error('Missing: ' + this.type + ' on ' + cases.constructor.name);
            return cases[this.type](this);
        };
        return BaseType;
    })();
    ;
    var FunctionType = (function (_super) {
        __extends(FunctionType, _super);
        function FunctionType(argument, body) {
            _super.call(this);
            this.argument = function () { return argument; };
            this.body = function () { return body; };
        }
        return FunctionType;
    })(BaseType);
    TypeChecker.FunctionType = FunctionType;
    ;
    var BangType = (function (_super) {
        __extends(BangType, _super);
        function BangType(inner) {
            _super.call(this);
            this.inner = function () { return inner; };
        }
        return BangType;
    })(BaseType);
    TypeChecker.BangType = BangType;
    ;
    var SumType = (function (_super) {
        __extends(SumType, _super);
        function SumType() {
            _super.call(this);
            var tags = {};
            this.add = function (tag, inner) {
                if (tags.hasOwnProperty(tag))
                    return false;
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
        }
        return SumType;
    })(BaseType);
    TypeChecker.SumType = SumType;
    ;
    var _Aux_ = (function (_super) {
        __extends(_Aux_, _super);
        function _Aux_() {
            _super.call(this);
            var v = [];
            this.add = function (inner) {
                v.push(inner);
                return true;
            };
            this.inner = function () { return v; };
        }
        return _Aux_;
    })(BaseType);
    var StarType = (function (_super) {
        __extends(StarType, _super);
        function StarType() {
            _super.call(this);
        }
        return StarType;
    })(_Aux_);
    TypeChecker.StarType = StarType;
    ;
    var AlternativeType = (function (_super) {
        __extends(AlternativeType, _super);
        function AlternativeType() {
            _super.call(this);
        }
        return AlternativeType;
    })(_Aux_);
    TypeChecker.AlternativeType = AlternativeType;
    ;
    var IntersectionType = (function (_super) {
        __extends(IntersectionType, _super);
        function IntersectionType() {
            _super.call(this);
        }
        return IntersectionType;
    })(_Aux_);
    TypeChecker.IntersectionType = IntersectionType;
    ;
    var TupleType = (function (_super) {
        __extends(TupleType, _super);
        function TupleType() {
            _super.call(this);
        }
        return TupleType;
    })(_Aux_);
    TypeChecker.TupleType = TupleType;
    ;
    var ForallType = (function (_super) {
        __extends(ForallType, _super);
        function ForallType(id, inner, bound) {
            _super.call(this);
            this.id = function () { return id; };
            this.inner = function () { return inner; };
            this.bound = function () { return bound; };
        }
        return ForallType;
    })(BaseType);
    TypeChecker.ForallType = ForallType;
    ;
    var ExistsType = (function (_super) {
        __extends(ExistsType, _super);
        function ExistsType(id, inner, bound) {
            _super.call(this);
            this.id = function () { return id; };
            this.inner = function () { return inner; };
            this.bound = function () { return bound; };
        }
        return ExistsType;
    })(BaseType);
    TypeChecker.ExistsType = ExistsType;
    ;
    var RecordType = (function (_super) {
        __extends(RecordType, _super);
        function RecordType() {
            _super.call(this);
            var fields = {};
            this.add = function (id, type) {
                if (fields.hasOwnProperty(id)) {
                    return false;
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
        }
        return RecordType;
    })(BaseType);
    TypeChecker.RecordType = RecordType;
    ;
    var NoneType = (function (_super) {
        __extends(NoneType, _super);
        function NoneType() {
            _super.call(this);
        }
        return NoneType;
    })(BaseType);
    TypeChecker.NoneType = NoneType;
    ;
    var TopType = (function (_super) {
        __extends(TopType, _super);
        function TopType() {
            _super.call(this);
        }
        return TopType;
    })(BaseType);
    TypeChecker.TopType = TopType;
    ;
    var ReferenceType = (function (_super) {
        __extends(ReferenceType, _super);
        function ReferenceType(location) {
            _super.call(this);
            this.location = function () { return location; };
        }
        return ReferenceType;
    })(BaseType);
    TypeChecker.ReferenceType = ReferenceType;
    ;
    var StackedType = (function (_super) {
        __extends(StackedType, _super);
        function StackedType(left, right) {
            _super.call(this);
            this.left = function () { return left; };
            this.right = function () { return right; };
        }
        return StackedType;
    })(BaseType);
    TypeChecker.StackedType = StackedType;
    ;
    var CapabilityType = (function (_super) {
        __extends(CapabilityType, _super);
        function CapabilityType(loc, val) {
            _super.call(this);
            this.location = function () { return loc; };
            this.value = function () { return val; };
        }
        return CapabilityType;
    })(BaseType);
    TypeChecker.CapabilityType = CapabilityType;
    ;
    var LocationVariable = (function (_super) {
        __extends(LocationVariable, _super);
        function LocationVariable(name, index, bound) {
            _super.call(this);
            this.index = function () { return index; };
            this.name = function () { return name; };
            this.bound = function () { return bound; };
            this.copy = function (j) { return new LocationVariable(name, j, bound); };
        }
        return LocationVariable;
    })(BaseType);
    TypeChecker.LocationVariable = LocationVariable;
    ;
    var TypeVariable = (function (_super) {
        __extends(TypeVariable, _super);
        function TypeVariable(name, index, bound) {
            _super.call(this);
            this.index = function () { return index; };
            this.name = function () { return name; };
            this.bound = function () { return bound; };
            this.copy = function (j) { return new TypeVariable(name, j, bound); };
        }
        return TypeVariable;
    })(BaseType);
    TypeChecker.TypeVariable = TypeVariable;
    ;
    var PrimitiveType = (function (_super) {
        __extends(PrimitiveType, _super);
        function PrimitiveType(name) {
            _super.call(this);
            this.name = function () { return name; };
        }
        return PrimitiveType;
    })(BaseType);
    TypeChecker.PrimitiveType = PrimitiveType;
    ;
    var RelyType = (function (_super) {
        __extends(RelyType, _super);
        function RelyType(rely, guarantee) {
            _super.call(this);
            this.rely = function () { return rely; };
            this.guarantee = function () { return guarantee; };
        }
        return RelyType;
    })(BaseType);
    TypeChecker.RelyType = RelyType;
    ;
    var GuaranteeType = (function (_super) {
        __extends(GuaranteeType, _super);
        function GuaranteeType(guarantee, rely) {
            _super.call(this);
            this.rely = function () { return rely; };
            this.guarantee = function () { return guarantee; };
        }
        return GuaranteeType;
    })(BaseType);
    TypeChecker.GuaranteeType = GuaranteeType;
    ;
    var RecursiveType = (function (_super) {
        __extends(RecursiveType, _super);
        function RecursiveType(definition_name, arg, typedef) {
            _super.call(this);
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
        }
        return RecursiveType;
    })(BaseType);
    TypeChecker.RecursiveType = RecursiveType;
    ;
    unsafe_addNewType(FunctionType);
    unsafe_addNewType(BangType);
    unsafe_addNewType(SumType);
    unsafe_addNewType(StarType);
    unsafe_addNewType(AlternativeType);
    unsafe_addNewType(IntersectionType);
    unsafe_addNewType(TupleType);
    unsafe_addNewType(ForallType);
    unsafe_addNewType(ExistsType);
    unsafe_addNewType(RecordType);
    unsafe_addNewType(NoneType);
    unsafe_addNewType(TopType);
    unsafe_addNewType(ReferenceType);
    unsafe_addNewType(StackedType);
    unsafe_addNewType(CapabilityType);
    unsafe_addNewType(LocationVariable);
    unsafe_addNewType(TypeVariable);
    unsafe_addNewType(PrimitiveType);
    unsafe_addNewType(RelyType);
    unsafe_addNewType(GuaranteeType);
    unsafe_addNewType(RecursiveType);
    function wrap(t, v) {
        if (t.type === TypeChecker.types.ReferenceType ||
            t.type === TypeChecker.types.FunctionType ||
            t.type === TypeChecker.types.StackedType ||
            t.type === TypeChecker.types.StarType ||
            t.type === TypeChecker.types.AlternativeType ||
            t.type === TypeChecker.types.SumType) {
            return '(' + t.toString(v) + ')';
        }
        return t.toString(v);
    }
    ;
    function setupToString(type) {
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
            case TypeChecker.types.RecursiveType:
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
                    if (!v) {
                        return this.name() + '^' + this.index();
                    }
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
                error('@setupToString: Not expecting type: ' + type);
        }
    }
    for (var i in TypeChecker.types) {
        var t = TypeChecker.types[i];
        var fun = setupToString(t);
        error(!TypeChecker.fct[t].hasOwnProperty('toString') || ("Duplicated " + t));
        TypeChecker.fct[t].prototype.toString = fun;
    }
    function isTypeVariableName(n) {
        return n[0] === n[0].toUpperCase();
    }
    TypeChecker.isTypeVariableName = isTypeVariableName;
    ;
    var Gamma = (function () {
        function Gamma(typedef, parent, id, type, bound) {
            this.typedef = typedef;
            this.parent = parent;
            this.id = id;
            this.type = type;
            this.bound = bound;
        }
        Gamma.prototype.getTypeDef = function () {
            return this.typedef;
        };
        Gamma.prototype.newScope = function (id, type, bound) {
            return new Gamma(this.typedef, this, id, type, bound);
        };
        Gamma.prototype.endScope = function () {
            return this.parent;
        };
        Gamma.prototype.getType = function (index) {
            if (index === 0)
                return this.type;
            if (this.parent === null || index < 0)
                return undefined;
            return this.parent.getType(index - 1);
        };
        Gamma.prototype.getBound = function (index) {
            if (index === 0)
                return this.bound;
            if (this.parent === null || index < 0)
                return undefined;
            return this.parent.getBound(index - 1);
        };
        Gamma.prototype.getTypeByName = function (name) {
            if (name === this.id)
                return this.type;
            if (this.parent === null)
                return undefined;
            return this.parent.getTypeByName(name);
        };
        Gamma.prototype.getNameIndex = function (name) {
            if (this.id === name) {
                return 0;
            }
            if (this.parent === null)
                return -1;
            var tmp = this.parent.getNameIndex(name);
            if (tmp === -1)
                return tmp;
            return 1 + tmp;
        };
        Gamma.prototype.forEach = function (f, i) {
            if (i === undefined)
                i = 0;
            f(i, this.id, this.type, this.bound);
            if (this.parent !== null)
                this.parent.forEach(f, i + 1);
        };
        return Gamma;
    })();
    TypeChecker.Gamma = Gamma;
    ;
    var TypeDefinition = (function () {
        function TypeDefinition() {
            this.reset();
        }
        TypeDefinition.prototype.addType = function (name, args) {
            if (this.typedefs_args.hasOwnProperty(name))
                return false;
            this.typedefs_args[name] = args;
            return true;
        };
        TypeDefinition.prototype.addDefinition = function (name, definition) {
            if (this.typedefs.hasOwnProperty(name))
                return false;
            this.typedefs[name] = definition;
            return true;
        };
        TypeDefinition.prototype.getType = function (name) {
            return this.typedefs_args[name];
        };
        TypeDefinition.prototype.getDefinition = function (name) {
            return this.typedefs[name];
        };
        TypeDefinition.prototype.reset = function () {
            this.typedefs = {};
            this.typedefs_args = {};
        };
        return TypeDefinition;
    })();
    TypeChecker.TypeDefinition = TypeDefinition;
    ;
    TypeChecker.Unit = new BangType(new RecordType());
    TypeChecker.None = new NoneType();
    TypeChecker.Top = new TopType();
})(TypeChecker || (TypeChecker = {}));
;
//# sourceMappingURL=typechecker.types.js.map