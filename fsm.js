
function unionSet(setA, setB) {
    let _union = new Set(setA);
    for (let elem of setB) {
        _union.add(elem);
    }
    return _union;
}
function printSet(setA) {
    const temp = [...setA.values()]
    return `{ ${temp.join(', ')} }`
}
function getAlphabet(ast) {
    switch (ast[0]) {
        case 'char':
            return new Set([ast[1]])
        case 'any':
            return new Set()
        case 'plus':
            return getAlphabet(ast[1])
        case 'star':
            return getAlphabet(ast[1])
        case 'concatenation':
            return unionSet(getAlphabet(ast[1]), getAlphabet(ast[2]))
        case 'union':
            return unionSet(getAlphabet(ast[1]), getAlphabet(ast[2]))
        default:
            throw new Error('bad token')
    }
}
class ENFA {
    static epsilon = Symbol('eNFA.epsilson')
    constructor(ast) {
        this._table = []
        this._alphabet = getAlphabet(ast)
        const {startState, endState} = this.genENFA(ast)
        this.startState = startState
        this.endState = endState
    }
    genENFA(ast) {
        let startState, endState, a, b
        switch (ast[0]) {
            case 'char':
                startState = this.newState()
                endState = this.newState()
                this.addEdge(startState, ast[1], endState)
                return {
                    startState,
                    endState
                }
            case 'any':
                startState = this.newState()
                endState = this.newState()
                for (const sym of this._alphabet) {
                    this.addEdge(startState, sym, endState)
                }
                return {
                    startState,
                    endState
                }
            case 'plus':
                startState = this.newState()
                a = this.genENFA(ast[1])
                endState = this.newState()
                this.addEdge(startState, ENFA.epsilon, a.startState)
                this.addEdge(a.endState, ENFA.epsilon, a.startState)
                this.addEdge(a.endState, ENFA.epsilon, endState)
                return {
                    startState,
                    endState
                }
            case 'star':
                startState = this.newState()
                a = this.genENFA(ast[1])
                endState = this.newState()
                this.addEdge(startState, ENFA.epsilon, a.startState)
                this.addEdge(startState, ENFA.epsilon, endState)
                this.addEdge(a.endState, ENFA.epsilon, a.startState)
                this.addEdge(a.endState, ENFA.epsilon, endState)
                return {
                    startState,
                    endState
                }
            case 'concatenation':
                a = this.genENFA(ast[1])
                b = this.genENFA(ast[2])
                this.addEdge(a.endState, ENFA.epsilon, b.startState)
                return {
                    startState: a.startState,
                    endState: b.endState
                }
            case 'union':
                startState = this.newState()
                a = this.genENFA(ast[1])
                b = this.genENFA(ast[2])
                endState = this.newState()
                this.addEdge(startState, ENFA.epsilon, a.startState)
                this.addEdge(startState, ENFA.epsilon, b.startState)
                this.addEdge(a.endState, ENFA.epsilon, endState)
                this.addEdge(b.endState, ENFA.epsilon, endState)
                return {
                    startState,
                    endState
                }
            default:
                throw new Error('bad token')
        }
    }
    newState() {
        const s = {}
        this._table.push(s)
        return s
    }
    addEdge(stateA, p, stateB) {
        if(!stateA.hasOwnProperty(p)) {
            stateA[p] = new Set()
        }
        stateA[p].add(stateB)
    }
    outputTable() {
        const table = []
        for (const item of this._table) {
            const temp = {}
            const keyList = [
                ...Object.getOwnPropertyNames(item),
                ...Object.getOwnPropertySymbols(item)
            ]
            for (const key of keyList) {
                temp[key] = new Set()
                for (const dist of item[key]) {
                    temp[key].add(this._table.indexOf(dist))
                }
            }
            table.push(temp)
        }
        return table
    }
    toDot() {
        let edgeList = []
        const table = this.outputTable()
        for (const index in table) {
            const keyList = [
                ...Object.getOwnPropertyNames(table[index]),
                ...Object.getOwnPropertySymbols(table[index])
            ]
            for (const edge of keyList) {
                for (const dist of table[index][edge]) {
                    if(edge == ENFA.epsilon) {
                        edgeList.push([index, "&epsilon;", dist])
                    } else {
                        edgeList.push([index, edge, dist])
                    }
                }
            }
        }
        edgeList = edgeList.map(e => `${e[0]} -> ${e[2]} [ label = "${e[1]}" ]`)
        return `\
digraph epsilon_nfa {
    rankdir=LR;
    size="8,8"
    node [shape = doublecircle]; ${this._table.indexOf(this.endState)};
    node [shape = circle];
    {rank=min;  ${this._table.indexOf(this.startState)}}
    {rank=max;  ${this._table.indexOf(this.endState)};}

    ${edgeList.join('\n    ')}
}`
    }
}
class DFA {
    constructor(table, alphabet) {
        this.alphabet = alphabet;
        [this._table, this._oState, this._end] = this.genTable(table)
    }
    genTable(table) {
        const stateList = []
        const newTable = []
        const nfaEndState = table.length - 1
        const endStateList = []
        let initStateSet = this.findBB(new Set([0]), table)
        stateList.push(initStateSet)
        if(initStateSet.has(nfaEndState)) {
            console.log(`${printSet(initStateSet)} is a end state set`)
            endStateList.push(initStateSet)
        }
        for (let index = 0; ; index++) {
            if(index >= stateList.length) {
                break
            }
            let nowState = stateList[index]
            console.log(`now: ${printSet(nowState)}`)
            const nextList = []
            for (const c of this.alphabet.values()) {
                const newState = this.findBB(this.findNext(nowState, c, table), table)
                if(!newState.size) {
                    nextList.push(null)
                    console.log(`${printSet(nowState)} -(${c})-> null`)
                } else {
                    nextList.push(newState)
                    console.log(`${printSet(nowState)} -(${c})-> ${printSet(newState)}`)
                    if(this.isNewState(stateList, newState)) {
                        stateList.push(newState)
                        console.log(`${printSet(newState)} is a new state set`)
                        if(newState.has(nfaEndState)) {
                            console.log(`${printSet(newState)} is a end state set`)
                            endStateList.push(newState)
                        }
                    }
                }
            }
            newTable.push(nextList)
        }
        return [newTable, stateList, endStateList]
    }
    findBB(stateSet, table) {
        const temp = new Set()
        for (const i of stateSet.values()) {
            temp.add(i)
        }
        let oldSize = 0
        while (oldSize < temp.size) {
            for (const i of temp.values()) {
                if(table[i][ENFA.epsilon]) {
                    for (const k of table[i][ENFA.epsilon].values()) {
                        temp.add(k)
                    }
                }
            }
            oldSize = temp.size
        }
        return temp
    }
    findNext(stateSet, path, table) {
        const temp = new Set()
        for (const s of stateSet.values()) {
            if(table[s][path]) {
                for (const i of table[s][path].values()) {
                    temp.add(i)
                    // console.log(`${s} -(${path})-> ${i}`)
                }
            }
        }
        return temp
    }
    isNewState(stateList, state) {
        for (const a of stateList) {
            if(this.isSetEque(a, state)) {
                return false
            }
        }
        return true
    }
    isSetEque(a, b) {
        if(a.size != b.size) {
            return false
        }
        for (const s of a) {
            if(!b.has(s)) {
                return false
            }
        }
        return true
    }
    outputTable() {
        const table = this._table
        const stateList = this._oState
        return table.map(e => e.map(k => k? this.setIndexInArray(k, stateList) : null))
    }
    setIndexInArray(stateSet, array) {
        for (const i in array) {
            if(this.isSetEque(array[i], stateSet)) {
                return i
            }
        }
        return -1
    }
    toDot() {
        let edgeList = []
        let charList = [...this.alphabet.values()]
        const table = this.outputTable()
        for (const index in table) {
            for (const distI in charList) {
                if(table[index][distI]) {
                    edgeList.push([index, charList[distI], table[index][distI]])
                }
            }
        }
        edgeList = edgeList.map(e => `${e[0]} -> ${e[2]} [ label = "${e[1]}" ]`)
        return `\
digraph dfa {
    rankdir=LR;
    size="8,8"
    node [shape = doublecircle]; ${this._end.map(e => this.setIndexInArray(e, this._oState)).join(' ')};
    node [shape = circle];
    {rank=min;  0}

    ${edgeList.join('\n    ')}
}`
    }
}
