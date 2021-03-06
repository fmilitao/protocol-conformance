// Copyright (C) 2013-2015 Filipe Militao <filipe.militao@cs.cmu.edu>
// GPL v3 Licensed http://www.gnu.org/licenses/

module TypeChecker {

    // does distinction between R and S grammar kinds.
    function isProtocol(t: Type, trail?: Set<string>): boolean {
        if (t instanceof NoneType || t instanceof RelyType) {
            return true;
        }

        if (t instanceof ExistsType) {
            return isProtocol(t.inner(), trail);
        }

        if (t instanceof AlternativeType || t instanceof IntersectionType || t instanceof StarType) {
            for (const p of t.inner())
                if (!isProtocol(p, trail))
                    return false;
            return true;
        }

        if (t instanceof RecursiveType) {
            // lazy use of 'trail' since it should not be needed.
            if (trail === undefined) {
                trail = new Set<string>();
            }
            const key = t.toString(true);
            if (trail.has(key))
                return true; // assume isProtocol elsewhere
            trail.add(key);
            return isProtocol(unfold(t), trail);
        }

        return false;

    };

    // unshifts types
    function reIndex(s: Type, a: Type, b: Type): [Type, Type, Type] {
        const set: Set<number> = indexSet(s);
        indexSet(a).forEach(function(v) { set.add(v); });
        indexSet(b).forEach(function(v) { set.add(v); });

        if (set.size > 0) {
            const v = [];
            set.forEach(function(val) { v.push(val); });
            v.sort();
            // find shifting value
            for (let i = 0; i < v.length; ++i) {
                if (v[i] !== i) {
                    v[i] = i - v[i] - (i > 0 ? v[i - 1] : 0);
                } else {
                    v[i] = 0; // no shift
                }
            }
            // apply shifts
            for (let i = 0; i < v.length; ++i) {
                if (v[i] < 0) {
                    s = shift(s, i, v[i]);
                    a = shift(a, i, v[i]);
                    b = shift(b, i, v[i]);
                }
            }
        }

        return [s, a, b];
    };

    function unifyRely(id: LocationVariable|TypeVariable, step: Type, state: Type): boolean | Type {

        if (step instanceof ExistsType) {
            return unifyRely( // must shift indexes to match new depth
                <LocationVariable|TypeVariable>shift(id, 0, 1),
                step.inner(),
                shift(state, 0, 1));
        }

        if (step instanceof RelyType) {
            return unify(id, step.rely(), state);
        }

        if (step instanceof AlternativeType) {
            for (const is of step.inner()) {
                const tmp = unifyRely(id, is, state);
                // if found one unification that is valid (either empty or not)
                if (tmp !== false)
                    return tmp;
            }
            return false;
        }

        if (step instanceof IntersectionType) {
            let res: Type = null; // assuming at least one element in 'is'
            for (const is of step.inner()) {
                const tmp = unifyRely(id, is, state);
                // if one fails, they all do.
                if (tmp === false)
                    return tmp;
                if (res === null) {
                    res = <Type>tmp;
                } else {
                    if (!equals(res, <Type>tmp))
                        return false;
                }
            }
            return res;
        }

        return false;
    };

    function unifyGuarantee(id: LocationVariable|TypeVariable, step: Type, state: Type): boolean | Type {

        if (step instanceof ForallType) {
            return unifyGuarantee(
                <LocationVariable|TypeVariable>shift(id, 0, 1),
                step.inner(), shift(state, 0, 1));
        }

        if (step instanceof GuaranteeType) {
            return unify(id, step.guarantee(), state);
        }

        if (step instanceof AlternativeType) {
            for (const is of step.inner()) {
                const tmp = unifyGuarantee(id, is, state);
                // if found one unification that is valid (either empty or not)
                if (tmp !== false)
                    return tmp;
            }
            return false;
        }

        if (step instanceof IntersectionType) {
            let res: Type = null; // assuming at least one element in 'is'
            for (const is of step.inner()) {
                const tmp = unifyGuarantee(id, is, state);
                // if one fails, they all do.
                if (tmp === false)
                    return tmp;
                if (res === null) {
                    res = <Type>tmp;
                } else {
                    if (!equals(res, <Type>tmp))
                        return false;
                }
            }
            return res;
        }

        return false;
    };

    //
    // Protocol Composition
    //

    type Configuration = { s: Type, p: Type, q: Type };

    function contains(visited: Configuration[], {s: ws, p: wp, q: wq}: Configuration): boolean {
        for (const {s: vs, p: vp, q: vq } of visited) {
            // must assume that all types were normalized to have their
            // indexes compacted in order to ensure termination.
            // Therefore, we do not need to check gamma.
            // by (rs:Weakening) and by (rs:Subsumption)
            if (subtype(ws, vs) &&
                subtype(vp, wp) &&
                subtype(vq, wq))
                return true;
        }

        return false;
    };

    function Work(s: Type, p: Type, q: Type): Configuration {
        return { s: s, p: p, q: q };
    };

    function multiply(a: Configuration[][], b: Configuration[][]): Configuration[][] {
        const res = [];
        for (const aa of a) {
            for (const bb of b) {
                res.push(aa.concat(bb));
            }
        }
        return res;
    };

    function compact(a: Configuration[][], b: Configuration[][]): Configuration[][] {
        let res: Configuration[] = [];
        for (const aa of a) {
            res = res.concat(aa);
        }
        for (const bb of b) {
            res = res.concat(bb);
        }
        return [res];
    };

    export function checkComposition(g: Gamma, s: Type, p: Type, q: Type) {
        // we can ignore 'g' because of using indexes
        //debugger
        return checkCompositionAux([[Work(s, p, q)]], []);
    };

    function checkCompositionAux(work: Configuration[][], visited: Configuration[]): Configuration[] {
        if (work.length === 0)
            return visited;

        // tries each choice
        for (const choice of work) {

            let next: Configuration[][] = [];
            let v: Configuration[] = [].concat(visited);
            let failed = false;
            for (const w of choice) { // attempts all work of that choice
                const {s: s, p: p, q: q} = w;

                if (!contains(v, w)) {

                    const left = step(s, p, q, true);
                    const right = step(s, q, p, false);
                    if (left === null || right === null){
                        failed = true;
                        break; // fails this choice
                    }

                    //next = next.concat(left).concat(right);
                    next = next.concat(multiply(left, right));

                    v.push(w);
                }
            }

            if (!failed) {
                const result = checkCompositionAux(next, v);
                if (result !== null)
                    return result;
            }
        }

        // all choices failed!
        return null;
    };

    function step(s: Type, p: Type, q: Type, isLeft: boolean): Configuration[][] {

        const res = singleStep(s, p, q, isLeft);
        if (res !== null)
            return res; // valid stepping

        // else step failed, attempt breaking 's' or 'p'

        // by (rs:StateAlternative)
        if (s instanceof AlternativeType) {
            let res: Configuration[][] = [];
            // protocol must consider *all* cases
            for (const ss of s.inner()) {
                const tmp = step(ss, p, q, isLeft);
                // one failed!
                if (tmp === null) {
                    res = null; // signal fail
                    break;
                }
                res = compact(res, tmp); // merge all cases into one
            }

            if (res !== null)
                return res;
            // else intentionally fall through
        }

        // by (rs:ProtocolIntersection)
        if (p instanceof IntersectionType) {
            let res: Configuration[][] = [];
            // protocol must consider *all* cases
            for (const pp of p.inner()) {
                var tmp = step(s, pp, q, isLeft);
                // one failed!
                if (tmp === null) {
                    res = null;
                    break;
                }
                res = compact(res, tmp); // merge all cases into one
            }
            if (res !== null)
                return res;
            // else intentionally fall through
        }

        // by (rs:ProtocolAlternative)
        if (p instanceof AlternativeType) {
            let res: Configuration[][] = [];
            for (const pp of p.inner()) {
                const tmp = step(s, pp, q, isLeft);
                if (tmp !== null){
                    res = res.concat(tmp);
                }
            }
            if (res.length > 0)
                return res;

            // did not find a good step, fall through.
        }

        // by (rs:StateIntersection)
        if (s instanceof IntersectionType) {
            let res: Configuration[][] = [];
            // protocol only needs to consider *one* case,
            // but we must remember the other choices for completeness
            for (const ss of s.inner()) {
                const tmp = step(ss, p, q, isLeft);
                if (tmp !== null){
                    res = res.concat(tmp);
                }
            }
            if (res.length > 0)
                return res;

            // did not find a good step, fall through.
        }

        // expands recursion (assuming non-bottom types)
        if (s instanceof RecursiveType) {
            return step(unfold(s), p, q, isLeft);
        }
        if (p instanceof RecursiveType) {
            return step(s, unfold(p), q, isLeft);
        }

        // fails to step
        return null;
    };

    // may return null on failed stepping, or set of new configurations
    function singleStep(s: Type, p: Type, q: Type, isLeft: boolean): Configuration[][] {

        // note that this is a closure (uses 'q')
        function R(s: Type, p: Type): Configuration {
            const [_s, _p, _q] = reIndex(s, p, q);

            return isLeft ? Work(_s, _p, _q) : Work(_s, _q, _p);
        };

        // by (rs:None)
        if (p instanceof NoneType) {
            return [[R(s, p)]]; // spins, could also just return []
        }

        if (isProtocol(s)) {
            // PROTOCOL STEPPING

            // by (ps:ExistsType) and by (ps:ExistsLoc)
            if (s instanceof ExistsType && p instanceof ExistsType) {

                if (s.id().type !== p.id().type && !equals(s.bound(), p.bound()))
                    return null; // type mismatch

                // must shift index in 'q' to match depth of the opened existential
                return step(s.inner(), p.inner(), shift(q, 0, 1), isLeft);
            }

            // by (ps:ForallType) and by (ps:ForallLoc)
            if (s instanceof RelyType && (s.guarantee() instanceof ForallType) &&
                p instanceof RelyType && (p.guarantee() instanceof ForallType)) {

                // check 's' and 'p' guarantee: ( G ; R )
                const gs = <ForallType>((<RelyType>s).guarantee());
                const gp = <ForallType>((<RelyType>p).guarantee());

                if (gs.id().type !== gp.id().type || !equals(gs.bound(), gp.bound()))
                    return null;

                s = new RelyType(shift((<RelyType>s).rely(), 0, 1), gs.inner());
                p = new RelyType(shift((<RelyType>p).rely(), 0, 1), gs.inner());
                q = shift(q, 0, 1); // must match same depth as others

                return step(s, p, q, isLeft);
            }

            // by (ps:TypeApp) and by (ps:LocApp)
            if (s instanceof RelyType && (s.guarantee() instanceof ForallType) &&
                p instanceof RelyType && !(p.guarantee() instanceof ForallType)) {
                // unifies the guarantee of 's' with that of 'p'
                let b = <ForallType>s.guarantee();
                const i = b.id();
                let t = b.inner();

                // find the guarantee:
                let g = p.guarantee();
                if (g instanceof GuaranteeType) {
                    g = (<GuaranteeType>g).guarantee();
                }
                // else the next step was omitted.

                // shifts 'g' to the same depth as 't'
                const x = unifyGuarantee(i, t, shift(g, 0, 1));

                // fails to unify
                if (x === false || !subtype(<Type>x, b.bound()))
                    return null;
                // is some valid unification
                if (x !== true) {
                    t = substitution(t, i, <Type>x);
                }
                // unshift because we are opening the forall
                t = shift(t, 0, -1);

                return step(new RelyType(s.rely(), t), p, q, isLeft);
            }

            // by (ps:Step)
            if (s instanceof RelyType && p instanceof RelyType && subtype(s.rely(), p.rely())) {
                // check 's' and 'p' guarantee: ( G ; R )
                let gs = s.guarantee();
                let gp = p.guarantee();

                // account for omitted guarantees (i.e.: 'G' == 'G ; none')
                if (!(gs instanceof GuaranteeType)) {
                    gs = new GuaranteeType(gs, None);
                }
                if (!(gp instanceof GuaranteeType)) {
                    gp = new GuaranteeType(gp, None);
                }

                // guarantee state must match
                if (subtype((<GuaranteeType>gp).guarantee(), (<GuaranteeType>gs).guarantee())) {
                    return [[R((<GuaranteeType>gs).rely(), (<GuaranteeType>gp).rely())]];
                }
            }

            return null;

        } else {
            // STATE STEPPING

            // by (ss:Recovery)
            if (subtype(s, p)) {
                return [[R(None, None)]];
            }

            // by (ss:OpenType) and by (ss:OpenLoc)
            if (p instanceof ExistsType) {
                // attempts to find matching type/location to open existential
                // correctness of type bound is checked inside 'unifyExists'
                let i = p.id();
                let t = p.inner();
                // shifts 's' to the same depth as 't'
                let x = unifyRely(i, t, shift(s, 0, 1));

                // fails to unify
                if (x === false || !subtype(<Type>x, p.bound()))
                    return null;
                // is some valid unification
                if (x !== true) {
                    t = substitution(t, i, <Type>x);
                }
                // unshift because we are opening the existential
                t = shift(t, 0, -1);

                return step(s, t, q, isLeft);
            }

            // by (ss:ForallType) and by (ss:ForallLoc)
            if (p instanceof RelyType && (p.guarantee() instanceof ForallType)) {

                return step(
                    shift(s, 0, 1),
                    // opening the forall, we must ensure that all old indexes match the new depth
                    new RelyType(
                        shift(p.rely(), 0, 1),
                        (<ForallType>p.guarantee()).inner() // direct access to forall guarantee
                        ),
                    shift(q, 0, 1),
                    isLeft);
            }

            // by (ss:Step)
            if (p instanceof RelyType && subtype(s, p.rely())) {
                const b = p.guarantee();
                if (b instanceof GuaranteeType) {
                    // single step of the protocol
                    return [[R(b.guarantee(), b.rely())]];
                } else {
                    // assume case is that of omitted '; none' and that 'b' is the new state.
                    // assume that type was previously checked to be well-formed.
                    return [[R(b, None)]];
                }
            }

            return null;
        }
    };

};
