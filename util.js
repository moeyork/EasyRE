function renderENFATable(table, keys) {
    const head = ["eNFA", "ε", ...keys].join('</th><th>')
    const content = []
    for (const index in table) {
        const temp = [index]
        if(table[index][ENFA.epsilon]) {
            temp.push(printSet(table[index][ENFA.epsilon]))
        } else {
            temp.push("")
        }
        for (const key of keys) {
            if(table[index][key]) {
                temp.push(printSet(table[index][key]))
            } else {
                temp.push("")
            }
        }
        content.push(`<td>${temp.join('</td><td>')}</td>`)
    }
    return `\
    <table>
        <tr><th>${head}</th></tr>
        <tr>${content.join("</tr><tr>")}</tr>
    </table>
    `
}
const REInput = document.getElementById("re-input")
const REParser = document.getElementById("re-parser")
const ENFATable = document.getElementById("enfa-table")
const SVGENFA = document.getElementById("svg-enfa")
const SVGDFA = document.getElementById("svg-dfa")