# Funcionalidade de Exportacao CSV - Agendamento de Estagio

## Descricao

A funcionalidade de exportacao CSV permite gerar um relatorio completo de todos os agendamentos de estagio em formato CSV, compativel com Excel e outras planilhas.

## Como Usar

1. Acesse a pagina **Agendamento de Estagio**
2. Clique no botao **"Exportar CSV"** na barra de acoes rapidas
3. O arquivo sera baixado automaticamente com nome: `agendamentos-estagio-YYYY-MM-DD-HH-MM-SS.csv`

## Estrutura do Arquivo CSV

O arquivo CSV gerado contem as seguintes secoes:

### 1. Cabecalho
- Titulo do relatorio
- Data e hora de geracao

### 2. Para Cada Estagio
O arquivo cria uma tabela separada para cada local de estagio contendo:

#### Informacoes do Estagio:
- **Local**: Nome do local de estagio
- **Area**: Area de atuacao
- **Horarios**: Horarios disponiveis
- **Vagas Disponiveis**: Numero total de vagas
- **Vagas Preenchidas**: Numero de alunos ja atribuidos

#### Professor Orientador:
- Nome
- Matricula
- Polo

#### Alunos no Estagio:
- Numero sequencial
- Nome
- Matricula
- Polo

### 3. Resumo Geral
- Total de estagios cadastrados
- Total de alunos cadastrados
- Total de professores cadastrados
- Total de alunos atribuidos
- Total de vagas disponiveis
- Vagas restantes
- Estagios com professor atribuido
- Estagios sem professor

## Exemplo de Estrutura

```csv
RELATORIO DE AGENDAMENTOS DE ESTAGIO
Data de Geracao: 12/10/2025 as 14:30:00

ESTAGIO 1

Local:,Hospital Municipal
Area:,Enfermagem
Horarios:,"08:00-12:00, 14:00-18:00"
Vagas Disponiveis:,3
Vagas Preenchidas:,2

Professor Orientador:
Nome,Matricula,Polo
Maria Silva,PROF001,Volta Redonda

Alunos no Estagio:
#,Nome,Matricula,Polo
1,Joao Santos,2024001,Volta Redonda
2,Ana Costa,2024002,Volta Redonda

---

ESTAGIO 2

...

RESUMO GERAL

Total de Estagios:,5
Total de Alunos Cadastrados:,50
Total de Professores Cadastrados:,10
Total de Alunos Atribuidos:,12
Total de Vagas:,15
Vagas Restantes:,3
Estagios com Professor:,4
Estagios sem Professor:,1
```

## Recursos Tecnicos

### Codificacao UTF-8 com BOM
O arquivo e gerado com BOM (Byte Order Mark) UTF-8 para garantir compatibilidade com Excel e Google Sheets, preservando caracteres especiais e acentuacao.

### Formato CSV
- Separador: virgula (`,`)
- Delimitador de texto: aspas duplas (`"`) quando necessario
- Quebra de linha: `\n`

### Tratamento de Dados
- Campos vazios exibem "N/A"
- Estagios sem atribuicoes mostram "Nenhum professor/aluno atribuido"
- Numeros e datas formatados em padrao brasileiro (pt-BR)

## Validacoes

A funcao realiza as seguintes validacoes:

1. **Verifica se ha estagios cadastrados**
   - Se nao houver, exibe aviso e nao gera o arquivo

2. **Tratamento de erros**
   - Qualquer erro durante a geracao e capturado
   - Mensagem de erro amigavel e exibida ao usuario
   - Erro detalhado e registrado no console para debug

## Mensagens do Sistema

- **Sucesso**: "CSV exportado com sucesso!"
- **Aviso**: "Nao ha estagios cadastrados para exportar."
- **Erro**: "Erro ao exportar CSV. Tente novamente."

## Compatibilidade

### Testado e Compativel com:
- Microsoft Excel 2016+
- Google Sheets
- LibreOffice Calc
- Apple Numbers

### Navegadores Suportados:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Dicas de Uso

1. **Abrir no Excel**: Basta dar duplo clique no arquivo baixado
2. **Importar no Google Sheets**: File > Import > Upload > selecione o arquivo
3. **Filtrar dados**: Use os recursos de filtro da planilha para analisar os dados
4. **Formato customizado**: Edite a funcao `handleExportarCSV()` para alterar o layout

## Manutencao e Personalizacao

### Localizar a Funcao
A funcao esta localizada em:
- **Arquivo**: `frontend/src/pages/AgendamentoEstagio.tsx`
- **Funcao**: `handleExportarCSV()`
- **Linha**: ~153

### Adicionar Novos Campos
Para adicionar novos campos ao CSV, edite a funcao e adicione novas linhas ao array `csvLines`:

```typescript
csvLines.push(`Novo Campo:,${valor}`);
```

### Alterar Formato de Data
Para alterar o formato de data/hora, modifique as chamadas de `toLocaleDateString()` e `toLocaleTimeString()`:

```typescript
// Formato atual: 12/10/2025
new Date().toLocaleDateString('pt-BR')

// Formato americano: 10/12/2025
new Date().toLocaleDateString('en-US')
```

## Resolucao de Problemas

### Problema: Caracteres especiais aparecem incorretos no Excel
**Solucao**: O arquivo ja inclui BOM UTF-8. Se o problema persistir, abra o Excel, va em Data > From Text/CSV e selecione UTF-8 manualmente.

### Problema: Arquivo nao baixa automaticamente
**Solucao**: Verifique se o navegador nao esta bloqueando downloads automaticos. Permita downloads do site nas configuracoes do navegador.

### Problema: Dados vazios no relatorio
**Solucao**: Certifique-se de que ha estagios cadastrados e que as atribuicoes foram salvas corretamente.

---

**Ultima atualizacao**: Outubro 2025
**Desenvolvido para**: Sistema Administrativo Meu Estagio
