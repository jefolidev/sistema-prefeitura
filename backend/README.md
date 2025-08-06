### Fluxo

# Relatorio
  - Todo relatorio possui como principais atributos: 
    - Id do Fornecedor
    - Id do Usuario
    - Id do Departamento
  - Ao gerar um relatorio, os itens que sao selecionados geram na verdade um registro na tabela relatorio_itens

# Relatorio Itens 
  - Todo relatorio de itens possui como principais atributos:
    - Id do Relatorio
    - Id do Produto
    - Quantidade
    - Valor

# Resgatar item de um relatorio
  - 

# Relatorio com base no fornecedor:  
  - Deve exibir um PDF com o total gasto por cada fornecedor

    Fornecedor          | Total gasto
    Casa dos parafusos  | R$ 1.000,00

  - Para resgatar os fornecedores:
    - Buscar na tabela de fornecedores os fornecedores correspondente ao id em tabela de relatorios
  - Para resgatar os precos gastos por fornecedores
    - 