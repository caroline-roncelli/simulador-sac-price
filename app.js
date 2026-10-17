// app.js — liga a tela (HTML) aos cálculos (calculos.js).
const $ = (id) => document.getElementById(id);
const COR_SAC = "#0e7c7b", COR_PRICE = "#4a3fb5";

// Recebe centavos e devolve "R$ 1.234,56".
const moeda = (centavos) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function card(rotulo, valor) { return `<div class="card"><span>${rotulo}</span><strong>${valor}</strong></div>`; }

function tabela(linhas) {
  const corpo = linhas.map((l) =>
    `<tr><td>${l.parcela}</td><td>${moeda(l.prestacao)}</td><td>${moeda(l.juros)}</td><td>${moeda(l.amortizacao)}</td><td>${moeda(l.saldo)}</td></tr>`).join("");
  return `<thead><tr><th>Parcela</th><th>Prestação</th><th>Juros</th><th>Amortização</th><th>Saldo devedor</th></tr></thead><tbody>${corpo}</tbody>`;
}

// Gráfico de linhas em SVG (sem bibliotecas): saldo no mês 0 até o último mês.
function grafico(sac, price) {
  const W = 640, H = 260, M = { e: 70, d: 15, t: 10, b: 30 };
  const n = sac.linhas.length, max = sac.valor;
  const x = (mes) => M.e + (mes / n) * (W - M.e - M.d);
  const y = (c) => M.t + (1 - c / max) * (H - M.t - M.b);
  const pontos = (r) => [max, ...r.linhas.map((l) => l.saldo)].map((s, mes) => `${x(mes)},${y(s)}`).join(" ");
  const grade = [0, 0.5, 1].map((f) =>
    `<line x1="${M.e}" x2="${W - M.d}" y1="${y(max * f)}" y2="${y(max * f)}" stroke="#d8e0e9"/>` +
    `<text x="${M.e - 6}" y="${y(max * f) + 4}" text-anchor="end" font-size="11" fill="#5b6b7c">${moeda(max * f)}</text>`).join("");
  return `<div class="legenda"><span><i style="background:${COR_SAC}"></i>SAC</span><span><i style="background:${COR_PRICE}"></i>Price</span></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Saldo devedor ao longo dos meses">${grade}
    <polyline points="${pontos(sac)}" fill="none" stroke="${COR_SAC}" stroke-width="2.5"/>
    <polyline points="${pontos(price)}" fill="none" stroke="${COR_PRICE}" stroke-width="2.5" stroke-dasharray="6 4"/>
    <text x="${M.e}" y="${H - 8}" font-size="11" fill="#5b6b7c">mês 0</text>
    <text x="${W - M.d}" y="${H - 8}" text-anchor="end" font-size="11" fill="#5b6b7c">mês ${n}</text></svg>`;
}

function cardsResumo(r, nomePrestacao) {
  return card(nomePrestacao, moeda(r.primeiraPrestacao)) + card("Total de juros", moeda(r.totalJuros)) + card("Total pago", moeda(r.totalPago));
}

function calcular() {
  const valor = lerNumero($("valor").value), taxa = lerNumero($("taxa").value), parcelas = lerNumero($("parcelas").value);
  const erros = validar(valor, taxa, parcelas);
  $("erros").innerHTML = erros.map((e) => `<p>${e}</p>`).join("");
  if (erros.length) { $("resultados").hidden = true; return; }

  const sac = calcularSAC(valor, taxa, parcelas), price = calcularPrice(valor, taxa, parcelas);

  $("cardsSac").innerHTML = card("Amortização por parcela", moeda(sac.linhas[0].amortizacao)) + cardsResumo(sac, "1ª prestação (a maior)")
    + card("Última prestação", moeda(sac.linhas[parcelas - 1].prestacao));
  $("cardsPrice").innerHTML = card("Prestação fixa", moeda(price.primeiraPrestacao)) + card("Total de juros", moeda(price.totalJuros)) + card("Total pago", moeda(price.totalPago));
  $("tabelaSac").innerHTML = tabela(sac.linhas);
  $("tabelaPrice").innerHTML = tabela(price.linhas);

  // Comparação: textos que respondem às perguntas do enunciado.
  const iguais = sac.primeiraPrestacao === price.primeiraPrestacao;
  const maior = sac.primeiraPrestacao > price.primeiraPrestacao ? "SAC" : "Price";
  const menor = maior === "SAC" ? "Price" : "SAC";
  const menosJuros = sac.totalJuros < price.totalJuros ? "SAC" : price.totalJuros < sac.totalJuros ? "Price" : "Empate";
  $("cardsComparacao").innerHTML =
    card("Maior parcela inicial", iguais ? "Iguais" : maior) + card("Menor parcela inicial", iguais ? "Iguais" : menor)
    + card("Menor total de juros", menosJuros)
    + card("Diferença no total pago", moeda(Math.abs(sac.totalPago - price.totalPago)))
    + card("Diferença nos juros", moeda(Math.abs(sac.totalJuros - price.totalJuros)));
  $("grafico").innerHTML = grafico(sac, price);
  $("resultados").hidden = false;
}

function limpar() {
  ["valor", "taxa", "parcelas"].forEach((id) => ($(id).value = ""));
  $("erros").innerHTML = "";
  $("resultados").hidden = true;
  $("valor").focus();
}

$("btnCalcular").addEventListener("click", calcular);
$("btnLimpar").addEventListener("click", limpar);
document.querySelectorAll("input").forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") calcular(); }));
