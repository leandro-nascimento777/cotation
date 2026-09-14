# Template de Orçamento de Viagem (HTML/CSS → PDF)

Template HTML/CSS fiel ao layout de um orçamento de agência de viagem (modelo
CVC), **100% parametrizado**: nenhum texto ou valor fica fixo no HTML — tudo
vem de um JSON de dados. A logo também é substituível (upload/arquivo local
ou URL).

Tem dois templates prontos:

- **`template.html`** — o layout genérico de pacote completo (voos + hotel),
  fiel ao modelo de referência CVC. Uso standalone via `generate_pdf.py`.
- **`flight-quote.html`** — layout mais enxuto (cabeçalho + banner + cards de
  opções de voo com preço), reaproveitando as mesmas variáveis de marca e o
  mesmo cabeçalho. É a versão Jinja2/standalone do design que o app Next.js
  usa — o app tem sua própria implementação em JS puro
  (`src/lib/pdf/renderFlightQuoteHtml.ts`, renderizada via Puppeteer em vez
  de WeasyPrint, pra rodar em Vercel Functions), mas os dois consomem
  exatamente `style.css` + `flight-quote.css` como fonte única de verdade do
  design — mudar uma cor aqui muda nos dois lugares.

Os dois compartilham `style.css` e os partials de cabeçalho
(`partials/header.html`, `partials/linha_data.html`), então uma troca de cor
de marca ou de logo vale para ambos.

## Stack

- **HTML + CSS** — layout e estilo (fidelidade visual pixel-a-pixel).
- **Jinja2** — popula os templates com os dados do JSON (com `{% include %}`
  para os trechos compartilhados).
- **WeasyPrint** — renderiza o HTML+CSS final em PDF.

## Arquivos

| Arquivo                        | Papel                                                             |
| ------------------------------- | ------------------------------------------------------------------ |
| `template.html`                 | Layout de pacote completo, com placeholders `{{ variavel }}` e loops `{% for %}` |
| `flight-quote.html`             | Layout de cotação de voos (versão Jinja2 standalone do design do app) |
| `partials/header.html`          | Cabeçalho compartilhado (logo + dados da agência)                 |
| `partials/linha_data.html`      | Linha de data de emissão + número do orçamento                    |
| `style.css`                     | Estilo base, com as cores de marca em variáveis CSS (`:root`)     |
| `flight-quote.css`              | Estilo adicional específico do `flight-quote.html` (cards de voo) |
| `data_schema.json`              | Exemplo de dados já preenchido (dados do orçamento de referência) |
| `generate_pdf.py`               | Script que injeta os dados num template e exporta o PDF (`--template`) |
| `requirements.txt`              | Dependências Python (`jinja2`, `weasyprint`)                      |

## Instalação

O WeasyPrint depende de bibliotecas de sistema (Pango, cairo, gdk-pixbuf)
para renderizar texto e imagens.

**macOS:**

```bash
brew install pango gdk-pixbuf cairo
```

**Debian/Ubuntu:**

```bash
sudo apt-get install libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libcairo2
```

Depois, crie um ambiente virtual e instale as dependências Python:

```bash
cd pdf-template
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Uso

Gerar o PDF de exemplo (usa `data_schema.json`, gera `orcamento.pdf`):

```bash
python generate_pdf.py
```

Especificar outro JSON de dados e/ou nome de saída:

```bash
python generate_pdf.py --data meu_orcamento.json --output orcamento-cliente.pdf
```

Usar o template de cotação de voos (mesmo design que o app Next.js usa):

```bash
python generate_pdf.py --data meu_orcamento_voos.json --template flight-quote.html
```

## Como trocar a logo

Duas formas:

1. **Pelo JSON** — edite o campo `"logo_url"` em `data_schema.json`:
   - caminho de arquivo local: `"logo_url": "logos/minha-agencia.png"`
   - URL pública: `"logo_url": "https://minhaagencia.com/logo.png"`
   - já em base64: `"logo_url": "data:image/png;base64,...."`
   - vazio (`""`) → mostra o placeholder cinza "LOGO"

2. **Pela linha de comando** (útil para upload dinâmico — ex: um formulário
   que recebe o arquivo do usuário e chama o script na hora):

   ```bash
   python generate_pdf.py --logo /caminho/para/logo-do-usuario.png
   ```

   O script converte automaticamente o arquivo local em base64 e embute no
   PDF — não precisa se preocupar com caminho relativo.

## Como adicionar/remover voos, quartos e diárias

São listas no JSON — basta adicionar, remover ou editar itens. O template
usa `{% for %}` do Jinja2, então qualquer quantidade funciona sem tocar no
HTML:

```jsonc
"voos": [
  { "origem_cidade": "...", "destino_cidade": "...", "cia_aerea": "...", "numero_voo": "...", "data": "...", "hora_partida": "...", "hora_chegada": "..." }
  // adicione quantos objetos precisar
],
"quartos": [
  {
    "numero": 1,
    "passageiros": [
      { "tipo": "Adulto", "quantidade": 2, "valor_pessoa": "R$ 000,00", "valor_total": "R$ 000,00" }
      // pode ter mais de um tipo de passageiro por quarto (ex: Adulto + Criança)
    ],
    "subtotal_label": "Total Quarto 1",
    "subtotal_quantidade": 2,
    "subtotal_valor": "R$ 000,00"
  }
],
"diarias": [
  { "data_entrada": "...", "data_saida": "...", "diarias": 4, "categoria": "...", "quarto_numero": 1, "tipo_quarto": "...", "alimentacao": "..." }
]
```

Cada quarto pode ter múltiplos passageiros (ex: Adulto + Criança) — basta
adicionar mais objetos em `passageiros`; a linha de subtotal ("Total Quarto
N") é sempre a última do bloco e vem em negrito automaticamente.

## Como trocar as cores (reuso para outra marca/agência)

Todas as cores de marca estão centralizadas no topo de `style.css`, em
`:root`:

```css
:root {
  --cor-primaria: #1b4f8c;       /* barras de título de seção */
  --cor-destaque: #ffd400;       /* banner de agradecimento */
  --cor-destaque-texto: #3a2e00; /* texto sobre o banner */
  --cor-borda: #cccccc;          /* bordas de tabela/caixas */
}
```

Troque só essas variáveis para adaptar o template a outra identidade visual
— nenhuma outra cor está fixa no restante do CSS.

## Validade do orçamento

`data_validade` (opcional) mostra "Válido até {{ data_validade }}" logo
abaixo do número do orçamento, na mesma linha de `data_emissao` +
`numero_orcamento`. Se o campo vier vazio/ausente do JSON, essa linha some
automaticamente — não precisa remover nada do template.

## Campo de texto livre ("Informações importantes")

`informacoes_importantes` aceita texto com múltiplos parágrafos — separe os
parágrafos com uma linha em branco (`\n\n`) no JSON. O script converte
automaticamente em parágrafos HTML no PDF (filtro Jinja2 `nl2br`, com escape
de segurança contra HTML acidental vindo dos dados).

## Testando rapidamente

O `data_schema.json` já vem preenchido com os dados do orçamento de
referência (QUIOSQUE SHOPPING SUL / Rio de Janeiro), então basta rodar
`python generate_pdf.py` logo após a instalação para ver o resultado.
