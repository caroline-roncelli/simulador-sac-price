// calculos.js — só matemática, sem nada de tela.
// Todos os valores são guardados em CENTAVOS (números inteiros).
// Assim o saldo nunca acumula erro de arredondamento e termina exatamente em zero.

// Converte texto digitado ("1.500,50" ou "2,5") em número.
function lerNumero(texto) {
  const t = String(texto).trim().replace(/\./g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
}

// Devolve uma lista de mensagens de erro (lista vazia = tudo certo).
function validar(valor, taxa, parcelas) {
  const erros = [];
  if (!Number.isFinite(valor) || valor <= 0) erros.push("Informe um valor financiado maior que zero.");
  if (!Number.isFinite(taxa) || taxa < 0) erros.push("Informe uma taxa de juros igual ou maior que zero.");
  if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 600)
    erros.push("A quantidade de parcelas deve ser um número inteiro entre 1 e 600.");
  return erros;
}

// SAC: amortização constante; os juros diminuem a cada mês.
function calcularSAC(valor, taxaPct, n) {
  const i = taxaPct / 100;                       // 2% -> 0,02
  let saldo = Math.round(valor * 100);
  const amortFixa = Math.round(saldo / n);
  const linhas = [];
  for (let p = 1; p <= n; p++) {
    const juros = Math.round(saldo * i);         // juros sobre o saldo ANTERIOR
    const amort = p === n ? saldo : amortFixa;   // última parcela zera o saldo
    saldo -= amort;
    linhas.push({ parcela: p, juros, amortizacao: amort, prestacao: juros + amort, saldo });
  }
  return resumir(linhas, Math.round(valor * 100));
}

// Price: prestação fixa; os juros diminuem e a amortização aumenta.
function calcularPrice(valor, taxaPct, n) {
  const i = taxaPct / 100;
  let saldo = Math.round(valor * 100);
  const pv = saldo;
  const prestacaoFixa = Math.round(i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n)));
  const linhas = [];
  for (let p = 1; p <= n; p++) {
    const juros = Math.round(saldo * i);
    const amort = p === n ? saldo : prestacaoFixa - juros;
    saldo -= amort;
    linhas.push({ parcela: p, juros, amortizacao: amort, prestacao: juros + amort, saldo });
  }
  return resumir(linhas, pv);
}

function resumir(linhas, valorCentavos) {
  const totalJuros = linhas.reduce((s, l) => s + l.juros, 0);
  return { linhas, totalJuros, totalPago: valorCentavos + totalJuros, primeiraPrestacao: linhas[0].prestacao, valor: valorCentavos };
}

if (typeof module !== "undefined") module.exports = { lerNumero, validar, calcularSAC, calcularPrice };
