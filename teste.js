// Rode com:  node teste.js
const { calcularSAC, calcularPrice } = require("./calculos");
let falhas = 0;
function conferir(nome, ok) { console.log((ok ? "OK    " : "FALHOU ") + nome); if (!ok) falhas++; }
const perto = (a, b) => Math.abs(a - b) <= 2; // tolerância de 2 centavos

function testar(nome, valor, taxa, n, sacPrimeira, pricePrestacao) {
  const sac = calcularSAC(valor, taxa, n), price = calcularPrice(valor, taxa, n);
  for (const [m, r] of [["SAC", sac], ["Price", price]]) {
    conferir(`${nome} ${m}: saldo final = 0`, r.linhas[n - 1].saldo === 0);
    conferir(`${nome} ${m}: soma das amortizações = valor`, r.linhas.reduce((s, l) => s + l.amortizacao, 0) === r.valor);
    conferir(`${nome} ${m}: total pago = valor + juros`, r.totalPago === r.valor + r.totalJuros);
  }
  conferir(`${nome} SAC: 1ª parcela ≈ ${sacPrimeira}`, perto(sac.primeiraPrestacao, sacPrimeira * 100));
  conferir(`${nome} Price: prestação ≈ ${pricePrestacao}`, perto(price.primeiraPrestacao, pricePrestacao * 100));
}
testar("Teste 1", 10000, 2, 12, 1033.33, 945.60);
testar("Teste 2", 5000, 0, 10, 500, 500);
testar("Teste 3", 20000, 1.5, 24, 1133.33, 998.48);
console.log(falhas === 0 ? "\nTodos os testes passaram." : `\n${falhas} teste(s) falharam.`);
process.exit(falhas ? 1 : 0);
